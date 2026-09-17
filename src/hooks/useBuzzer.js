"use client";

import { useEffect, useRef } from "react";
import { BUZZER_SOUNDS } from "../lib/buzzerSounds";

/**
 * Schedules one "hit" of the given alarm pattern starting at `ctx.currentTime`.
 * All synthesized (oscillators + gain envelopes) — no external audio assets.
 */
function playHit(ctx, kind, volume) {
  const now = ctx.currentTime;

  const tone = (freq, type, start, duration, peak) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.02, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  };

  switch (kind) {
    case "chime":
      // Two soft notes, sine wave — a gentler alternative to a harsh beep.
      tone(880, "sine", now, 0.4, volume);
      tone(659, "sine", now + 0.18, 0.42, volume);
      break;

    case "digital":
      // Rapid triple beep, higher pitched and sharper.
      tone(1200, "square", now, 0.08, volume);
      tone(1200, "square", now + 0.12, 0.08, volume);
      tone(1200, "square", now + 0.24, 0.08, volume);
      break;

    case "bell":
      // A struck bell: fundamental + a couple of overtone partials decaying
      // together, much longer than the other patterns.
      tone(520, "sine", now, 1.1, volume);
      tone(520 * 2.4, "sine", now, 1.0, volume * 0.5);
      tone(520 * 3.8, "sine", now, 0.9, volume * 0.3);
      break;

    case "classic":
    default:
      tone(880, "square", now, 0.28, volume);
      break;
  }
}

/**
 * Plays one instance of `kind` immediately, for a "preview" button — opens a
 * short-lived AudioContext and closes it shortly after. Independent of the
 * useBuzzer hook's active/looping lifecycle.
 */
export function previewBuzzerSound(kind, volume = 0.4) {
  const AudioContextClass =
    typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  if (ctx.state === "suspended") ctx.resume();
  playHit(ctx, kind, volume);
  setTimeout(() => ctx.close(), 2000);
}

/**
 * Loops the alarm pattern for `kind` via Web Audio while `active` is true.
 */
export function useBuzzer(active, { enabled = true, volume = 0.4, kind = "classic" } = {}) {
  const ctxRef = useRef(null);

  useEffect(() => {
    if (!active || !enabled) return undefined;

    const AudioContextClass =
      typeof window !== "undefined" &&
      (window.AudioContext || window.webkitAudioContext);
    if (!AudioContextClass) return undefined;

    const ctx = ctxRef.current || new AudioContextClass();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();

    const intervalMs = BUZZER_SOUNDS[kind]?.intervalMs ?? BUZZER_SOUNDS.classic.intervalMs;

    const hit = () => playHit(ctx, kind, volume);
    hit();
    const intervalId = setInterval(hit, intervalMs);
    return () => clearInterval(intervalId);
  }, [active, enabled, volume, kind]);

  // Tear down the AudioContext only when the component using this hook unmounts.
  useEffect(() => {
    return () => {
      ctxRef.current?.close?.();
    };
  }, []);
}
