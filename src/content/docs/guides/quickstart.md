---
title: Quickstart Guide
description: Scaffold a minimal, fully-typed Portal mode using bf6-portal-mod-types and bf6-portal-utils together.
---

This walks through a minimal but complete mode script: a kill-reward system
that pays out cash and XP, fully typed, with no `any`. Every snippet below
was compiled against `bf6-portal-mod-types@4.3.0` and
`bf6-portal-utils@9.4.0` under `strict` mode.

## 1. Project layout

```code
my-mode/
├── src/
│   ├── config/
│   │   └── ids.ts       # ObjId constants — the only place numeric IDs live
│   ├── player/
│   │   └── state.ts     # per-player custom state
│   └── mode.ts          # event wiring / rule logic
├── package.json
└── tsconfig.json
```

## 2. Centralize ObjIds

Every `CapturePoint`, `AreaTrigger`, and `WorldIcon` is an integer that must
match an object placed in your level's scene data. Keep them in one file.

```ts title="src/config/ids.ts"
export const ObjIds = {
  controlZoneTrigger: 900,
  controlZoneCapture: 9000,
} as const;
```

## 3. Define player state

Portal has no native currency or XP primitive — both are custom state you
attach per player. `mod.Player` is **opaque** and has no `.id` property, so
key your state by `mod.GetObjId(player)`.

```ts title="src/player/state.ts"
export interface ModePlayerState {
  readonly playerId: number;
  wallet: number;
  assaultXp: number;
}

const playerState = new Map<number, ModePlayerState>();

export function getOrCreateState(player: mod.Player): ModePlayerState {
  const playerId = mod.GetObjId(player);
  const existing = playerState.get(playerId);
  if (existing !== undefined) return existing;

  const created: ModePlayerState = { playerId, wallet: 10_000, assaultXp: 0 };
  playerState.set(playerId, created);
  return created;
}
```

## 4. Wire the event

Subscribe through the `Events` bus from `bf6-portal-utils`. In
`OnPlayerEarnedKill`, the **first** argument is the player who earned the
kill; the second is the victim.

```ts title="src/mode.ts"
import { Events } from 'bf6-portal-utils/events';
import { getOrCreateState } from './player/state';

const KILL_CASH_REWARD = 500;
const KILL_XP_REWARD = 150;

Events.OnPlayerEarnedKill.subscribe((killer, _victim, _deathType, _weaponUnlock) => {
  const state = getOrCreateState(killer);
  state.wallet += KILL_CASH_REWARD;
  state.assaultXp += KILL_XP_REWARD;
});
```

:::caution[Never export a raw handler]
Portal allows exactly **one** implementation per event name across your whole
compiled mode. Once you use `Events`, do not also `export function
OnPlayerEarnedKill(...)` anywhere — see
[Single-owner event handlers](/guides/architecture/#single-owner-event-handlers).
:::

## 5. Type-check

```bash
pnpm exec tsc --noEmit
```

If something doesn't compile, check the [API Reference](/reference/mod-types/)
for the real signature rather than guessing.

## Where next

- [Event Handlers & Enums](/mod-types/events-and-enums/) — how the runtime
  calls into your code
- [Timers & Clocks](/utils/timers-and-clocks/) — scheduling on top of `mod.Wait`
- [UI Components](/utils/ui-components/) — building menus and HUD
