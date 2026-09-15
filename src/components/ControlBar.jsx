"use client";

import { Pause, Play, Settings, SkipForward, Square } from "lucide-react";
import { STATUS } from "../lib/constants";
import { getContrastText } from "../lib/color";

const iconButton =
  "flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-medium text-zinc-200 transition hover:bg-white/10";

export function ControlBar({
  status,
  onStart,
  onPause,
  onResume,
  onSkip,
  onEndSession,
  onOpenSettings,
  accentColor,
}) {
  const isIdleOrFinished = status === STATUS.IDLE || status === STATUS.FINISHED;

  return (
    <div className="flex w-full max-w-sm flex-wrap items-center justify-center gap-3">
      {isIdleOrFinished && (
        <button
          type="button"
          onClick={onStart}
          className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition hover:opacity-90"
          style={{ backgroundColor: accentColor, color: getContrastText(accentColor) }}
        >
          <Play className="h-4 w-4" strokeWidth={2} fill="currentColor" />
          Start
        </button>
      )}

      {status === STATUS.RUNNING && (
        <button type="button" onClick={onPause} className={iconButton}>
          <Pause className="h-4 w-4" strokeWidth={2} />
          Pause
        </button>
      )}

      {status === STATUS.PAUSED && (
        <button
          type="button"
          onClick={onResume}
          className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition hover:opacity-90"
          style={{ backgroundColor: accentColor, color: getContrastText(accentColor) }}
        >
          <Play className="h-4 w-4" strokeWidth={2} fill="currentColor" />
          Resume
        </button>
      )}

      {(status === STATUS.RUNNING || status === STATUS.PAUSED) && (
        <button type="button" onClick={onSkip} className={iconButton}>
          <SkipForward className="h-4 w-4" strokeWidth={2} />
          Skip
        </button>
      )}

      <button
        type="button"
        onClick={onOpenSettings}
        className={iconButton}
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" strokeWidth={2} />
      </button>

      {!isIdleOrFinished && (
        <button
          type="button"
          onClick={onEndSession}
          className="flex items-center gap-2 rounded-xl border border-red-500/30 px-5 py-3 font-medium text-red-400 transition hover:bg-red-500/10"
        >
          <Square className="h-4 w-4" strokeWidth={2} />
          End Pomodoro
        </button>
      )}
    </div>
  );
}
