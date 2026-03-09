import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDailyDigest } from "@/lib/digest";
import { sendDigestEmail } from "@/lib/email";

// Vercel Cron이 매일 23:00 UTC (= 오전 8시 KST)에 이 엔드포인트를 호출합니다.
// 수동 테스트: curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/send-digest

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET 환경 변수가 설정되지 않았습니다.");
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  try {
    // 기존 캐시 무효화 → 오늘자 뉴스를 새로 fetch & Claude 요약
    revalidateTag("daily-digest");

    console.log("[send-digest] 오늘의 다이제스트 생성 중...");
    const digest = await getDailyDigest();
    console.log(
      `[send-digest] 완료: 기사 ${digest.articles.length}개, 용어 ${digest.learningSection.length}개`
    );

    console.log("[send-digest] Resend로 이메일 발송 중...");
    await sendDigestEmail(digest);
    console.log("[send-digest] 이메일 발송 완료");

    return NextResponse.json({
      ok: true,
      articlesCount: digest.articles.length,
      termsCount: digest.learningSection.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[send-digest] 오류:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
