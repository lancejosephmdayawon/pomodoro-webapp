"use client";

import { Mic, MicOff } from "lucide-react";
import { formatSeconds1dp } from "../lib/format";
import { getContrastText } from "../lib/color";

export function OvertimeBanner({
  keyword,
  overtimeSec,
  voiceSupported,
  voiceListening,
  onAcknowledge,
  accentColor,
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <p className="text-lg font-semibold text-white">
        Say <span style={{ color: accentColor }}>&ldquo;{keyword}&rdquo;</span> to continue
      </p>

      <p className="font-mono text-3xl font-bold tabular-nums text-zinc-100">
        +{formatSeconds1dp(overtimeSec)}
      </p>
      <p className="text-xs text-zinc-500">time you&apos;ve kept the buzzer waiting</p>

      {voiceSupported ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          {voiceListening ? (
            <Mic className="h-4 w-4 animate-pulse" style={{ color: accentColor }} strokeWidth={1.75} />
          ) : (
            <MicOff className="h-4 w-4 text-zinc-600" strokeWidth={1.75} />
          )}
          {voiceListening ? "Listening…" : "Mic not active"}
        </div>
      ) : (
        <p className="text-xs text-zinc-500">
          Voice control isn&apos;t supported in this browser — use the button below.
        </p>
      )}

      <button
        type="button"
        onClick={() => onAcknowledge("manual")}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition hover:opacity-90"
        style={{ backgroundColor: accentColor, color: getContrastText(accentColor) }}
      >
        <Mic className="h-4 w-4" strokeWidth={2} />
        I&apos;m done
      </button>
    </div>
  );
}
