"use client";

const steps = [
  {
    num: 1,
    icon: "💬",
    title: "채팅방 열기",
    desc: "분석하고 싶은 카톡 채팅방을 열어주세요",
  },
  {
    num: 2,
    icon: "⚙️",
    title: "설정 진입",
    desc: "우측 상단 메뉴(≡) → 설정(⚙️)을 눌러주세요",
  },
  {
    num: 3,
    icon: "📤",
    title: "대화 내보내기",
    desc: '"대화 내보내기" → "텍스트 메시지만 보내기" 선택',
  },
  {
    num: 4,
    icon: "📁",
    title: "파일 저장",
    desc: "메일로 받거나 파일앱에 저장한 뒤 여기서 업로드",
  },
];

export default function GuideScreen({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
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
          이렇게 준비해주세요
        </h2>
        <p className="text-white/55 text-sm animate-fade-in">
          카카오톡에서 대화를 내보내는 방법이에요
        </p>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="flex flex-col gap-4">
          {steps.map((s) => (
            <div
              key={s.num}
              className={`card p-4 flex items-start gap-4 animate-fade-in-up stagger-${s.num}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0 text-lg">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full">
                    STEP {s.num}
                  </span>
                  <span className="font-semibold text-sm">{s.title}</span>
                </div>
                <p className="text-white/55 text-xs leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 px-6 pt-4 pb-6 bg-gradient-to-t from-[#0f0a1e] via-[#0f0a1e] to-transparent">
        <button onClick={onNext} className="btn-primary animate-fade-in stagger-5">
          파일 업로드하러 가기
        </button>
      </div>
    </div>
  );
}
