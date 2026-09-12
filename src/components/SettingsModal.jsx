"use client";

import { useState } from "react";

const AMBIENT_OPTIONS = [
  { value: "none", label: "Off" },
  { value: "white", label: "White noise" },
  { value: "rain", label: "Rain (filtered noise)" },
];

export function SettingsModal({ settings, onSave, onClose }) {
  const [draft, setDraft] = useState(settings);

  const field = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const numberInput = (key, label, min = 1) => (
    <label className="flex items-center justify-between gap-3 text-sm text-white/80">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        step="1"
        value={draft[key]}
        onChange={(e) => field(key, e.target.value === "" ? "" : Number(e.target.value))}
        className="w-20 rounded-lg border border-white/20 bg-black/30 px-2 py-1 text-right text-white outline-none focus:border-amber-400"
      />
    </label>
  );

  const handleSave = () => {
    onSave({
      lockInMinutes: clampNumber(draft.lockInMinutes, 1, 180),
      shortBreakMinutes: clampNumber(draft.shortBreakMinutes, 1, 120),
      longBreakMinutes: clampNumber(draft.longBreakMinutes, 1, 240),
      cyclesBeforeLongBreak: clampNumber(draft.cyclesBeforeLongBreak, 1, 12),
      keyword: (draft.keyword || "").trim() || "done",
      ambientSound: draft.ambientSound,
      soundEnabled: draft.soundEnabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">Settings</h2>

        <div className="flex flex-col gap-3">
          {numberInput("lockInMinutes", "Lock-in minutes")}
          {numberInput("shortBreakMinutes", "Short break minutes")}
          {numberInput("longBreakMinutes", "Long break minutes")}
          {numberInput("cyclesBeforeLongBreak", "Lock-ins before long break", 1)}

          <label className="flex items-center justify-between gap-3 text-sm text-white/80">
            <span>Magic word</span>
            <input
              type="text"
              value={draft.keyword}
              onChange={(e) => field("keyword", e.target.value)}
              placeholder="done"
              className="w-32 rounded-lg border border-white/20 bg-black/30 px-2 py-1 text-white outline-none focus:border-amber-400"
            />
          </label>

          <label className="flex items-center justify-between gap-3 text-sm text-white/80">
            <span>Ambient sound (lock-in)</span>
            <select
              value={draft.ambientSound}
              onChange={(e) => field("ambientSound", e.target.value)}
              className="rounded-lg border border-white/20 bg-black/30 px-2 py-1 text-white outline-none focus:border-amber-400"
            >
              {AMBIENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between gap-3 text-sm text-white/80">
            <span>Buzzer sound</span>
            <input
              type="checkbox"
              checked={draft.soundEnabled}
              onChange={(e) => field("soundEnabled", e.target.checked)}
              className="h-4 w-4"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
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
