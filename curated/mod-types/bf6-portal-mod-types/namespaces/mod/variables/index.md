---
title: Variables
description: Module-scope declarations on the mod namespace — the unique-symbol tags that brand the opaque types, plus the strings and stringkeys lookups.
editUrl: https://github.com/fivelity/bf6-portal-sdk-documenation/edit/main/curated/mod-types/bf6-portal-mod-types/namespaces/mod/variables/index.md
---

The `mod` namespace's module-scope `const` declarations, as they appear in
the package's type definitions:

- **Symbol tags** — `unique symbol` constants such as
  [`VectorSymbol`](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/variables/vectorsymbol/),
  used to *brand* the SDK's opaque types: `Vector._opaque` is typed
  `typeof VectorSymbol`, so only vectors produced through
  `mod.CreateVector` type-check as a `Vector`. You rarely touch these
  directly — they are the machinery behind the
  [Type Aliases](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/type-aliases/).
- **Lookups** — [`strings`](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/variables/strings/)
  and [`stringkeys`](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/variables/stringkeys/),
  two shared `Any`-typed constants.

The package also declares one ambient global *outside* `mod`: the
[`console`](/reference/mod-types/variables/console/) object, which
exposes `log()` (QuickJS environments ship without one).
