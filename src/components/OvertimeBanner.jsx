"use client";

import { Check } from "lucide-react";
import { formatSeconds1dp } from "../lib/format";
import { getContrastText } from "../lib/color";

export function OvertimeBanner({ overtimeSec, onAcknowledge, accentColor }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <p className="text-lg font-semibold text-white">Time&apos;s up!</p>

      <p className="font-mono text-3xl font-bold tabular-nums text-zinc-100">
        +{formatSeconds1dp(overtimeSec)}
      </p>
      <p className="text-xs text-zinc-500">time you&apos;ve kept the buzzer waiting</p>

      <button
        type="button"
        onClick={onAcknowledge}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition hover:opacity-90"
        style={{ backgroundColor: accentColor, color: getContrastText(accentColor) }}
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
        I&apos;m done
      </button>
    </div>
  );
}
