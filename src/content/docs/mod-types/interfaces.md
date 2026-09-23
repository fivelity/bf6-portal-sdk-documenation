---
title: Player / Vehicle / Game Mode Interfaces
description: The opaque object types — players, vectors, objects — and how to read and compare them.
---

## Opaque types

Every core runtime reference in `bf6-portal-mod-types` — `Player`,
`Vehicle`, `Vector`, `Object` — is declared as an **opaque type**:

```ts
// The real declaration, from types.d.ts
type Player = object;
```

There is nothing to destructure or inspect directly. Each opaque type
carries a private `_opaque` brand property purely to stop TypeScript from
treating two different opaque types as interchangeable — it has no runtime
meaning and you never touch it.

## `mod.Player`

The player object passed into event handlers is opaque. You cannot call
`.getPosition()`, `.id`, or any other member on it directly — you always
pass the reference into free functions on `mod`:

```ts
import type { mod } from 'bf6-portal-mod-types';

function getPlayerId(player: mod.Player): number {
  return mod.GetObjId(player); // the only way to get a stable numeric ID
}

function isSamePlayer(a: mod.Player, b: mod.Player): boolean {
  return mod.Equals(a, b); // the only way to compare two opaque references
}
```

This is a common source of confusion for anyone coming from
object-oriented tutorials that assume a `player.GetPosition()` call
exists — it doesn't, on `Player` or on any other opaque type in this SDK.

## `mod.Vector`

`Vector` follows the same pattern:

```ts
type Vector = object; // opaque — build with mod.CreateVector, read with mod.Equals
```

- **Build** one with `mod.CreateVector(x, y, z)` — X is left/right
  (east positive), Y is up, Z is forward/back (north negative).
- **Read** the components with `mod.XComponentOf`, `mod.YComponentOf`,
  `mod.ZComponentOf`.
- **Compare** two vectors with `mod.Equals` — never `===`, which only
  checks reference identity on the opaque wrapper.
- **Get a player's position** two ways exist in the real SDK, and they are
  not interchangeable: `mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition)`
  reads through the soldier state system, while `mod.GetObjectPosition(player)`
  is the more efficient call recommended in the SDK's own doc comments for
  simple position reads.

Because working with three separate accessor calls for every vector
component gets verbose fast, `bf6-portal-utils` ships a
[`Vectors` module](/utils/vector-math/) with a transparent `{ x, y, z }`
`Vector3` type and conversion helpers to and from `mod.Vector` — see that
page for the full API.

## `mod.Object`

`Object` is the base opaque type that scene entities — capture points, area
triggers, spawners, world icons — resolve to when you read them with
`mod.GetObjId`. Every one of those entities is an integer ObjId that must
match something actually placed in the level's scene data; there's no way
for the type system to validate that a given integer literal is valid for a
specific map, so a stale or typo'd ObjId fails at runtime, not at compile
time. Centralize ObjIds in one config module rather than inlining numeric
literals throughout your mode.

## Where types come from

Every type here is generated from the installed package version, so field
names and signatures always match what `tsc` will accept — see the
[API Reference → mod-types](/reference/mod-types/) for the generated pages,
including the full `mod.Object`-derived type hierarchy.
