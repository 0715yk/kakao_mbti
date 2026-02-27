import { AnalysisResult, BigFive } from "./types";
import { getMbtiData } from "./mbtiData";

const W = 640;
const PAD = 44;
const CW = W - PAD * 2;

const CARD_PX = 16;
const LABEL_Y = 28;
const CONTENT_Y = 50;
const CONTENT_PAD_BOTTOM = 16;
const CARD_GAP = 14;
const LIST_LINE_H = 20;
const LIST_ITEM_GAP = 8;
const SUMMARY_LINE_H = 22;

const font = (weight: string, size: number) =>
  `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
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

function listContentH(items: string[][]): number {
  let h = 0;
  for (let i = 0; i < items.length; i++) {
    h += items[i].length * LIST_LINE_H;
    if (i < items.length - 1) h += LIST_ITEM_GAP;
  }
  return h;
}

function listCardH(items: string[][]): number {
  return CONTENT_Y + listContentH(items) + CONTENT_PAD_BOTTOM;
}

function textCardH(lineCount: number, lineH: number): number {
  return CONTENT_Y + lineCount * lineH + CONTENT_PAD_BOTTOM;
}

// ── Radar ──

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
  userName: string,
): Promise<Blob> {
  const mbti = getMbtiData(result.mbtiType);
  const textW = CW - CARD_PX * 2;
  const listTextW = textW - 20;

  const measure = document.createElement("canvas").getContext("2d")!;

  measure.font = font("normal", 14);
  const summaryLines = wrapText(measure, result.summary, textW);

  measure.font = font("normal", 13);
  const strengthLines = result.strengths.map((s) => wrapText(measure, s, listTextW));
  const blindLines = result.blindSpots.map((s) => wrapText(measure, s, listTextW));
  const evidenceLines = result.evidence.map((s) => wrapText(measure, s, listTextW));
  const funLines = wrapText(measure, result.funInsight, textW);

  const RADAR_H = 220;
  const confidence = Math.min(100, Math.max(0, result.confidence ?? 70));

  const confCardH = 44;
  const sumCardH = textCardH(summaryLines.length, SUMMARY_LINE_H);
  const roleCardH = 62;
  const radarCardH = CONTENT_Y + RADAR_H + CONTENT_PAD_BOTTOM;
  const strCardH = listCardH(strengthLines);
  const bsCardH = listCardH(blindLines);
  const eviCardH = listCardH(evidenceLines);
  const funCardH = textCardH(funLines.length, LIST_LINE_H);

  let H = 0;
  H += 44;                            // branding
  H += 40;                            // user line
  H += 28 + 72 + 22;                  // badge
  H += 30;                            // title
  H += CARD_GAP;
  H += confCardH + CARD_GAP;
  H += sumCardH + CARD_GAP;
  H += roleCardH + CARD_GAP;
  H += radarCardH + CARD_GAP;
  H += strCardH + CARD_GAP;
  H += bsCardH + CARD_GAP;
  H += eviCardH + CARD_GAP;
  H += funCardH + CARD_GAP;
  H += 40;                            // watermark

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

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
  y += 40;
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
  y += bh + 22;

  // ── Title ──
  ctx.font = font("bold", 20);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(result.title, W / 2, y);
  y += 30 + CARD_GAP;

  // ── Confidence ──
  ctx.textAlign = "left";
  drawCard(ctx, PAD, y, CW, confCardH);
  ctx.font = font("normal", 12);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("분석 확신도", PAD + CARD_PX, y + 27);
  ctx.textAlign = "right";
  ctx.font = font("bold", 12);
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText(`${confidence}%`, PAD + CW - CARD_PX, y + 27);
  const barX = PAD + 100, barW = CW - 130, barY = y + 20, barH = 6;
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  roundRect(ctx, barX, barY, barW, barH, 3);
  ctx.fill();
  const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  fillGrad.addColorStop(0, "#8b5cf6");
  fillGrad.addColorStop(1, "#ec4899");
  ctx.fillStyle = fillGrad;
  roundRect(ctx, barX, barY, barW * (confidence / 100), barH, 3);
  ctx.fill();
  y += confCardH + CARD_GAP;

  // ── Summary ──
  ctx.textAlign = "left";
  drawCard(ctx, PAD, y, CW, sumCardH);
  ctx.font = font("bold", 13);
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText("📝 성격 요약", PAD + CARD_PX, y + LABEL_Y);
  ctx.font = font("normal", 14);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  let ty = y + CONTENT_Y;
  for (const line of summaryLines) {
    ctx.fillText(line, PAD + CARD_PX, ty);
    ty += SUMMARY_LINE_H;
  }
  y += sumCardH + CARD_GAP;

  // ── Role + Style ──
  const halfW = (CW - 12) / 2;
  drawCard(ctx, PAD, y, halfW, roleCardH);
  drawCard(ctx, PAD + halfW + 12, y, halfW, roleCardH);
  ctx.font = font("bold", 11);
  ctx.fillStyle = "#f9a8d4";
  ctx.fillText("🎭 대화 속 역할", PAD + CARD_PX, y + 24);
  ctx.fillStyle = "#67e8f9";
  ctx.fillText("🧠 인지 스타일", PAD + halfW + 12 + CARD_PX, y + 24);
  ctx.font = font("bold", 13);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(result.socialRole, PAD + CARD_PX, y + 44);
  ctx.fillText(result.cognitiveStyle, PAD + halfW + 12 + CARD_PX, y + 44);
  y += roleCardH + CARD_GAP;

  // ── Radar ──
  drawCard(ctx, PAD, y, CW, radarCardH);
  ctx.font = font("bold", 13);
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText("📊 Big Five 성격 지표", PAD + CARD_PX, y + LABEL_Y);
  drawRadar(ctx, W / 2, y + CONTENT_Y + RADAR_H / 2, RADAR_H / 2 - 24, result.bigFive);
  y += radarCardH + CARD_GAP;

  // ── List card helper ──
  function drawListCard(
    label: string, color: string, bullet: string,
    items: string[][], cardH: number,
  ) {
    drawCard(ctx, PAD, y, CW, cardH);
    ctx.font = font("bold", 13);
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.fillText(label, PAD + CARD_PX, y + LABEL_Y);

    let iy = y + CONTENT_Y;
    for (let idx = 0; idx < items.length; idx++) {
      const lines = items[idx];
      ctx.fillStyle = color;
      ctx.font = font("normal", 10);
      ctx.fillText(bullet, PAD + CARD_PX, iy);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = font("normal", 13);
      for (const line of lines) {
        ctx.fillText(line, PAD + CARD_PX + 18, iy);
        iy += LIST_LINE_H;
      }
      if (idx < items.length - 1) iy += LIST_ITEM_GAP;
    }
    y += cardH + CARD_GAP;
  }

  drawListCard("💪 강점", "#6ee7b7", "●", strengthLines, strCardH);
  drawListCard("⚠️ 블라인드 스팟", "#fcd34d", "●", blindLines, bsCardH);
  drawListCard("📌 분석 근거", "rgba(255,255,255,0.5)", "―", evidenceLines, eviCardH);

  // ── Fun Insight ──
  drawCard(ctx, PAD, y, CW, funCardH);
  ctx.font = font("bold", 13);
  ctx.fillStyle = "#f9a8d4";
  ctx.textAlign = "left";
  ctx.fillText("💡 재미있는 인사이트", PAD + CARD_PX, y + LABEL_Y);
  ctx.font = font("normal", 13);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ty = y + CONTENT_Y;
  for (const line of funLines) {
    ctx.fillText(line, PAD + CARD_PX, ty);
    ty += LIST_LINE_H;
  }
  y += funCardH + CARD_GAP;

  // ── Watermark ──
  ctx.textAlign = "center";
  ctx.font = font("normal", 11);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillText("카톡으로 보는 나의 MBTI 🔮", W / 2, y + 16);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("blob failed"))),
      "image/png",
    );
  });
}
