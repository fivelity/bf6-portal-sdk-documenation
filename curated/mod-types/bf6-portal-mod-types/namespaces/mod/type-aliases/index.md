---
title: Type Aliases
description: Shared types referenced across the mod API — the opaque Vector, Player, and UIWidget handles and the shapes behind generated signatures.
editUrl: https://github.com/fivelity/bf6-portal-sdk-documenation/edit/main/curated/mod-types/bf6-portal-mod-types/namespaces/mod/type-aliases/index.md
---

The named types reused across the SDK's signatures — parameter types,
return types, and event payloads all link back here. Most of the
interesting ones are **opaque types**: branded objects you cannot read
directly, only pass around and compare through the helpers the SDK
provides.

Notable pages:

- [`Vector`](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/type-aliases/vector/)
  — a 3D vector (X left, Y up, Z forward). Create it with
  `mod.CreateVector(...)`, read it only through `mod.XComponentOf` /
  `mod.YComponentOf` / `mod.ZComponentOf`, compare it only with
  `mod.Equals`. Its `_opaque` property is branded `typeof VectorSymbol`
  (see [Variables](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/variables/)),
  which is what keeps a plain `{x, y, z}` object from type-checking as one.
- [`Player`](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/type-aliases/player/)
  — the opaque handle passed into event handlers; compare it with
  `mod.Equals`, or retrieve its id with `mod.GetObjId`.
- [`UIWidget`](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/type-aliases/uiwidget/)
  — the opaque type behind Portal's UI widgets.

The fuller interface-shaped types (player state, vehicles, game modes)
are covered conceptually in
[Player / Vehicle / Game Mode Interfaces](/mod-types/interfaces/); these
aliases are what the generated signatures actually refer to.
