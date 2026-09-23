---
title: UI Components
description: UI wraps Portal's UI system in an object-oriented component API — containers, buttons, text, images — plus the Logger on-screen debug panel.
---

The [`UI` module](https://www.npmjs.com/package/bf6-portal-utils)
(`bf6-portal-utils/ui`) wraps Portal's `mod` UI functions in strongly-typed
component classes with ergonomic getters/setters, instead of you managing
raw UI object IDs by hand.

:::caution[UI owns `OnPlayerUIButtonEvent`]
Importing `UI` subscribes to `OnPlayerUIButtonEvent` via `Events` at load
time, so button clicks dispatch automatically. This means **you must use
`Events` as your only mechanism for subscribing to any Portal event** once
`UI` is in your mode — do not export a raw handler function for
`OnPlayerUIButtonEvent`, `OnPlayerDeployed`, or anything else. See
[Events](/utils/events/) and
[Single-owner event handlers](/guides/architecture/#single-owner-event-handlers).
:::

## Components

Twelve component classes live under `bf6-portal-utils/ui/components/*`:

| Component | Import path |
|---|---|
| `UIContainer` | `bf6-portal-utils/ui/components/container` |
| `UIButton` | `bf6-portal-utils/ui/components/button` |
| `UIContainerButton` | `bf6-portal-utils/ui/components/container-button` |
| `UIContentButton` | `bf6-portal-utils/ui/components/content-button` |
| `UIText` | `bf6-portal-utils/ui/components/text` |
| `UITextButton` | `bf6-portal-utils/ui/components/text-button` |
| `UIImage` | `bf6-portal-utils/ui/components/image` |
| `UIImageButton` | `bf6-portal-utils/ui/components/image-button` |
| `UIGadgetImage` | `bf6-portal-utils/ui/components/gadget-image` |
| `UIGadgetImageButton` | `bf6-portal-utils/ui/components/gadget-image-button` |
| `UIWeaponImage` | `bf6-portal-utils/ui/components/weapon-image` |
| `UIWeaponImageButton` | `bf6-portal-utils/ui/components/weapon-image-button` |

## Building a menu

```ts
import { Events } from 'bf6-portal-utils/events';
import { UI } from 'bf6-portal-utils/ui';
import { UIContainer } from 'bf6-portal-utils/ui/components/container';
import { UITextButton } from 'bf6-portal-utils/ui/components/text-button';

let testMenu: UIContainer | undefined;

// UI already subscribes to OnPlayerUIButtonEvent via Events — use Events
// for your own game logic too.
Events.OnPlayerDeployed.subscribe((player: mod.Player) => {
  if (!testMenu) {
    testMenu = new UIContainer({
      position: { x: 0, y: 0 },
      size: { width: 200, height: 300 },
      anchor: mod.UIAnchor.Center,
      receiver: player,
      visible: true,
      uiInputModeWhenVisible: true,
      childrenParams: [
        {
          type: UITextButton,
          position: { x: 0, y: 0 },
          size: { width: 200, height: 50 },
          anchor: mod.UIAnchor.TopCenter,
          bgColor: UI.COLORS.GREY_25,
          baseColor: UI.COLORS.BLACK,
          onClickUp: (clicker: mod.Player) => {
            // sync or async; CallbackHandler catches and logs errors
          },
          message: mod.Message(mod.stringkeys.ui.buttons.option1),
          textSize: 36,
          textColor: UI.COLORS.WHITE,
        } as UIContainer.ChildParams<UITextButton.Params>,
      ],
    });
  }

  testMenu?.show();
});
```

## Method chaining

Every setter returns the component instance, so calls chain naturally:

```ts
import { UIButton } from 'bf6-portal-utils/ui/components/button';

const button = new UIButton({
  position: { x: 100, y: 200 },
  size: { width: 200, height: 50 },
  onClickUp: (player) => {
    // handle release
  },
});

button
  .setPosition({ x: 150, y: 250 })
  .setSize({ width: 250, height: 60 })
  .setBaseColor(UI.COLORS.BLUE)
  .setBaseAlpha(0.9)
  .setEnabled(true)
  .show();
```

## `Logger` — an on-screen debug console

`console.log` on Portal is **PC-only**, writing to a local file the console
platforms never see. `bf6-portal-utils/logger` renders arbitrary runtime
text as an actual UI panel instead, so it works everywhere:

```ts
import { Logger } from 'bf6-portal-utils/logger';

// Dynamic mode: behaves like a scrolling console, newest row at the bottom
const dashboard = new Logger(player, { staticRows: false });
dashboard.log('Player connected');

// Static mode: pin a value to a specific row (e.g. keep position on row 10
// while other diagnostics fill rows 0–9)
const positionRow = new Logger(player, { staticRows: true });
positionRow.log(`pos: ${Vectors.getVector3String(pos3)}`, 10);
```

For long messages or a tall dynamic logger, prefer `logAsync()` over
`log()` — it defers the (potentially many) UI operations to a microtask so
they don't block the current tick.

See the [API Reference → utils/ui](/reference/utils/) and
[→ utils/logger](/reference/utils/) for every component's full constructor
options and setter list.
