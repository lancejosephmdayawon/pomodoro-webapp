"use client";

import { formatSeconds1dp } from "../lib/format";

export function OvertimeBanner({
  keyword,
  overtimeSec,
  voiceSupported,
  voiceListening,
  onAcknowledge,
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
      <p className="text-lg font-semibold text-white">
        Say <span className="text-amber-300">&ldquo;{keyword}&rdquo;</span> to continue
      </p>

      <p className="font-mono text-3xl font-bold tabular-nums text-red-400">
        +{formatSeconds1dp(overtimeSec)}
      </p>
      <p className="text-xs text-white/50">time you&apos;ve kept the buzzer waiting</p>

      {voiceSupported ? (
        <div className="flex items-center gap-2 text-sm text-white/70">
          <span
            className={`h-2 w-2 rounded-full ${voiceListening ? "animate-pulse bg-emerald-400" : "bg-white/30"}`}
          />
          {voiceListening ? "Listening…" : "Mic not active"}
        </div>
      ) : (
        <p className="text-xs text-amber-300/80">
          Voice control isn&apos;t supported in this browser — use the button below.
        </p>
      )}

      <button
        type="button"
        onClick={() => onAcknowledge("manual")}
        className="mt-1 w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300"
      >
        I&apos;m done 🎙️
      </button>
    </div>
  );
}
