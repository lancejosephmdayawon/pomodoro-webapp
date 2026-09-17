"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Tracks tab-switch / window-blur behavior while `active` is true (meant to
 * be wired up only during lock-in phases). Accumulates into a ref rather
 * than state so it doesn't cause re-renders on every visibility flicker —
 * call `getStatsAndReset()` when the phase ends to read + clear the tally.
 */
export function useVisibilityTracker(active) {
  const hiddenAtRef = useRef(null);
  const statsRef = useRef({ tabSwitchCount: 0, distractedSec: 0 });

  useEffect(() => {
    if (!active) {
      statsRef.current = { tabSwitchCount: 0, distractedSec: 0 };
      hiddenAtRef.current = null;
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        statsRef.current.tabSwitchCount += 1;
      } else if (hiddenAtRef.current != null) {
        statsRef.current.distractedSec +=
          (Date.now() - hiddenAtRef.current) / 1000;
        hiddenAtRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active]);

  // Stable across renders (no deps — everything it touches lives in refs) so
  // consumers that depend on it directly (e.g. PomodoroApp) don't get a new
  // function identity every render.
  const getStatsAndReset = useCallback(() => {
    // If the tab is still hidden right as we read (e.g. phase ended while
    // away), fold in the time elapsed so far before resetting.
    if (hiddenAtRef.current != null) {
      statsRef.current.distractedSec +=
        (Date.now() - hiddenAtRef.current) / 1000;
      hiddenAtRef.current = Date.now();
    }
    const stats = { ...statsRef.current };
    statsRef.current = { tabSwitchCount: 0, distractedSec: 0 };
    return stats;
  }, []);

  return { getStatsAndReset };
}
