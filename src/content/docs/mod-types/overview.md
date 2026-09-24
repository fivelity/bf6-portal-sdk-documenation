---
title: Overview & Schemas
description: What bf6-portal-mod-types provides and how its type surface is organized.
---

`bf6-portal-mod-types` is the raw type declaration package for the Portal
runtime. It has no runtime code of its own — installing it gives TypeScript
visibility into the ambient `mod` namespace that the Portal QuickJS runtime
injects at execution time. You never import from this package; the types
are globally available once `"types": ["bf6-portal-mod-types"]` is set in
`tsconfig.json` (see [Installation & Setup](/guides/installation/)).

## What's covered

The whole surface lives inside a single ambient `declare namespace mod { ... }`
declaration, split across a few files that TypeDoc treats as one merged
namespace:

- **`mod.*` functions** — **431 functions** covering everything from vector
  math (`mod.CreateVector`) to player state (`mod.GetSoldierState`) to
  spawning, UI, sound, and raycasting.
- **`mod.EventHandlerSignatures.*`** — **79 function signatures**
  describing every lifecycle hook the runtime can call into your mode
  (`OnPlayerDied`, `OngoingPlayer`, `OnCapturePointCaptured`, and so on).
  These are signatures the runtime expects you to export, not something you
  call — see [Event Handlers & Enums](/mod-types/events-and-enums/) for the
  export/ownership rules.
- **Enums** — **83 enums**, including gameplay constants
  (`PlayerDeathTypes`, `Factions`, `Gadgets`, `SoldierStateVector`) and one
  `RuntimeSpawn_<MapName>` enum per official map, holding that map's valid
  spawn-related ObjIds.
- **Type aliases** — **41 type aliases**, including the opaque object types
  (`Player`, `Vehicle`, `Vector`, `Object`) described in
  [Player / Vehicle / Game Mode Interfaces](/mod-types/interfaces/).

## Why the types matter more than usual

Portal's runtime objects are **opaque** — a `mod.Player` has no enumerable
properties or methods you can inspect by trial and error; you can only
compare it with `mod.Equals` or read its numeric ID with `mod.GetObjId`.
Because of that, the type declarations are effectively the only
documentation that can't drift from reality, as long as they're read
directly rather than recalled from memory or copied out of a tutorial. This
is also why every [API Reference](/reference/mod-types/) page on this site
is generated straight from the installed `.d.ts`, not hand-written.

## Reading the reference

The [API Reference → mod-types](/reference/mod-types/) section mirrors the
package's own structure — everything sits under the single `mod` namespace.
Start with:

- [Event Handlers & Enums](/mod-types/events-and-enums/) for how the runtime
  calls into your code, and the single-implementation-per-event rule
- [Player / Vehicle / Game Mode Interfaces](/mod-types/interfaces/) for the
  opaque object types and how to read/compare them safely
