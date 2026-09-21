---
sidebar: auto
---

# Utility Modules

The **bf6-portal-utils** package provides 33 utility modules for the Battlefield 6 Portal modding ecosystem.

## Overview

| Category | Modules |
|----------|---------|
| Runtime & Events | events, timers, clocks, callback-handler, player-undeploy-fixer |
| Diagnostics | logging, logger, performance-stats, benchmarker |
| Interface | ui, solid-ui |
| Gameplay & World | ffa-spawn-points, portal-gadget, raycast, sounds, vectors |

## Installation

```bash
npm install bf6-portal-utils@9.4.0
```

## Usage

```typescript
import { Vector } from 'bf6-portal-utils/vectors';
import { Timer } from 'bf6-portal-utils/timers';
```

---

::: info

All modules are typed and documented. Run `pnpm run docs:generate` to regenerate.

:::
