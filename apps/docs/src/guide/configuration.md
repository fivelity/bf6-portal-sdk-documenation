---
sidebar: auto
---

# Configuration

## tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["bf6-portal-mod-types"],
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Module Resolution

```typescript
import { Vector } from 'bf6-portal-utils/vectors';
import { Timer } from 'bf6-portal-utils/timers';
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BF6_PORTAL_SDK_VERSION` | `4.3.0` | Mod types version |
| `BF6_PORTAL_UTILS_VERSION` | `9.4.0` | Utils version |
