import { PHASE_TYPES } from "./constants";

/**
 * Pure function mapping a running phase index (0, 1, 2, ...) to a phase
 * definition, given the user's settings. The sequence is:
 *   (LockIn -> ShortBreak) x cyclesBeforeLongBreak, then LockIn -> LongBreak,
 * repeating forever. Index 0 is always a LockIn.
 *
 * Kept pure + deterministic so the UI never needs to special-case the
 * "5th round" — it just asks "what's phase N?".
 */
export function getPhaseForIndex(index, settings) {
  const cycles = Math.max(1, Math.floor(settings.cyclesBeforeLongBreak) || 1);
  const blockLength = cycles * 2 + 2; // N x (lockIn, shortBreak) + (lockIn, longBreak)
  const positionInBlock = ((index % blockLength) + blockLength) % blockLength;

  const isLockIn = positionInBlock % 2 === 0;
  if (isLockIn) {
    return {
      type: PHASE_TYPES.LOCK_IN,
      durationSec: minutesToSeconds(settings.lockInMinutes),
    };
  }

  const isLastBreakInBlock = positionInBlock === blockLength - 1;
  if (isLastBreakInBlock) {
    return {
      type: PHASE_TYPES.LONG_BREAK,
      durationSec: minutesToSeconds(settings.longBreakMinutes),
    };
  }

  return {
    type: PHASE_TYPES.SHORT_BREAK,
    durationSec: minutesToSeconds(settings.shortBreakMinutes),
  };
}

/** Which lock-in "slot" (1-based, resets each block) a phase index falls in. Handy for progress dots. */
export function getCyclePosition(index, settings) {
  const cycles = Math.max(1, Math.floor(settings.cyclesBeforeLongBreak) || 1);
  const blockLength = cycles * 2 + 2;
  const positionInBlock = ((index % blockLength) + blockLength) % blockLength;
  const lockInSlot = Math.floor(positionInBlock / 2) + 1; // 1..cycles+1
  return { lockInSlot, totalSlots: cycles + 1 };
}

function minutesToSeconds(minutes) {
  const n = Number(minutes);
  return Math.max(1, Math.round((Number.isFinite(n) ? n : 0) * 60));
}
