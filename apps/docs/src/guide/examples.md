---
sidebar: auto
---

# Example Projects

## Basic Mod Template

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "types": ["bf6-portal-mod-types"],
    "strict": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}

// src/index.ts
mod.Player.SetHealth(1, 100);
mod.UI.DisplayWidget("main");

import { Timer } from 'bf6-portal-utils/timers';
import { Vector } from 'bf6-portal-utils/vectors';
```

## Event Handling

```typescript
mod.EventHandlerSignatures.OnPlayerJoin((player) => {
  mod.Player.SetHealth(player, 100);
});
```

## Vector Math

```typescript
import { Vector } from 'bf6-portal-utils/vectors';
const position = new Vector(0, 0, 0);
const distance = position.distanceTo(target);
```

## Complete Example

```typescript
function setupGameMode(mode: string) {
  mod.GameMode.SetMode(mode);
  mod.EventHandlerSignatures.OnPlayerJoin((player) => {
    mod.Player.SetHealth(player, 100);
  });
}
```
