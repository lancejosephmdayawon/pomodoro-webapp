"use client";

import { useEffect } from "react";
import { AMBIENT_SOUNDS } from "../lib/ambientSounds";

/**
 * Real ambient focus sound, looped from a small hand-picked catalog of CC0
 * Freesound.org recordings (see lib/ambientSounds.js for why Freesound and
 * why these specific tracks). Plays while `active` is true and `kind` isn't
 * 'none' / unrecognized.
 *
 * `volume` is the user's master ambient-volume setting (0-1); each catalog
 * entry's `boost` multiplier is layered on top since some recordings are
 * naturally quieter than others at the same linear volume.
 */
export function useAmbientSound(kind, { active, volume = 0.35 } = {}) {
  const sound = AMBIENT_SOUNDS[kind];

  useEffect(() => {
    if (!active || !sound) return undefined;

    const audio = new Audio(sound.previewUrl);
    audio.loop = true;
    audio.volume = Math.min(1, volume * (sound.boost ?? 1));
    audio.preload = "auto";

    audio.onerror = () => {
      // MediaError codes: 1 aborted, 2 network, 3 decode, 4 src not supported
      console.error("[ambient] playback error for", sound.label, audio.error?.code, audio.error?.message);
    };

    let retryOnInteraction = null;
    const attemptPlay = () => {
      audio.play().catch(() => {
        // Autoplay can be blocked in rare cases (state change landed just
        // outside the click that triggered it, or no gesture at all yet).
        // Retry once on the next real interaction anywhere on the page.
        if (!retryOnInteraction) {
          retryOnInteraction = () => audio.play().catch(() => {});
          document.addEventListener("pointerdown", retryOnInteraction, { once: true });
          document.addEventListener("keydown", retryOnInteraction, { once: true });
        }
      });
    };
    attemptPlay();

    return () => {
      if (retryOnInteraction) {
        document.removeEventListener("pointerdown", retryOnInteraction);
        document.removeEventListener("keydown", retryOnInteraction);
      }
      // Detach onerror first — clearing `src` below itself fires a spurious
      // "Empty src attribute" error event that isn't a real failure.
      audio.onerror = null;
      audio.pause();
      audio.src = "";
    };
  }, [active, sound, volume]);
}
