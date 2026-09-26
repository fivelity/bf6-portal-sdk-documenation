---
title: Architecture & Core Concepts
description: The runtime rules every Portal mode built on this SDK needs to respect.
---

Portal's scripting runtime has a handful of hard constraints that aren't
obvious from the type signatures alone. Getting these wrong doesn't produce a
compile error — it produces a mode that silently misbehaves at runtime.

## Single-owner event handlers

The Portal runtime scans your compiled mode for exported functions matching
an event handler name (`OnPlayerDied`, `OngoingPlayer`,
`OnCapturePointCaptured`, and 76 others under
`mod.EventHandlerSignatures`) and calls them directly when that event
fires. It allows **exactly one exported implementation of each handler name
per compiled mode**. If two files in your codebase both export a function
called `OnPlayerDied`, only one silently survives the build.

`bf6-portal-utils` solves this with its
[`Events` module](/utils/events/), which owns every raw handler once and
lets the rest of your codebase subscribe from as many places as needed:

```ts
import { Events } from 'bf6-portal-utils/events';

Events.OnPlayerDied.subscribe((victim, killer, deathType, weapon) => {
  // any number of subscribers can react to this
});
```

Once you adopt `Events`, **never export a raw event handler function
yourself** — several other `bf6-portal-utils` modules (`UI`, `Raycast`,
`Clocks`) rely on `Events` owning those hooks internally and will conflict
with a hand-written handler of the same name.

See [Event Handlers & Enums](/mod-types/events-and-enums/) for the full
rule, and [bf6-portal-utils → Events](/utils/events/) for the subscription
API.

## No fabricated symbols

Because unofficial tutorials and AI-generated snippets sometimes invent
Portal APIs that don't exist, treat the installed `.d.ts` as the only
source of truth — this site's [API Reference](/reference/mod-types/) is
generated straight from it. A few real vs. commonly-assumed distinctions
worth knowing up front:

| Real API | Common mistake |
| --- | --- |
| `mod.GetObjId(player)` for a stable ID, `mod.Equals(a, b)` to compare | `player.id`, `player === otherPlayer` — `Player` is opaque, it has no properties to read directly |
| `mod.CreateVector(x, y, z)` | `new mod.Vector(x, y, z)` — `Vector` is an opaque type, not a constructible class |
| `mod.RayCast(...)` returns `void`; results arrive via `OnRayCastHit` / `OnRayCastMissed` | Assuming the call itself returns a hit result synchronously |
| `console.log(...)` only | `console.error` / `console.warn` — the injected `console` global has a single `log` method |
| `mod.Wait(seconds)` returns `Promise<void>` | A synchronous sleep — `Wait` must be `await`ed inside an `async` handler |

When in doubt, check the [API Reference](/reference/mod-types/) — it's
generated from the type package, so anything not listed there doesn't exist.

## ObjIds are scene data, not constants you invent

Every `CapturePoint`, `AreaTrigger`, `Spawner`, and other scene entity your
mode references resolves to an integer ObjId via `mod.GetObjId`, and that
integer must match an object actually placed in the level's scene data.
Centralize these in one config module and never inline a numeric ObjId
literal elsewhere — a typo'd or stale ID fails at runtime, not at compile
time, since the type system has no way to know which integers are valid for
a given map.

## QuickJS has no native timers

Portal mode scripts run in a QuickJS runtime, which does **not** ship
`setTimeout`/`setInterval`. The only native primitive for delayed or
recurring execution is `mod.Wait(seconds)` (an awaitable delay inside an
`async` handler). For cancellable timers, concurrent timers, or the
familiar `setTimeout`/`setInterval` API shape, use the
[`Timers` module](/utils/timers-and-clocks/) from `bf6-portal-utils`, which
implements them on top of `mod.Wait` internally.

## UI ownership follows the same single-owner rule

The [`UI` module](/utils/ui-components/) subscribes to
`OnPlayerUIButtonEvent` via `Events` at load time to dispatch button
callbacks automatically. If you bring in `UI` (or `Raycast`, which
similarly owns `OnRayCastHit`/`OnRayCastMissed`), you must route **all**
your own event subscriptions through `Events` too — exporting a raw
handler of your own for an event a `bf6-portal-utils` module already owns
will conflict with it.

## Next: build something

The [Quickstart Guide](/guides/quickstart/) walks through scaffolding a
minimal mode that uses both packages together.
