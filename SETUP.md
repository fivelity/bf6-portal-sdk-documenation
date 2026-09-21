# Setup notes

## What this site actually documents
- **The global `mod` namespace** from `bf6-portal-mod-types` — a dev
  dependency shipping only `.d.ts` files, declared globally via
  `tsconfig.json`'s `types`. No import required. This package already
  publishes its own generated reference at
  https://deluca-mike.github.io/bf6-portal-mod-types/, which the
  "mod namespace" pages here link to rather than duplicate.
- **`bf6-portal-utils`** — a real npm dependency with ~20 independent
  modules, each its own subpath import (`bf6-portal-utils/logger`,
  `bf6-portal-utils/ui`, etc.), confirmed against the actual installed
  package (v9.4.0) rather than guessed. There is no barrel export.

## The one rule that matters most
`bf6-portal-utils/events` owns every Portal event hook internally. Once you
use it — or Logger, UI, or Multi-Click Detector, which all depend on it —
never export your own `OnPlayerDeployed`, `OngoingPlayer`, etc. Subscribe
with `Events.OnX.subscribe(handler)` instead. This is called out on the
Core Concepts, utils overview, and Events pages.

## Generated API Reference
`astro.config.mjs` points `starlight-typedoc` at two confirmed entry points:

    ./node_modules/bf6-portal-utils/logger/index.d.ts
    ./node_modules/bf6-portal-utils/ui/index.d.ts

This was tested against the real installed package and produces real,
correct output (verified in this build: `Logger` class with `log()`,
`logAsync()`, `show()`, `hide()`, `clear()`, `destroy()`, `toggle()`; the
`UI` namespace with its `Element`, `Root`, and receiver classes).

To add more modules to the generated reference, add a line per module,
matching the folder names actually present in
`node_modules/bf6-portal-utils/` — confirmed folders as of v9.4.0:

    benchmarker, callback-handler, clocks, events, ffa-drop-ins,
    ffa-spawn-points, logger, logging, map-detector, mod-extensions,
    multi-click-detector, performance-stats, player-undeploy-fixer,
    portal-gadget, raycast, scavenger-drop, solid-ui, sounds, timers, ui,
    vectors

Each has `index.d.ts` at its root (the `ui` module also has a
`components/` subfolder — check `ui/components/*/index.d.ts` if you want
`UIContainer`, `UITextButton`, and friends included too).

`bf6-portal-mod-types` is **not** wired into TypeDoc here, since it already
publishes its own site from source — pulling it in a second time here would
drift out of sync. If you'd rather have both in one place, its `index.d.ts`
is a valid TypeDoc entry point; add it and drop the "read the other site"
notes from the mod-types pages.

## Requirements
- Node 24 or later — this is what the installed `bf6-portal-utils@9.4.0`
  and `bf6-portal-mod-types@4.3.0` actually require (`engines.node` in
  their own `package.json`). The workflow and `package.json` here are set
  to Node 24 accordingly.
- pnpm 9

## First run
    pnpm install        # creates pnpm-lock.yaml; commit it — CI uses --frozen-lockfile
    pnpm docs:dev

## Content pages worth a second look
The Events/Timers/Clocks/Logger/UI/Other-modules pages under `utils/` were
written from the real, installed package READMEs and are close to
copy-accurate. The "Other modules" page intentionally does not go deep on
Vectors, Raycast, SolidUI, Sounds, Performance Stats, Mod Extensions,
Portal Gadget, Player Undeploy Fixer, Scavenger Drop, or the FFA pair —
each has its own README under `node_modules/bf6-portal-utils/<module>/`
worth reading directly if you want full pages for them.

## GitHub Pages
Repo settings > Pages > Source: **GitHub Actions**.
Site URL: https://fivelity.github.io/bf6-portal-sdk-documenation/
