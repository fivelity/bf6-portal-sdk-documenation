---
title: Event Handlers & Enums
description: How mod.EventHandlerSignatures works, and the enum patterns used across the runtime.
---

## The raw event handler contract

Every lifecycle hook the Portal runtime can call into is described by a
function signature under `mod.EventHandlerSignatures` — **79 of them**, for
example:

```ts
// mod.EventHandlerSignatures.OnPlayerDied — the *signature*, not a callable
function OnPlayerDied(
  eventPlayer: mod.Player,
  eventOtherPlayer: mod.Player,
  eventDeathType: mod.DeathType,
  eventWeaponUnlock: mod.WeaponUnlock,
): void;
```

These are **not** something you call, subscribe to, or import from
`bf6-portal-mod-types` at runtime. They exist purely so TypeScript can check
the shape of a handler you export. The Portal runtime scans your compiled
mode for a same-named exported function (`OnPlayerDied`, `OngoingPlayer`,
`OnCapturePointCaptured`, and so on) and calls it directly when that event
fires.

:::caution[Exactly one implementation per event, project-wide]
The runtime allows **one** exported implementation of each event handler
name per entire compiled mode. If two files in your codebase both export a
function named `OnPlayerDied`, only one survives the build — silently. This
is the single biggest gotcha in Portal scripting, and it's why
`bf6-portal-utils` ships a dedicated
[`Events` module](/utils/events/) that owns every raw handler once and
lets the rest of your codebase subscribe to it from as many places as
needed:

```ts
import { Events } from 'bf6-portal-utils/events';

Events.OnPlayerDied.subscribe((player, killer, deathType, weaponUnlock) => {
  // your logic — any number of subscribers here is fine
});
```

Once you bring in `Events`, **never export a raw `OnPlayerDied` (or any
other event name) yourself** — the module owns that hook. See
[bf6-portal-utils → Events](/utils/events/) for the full API, including the
async-handler and error-isolation behavior.
:::

## Enums

Enums describe closed sets of runtime constants. The package ships **83**
of them, including:

| Category | Examples |
| --- | --- |
| Gameplay constants | `PlayerDeathTypes`, `PlayerDamageTypes`, `Factions`, `Gadgets`, `AmmoTypes`, `ArmorTypes` |
| State-vector selectors | `SoldierStateVector`, `SoldierStateNumber`, `SoldierStateBool` — passed to `mod.GetSoldierState` |
| Per-map spawn data | One `RuntimeSpawn_<MapName>` enum per official map (e.g. `RuntimeSpawn_Aftermath`, `RuntimeSpawn_Granite_Downtown`) — named identifiers for that map's runtime-spawnable props and set dressing |

Because these are genuine TypeScript enums rather than string literals you
might mistype, referencing an invalid member is a compile error rather than
a silent runtime failure — one of the strongest arguments for keeping
`strict` mode on.

See the [API Reference](/reference/mod-types/) for the full, generated enum
list with every member and its underlying value.
