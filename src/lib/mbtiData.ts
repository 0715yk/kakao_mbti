export const mbtiData: Record<
  string,
  { emoji: string; gradient: string; accent: string }
> = {
  INTJ: { emoji: "🧠", gradient: "from-indigo-500 to-purple-700", accent: "#6366f1" },
  INTP: { emoji: "🔬", gradient: "from-violet-500 to-indigo-700", accent: "#8b5cf6" },
  ENTJ: { emoji: "👑", gradient: "from-amber-500 to-orange-700", accent: "#f59e0b" },
  ENTP: { emoji: "⚡", gradient: "from-cyan-400 to-blue-600", accent: "#06b6d4" },
  INFJ: { emoji: "🌙", gradient: "from-purple-400 to-indigo-600", accent: "#a78bfa" },
  INFP: { emoji: "🦋", gradient: "from-pink-400 to-purple-600", accent: "#e879f9" },
  ENFJ: { emoji: "☀️", gradient: "from-yellow-400 to-orange-500", accent: "#fbbf24" },
  ENFP: { emoji: "🌈", gradient: "from-pink-400 to-orange-400", accent: "#fb7185" },
  ISTJ: { emoji: "📋", gradient: "from-slate-400 to-blue-600", accent: "#64748b" },
  ISFJ: { emoji: "🛡️", gradient: "from-emerald-400 to-teal-600", accent: "#34d399" },
  ESTJ: { emoji: "🏛️", gradient: "from-blue-500 to-indigo-700", accent: "#3b82f6" },
  ESFJ: { emoji: "🤝", gradient: "from-rose-400 to-pink-600", accent: "#fb7185" },
  ISTP: { emoji: "🔧", gradient: "from-gray-400 to-slate-600", accent: "#94a3b8" },
  ISFP: { emoji: "🎨", gradient: "from-rose-300 to-violet-500", accent: "#f472b6" },
  ESTP: { emoji: "🔥", gradient: "from-red-500 to-orange-600", accent: "#ef4444" },
  ESFP: { emoji: "🎭", gradient: "from-fuchsia-400 to-pink-500", accent: "#d946ef" },
};

export function getMbtiData(type: string) {
  return mbtiData[type.toUpperCase()] ?? mbtiData["INFJ"];
}
