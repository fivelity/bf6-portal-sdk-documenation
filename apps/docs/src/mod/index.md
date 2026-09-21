---
sidebar: auto
---

# Mod Types Reference

The **bf6-portal-mod-types** package provides TypeScript definitions for the Battlefield 6 Portal `mod` namespace. All 417 functions are categorized into 17 logical groups.

## Overview

| Metric | Count |
|--------|-------|
| Functions | 417 (551 declarations incl. overloads) |
| Types | 40 |
| Enums | 51 |
| Event signatures | 74 |
| Spawn enums | 25 |

## The `mod` Namespace

The `mod` namespace is declared **globally**. No import is needed:

```json
{
  "compilerOptions": {
    "types": ["bf6-portal-mod-types"]
  }
}
```

```typescript
mod.Player.GetPosition(1);
mod.UI.DisplayWidget("main");
```

## Quick Navigation

- [Functions by Category](/mod/functions)
- [All Types](/mod/types)
- [All Enums](/mod/enums)
- [Event Handlers](/mod/events)
- [Spawn Objects](/mod/spawn)

---

::: tip API Generation

All API data is machine-generated from upstream `.d.ts` files. Run `pnpm run docs:generate` to regenerate.

:::
