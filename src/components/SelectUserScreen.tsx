"use client";

import { useState } from "react";
import { ParticipantStats } from "@/lib/types";

export default function SelectUserScreen({
  participants,
  onSelect,
  onBack,
}: {
  participants: ParticipantStats[];
  onSelect: (name: string) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState("");

  return (
    <div className="flex flex-col h-dvh">
      {/* 상단 고정 헤더 */}
      <div className="sticky top-0 z-10 px-6 pt-6 pb-4 bg-gradient-to-b from-[#0f0a1e] via-[#0f0a1e] to-transparent">
        <button
          onClick={onBack}
          className="text-white/50 text-sm mb-4"
        >
          ← 뒤로
        </button>
        <h2 className="text-2xl font-bold mb-1 animate-fade-in">
          당신은 누구인가요?
        </h2>
        <p className="text-white/55 text-sm animate-fade-in">
          이 대화방에서 본인을 선택해주세요
        </p>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="flex flex-col gap-3">
          {participants.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setSelected(p.name)}
              className={`card participant-card p-4 flex items-center gap-4 text-left animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${
                selected === p.name ? "selected" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">
                  {selected === p.name ? "✓" : "👤"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <p className="text-xs text-white/55">
                  메시지 {p.messageCount.toLocaleString()}개
                </p>
              </div>
              {selected === p.name && (
                <div className="w-2 h-2 rounded-full bg-violet-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 px-6 pt-4 pb-6 bg-gradient-to-t from-[#0f0a1e] via-[#0f0a1e] to-transparent">
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="btn-primary"
        >
          분석 시작
        </button>
      </div>
    </div>
  );
}
