import { fetchEconomicNews } from "@/lib/news";
import { generateKoreanDigest, type KoreanDigest } from "@/lib/claude";

// 1시간마다 페이지를 재생성 (ISR)
export const revalidate = 3600;

export default async function HomePage() {
  let digest: KoreanDigest | null = null;
  let error: string | null = null;

  try {
    const articles = await fetchEconomicNews();
    digest = await generateKoreanDigest(articles);
  } catch (err) {
    console.error("뉴스 생성 실패:", err);
    error =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
  }

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul",
  });

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-600 font-medium">뉴스를 불러오지 못했어요</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!digest) return null;

  return (
    <div className="space-y-8">
      {/* 날짜 헤더 */}
      <div className="text-center">
        <p className="text-sm text-slate-500">{today}</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">
          오늘의 글로벌 경제 요약
        </h2>
      </div>

      {/* 핵심 요약 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
          오늘의 핵심 요약
        </h3>
        <p className="text-slate-700 leading-relaxed">{digest.summary}</p>
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
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {article.explanation}
                  </p>
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
    </div>
  );
}
