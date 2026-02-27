import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "카톡으로 보는 나의 MBTI",
    short_name: "카톡 MBTI",
    description: "카카오톡 대화를 분석해서 당신의 진짜 MBTI를 알아보세요",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0a1e",
    theme_color: "#0f0a1e",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/api/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/api/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
