import { fetchEconomicNews } from "./news";
import { generateKoreanDigest, type KoreanDigest } from "./claude";
import { createClient } from "redis";

let _redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!process.env.REDIS_URL) return null;
  if (!_redisClient) {
    _redisClient = createClient({ url: process.env.REDIS_URL });
    _redisClient.on("error", (err) => console.error("[redis] 오류:", err));
    await _redisClient.connect();
  }
  return _redisClient;
}

// 모듈 레벨 인메모리 캐시 — 같은 서버리스 인스턴스 내에서 중복 호출 방지
let _cache: { dateKST: string; digest: KoreanDigest } | null = null;

export function getTodayKST(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }); // "YYYY-MM-DD"
}

async function getDigestFromKV(dateKST: string): Promise<KoreanDigest | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;
    const data = await client.get(`digest:${dateKST}`);
    return data ? (JSON.parse(data) as KoreanDigest) : null;
  } catch (err) {
    console.error("[digest] KV 읽기 실패:", err);
    return null;
  }
}

async function saveDigestToKV(dateKST: string, digest: KoreanDigest): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    // 90일 TTL (초 단위)
    await client.set(`digest:${dateKST}`, JSON.stringify(digest), { EX: 60 * 60 * 24 * 90 });
    console.log(`[digest] KV 저장 완료: digest:${dateKST}`);
  } catch (err) {
    console.error("[digest] KV 저장 실패:", err);
  }
}

// 특정 날짜 digest 조회 (KV 우선, 없으면 null)
export async function getDigestByDate(dateKST: string): Promise<KoreanDigest | null> {
  return getDigestFromKV(dateKST);
}

// 하루 1번만 NewsAPI + Claude 호출
export async function getDailyDigest(): Promise<KoreanDigest> {
  const today = getTodayKST();

  if (_cache?.dateKST === today) {
    console.log("[digest] 캐시 히트 — API 호출 생략");
    return _cache.digest;
  }

  // KV에서 오늘 날짜 digest 확인
  const kvDigest = await getDigestFromKV(today);
  if (kvDigest) {
    console.log("[digest] KV 히트 — API 호출 생략");
    _cache = { dateKST: today, digest: kvDigest };
    return kvDigest;
  }

  console.log("[digest] 새로운 날짜 감지, NewsAPI + Claude 호출 시작...");
  const articles = await fetchEconomicNews();
  const digest = await generateKoreanDigest(articles);

  _cache = { dateKST: today, digest };
  await saveDigestToKV(today, digest);
  return digest;
}

// 크론 엔드포인트에서 호출 — Redis에 없을 때만 NewsAPI + Claude 호출
export async function refreshDailyDigest(): Promise<KoreanDigest> {
  const today = getTodayKST();

  const kvDigest = await getDigestFromKV(today);
  if (kvDigest) {
    console.log("[digest] 오늘 digest 이미 존재 — API 호출 생략");
    _cache = { dateKST: today, digest: kvDigest };
    return kvDigest;
  }

  console.log("[digest] 오늘 digest 없음 — NewsAPI + Claude 호출 시작...");
  const articles = await fetchEconomicNews();
  const digest = await generateKoreanDigest(articles);

  _cache = { dateKST: today, digest };
  await saveDigestToKV(today, digest);
  return digest;
}
