"use client";

import { useCallback, useState } from "react";
import { ParsedChat, AnalysisResult } from "@/lib/types";
import { sampleMessages } from "@/lib/parseKakaoChat";
import IntroScreen from "@/components/IntroScreen";
import GuideScreen from "@/components/GuideScreen";
import UploadScreen from "@/components/UploadScreen";
import SelectUserScreen from "@/components/SelectUserScreen";
import AnalyzingScreen from "@/components/AnalyzingScreen";
import ResultScreen from "@/components/ResultScreen";

type Screen =
  | "intro"
  | "guide"
  | "upload"
  | "selectUser"
  | "analyzing"
  | "result"
  | "error";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [chat, setChat] = useState<ParsedChat | null>(null);
  const [userName, setUserName] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleParsed = useCallback((parsed: ParsedChat) => {
    setChat(parsed);
    setScreen("selectUser");
  }, []);

  const handleSelectUser = useCallback(
    async (name: string) => {
      if (!chat) return;
      setUserName(name);
      setScreen("analyzing");

      try {
        const sampled = sampleMessages(chat.messages);
        const chatText = sampled
          .map((m) => `${m.sender}: ${m.message}`)
          .join("\n");

        const participantSummary = chat.participants
          .map(
            (p) =>
              `- ${p.name}: 메시지 ${p.messageCount}개, 평균 길이 ${p.avgLength}자`
          )
          .join("\n");

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: name, chatText, participantSummary }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "분석에 실패했습니다.");
        }

        const data: AnalysisResult = await res.json();
        setResult(data);
        setScreen("result");
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다."
        );
        setScreen("error");
      }
    },
    [chat]
  );

  const handleReset = useCallback(() => {
    setChat(null);
    setUserName("");
    setResult(null);
    setError("");
    setScreen("intro");
  }, []);

  return (
    <main className="max-w-lg mx-auto">
      {screen === "intro" && (
        <IntroScreen onNext={() => setScreen("guide")} />
      )}

      {screen === "guide" && (
        <GuideScreen
          onNext={() => setScreen("upload")}
          onBack={() => setScreen("intro")}
        />
      )}

      {screen === "upload" && (
        <UploadScreen
          onParsed={handleParsed}
          onBack={() => setScreen("guide")}
        />
      )}

      {screen === "selectUser" && chat && (
        <SelectUserScreen
          participants={chat.participants}
          onSelect={handleSelectUser}
          onBack={() => setScreen("upload")}
        />
      )}

      {screen === "analyzing" && <AnalyzingScreen />}

      {screen === "result" && result && (
        <ResultScreen
          result={result}
          userName={userName}
          onBack={() => setScreen("selectUser")}
          onReset={handleReset}
        />
      )}

      {screen === "error" && (
        <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
          <div className="text-5xl mb-6">😢</div>
          <h2 className="text-xl font-bold mb-3">분석에 실패했어요</h2>
          <p className="text-sm text-white/55 mb-8 max-w-xs">
            {error}
          </p>
          <button onClick={handleReset} className="btn-primary max-w-xs">
            처음부터 다시 하기
          </button>
        </div>
      )}
    </main>
  );
}
