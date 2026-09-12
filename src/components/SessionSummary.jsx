"use client";

import { useRef } from "react";
import { drawSummaryCard } from "../lib/summaryCard";

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/50">{label}</p>
    </div>
  );
}

export function SessionSummary({ metrics, archetype, onNewSession }) {
  const canvasRef = useRef(null);

  const handleDownload = () => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    drawSummaryCard(canvas, {
      archetype,
      metrics,
      dateLabel: new Date().toLocaleString(),
    });

    const link = document.createElement("a");
    link.download = "pomodoro-session-summary.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-white/40">
        Session Summary
      </p>

      <div className="text-6xl">{archetype.emoji}</div>
      <h2 className="text-2xl font-bold text-white">{archetype.title}</h2>
      <p className="text-sm text-white/60">{archetype.tagline}</p>

      <ul className="flex flex-col gap-1 text-sm text-amber-300/90">
        {archetype.receipts.map((r) => (
          <li key={r}>“{r}”</li>
        ))}
      </ul>

      <div className="grid w-full grid-cols-2 gap-2">
        <StatTile label="Lock-ins completed" value={metrics.completedLockIns} />
        <StatTile label="Breaks completed" value={metrics.completedBreaks} />
        <StatTile
          label="Avg lock-in overtime"
          value={`${round1(metrics.avgLockInOvertimeSec)}s`}
        />
        <StatTile
          label="Avg break overtime"
          value={`${round1(metrics.avgBreakOvertimeSec)}s`}
        />
        <StatTile label="Tab switches" value={metrics.totalTabSwitches} />
        <StatTile
          label="Voice acknowledgments"
          value={`${Math.round(metrics.voiceUsageRate * 100)}%`}
        />
      </div>

      <div className="mt-2 flex w-full gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 rounded-xl border border-white/20 px-4 py-3 font-medium text-white transition hover:bg-white/10"
        >
          Download image
        </button>
        <button
          type="button"
          onClick={onNewSession}
          className="flex-1 rounded-xl bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300"
        >
          New session
        </button>
      </div>
    </div>
  );
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
