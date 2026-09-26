---
title: Other Modules
description: Raycast, Sounds, PortalGadget, PerformanceStats, MapDetector, and the remaining smaller bf6-portal-utils modules.
---

The modules below round out `bf6-portal-utils`. Each is self-contained and
imported by its own subpath — see
[Module Usage Examples](/utils/module-examples/) for code and the
[API Reference → utils](/reference/utils/) for full generated signatures.

## Raycast — `bf6-portal-utils/raycast`

Portal's native raycast API doesn't attribute a hit or miss back to the
specific ray that caused it when multiple rays are in flight. `Raycast`
subscribes to `OnRayCastHit`/`OnRayCastMissed` via `Events` at load time,
tracks active rays per player with a TTL cleanup system, and matches hits
to the correct ray using geometric distance — so you pass callbacks
directly to `cast()` instead of correlating events yourself:

```ts
import { Raycast } from 'bf6-portal-utils/raycast';
import { Events } from 'bf6-portal-utils/events';

Events.OnPlayerDeployed.subscribe((player) => {
  const origin = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
  const direction = mod.GetSoldierState(player, mod.SoldierStateVector.GetDirection);
  const end = mod.VectorAdd(origin, mod.VectorScale(direction, 100));

  Raycast.cast(
    player,
    { x: mod.XComponentOf(origin), y: mod.YComponentOf(origin), z: mod.ZComponentOf(origin) },
    { x: mod.XComponentOf(end), y: mod.YComponentOf(end), z: mod.ZComponentOf(end) },
    { onHit: (hit) => { /* ... */ }, onMiss: () => { /* ... */ } },
  );
});
```

Like `UI`, importing `Raycast` means you must route all your own event
subscriptions through `Events` — it owns `OnRayCastHit`/`OnRayCastMissed`.

## Sounds — `bf6-portal-utils/sounds`

Wraps Portal's `mod.SFX` workflow: spawning sound objects, playing them in
2D or 3D with per-player, per-squad, or per-team routing, timed playback,
and stepped fades. Built on [`Timers`](/utils/timers-and-clocks/) for delay
and fade scheduling, since the runtime has no native `setTimeout`.

## PortalGadget — `bf6-portal-utils/portal-gadget`

A high-level API for the Portal Gadget's laser behavior. It captures
player state at fire start/stop so your handlers get a stable snapshot
(`isZooming` plus a lazy `getTarget()`), abstracting the undocumented laser
origin/angle offsets that differ between zoomed and hip-fired states.

## PerformanceStats — `bf6-portal-utils/performance-stats`

Subscribes to `Events.OngoingGlobal` to track live server tick rate and
script timeout lag, exposing smoothed getters over a 1-second sampling
window. Logs a warning when the server is under stress (timeout lag over
100ms or tick rate below 25Hz), useful for compute-scaling decisions or a
debug HUD without polling raw values yourself.

## MapDetector — `bf6-portal-utils/map-detector`

`mod.IsCurrentMap` is currently unreliable, so `MapDetector` instead
detects the active map by analyzing Team 1's HQ coordinates against known
per-map values.

## MultiClickDetector — `bf6-portal-utils/multi-click-detector`

Detects rapid repeated triggers of any `mod.SoldierStateBool` (e.g. a
player mashing a jump or reload input), useful for secret inputs or
combo-style mechanics.

## PlayerUndeployFixer — `bf6-portal-utils/player-undeploy-fixer`

Subscribes to `OnPlayerDied`, `OnPlayerUndeploy`, and `OnPlayerLeaveGame`
via `Events`, and tracks whether a player who died actually undeploys
within 30 seconds. If the engine never fires `OnPlayerUndeploy` (a known
issue that mainly affects static AI bots), it manually triggers
`Events.OnPlayerUndeploy.trigger(player)` so your own subscribers still run
— preventing a slowly-growing population of stuck, never-respawning bots.

## ScavengerDrop — `bf6-portal-utils/scavenger-drop`

Detects when a player scavenges a dead player's kit bag (which despawns
after ~37 seconds and doesn't replenish ammo by default), firing a
callback you can use for custom resupply logic, messages, or other effects
once the first player gets within 2 meters of the body.

## FFADropIns & FFASpawnPoints — `bf6-portal-utils/ffa-drop-ins` / `bf6-portal-utils/ffa-spawn-points`

Both short-circuit the normal deploy flow for free-for-all modes with a
custom "spawn now or wait" UI prompt, so players can adjust loadout and
settings before dropping in without being locked out of the decision.
`FFADropIns` uses developer-curated drop-in points; `FFASpawnPoints` uses
developer-curated fixed spawn points.

## CallbackHandler — `bf6-portal-utils/callback-handler`

The error-isolation primitive several modules above (`Timers`, `Events`,
`UI`, `Raycast`, `Clocks`) use internally to invoke user callbacks safely —
it catches synchronous throws and rejected promises, logs them via
`Logging`, and never rethrows, so one failing callback can't take down the
caller. Useful directly in your own code wherever you invoke an
optional or user-provided callback.

## Logging — `bf6-portal-utils/logging`

The shared fail-safe log-level abstraction other modules configure via
their own `setLogging()` calls (`Events.setLogging`, `Timers.setLogging`,
and so on).

## Benchmarker — `bf6-portal-utils/benchmarker`

Small helpers for measuring how long pure JS work takes inside the
QuickJS runtime — "how many times can I run this loop in 10ms" style
questions — without hand-rolling your own timing loop.
