"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlarmClock,
  Bell,
  Clock,
  Coffee,
  CloudFog,
  CloudLightning,
  CloudRain,
  Music2,
  Palette,
  RotateCcw,
  Volume2,
  VolumeX,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { DEFAULT_THEME } from "../lib/constants";
import { AMBIENT_SOUNDS } from "../lib/ambientSounds";
import { BUZZER_SOUNDS } from "../lib/buzzerSounds";
import { previewBuzzerSound } from "../hooks/useBuzzer";
import { getContrastText } from "../lib/color";

const AMBIENT_ICONS = {
  none: VolumeX,
  rain: CloudRain,
  white: Waves,
  brown: CloudFog,
  cafe: Coffee,
  thunderstorm: CloudLightning,
};
const AMBIENT_OPTIONS = [
  { value: "none", label: "Off" },
  ...Object.entries(AMBIENT_SOUNDS).map(([value, sound]) => ({ value, label: sound.label })),
];

const BUZZER_ICONS = { classic: AlarmClock, chime: Music2, digital: Zap, bell: Bell };
const BUZZER_OPTIONS = Object.entries(BUZZER_SOUNDS).map(([value, sound]) => ({
  value,
  label: sound.label,
}));

function SectionHeader({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {children}
    </div>
  );
}

function NumberField({ label, value, onChange, min = 1, max }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-zinc-300">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-right text-white outline-none focus:border-white/30"
      />
    </label>
  );
}

function Toggle({ checked, onChange, accentColor }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 shrink-0 rounded-full border border-white/10 transition-colors"
      style={{ backgroundColor: checked ? accentColor : "rgba(255,255,255,0.08)" }}
    >
      <span
        className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all"
        style={{
          left: checked ? "calc(100% - 20px)" : "2px",
          boxShadow: checked ? "0 1px 4px rgba(0,0,0,0.45)" : "none",
        }}
      />
    </button>
  );
}

function VolumeSlider({ label, value, onChange, accentColor, disabled }) {
  return (
    <label
      className="flex items-center justify-between gap-3 text-sm transition-opacity"
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <span className={disabled ? "text-zinc-500" : "text-zinc-300"}>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ accentColor }}
          className="h-1.5 w-28 disabled:cursor-not-allowed cursor-pointer"
        />
        <span className="w-8 text-right font-mono text-xs text-zinc-500">
          {Math.round(value * 100)}%
        </span>
      </span>
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-zinc-300">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-xs text-zinc-500 uppercase">{value}</span>
        <span
          className="relative h-7 w-7 overflow-hidden rounded-full border border-white/15"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-1 -left-1 h-9 w-9 cursor-pointer"
          />
        </span>
      </span>
    </label>
  );
}

