"use client";

import { useCallback, useMemo, useState } from "react";
import { DEFAULT_SETTINGS, LOCALSTORAGE_SETTINGS_KEY, PHASE_TYPES, STATUS } from "../lib/constants";
import { computeSessionMetrics } from "../lib/sessionMetrics";
import { classifySession } from "../lib/archetypes";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePomodoroEngine } from "../hooks/usePomodoroEngine";
import { useBuzzer } from "../hooks/useBuzzer";
import { useAmbientSound } from "../hooks/useAmbientSound";
import { useVisibilityTracker } from "../hooks/useVisibilityTracker";
import { TimerDisplay } from "./TimerDisplay";
import { OvertimeBanner } from "./OvertimeBanner";
import { ControlBar } from "./ControlBar";
import { SettingsModal } from "./SettingsModal";
import { SessionSummary } from "./SessionSummary";
import { Brand } from "./Brand";

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

  useBuzzer(status === STATUS.AWAITING_ACK, {
    enabled: settings.soundEnabled,
    kind: settings.buzzerSound,
    volume: settings.buzzerVolume,
  });
  useAmbientSound(settings.ambientSound, {
    active: status === STATUS.RUNNING && isLockIn,
    volume: settings.ambientVolume,
  });

  const handleAcknowledge = useCallback(
    () => {
      engine.acknowledge("manual", tracker.getStatsAndReset());
    },
    // Depend on the specific stable functions, not the `engine`/`tracker`
    // wrapper objects — those are recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine.acknowledge, tracker.getStatsAndReset]
  );

  const handleSkip = useCallback(() => {
    engine.skip(tracker.getStatsAndReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.skip, tracker.getStatsAndReset]);

  const summary = useMemo(() => {
    if (status !== STATUS.FINISHED) return null;
    const metrics = computeSessionMetrics(log);
    return { metrics, archetype: classifySession(metrics) };
  }, [status, log]);

  const theme = {
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    tertiaryColor: settings.tertiaryColor,
  };
  const currentAccent =
    phaseType === PHASE_TYPES.SHORT_BREAK
      ? theme.secondaryColor
      : phaseType === PHASE_TYPES.LONG_BREAK
        ? theme.tertiaryColor
        : theme.primaryColor;

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-4 py-10">
      <Brand />

      {status === STATUS.FINISHED && summary ? (
        <SessionSummary
          metrics={summary.metrics}
          archetype={summary.archetype}
          onNewSession={() => engine.reset()}
          accentColor={theme.primaryColor}
        />
      ) : (
        <>
          <TimerDisplay
            phaseType={phaseType}
            remainingSec={remainingSec}
            cyclePosition={cyclePosition}
            theme={theme}
          />

          {status === STATUS.AWAITING_ACK && (
            <OvertimeBanner
              overtimeSec={overtimeSec}
              onAcknowledge={handleAcknowledge}
              accentColor={currentAccent}
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
            accentColor={currentAccent}
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
