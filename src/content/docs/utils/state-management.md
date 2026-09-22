---
title: State Management Utilities
description: Typed per-player state containers and signal-driven UI state.
---

## Per-player state containers

Portal has no built-in per-player custom state store, so `bf6-portal-utils`
provides a small typed wrapper around a `Map` keyed by player ID, with a
consistent create-if-missing accessor pattern:

```ts
import { createPlayerStateStore } from 'bf6-portal-utils';

interface ModePlayerState {
  wallet: number;
  assaultXp: number;
  primaryWipedOnDeath: boolean;
}

const playerState = createPlayerStateStore<ModePlayerState>({
  createDefault: () => ({
    wallet: 10_000,
    assaultXp: 0,
    primaryWipedOnDeath: true,
  }),
});

function onKill(killerId: string): void {
  const state = playerState.get(killerId);
  state.wallet += 500;
  state.assaultXp += 150;
}
```

`playerState.get(id)` always returns a fully-typed `ModePlayerState` — there
is no `undefined` branch to handle at every call site, since the store
creates a default entry on first access.

## Signals for UI-driving state

For values that drive HUD or scoreboard elements, prefer a signal over
re-reading raw state every frame. `bf6-portal-utils` re-exports a small
signal primitive compatible with SolidUI-style reactive trees:

```ts
import { createSignal } from 'bf6-portal-utils';

const [walletDisplay, setWalletDisplay] = createSignal<number>(10_000);

function onWalletChanged(newBalance: number): void {
  setWalletDisplay(newBalance);
}

// Consumed elsewhere by a UI tree that re-renders only when the signal changes:
// SolidUI.h(UIText, { text: () => `$${walletDisplay()}` })
```

## Throttling expensive recomputation

For state derived from something that changes often but doesn't need to be
recomputed every tick (e.g. a leaderboard sort), wrap the update in a
deferred-tick throttle rather than recalculating on every signal change:

```ts
import { deferTicks } from 'bf6-portal-utils';

const recomputeLeaderboard = deferTicks(() => {
  // expensive sort/aggregate work
}, 15);

function onAnyScoreChanged(): void {
  recomputeLeaderboard();
}
```

`deferTicks` collapses rapid repeated calls into a single execution after the
given number of ticks have elapsed with no further calls — useful for
anything that would otherwise repaint dozens of times per second.

See the [API Reference → utils](/reference/utils/) for the full generic
signatures of `createPlayerStateStore`, `createSignal`, and `deferTicks`.
