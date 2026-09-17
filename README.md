# Lock-In Pomodoro

A Pomodoro timer with a twist: when a lock-in or rest period ends, the buzzer keeps going until you actually acknowledge it — and the app tracks exactly how long you let it run. End a session anytime with **"End Pomodoro"** to see a **Session Summary** that labels you with a gamified archetype — Locked-In Legend, The Negotiator, Tab Wanderer, and more — based on how the session actually went.

Built with Next.js 16, React 19, and Tailwind v4. No accounts, no backend — everything runs client-side.

## Features

- **Configurable cycles** — set lock-in / short-break / long-break durations and how many lock-ins happen before the long break (defaults: 25 / 5 / 30, 4 cycles).
- **Overtime tracking** — a live counter shows how long you've let the buzzer run before hitting "I'm done", feeding into your end-of-session archetype.
- **Focus-loss tracking** — tab switches / window blur during lock-ins are tracked and factored into your summary.
- **Ambient focus sound** — real Creative-Commons field recordings (rain, white noise, café) during lock-in phases, via Freesound.org.
- **Session Summary** — end anytime with "End Pomodoro" to see your archetype, stats, and a downloadable summary card (PNG).
- **Customizable theme** — pick your own primary/secondary/tertiary accent colors, or stick with the default black/white/grayscale look.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Append `?fast=1` to the URL during development to shrink every phase to a few seconds, for quickly exercising a full cycle without waiting real minutes.

## Project structure

```
src/
  app/            Next.js App Router entry (page.js, layout.js, globals.css)
  components/     UI: timer display, overtime banner, controls, settings, summary
  hooks/          usePomodoroEngine, useBuzzer, useAmbientSound,
                  useVisibilityTracker, useLocalStorage
  lib/            phaseSchedule, archetypes, sessionMetrics, summaryCard,
                  ambientSounds, constants
```

## Backlog / ideas

Not built yet, considered for a future pass:

- Accounts + cross-device history sync (Supabase)
- History dashboard with streaks / heatmap across sessions
- Social sharing / leaderboards
- PWA install + push notifications
