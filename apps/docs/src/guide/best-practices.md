---
sidebar: auto
---

# Best Practices

## TypeScript Project Setup

1. Use `strict: true` in `tsconfig.json`
2. Include `bf6-portal-mod-types` in `types` array
3. Use `skipLibCheck: true`
4. Ensure `include` covers all source files

## Code Organization

```typescript
mod.Player.SetHealth(1, 100);  // mod namespace is global
import { Vector } from 'bf6-portal-utils/vectors';  // utils via import
```

## Documentation Updates

```bash
pnpm install
pnpm run docs:generate
```

## Category Organization

Functions are categorized into 17 groups in `scripts/extract-sdk.ts`.
