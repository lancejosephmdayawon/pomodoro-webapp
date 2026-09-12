"use client";

import { useEffect, useRef } from "react";

/**
 * Synthesized alarm tone via Web Audio — no external asset needed, so
 * nothing to license or host. Plays a short beep burst on a loop while
 * `active` is true.
 */
export function useBuzzer(active, { enabled = true, volume = 0.4 } = {}) {
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

    const playBeep = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    };

    playBeep();
    const intervalId = setInterval(playBeep, 600);
    return () => clearInterval(intervalId);
  }, [active, enabled, volume]);

  // Tear down the AudioContext only when the component using this hook unmounts.
  useEffect(() => {
    return () => {
      ctxRef.current?.close?.();
    };
  }, []);
}
