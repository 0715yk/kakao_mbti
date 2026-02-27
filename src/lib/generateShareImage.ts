import { AnalysisResult, BigFive } from "./types";
import { getMbtiData } from "./mbtiData";

const W = 640;
const PAD = 44;
const CW = W - PAD * 2;

const font = (weight: string, size: number) =>
  `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const char of text) {
    if (ctx.measureText(line + char).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ── Radar Chart ──

const BF_LABELS = ["개방성", "성실성", "외향성", "친화성", "신경성"];
const BF_KEYS: (keyof BigFive)[] = [
  "openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism",
];

function drawRadar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, data: BigFive) {
  const polar = (i: number, scale: number) => ({
    x: cx + r * scale * Math.cos((Math.PI * 2 * i) / 5 - Math.PI / 2),
    y: cy + r * scale * Math.sin((Math.PI * 2 * i) / 5 - Math.PI / 2),
  });

  for (const s of [0.25, 0.5, 0.75, 1]) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const p = polar(i, s);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < 5; i++) {
    const p = polar(i, 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();
  }

  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const p = polar(i, (data[BF_KEYS[i]] ?? 50) / 100);
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(139,92,246,0.25)";
  ctx.fill();
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const p = polar(i, (data[BF_KEYS[i]] ?? 50) / 100);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#a78bfa";
    ctx.fill();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 5; i++) {
    const lp = polar(i, 1.28);
    ctx.font = font("normal", 11);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(`${BF_LABELS[i]} ${data[BF_KEYS[i]] ?? 50}`, lp.x, lp.y);
  }
}

// ── Main ──

export async function generateShareImage(
  result: AnalysisResult,
  userName: string
): Promise<Blob> {
  const mbti = getMbtiData(result.mbtiType);
  const textW = CW - 32;

  // Pre-measure text for height calculation
  const measure = document.createElement("canvas").getContext("2d")!;

  measure.font = font("normal", 14);
  const summaryLines = wrapText(measure, result.summary, textW);

  measure.font = font("normal", 13);
  const strengthLines = result.strengths.map((s) => wrapText(measure, s, textW - 16));
  const blindLines = result.blindSpots.map((s) => wrapText(measure, s, textW - 16));
  const evidenceLines = result.evidence.map((s) => wrapText(measure, s, textW - 16));
  const funLines = wrapText(measure, result.funInsight, textW);

  const RADAR_H = 220;
  const confidence = Math.min(100, Math.max(0, result.confidence ?? 70));

  // Calculate total height
  let H = 0;
  H += 52; // branding
  H += 44; // user line
  H += 100; // badge
  H += 44; // title
  H += 30; // gap
  H += 52; // confidence card
  H += 16;
  H += 24 + summaryLines.length * 22 + 16; // summary card
  H += 16;
  H += 70; // role + style (side by side)
  H += 16;
  H += 40 + RADAR_H + 16; // radar card
  H += 16;
  H += 36 + strengthLines.reduce((a, l) => a + l.length * 20 + 6, 0) + 8; // strengths
  H += 16;
  H += 36 + blindLines.reduce((a, l) => a + l.length * 20 + 6, 0) + 8; // blind spots
  H += 16;
  H += 36 + evidenceLines.reduce((a, l) => a + l.length * 20 + 6, 0) + 8; // evidence
  H += 16;
  H += 24 + funLines.length * 20 + 20; // fun insight
  H += 50; // watermark

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W * 0.3, H);
  bg.addColorStop(0, "#1a1145");
  bg.addColorStop(1, "#0f0a1e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  let y = 0;

  // ── Branding ──
  y += 44;
  ctx.font = font("normal", 13);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textAlign = "center";
  ctx.fillText("카톡으로 보는 나의 MBTI", W / 2, y);

  // ── User line ──
  y += 44;
  ctx.font = font("normal", 15);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(`${userName}의 대화 분석 결과`, W / 2, y);

  // ── MBTI Badge ──
  y += 28;
  const bw = 260, bh = 72, bx = (W - bw) / 2;
  const badgeGrad = ctx.createLinearGradient(bx, y, bx + bw, y + bh);
  badgeGrad.addColorStop(0, mbti.accent);
  badgeGrad.addColorStop(1, "#ec4899");
  ctx.fillStyle = badgeGrad;
  roundRect(ctx, bx, y, bw, bh, 18);
  ctx.fill();
  ctx.font = font("bold", 36);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${mbti.emoji}  ${result.mbtiType}`, W / 2, y + 46);
  y += bh + 24;

  // ── Title ──
  ctx.font = font("bold", 20);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(result.title, W / 2, y);
  y += 36;

  // ── Confidence ──
  drawCard(ctx, PAD, y, CW, 40);
  ctx.textAlign = "left";
  ctx.font = font("normal", 12);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("분석 확신도", PAD + 16, y + 25);
  ctx.textAlign = "right";
  ctx.font = font("bold", 12);
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText(`${confidence}%`, PAD + CW - 16, y + 25);
  // Bar background
  const barX = PAD + 100, barW = CW - 130, barY = y + 18, barH = 6;
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  roundRect(ctx, barX, barY, barW, barH, 3);
  ctx.fill();
  // Bar fill
  const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  fillGrad.addColorStop(0, "#8b5cf6");
  fillGrad.addColorStop(1, "#ec4899");
  ctx.fillStyle = fillGrad;
  roundRect(ctx, barX, barY, barW * (confidence / 100), barH, 3);
  ctx.fill();
  y += 52 + 16;

  // ── Summary ──
  const sumH = 20 + summaryLines.length * 22 + 12;
  drawCard(ctx, PAD, y, CW, sumH);
  ctx.textAlign = "left";
  ctx.font = font("bold", 13);
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText("📝 성격 요약", PAD + 16, y + 22);
  ctx.font = font("normal", 14);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  let ty = y + 42;
  for (const line of summaryLines) {
    ctx.fillText(line, PAD + 16, ty);
    ty += 22;
  }
  y += sumH + 16;

  // ── Role + Style (side by side) ──
  const halfW = (CW - 12) / 2;
  drawCard(ctx, PAD, y, halfW, 60);
  drawCard(ctx, PAD + halfW + 12, y, halfW, 60);
  ctx.font = font("bold", 11);
  ctx.fillStyle = "#f9a8d4";
  ctx.fillText("🎭 대화 속 역할", PAD + 14, y + 22);
  ctx.fillStyle = "#67e8f9";
  ctx.fillText("🧠 인지 스타일", PAD + halfW + 24, y + 22);
  ctx.font = font("bold", 13);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(result.socialRole, PAD + 14, y + 44);
  ctx.fillText(result.cognitiveStyle, PAD + halfW + 24, y + 44);
  y += 60 + 16;

  // ── Radar ──
  const radarCardH = 36 + RADAR_H + 12;
  drawCard(ctx, PAD, y, CW, radarCardH);
  ctx.font = font("bold", 13);
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText("📊 Big Five 성격 지표", PAD + 16, y + 26);
  drawRadar(ctx, W / 2, y + 36 + RADAR_H / 2, RADAR_H / 2 - 24, result.bigFive);
  y += radarCardH + 16;

  // ── Helper: list card ──
  function drawListCard(
    label: string,
    color: string,
    bullet: string,
    items: string[][],
  ) {
    const cardH = 36 + items.reduce((a, l) => a + l.length * 20 + 6, 0) + 4;
    drawCard(ctx, PAD, y, CW, cardH);
    ctx.font = font("bold", 13);
    ctx.fillStyle = color;
    ctx.fillText(label, PAD + 16, y + 26);
    let iy = y + 48;
    for (const lines of items) {
      ctx.fillStyle = color;
      ctx.font = font("normal", 10);
      ctx.fillText(bullet, PAD + 16, iy);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = font("normal", 13);
      for (const line of lines) {
        ctx.fillText(line, PAD + 30, iy);
        iy += 20;
      }
      iy += 6;
    }
    y += cardH + 16;
  }

  drawListCard("💪 강점", "#6ee7b7", "●", strengthLines);
  drawListCard("⚠️ 블라인드 스팟", "#fcd34d", "●", blindLines);
  drawListCard("📌 분석 근거", "rgba(255,255,255,0.5)", "―", evidenceLines);

  // ── Fun Insight ──
  const funH = 24 + funLines.length * 20 + 16;
  drawCard(ctx, PAD, y, CW, funH);
  ctx.font = font("bold", 13);
  ctx.fillStyle = "#f9a8d4";
  ctx.fillText("💡 재미있는 인사이트", PAD + 16, y + 22);
  ctx.font = font("normal", 13);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ty = y + 44;
  for (const line of funLines) {
    ctx.fillText(line, PAD + 16, ty);
    ty += 20;
  }
  y += funH + 16;

  // ── Watermark ──
  ctx.textAlign = "center";
  ctx.font = font("normal", 11);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillText("카톡으로 보는 나의 MBTI 🔮", W / 2, H - 20);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("blob failed"))),
      "image/png"
    );
  });
}