export function SettingsModal({ settings, onSave, onClose }) {
  const [draft, setDraft] = useState(settings);
  const previewAudioRef = useRef(null);
  const previewTimeoutRef = useRef(null);

  const field = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const stopAmbientPreview = () => {
    clearTimeout(previewTimeoutRef.current);
    if (previewAudioRef.current) {
      // Detach handlers first — clearing `src` below itself fires a spurious
      // `error` event ("Empty src attribute"), which the onerror handler
      // would otherwise log as if playback had actually failed.
      previewAudioRef.current.onerror = null;
      previewAudioRef.current.onplaying = null;
      previewAudioRef.current.pause();
      previewAudioRef.current.src = "";
      previewAudioRef.current = null;
    }
  };

  // Stop any playing preview if the modal is closed/unmounted mid-preview.
  useEffect(() => {
    return () => {
      clearTimeout(previewTimeoutRef.current);
      previewAudioRef.current?.pause();
    };
  }, []);

  const selectAmbient = (value) => {
    field("ambientSound", value);
    stopAmbientPreview();
    const sound = AMBIENT_SOUNDS[value];
    if (!sound) return; // "none"

    const audio = new Audio(sound.previewUrl);
    audio.volume = Math.min(1, draft.ambientVolume * (sound.boost ?? 1));
    previewAudioRef.current = audio;

    audio.onerror = () =>
      console.error("[ambient preview] error:", sound.label, audio.error?.code, audio.error?.message);
    audio.onplaying = () => {
      // Only start the auto-stop countdown once sound is actually audible —
      // a slow-to-buffer file was otherwise getting killed by this timeout
      // before it ever made a sound.
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = setTimeout(stopAmbientPreview, 3000);
    };

    audio.play().catch(() => {
      // Preview is a nice-to-have; ignore autoplay rejection here.
    });
  };

  // Live-update the currently-playing preview (if any) when the slider moves.
  const setAmbientVolume = (v) => {
    field("ambientVolume", v);
    const sound = AMBIENT_SOUNDS[draft.ambientSound];
    if (previewAudioRef.current && sound) {
      previewAudioRef.current.volume = Math.min(1, v * (sound.boost ?? 1));
    }
  };

  const selectBuzzer = (value) => {
    field("buzzerSound", value);
    previewBuzzerSound(value, draft.buzzerVolume);
  };

  const handleSave = () => {
    onSave({
      lockInMinutes: clampNumber(draft.lockInMinutes, 1, 180),
      shortBreakMinutes: clampNumber(draft.shortBreakMinutes, 1, 120),
      longBreakMinutes: clampNumber(draft.longBreakMinutes, 1, 240),
      cyclesBeforeLongBreak: clampNumber(draft.cyclesBeforeLongBreak, 1, 12),
      ambientSound: draft.ambientSound,
      ambientVolume: draft.ambientVolume,
      soundEnabled: draft.soundEnabled,
      buzzerSound: draft.buzzerSound,
      buzzerVolume: draft.buzzerVolume,
      primaryColor: draft.primaryColor,
      secondaryColor: draft.secondaryColor,
      tertiaryColor: draft.tertiaryColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[85vh] w-full max-w-sm flex-col rounded-2xl border border-white/10 bg-[#111113] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-3">
            <SectionHeader icon={Clock}>Durations</SectionHeader>
            <NumberField
              label="Lock-in minutes"
              value={draft.lockInMinutes}
              onChange={(v) => field("lockInMinutes", v)}
            />
            <NumberField
              label="Short break minutes"
              value={draft.shortBreakMinutes}
              onChange={(v) => field("shortBreakMinutes", v)}
            />
            <NumberField
              label="Long break minutes"
              value={draft.longBreakMinutes}
              onChange={(v) => field("longBreakMinutes", v)}
            />
            <NumberField
              label="Lock-ins before long break"
              value={draft.cyclesBeforeLongBreak}
              onChange={(v) => field("cyclesBeforeLongBreak", v)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <SectionHeader icon={Volume2}>Sound</SectionHeader>

            <div className="flex items-center justify-between gap-3 text-sm text-zinc-300">
              <span>Alarm enabled</span>
              <Toggle
                checked={draft.soundEnabled}
                onChange={(v) => field("soundEnabled", v)}
                accentColor={draft.primaryColor}
              />
            </div>

            <VolumeSlider
              label="Alarm volume"
              value={draft.buzzerVolume}
              onChange={(v) => field("buzzerVolume", v)}
              accentColor={draft.primaryColor}
              disabled={!draft.soundEnabled}
            />

            <div
              className="flex flex-col gap-2 text-sm transition-opacity"
              style={{ opacity: draft.soundEnabled ? 1 : 0.4 }}
            >
              <span className={draft.soundEnabled ? "text-zinc-300" : "text-zinc-500"}>
                Alarm sound — tap to preview
              </span>
              <div className="grid grid-cols-2 gap-2">
                {BUZZER_OPTIONS.map(({ value, label }) => {
                  const Icon = BUZZER_ICONS[value];
                  const active = draft.buzzerSound === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!draft.soundEnabled}
                      onClick={() => selectBuzzer(value)}
                      className="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs transition disabled:cursor-not-allowed"
                      style={{
                        borderColor: active ? draft.primaryColor : "rgba(255,255,255,0.1)",
                        backgroundColor: active ? "rgba(255,255,255,0.06)" : "transparent",
                        color: active ? "#fafafa" : "#71717a",
                      }}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <VolumeSlider
              label="Ambient volume"
              value={draft.ambientVolume}
              onChange={setAmbientVolume}
              accentColor={draft.primaryColor}
            />

            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <span>Ambient sound (lock-in) — tap to preview</span>
              <div className="grid grid-cols-2 gap-2">
                {AMBIENT_OPTIONS.map(({ value, label }) => {
                  const Icon = AMBIENT_ICONS[value];
                  const active = draft.ambientSound === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectAmbient(value)}
                      className="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs transition"
                      style={{
                        borderColor: active ? draft.primaryColor : "rgba(255,255,255,0.1)",
                        backgroundColor: active ? "rgba(255,255,255,0.06)" : "transparent",
                        color: active ? "#fafafa" : "#71717a",
                      }}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      {label}
                    </button>
                  );
                })}
              </div>
              {AMBIENT_SOUNDS[draft.ambientSound] && (
                <p className="px-1 text-xs text-zinc-600">
                  &ldquo;{AMBIENT_SOUNDS[draft.ambientSound].title}&rdquo; by{" "}
                  {AMBIENT_SOUNDS[draft.ambientSound].author} —{" "}
                  <a
                    href={AMBIENT_SOUNDS[draft.ambientSound].sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted hover:text-zinc-400"
                  >
                    Freesound.org
                  </a>
                  , {AMBIENT_SOUNDS[draft.ambientSound].license}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionHeader icon={Palette}>Appearance</SectionHeader>
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, ...DEFAULT_THEME }))}
                className="flex items-center gap-1 text-xs text-zinc-500 transition hover:text-white"
              >
                <RotateCcw className="h-3 w-3" strokeWidth={2} />
                Reset
              </button>
            </div>
            <ColorField
              label="Primary (lock-in)"
              value={draft.primaryColor}
              onChange={(v) => field("primaryColor", v)}
            />
            <ColorField
              label="Secondary (short break)"
              value={draft.secondaryColor}
              onChange={(v) => field("secondaryColor", v)}
            />
            <ColorField
              label="Tertiary (long break)"
              value={draft.tertiaryColor}
              onChange={(v) => field("tertiaryColor", v)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: draft.primaryColor, color: getContrastText(draft.primaryColor) }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
