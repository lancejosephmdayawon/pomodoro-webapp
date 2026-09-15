"use client";

import { PHASE_LABELS, PHASE_TYPES } from "../lib/constants";
import { formatMMSS } from "../lib/format";
import { withAlpha } from "../lib/color";

export function TimerDisplay({ phaseType, remainingSec, cyclePosition, theme }) {
  const accent =
    phaseType === PHASE_TYPES.SHORT_BREAK
      ? theme.secondaryColor
      : phaseType === PHASE_TYPES.LONG_BREAK
        ? theme.tertiaryColor
        : theme.primaryColor;

  const { lockInSlot, totalSlots } = cyclePosition;

  return (
    <div className="flex flex-col items-center gap-6">
      <span
        className="rounded-full border px-4 py-1 text-xs font-medium tracking-widest uppercase"
        style={{ color: accent, borderColor: withAlpha(accent, 0.35), backgroundColor: withAlpha(accent, 0.08) }}
      >
        {PHASE_LABELS[phaseType]}
      </span>

      <div
        className="flex h-64 w-64 items-center justify-center rounded-full border-[6px] bg-white/[0.02] sm:h-72 sm:w-72"
        style={{ borderColor: accent }}
      >
        <span
          className="font-mono text-6xl font-bold tabular-nums sm:text-7xl"
          style={{ color: accent }}
        >
          {formatMMSS(remainingSec)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const slot = i + 1;
          const isReward = slot === totalSlots;
          const state =
            slot < lockInSlot ? "done" : slot === lockInSlot ? "current" : "upcoming";
          return (
            <span
              key={i}
              title={isReward ? "Long break" : `Lock-in ${slot}`}
              className={`h-2.5 rounded-full transition-all ${isReward ? "w-5" : "w-2.5"}`}
              style={{
                backgroundColor:
                  state === "upcoming" ? "rgba(255,255,255,0.12)" : theme.primaryColor,
                opacity: state === "current" ? 1 : state === "done" ? 0.7 : 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
