# Changelog

## UI/UX overhaul — badges, sidebar navigation, dual palettes, verified data

This pass addresses every item from the review, plus a handful of correctness
bugs found along the way. Nothing here was assumed — every claim below was
checked against a real `astro check`, `tsc --noEmit`, a full production
`astro build` (983 pages), and a custom data-integrity script
(`pnpm run docs:verify`), all of which currently pass clean.

---

### 1. Header badges — redesigned, fixed, made modular

**Problem:** the "service ribbon" badges (woven-fabric bar + gold bezel) were
bulky and read as decorative rather than technical. They also didn't render
on the Frontline HUD palette at all, and lived in one monolithic component.

**Root cause of the non-rendering bug:** `astro.config.mjs`'s
`components:` map was missing the `SocialIcons` and `Footer` overrides
entirely, so Starlight was silently falling back to its own defaults on
*every* page, on *both* palettes — the badges weren't rendering anywhere in
this branch, not just on the HUD theme.

**What changed:**

- Replaced the ribbon look with a flat, single-row chip (`.wd-chip`): a small
  icon, a muted label, a value in mono — no fabric texture, no bezel.
- Split into single-responsibility components under `src/components/badges/`:
  - `Chip.astro` — the one reusable primitive (icon + label + value)
  - `BuildToolBadge.astro`, `ModelBadge.astro`, `ElapsedBadge.astro` — each
    wraps `Chip` with one piece of build data
  - `BuildBadges.astro` — composes the three into the header row
  - `SdkVersionBadge.astro` — the new SDK-version pill (see §4)
- Fixed the missing component registrations in `astro.config.mjs`.
- Every chip reads `--wd-*` tokens only, so it renders correctly under both
  palettes and both light/dark modes (verified by screenshot in all four
  combinations).

### 2. Sidebar navigation — filter box, scroll UX, active-state contrast

**Problem:** large expanded categories (431 functions, 83 enums, 79 event
handlers) made the sidebar easy to get lost in, with no way to jump straight
to a symbol, no signal about where you were, and low-contrast group labels.

**What changed** (`src/components/ReferenceSidebar.astro` +
`src/styles/components/sidebar.css`):

- **Incremental filter box** at the top of the sidebar. Typing collapses the
  tree to matching branches only, highlights the match inline, shows a live
  count ("29 matches"), and auto-opens/closes `<details>` groups so the
  filtered view reads as a flat result list. Press `/` anywhere to focus it,
  `Esc` to clear.
- **Scroll containment** (`overscroll-behavior: contain`) so scrolling the
  sidebar to its end no longer hands off to the page.
- **Edge fades** — a gradient at the top/bottom of the pane appears only
  when there's more content in that direction.
- **Sticky group headings** — the current group's heading stays pinned while
  its items scroll past, so you always know which module/category you're in.
- **Active-group emphasis** — an expanded top-level group gets a 2px accent
  rail, distinguishing it from collapsed siblings.
- **Auto-scroll to the current page** on load, but only if it isn't already
  visible (a restored scroll position from a previous visit is never
  overridden).
- **Contrast fix** — group labels were `--wd-muted` at 0.66rem, which
  measured under WCAG AA (3.0:1 dark / 3.3:1 light) against the sidebar
  background. Two related fixes:
  - Labels now use `--wd-paper-dim` (7.2:1 dark / 9.2:1 light).
  - `--wd-muted` itself was also darkened/lightened in both palettes (see
    §5) so every other use of it (timestamps, counts, "Defined in" lines)
    clears AA too.

### 3. Sidebar icon centering

**Problem:** the injected top-level icons (rocket, TS, gear) had no explicit
size or alignment rule, so their native SVG viewBox size raced against the
line-height and sat visibly off-center against the label text.

**Fix:** `[data-injected-sidebar-icon]` now gets an explicit
`1.05rem × 1.05rem` box, `inline-flex` centering, and a small
`vertical-align` correction — verified by screenshot against the label
baseline.

### 4. Dynamic data everywhere — no more hardcoded totals

**Problem:** `sdk-stats.json` claimed **570 functions**, but the site only
ever generated **431** function pages — a real, silent discrepancy. The
"570" count was every `export function` *declaration* in the `.d.ts`,
including TypeScript overloads; the docs (correctly) publish one page per
*unique* function name, which is 431. Nothing was cross-checking the two.

**What changed:**

- `scripts/lib/sdk-source.mjs` is now the single source of truth: it parses
  the installed `.d.ts` files directly (`readSourceSymbols()`) *and*
  independently counts the pages TypeDoc actually generated
  (`countReferencePages()`).
- `scripts/generate-stats.mjs` writes both counts into
  `src/data/sdk-stats.json`, including the now-correct `functions: 431` and
  a separate `functionOverloads: 570` for anyone who wants the raw count.
- **New:** `pnpm run docs:verify` (also run as part of `pnpm run build`)
  fails the build if the declared and generated counts ever disagree again,
  or if a registered colour palette is missing its CSS file.
- `src/data/sdk-info.ts` is the one typed entry point UI code reads from —
  every number the site shows (footer, badges, overview pages) now comes
  from here, never a literal.
- `bf6-portal-utils`'s TypeDoc entry points were a hand-maintained list of
  21 paths (`typedoc/utils.json`); replaced with a glob
  (`bf6-portal-utils/*/index.d.ts`) so a new module in a future SDK release
  is picked up automatically instead of silently missing from the docs.

### 5. SDK version, shown where expected

