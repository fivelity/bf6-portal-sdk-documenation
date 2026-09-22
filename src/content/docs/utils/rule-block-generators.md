---
title: Rule Block Generators
description: Factory functions that assemble common Portal rule patterns from typed pieces.
---

Rule block generators are factory functions that compose several `mod.*` and
`Events.On*` calls into one reusable pattern. They exist to eliminate the
copy-pasted "weighted zone majority" or "recurring timed reward" loops that
show up in almost every mode.

## Weighted zone majority tally

The pattern behind a King-of-the-Hill-style scoring loop — tally weighted
presence across one or more zones on an interval, and award a point to
whichever faction holds the highest weighted count for that tick.

```ts
import { mod } from 'bf6-portal-mod-types';
import { createWeightedZoneTally } from 'bf6-portal-utils';

interface ZoneDefinition {
  readonly areaTriggerId: number;
  readonly presenceWeight: number;
}

const zones: readonly ZoneDefinition[] = [
  { areaTriggerId: 900, presenceWeight: 1 }, // Control Zone
  { areaTriggerId: 901, presenceWeight: 2 }, // HotZone
];

const tally = createWeightedZoneTally({
  zones,
  tickIntervalSeconds: 10,
  onFactionWins: (team: mod.Team) => {
    awardTicket(team);
  },
});

tally.start();

function awardTicket(team: mod.Team): void {
  // ...
}
```

`createWeightedZoneTally` handles the `OnPlayerEnterAreaTrigger` /
`OnPlayerExitAreaTrigger` bookkeeping and the recurring tick internally —
your mode only supplies the zone weights and the win callback.

## Timed recurring reward

For patterns like "every N seconds, pay out cash to whoever holds an
objective":

```ts
import { createIntervalReward } from 'bf6-portal-utils';

createIntervalReward({
  intervalSeconds: 15,
  reward: (player) => {
    grantCash(player, 100);
    grantXp(player, 'support', 120);
  },
  eligiblePlayers: () => getPlayersHoldingObjective(),
}).start();

function grantCash(player: unknown, amount: number): void {
  // ...
}
function grantXp(player: unknown, track: string, amount: number): void {
  // ...
}
function getPlayersHoldingObjective(): readonly unknown[] {
  return [];
}
```

## Batch spawn queue

For a Squad-style deployment wave — players opt into a queue and are spawned
together on an interval, rather than individually on a per-death timer:

```ts
import { createBatchSpawnQueue } from 'bf6-portal-utils';

const deployQueue = createBatchSpawnQueue({
  batchIntervalSeconds: 15,
  spawnPointId: 9010,
});

function onPlayerRequestsDeploy(playerId: string): void {
  deployQueue.enqueue(playerId);
}

deployQueue.start();
```

Internally this uses a confirmed `mod.Wait` loop rather than any kind of
client-triggered RPC — Portal's SDK has no client-to-server message channel
to build that pattern on.

See the [API Reference → utils](/reference/utils/) for every generator's
full option type and return shape.
