---
title: Overview
description: What bf6-portal-utils provides — 21 independent, separately-imported helper modules built on bf6-portal-mod-types.
---

`bf6-portal-utils` is a helper layer built on top of `bf6-portal-mod-types`.
Unlike the types package, it has real runtime code — and unlike a typical
npm package, it has **no single entry point**. Each module is its own
subpath import, and you only pay for what you use:

```ts
import { Events } from 'bf6-portal-utils/events';
import { Vectors } from 'bf6-portal-utils/vectors';
```

There is no `import { Events } from 'bf6-portal-utils'` — that root import
doesn't exist. This matters for the [API Reference](/reference/utils/) too:
it's organized as 21 separate module trees, one per subpath, not one flat
namespace.

## Installation

```bash
pnpm add -D bf6-portal-utils
```

See [Installation & Setup](/guides/installation/) for the full `tsconfig.json`
this package expects — it needs `bf6-portal-mod-types` installed alongside
it, since every module's public API is expressed in terms of `mod.*` types.

## The 21 modules

| Module | Import path | What it does |
|---|---|---|
| **Events** | `bf6-portal-utils/events` | Owns every raw Portal event handler once and lets any number of subscribers listen — see [Events](/utils/events/) |
| **Vectors** | `bf6-portal-utils/vectors` | Transparent `{x, y, z}` vector math on top of the opaque `mod.Vector` type — see [Vector Math](/utils/vector-math/) |
| **Timers** | `bf6-portal-utils/timers` | `setTimeout`/`setInterval`-style scheduling, since QuickJS has none natively — see [Timers & Clocks](/utils/timers-and-clocks/) |
| **Clocks** | `bf6-portal-utils/clocks` | Drift-resistant count-up/count-down clocks (match timers, round timers) — see [Timers & Clocks](/utils/timers-and-clocks/) |
| **UI** | `bf6-portal-utils/ui` | Object-oriented wrapper over Portal's UI system — containers, buttons, text — see [UI Components](/utils/ui-components/) |
| **SolidUI** | `bf6-portal-utils/solid-ui` | A from-scratch SolidJS-style reactive layer (signals, effects, memos) for driving `UI` — see [Solid UI](/utils/solid-ui/) |
| **ModExtensions** | `bf6-portal-utils/mod-extensions` | Typed helpers for undocumented runtime behavior (event-type comparisons, string lookups) — see [Mod Extensions](/utils/mod-extensions/) |
| **Raycast** | `bf6-portal-utils/raycast` | Attributes `OnRayCastHit`/`OnRayCastMissed` results back to the specific ray that caused them, which the native API doesn't do |
| **Logger** | `bf6-portal-utils/logger` | Renders arbitrary runtime text as an in-game UI panel — `console.log` is PC-only and file-based |
| **Logging** | `bf6-portal-utils/logging` | Fail-safe log-level abstraction other modules build on internally |
| **CallbackHandler** | `bf6-portal-utils/callback-handler` | Safely invokes sync/async user callbacks without letting a throw kill the caller |
| **Benchmarker** | `bf6-portal-utils/benchmarker` | Measures how long pure JS work takes inside the QuickJS runtime |
| **PerformanceStats** | `bf6-portal-utils/performance-stats` | Tracks live server tick rate and script timeout lag |
| **MapDetector** | `bf6-portal-utils/map-detector` | Detects the current map via Team 1's HQ coordinates, since `mod.IsCurrentMap` is unreliable |
| **MultiClickDetector** | `bf6-portal-utils/multi-click-detector` | Detects rapid repeated triggers of a `mod.SoldierStateBool` |
| **PlayerUndeployFixer** | `bf6-portal-utils/player-undeploy-fixer` | Manually fires `OnPlayerUndeploy` for players (often AI bots) stuck in limbo after death |
| **PortalGadget** | `bf6-portal-utils/portal-gadget` | High-level API for the Portal Gadget laser — zoom state, stable target snapshots |
| **ScavengerDrop** | `bf6-portal-utils/scavenger-drop` | Fires custom logic when a player scavenges a dead player's kit bag |
| **Sounds** | `bf6-portal-utils/sounds` | Wraps `mod.SFX` playback with 2D/3D routing, timed playback, and stepped fades |
| **FFADropIns** | `bf6-portal-utils/ffa-drop-ins` | Free-for-all spawning via developer-curated drop-in points, with a deploy-delay prompt |
| **FFASpawnPoints** | `bf6-portal-utils/ffa-spawn-points` | Free-for-all spawning via developer-curated fixed spawn points |

## Design intent

Every module here is a thin, fully-typed wrapper over real `mod.*` calls —
it never hides a call behind something that returns `any`, and several
modules (`ModExtensions`, `MapDetector`) exist specifically to typed-wrap
runtime behavior the official `.d.ts` doesn't cover or gets wrong. If a
module's behavior doesn't match what you observe at runtime, check the
[API Reference → utils](/reference/utils/) for the exact generated
signature before assuming the module is wrong.

## Bundling

Portal expects one script file, not an ES module graph. The community
[`bf6-portal-bundler`](https://www.npmjs.com/package/bf6-portal-bundler)
tool inlines your imports — including whichever `bf6-portal-utils` modules
you used — into a single deployable file, and merges any per-module
`strings.json` fragments a module (like `Logger`) ships with its source.
