"use client";

import { STATUS } from "../lib/constants";

export function ControlBar({
  status,
  onStart,
  onPause,
  onResume,
  onSkip,
  onEndSession,
  onOpenSettings,
}) {
  const isIdleOrFinished = status === STATUS.IDLE || status === STATUS.FINISHED;

  return (
    <div className="flex w-full max-w-sm flex-wrap items-center justify-center gap-3">
      {isIdleOrFinished && (
        <button
          type="button"
          onClick={onStart}
          className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
        >
          Start
        </button>
      )}

      {status === STATUS.RUNNING && (
        <button
          type="button"
          onClick={onPause}
          className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white transition hover:bg-white/10"
        >
          Pause
        </button>
      )}

      {status === STATUS.PAUSED && (
        <button
          type="button"
          onClick={onResume}
          className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300"
        >
          Resume
        </button>
      )}

      {(status === STATUS.RUNNING || status === STATUS.PAUSED) && (
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white transition hover:bg-white/10"
        >
          Skip
        </button>
      )}

      <button
        type="button"
        onClick={onOpenSettings}
        className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white transition hover:bg-white/10"
        aria-label="Settings"
      >
        ⚙️
      </button>

      {!isIdleOrFinished && (
        <button
          type="button"
          onClick={onEndSession}
          className="rounded-xl border border-red-400/40 px-5 py-3 font-medium text-red-300 transition hover:bg-red-400/10"
        >
          End Pomodoro
        </button>
      )}
    </div>
  );
}
