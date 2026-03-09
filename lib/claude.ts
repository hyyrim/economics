import Anthropic from "@anthropic-ai/sdk";
import type { RawArticle } from "./news";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface DigestArticle {
  koreanTitle: string;
  explanation: string;
  originalUrl: string;
}

export interface LearningTerm {
  term: string;
  explanation: string;
}

export interface KoreanDigest {
  summary: string;
  articles: DigestArticle[];
  learningSection: LearningTerm[];
}

interface ClaudeDigestResponse {
  summary: string;
  articles: Array<{
    koreanTitle: string;
    explanation: string;
    originalUrl: string;
  }>;
  learningSection: Array<{
    term: string;
    explanation: string;
  }>;
}

function getMockDigest(_rawArticles: RawArticle[]): KoreanDigest {
  return {
    summary:
      "오늘 글로벌 경제는 미국 연준의 금리 동결 결정과 중국의 경기 부양책 발표로 혼조세를 보였습니다. 미국 증시는 기술주 중심으로 소폭 상승했으나, 달러 강세로 신흥국 통화는 약세를 나타냈습니다. 국제 유가는 OPEC+의 감산 유지 결정에 따라 배럴당 85달러 선을 유지했습니다. (테스트용 mock 데이터입니다)",
    articles: [
      {
        koreanTitle: "미국 연준, 기준금리 5.25%로 동결 — 연내 인하 신호 없어",
        explanation:
          "미국 중앙은행(연준)이 이번 달에도 기준금리를 5.25%로 유지하기로 결정했습니다. 연준 의장은 물가가 아직 목표치(2%)에 도달하지 않았다며 섣불리 금리를 내리지 않겠다는 입장을 고수했습니다. 금리가 높게 유지되면 대출 이자 부담이 커지기 때문에 기업들은 투자를 줄이고, 소비자들은 집이나 자동차 구매를 미루는 경향이 생깁니다. 한국에도 영향이 있는데, 미국 금리가 높으면 달러로 돈이 몰려 원화 가치가 떨어지고 수입 물가가 오를 수 있습니다.",
        originalUrl: "https://example.com/fed-rate",
      },
      {
        koreanTitle: "중국, 1조 위안 규모 경기 부양책 발표 — 부동산·소비 살리기",
        explanation:
          "중국 정부가 침체된 경제를 살리기 위해 약 190조 원 규모의 부양책을 발표했습니다. 주요 내용은 부동산 구매 지원, 전기차 보조금 확대, 인프라 건설 투자 등입니다. 중국은 세계 2위 경제 대국으로, 중국 경제가 살아나면 한국의 반도체·철강·화학 수출도 늘어날 가능성이 높습니다. 다만 시장에서는 이 규모가 충분하지 않다는 시각도 있어 효과를 두고 의견이 엇갈립니다.",
        originalUrl: "https://example.com/china-stimulus",
      },
      {
        koreanTitle: "국제 유가 배럴당 85달러 유지 — OPEC+, 감산 6월까지 연장",
        explanation:
          "산유국 모임인 OPEC+가 하루 100만 배럴 감산을 6월까지 연장하기로 합의했습니다. 석유 공급을 줄여 유가를 높게 유지하겠다는 전략입니다. 유가가 오르면 휘발유·경유 값이 오르고, 물류비·제조원가도 함께 상승해 전반적인 물가 상승 압력으로 이어집니다. 한국은 원유를 100% 수입하기 때문에 유가 상승은 무역수지와 물가에 직접적인 영향을 줍니다.",
        originalUrl: "https://example.com/opec-cut",
      },
      {
        koreanTitle: "미국 실업률 3.9%로 소폭 상승 — 노동시장 냉각 신호",
        explanation:
          "미국의 실업률이 지난달 3.7%에서 3.9%로 올랐습니다. 신규 일자리 증가 폭도 예상치를 밑돌았습니다. 이는 연준의 고금리 정책이 서서히 경제를 식히고 있다는 신호로 해석됩니다. 노동시장이 약해지면 소비자들이 지갑을 닫게 되고, 이는 기업 실적 하락으로 이어질 수 있습니다. 반면 연준이 금리를 내릴 명분이 생긴다는 점에서 증시에는 긍정적으로 작용하기도 합니다.",
        originalUrl: "https://example.com/us-jobs",
      },
      {
        koreanTitle: "엔비디아 시가총액 2조 달러 돌파 — AI 반도체 수요 급증",
        explanation:
          "AI 반도체 1위 기업 엔비디아의 시가총액이 2조 달러(약 2,700조 원)를 넘어서며 애플·마이크로소프트와 어깨를 나란히 했습니다. AI 서비스 확산으로 GPU(그래픽처리장치) 수요가 폭발적으로 늘어난 덕분입니다. 이는 삼성전자·SK하이닉스 등 한국 메모리 반도체 기업에도 긍정적인데, AI 서버에는 고성능 메모리(HBM)가 대량으로 필요하기 때문입니다.",
        originalUrl: "https://example.com/nvidia",
      },
    ],
    learningSection: [
      {
        term: "기준금리 (Base Rate)",
        explanation:
          "중앙은행이 시중 은행에 돈을 빌려줄 때 적용하는 이자율이에요. 이 금리가 오르면 은행들도 우리에게 대출 이자를 더 많이 받고, 내리면 덜 받아요. 경제가 과열되면 금리를 올려 식히고, 침체되면 내려 활성화시키는 도구로 사용돼요.",
      },
      {
        term: "경기 부양책 (Stimulus Package)",
        explanation:
          "경제가 나빠질 때 정부가 돈을 풀어 경제를 살리는 정책이에요. 마치 몸이 아플 때 영양제를 먹는 것처럼, 세금 감면이나 공공사업 투자 등으로 시장에 돈이 돌게 만들어요.",
      },
      {
        term: "무역수지 (Trade Balance)",
        explanation:
          "나라가 수출로 번 돈에서 수입에 쓴 돈을 뺀 값이에요. 수출이 수입보다 많으면 '흑자', 반대면 '적자'라고 해요. 한국처럼 수출로 먹고사는 나라는 무역수지가 경제 건강의 중요한 지표예요.",
      },
    ],
  };
}

