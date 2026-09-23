---
title: Events
description: The Events module owns every raw Portal event handler once, so your code can subscribe from anywhere without conflicting.
---

Every Portal event handler function (`OnPlayerDeployed`, `OngoingPlayer`,
`OnPlayerDied`, and so on) can be **implemented and exported at most once
per compiled mode** — see
[Single-owner event handlers](/guides/architecture/#single-owner-event-handlers).
The `Events` module (`bf6-portal-utils/events`) implements every one of
these handlers exactly once internally, then re-exposes them as a
subscribe/unsubscribe API you can call from anywhere in your codebase.

:::caution
Once you use `Events`, never implement or export a raw Portal event handler
function yourself — it will conflict with this module's own implementation
and cause undefined behavior. This includes several other `bf6-portal-utils`
modules (`UI`, `Raycast`, `Clocks`, `PlayerUndeployFixer`) that depend on
`Events` owning these hooks internally.
:::

## Two equivalent styles

**Event-channel style (recommended)** — each event is a channel object with
`subscribe`, `unsubscribe`, `trigger`, and `handlerCount`:

```ts
import { Events } from 'bf6-portal-utils/events';

Events.OnPlayerDeployed.subscribe((player) => {
  console.log(`Player ${mod.GetObjId(player)} deployed`);
});
```

**Object style** — pass the event type as a value, useful for dynamic
dispatch or iteration:

```ts
Events.subscribe(Events.Type.OnPlayerDeployed, (player) => {
  // same handler shape
});
```

Both `subscribe` calls return an unsubscribe function:

```ts
const unsubscribe = Events.OnPlayerDeployed.subscribe(handlePlayerDeployed);
// later:
unsubscribe();
```

## Handlers can be sync or async

A handler can return `void` or `Promise<void>`. Synchronous handlers run
immediately when the event fires; asynchronous handlers are **not**
awaited by the module, so you cannot rely on one finishing before other
code runs. Prefer async handlers for anything non-trivial — a long-running
synchronous handler blocks every other handler on that event, and blocks
the caller.

Every handler — sync or async — runs through `CallbackHandler` internally,
so a throw or rejected promise in one handler is caught and logged rather
than preventing other subscribers from running.

## Tick budget and incomplete triggers

Battlefield Portal servers previously enforced a hard ~50ms cap on
synchronous work per tick and would silently abort the JavaScript thread
mid-handler if a block exceeded it. That specific watchdog has since been
removed, but because it could return, `Events` still tracks incomplete
triggers defensively: it increments a per-event counter before invoking
handlers and decrements it after, so an abort leaves a positive count.
When there are incomplete triggers, it periodically logs a warning (only if
you've called `Events.setLogging()` with at least `Warning` level).

If you see frequent incomplete-trigger warnings on a high-frequency event
(`OngoingPlayer`, `OngoingGlobal`), reduce synchronous work in that
handler, subscribe fewer handlers to it, or move heavy work into an async
handler so it spreads across ticks.

## Known limitations

- **Handler reference equality** — `unsubscribe()` needs the exact function
  reference passed to `subscribe()`. An anonymous inline function can't be
  unsubscribed later unless you kept the reference — prefer using the
  unsubscribe function `subscribe()` returns instead.
- **Execution order isn't guaranteed** across handlers on the same event.
  Chain calls manually inside one handler if order matters.
- **No return values** — every handler is `void`/`Promise<void>`. Use
  shared state or a callback if you need a result back.

See the [API Reference → utils/events](/reference/utils/) for the complete
generated `Events.Type` map and channel signatures.
