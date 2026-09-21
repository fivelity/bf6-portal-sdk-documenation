---
sidebar: auto
---

# API Reference

The complete API reference is generated automatically from upstream TypeScript definitions.

## Mod Types (bf6-portal-mod-types)

| Route | Description |
|-------|-------------|
| [Functions](/mod/functions) | All 417 mod functions |
| [Types](/mod/types) | 40 type definitions |
| [Enums](/mod/enums) | 51 enumerations |
| [Events](/mod/events) | 74 event signatures |
| [Spawn Enums](/mod/spawn) | 25 spawn categories |

## Utility Modules (bf6-portal-utils)

| Category | Modules |
|----------|---------|
| **Runtime & Events** | events, timers, clocks, callback-handler, player-undeploy-fixer |
| **Diagnostics** | logging, logger, performance-stats, benchmarker |
| **Interface** | ui, solid-ui |
| **Gameplay & World** | ffa-spawn-points, portal-gadget, raycast, sounds, vectors |

## Generating API Documentation

```bash
pnpm run docs:typedoc
pnpm run docs:generate
```
