/**
 * Catalog of synthesized "time's up" alarm patterns — all generated via Web
 * Audio (see hooks/useBuzzer.js), so there's nothing to license or host, same
 * reasoning as the original single buzzer tone.
 */
export const BUZZER_SOUNDS = {
  classic: { label: "Classic beep", intervalMs: 600 },
  chime: { label: "Gentle chime", intervalMs: 1400 },
  digital: { label: "Digital alarm", intervalMs: 900 },
  bell: { label: "Bell", intervalMs: 1600 },
};

export const BUZZER_SOUND_KEYS = Object.keys(BUZZER_SOUNDS);
