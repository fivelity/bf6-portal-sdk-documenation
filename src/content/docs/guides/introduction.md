---
title: Introduction
description: What the BF6 Portal SDK is and how this documentation is organized.
---

The **Battlefield 6 Portal SDK** is a TypeScript scripting layer for
building custom game modes on top of Portal's rule-block runtime. Rather
than wrestling with raw rule blocks, you write typed, testable TypeScript —
and the SDK handles the translation. It ships as two packages that work
together but solve different problems:

- **`bf6-portal-mod-types`** is the foundation: raw type declarations for
  the runtime itself — the `mod.*` namespace, `Events.On*` handler
  signatures, enums, and the interfaces describing players, vehicles, and
  game mode state.
- **`bf6-portal-utils`** builds on that foundation: vector math, common
  logic patterns, rule block generators, and state management utilities
  that strip the repetitive boilerplate out of everyday mode code.

Think of it this way — `mod-types` tells TypeScript what Portal can do;
`utils` makes doing it pleasant.

## Who this is for

If you're writing a Portal game mode script in TypeScript and want to know,
with certainty, what the SDK actually exposes — not what a tutorial claims
it exposes, not what an AI assistant guesses it might expose — this site is
built for you. Every API reference page here is generated directly from the
installed package's `.d.ts` files, so what you read is exactly what `tsc`
will accept. No drift, no guesswork, no "well, it used to work that way."

## How the docs are organized

The site follows a deliberate path, front to back:

1. **Getting Started** walks you through installing the packages,
   scaffolding a project, and picking up the small set of runtime concepts
   — single-owner event handlers, signals, ObjIds — that every mode leans
   on, whether it knows it or not.
2. **bf6-portal-mod-types** covers the type package conceptually: schemas,
   event handlers and enums, and the player, vehicle, and game-mode
   interfaces you'll be working against daily.
3. **bf6-portal-utils** does the same for the helper package: logic
   helpers, vector math, rule block generators, and state management.
4. **API Reference** is the full, auto-generated TypeDoc output for both
   packages — always current with whatever version is pinned in your
   `package.json`.

Start wherever your question lives. The guides build on each other, but
nothing here demands you read in order.

:::note
This site never hand-transcribes symbols. Every signature you see was
extracted straight from the package's own type declarations at build
time — if it's documented here, it's real.
:::
