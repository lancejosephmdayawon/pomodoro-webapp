"use client";

import { PHASE_LABELS, PHASE_TYPES } from "../lib/constants";

const CHART_MAX_BARS = 14; // keep bars readable in a fixed-width card; show the tail end

function phaseColor(phaseType, theme) {
  if (phaseType === PHASE_TYPES.SHORT_BREAK) return theme.secondaryColor;
  if (phaseType === PHASE_TYPES.LONG_BREAK) return theme.tertiaryColor;
  return theme.primaryColor;
}

/** A bar with 4px-rounded top corners, square at the baseline (mark spec). */
function roundedTopBarPath(x, yTop, width, height, radius) {
  const r = Math.min(radius, width / 2, height);
  const yBottom = yTop + height;
  return [
    `M ${x} ${yBottom}`,
    `L ${x} ${yTop + r}`,
    `Q ${x} ${yTop} ${x + r} ${yTop}`,
    `L ${x + width - r} ${yTop}`,
    `Q ${x + width} ${yTop} ${x + width} ${yTop + r}`,
    `L ${x + width} ${yBottom}`,
    "Z",
  ].join(" ");
}

/**
 * Per-phase overtime across the session — how long the buzzer ran before
 * each acknowledgment, in order. Bars are colored by phase type using the
 * same accent colors as the rest of the app (lock-in / short break / long
 * break), so the chart reads consistently with the timer itself.
 */
export function OvertimeChart({ log, theme }) {
  if (log.length === 0) return null;

  const shown = log.slice(-CHART_MAX_BARS);
  const truncated = log.length > shown.length;

  const width = 300;
  const height = 96;
  const baselineY = height - 18; // room for the baseline + phase-index ticks below
  const topPadding = 20; // room for the "extreme" label above the tallest bar

  const maxOvertime = Math.max(...shown.map((e) => e.overtimeSec), 1);
  const plotHeight = baselineY - topPadding;

  const gap = 4;
  const barWidth = Math.min(24, (width - gap * (shown.length - 1)) / shown.length);
  const rowWidth = shown.length * barWidth + (shown.length - 1) * gap;
  const startX = (width - rowWidth) / 2;

  const maxIndex = shown.reduce(
    (best, e, i) => (e.overtimeSec > shown[best].overtimeSec ? i : best),
    0
  );

  const presentTypes = [...new Set(shown.map((e) => e.phaseType))];

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-left text-xs text-zinc-500">
        Overtime per phase{truncated ? ` (last ${CHART_MAX_BARS})` : ""}
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Overtime in seconds for each phase of the session, in order"
      >
        <line
          x1={0}
          y1={baselineY}
          x2={width}
          y2={baselineY}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
        />
        {shown.map((entry, i) => {
          const x = startX + i * (barWidth + gap);
          const barHeight = Math.max(2, (entry.overtimeSec / maxOvertime) * plotHeight);
          const yTop = baselineY - barHeight;
          const color = phaseColor(entry.phaseType, theme);
          const isExtreme = i === maxIndex && entry.overtimeSec > 0;

          return (
            <g key={i} className="transition-opacity hover:opacity-75">
              {isExtreme && (
                <text
                  x={x + barWidth / 2}
                  y={yTop - 6}
                  textAnchor="middle"
                  className="fill-zinc-400 text-[8px]"
                >
                  {round1(entry.overtimeSec)}s
                </text>
              )}
              <path d={roundedTopBarPath(x, yTop, barWidth, barHeight, 4)} fill={color}>
                <title>
                  {`${PHASE_LABELS[entry.phaseType]} ${i + 1}: ${round1(entry.overtimeSec)}s overtime`}
                </title>
              </path>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {presentTypes.map((type) => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: phaseColor(type, theme) }}
            />
            {PHASE_LABELS[type]}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Focus vs. break time, part-to-whole. A single stacked bar rather than a
 * pie — two categories read faster as adjacent lengths than as wedge angles.
 */
export function TimeSplitChart({ metrics, theme }) {
  const focusMin = metrics.totalFocusMinutes;
  const breakMin = metrics.totalBreakMinutes;
  const total = focusMin + breakMin;

  const width = 300;
  const barHeight = 22;
  const gapPx = 2;

  const focusWidth = total > 0 ? (focusMin / total) * width : width / 2;
  const breakWidth = total > 0 ? width - focusWidth : width / 2;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex justify-center gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
          Focus — {round1(focusMin)}m
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
          Break — {round1(breakMin)}m
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${barHeight}`}
        className="w-full"
        role="img"
        aria-label={`${round1(focusMin)} focus minutes versus ${round1(breakMin)} break minutes`}
      >
        {total <= 0 ? (
          <rect width={width} height={barHeight} rx={4} fill="rgba(255,255,255,0.06)" />
        ) : (
          <>
            <rect
              x={0}
              y={0}
              width={Math.max(0, focusWidth - gapPx / 2)}
              height={barHeight}
              rx={4}
              fill={theme.primaryColor}
            >
              <title>{`Focus: ${round1(focusMin)} minutes`}</title>
            </rect>
            <rect
              x={focusWidth + gapPx / 2}
              y={0}
              width={Math.max(0, breakWidth - gapPx / 2)}
              height={barHeight}
              rx={4}
              fill={theme.secondaryColor}
            >
              <title>{`Break: ${round1(breakMin)} minutes`}</title>
            </rect>
          </>
        )}
      </svg>
    </div>
  );
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
