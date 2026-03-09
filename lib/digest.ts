import { unstable_cache } from "next/cache";
import { fetchEconomicNews } from "./news";
import { generateKoreanDigest, type KoreanDigest } from "./claude";

// 하루 1번만 뉴스 fetch + Claude 요약 실행 (NewsAPI & Claude API 토큰 절약)
// 크론 엔드포인트가 revalidateTag('daily-digest')를 호출하면 다음 요청 시 갱신됨
export const getDailyDigest = unstable_cache(
  async (): Promise<KoreanDigest> => {
    const articles = await fetchEconomicNews();
    return generateKoreanDigest(articles);
  },
  ["daily-digest"],
  {
    tags: ["daily-digest"],
    revalidate: 86400, // 24시간 (크론이 revalidateTag로 명시적 갱신)
  }
);
