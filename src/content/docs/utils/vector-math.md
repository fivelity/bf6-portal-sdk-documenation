---
title: Vector Math
description: Vectors.Vector3 — a transparent {x, y, z} vector type that converts to and from the opaque mod.Vector.
---

`mod.Vector` is opaque — you can only build one with `mod.CreateVector` and
read it back with `mod.XComponentOf` / `mod.YComponentOf` / `mod.ZComponentOf`.
Writing vector math directly against that functional API gets clunky fast.
The [`Vectors` module](/reference/utils/vectors/)
(`bf6-portal-utils/vectors`) defines a transparent `Vector3` type — a plain
`{ x, y, z }` object you can read and write directly — plus conversion
helpers for the boundary where you actually call a `mod.*` function.

```ts
import { Vectors } from 'bf6-portal-utils/vectors';

// Work with transparent Vector3 for math
const playerPos: Vectors.Vector3 = { x: 100, y: 0, z: 200 };
const offset: Vectors.Vector3 = { x: 10, y: 0, z: 0 };
const newPos = Vectors.add(playerPos, offset);

// Convert to mod.Vector only when calling a Portal API
mod.SpawnObject(asset, Vectors.toVector(newPos), Vectors.ZERO_VECTOR);

// Convert from mod.Vector when reading from the engine
const position = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
const pos3 = Vectors.toVector3(position);
const distanceMeters = Vectors.distance(pos3, targetPos3);
```

The module is self-contained — it doesn't depend on any other
`bf6-portal-utils` module.

## Conversion

| Function | Signature |
| --- | --- |
| `toVector` | `(vector: Vector3) => mod.Vector` — via `mod.CreateVector` |
| `toVector3` | `(vector: mod.Vector) => Vector3` — via the three `*ComponentOf` reads |

## Arithmetic

All arithmetic functions take `Vector3` arguments, return a **new**
`Vector3`, and never mutate their inputs:

| Function | Signature |
| --- | --- |
| `add` | `(a: Vector3, b: Vector3) => Vector3` |
| `subtract` | `(a: Vector3, b: Vector3) => Vector3` |
| `multiply` | `(vector: Vector3, scalar: number) => Vector3` |
| `divide` | `(vector: Vector3, scalar: number) => Vector3` |
| `cross` | `(a: Vector3, b: Vector3) => Vector3` |
| `normalize` | `(vector: Vector3) => Vector3` — returns `{x:0,y:0,z:0}` for a zero-length input |

## Utilities

| Function | Signature |
| --- | --- |
| `truncate` | `(vector: Vector3, decimalPlaces?: number) => Vector3` — default 2 places |
| `rotateAroundAxis` | `(vector: Vector3, axis: Vector3, angleRad: number) => Vector3` — Rodrigues' rotation formula |
| `degreesToRadians` | `(degrees: number) => number` |
| `getRotationVector` | `(orientation: number) => mod.Vector` — compass-degree orientation to a rotation vector, for spawner/object rotation calls |
| `getRotationVector3` | `(orientation: number) => Vector3` — same, as a plain object |
| `distance` | `(a: Vector3, b: Vector3) => number` — Euclidean distance |
| `isVector3` | `(v: unknown) => v is Vector3` — type guard |
| `getVectorString` | `(vector: mod.Vector, precision?: number) => string` — e.g. `"<100.00, 0.00, 200.00>"` |
| `getVector3String` | same, for a `Vector3` |

## Constants

| Constant | Value |
| --- | --- |
| `ZERO_VECTOR3` | `{ x: 0, y: 0, z: 0 }` |
| `ONE_VECTOR3` | `{ x: 1, y: 1, z: 1 }` |
| `ZERO_VECTOR` | `mod.CreateVector(0, 0, 0)` — for APIs that require a `mod.Vector` |
| `ONE_VECTOR` | `mod.CreateVector(1, 1, 1)` |

See the [API Reference → utils/vectors](/reference/utils/) for the full
generated signatures.
