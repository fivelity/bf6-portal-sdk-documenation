# Sidebar scroll UX for large lists — design

- **Date:** 2026-09-24
- **Status:** draft — awaiting user review
- **Scope:** the left Starlight sidebar (`sl-sidebar-pane#starlight__sidebar`) only
- **Repo state:** `bf6-portal-sdk-documentation`, Starlight `0.42.2`, Astro `7.3.3`, Wardogs theme (unlayered CSS)

## 1. Problem

The API reference sidebar holds hundreds of entries (generated from TypeDoc). Four usability
problems when scrolling that list:

1. The active entry is usually **off-screen** on arrival — the reader has to hunt for it.
2. At the top/bottom of the list, wheel input **scrolls the main page** (scroll chaining).
3. There is **no indication** that more entries exist above/below the visible window.
4. Group headings scroll away, so deep in a list you lose track of *which* module you are in.

Measured on `guides/introduction` at 1000×700: pane `clientHeight = 640px`,
`scrollHeight = 728px` (far larger on reference pages). The pane is already
`position: fixed; inset-block: var(--sl-nav-height) 0; overflow-y: auto` — it is pinned to the
viewport and scrolls internally. This task is **about the quality of that scroll**, not about
pinning the sidebar.

## 2. Goals

| # | Goal | Acceptance criterion |
|---|------|----------------------|
| G1 | Wheel input inside the sidebar never scrolls the page | With the pane scrolled to either end, further wheel/drag input leaves `window.scrollY` unchanged |
| G2 | Edge fades signal more content | Fades are visible only when there is more content in that direction; both fades are absent when the list fits the pane |
| G3 | Group headings stay visible while their items scroll | Every `summary` in the pane is `position: sticky`; the innermost visible heading paints above its ancestors |
| G4 | The current page's entry is brought into view on load | After navigation, `a[aria-current="page"]` is fully within the pane viewport, unless it already was |

## 3. Non-goals

- No change to sidebar content, grouping, depth, or the TypeDoc sidebar generator.
- No custom sidebar component; Starlight's `<Sidebar />` stays in place.
- No remembered per-group scroll position beyond what Starlight already persists.
- No new dependencies, build-config, or `astro.config.mjs` changes.
- No changes to `index.html` (the standalone prototype) — it already pins and scrolls its own sidebar.

## 4. Constraints & context discovered

- **Layering:** Starlight ships CSS inside `@layer starlight.*`; the Wardogs theme is
  deliberately **unlayered**, so theme rules win without `!important` (see header of
  `src/styles/theme/base.css`). All new CSS must stay unlayered.
- **Scroll container:** `.sidebar-pane` (`#starlight__sidebar`), `overflow-y: auto`,
  `scrollbar-gutter: stable`. Its background is `var(--sl-color-bg-sidebar)` (mapped to
  `--wd-bg-inset` in both themes).
- **Starlight already restores scroll:** `SidebarPersister.astro` restores `scrollTop` from
  `sessionStorage['sl-sidebar-state']` via an **inline script that runs during HTML parse**,
  and its `<sl-sidebar-restore>` elements re-apply collapsed/open state per group.
  Our component script (an Astro module) runs **after** parsing, i.e. after the restore.
- **Starlight already opens the current group:** `SidebarSublist.astro` renders
  `<details open={…some(i => i.isCurrent) || !entry.collapsed}>` — but the sessionStorage
  restore can override it afterwards.
- **Markup shape:** `ul.top-level > li > details > summary > span.group-label > span.large`,
  nested to 3–4 levels. Active link is `a[aria-current="page"]`.
- **Theme already styles** `summary` (`padding-block: 0.5rem`), `.large`, `.sidebar-content`
  rails — see `src/styles/theme/chrome.css`.
- **Long labels wrap:** module/symbol names can occupy two lines in the 18.5rem column, so
  summary height is *not* a constant (rules out fixed per-depth sticky offsets).

## 5. Design

Two files change:

