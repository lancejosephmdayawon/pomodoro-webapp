/** Small color helpers for theming — no dependency needed for this much math. */

function hexToRgb(hex) {
  const clean = (hex || "").replace("#", "").trim();
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const num = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Returns near-black or near-white, whichever reads better on `hex`. */
export function getContrastText(hex) {
  const rgb = hexToRgb(hex) ?? { r: 245, g: 245, b: 245 };
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? "#0a0a0a" : "#fafafa";
}

/** hex + alpha (0-1) -> rgba() string, for translucent borders/backgrounds. */
export function withAlpha(hex, alpha) {
  const rgb = hexToRgb(hex) ?? { r: 245, g: 245, b: 245 };
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
