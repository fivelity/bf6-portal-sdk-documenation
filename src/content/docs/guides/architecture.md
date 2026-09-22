---
title: Architecture & Core Concepts
description: The runtime rules every Portal mode built on this SDK needs to respect.
---

Portal's scripting runtime has a handful of hard constraints that aren't
obvious from the type signatures alone. Getting these wrong doesn't produce a
compile error — it produces a mode that silently misbehaves at runtime.

## Single-owner event handlers

Portal allows **exactly one** implementation per raw event. If two systems in
your codebase both subscribe to the same underlying event independently, the
second silently overrides the first — UI click handlers included.

The fix is to always subscribe through a namespaced event bus rather than a
raw handler assignment, so every listener composes instead of overwriting:

```ts
import { Events } from 'bf6-portal-mod-types';

Events.OnPlayerDied.subscribe((player, killer) => {
  // your logic
});
```

If two features need to react to the same event, they should both call
`.subscribe(...)` on the same `Events.OnX` — never assign to a raw callback
property directly.

## No fabricated symbols

Because Portal's SDK has changed across versions and unofficial tutorials
lag behind (or invent APIs outright), treat the installed `.d.ts` as the only
source of truth. Common fabrications that show up in community write-ups but
don't exist in the real SDK:

| Claimed symbol | Reality |
|---|---|
| `player.GetPosition()` | The player object is opaque with no methods — use `mod.GetSoldierState(player, SoldierStateVector.GetPosition)` |
| `mod.RayCast(...)` returning a hit result | The real signature returns `void`; hits arrive via `OnRayCastHit` / `OnRayCastMissed` events |
| `Network.OnReceiveFromClient` | No `Network` namespace exists |
| `Input.OnActionPressed` | No `Input` namespace exists |
| `new mod.Vector(x, y, z)` | Vectors are built with `mod.CreateVector(x, y, z)` only |
| `mod.getTeamId` / `mod.getPlayerId` | Not present — use `mod.GetTeam(player)` |

When in doubt, check the [API Reference](/reference/mod-types/) — it's
generated straight from the type package, so anything not listed there
doesn't exist.

## ObjIds are scene data, not constants you invent

Every `CapturePoint`, `AreaTrigger`, `Spawner`, and `WorldIcon` your mode
references is an integer ObjId that must match an object actually placed in
the level's scene JSON. Centralize these in one config module and never
inline a numeric ObjId literal elsewhere — a typo'd or stale ID fails at
runtime, not at compile time, since the type system has no way to know which
integers are valid for a given map.

## Signals over polling

`bf6-portal-utils` favors a reactive, signal-driven style for anything that
drives UI or repeated state checks, rather than polling game state every
tick. Prefer deriving UI state from a signal that updates on the relevant
event, and throttle expensive recomputation rather than re-running it on
every frame.

## Separating persistent from wipeable state

If your mode has any notion of risk (lost-on-death inventory, spent
currency), keep that state distinct from anything meant to persist for the
whole match (score, unlocked tiers). Conflating the two is a common source of
bugs where a "permanent" unlock resets unexpectedly on respawn.

## Next: build something

The [Quickstart Guide](/guides/quickstart/) walks through scaffolding a
minimal mode that uses both packages together.
