import { getContrastText } from "./color";

/**
 * Kicks off loading the watermark logo — call this ahead of time (e.g. on
 * mount) and pass the resolved image into drawSummaryCard. Keeping the load
 * out of the draw call means the actual "download" click handler can stay
 * fully synchronous, which some browsers require to allow a download
 * triggered from a click to go through without being blocked.
 */
export function preloadLogo() {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // card still works without the watermark
    img.src = "/images/logo-white.png";
  });
}

/**
 * Draws the session summary onto a canvas so it can be downloaded as a PNG
 * without pulling in a screenshot library (html2canvas etc.). Flat,
 * monochrome-first design — no gradients, no emoji; the archetype badge is
 * just its initial on a flat accent-colored tile, with the app's own mark
 * as a small watermark (pass a preloaded `logoImage`, see `preloadLogo`).
 */
export function drawSummaryCard(canvas, { archetype, metrics, dateLabel, accentColor = "#f5f5f5", logoImage }) {
  const width = 1000;
  const height = 1250;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  if (logoImage) {
    const logoSize = 44;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(logoImage, 56, 56, logoSize, logoSize);
    ctx.globalAlpha = 1;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText("POMODORO SESSION SUMMARY", width / 2, 120);

  // Flat accent badge with the archetype's initial, standing in for an icon.
  const badgeRadius = 70;
  const badgeY = 240;
  ctx.beginPath();
  ctx.arc(width / 2, badgeY, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();
  ctx.fillStyle = getContrastText(accentColor);
  ctx.font = "700 64px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(archetype.title.charAt(0), width / 2, badgeY + 4);
  ctx.textBaseline = "alphabetic";

  ctx.font = "800 56px system-ui, sans-serif";
  ctx.fillStyle = "#fafafa";
  wrapText(ctx, archetype.title, width / 2, 400, width - 160, 64);

  ctx.font = "400 28px system-ui, sans-serif";
  ctx.fillStyle = "#a1a1aa";
  wrapText(ctx, archetype.tagline, width / 2, 480, width - 220, 38);

  // Stats grid
  const stats = [
    ["Lock-ins completed", `${metrics.completedLockIns}`],
    ["Breaks completed", `${metrics.completedBreaks}`],
    ["Avg lock-in overtime", `${round1(metrics.avgLockInOvertimeSec)}s`],
    ["Avg break overtime", `${round1(metrics.avgBreakOvertimeSec)}s`],
    ["Tab switches (lock-in)", `${metrics.totalTabSwitches}`],
    ["Focus minutes", `${round1(metrics.totalFocusMinutes)}`],
    ["Break minutes", `${round1(metrics.totalBreakMinutes)}`],
    ["Phases skipped", `${metrics.skippedPhases}`],
  ];

  const startY = 660;
  const rowHeight = 70;
  const colWidth = (width - 160) / 2;
  stats.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 80 + col * colWidth;
    const y = startY + row * rowHeight;

    ctx.textAlign = "left";
    ctx.font = "400 22px system-ui, sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText(label, x, y);

    ctx.font = "700 30px system-ui, sans-serif";
    ctx.fillStyle = "#fafafa";
    ctx.fillText(value, x, y + 34);
  });

  ctx.textAlign = "center";
  ctx.font = "400 22px system-ui, sans-serif";
  ctx.fillStyle = "#52525b";
  ctx.fillText(dateLabel, width / 2, height - 60);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
