---
title: Overview & Schemas
description: What bf6-portal-mod-types provides and how its type surface is organized.
---

`bf6-portal-mod-types` is the raw type declaration package for the Portal
runtime. It has no runtime code of its own — installing it gives TypeScript
visibility into the `mod` global, the `Events` namespace, and every enum and
interface the runtime exposes.

## What's covered

- **The `mod` namespace** — functions like `mod.Wait`, `mod.CreateVector`,
  `mod.GetSoldierState`, and every other runtime call available to a script.
- **`Events.On*`** — subscribable event objects for lifecycle hooks
  (`OnPlayerDied`, `OnPlayerEnterAreaTrigger`, `OnSpawnerSpawned`, and so on).
- **Enums** — closed sets of runtime constants, such as
  `SoldierStateVector` or team/faction identifiers.
- **Interfaces** — the shape of runtime objects like `mod.Player`,
  `Vector`, `CapturePoint`, and `AreaTrigger`.

## Why the types matter more than usual

Because Portal's runtime objects are largely opaque at the JavaScript level
(a `mod.Player` has no enumerable methods you can inspect by trial and
error), the type declarations are effectively the only documentation that
can't drift from reality — as long as they're read directly rather than
recalled from memory or copied out of a tutorial. This is also why every
[API Reference](/reference/mod-types/) page on this site is generated
straight from the installed `.d.ts`, not hand-written.

## Reading the reference

The [API Reference → mod-types](/reference/mod-types/) section mirrors the
package's own module structure. Start with:

- [Event Handlers & Enums](/mod-types/events-and-enums/) if you're wiring up
  gameplay logic
- [Player / Vehicle / Game Mode Interfaces](/mod-types/interfaces/) if you
  need to know what fields and methods a given runtime object exposes