| File | Change |
|------|--------|
| `src/styles/theme/chrome.css` | New `/* ---------- Sidebar: scroll behaviour ---------- */` section (CSS for G1–G3) |
| `src/components/ReferenceSidebar.astro` | Extend the existing per-page script with `initSidebarScrollUX()` (G2 data attributes, G4 auto-scroll) |

### 5.1 G1 — contain overscroll

```css
.sidebar-pane {
  overscroll-behavior: contain;
}
```

**Trade-off (accepted):** wheel input stops at the sidebar's edge instead of handing off to the
main page. This is the explicitly requested behaviour.

### 5.2 G2 — edge fades

Two pseudo-elements on the scroll container itself, so they are children of the scrollable
content and can be pinned with `position: sticky`:

```css
.sidebar-pane::before,
.sidebar-pane::after {
  content: '';
  position: sticky;
  z-index: 5;                      /* above sticky headings (z-index 1–3) */
  display: block;
  height: 1.75rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--wd-fast) var(--wd-ease);
}
.sidebar-pane::before {
  top: 0;
  margin-bottom: -1.75rem;         /* do not add scrollable height */
  background: linear-gradient(to bottom, var(--sl-color-bg-sidebar), transparent);
}
.sidebar-pane::after {
  bottom: 0;
  margin-top: -1.75rem;
  background: linear-gradient(to top, var(--sl-color-bg-sidebar), transparent);
}
.sidebar-pane[data-more-above]::before,
.sidebar-pane[data-more-below]::after { opacity: 1; }
```

- `::before` is sticky at the top of the scrollport; `::after` is sticky at the bottom.
- Attribute polarity: the attribute means "there is hidden content in that direction", so at
  `scrollTop = 0` there is **no** `data-more-above`.
- The JS in §5.4 toggles `data-more-above` / `data-more-below` on `.sidebar-pane`; both are
  absent when `scrollHeight <= clientHeight` (nothing to signal → no fade).
- Reuses `--sl-color-bg-sidebar`, so light and dark themes both get a correct fade colour.

### 5.3 G3 — sticky group headings

```css
.sidebar-pane .sidebar-content details > summary {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--sl-color-bg-sidebar);
}
.sidebar-pane .sidebar-content details details > summary       { z-index: 2; }
.sidebar-pane .sidebar-content details details details > summary { z-index: 3; }
```

- Sticky works because a `summary`'s containing block is its `details`, so each heading stays
  pinned while *its own* group is in view and leaves with the group.
- **Depth is expressed with `z-index`, not stacked `top` offsets.** Nested headings therefore
  overlap at `top: 0` and the innermost visible heading wins — correct for wrapped labels,
  which make fixed offsets impossible (§4).
- Solid background hides items scrolling underneath.
- **Known risk:** `position: sticky` on `summary` has been buggy in older Safari. Failure mode
  is graceful — headings simply behave as today.

### 5.4 G4 — auto-scroll to the active entry

Added to `src/components/ReferenceSidebar.astro`, following the file's existing pattern
(run once, then again on `astro:page-load`):

```ts
function initSidebarScrollUX(): void {
  const pane = document.querySelector<HTMLElement>('#starlight__sidebar');
  if (!pane) return;

  // --- G2: edge-fade state ---------------------------------------------
  const syncFades = () => {
    const overflow = pane.scrollHeight - pane.clientHeight;
    const more = overflow > 1;
    pane.toggleAttribute('data-more-above', more && pane.scrollTop > 1);
    pane.toggleAttribute('data-more-below', more && pane.scrollTop < overflow - 1);
  };
  pane.addEventListener('scroll', syncFades, { passive: true });
  syncFades();

  // --- G4: reveal the active entry -------------------------------------
  const active = pane.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
  if (!active) return;
  // The pane is a hidden popover below 50em; a zero-size box is not measurable.
  if (!matchMedia('(min-width: 50em)').matches || pane.clientHeight === 0) return;

  for (let el: HTMLElement | null = active.parentElement; el && el !== pane; el = el.parentElement) {
    if (el instanceof HTMLDetailsElement) el.open = true;   // user-collapsed ancestors
  }

  const center = () => {
    const paneBox = pane.getBoundingClientRect();
    const itemBox = active.getBoundingClientRect();
    const fullyVisible = itemBox.top >= paneBox.top && itemBox.bottom <= paneBox.bottom;
    if (fullyVisible) return;                    // Starlight's restored position wins
    // Manual math — scrollIntoView() would also scroll the document.
    pane.scrollTop += itemBox.top - paneBox.top - (paneBox.height - itemBox.height) / 2;
    syncFades();
  };

  requestAnimationFrame(center);
  document.fonts?.ready.then(center);            // self-hosted fonts settle late
}
```

