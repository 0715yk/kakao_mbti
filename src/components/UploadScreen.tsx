"use client";

import { useCallback, useRef, useState } from "react";
import { ParsedChat } from "@/lib/types";
import { parseKakaoChat } from "@/lib/parseKakaoChat";

export default function UploadScreen({
  onParsed,
  onBack,
}: {
  onParsed: (chat: ParsedChat) => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const processFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError("");

      try {
        let text = "";

        if (file.name.endsWith(".zip")) {
          const JSZip = (await import("jszip")).default;
          const zip = await JSZip.loadAsync(file);
          const txtFile = Object.values(zip.files).find(
            (f) => f.name.endsWith(".txt") && !f.dir
          );
          if (!txtFile) {
            setError("ZIP 안에 텍스트 파일을 찾을 수 없어요.");
            setLoading(false);
            return;
          }
          text = await txtFile.async("string");
        } else {
          text = await file.text();
        }

        const parsed = parseKakaoChat(text);

        if (parsed.totalMessages < 10) {
          setError(
            "메시지가 너무 적어요. 카카오톡 대화 내보내기 파일이 맞는지 확인해주세요."
          );
          setLoading(false);
          return;
        }
        if (parsed.participants.length === 0) {
          setError("대화 참여자를 찾을 수 없어요. 파일 형식을 확인해주세요.");
          setLoading(false);
          return;
        }

        onParsed(parsed);
      } catch {
        setError("파일을 읽을 수 없어요. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

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
          대화 파일 업로드
        </h2>
        <p className="text-white/55 text-sm animate-fade-in">
          내보낸 카카오톡 대화 파일을 올려주세요
        </p>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div
          className={`upload-zone min-h-[280px] flex flex-col items-center justify-center px-6 py-12 cursor-pointer animate-fade-in-up stagger-2 ${
            dragging ? "active" : ""
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.zip"
            className="hidden"
            onChange={handleFile}
          />

          {loading ? (
            <div className="text-center">
              <div className="text-4xl mb-4 animate-spin-slow">⏳</div>
              <p className="text-sm text-white/55">파일을 읽고 있어요...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">📂</div>
              <p className="font-semibold mb-2">터치하여 파일 선택</p>
              <p className="text-xs text-white/55">.txt 또는 .zip 파일</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
