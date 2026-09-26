---
title: State & Rule Patterns
description: How to structure per-player state and rule logic on Portal — there are no rule-block generator or state-store modules, so this shows the supported patterns.
---

:::note[No generator or store module exists]
`bf6-portal-utils` ships no "rule block generator" or "state management"
module — the 21 modules are listed in the [Overview](/utils/overview/).
Portal itself has no native currency, XP, or per-player storage primitive,
so custom state is ordinary TypeScript you attach to a player's numeric ID.
The patterns below use only real APIs.
:::

## Key state by ObjId

`mod.Player` is opaque, so it cannot be a `Map` key by value semantics you
can rely on across handlers. Key by `mod.GetObjId(player)`:

```ts
interface PlayerStats {
  kills: number;
  deaths: number;
}

const stats = new Map<number, PlayerStats>();

function statsFor(player: mod.Player): PlayerStats {
  const id: number = mod.GetObjId(player);
  const existing = stats.get(id);
  if (existing !== undefined) return existing;
  const created: PlayerStats = { kills: 0, deaths: 0 };
  stats.set(id, created);
  return created;
}
```

## Wire rules through `Events`

Express each "rule" as a subscription, and clean up on leave so state
doesn't leak:

```ts
import { Events } from 'bf6-portal-utils/events';

Events.OnPlayerEarnedKill.subscribe((killer) => {
  statsFor(killer).kills += 1;
});

Events.OnPlayerDied.subscribe((victim) => {
  statsFor(victim).deaths += 1;
});

Events.OnPlayerLeaveGame.subscribe((playerId: number) => {
  stats.delete(playerId);
});
```

## Time-based rules

Combine state with [`Timers`](/utils/timers-and-clocks/) for periodic rules,
for example logging a scoreboard snapshot every 30 seconds:

```ts
import { Timers } from 'bf6-portal-utils/timers';

Timers.setInterval(() => {
  for (const [id, s] of stats) {
    console.log(`player ${id}: ${s.kills}K / ${s.deaths}D`);
  }
}, 30_000);
```

For UI bound to this state, see [Solid UI](/utils/solid-ui/).
