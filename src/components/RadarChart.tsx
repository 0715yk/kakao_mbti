"use client";

import { BigFive } from "@/lib/types";

const LABELS = ["개방성", "성실성", "외향성", "친화성", "신경성"];
const KEYS: (keyof BigFive)[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

const CX = 130;
const CY = 130;
const R = 95;
const GRID = [0.25, 0.5, 0.75, 1];

function polar(i: number, scale: number) {
  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
  return {
    x: CX + R * scale * Math.cos(angle),
    y: CY + R * scale * Math.sin(angle),
  };
}

export default function RadarChart({ data }: { data: BigFive }) {
  const dataPoints = KEYS.map((k, i) => polar(i, (data[k] ?? 50) / 100));
  const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[260px] mx-auto">
      {/* Grid pentagons */}
      {GRID.map((s) => (
        <polygon
          key={s}
          points={Array.from({ length: 5 }, (_, i) => {
            const p = polar(i, s);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {Array.from({ length: 5 }, (_, i) => {
        const p = polar(i, 1);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data fill */}
      <polygon
        points={dataPoly}
        fill="rgba(139,92,246,0.25)"
        stroke="#8b5cf6"
        strokeWidth="2"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#a78bfa" />
      ))}

      {/* Labels */}
      {KEYS.map((k, i) => {
        const lp = polar(i, 1.22);
        const score = data[k] ?? 50;
        return (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize="11"
            fontWeight="500"
          >
            {LABELS[i]}
            <tspan fill="rgba(255,255,255,0.4)" fontSize="10" dx="3">
              {score}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
