export const DEFAULT_SETTINGS = {
  lockInMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 30,
  cyclesBeforeLongBreak: 4,
  keyword: "done",
  ambientSound: "none", // 'none' | 'white' | 'rain'
  soundEnabled: true,
};

export const PHASE_TYPES = {
  LOCK_IN: "lockIn",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

export const PHASE_LABELS = {
  [PHASE_TYPES.LOCK_IN]: "Lock In",
  [PHASE_TYPES.SHORT_BREAK]: "Short Break",
  [PHASE_TYPES.LONG_BREAK]: "Long Break",
};

export const STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
  AWAITING_ACK: "awaitingAck",
  FINISHED: "finished",
};

// First-pass thresholds for archetype classification. Tune after real usage.
export const ARCHETYPE_THRESHOLDS = {
  disciplinedOvertimeSec: 4, // avg overtime at/under this = "snappy"
  draggyOvertimeSec: 20, // avg overtime at/over this = "drags it out"
  tabWandererSwitches: 3, // total tab switches during lock-ins at/over this
  speedrunPhases: 3, // completed phases at/under this (but >= minPhasesForVerdict) = "Speedrunner"
  marathonPhases: 10, // completed phases at/over this = marathon session
  minPhasesForVerdict: 1, // fewer completed phases than this -> not enough data for any real verdict
};

export const LOCALSTORAGE_SETTINGS_KEY = "pomodoro:settings";
