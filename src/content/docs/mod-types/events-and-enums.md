---
title: Event Handlers & Enums
description: How Events.On* subscriptions work, and the enum patterns used across the runtime.
---

## Subscribing to events

Every lifecycle hook in the runtime is exposed as an object on the `Events`
namespace with a `.subscribe(handler)` method — never a raw callback
property you assign directly.

```ts
import { Events } from 'bf6-portal-mod-types';

Events.OnPlayerEnterAreaTrigger.subscribe((player, trigger) => {
  // trigger is a typed AreaTrigger reference, not a bare number
});
```

:::caution
Portal allows exactly one implementation per raw event under the hood. If two
independent modules both call `.subscribe()` expecting to layer on top of
each other, confirm the specific event actually supports multiple listeners
in the installed type declarations — some do, some are single-owner. When in
doubt, route all handling for a given event through one module.
:::

## Common event families

| Prefix | Fires on | Typical use |
|---|---|---|
| `OnPlayer*` | Player lifecycle — death, spawn, undeploy, zone entry/exit | Scoring, state resets, zone tracking |
| `OnSpawner*` | AI or vehicle spawner activity | Confirming a spawn actually landed, since spawn calls don't return a usable handle |
| `OnRayCast*` | Raycast results | Placement/aim confirmation — the raycast call itself returns `void` |
| `Ongoing*` | Recurring ticks (e.g. every N seconds) | Zone majority tallies, timed rewards |

Always confirm the exact member name and payload shape against the
[API Reference](/reference/mod-types/) rather than assuming a name follows
the pattern above — the table is a guide to the shape of the surface, not a
substitute for the generated signatures.

## Enums

Enums describe closed sets of runtime constants — team identifiers, state
vector selectors passed to functions like `mod.GetSoldierState`, and similar
fixed vocabularies. Because these are genuine TypeScript enums (not string
literals you might mistype), referencing an invalid member is a compile
error rather than a silent runtime failure — one of the strongest arguments
for keeping `strict` mode on and avoiding `any` casts around SDK calls.

See the [API Reference](/reference/mod-types/) for the full enum list with
every member and its underlying value.
