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

    const prompt = `You are a behavioral personality analyst.

Analyze the user's chat behavior using:
- language patterns (emotion, questions, certainty, message style)
- conversational role (facilitator, observer, leader, mood-maker)
- Big Five personality signals
- cognitive style (analytical vs intuitive, emotional vs logical)

Infer MBTI only as a summary indicator.
Be concise, evidence-based, and avoid overconfidence.
All text output MUST be in Korean.

## Target User
Name: "${userName}"

## Participant Stats
${participantSummary}

## Chat Content
${chatText}

Return JSON only:
{
  "mbtiType": "4-letter MBTI",
  "confidence": 0-100,
  "title": "캐릭터 타이틀 한줄 (예: '리액션 폭격기', '논리의 끝판왕')",
  "summary": "이 사람의 대화 성격을 2~3문장으로 생생하게 묘사 (한국어)",
  "socialRole": "대화에서의 역할 한줄 (예: '분위기 메이커', '조용한 관찰자')",
  "cognitiveStyle": "인지 스타일 한줄 (예: '감성적 직관형', '논리적 분석형')",
  "bigFive": {
    "openness": 0-100,
    "conscientiousness": 0-100,
    "extraversion": 0-100,
    "agreeableness": 0-100,
    "neuroticism": 0-100
  },
  "strengths": ["대화에서 드러나는 강점 3개 (한국어)"],
  "blindSpots": ["대화에서 드러나는 약점/주의점 2~3개 (한국어)"],
  "evidence": ["대화에서 발견한 구체적 근거 3~5개, 실제 메시지 인용 포함 (한국어)"],
  "funInsight": "재미있는 인사이트 1문장 (한국어)"
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
        temperature: 0.7,
        max_tokens: 2500,
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
