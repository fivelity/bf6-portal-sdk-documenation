---
title: Timers & Clocks
description: setTimeout/setInterval-style scheduling and drift-resistant countdown clocks on top of mod.Wait, since QuickJS has neither natively.
---

Portal mode scripts run in a QuickJS runtime, which does **not** ship
`setTimeout` or `setInterval`. The only native primitive for delayed
execution is `mod.Wait(seconds)` — an awaitable delay you can call inside
an `async` handler. `bf6-portal-utils` builds two modules on top of it.

## Timers — `bf6-portal-utils/timers`

`Timers.setTimeout()` and `Timers.setInterval()` mirror the standard
JavaScript API, implemented internally with `mod.Wait()`:

```ts
import { Timers } from 'bf6-portal-utils/timers';

let healthCheckInterval: number | undefined;

Timers.setLogging((text) => console.log(text), Timers.LogLevel.Error);

// Log the live player count every 5 seconds
healthCheckInterval = Timers.setInterval(() => {
  console.log(`Active players: ${mod.CountOf(mod.AllPlayers())}`);
}, 5_000);

// Run something once, 10 seconds from now
const announceTimeout = Timers.setTimeout(() => {
  console.log('10 seconds elapsed');
}, 10_000);

// `clearTimeout`, `clearInterval`, and `clear` are all equivalent
Timers.clear(announceTimeout);
if (healthCheckInterval !== undefined) Timers.clear(healthCheckInterval);
```

Over calling `mod.Wait()` directly, `Timers` gives you:

- **Cancellation** — `clearTimeout()`/`clearInterval()`, which a bare
  `mod.Wait()` loop can't offer without you building your own cancellation
  flag
- **Concurrency** — many timers can run at once without blocking each other
- **Error isolation** — a throwing callback doesn't crash the timer loop
  (routed through `CallbackHandler` internally, same as `Events`)
- **Callback signature** — accepts sync or async callbacks (`void` or
  `Promise<void>`)

:::note
Unlike `Events`, `UI`, or `Raycast`, the `Timers` module does **not** hook
any Portal event itself — it's a pure wrapper around `mod.Wait()`. If your
mode also uses `Events` (or any module that depends on it) elsewhere,
schedule your `Timers` calls from inside an `Events.On*.subscribe(...)`
handler rather than a raw exported handler function, so you don't
accidentally reintroduce the single-owner-handler conflict `Events` exists
to prevent.
:::

## Clocks — `bf6-portal-utils/clocks`

For match timers, round timers, or bomb-fuse-style countdowns that need to
update a HUD every second or minute without drifting, `Clocks` provides
`CountUpClock` (stopwatch) and `CountDownClock` (timer) classes built on
`Timers` and `CallbackHandler`. Time is tracked as accumulated
milliseconds, and the next tick is scheduled to align to whole-second
boundaries — so display callbacks stay accurate over long durations instead
of compounding small `setInterval` drift.

```ts
import { Clocks } from 'bf6-portal-utils/clocks';
import { Events } from 'bf6-portal-utils/events';

Clocks.setLogging((text) => console.log(text), Clocks.LogLevel.Info);

let roundClock: Clocks.CountDownClock;

Events.OnGameModeStarted.subscribe(() => {
  // 5-minute round timer; per-second display, per-minute callout, end-of-round hook
  roundClock = new Clocks.CountDownClock(5 * 60, {
    onSecond: (seconds) => updateTimerDisplay(seconds),
    onMinute: (minutes) => announceMinute(minutes),
    onComplete: () => endRound(),
  });
  roundClock.start();
});

function updateTimerDisplay(_seconds: number): void {}
function announceMinute(_minutes: number): void {}
function endRound(): void {}
```

`onSecond`, `onMinute`, and `onComplete` fire only when the corresponding
integer value actually changes, and a throwing callback is caught and
logged rather than breaking the clock.

See the [API Reference → utils/timers](/reference/utils/) and
[→ utils/clocks](/reference/utils/) for the complete generated signatures.
