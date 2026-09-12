"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { STATUS, PHASE_TYPES } from "../lib/constants";
import { getPhaseForIndex, getCyclePosition } from "../lib/phaseSchedule";

const initialState = {
  status: STATUS.IDLE,
  phaseIndex: 0,
  phaseType: PHASE_TYPES.LOCK_IN,
  phaseDurationSec: 0,
  phaseEndAt: null, // ms timestamp the running phase ends at
  pausedRemainingSec: null,
  overtimeStartAt: null, // ms timestamp the buzzer/ack-wait started
  log: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "START_SESSION":
      return {
        ...initialState,
        status: STATUS.RUNNING,
        phaseIndex: 0,
        phaseType: action.phase.type,
        phaseDurationSec: action.phase.durationSec,
        phaseEndAt: Date.now() + action.phase.durationSec * 1000,
      };

    case "PAUSE": {
      if (state.status !== STATUS.RUNNING) return state;
      const remainingMs = Math.max(0, state.phaseEndAt - Date.now());
      return {
        ...state,
        status: STATUS.PAUSED,
        pausedRemainingSec: remainingMs / 1000,
        phaseEndAt: null,
      };
    }

    case "RESUME": {
      if (state.status !== STATUS.PAUSED) return state;
      return {
        ...state,
        status: STATUS.RUNNING,
        phaseEndAt: Date.now() + (state.pausedRemainingSec ?? 0) * 1000,
        pausedRemainingSec: null,
      };
    }

    case "TIME_UP": {
      if (state.status !== STATUS.RUNNING) return state;
      return {
        ...state,
        status: STATUS.AWAITING_ACK,
        overtimeStartAt: Date.now(),
        phaseEndAt: null,
      };
    }

    // Used both when a phase is acknowledged (voice/manual) and when it's
    // manually skipped — caller supplies the finished log `entry` and the
    // already-computed `nextPhase` to run.
    case "ADVANCE":
      return {
        ...state,
        log: [...state.log, action.entry],
        phaseIndex: state.phaseIndex + 1,
        phaseType: action.nextPhase.type,
        phaseDurationSec: action.nextPhase.durationSec,
        phaseEndAt: Date.now() + action.nextPhase.durationSec * 1000,
        status: STATUS.RUNNING,
        overtimeStartAt: null,
      };

    case "END_SESSION":
      return {
        ...state,
        status: STATUS.FINISHED,
        phaseEndAt: null,
        overtimeStartAt: null,
      };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

/**
 * Drives the phase-by-phase countdown state machine described in the plan.
 * Countdown is timestamp-based (`phaseEndAt`), not a naive per-tick
 * decrement, so it can't drift from background-tab throttling.
 *
 * `speedFactor` is a dev-only multiplier (see `?fast=1` in PomodoroApp) for
 * quickly testing the full loop without waiting real minutes.
 */
export function usePomodoroEngine(settings, { speedFactor = 1 } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.status !== STATUS.RUNNING && state.status !== STATUS.AWAITING_ACK) {
      return undefined;
    }
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (state.status !== STATUS.RUNNING || !state.phaseEndAt) return;
    if (now >= state.phaseEndAt) {
      dispatch({ type: "TIME_UP" });
    }
  }, [now, state.status, state.phaseEndAt]);

  const computeNextPhase = useCallback(
    (index) => {
      const raw = getPhaseForIndex(index, settings);
      return {
        type: raw.type,
        durationSec: Math.max(1, raw.durationSec * speedFactor),
      };
    },
    [settings, speedFactor]
  );

  const start = useCallback(() => {
    dispatch({ type: "START_SESSION", phase: computeNextPhase(0) });
  }, [computeNextPhase]);

  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const resume = useCallback(() => dispatch({ type: "RESUME" }), []);

  const acknowledge = useCallback(
    (endedBy, tabStats) => {
      if (state.status !== STATUS.AWAITING_ACK) return;
      const overtimeSec = (Date.now() - state.overtimeStartAt) / 1000;
      const entry = {
        phaseType: state.phaseType,
        plannedSec: state.phaseDurationSec,
        overtimeSec,
        endedBy,
        tabSwitchCount: tabStats?.tabSwitchCount || 0,
        distractedSec: tabStats?.distractedSec || 0,
        timestamp: Date.now(),
      };
      dispatch({
        type: "ADVANCE",
        entry,
        nextPhase: computeNextPhase(state.phaseIndex + 1),
      });
    },
    [
      state.status,
      state.overtimeStartAt,
      state.phaseType,
      state.phaseDurationSec,
      state.phaseIndex,
      computeNextPhase,
    ]
  );

  const skip = useCallback(
    (tabStats) => {
      if (state.status !== STATUS.RUNNING) return;
      const remainingMs = Math.max(0, state.phaseEndAt - Date.now());
      const elapsedSec = Math.max(0, state.phaseDurationSec - remainingMs / 1000);
      const entry = {
        phaseType: state.phaseType,
        plannedSec: elapsedSec,
        overtimeSec: 0,
        endedBy: "skipped",
        tabSwitchCount: tabStats?.tabSwitchCount || 0,
        distractedSec: tabStats?.distractedSec || 0,
        timestamp: Date.now(),
      };
      dispatch({
        type: "ADVANCE",
        entry,
        nextPhase: computeNextPhase(state.phaseIndex + 1),
      });
    },
    [
      state.status,
      state.phaseEndAt,
      state.phaseDurationSec,
      state.phaseType,
      state.phaseIndex,
      computeNextPhase,
    ]
  );

  const endSession = useCallback(() => dispatch({ type: "END_SESSION" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const remainingSec =
    state.status === STATUS.RUNNING && state.phaseEndAt
      ? Math.max(0, (state.phaseEndAt - now) / 1000)
      : state.status === STATUS.PAUSED
        ? (state.pausedRemainingSec ?? 0)
        : 0;

  const overtimeSec =
    state.status === STATUS.AWAITING_ACK && state.overtimeStartAt
      ? Math.max(0, (now - state.overtimeStartAt) / 1000)
      : 0;

  const cyclePosition = getCyclePosition(state.phaseIndex, settings);

  return {
    status: state.status,
    phaseType: state.phaseType,
    phaseIndex: state.phaseIndex,
    phaseDurationSec: state.phaseDurationSec,
    remainingSec,
    overtimeSec,
    log: state.log,
    cyclePosition,
    start,
    pause,
    resume,
    acknowledge,
    skip,
    endSession,
    reset,
  };
}
