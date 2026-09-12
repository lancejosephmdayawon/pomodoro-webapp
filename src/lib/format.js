export function formatMMSS(totalSeconds) {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatSeconds1dp(totalSeconds) {
  return `${(Math.round(totalSeconds * 10) / 10).toFixed(1)}s`;
}
