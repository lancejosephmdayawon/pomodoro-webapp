"use client";

import { useState } from "react";
import { Clock, CloudRain, Mic, Palette, RotateCcw, Volume2, VolumeX, Waves, X } from "lucide-react";
import { DEFAULT_THEME } from "../lib/constants";
import { getContrastText } from "../lib/color";

const AMBIENT_OPTIONS = [
  { value: "none", label: "Off", icon: VolumeX },
  { value: "white", label: "White noise", icon: Waves },
  { value: "rain", label: "Rain", icon: CloudRain },
];

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
        style={{ left: checked ? "calc(100% - 20px)" : "2px" }}
      />
    </button>
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

  const field = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    onSave({
      lockInMinutes: clampNumber(draft.lockInMinutes, 1, 180),
      shortBreakMinutes: clampNumber(draft.shortBreakMinutes, 1, 120),
      longBreakMinutes: clampNumber(draft.longBreakMinutes, 1, 240),
      cyclesBeforeLongBreak: clampNumber(draft.cyclesBeforeLongBreak, 1, 12),
      keyword: (draft.keyword || "").trim() || "done",
      ambientSound: draft.ambientSound,
      soundEnabled: draft.soundEnabled,
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
            <SectionHeader icon={Mic}>Voice & sound</SectionHeader>
            <label className="flex items-center justify-between gap-3 text-sm text-zinc-300">
              <span>Magic word</span>
              <input
                type="text"
                value={draft.keyword}
                onChange={(e) => field("keyword", e.target.value)}
                placeholder="done"
                className="w-32 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-white outline-none focus:border-white/30"
              />
            </label>

            <div className="flex items-center justify-between gap-3 text-sm text-zinc-300">
              <span>Buzzer sound</span>
              <Toggle
                checked={draft.soundEnabled}
                onChange={(v) => field("soundEnabled", v)}
                accentColor={draft.primaryColor}
              />
            </div>

            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <span>Ambient sound (lock-in)</span>
              <div className="grid grid-cols-3 gap-2">
                {AMBIENT_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const active = draft.ambientSound === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field("ambientSound", value)}
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
