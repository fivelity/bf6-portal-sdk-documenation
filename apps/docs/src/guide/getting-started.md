---
sidebar: auto
---

# Getting Started

The BF6 Portal SDK provides type-safe access to the Battlefield 6 Portal modding API.

## Installation

```bash
npm install -D bf6-portal-mod-types@4.3.0
npm install bf6-portal-utils@9.4.0
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "types": ["bf6-portal-mod-types"],
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

## Quick Start

```typescript
mod.Player.GetPosition(playerId);
mod.UI.DisplayWidget(widget);
mod.Add(1, 2);
```

For utility modules:
```typescript
import { Vector } from 'bf6-portal-utils/vectors';
import { Timer } from 'bf6-portal-utils/timers';
```

## Verify Your Setup

Use the **Symbol Verifier** on the home page to check any symbol. Browse the full reference in the sidebar.
