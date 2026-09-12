# 🍅 Voice-Ack Pomodoro

A Pomodoro timer with a twist: instead of tapping a button to silence the alarm, you **speak a personal "magic word"** to acknowledge that a lock-in or rest period is over. The app tracks how long you take to say it, and when you end a session it reveals a **Session Summary** that labels you with a gamified archetype — Locked-In Legend, The Negotiator, Tab Wanderer, and more.

Built with Next.js 16, React 19, and Tailwind v4. No accounts, no backend — everything runs client-side.

## Features

- **Configurable cycles** — set lock-in / short-break / long-break durations and how many lock-ins happen before the long break (defaults: 25 / 5 / 30, 4 cycles).
- **Voice acknowledgment** — say your keyword into the mic to stop the buzzer and move to the next phase (Web Speech API, Chrome/Edge). A manual "I'm done" button is always available as a fallback for other browsers or noisy rooms.
- **Overtime tracking** — a live counter shows how long you've let the buzzer run before acknowledging, feeding into your end-of-session archetype.
- **Focus-loss tracking** — tab switches / window blur during lock-ins are tracked and factored into your summary.
- **Ambient focus sound** — optional synthesized white noise or filtered "rain" during lock-in phases.
- **Session Summary** — end anytime with "End Pomodoro" to see your archetype, stats, and a downloadable summary card (PNG).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Grant microphone access when prompted to use voice acknowledgment (Chrome/Edge recommended — see [Browser support](#browser-support)).

Append `?fast=1` to the URL during development to shrink every phase to a few seconds, for quickly exercising a full cycle without waiting real minutes.

## Browser support

Voice acknowledgment relies on the (webkit-prefixed) `SpeechRecognition` API, which is reliably supported in Chrome and Edge but not Firefox or Safari. The app feature-detects this and falls back to a manual acknowledge button everywhere — voice is a bonus, never a requirement.

## Project structure

```
src/
  app/            Next.js App Router entry (page.js, layout.js, globals.css)
  components/     UI: timer display, overtime banner, controls, settings, summary
  hooks/          usePomodoroEngine, useVoiceAck, useBuzzer, useAmbientSound,
                  useVisibilityTracker, useLocalStorage
  lib/            phaseSchedule, archetypes, sessionMetrics, summaryCard, constants
```

## Backlog / ideas

Not built yet, considered for a future pass:

- Accounts + cross-device history sync (Supabase)
- History dashboard with streaks / heatmap across sessions
- Real licensed ambient/lo-fi audio tracks
- Social sharing / leaderboards
- PWA install + push notifications
- Multi-language keyword matching
