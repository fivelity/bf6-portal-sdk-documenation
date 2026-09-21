---
sidebar: auto
---

# TypeScript Setup

## Adding Type Support

The `mod` namespace is global — no import needed:

```json
{
  "compilerOptions": {
    "types": ["bf6-portal-mod-types"]
  }
}
```

For utility modules:
```typescript
import type { Vector } from 'bf6-portal-utils/vectors';
```

## Strict Mode

All type definitions support `strict: true`. No implicit `any` in type signatures.

## Generating Type Docs

```bash
pnpm run docs:typedoc
```
