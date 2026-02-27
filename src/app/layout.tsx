import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: "카톡으로 보는 나의 MBTI",
  description: "카카오톡 대화를 분석해서 당신의 진짜 MBTI를 알아보세요",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "카톡 MBTI",
  },
  openGraph: {
    title: "카톡으로 보는 나의 MBTI",
    description: "카카오톡 대화를 분석해서 당신의 진짜 MBTI를 알아보세요",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "카톡으로 보는 나의 MBTI",
    description: "카카오톡 대화를 분석해서 당신의 진짜 MBTI를 알아보세요",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0a1e",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
