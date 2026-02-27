"use client";

import { useState } from "react";
import { AnalysisResult } from "@/lib/types";
import { getMbtiData } from "@/lib/mbtiData";
import { generateShareImage } from "@/lib/generateShareImage";
import RadarChart from "./RadarChart";

export default function ResultScreen({
  result,
  userName,
  onBack,
  onReset,
}: {
  result: AnalysisResult;
  userName: string;
  onBack: () => void;
  onReset: () => void;
}) {
  const [sharing, setSharing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const mbti = getMbtiData(result.mbtiType);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    setSaved(false);

    try {
      const blob = await generateShareImage(result, userName);
      const file = new File([blob], "my-kakao-mbti.png", {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "카톡으로 보는 나의 MBTI",
          text: `내 MBTI는 ${result.mbtiType}! ${result.title}`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-kakao-mbti.png";
        document.body.appendChild(a);
        a.click();
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

  const confidence = Math.min(100, Math.max(0, result.confidence ?? 70));

  return (
    <div className="min-h-dvh px-6 py-8 pb-32">
      {/* 1. MBTI + Title */}
      <div className="text-center mb-6 animate-fade-in-up">
        <p className="text-sm text-white/50 mb-4">
          <strong className="text-white/80">{userName}</strong>의 대화 분석 결과
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

      {/* 2. Confidence */}
      <div className="card p-4 mb-4 animate-fade-in-up stagger-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white/60">분석 확신도</span>
          <span className="text-xs font-bold text-violet-300">{confidence}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* 3. Summary */}
      <div className="card p-4 mb-4 animate-fade-in-up stagger-2">
        <h3 className="text-sm font-bold mb-2 text-violet-300">📝 성격 요약</h3>
        <p className="text-sm leading-relaxed text-white/80">{result.summary}</p>
      </div>

      {/* 4. Social Role + 5. Cognitive Style */}
      <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in-up stagger-2">
        <div className="card p-4">
          <h3 className="text-[11px] font-bold mb-2 text-pink-300">🎭 대화 속 역할</h3>
          <p className="text-sm font-semibold">{result.socialRole}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-[11px] font-bold mb-2 text-cyan-300">🧠 인지 스타일</h3>
          <p className="text-sm font-semibold">{result.cognitiveStyle}</p>
        </div>
      </div>

      {/* 6. Big Five Radar */}
      <div className="card p-4 mb-4 animate-fade-in-up stagger-3">
        <h3 className="text-sm font-bold mb-2 text-violet-300">📊 Big Five 성격 지표</h3>
        <RadarChart data={result.bigFive} />
      </div>

      {/* 7. Strengths */}
      <div className="card p-4 mb-4 animate-fade-in-up stagger-3">
        <h3 className="text-sm font-bold mb-3 text-emerald-300">💪 강점</h3>
        <div className="flex flex-col gap-2">
          {result.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-emerald-400 text-xs mt-0.5">●</span>
              <p className="text-sm text-white/80 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Blind Spots */}
      <div className="card p-4 mb-4 animate-fade-in-up stagger-4">
        <h3 className="text-sm font-bold mb-3 text-amber-300">⚠️ 블라인드 스팟</h3>
        <div className="flex flex-col gap-2">
          {result.blindSpots.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-amber-400 text-xs mt-0.5">●</span>
              <p className="text-sm text-white/80 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Evidence (collapsible) */}
      <div className="card mb-4 animate-fade-in-up stagger-4">
        <button
          onClick={() => setShowEvidence((v) => !v)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h3 className="text-sm font-bold text-white/60">📌 분석 근거</h3>
          <span className="text-xs text-white/40">
            {showEvidence ? "접기 ▲" : "펼치기 ▼"}
          </span>
        </button>
        {showEvidence && (
          <div className="px-4 pb-4 flex flex-col gap-2">
            {result.evidence.map((e, i) => (
              <div
                key={i}
                className="text-xs text-white/60 leading-relaxed pl-3 border-l-2 border-white/10"
              >
                {e}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10. Fun Insight */}
      <div className="card p-4 mb-4 animate-fade-in-up stagger-5">
        <h3 className="text-sm font-bold mb-2 text-pink-300">💡 재미있는 인사이트</h3>
        <p className="text-sm text-white/80 leading-relaxed">
          {result.funInsight}
        </p>
      </div>

      {/* Watermark */}
      <p className="text-center text-[10px] text-white/20 mt-2">
        카톡으로 보는 나의 MBTI 🔮
      </p>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f0a1e] via-[#0f0a1e] to-transparent">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <div className="flex gap-3">
            <button onClick={onBack} className="btn-secondary flex-1">
              다른 사람 분석
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="btn-primary flex-1"
            >
              {sharing ? "저장 중..." : saved ? "저장 완료!" : "결과 공유"}
            </button>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-white/30 py-1 text-center"
          >
            다른 채팅방으로 다시 하기
          </button>
        </div>
      </div>
    </div>
  );
}
