import { PHASE_TYPES } from "./constants";

/**
 * Reduces the raw phase log (one entry per completed/ended phase) into the
 * aggregate numbers the archetype engine and summary UI read from.
 *
 * log entry shape:
 *   { phaseType, plannedSec, overtimeSec, endedBy: 'manual'|'skipped',
 *     tabSwitchCount, distractedSec, timestamp }
 */
export function computeSessionMetrics(log) {
  const lockIns = log.filter((e) => e.phaseType === PHASE_TYPES.LOCK_IN);
  const breaks = log.filter(
    (e) =>
      e.phaseType === PHASE_TYPES.SHORT_BREAK ||
      e.phaseType === PHASE_TYPES.LONG_BREAK
  );

  const completedPhases = log.length;
  const avgLockInOvertimeSec = average(lockIns.map((e) => e.overtimeSec));
  const avgBreakOvertimeSec = average(breaks.map((e) => e.overtimeSec));
  const totalTabSwitches = sum(lockIns.map((e) => e.tabSwitchCount || 0));
  const totalDistractedSec = sum(lockIns.map((e) => e.distractedSec || 0));
  const totalFocusSec = sum(lockIns.map((e) => e.plannedSec));
  const totalBreakSec = sum(breaks.map((e) => e.plannedSec));
  const skippedPhases = log.filter((e) => e.endedBy === "skipped").length;

  return {
    completedPhases,
    completedLockIns: lockIns.length,
    completedBreaks: breaks.length,
    avgLockInOvertimeSec,
    avgBreakOvertimeSec,
    totalTabSwitches,
    totalDistractedSec,
    totalFocusMinutes: totalFocusSec / 60,
    totalBreakMinutes: totalBreakSec / 60,
    skippedPhases,
  };
}

function sum(nums) {
  return nums.reduce((a, b) => a + b, 0);
}

function average(nums) {
  if (nums.length === 0) return 0;
  return sum(nums) / nums.length;
}
