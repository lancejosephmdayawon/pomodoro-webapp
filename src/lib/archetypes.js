import { ARCHETYPE_THRESHOLDS as T } from "./constants";

const fmt1 = (n) => (Math.round(n * 10) / 10).toString();

/**
 * Ordered rule list — first match wins. Each rule gets the computed session
 * metrics and returns true/false; `receipts` pulls the specific numbers that
 * justify the label so the summary feels earned, not random.
 *
 * These thresholds are a first pass (see constants.js) — expect to retune
 * once real sessions come in.
 */
const RULES = [
  {
    id: "not-enough-data",
    title: "Ghost Mode",
    emoji: "\u{1F47B}",
    tagline: "You barely clocked in before bailing — nothing to read here yet.",
    when: (m) => m.completedPhases < T.minPhasesForVerdict,
    receipts: (m) => [`${m.completedPhases} phase(s) completed`],
  },
  {
    id: "speedrunner",
    title: "Speedrunner",
    emoji: "⚡",
    tagline: "In and out. You ended this session almost as fast as you started it.",
    when: (m) => m.completedPhases <= T.speedrunPhases,
    receipts: (m) => [
      `${m.completedPhases} phase(s) completed`,
      `${fmt1(m.totalFocusMinutes)} focus min logged`,
    ],
  },
  {
    id: "tab-wanderer",
    title: "Tab Wanderer",
    emoji: "\u{1F9ED}",
    tagline: "Your lock-ins had a lot of... side quests.",
    when: (m) => m.totalTabSwitches >= T.tabWandererSwitches,
    receipts: (m) => [
      `${m.totalTabSwitches} tab switch(es) mid lock-in`,
      `${Math.round(m.totalDistractedSec)}s spent away from the tab`,
    ],
  },
  {
    id: "locked-in-legend",
    title: "Locked-In Legend",
    emoji: "\u{1F512}",
    tagline: "Buzzer goes off, you're already saying the word. Zero drag, both ends.",
    when: (m) =>
      m.avgLockInOvertimeSec <= T.disciplinedOvertimeSec &&
      m.avgBreakOvertimeSec <= T.disciplinedOvertimeSec &&
      m.totalTabSwitches === 0,
    receipts: (m) => [
      `${fmt1(m.avgLockInOvertimeSec)}s avg lock-in overtime`,
      `${fmt1(m.avgBreakOvertimeSec)}s avg break overtime`,
    ],
  },
  {
    id: "negotiator",
    title: "The Negotiator",
    emoji: "\u{1F91D}",
    tagline: "Snappy back to work, but every break gets a little... renegotiated.",
    when: (m) =>
      m.avgLockInOvertimeSec <= T.disciplinedOvertimeSec &&
      m.avgBreakOvertimeSec >= T.draggyOvertimeSec,
    receipts: (m) => [
      `${fmt1(m.avgLockInOvertimeSec)}s avg lock-in overtime`,
      `${fmt1(m.avgBreakOvertimeSec)}s avg break overtime`,
    ],
  },
  {
    id: "snooze-diplomat",
    title: "Snooze Diplomat",
    emoji: "\u{1F6CF}️",
    tagline: "Whether it's back to work or back to rest, you take your time saying so.",
    when: (m) =>
      m.avgLockInOvertimeSec >= T.draggyOvertimeSec &&
      m.avgBreakOvertimeSec >= T.draggyOvertimeSec,
    receipts: (m) => [
      `${fmt1(m.avgLockInOvertimeSec)}s avg lock-in overtime`,
      `${fmt1(m.avgBreakOvertimeSec)}s avg break overtime`,
    ],
  },
  {
    id: "marathoner",
    title: "Marathoner",
    emoji: "\u{1F3C3}",
    tagline: "You just kept going. Impressive stamina.",
    when: (m) => m.completedPhases >= T.marathonPhases,
    receipts: (m) => [
      `${m.completedPhases} phases completed`,
      `${fmt1(m.totalFocusMinutes)} focus min / ${fmt1(m.totalBreakMinutes)} break min`,
    ],
  },
  {
    id: "steady-starter",
    title: "Steady Starter",
    emoji: "\u{1F331}",
    tagline: "A solid, balanced session — nothing wild to report, in a good way.",
    when: () => true, // fallback, always matches
    receipts: (m) => [
      `${m.completedLockIns} lock-in(s), ${m.completedBreaks} break(s)`,
      `${Math.round(m.voiceUsageRate * 100)}% acknowledged by voice`,
    ],
  },
];

export function classifySession(metrics) {
  const rule = RULES.find((r) => r.when(metrics));
  return {
    id: rule.id,
    title: rule.title,
    emoji: rule.emoji,
    tagline: rule.tagline,
    receipts: rule.receipts(metrics),
  };
}
