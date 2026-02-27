import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "카톡으로 보는 나의 MBTI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(165deg, #1a1145 0%, #0f0a1e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🔮</div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 12,
            display: "flex",
            gap: 12,
          }}
        >
          <span>카톡으로 보는</span>
          <span
            style={{
              background: "linear-gradient(135deg, #a78bfa, #ec4899)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            나의 MBTI
          </span>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 40,
          }}
        >
          카카오톡 대화를 분석해서 당신의 진짜 MBTI를 알아보세요
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["INTJ", "ENFP", "ISTP", "INFJ"].map((t) => (
            <div
              key={t}
              style={{
                padding: "12px 28px",
                borderRadius: 14,
                background: "rgba(139,92,246,0.2)",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "#a78bfa",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
