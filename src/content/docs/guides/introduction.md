---
title: Introduction
description: What the BF6 Portal SDK is and how this documentation is organized.
---

The **Battlefield 6 Portal SDK** is a TypeScript scripting layer for building
custom game modes on top of Portal's rule-block runtime. It ships as two
packages:

- **`bf6-portal-mod-types`** — the raw type declarations for the runtime:
  the `mod.*` namespace, `Events.On*` handler signatures, enums, and the
  interfaces that describe players, vehicles, and game mode state.
- **`bf6-portal-utils`** — a helper layer built on top of the raw types:
  vector math, common logic patterns, rule block generators, and state
  management utilities that remove repetitive boilerplate from mode code.

## Who this is for

This documentation assumes you're writing a Portal game mode script in
TypeScript and want to know, with certainty, what the SDK actually exposes —
not what a tutorial claims it exposes. Every API reference page on this site
is generated directly from the installed package's `.d.ts` files, so the
signatures here match what `tsc` will accept.

## How the docs are organized

1. **Getting Started** — install the packages, scaffold a project, and learn
   the small set of runtime concepts (single-owner event handlers, signals,
   ObjIds) that every mode relies on.
2. **bf6-portal-mod-types** — conceptual guides to the type package: schemas,
   event handlers and enums, and the player/vehicle/game-mode interfaces.
3. **bf6-portal-utils** — conceptual guides to the helper package: logic
   helpers, vector math, rule block generators, and state management.
4. **API Reference** — the full, auto-generated TypeDoc output for both
   packages, kept in sync with whatever version is pinned in `package.json`.

:::note
This site never hand-transcribes symbols. If you see a signature here, it was
extracted from the package's own type declarations at build time.
:::
