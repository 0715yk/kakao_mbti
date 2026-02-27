"use client";

import { useRef, useState } from "react";
import { AnalysisResult } from "@/lib/types";
import { getMbtiData } from "@/lib/mbtiData";

export default function ResultScreen({
  result,
  userName,
  onReset,
}: {
  result: AnalysisResult;
  userName: string;
  onReset: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [saved, setSaved] = useState(false);
  const mbti = getMbtiData(result.mbtiType);

  const handleShare = async () => {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    setSaved(false);

    try {
      const el = cardRef.current;

      // backdrop-filter는 html2canvas에서 렌더링 불가 → 캡처 전 임시 제거
      const cards = el.querySelectorAll<HTMLElement>(".card");
      cards.forEach((c) => {
        c.style.backdropFilter = "none";
        c.style.setProperty("-webkit-backdrop-filter", "none");
        c.style.background = "rgba(255,255,255,0.1)";
      });

      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(el, {
        backgroundColor: "#0f0a1e",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // 캡처 완료 후 스타일 복원
      cards.forEach((c) => {
        c.style.backdropFilter = "";
        c.style.setProperty("-webkit-backdrop-filter", "");
        c.style.background = "";
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("이미지 생성 실패");

      const file = new File([blob], "my-kakao-mbti.png", {
        type: "image/png",
      });

      // 모바일: Web Share API
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "카톡으로 보는 나의 MBTI",
          text: `내 MBTI는 ${result.mbtiType}! ${result.title}`,
          files: [file],
        });
      } else {
        // PC: 다운로드
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-kakao-mbti.png";
        document.body.appendChild(a);
        a.click();
        // 브라우저가 다운로드 시작할 시간 확보 후 정리
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 500);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Share error:", e);
      alert("이미지 저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-dvh px-6 py-8 pb-32">
      {/* ── Shareable Card ── */}
      <div ref={cardRef} className="share-card p-6">
        {/* MBTI Type */}
        <div className="text-center mb-6 animate-fade-in-up">
          <p className="text-sm text-white/55 mb-4">
            이 방에서 <strong className="text-white/80">{userName}</strong>의
            MBTI는
          </p>
          <div
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r ${mbti.gradient} mb-4`}
          >
            <span className="text-4xl">{mbti.emoji}</span>
            <span className="text-4xl font-black tracking-wider">
              {result.mbtiType}
            </span>
          </div>
          <p className="text-xl font-bold">{result.title}</p>
        </div>

        {/* Description */}
        <div className="card p-4 mb-4 animate-fade-in-up stagger-1">
          <p className="text-sm leading-relaxed text-white/80">
            {result.description}
          </p>
        </div>

        {/* Traits */}
        <div className="card p-4 mb-4 animate-fade-in-up stagger-2">
          <h3 className="text-sm font-bold mb-3 text-violet-300">
            📊 성격 분석
          </h3>
          <div className="flex flex-col gap-3">
            {result.traits.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{t.emoji}</span>
                <div>
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-white/55 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speech Patterns */}
        <div className="card p-4 mb-4 animate-fade-in-up stagger-3">
          <h3 className="text-sm font-bold mb-3 text-pink-300">
            💬 자주 쓰는 표현
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.speechPatterns.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs bg-white/8 border border-white/10"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Frequent Words */}
        <div className="card p-4 mb-4 animate-fade-in-up stagger-4">
          <h3 className="text-sm font-bold mb-3 text-cyan-300">
            🔤 많이 쓰는 단어
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.frequentWords.map((w, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500/15 to-pink-500/15 border border-violet-500/20"
              >
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Best Match */}
        {result.bestMatch && (
          <div className="card p-4 mb-4 animate-fade-in-up stagger-5">
            <h3 className="text-sm font-bold mb-3 text-amber-300">
              💕 찰떡궁합
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-pink-400/20 flex items-center justify-center">
                👤
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {result.bestMatch.name}
                </p>
                <p className="text-xs text-amber-300/80">
                  추정 MBTI: {result.bestMatch.estimatedMbti}
                </p>
              </div>
            </div>
            <p className="text-xs text-white/55 leading-relaxed">
              {result.bestMatch.compatibility}
            </p>
          </div>
        )}

        {/* Fun Fact */}
        <div className="card p-4 animate-fade-in-up stagger-5">
          <h3 className="text-sm font-bold mb-2 text-emerald-300">
            🎲 재미있는 팩트
          </h3>
          <p className="text-sm text-white/80 leading-relaxed">
            {result.funFact}
          </p>
        </div>

        {/* Watermark for shared image */}
        <p className="text-center text-[10px] text-white/20 mt-4">
          카톡으로 보는 나의 MBTI 🔮
        </p>
      </div>

      {/* ── Actions (outside share card) ── */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f0a1e] via-[#0f0a1e] to-transparent">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button onClick={onReset} className="btn-secondary flex-1">
            다시 하기
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="btn-primary flex-1"
          >
            {sharing ? "저장 중..." : saved ? "저장 완료!" : "결과 공유"}
          </button>
        </div>
      </div>
    </div>
  );
}
