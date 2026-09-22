---
title: Quickstart Guide
description: Scaffold a minimal Portal mode using bf6-portal-mod-types and bf6-portal-utils together.
---

This walks through a minimal but complete mode script: a kill-reward system
that pays out cash and XP, entirely typed, with no `any`.

## 1. Project layout

```
my-mode/
├── src/
│   ├── config/
│   │   └── ids.ts       # ObjId constants — the only place numeric IDs live
│   ├── player/
│   │   └── state.ts     # per-player custom state shape
│   └── mode.ts           # event wiring / rule logic entry point
├── package.json
└── tsconfig.json
```

## 2. Define player state

Portal has no native currency or XP primitive — both are custom state you
attach to each connected player.

```ts title="src/player/state.ts"
export interface ModePlayerState {
  readonly playerId: string;
  wallet: number;
  assaultXp: number;
}

const playerState = new Map<string, ModePlayerState>();

export function getOrCreateState(playerId: string): ModePlayerState {
  const existing = playerState.get(playerId);
  if (existing) return existing;

  const created: ModePlayerState = { playerId, wallet: 10_000, assaultXp: 0 };
  playerState.set(playerId, created);
  return created;
}
```

## 3. Centralize ObjIds

```ts title="src/config/ids.ts"
export const ObjIds = {
  controlZoneTrigger: 900,
  controlZoneCapture: 9000,
} as const;
```

## 4. Wire the event

```ts title="src/mode.ts"
import { Events } from 'bf6-portal-mod-types';
import { getOrCreateState } from './player/state';

const KILL_CASH_REWARD = 500;
const KILL_XP_REWARD = 150;

Events.OnPlayerDied.subscribe((player, killer) => {
  if (!killer) return;

  const killerState = getOrCreateState(killer.id);
  killerState.wallet += KILL_CASH_REWARD;
  killerState.assaultXp += KILL_XP_REWARD;
});
```

Note the single `.subscribe()` call — see
[Single-owner event handlers](/guides/architecture/#single-owner-event-handlers)
for why a second raw handler on `OnPlayerDied` elsewhere in your codebase
would silently break this one.

## 5. Type-check before deploying

```bash
pnpm exec tsc --noEmit
```

A clean run means every symbol you referenced — `Events.OnPlayerDied`,
`killer.id`, and so on — actually exists in the installed SDK version. If
something doesn't compile, check the [API Reference](/reference/mod-types/)
for the real signature rather than guessing.

## Where to go next

- [bf6-portal-mod-types → Event Handlers & Enums](/mod-types/events-and-enums/)
  for the full list of available events
- [bf6-portal-utils → Rule Block Generators](/utils/rule-block-generators/)
  for higher-level helpers that wrap common patterns like this one
