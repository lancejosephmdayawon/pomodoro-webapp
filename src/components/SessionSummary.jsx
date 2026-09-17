"use client";

import { useEffect, useRef } from "react";
import { Download, RotateCcw } from "lucide-react";
import { drawSummaryCard, preloadLogo } from "../lib/summaryCard";
import { getContrastText } from "../lib/color";

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

export function SessionSummary({ metrics, archetype, onNewSession, accentColor }) {
  const canvasRef = useRef(null);
  const logoRef = useRef(null);
  const Icon = archetype.icon;

  // Preload the watermark ahead of the click so the download handler below
  // can stay fully synchronous — some browsers won't honor a download
  // triggered from a click if there's an async gap (e.g. an image fetch)
  // between the click and the `a.click()` call.
  useEffect(() => {
    let cancelled = false;
    preloadLogo().then((img) => {
      if (!cancelled) logoRef.current = img;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    drawSummaryCard(canvas, {
      archetype,
      metrics,
      dateLabel: new Date().toLocaleString(),
      accentColor,
      logoImage: logoRef.current,
    });

    const link = document.createElement("a");
    link.download = "pomodoro-session-summary.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
      <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
        Session Summary
      </p>

      <span
        className="flex h-16 w-16 items-center justify-center rounded-full border"
        style={{ borderColor: accentColor, backgroundColor: `${accentColor}1a` }}
      >
        <Icon className="h-7 w-7" style={{ color: accentColor }} strokeWidth={1.75} />
      </span>
      <h2 className="text-2xl font-bold text-white">{archetype.title}</h2>
      <p className="text-sm text-zinc-400">{archetype.tagline}</p>

      <ul className="flex flex-col gap-1 text-sm text-zinc-300">
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
        <StatTile label="Phases skipped" value={metrics.skippedPhases} />
      </div>

      <div className="mt-2 flex w-full gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-medium text-zinc-200 transition hover:bg-white/10"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Download image
        </button>
        <button
          type="button"
          onClick={onNewSession}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition hover:opacity-90"
          style={{ backgroundColor: accentColor, color: getContrastText(accentColor) }}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          New session
        </button>
      </div>
    </div>
  );
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
