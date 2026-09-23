---
title: Quickstart Guide
description: Scaffold a minimal Portal mode using bf6-portal-mod-types and bf6-portal-utils together.
---

This walks through a minimal but complete mode script: a kill-reward system
that logs cash and XP gains to an on-screen dashboard, entirely typed, with
no `any`.

## 1. Project layout

```
my-mode/
├── src/
│   ├── config/
│   │   └── ids.ts       # ObjId constants — the only place numeric IDs live
│   ├── player/
│   │   └── state.ts     # per-player custom state shape
│   └── index.ts          # event wiring / rule logic entry point
├── package.json
└── tsconfig.json
```

## 2. Define player state

Portal has no native currency or XP primitive — both are custom state you
attach to each connected player.

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
  if (existing) return existing;

  const created: ModePlayerState = { playerId, wallet: 10_000, assaultXp: 0 };
  playerState.set(playerId, created);
  return created;
}
```

Note `mod.GetObjId(player)` for the map key — `mod.Player` is an opaque
type with no `.id` property, so this is the only stable way to key a `Map`
by player.

## 3. Wire the event through `Events`, never a raw export

```ts title="src/index.ts"
import { Events } from 'bf6-portal-utils/events';
import { Logger } from 'bf6-portal-utils/logger';
import { getOrCreateState } from './player/state';

const KILL_CASH_REWARD = 500;
const KILL_XP_REWARD = 150;

const dashboard = new Map<number, Logger>();

function getOrCreateDashboard(player: mod.Player): Logger {
  const playerId = mod.GetObjId(player);
  const existing = dashboard.get(playerId);
  if (existing) return existing;

  const created = new Logger(player, { staticRows: false });
  dashboard.set(playerId, created);
  return created;
}

Events.OnPlayerDied.subscribe((victim, killer) => {
  if (mod.Equals(victim, killer)) return; // suicide, no reward

  const killerState = getOrCreateState(killer);
  killerState.wallet += KILL_CASH_REWARD;
  killerState.assaultXp += KILL_XP_REWARD;

  getOrCreateDashboard(killer).log(`+$${KILL_CASH_REWARD} / +${KILL_XP_REWARD} XP`);
});
```

Two things matter here:

- **Import `Events` from `bf6-portal-utils/events`**, not a bare `export
  function OnPlayerDied(...)`. Portal allows only one exported
  implementation of each raw handler name per compiled mode — see
  [Single-owner event handlers](/guides/architecture/#single-owner-event-handlers)
  for why a second raw handler anywhere else in your codebase would
  silently break this one.
- **`console.log` only writes to a file on PC** and isn't visible on
  console platforms at all. `Logger` (from `bf6-portal-utils/logger`)
  renders text as an actual in-game UI element instead, so it works
  everywhere. See [UI Components](/utils/ui-components/) for the full
  `Logger` API.

## 4. Type-check before deploying

```bash
pnpm exec tsc --noEmit
```

A clean run means every symbol you referenced — `Events.OnPlayerDied`,
`mod.GetObjId`, `Logger`, and so on — actually exists in the
installed SDK version. If something doesn't compile, check the
[API Reference](/reference/mod-types/) for the real signature rather than
guessing.

## 5. Bundle for deployment

Portal expects a single script file, not a module graph. The community
[`bf6-portal-bundler`](https://www.npmjs.com/package/bf6-portal-bundler)
tool (referenced throughout the `bf6-portal-utils` module READMEs) inlines
your imports — including any `bf6-portal-utils` modules you used — into one
file, and merges any per-module `strings.json` fragments a module like
`Logger` ships with:

```bash
pnpm add -D bf6-portal-bundler
pnpm exec bf6-portal-bundler src/index.ts
```

## Where to go next

- [bf6-portal-mod-types → Event Handlers & Enums](/mod-types/events-and-enums/)
  for the full list of available events
- [bf6-portal-utils → Events](/utils/events/) for the subscription API this
  guide relies on
- [bf6-portal-utils → Timers & Clocks](/utils/timers-and-clocks/) for
  `setTimeout`-style scheduling, since QuickJS has no native timers
