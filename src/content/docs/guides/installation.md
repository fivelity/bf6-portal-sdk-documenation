---
title: Installation & Setup
description: Install bf6-portal-mod-types and bf6-portal-utils and configure a strict TypeScript project.
---

## Prerequisites

- Node.js 18.17 or later
- A package manager — examples below use `pnpm`, but `npm`/`yarn` work the same

## Install the SDK packages

```bash
pnpm add -D bf6-portal-mod-types bf6-portal-utils typescript
```

Both packages are type-only / helper dependencies — your mode code compiles
against them but the Portal runtime supplies the actual `mod` global at
execution time.

## `tsconfig.json`

Portal mode scripts should compile under `strict` mode. `any` should never be
necessary — every runtime symbol is typed, including event payloads.

```json title="tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": false,
    "types": ["bf6-portal-mod-types"]
  },
  "include": ["src/**/*.ts"]
}
```

Setting `"types": ["bf6-portal-mod-types"]` (rather than letting TypeScript
auto-discover `@types` packages) keeps the global `mod` and `Events`
namespaces available everywhere without an explicit import, matching how the
Portal runtime itself resolves them.

## Verify the install

```bash
pnpm exec tsc --noEmit
```

A clean run confirms the type package resolved correctly. If `mod` reports as
`any` or undefined, double check the `types` array above — a missing entry is
the most common cause.

## Next steps

Continue to [Architecture & Core Concepts](/guides/architecture/) for the
runtime rules every mode needs to follow, or jump straight to the
[Quickstart Guide](/guides/quickstart/) to scaffold a project.
