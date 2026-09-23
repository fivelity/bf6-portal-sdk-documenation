---
title: Functions
description: Every function you can call on the mod namespace — TypeScript signatures, parameter and return types, and the .d.ts line each is defined on.
editUrl: https://github.com/fivelity/bf6-portal-sdk-documenation/edit/main/curated/mod-types/bf6-portal-mod-types/namespaces/mod/functions/index.md
---

Every callable declared on the ambient `mod` namespace — the functions your
Portal script *uses*. Game queries like
[`AllPlayers()`](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/functions/allplayers/)
sit next to math helpers like
[`CreateVector(...)`](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/functions/createvector/),
which turns three numbers into an opaque `Vector` and documents the
axis conventions right on the page.

Each function page shows:

- the TypeScript **signature** in a copyable code block;
- a **Parameters** table (when it takes any) — every parameter with its
  type and description, each referenced type linked to its own page;
- the **Returns** type, likewise linked;
- **Defined in** — the `.d.ts` file and line the declaration comes from.

The sidebar lists functions alphabetically under this group; use the
search box when you already know the name.

## Related categories

- [Enumerations](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/enumerations/) — named constant sets that show up as parameters and return values.
- [Type Aliases](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/type-aliases/) — the shared shapes these signatures are built from.
- [Event Handler Signatures](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/namespaces/eventhandlersignatures/functions/) — the other direction: function shapes the runtime calls *in* your script.
- [Event Handlers & Enums](/mod-types/events-and-enums/) — the conceptual guide to handlers and their enum payloads.
