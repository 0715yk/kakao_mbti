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

export interface BigFive {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface AnalysisResult {
  mbtiType: string;
  confidence: number;
  title: string;
  summary: string;
  socialRole: string;
  cognitiveStyle: string;
  bigFive: BigFive;
  strengths: string[];
  blindSpots: string[];
  evidence: string[];
  funInsight: string;
}
