---
title: Solid UI (Reactive)
description: SolidUI — a from-scratch SolidJS-style reactive layer (signals, h(), deferTicks) built for driving the UI module.
---

`bf6-portal-utils/solid-ui` is a from-scratch implementation of reactive
primitives — signals, effects, memos, stores — adapted for the Portal
runtime, inspired by [SolidJS](https://github.com/solidjs/solid). Unlike a
framework that re-renders a whole component on any change, `SolidUI` uses
fine-grained reactivity: only the specific UI property that changed gets
updated.

It's decoupled from [`UI`](/utils/ui-components/) but designed and tested
with it — `SolidUI` assumes the UI objects it binds to expose plain
getters/setters for the properties you want reactive.

## Signals and `h()`

There is no JSX/TSX; `SolidUI.h()` is a HyperScript-style factory function.
Pass an **accessor function** (the signal getter itself, not its called
value) as a prop to make that prop reactive:

```ts
import { SolidUI } from 'bf6-portal-utils/solid-ui';
import { UI } from 'bf6-portal-utils/ui';

SolidUI.setLogging((text) => console.log(text), SolidUI.LogLevel.Error);

function createCounterUI(player: mod.Player): void {
  const [count, setCount] = SolidUI.createSignal(0);

  const container = SolidUI.h(UI.Container, {
    receiver: player,
    width: 200,
    height: 300,
    visible: true,
  });

  // Reactive text — re-renders only this text node when count changes
  SolidUI.h(UI.Text, {
    parent: container,
    anchor: mod.UIAnchor.TopCenter,
    width: 200,
    message: () => mod.Message(mod.stringkeys.count, count()), // accessor, not count()
    textSize: 30,
    textColor: UI.COLORS.BLACK,
  });

  SolidUI.h(UI.TextButton, {
    parent: container,
    anchor: mod.UIAnchor.BottomCenter,
    width: 200,
    message: mod.Message(mod.stringkeys.increment),
    textSize: 30,
    textColor: UI.COLORS.BLACK,
    onClick: async () => {
      setCount((c) => c + 1); // functional update, reads the previous value
    },
  });
}
```

## `deferTicks` — coalescing updates

Updates are driven by a logical tick counter that advances on every
`Events.OngoingGlobal` callback, plus the microtask queue for immediate
(`deferTicks: 0`, the default) work. Pass `deferTicks` on an effect, memo,
or `h()` binding to coalesce rapid repeated changes into a single update on
a future tick instead of one UI write per change:

```ts
SolidUI.h(
  UI.Text,
  {
    parent: container,
    anchor: mod.UIAnchor.Center,
    width: 200,
    message: () => mod.Message(mod.stringkeys.count, count()),
    textSize: 30,
    textColor: UI.COLORS.BLACK,
  },
  { deferTicks: 30 }, // coalesce updates to once every 30 ticks
);
```

The scheduler tracks pending effects per tick and enforces internal safety
limits (`MAX_EXECUTIONS_PER_FLUSH`, `MAX_FLUSHES_PER_TICK`), logged through
the `Logging` module, so a runaway reactive loop can't silently eat the
tick budget.

See the [API Reference → utils/solid-ui](/reference/utils/) for the full
`createSignal`, `createEffect`, `createMemo`, and `h()` signatures.
