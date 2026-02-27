import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

function extractJSON(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const braces = text.match(/\{[\s\S]*\}/);
  if (braces) return braces[0];
  return text.trim();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const { userName, chatText, participantSummary } = await req.json();

    if (!userName || !chatText) {
      return NextResponse.json(
        { error: "분석에 필요한 데이터가 부족합니다." },
        { status: 400 }
      );
    }

    const prompt = `당신은 카카오톡 대화 분석 전문가입니다. 재미있고 통찰력 있는 성격 분석을 제공합니다.

## 분석 대상
이름: "${userName}"

## 대화 참여자 통계
${participantSummary}

## 대화 내용
${chatText}

## 지시사항
위 대화에서 "${userName}"의 메시지를 분석하여 MBTI 성격 유형을 판단하세요.
분석 근거는 실제 대화 내용에서 찾아주세요.
사주풀이하듯 재미있지만 날카로운 통찰을 담아주세요.
너무 길지 않게, 핵심만 임팩트 있게 작성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "mbtiType": "MBTI 4글자",
  "title": "이 방에서의 캐릭터를 한줄로 (예: '리액션 폭격기', '갑분싸 수습 요정')",
  "description": "이 사람의 대화 스타일을 2~3문장으로 생생하게 묘사",
  "traits": [
    { "emoji": "적절한 이모지", "label": "특성 이름", "description": "대화에서 드러나는 구체적 근거 1문장" },
    { "emoji": "적절한 이모지", "label": "특성 이름", "description": "대화에서 드러나는 구체적 근거 1문장" },
    { "emoji": "적절한 이모지", "label": "특성 이름", "description": "대화에서 드러나는 구체적 근거 1문장" }
  ],
  "speechPatterns": ["자주 쓰는 특징적인 말투/표현 5개"],
  "frequentWords": ["자주 등장하는 단어/이모티콘/감탄사 5개"],
  "bestMatch": {
    "name": "이 대화방에서 가장 케미 좋은 사람 1명",
    "estimatedMbti": "그 사람의 추정 MBTI",
    "compatibility": "왜 잘 맞는지 1~2문장"
  },
  "funFact": "이 사람에 대한 재미있는 팩트 1문장 (대화 기반)"
}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI error:", err);
      return NextResponse.json(
        { error: "AI 분석 중 오류가 발생했습니다." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const result = JSON.parse(extractJSON(raw));

    return NextResponse.json(result);
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json(
      { error: "분석 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
