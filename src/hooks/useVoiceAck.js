"use client";

import { useEffect, useState } from "react";

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function getSpeechRecognitionClass() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Wraps the (webkit-prefixed) SpeechRecognition API. Only listens while
 * `active` is true, so mic permission is requested lazily on first real use
 * rather than on page load. Matches on "transcript contains keyword" so
 * phrases like "okay, I'm done" still match a keyword of "done".
 *
 * Feature-detects: on Firefox/Safari (no reliable support) `supported` comes
 * back false and callers should fall back to a manual acknowledge button.
 */
export function useVoiceAck({ active, keyword, onMatch }) {
  const [supported] = useState(() => getSpeechRecognitionClass() != null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognitionClass();
    if (!SpeechRecognitionClass || !active) return undefined;

    let stoppedIntentionally = false;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const target = normalize(keyword || "");
      if (!target) return;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = normalize(event.results[i][0].transcript);
        if (transcript.includes(target)) {
          onMatch?.();
          return;
        }
      }
    };

    recognition.onerror = (event) => {
      setError(event.error);
      // 'no-speech' / 'aborted' etc. are routine; onend below handles restart.
    };

    recognition.onend = () => {
      setListening(false);
      if (!stoppedIntentionally) {
        try {
          recognition.start();
        } catch {
          // Will get another chance if the effect re-runs.
        }
      }
    };

    try {
      recognition.start();
    } catch {
      // onstart won't fire; `listening` simply stays false.
    }

    return () => {
      stoppedIntentionally = true;
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // Already stopped — fine.
      }
    };
  }, [active, keyword, onMatch]);

  return { supported, listening, error };
}
