---
title: bf6-portal-mod-types
description: TypeScript definitions for Battlefield 6 Portal's mod namespace — every function, enum, type alias, and event-handler signature, generated from the package's own .d.ts files.
editUrl: https://github.com/fivelity/bf6-portal-sdk-documenation/edit/main/curated/mod-types/index.md
---

Everything in this section is generated from the installed
`bf6-portal-mod-types` package — a single ambient `declare namespace mod { … }`
plus its enums, shared types, and event-handler signatures. Nothing is
hand-transcribed: every page shows its TypeScript signature, its parameters
and return type with each type linked, and the exact `.d.ts` line the
symbol is declared on. Expand the sidebar groups or use the search box to
find a symbol by name.

## Categories

- **[Functions](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/functions/)** — everything you call on the `mod` namespace, from `mod.AllPlayers()` to `mod.CreateVector()`.
- **[Enumerations](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/enumerations/)** — input bindings, ammo and armor types, bomb states, and the rest of the SDK's named constant sets.
- **[Type Aliases](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/type-aliases/)** — shared shapes referenced across signatures, including the opaque `Vector`, `Player`, and `UIWidget` handles.
- **[Variables](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/variables/)** — module-scope declarations: the symbol constants that brand the opaque types, plus `strings` and `stringkeys`.
- **[Event Handler Signatures](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/namespaces/eventhandlersignatures/functions/)** — the `On…` and `Ongoing…` shapes the runtime calls your script for.
- **[`console`](/reference/mod-types/variables/console/)** — the ambient `console` global the package declares.

The [`mod` namespace index](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/)
links these same categories from the namespace's own page.

## Where to start

If you are new to the SDK, read the conceptual guides first — they explain
the shapes these pages reference and the rules that govern them:

- [Overview & Schemas](/mod-types/overview/) — how the SDK is layered and how your script gets loaded.
- [Event Handlers & Enums](/mod-types/events-and-enums/) — how event handlers are exported and who owns them.
- [Player / Vehicle / Game Mode Interfaces](/mod-types/interfaces/) — the interface shapes behind `Player` and friends.