- A new header pill reads **"SDK 1.4.3.0"**, parsed from the `// Version:`
  header comment in `bf6-portal-mod-types`'s own `index.d.ts` — the
  authoritative source, not a guess. (If a future package version ever
  drops that header, `parseSdkVersion()` falls back to deriving it from the
  npm semver and marks the source as `'derived'` so the UI can be honest
  about it — see the pill's tooltip.)
- The footer now also shows a compact summary line: SDK version, both
  package versions, and the live symbol counts.

### 6. Multiple selectable colour palettes

Colour palette is now a **second, independent axis** from Starlight's own
light/dark/auto mode — pick a palette *and* a mode, in any combination:

- **Frontline HUD** (default) — the gunmetal/cyan HUD look
- **Wardogs Manifest** — the original brass/paper manifest look, restored

**How it works:**

- `src/data/themes.ts` is the palette registry (id, label, description).
- Each palette lives in one file, `src/styles/theme/palettes/<id>.css`,
  which defines every `--wd-*` token (colours *and* structural values —
  type scale, corner-cut geometry, heading weights) for both its dark and
  light variant. Every other stylesheet in the project reads `--wd-*`
  tokens exclusively and never a raw hex value, so a new palette is a
  single new CSS file plus one line in the registry — `docs:verify` fails
  the build if you forget the CSS file.
- A `<PaletteSelect>` component (reusing Starlight's own `<Select>`, so it
  matches the built-in theme picker pixel-for-pixel) sits next to the
  light/dark selector in the header. Choice persists to `localStorage` and
  applies via `data-palette` on `<html>`, set synchronously in `Head.astro`
  before first paint (same pattern Starlight uses for its own theme, so
  there's no flash of the wrong palette).
- See `src/styles/theme/palettes/hud.css`'s header comment for exactly how
  to add a third palette.

### 7. General UI/UX and correctness fixes found along the way

- **Duplicate content-collection routes:** `src/content/docs/mod-types/`
  had both `overview.md`/`overview.mdx` and
  `events-and-enums.md`/`events-and-enums.mdx` — two files claiming the same
  route. Astro's content collection would have rejected this as a slug
  collision at build time. Removed the stale `.md` versions; the live
  `.mdx` versions (which import real stats) are kept.
- **Merged the two duplicate theme trees.** The repo had both
  `src/styles/wardogs-theme/` and `src/styles/theme/` (two near-identical
  copies of the same seven files) plus two separate entry stylesheets
  (`wardogs-theme.css`, `frontline-hud-theme.css`). Consolidated into one
  `src/styles/theme/` directory, one entry file (`src/styles/theme.css`),
  with palette-specific values factored out into `theme/palettes/*.css` (see
  §6) so there's exactly one copy of every rule to maintain.
- **Fixed a real CSS parser crash:** one file's doc comment contained the
  literal substring `--wd-*/--sl-*`, and `*/` inside a `/* */` comment
  closes it early regardless of surrounding text — everything after that
  point was parsed as CSS and broke the build. Rewritten to avoid the
  pattern; scanned every other stylesheet in the project for the same
  landmine (none found).
- **`.wd-plate.is-blue/is-green/is-red`** (raw colour names in a class,
  hardcoded to one palette's faction colours) renamed to
  `.is-info/.is-ok/.is-danger` (semantic, palette-neutral). No content
  referenced the old names.
- Ran a `git clean -fdx`-equivalent full rebuild from scratch (cleared
  `.astro/`, `node_modules/.vite`, `dist/`) to confirm none of the above
  was a stale-cache artifact.

---

### Files touched

```fs
astro.config.mjs                          fixed missing component registrations
package.json                              added docs:verify script; reordered docs:api

src/data/
  sdk-info.ts                             NEW — typed read layer for sdk-stats.json
  build-info.ts                           NEW — resolves build provenance + real elapsed time
  project.config.ts                       NEW — the one hand-maintained data file
  themes.ts                               NEW — palette registry
  build-stats.ts                          REMOVED — replaced by build-info.ts + project.config.ts

scripts/
  lib/sdk-source.mjs                      NEW — shared SDK-parsing source of truth
  generate-stats.mjs                      rewritten to use sdk-source.mjs; fixes 570-vs-431 bug
  verify-data.mjs                         NEW — docs:verify

typedoc/utils.json                        entryPoints hardcoded list -> glob

src/components/
  Head.astro                              + pre-paint palette application
  Footer.astro                            + SDK version summary line
  SocialIcons.astro                       + badges, SDK pill, palette select (was rendering defaults)
  PaletteSelect.astro                     NEW
  ReferenceSidebar.astro                  + filter toolbar, scroll UX, icon fix
  BuildBadges.astro                       REMOVED (old ribbon version)
  badges/                                 NEW — Chip, BuildToolBadge, ModelBadge, ElapsedBadge,
                                           SdkVersionBadge, BuildBadges

src/styles/
  theme.css                               NEW single entry (replaces wardogs-theme.css +
                                           frontline-hud-theme.css)
  theme/palettes/hud.css                  NEW
  theme/palettes/manifest.css             NEW
  theme/tokens.css                        rewritten: shared tokens + one Starlight mapping
  theme/{base,chrome,content,hero,reference}.css
                                           rewritten against --wd-* tokens (palette-agnostic)
  components/sidebar.css                  NEW
  components/badges.css                   NEW
  wardogs-theme/                          REMOVED (duplicate of theme/)
  wardogs-theme.css                       REMOVED
  frontline-hud-theme.css                 REMOVED

src/content/docs/mod-types/
  overview.md, events-and-enums.md        REMOVED (duplicate routes; .mdx versions kept)
```

### Verifying this yourself

```bash
pnpm install
pnpm run docs:api        # generates reference + src/data/sdk-stats.json
pnpm run docs:verify      # cross-checks declared vs. generated counts + palette CSS
pnpm run typecheck        # astro check && tsc --noEmit
pnpm run build             # full production build, 983 pages
pnpm run preview           # verify base-path links; toggle palette + theme in the header
```
