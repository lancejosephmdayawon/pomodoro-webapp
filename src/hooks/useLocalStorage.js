"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Native 'storage' events only fire in *other* tabs, so writes in this hook
// also dispatch this custom event to notify same-tab subscribers.
const LOCAL_WRITE_EVENT = "pomodoro:local-storage-write";

function subscribe(key, callback) {
  const handleStorage = (e) => {
    if (!e.key || e.key === key) callback();
  };
  const handleLocalWrite = (e) => {
    if (e.detail === key) callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(LOCAL_WRITE_EVENT, handleLocalWrite);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LOCAL_WRITE_EVENT, handleLocalWrite);
  };
}

function readRaw(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

const getServerSnapshot = () => null;

/**
 * Generic localStorage-backed state, read via useSyncExternalStore (the
 * React-idiomatic way to subscribe to an external store) rather than an
 * effect that calls setState on mount.
 */
export function useLocalStorage(key, defaultValue) {
  const raw = useSyncExternalStore(
    (callback) => subscribe(key, callback),
    () => readRaw(key),
    getServerSnapshot
  );

  const value = useMemo(() => {
    if (raw == null) return defaultValue;
    try {
      return { ...defaultValue, ...JSON.parse(raw) };
    } catch {
      return defaultValue;
    }
    // defaultValue is treated as stable (callers should pass a constant).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const update = useCallback(
    (patch) => {
      const current = (() => {
        const r = readRaw(key);
        if (r == null) return defaultValue;
        try {
          return { ...defaultValue, ...JSON.parse(r) };
        } catch {
          return defaultValue;
        }
      })();
      const next = {
        ...current,
        ...(typeof patch === "function" ? patch(current) : patch),
      };
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(LOCAL_WRITE_EVENT, { detail: key }));
      } catch {
        // Storage full/blocked — silently skip persistence.
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, update];
}
