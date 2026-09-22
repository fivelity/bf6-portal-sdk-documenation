---
title: Overview
description: What bf6-portal-utils provides on top of the raw mod-types package.
---

`bf6-portal-utils` is a helper layer built on top of `bf6-portal-mod-types`.
Where the types package tells you what the runtime exposes, this package
provides tested, reusable implementations of patterns almost every mode
needs — so you're not re-deriving vector math or a majority-tally loop from
scratch in each project.

## What's covered

- [Logic Helpers & Vector Math](/utils/logic-and-vector-math/) — distance
  checks, edge detectors, and vector arithmetic built on `mod.CreateVector`
  and `mod.DistanceBetween`.
- [Rule Block Generators](/utils/rule-block-generators/) — factory functions
  that assemble common rule patterns (timed zones, weighted majority
  scoring) from smaller typed pieces.
- [State Management Utilities](/utils/state-management/) — typed, per-player
  state containers and signal-driven state updates for UI.

## Installation

```bash
pnpm add -D bf6-portal-utils
```

See [Installation & Setup](/guides/installation/) for the full `tsconfig.json`
this package expects.

## Design intent

Everything in `bf6-portal-utils` is a thin, fully-typed wrapper — it never
hides a `mod.*` call behind something that returns `any`, and it never
invents behavior the underlying SDK doesn't actually provide. If a helper
here doesn't match what you observe at runtime, check the
[API Reference → utils](/reference/utils/) for the exact generated signature
before assuming the helper is wrong.
