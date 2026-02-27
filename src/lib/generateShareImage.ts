import { AnalysisResult, BigFive } from "./types";
import { getMbtiData } from "./mbtiData";

const W = 640;
const PAD = 44;
const CW = W - PAD * 2;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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

const BF_LABELS = ["개방성", "성실성", "외향성", "친화성", "신경성"];
const BF_KEYS: (keyof BigFive)[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

function drawRadar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  data: BigFive
) {
  const polar = (i: number, scale: number) => ({
    x: cx + r * scale * Math.cos((Math.PI * 2 * i) / 5 - Math.PI / 2),
    y: cy + r * scale * Math.sin((Math.PI * 2 * i) / 5 - Math.PI / 2),
  });

  // Grid
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

  // Axes
  for (let i = 0; i < 5; i++) {
    const p = polar(i, 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();
  }

  // Data fill
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

  // Dots
  for (let i = 0; i < 5; i++) {
    const p = polar(i, (data[BF_KEYS[i]] ?? 50) / 100);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#a78bfa";
    ctx.fill();
  }

  // Labels
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 5; i++) {
    const lp = polar(i, 1.25);
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(`${BF_LABELS[i]} ${data[BF_KEYS[i]] ?? 50}`, lp.x, lp.y);
  }
}

const font = (weight: string, size: number) =>
  `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;

export async function generateShareImage(
  result: AnalysisResult,
  userName: string
): Promise<Blob> {
  const mbti = getMbtiData(result.mbtiType);

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = W;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.font = font("normal", 14);
  const summaryLines = wrapText(tempCtx, result.summary, CW - 32);

  const RADAR_SIZE = 220;
  const H =
    60 + // top
    50 + // user line
    90 + // badge
    44 + // title
    36 + // gap
    32 + summaryLines.length * 22 + 20 + // summary card
    16 + // gap
    40 + RADAR_SIZE + 20 + // radar card
    60; // watermark + bottom

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

  // Branding
  y += 44;
  ctx.font = font("normal", 13);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textAlign = "center";
  ctx.fillText("카톡으로 보는 나의 MBTI", W / 2, y);

  // User line
  y += 44;
  ctx.font = font("normal", 15);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(`${userName}의 대화 분석 결과`, W / 2, y);

  // Badge
  y += 28;
  const bw = 260,
    bh = 72,
    bx = (W - bw) / 2;
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

  // Title
  ctx.font = font("bold", 20);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(result.title, W / 2, y);
  y += 36;

  // Summary card
  const sumH = 20 + summaryLines.length * 22 + 16;
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  roundRect(ctx, PAD, y, CW, sumH, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.font = font("normal", 14);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  let ty = y + 26;
  for (const line of summaryLines) {
    ctx.fillText(line, PAD + 16, ty);
    ty += 22;
  }
  y += sumH + 16;

  // Radar card
  const radarCardH = 36 + RADAR_SIZE + 16;
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  roundRect(ctx, PAD, y, CW, radarCardH, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.font = font("bold", 13);
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText("📊 Big Five", PAD + 16, y + 26);
  drawRadar(ctx, W / 2, y + 36 + RADAR_SIZE / 2, RADAR_SIZE / 2 - 20, result.bigFive);

  // Watermark
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
