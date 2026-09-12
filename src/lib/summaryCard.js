/**
 * Draws the session summary onto a canvas so it can be downloaded as a PNG
 * without pulling in a screenshot library (html2canvas etc.). Pure drawing
 * function — the caller owns creating/appending the canvas and the download.
 */
export function drawSummaryCard(canvas, { archetype, metrics, dateLabel }) {
  const width = 1000;
  const height = 1250;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#1e1b4b");
  bg.addColorStop(1, "#0f172a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Card border accent
  ctx.strokeStyle = "rgba(250, 204, 21, 0.5)";
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  ctx.textAlign = "center";
  ctx.fillStyle = "#facc15";
  ctx.font = "600 32px system-ui, sans-serif";
  ctx.fillText("POMODORO SESSION SUMMARY", width / 2, 130);

  ctx.font = "700 130px system-ui, sans-serif";
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(archetype.emoji, width / 2, 300);

  ctx.font = "800 64px system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  wrapText(ctx, archetype.title, width / 2, 400, width - 160, 70);

  ctx.font = "400 30px system-ui, sans-serif";
  ctx.fillStyle = "#cbd5e1";
  wrapText(ctx, archetype.tagline, width / 2, 490, width - 200, 40);

  // Stats grid
  const stats = [
    ["Lock-ins completed", `${metrics.completedLockIns}`],
    ["Breaks completed", `${metrics.completedBreaks}`],
    ["Avg lock-in overtime", `${round1(metrics.avgLockInOvertimeSec)}s`],
    ["Avg break overtime", `${round1(metrics.avgBreakOvertimeSec)}s`],
    ["Tab switches (lock-in)", `${metrics.totalTabSwitches}`],
    ["Focus minutes", `${round1(metrics.totalFocusMinutes)}`],
    ["Break minutes", `${round1(metrics.totalBreakMinutes)}`],
    ["Voice acknowledgments", `${Math.round(metrics.voiceUsageRate * 100)}%`],
  ];

  const startY = 640;
  const rowHeight = 70;
  const colWidth = (width - 160) / 2;
  stats.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 80 + col * colWidth;
    const y = startY + row * rowHeight;

    ctx.textAlign = "left";
    ctx.font = "400 24px system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(label, x, y);

    ctx.font = "700 32px system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(value, x, y + 36);
  });

  ctx.textAlign = "center";
  ctx.font = "400 24px system-ui, sans-serif";
  ctx.fillStyle = "#64748b";
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
