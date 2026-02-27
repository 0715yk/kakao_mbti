export interface ChatMessage {
  sender: string;
  time: string;
  message: string;
  date: string;
}

export interface ParticipantStats {
  name: string;
  messageCount: number;
  avgLength: number;
  topWords: string[];
}

export interface ParsedChat {
  roomName: string;
  exportDate: string;
  participants: ParticipantStats[];
  messages: ChatMessage[];
  totalMessages: number;
}

export interface AnalysisResult {
  mbtiType: string;
  title: string;
  description: string;
  traits: {
    emoji: string;
    label: string;
    description: string;
  }[];
  speechPatterns: string[];
  frequentWords: string[];
  bestMatch: {
    name: string;
    estimatedMbti: string;
    compatibility: string;
  } | null;
  funFact: string;
}
