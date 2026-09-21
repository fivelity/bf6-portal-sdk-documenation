---
sidebar: auto
---

# Installation

## Prerequisites

- **Node.js** >= 22.18.0
- **pnpm** >= 9.0.0
- **TypeScript** >= 5.6.0

## Install Packages

```bash
pnpm add -D bf6-portal-mod-types@4.3.0
pnpm add bf6-portal-utils@9.4.0
```

## Install the Documentation Site

```bash
pnpm install
pnpm run docs:generate
pnpm run docs:dev
```

## Verify Installation

Open the [Symbol Verifier](/) and type `mod.RayCast` to confirm everything is working.
