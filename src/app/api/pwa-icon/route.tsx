import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const size = Number(req.nextUrl.searchParams.get("size") || 512);
  const s = Math.min(Math.max(size, 48), 1024);
  const radius = Math.round(s * 0.22);
  const fontSize = Math.round(s * 0.55);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          borderRadius: radius,
        }}
      >
        <span style={{ fontSize }}>🔮</span>
      </div>
    ),
    { width: s, height: s },
  );
}
