---
title: Player / Vehicle / Game Mode Interfaces
description: The shape of the core runtime objects — players, vehicles, and game mode entities.
---

## `mod.Player`

The player object passed into most event handlers is **opaque** — it does
not expose methods like `.getPosition()` directly. Instead, you pass the
player reference into free functions on `mod`:

```ts
import { mod, SoldierStateVector } from 'bf6-portal-mod-types';

function getPosition(player: mod.Player) {
  return mod.GetSoldierState(player, SoldierStateVector.GetPosition);
}
```

This is a common source of confusion coming from tutorials that assume an
object-oriented `player.GetPosition()` call exists — it doesn't. See
[Architecture → No fabricated symbols](/guides/architecture/#no-fabricated-symbols)
for a fuller list of these mismatches.

## Vehicles

Vehicle references follow the same opaque-object pattern as players —
query state through `mod.*` functions rather than instance methods. Check
the [API Reference](/reference/mod-types/) for the vehicle-specific state
vector options, which differ from the player set.

## Game mode entities

The interfaces you'll reference most often when wiring objective logic:

- **`CapturePoint`** — a scoring/ownership object, read via
  `mod.GetCurrentOwnerTeam` and `mod.GetCaptureProgress` rather than tracked
  manually, so your UI and your logic can never disagree about ownership.
- **`AreaTrigger`** — a spatial trigger volume; enter/exit events fire
  against a specific `AreaTrigger` reference, not a coordinate check you run
  yourself.
- **`WorldIcon`** — a minimap marker, independently positionable via
  `mod.SetWorldIconPosition`. Because a `WorldIcon` is cosmetic, moving one
  does **not** move the `CapturePoint` or `AreaTrigger` it's layered over —
  those stay fixed at their authored scene position, since
  `MoveObjectOverTime` excludes both from its parameter union.

:::note
A drifting objective on the minimap and a drifting scoring zone are two
different things unless your mode logic explicitly keeps them in sync. Don't
assume moving the icon moves the trigger.
:::

## Where types come from

Every interface here is generated from the installed package version, so
field names and optionality always match what `tsc` will accept — see the
[API Reference → mod-types](/reference/mod-types/) for the generated pages.
