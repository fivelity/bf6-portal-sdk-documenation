---
title: Event Handler Signatures
description: The On… and Ongoing… handler shapes the runtime calls your script for — parameters and return types for every callback your mod can implement.
editUrl: https://github.com/fivelity/bf6-portal-sdk-documenation/edit/main/curated/mod-types/bf6-portal-mod-types/namespaces/mod/namespaces/EventHandlerSignatures/functions/index.md
---

These pages document the function shapes the Portal runtime expects **your
script to provide** — not functions you call. When the matching event
fires, the runtime invokes your implementation with the arguments listed
here. See [Event Handlers & Enums](/mod-types/events-and-enums/) for the
export and ownership rules.

Two families:

- **`On<Event>`** — one-shot notifications when something happens, e.g.
  [`OnAIMoveToFailed`](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/namespaces/eventhandlersignatures/functions/onaimovetofailed/)
  (`eventPlayer: Player`), `OnPlayerDied`, `OnBombStateChanged`.
- **`Ongoing<Thing>`** — invoked every server tick while the thing is
  relevant: `OngoingGlobal`, `OngoingPlayer`, `OngoingVehicle`, and the
  rest.

Every page shows the full TypeScript signature, its parameters with linked
types, and the `.d.ts` line it is declared on. The
[EventHandlerSignatures index](/reference/mod-types/bf6-portal-mod-types/namespaces/mod/namespaces/eventhandlersignatures/)
lists every handler in one table, with the SDK's own notes where it
documents them.

Handlers are single-owner: one script implements a given handler. For
multi-subscriber patterns on top of raw events, see the
[Events module](/utils/events/) from `bf6-portal-utils`.
