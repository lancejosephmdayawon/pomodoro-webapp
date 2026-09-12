"use client";

import { PHASE_LABELS, PHASE_TYPES } from "../lib/constants";
import { formatMMSS } from "../lib/format";

const PHASE_THEME = {
  [PHASE_TYPES.LOCK_IN]: {
    ring: "border-amber-400",
    text: "text-amber-300",
    chip: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  },
  [PHASE_TYPES.SHORT_BREAK]: {
    ring: "border-teal-400",
    text: "text-teal-300",
    chip: "bg-teal-400/10 text-teal-300 border-teal-400/30",
  },
  [PHASE_TYPES.LONG_BREAK]: {
    ring: "border-violet-400",
    text: "text-violet-300",
    chip: "bg-violet-400/10 text-violet-300 border-violet-400/30",
  },
};

export function TimerDisplay({ phaseType, remainingSec, cyclePosition }) {
  const theme = PHASE_THEME[phaseType] ?? PHASE_THEME[PHASE_TYPES.LOCK_IN];
  const { lockInSlot, totalSlots } = cyclePosition;

  return (
    <div className="flex flex-col items-center gap-6">
      <span
        className={`rounded-full border px-4 py-1 text-sm font-medium tracking-wide uppercase ${theme.chip}`}
      >
        {PHASE_LABELS[phaseType]}
      </span>

      <div
        className={`flex h-64 w-64 items-center justify-center rounded-full border-8 ${theme.ring} bg-black/20 sm:h-72 sm:w-72`}
      >
        <span className={`font-mono text-6xl font-bold tabular-nums ${theme.text} sm:text-7xl`}>
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
              className={[
                "h-2.5 rounded-full transition-all",
                isReward ? "w-5" : "w-2.5",
                state === "done" && "bg-amber-400",
                state === "current" && "bg-white",
                state === "upcoming" && "bg-white/20",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          );
        })}
      </div>
    </div>
  );
}
