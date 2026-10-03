---
title: Architecture & Core Concepts
description: The runtime rules every Portal mode built on this SDK needs to respect.
---

Portal's scripting runtime plays by a few rules that you won't find anywhere
in the type signatures. That's the tricky part — break one of these and
nothing complains at compile time. Your mode just quietly does the wrong
thing once it's live, which is a much worse time to find out. So let's get
them out in the open now.

## Only one handler gets to answer each event

Here's the thing about Portal's event system: it scans your compiled mode
for exported functions with recognized handler names — `OnPlayerDied`,
`OngoingPlayer`, `OnCapturePointCaptured`, and 76 more living under
`mod.EventHandlerSignatures` — and calls them directly when the moment
comes. But it only ever keeps **one** implementation per handler name. Export
`OnPlayerDied` from two different files and the build won't warn you; it'll
just quietly drop one of them.

`bf6-portal-utils` exists partly to make this problem disappear. Its
[`Events` module](/utils/events/) claims each raw handler exactly once, then
lets the rest of your codebase subscribe to it from as many places as you
want:

```ts
import { Events } from 'bf6-portal-utils/events';

Events.OnPlayerDied.subscribe((victim, killer, deathType, weapon) => {
  // any number of subscribers can react to this
});
```

Once `Events` is in the picture, don't export a raw handler yourself —
other `bf6-portal-utils` modules (`UI`, `Raycast`, `Clocks`) are quietly
relying on `Events` to own those hooks, and a hand-written handler with the
same name will step on their toes.

Want the full rulebook? [Event Handlers & Enums](/mod-types/events-and-enums/)
covers it, and [bf6-portal-utils → Events](/utils/events/) is where the
subscription API lives.

## If it's not in the types, it doesn't exist

Unofficial tutorials and AI-generated snippets have a habit of inventing
Portal APIs that sound plausible but aren't real. The safest rule: trust the
installed `.d.ts` and nothing else — our [API Reference](/reference/mod-types/)
is generated straight from it, so if a symbol isn't there, it isn't real.
Here are a few mix-ups worth knowing before they cost you a debugging
session:

| Real API | Common mistake |
| --- | --- |
| `mod.GetObjId(player)` for a stable ID, `mod.Equals(a, b)` to compare | `player.id`, `player === otherPlayer` — `Player` is opaque, it has no properties to read directly |
| `mod.CreateVector(x, y, z)` | `new mod.Vector(x, y, z)` — `Vector` is an opaque type, not a constructible class |
| `mod.RayCast(...)` returns `void`; results arrive via `OnRayCastHit` / `OnRayCastMissed` | Assuming the call itself returns a hit result synchronously |
| `console.log(...)` only | `console.error` / `console.warn` — the injected `console` global has a single `log` method |
| `mod.Wait(seconds)` returns `Promise<void>` | A synchronous sleep — `Wait` must be `await`ed inside an `async` handler |

Still unsure? The [API Reference](/reference/mod-types/) is generated
directly from the type package — if you don't see it listed there, it
doesn't exist.

## ObjIds come from the scene, not your imagination

Every `CapturePoint`, `AreaTrigger`, `Spawner`, or other scene entity your
mode touches boils down to an integer ObjId via `mod.GetObjId`, and that
number has to match something actually placed in the level's scene data.
There's no type-level safety net here — the compiler has no idea which
integers are valid for a given map, so a stale or mistyped ID fails
silently at runtime, not at build time. Keep every ObjId in one config
module instead of scattering numeric literals through your codebase, and
future-you will thank present-you.

## QuickJS doesn't know what `setTimeout` is

Portal mode scripts run inside QuickJS, which has no `setTimeout` or
`setInterval` — that's just not a thing here. The only native way to delay
or repeat something is `mod.Wait(seconds)`, an awaitable pause you call from
inside an `async` handler. If you want cancellable timers, several running
at once, or something that just *feels* like `setTimeout`/`setInterval`
again, reach for the [`Timers` module](/utils/timers-and-clocks/) in
`bf6-portal-utils` — it builds that familiar shape on top of `mod.Wait`
under the hood.

## UI plays by the same one-owner rule

The [`UI` module](/utils/ui-components/) subscribes to
`OnPlayerUIButtonEvent` through `Events` the moment it loads, so it can
dispatch your button callbacks automatically. Bring in `UI` (or `Raycast`,
which owns `OnRayCastHit`/`OnRayCastMissed` the same way) and the deal is:
all of *your* subscriptions need to go through `Events` too. Export a raw
handler for something a `bf6-portal-utils` module already owns, and you're
back to the same silent conflict from the top of this page.

## Next up: actually building something

You've got the ground rules — now let's put them to use. The
[Quickstart Guide](/guides/quickstart/) walks through scaffolding a minimal
mode that brings both packages together.
