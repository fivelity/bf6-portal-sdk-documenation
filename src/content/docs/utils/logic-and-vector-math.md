---
title: Logic Helpers & Vector Math
description: Distance checks, edge detectors, and vector arithmetic helpers.
---

## Vector math

`bf6-portal-utils` wraps `mod.CreateVector` and `mod.DistanceBetween` with
small, fully-typed arithmetic helpers so mode code doesn't destructure raw
vectors by hand everywhere.

```ts
import { mod } from 'bf6-portal-mod-types';
import { addVectors, scaleVector, distanceBetween } from 'bf6-portal-utils';

function midpoint(a: mod.Vector, b: mod.Vector): mod.Vector {
  const summed = addVectors(a, b);
  return scaleVector(summed, 0.5);
}

function isWithinRadius(a: mod.Vector, b: mod.Vector, radiusMeters: number): boolean {
  return distanceBetween(a, b) <= radiusMeters;
}
```

Every helper here takes and returns the exact `Vector` type from
`bf6-portal-mod-types` — there's no parallel vector representation to
convert to or from.

## Edge detectors

A recurring need in rule logic is reacting to a boolean flipping from
`false` to `true` — for example, a capture point crossing into a new owner,
or a threshold ticket count being crossed for the first time. `TransitionState`
wraps this so you don't hand-roll a "was it already true last tick" check in
every system:

```ts
import { TransitionState } from 'bf6-portal-utils';

const endgameTriggered = new TransitionState(false);

function onTicketTick(currentTickets: number): void {
  const crossedThreshold = currentTickets >= 75;

  if (endgameTriggered.update(crossedThreshold)) {
    // Fires exactly once, on the tick that crosses 75 — not every
    // subsequent tick while the condition stays true.
    beginEndgamePhase();
  }
}

function beginEndgamePhase(): void {
  // ...
}
```

## Distance-gated logic

Combining the two patterns above — a common pickup/proximity check:

```ts
import { mod } from 'bf6-portal-mod-types';
import { distanceBetween } from 'bf6-portal-utils';

const PICKUP_RADIUS_METERS = 2;

function playersInRange(
  origin: mod.Vector,
  candidates: ReadonlyArray<{ readonly player: mod.Player; readonly position: mod.Vector }>,
): mod.Player[] {
  return candidates
    .filter(({ position }) => distanceBetween(origin, position) <= PICKUP_RADIUS_METERS)
    .map(({ player }) => player);
}
```

See the [API Reference → utils](/reference/utils/) for the complete,
generated list of exported vector and logic helpers.
