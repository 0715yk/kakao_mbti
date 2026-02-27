import { ChatMessage, ParsedChat, ParticipantStats } from "./types";

const SYSTEM_KEYWORDS = [
  "사진",
  "동영상",
  "이모티콘",
  "보이스톡",
  "페이스톡",
  "님이 들어왔습니다",
  "님이 나갔습니다",
  "님을 초대했습니다",
  "삭제된 메시지입니다",
  "채팅방 관리자가",
  "Open Chat",
  "카카오톡 대화",
  "저장한 날짜",
];

const DATE_SEP = /^-{3,}\s*(.+?)\s*-{3,}$/;

const MSG_PATTERNS = [
  // iOS: "2026년 2월 27일 오후 3:22, 홍길동 : 메시지"
  /^(\d{4}년\s*\d{1,2}월\s*\d{1,2}일\s*(?:오전|오후)\s*\d{1,2}:\d{2}),\s*(.+?)\s*:\s*(.+)$/s,
  // iOS variant: "2026. 2. 27. 오후 3:22, 홍길동 : 메시지"
  /^(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*(?:오전|오후)\s*\d{1,2}:\d{2}),\s*(.+?)\s*:\s*(.+)$/s,
  // Android: "[홍길동] [오후 3:22] 메시지"
  /^\[(.+?)\]\s*\[(오전|오후)\s*(\d{1,2}:\d{2})\]\s*(.+)$/s,
];

function isSystemMessage(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length <= 3) return true;
  return SYSTEM_KEYWORDS.some((kw) => trimmed === kw || trimmed.includes(kw));
}

function tryParseMessage(
  line: string
): { sender: string; time: string; message: string } | null {
  for (let i = 0; i < MSG_PATTERNS.length; i++) {
    const m = line.match(MSG_PATTERNS[i]);
    if (!m) continue;

    if (i <= 1) {
      return { sender: m[2].trim(), time: m[1].trim(), message: m[3].trim() };
    }
    // Android pattern
    return {
      sender: m[1].trim(),
      time: `${m[2]} ${m[3]}`,
      message: m[4].trim(),
    };
  }
  return null;
}

function computeParticipants(messages: ChatMessage[]): ParticipantStats[] {
  const map = new Map<
    string,
    { count: number; totalLen: number; words: Map<string, number> }
  >();

  for (const msg of messages) {
    let entry = map.get(msg.sender);
    if (!entry) {
      entry = { count: 0, totalLen: 0, words: new Map() };
      map.set(msg.sender, entry);
    }
    entry.count++;
    entry.totalLen += msg.message.length;

    for (const w of msg.message.split(/\s+/)) {
      if (w.length >= 2) {
        entry.words.set(w, (entry.words.get(w) || 0) + 1);
      }
    }
  }

  return Array.from(map.entries())
    .map(([name, s]) => ({
      name,
      messageCount: s.count,
      avgLength: Math.round(s.totalLen / (s.count || 1)),
      topWords: [...s.words.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([w]) => w),
    }))
    .sort((a, b) => b.messageCount - a.messageCount);
}

export function parseKakaoChat(text: string): ParsedChat {
  const lines = text.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  let currentDate = "";
  let roomName = "";
  let exportDate = "";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.includes("카카오톡 대화") && !roomName) {
      roomName = line.replace(/\s*님과\s*카카오톡\s*대화.*$/, "").trim();
      continue;
    }
    if (line.startsWith("저장한 날짜") && !exportDate) {
      exportDate = line.replace(/^저장한\s*날짜\s*:\s*/, "").trim();
      continue;
    }

    const dateSep = line.match(DATE_SEP);
    if (dateSep) {
      currentDate = dateSep[1].trim();
      continue;
    }

    const parsed = tryParseMessage(line);
    if (parsed) {
      if (!isSystemMessage(parsed.message)) {
        messages.push({ ...parsed, date: currentDate });
      }
      continue;
    }

    if (messages.length > 0 && !line.startsWith("-")) {
      messages[messages.length - 1].message += "\n" + line;
    }
  }

  return {
    roomName,
    exportDate,
    participants: computeParticipants(messages),
    messages,
    totalMessages: messages.length,
  };
}

export function sampleMessages(
  messages: ChatMessage[],
  maxCount = 600
): ChatMessage[] {
  if (messages.length <= maxCount) return messages;

  const recentCount = Math.min(250, maxCount / 2);
  const sampleCount = maxCount - recentCount;
  const recent = messages.slice(-recentCount);
  const rest = messages.slice(0, -recentCount);
  const step = Math.max(1, Math.ceil(rest.length / sampleCount));
  const sampled = rest.filter((_, i) => i % step === 0);

  return [...sampled, ...recent];
}
