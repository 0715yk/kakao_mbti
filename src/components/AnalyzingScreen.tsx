"use client";

import { useEffect, useState } from "react";

const messages = [
  "대화를 읽고 있어요",
  "말투를 분석하고 있어요",
  "성격을 파악하고 있어요",
  "MBTI를 판정하고 있어요",
  "거의 다 됐어요",
];

export default function AnalyzingScreen() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
      <div className="relative mb-10">
        <div className="text-7xl animate-float">🔮</div>
        <div className="absolute inset-0 rounded-full animate-pulse-glow" />
      </div>

      <div className="animate-fade-in">
        <p className="text-lg font-semibold mb-2" key={idx}>
          {messages[idx]}
          <span className="inline-block w-6 text-left animate-pulse">...</span>
        </p>
        <p className="text-sm text-white/55">
          잠시만 기다려주세요
        </p>
      </div>

      <div className="mt-12 w-48 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-[3000ms] ease-linear"
          style={{ width: `${((idx + 1) / messages.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
