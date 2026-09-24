---
title: Module Usage Examples
description: Compiling TypeScript examples for Sounds, Raycast, PortalGadget, PerformanceStats, MapDetector, MultiClickDetector, ScavengerDrop, Benchmarker, and Logging.
---

Every snippet below uses only signatures present in
`bf6-portal-utils@9.4.0` and `bf6-portal-mod-types@4.3.0`. For the complete
generated signatures see the [API Reference → utils](/reference/utils/).

All modules share one logging convention: an optional
`setLogging(log?, logLevel?, includeRawError?)` call, where `logLevel` comes
from that module's own `LogLevel` re-export of `Logging.LogLevel`.

## Sounds

`Sound2D` / `Sound3D` wrap `mod.SFX`. Each has a static `play()` one-shot
that returns a cancel function, plus instances with `play`, `stop`, `fade`,
and `dispose`.

```ts
import { Sounds } from 'bf6-portal-utils/sounds';

// One-shot 2D sound to a single player, stopped after 2 seconds
function playCue(player: mod.Player, asset: mod.RuntimeSpawn_Common): () => void {
  return Sounds.Sound2D.play(asset, { target: player, amplitude: 0.8, duration: 2 });
}

// Instance with a fade-out
function playWithFade(asset: mod.RuntimeSpawn_Common, at: mod.Vector): void {
  const sound = new Sounds.Sound3D(asset, at, { amplitude: 1 });
  sound.play().fade({ delay: 1, duration: 3, targetAmplitude: 0, stopOnComplete: true });
}
```

## Raycast

`Raycast.cast` takes a player, start and end `Vector3`s, and callbacks.
At least one of `onHit` / `onMiss` is required.

```ts
import { Raycast } from 'bf6-portal-utils/raycast';
import { Vectors } from 'bf6-portal-utils/vectors';

function probeForward(player: mod.Player): void {
  const origin = Vectors.toVector3(mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition));
  const direction = Vectors.toVector3(mod.GetSoldierState(player, mod.SoldierStateVector.GetFacingDirection));
  const end = Vectors.add(origin, Vectors.multiply(direction, 100));

  Raycast.cast(player, origin, end, {
    onHit: (hitPoint, hitNormal) => {
      console.log(`hit ${Vectors.getVector3String(hitPoint)} n=${Vectors.getVector3String(hitNormal)}`);
    },
    onMiss: () => console.log('miss'),
  });
}
```

## PortalGadget

```ts
import { PortalGadget } from 'bf6-portal-utils/portal-gadget';

const stop = PortalGadget.onFireStart(async (player, isZooming, getTarget) => {
  const target = await getTarget(); // mod.Vector | undefined
  console.log(`zooming=${isZooming} hasTarget=${target !== undefined}`);
});
// later: stop();
```

## PerformanceStats

```ts
import { PerformanceStats } from 'bf6-portal-utils/performance-stats';

function isServerStressed(): boolean {
  return PerformanceStats.getSmoothedTickRate() < 25 || PerformanceStats.getSmoothedTimeoutLagMs() > 100;
}
```

## MapDetector

```ts
import { MapDetector } from 'bf6-portal-utils/map-detector';

const name: string | undefined = MapDetector.currentMapName();
if (MapDetector.isCurrentMap(MapDetector.Map.CairoBazaar)) {
  console.log('Running on Cairo Bazaar');
}
```

## MultiClickDetector

```ts
import { Events } from 'bf6-portal-utils/events';
import { MultiClickDetector } from 'bf6-portal-utils/multi-click-detector';

Events.OnPlayerDeployed.subscribe((player) => {
  const detector = new MultiClickDetector(
    player,
    () => console.log('triple-crouch detected'),
    { soldierState: mod.SoldierStateBool.IsCrouching, requiredClicks: 3, windowMs: 800 },
  );
  detector.enable();
});
```

## ScavengerDrop

```ts
import { ScavengerDrop } from 'bf6-portal-utils/scavenger-drop';

function trackBody(deadPlayer: mod.Player): ScavengerDrop {
  return new ScavengerDrop(deadPlayer, (scavenger) => {
    console.log(`scavenged by ${mod.GetObjId(scavenger)}`);
  });
}
```

## PlayerUndeployFixer

Importing the module is all that is required: it subscribes through
`Events` and re-triggers `Events.OnPlayerUndeploy` for players who never
undeploy after dying.

```ts
import 'bf6-portal-utils/player-undeploy-fixer';
```

## Benchmarker

```ts
import { Benchmarker } from 'bf6-portal-utils/benchmarker';

const elapsed: number = Benchmarker.run(() => Math.sqrt(12345.678), 10_000);
const maxIterations: number = Benchmarker.findMaxIterations(() => Math.sqrt(12345.678), 10);
```

## Logging & CallbackHandler

These are internal building blocks. `Logging` supplies the `LogLevel` enum
(`Debug`, `Info`, `Warning`, `Error`) each module re-exports.
`CallbackHandler.invoke(callback, args, errorContext, logging, logLevel?)`
safely runs an optional callback so a throw is caught and logged rather
than propagating; it requires a `Logging` instance, so it is mainly useful
when authoring your own module. Application code normally just configures
logging on the modules it uses:

```ts
import { Events } from 'bf6-portal-utils/events';

Events.setLogging((text) => console.log(text), Events.LogLevel.Warning);
```
