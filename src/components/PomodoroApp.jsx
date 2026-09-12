"use client";

import { useCallback, useMemo, useState } from "react";
import { DEFAULT_SETTINGS, LOCALSTORAGE_SETTINGS_KEY, PHASE_TYPES, STATUS } from "../lib/constants";
import { computeSessionMetrics } from "../lib/sessionMetrics";
import { classifySession } from "../lib/archetypes";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePomodoroEngine } from "../hooks/usePomodoroEngine";
import { useVoiceAck } from "../hooks/useVoiceAck";
import { useBuzzer } from "../hooks/useBuzzer";
import { useAmbientSound } from "../hooks/useAmbientSound";
import { useVisibilityTracker } from "../hooks/useVisibilityTracker";
import { TimerDisplay } from "./TimerDisplay";
import { OvertimeBanner } from "./OvertimeBanner";
import { ControlBar } from "./ControlBar";
import { SettingsModal } from "./SettingsModal";
import { SessionSummary } from "./SessionSummary";

export function PomodoroApp() {
  const [settings, updateSettings] = useLocalStorage(LOCALSTORAGE_SETTINGS_KEY, DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Dev-only convenience: ?fast=1 shrinks every phase duration by 60x so the
  // full loop can be exercised in seconds instead of real minutes. Read once
  // via a lazy initializer (feature detection, not something that changes
  // over the component's lifetime) — `window` is guarded for SSR.
  const [speedFactor] = useState(() => {
    if (typeof window === "undefined") return 1;
    const params = new URLSearchParams(window.location.search);
    return params.get("fast") === "1" ? 1 / 60 : 1;
  });

  const engine = usePomodoroEngine(settings, { speedFactor });
  const { status, phaseType, remainingSec, overtimeSec, cyclePosition, log } = engine;

  const isLockIn = phaseType === PHASE_TYPES.LOCK_IN;
  const visibilityActive =
    isLockIn && (status === STATUS.RUNNING || status === STATUS.AWAITING_ACK);
  const tracker = useVisibilityTracker(visibilityActive);

  useBuzzer(status === STATUS.AWAITING_ACK, { enabled: settings.soundEnabled });
  useAmbientSound(settings.ambientSound, { active: status === STATUS.RUNNING && isLockIn });

  const handleAcknowledge = useCallback(
    (source) => {
      engine.acknowledge(source, tracker.getStatsAndReset());
    },
    [engine, tracker]
  );

  const handleVoiceMatch = useCallback(() => handleAcknowledge("voice"), [handleAcknowledge]);

  const voice = useVoiceAck({
    active: status === STATUS.AWAITING_ACK,
    keyword: settings.keyword,
    onMatch: handleVoiceMatch,
  });

  const handleSkip = useCallback(() => {
    engine.skip(tracker.getStatsAndReset());
  }, [engine, tracker]);

  const summary = useMemo(() => {
    if (status !== STATUS.FINISHED) return null;
    const metrics = computeSessionMetrics(log);
    return { metrics, archetype: classifySession(metrics) };
  }, [status, log]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-white/90">🍅 Voice-Ack Pomodoro</h1>
        <p className="text-sm text-white/40">Say the word. Break the buzzer.</p>
      </div>

      {status === STATUS.FINISHED && summary ? (
        <SessionSummary
          metrics={summary.metrics}
          archetype={summary.archetype}
          onNewSession={() => engine.reset()}
        />
      ) : (
        <>
          <TimerDisplay phaseType={phaseType} remainingSec={remainingSec} cyclePosition={cyclePosition} />

          {status === STATUS.AWAITING_ACK && (
            <OvertimeBanner
              keyword={settings.keyword}
              overtimeSec={overtimeSec}
              voiceSupported={voice.supported}
              voiceListening={voice.listening}
              onAcknowledge={handleAcknowledge}
            />
          )}

          <ControlBar
            status={status}
            onStart={engine.start}
            onPause={engine.pause}
            onResume={engine.resume}
            onSkip={handleSkip}
            onEndSession={engine.endSession}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </>
      )}

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(next) => updateSettings(next)}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
