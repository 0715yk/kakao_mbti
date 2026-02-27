"use client";

export default function IntroScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
      <div className="animate-fade-in-up">
        <div className="text-7xl mb-6 animate-float">🔮</div>
        <h1 className="text-3xl font-extrabold mb-3 leading-tight">
          카톡으로 보는
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            나의 MBTI
          </span>
        </h1>
        <p className="text-white/55 text-base leading-relaxed mb-10 max-w-xs mx-auto">
          카카오톡 대화를 분석해서
          <br />
          당신의 <strong className="text-white/80">진짜 MBTI</strong>를
          알아보세요
        </p>
      </div>

      <div className="w-full max-w-xs animate-fade-in stagger-3">
        <button onClick={onNext} className="btn-primary">
          시작하기
        </button>
      </div>

      <p className="text-xs text-white/30 mt-8 animate-fade-in stagger-5">
        대화 내용은 분석 후 즉시 삭제됩니다
      </p>
    </div>
  );
}
