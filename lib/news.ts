export interface RawArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
}

export async function fetchEconomicNews(): Promise<RawArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) throw new Error("NEWS_API_KEY 환경 변수가 설정되지 않았습니다.");

  const params = new URLSearchParams({
    category: "business",
    language: "en",
    country: "us",
    pageSize: "20",
    apiKey,
  });

  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?${params.toString()}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`NewsAPI 오류 ${res.status}: ${body}`);
  }

  interface NewsAPIResponse {
    status: string;
    articles: Array<{
      title?: string;
      description?: string | null;
      url?: string;
      source?: { name?: string };
      publishedAt?: string;
    }>;
  }

  const data: NewsAPIResponse = await res.json();

  if (data.status !== "ok") {
    throw new Error(`NewsAPI 상태 오류: ${data.status}`);
  }

  return data.articles
    .filter(
      (a) =>
        a.title &&
        a.title !== "[Removed]" &&
        a.url &&
        !a.url.includes("removed")
    )
    .slice(0, 15)
    .map((a) => ({
      title: a.title ?? "",
      description: a.description ?? null,
      url: a.url ?? "",
      source: a.source?.name ?? "Unknown",
      publishedAt: a.publishedAt ?? "",
    }));
}