**Precedence rule (important):**

1. Starlight's `sessionStorage` restore runs first (inline, during parse).
2. We center the active entry **only when it is not fully visible**.
   → A browsing position the reader had restored is preserved; a deep link into a huge list
   lands on the right entry.
3. Ancestor `<details>` of the active entry are forced `open` afterwards, so a stale collapsed
   state can never hide the current page.
4. `pane.scrollTop` is written directly: instantaneous, no smooth-scroll fighting the restore,
   and it never moves `window.scrollY` (satisfies the reduced-motion rule in `base.css`).

**Lifecycle:** the script is an Astro module → runs after HTML parse (and after the restore
inline script), re-runs on every full-page navigation, and `astro:page-load` covers the same
path the existing icon-decoration code uses. The `scroll` listener is attached to a freshly
rendered pane per navigation, so no listeners accumulate.

**Mobile (< 50em):** the pane is a closed popover; we skip auto-scroll entirely (the existing
`SidebarPersister` also skips restore there). Containment, sticky headings and fades remain
active and are harmless in the drawer.

## 6. Error handling

- Everything is guarded: missing pane, missing active link, zero-size pane → silent `return`
  (same convention as Starlight's own persister, which swallows errors).
- No async work can throw into navigation: `document.fonts?.ready` is optional-chained.
- The feature is progressive enhancement: if the script fails entirely, G1–G3 (pure CSS) still
  apply and the sidebar behaves exactly as it does today plus those three.

## 7. Edge cases

| Case | Behaviour |
|------|-----------|
| Active entry already visible after restore | No scroll — restored browsing position kept |
| Ancestors collapsed in `sessionStorage` | Re-opened (§5.4 step 3) |
| List shorter than the pane | No fades, no auto-scroll (fully visible), no chaining |
| Reference page (hundreds of entries) | Sticky headings stack by depth; fades toggle per scroll |
| Mobile drawer (< 50em) | Fades/containment/stickiness apply; auto-scroll skipped |
| Theme switch (dark ⇄ light) | Fade colour follows `--sl-color-bg-sidebar`; sticky backgrounds match the pane |
| Print | Sidebar is `print:hidden` — unaffected |
| JS disabled | G1–G3 still apply (CSS); G4 degrades to today's behaviour |

## 8. Verification plan

1. `pnpm typecheck` (`astro check && tsc --noEmit`) — the new script is TypeScript.
2. `pnpm dev`, then in the browser (measured via JS evaluation):
   - **G1:** scroll `#starlight__sidebar` to `scrollHeight`, dispatch wheel input, assert
     `window.scrollY` unchanged.
   - **G2:** at `scrollTop = 0` assert **no** `data-more-above` and **yes** `data-more-below`;
     after `scrollTop = 100` assert `data-more-above` appears; with all groups collapsed
     (list shorter than the pane) assert neither attribute is present.
   - **G3:** `getComputedStyle(summary).position === 'sticky'` for a depth-1 and a depth-3
     summary; scroll and confirm the heading stays at `pane` top.
   - **G4:** navigate to a deep reference page (e.g. a `reference/utils/…/functions/*.md`
     entry) with the sidebar pre-scrolled far away; assert `window.scrollY === 0` (document
     never moved) and the active link fully inside the pane rect.
3. Spot-check dark and light themes, plus a 700px-tall and a 1200px-tall window.

## 9. Files touched

- `src/styles/theme/chrome.css` — new "Sidebar: scroll behaviour" section (~35 lines)
- `src/components/ReferenceSidebar.astro` — `initSidebarScrollUX()` + wiring (~40 lines)

Nothing else: no config, no dependencies, no generated files.
