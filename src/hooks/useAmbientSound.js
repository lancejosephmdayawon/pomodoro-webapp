"use client";

import { useEffect, useRef } from "react";

/**
 * Synthesized ambient focus sound — a looping noise buffer, optionally
 * low-pass filtered to sound more like rain. Both are generated in-browser
 * (no external audio files), so there's nothing to license or host.
 * Plays while `active` is true and `kind` isn't 'none'.
 */
export function useAmbientSound(kind, { active, volume = 0.12 } = {}) {
  const ctxRef = useRef(null);

  useEffect(() => {
    if (!active || !kind || kind === "none") return undefined;

    const AudioContextClass =
      typeof window !== "undefined" &&
      (window.AudioContext || window.webkitAudioContext);
    if (!AudioContextClass) return undefined;

    const ctx = ctxRef.current || new AudioContextClass();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();

    const bufferSeconds = 2;
    const bufferSize = ctx.sampleRate * bufferSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    if (kind === "rain") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 700;
      source.connect(filter);
      filter.connect(gain);
    } else {
      source.connect(gain);
    }
    gain.connect(ctx.destination);
    source.start();

    return () => {
      try {
        source.stop();
      } catch {
        // Already stopped — fine.
      }
      source.disconnect();
      gain.disconnect();
    };
  }, [active, kind, volume]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close?.();
    };
  }, []);
}
