import { Resend } from "resend";
import type { KoreanDigest } from "./claude";

const resend = new Resend(process.env.RESEND_API_KEY!);

function buildEmailHtml(digest: KoreanDigest, dateString: string): string {
  const articlesHtml = digest.articles
    .map(
      (a, i) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top" style="padding-right: 12px;">
                <span style="display:inline-block;width:28px;height:28px;background:#e0f2fe;color:#0369a1;border-radius:50%;text-align:center;line-height:28px;font-size:12px;font-weight:700;">${i + 1}</span>
              </td>
              <td valign="top">
                <p style="margin:0 0 6px;font-weight:700;color:#1e293b;font-size:15px;line-height:1.4;">${a.koreanTitle}</p>
                <p style="margin:0 0 6px;color:#475569;font-size:14px;line-height:1.8;">${a.explanation}</p>
                ${a.originalUrl ? `<a href="${a.originalUrl}" style="color:#0284c7;font-size:12px;text-decoration:none;">원문 보기 →</a>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  const learningHtml = digest.learningSection
    .map(
      (t) => `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
        <tr>
          <td style="padding:14px 16px;background:#ffffff;border-radius:8px;border:1px solid #bfdbfe;">
            <p style="margin:0 0 4px;font-weight:700;color:#0369a1;font-size:14px;">${t.term}</p>
            <p style="margin:0;color:#475569;font-size:13px;line-height:1.8;">${t.explanation}</p>
          </td>
        </tr>
      </table>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>오늘의 경제 뉴스</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif;word-break:keep-all;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="background:#0c4a6e;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0;color:#7dd3fc;font-size:11px;letter-spacing:0.1em;">GLOBAL ECONOMICS DIGEST</p>
              <h1 style="margin:8px 0 4px;color:#ffffff;font-size:22px;font-weight:700;">오늘의 경제 뉴스</h1>
              <p style="margin:0;color:#bae6fd;font-size:13px;">${dateString}</p>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="background:#ffffff;padding:24px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#0284c7;letter-spacing:0.08em;">오늘의 핵심 요약</p>
              <p style="margin:0;color:#334155;font-size:15px;line-height:1.9;">${digest.summary}</p>
            </td>
          </tr>

          <!-- Articles -->
          <tr>
            <td style="background:#ffffff;padding:8px 32px 24px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1e293b;">주요 뉴스 ${digest.articles.length}건</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articlesHtml}
              </table>
            </td>
          </tr>

          <!-- Learning Section -->
          <tr>
            <td style="background:#eff6ff;padding:24px 32px;border:1px solid #bfdbfe;border-top:none;">
              <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1e293b;">📚 오늘의 경제 용어 배우기</p>
              <p style="margin:0 0 16px;font-size:13px;color:#64748b;">뉴스에 나온 어려운 경제 용어를 쉽게 설명해 드려요</p>
              ${learningHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1e293b;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
                매일 오전 8시 KST 자동 발송 · 뉴스 출처: NewsAPI · 요약: Claude AI
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendDigestEmail(digest: KoreanDigest): Promise<void> {
  if (!process.env.RESEND_API_KEY)
    throw new Error("RESEND_API_KEY 환경 변수가 설정되지 않았습니다.");
  if (!process.env.FROM_EMAIL)
    throw new Error("FROM_EMAIL 환경 변수가 설정되지 않았습니다.");
  if (!process.env.RECIPIENT_EMAIL)
    throw new Error("RECIPIENT_EMAIL 환경 변수가 설정되지 않았습니다.");

  const dateString = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul",
  });

  const html = buildEmailHtml(digest, dateString);

  const { error } = await resend.emails.send({
    from: `오늘의 경제 뉴스 <${process.env.FROM_EMAIL}>`,
    to: [process.env.RECIPIENT_EMAIL],
    subject: `📈 ${dateString} 글로벌 경제 뉴스 요약`,
    html,
  });

  if (error) {
    throw new Error(`Resend 오류: ${error.message}`);
  }
}
