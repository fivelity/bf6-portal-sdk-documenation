---
sidebar: auto
---

# Mod Functions

All **417 mod functions** grouped into 17 categories. Each function has type-safe signatures with JSDoc documentation.

## Categories

| Category | Description |
|----------|-------------|
| Scene Lookup | Resolve runtime objects by ObjId |
| Players | Player management: health, position, input |
| AI Behavior | Direct AI soldiers: move, defend, target |
| Weapons & Gear | Weapon packages, gadgets, ammo, armor |
| Game Mode | Match clock, scoring, teams, deployment |
| Objectives & Triggers | Capture points, HQs, MCOMs, sectors |
| Spawners & Loot | Spawn points, AI spawners, loot |
| Objects & Movement | Move, rotate, orbit, transform |
| Vehicles | Vehicle spawners, seats, occupancy |
| UI Widgets | Create, find, style, remove widgets |
| Scoreboard | Columns, widths, sorting |
| Messages & Notifications | Localized messages |
| Audio | SFX, voice-over, music |
| Effects & Icons | Visual effects, world icons, cameras |
| Vectors & Transforms | 3D vectors, directions |
| Math & Logic | Arithmetic, trig, boolean |
| Arrays & Variables | Opaque arrays, variables |
| Runtime & Misc | Waiting, comparisons, helpers |

## Usage

All functions through the global `mod` namespace:

```typescript
mod.CategoryName.functionName(args);
```

---

::: info

Function data is auto-generated from upstream `.d.ts` files. Run `pnpm run docs:generate` to regenerate.

:::