export async function generateKoreanDigest(
  rawArticles: RawArticle[]
): Promise<KoreanDigest> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockDigest(rawArticles);
  }

  const articleList = rawArticles
    .map(
      (a, i) =>
        `[${i + 1}] 제목: ${a.title}\n    설명: ${a.description ?? "없음"}\n    출처: ${a.source}\n    URL: ${a.url}`
    )
    .join("\n\n");

  const prompt = `당신은 한국의 경제 초보자를 위해 글로벌 경제 뉴스를 쉽게 설명해 주는 전문 편집자입니다.

아래는 오늘의 글로벌 경제 뉴스 목록입니다 (영문):

${articleList}

위 뉴스를 분석하여 다음 형식의 JSON을 반환해 주세요. JSON 외에 다른 텍스트는 절대 포함하지 마세요.

{
  "summary": "오늘의 전체 경제 흐름을 3-4문장으로 요약. 중학생도 이해할 수 있는 쉬운 한국어로 작성.",
  "articles": [
    {
      "koreanTitle": "뉴스 제목을 자연스러운 한국어로 번역",
      "explanation": "다음 4가지를 모두 포함해 4-6문장으로 작성: ① 이 뉴스의 배경(왜 이런 일이 생겼는지) ② 핵심 내용 ③ 한국 경제나 우리 생활에 미치는 영향 ④ 앞으로 주목할 점. 전문 용어는 괄호 안에 쉬운 설명 추가. 원문을 보지 않아도 상황을 완전히 이해할 수 있을 만큼 충분히 설명할 것.",
      "originalUrl": "원문 URL 그대로"
    }
  ],
  "learningSection": [
    {
      "term": "경제 용어 (영문 원어)",
      "explanation": "초등학생도 이해할 수 있는 비유나 예시를 사용한 쉬운 설명 2-3문장."
    }
  ]
}

요구사항:
- articles: 가장 중요한 5-7개 선택
- learningSection: 뉴스에 등장한 어려운 경제 용어 3-5개 선택
- 모든 한국어는 정중한 존댓말(-습니다, -해요) 사용
- 어려운 영어 표현은 반드시 한국어로 설명`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const rawContent = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  // Strip markdown code fences if Claude adds them despite instructions
  const jsonString = rawContent
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();

  let parsed: ClaudeDigestResponse;
  try {
    parsed = JSON.parse(jsonString) as ClaudeDigestResponse;
  } catch {
    throw new Error(
      `Claude가 잘못된 JSON을 반환했습니다. 응답: ${rawContent.slice(0, 200)}`
    );
  }

  if (
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.articles) ||
    !Array.isArray(parsed.learningSection)
  ) {
    throw new Error("Claude 응답에 필수 필드가 없습니다.");
  }

  return {
    summary: parsed.summary,
    articles: parsed.articles.map((a) => ({
      koreanTitle: a.koreanTitle ?? "",
      explanation: a.explanation ?? "",
      originalUrl: a.originalUrl ?? "",
    })),
    learningSection: parsed.learningSection.map((t) => ({
      term: t.term ?? "",
      explanation: t.explanation ?? "",
    })),
  };
}
