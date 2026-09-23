---
title: Mod Extensions
description: ModExtensions wraps undocumented runtime behavior — event-type comparisons and runtime string lookup — behind typed helpers.
---

The Portal runtime exposes some additional behavior beyond what
`bf6-portal-mod-types`' official `.d.ts` documents. `ModExtensions`
(`bf6-portal-utils/mod-extensions`) wraps that behind typed helpers so you
never need to reach for an `as any` cast on `mod` yourself.

## Event-type comparisons

Event payloads for damage, death, gadgets, and weapons arrive as opaque
types (`mod.DamageType`, `mod.DeathType`, `mod.WeaponUnlock`) that don't
compare cleanly against the corresponding enum. `ModExtensions` provides
both a boolean comparison and a resolver for each:

```ts
import { ModExtensions } from 'bf6-portal-utils/mod-extensions';
import { Events } from 'bf6-portal-utils/events';

Events.OnPlayerDied.subscribe((victim, killer, deathType) => {
  if (ModExtensions.isDeathType(deathType, mod.PlayerDeathTypes.Headshot)) {
    // headshot-specific logic
  }
});
```

| Function | Signature |
|---|---|
| `isDamageType` | `(eventDamageType: mod.DamageType, playerDamageType: mod.PlayerDamageTypes) => boolean` |
| `isDeathType` | `(eventDeathType: mod.DeathType, playerDeathType: mod.PlayerDeathTypes) => boolean` |
| `isGadget` | `(weaponUnlock: mod.WeaponUnlock, gadget: mod.Gadgets) => boolean` |
| `isWeapon` | `(weaponUnlock: mod.WeaponUnlock, weapon: mod.Weapons) => boolean` |
| `getPlayerDamageType` | `(eventDamageType: mod.DamageType) => mod.PlayerDamageTypes \| undefined` |
| `getPlayerDeathType` | `(eventDeathType: mod.DeathType) => mod.PlayerDeathTypes \| undefined` |
| `getGadget` | `(weaponUnlock: mod.WeaponUnlock) => mod.Gadgets \| undefined` |
| `getWeapon` | `(weaponUnlock: mod.WeaponUnlock) => mod.Weapons \| undefined` |

The resolver functions (`getPlayerDamageType`, `getWeapon`, and so on)
return `undefined` when the event payload doesn't map to a known enum
member — always handle that case rather than assuming a match.

## Runtime string lookup

`getString(key)` reads a value out of `mod.strings`, the object populated
from your mod's `strings.json` at runtime:

```ts
const label = ModExtensions.getString('gameMode.hud.section.label');
```

`getString` returns `string | undefined` — the key may not exist if it
wasn't defined in your `strings.json` or wasn't bundled correctly.

See the [API Reference → utils/mod-extensions](/reference/utils/) for the
complete generated signatures.
