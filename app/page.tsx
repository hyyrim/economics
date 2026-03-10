import { getDailyDigest, getDigestByDate, getTodayKST } from "@/lib/digest";
import type { KoreanDigest } from "@/lib/claude";
import Link from "next/link";

// 동적 렌더링 — searchParams 사용
export const dynamic = "force-dynamic";

function formatDateKR(dateKST: string): string {
  // dateKST: "YYYY-MM-DD"
  return new Date(dateKST + "T00:00:00+09:00").toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Seoul",
  });
}

function addDays(dateKST: string, days: number): string {
  const d = new Date(dateKST + "T00:00:00+09:00");
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const today = getTodayKST();
  const dateParam = searchParams.date;

  // YYYY-MM-DD 형식 검증
  const isValidDate = dateParam ? /^\d{4}-\d{2}-\d{2}$/.test(dateParam) : false;
  const displayDate = isValidDate && dateParam ? dateParam : today;
  const isToday = displayDate === today;
  const isFuture = displayDate > today;

  let digest: KoreanDigest | null = null;
  let error: string | null = null;

  try {
    if (isToday) {
      digest = await getDailyDigest();
    } else if (isFuture) {
      // 미래 날짜는 데이터 없음
      digest = null;
    } else {
      digest = await getDigestByDate(displayDate);
    }
  } catch (err) {
    console.error("뉴스 생성 실패:", err);
    error = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
  }

  const prevDate = addDays(displayDate, -1);
  const nextDate = addDays(displayDate, 1);
  const isNextDisabled = nextDate > today;

  return (
    <div className="space-y-8">
      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-sm">
        <Link
          href={`/?date=${prevDate}`}
          prefetch={false}
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 transition-colors"
        >
          ← {formatDateKR(prevDate)}
        </Link>

        {isToday ? (
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            오늘
          </span>
        ) : (
          <Link
            href="/"
            prefetch={false}
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            오늘로
          </Link>
        )}

        {isNextDisabled ? (
          <span className="text-sm text-slate-300 cursor-not-allowed">
            {formatDateKR(nextDate)} →
          </span>
        ) : (
          <Link
            href={`/?date=${nextDate}`}
            prefetch={false}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            {formatDateKR(nextDate)} →
          </Link>
        )}
      </div>

      {/* 날짜 헤더 */}
      <div className="text-center">
        <p className="text-sm text-slate-500">{formatDateKR(displayDate)}</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">
          {isToday ? "오늘의" : "이날의"} 글로벌 경제 요약
        </h2>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-600 font-medium">뉴스를 불러오지 못했어요</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      )}

      {!error && !digest && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-10 text-center">
          <p className="text-slate-500 font-medium">해당 날짜 뉴스가 없습니다</p>
          <p className="text-slate-400 text-sm mt-1">
            {isFuture ? "아직 발행되지 않은 날짜예요." : "이 날의 뉴스가 아카이브되지 않았어요."}
          </p>
        </div>
      )}

      {digest && (
        <>
          {/* 핵심 요약 */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-blue-600 mb-3">
              핵심 요약
            </h3>
            <p className="text-base text-slate-700 leading-relaxed">
              {digest.summary.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <mark
                    key={i}
                    className="bg-blue-100 text-blue-800 font-semibold rounded px-0.5 not-italic"
                  >
                    {part.slice(2, -2)}
                  </mark>
                ) : (
                  part
                )
              )}
            </p>
          </section>

          {/* 주요 뉴스 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              주요 뉴스 {digest.articles.length}건
            </h3>
            <div className="space-y-4">
              {digest.articles.map((article, i) => (
                <article
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 leading-snug">
                        {article.koreanTitle}
                      </h4>
                      <div className="text-sm text-slate-600 mt-2 leading-relaxed space-y-1.5">
                        {article.explanation
                          .split(/(?=①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩)/)
                          .filter(Boolean)
                          .map((sentence, j) => (
                            <p key={j}>{sentence.trim()}</p>
                          ))}
                      </div>
                      {article.originalUrl && (
                        <a
                          href={article.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-blue-600 hover:underline"
                        >
                          원문 보기 →
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 경제 학습 섹션 */}
          <section className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" role="img" aria-label="책">
                📚
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                오늘의 경제 용어 배우기
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              뉴스에 나온 어려운 경제 용어를 쉽게 설명해 드려요
            </p>
            <div className="space-y-3">
              {digest.learningSection.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 border border-blue-100"
                >
                  <p className="font-bold text-blue-700 text-sm">{item.term}</p>
                  <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
