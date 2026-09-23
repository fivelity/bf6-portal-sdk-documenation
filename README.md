# BF6 Portal SDK Docs

Documentation site for `bf6-portal-mod-types` and `bf6-portal-utils`, built with
[Astro Starlight](https://starlight.astro.build/) and [TypeDoc](https://typedoc.org/).
Styled after the WARDOGS Operations Manifest (dark canvas, brass accent,
JetBrains Mono / Big Shoulders Display).

Every conceptual guide on this site is written from the **real, published**
`.d.ts` files and first-party module READMEs shipped inside each package —
not from memory, tutorials, or assumption. If a symbol appears here, it was
verified against the installed package.

## Stack

- **Site:** Starlight (Astro) — static output, Pagefind search built in
- **API docs:** TypeDoc + `typedoc-plugin-markdown`, generated from the
  installed `.d.ts` files of both packages
- **Package manager:** pnpm
- **Deploy:** GitHub Actions → GitHub Pages

## Local development

```bash
pnpm install
pnpm run docs:api     # generate API reference markdown from installed SDK packages
pnpm run dev           # start Astro dev server
```

Visit `http://localhost:4321`.

## Scripts

| Script | What it does |
|---|---|
| `pnpm run docs:api` | Runs TypeDoc against both packages, writes markdown into `src/content/docs/reference/`, then injects Starlight frontmatter |
| `pnpm run docs:api:mod-types` | TypeDoc for `bf6-portal-mod-types` only, then frontmatter injection for that tree |
| `pnpm run docs:api:utils` | TypeDoc for `bf6-portal-utils` only, then frontmatter injection for that tree |
| `pnpm run dev` | Astro dev server |
| `pnpm run build` | Runs `docs:api`, then `astro build` → `dist/` |
| `pnpm run preview` | Preview the production build locally |
| `pnpm run typecheck` | `astro check` + `tsc --noEmit` |

## Project structure

```
├── .github/workflows/deploy-docs.yml   # CI: typedoc → typecheck → build → deploy to Pages
├── astro.config.mjs                     # Starlight config, curated sidebar, site/base URL
├── scripts/
│   └── add-reference-frontmatter.mjs    # injects title/description into generated TypeDoc markdown
├── typedoc/
│   ├── mod-types.json                   # TypeDoc options for bf6-portal-mod-types
│   ├── tsconfig.mod-types.json          # scoped tsconfig TypeDoc converts against
│   ├── utils.json                       # TypeDoc options for bf6-portal-utils (multi-entry-point)
│   └── tsconfig.utils.json              # scoped tsconfig for the utils entry points
├── src/
│   ├── content.config.ts                # Starlight docs collection (content-layer loader API)
│   ├── styles/wardogs-theme.css         # Custom Starlight theme (manifest palette)
│   └── content/docs/
│       ├── guides/                      # Getting Started section
│       ├── mod-types/                   # Conceptual docs for bf6-portal-mod-types
│       ├── utils/                       # Conceptual docs for bf6-portal-utils
│       └── reference/                   # Auto-generated — do not hand-edit
└── package.json
```

## Why TypeDoc needs the config it has (read before touching `typedoc/*.json`)

This SDK's packages aren't ordinary npm modules, and the default TypeDoc
setup silently produces near-empty output against them. Three things are
load-bearing:

1. **`excludeExternals: false` in both configs.** `bf6-portal-mod-types` is
   a single ambient `declare namespace mod { ... }` file with no exports of
   its own module scope — TypeDoc's default `excludeExternals: true`
   treats the entire namespace as "external" and drops it, turning ~600
   documentable symbols into a 3-line stub page. If mod-types docs
   generation ever regresses to near-empty output, check this first.
2. **Scoped `tsconfig.*.json` files, not the root `tsconfig.json`.**
   TypeDoc requires its entry points to be covered by a tsconfig's
   `include`. Pointing it at the root config (which only includes `src/**`)
   fails with "no entry points found." Each `typedoc/tsconfig.*.json`
   scopes `include` to just that package's `.d.ts` files and sets
   `lib: ["ES2020"]` (the packages declare their own ambient `console`
   global, which collides with `lib.dom.d.ts`'s `console` if DOM libs are
   pulled in).
3. **`bf6-portal-utils` has no single entry point.** It's 21 independent
   subpath modules (`bf6-portal-utils/events`, `/vectors`, `/timers`, …),
   each with its own `index.d.ts`. `typedoc/utils.json` lists every module
   explicitly in `entryPoints` with `entryPointStrategy: "expand"`. If a
   new module subfolder is added to a future `bf6-portal-utils` release, it
   won't be documented until its `index.d.ts` path is added to that array.

### The `typedoc-plugin-markdown` v4 gotcha

`typedoc-plugin-markdown` writes each directory's index page as `README.md`
by default — a filename Starlight/Astro's file-based routing doesn't treat
as a folder index (`index.md` is required). Both `typedoc/*.json` configs
set `"entryFileName": "index"` to fix this globally. If you see 404s on
reference section roots (`/reference/utils/events/` working but
`/reference/utils/` not), check this option hasn't been dropped from a
config, or that a `README.md` isn't sitting alongside an `index.md` in the
same generated folder.

Also: neither config uses `sidebar` or `frontmatterGlobals` — both are v3
typedoc-plugin-markdown options that don't exist in v4 and are silently
ignored rather than erroring, so a config carried over from an older
example project can look valid while doing nothing. Sidebar structure for
generated pages is handled entirely by `astro.config.mjs`, not by TypeDoc.

## Why generated pages have frontmatter despite TypeDoc never writing any

TypeDoc + `typedoc-plugin-markdown` output has zero YAML frontmatter, but
Starlight's `docsSchema()` requires every page to have a `title` string, or
the build fails. `scripts/add-reference-frontmatter.mjs` runs immediately
after each `docs:api:*` TypeDoc invocation and prepends `title`/
`description`/`editUrl: false`, derived from that page's own `#` heading.
It's idempotent-safe: it skips any file that already starts with `---`
(which lets you drop a genuinely hand-curated file into `reference/` — e.g.
a directory's `index.md` — and it won't be clobbered, though nothing in
this repo currently does that, since the sidebar's curated groups make a
hand-written reference index unnecessary).

## Maintaining the curated sidebar

`astro.config.mjs`'s `sidebar` array has four top-level groups: **Getting
Started**, **bf6-portal-mod-types** (conceptual guides), **bf6-portal-utils**
(conceptual guides, one per real module or module family), and
**API Reference** (the generated TypeDoc trees).

The API Reference groups use `autogenerate: { directory: 'reference/mod-types' }`
/ `'reference/utils'` — nested one level under a `label`-only parent group,
per the Starlight 0.39+ sidebar API (a bare `{ label, autogenerate }` item
is invalid; `autogenerate` must be the only key alongside no `label` on its
own object). This means:

- **New symbols in an existing SDK version bump never need a sidebar
  edit** — `autogenerate` walks whatever `docs:api` produced.
- **A new `bf6-portal-utils` module subfolder** needs (a) its `index.d.ts`
  path added to `typedoc/utils.json`'s `entryPoints`, and (b), if it
  deserves its own conceptual guide, a new page under
  `src/content/docs/utils/` plus a `slug` entry in the hand-curated
  **bf6-portal-utils** sidebar group.
- **A new conceptual guide page** (either package) needs a `slug` entry
  added to the matching hand-curated group in `astro.config.mjs` — these
  groups are not autogenerated, by design, so their order and grouping stay
  under editorial control.

## Updating SDK versions

Bump `bf6-portal-mod-types` / `bf6-portal-utils` in `package.json`, reinstall,
and re-run `pnpm run docs:api` — the API Reference section regenerates
entirely from whatever version is installed. Conceptual guide pages under
`guides/`, `mod-types/`, and `utils/` are hand-written against the verified
real API and won't auto-update — re-verify any code sample against the new
`.d.ts` / module README before assuming it still compiles, since this SDK
has changed its actual API surface across versions before.

## Deploying to GitHub Pages

1. In your repo, go to **Settings → Pages → Source** and select **GitHub
   Actions**.
2. Edit `SITE_URL` and `BASE_PATH` at the top of `astro.config.mjs` to match
   your GitHub username/org and repo name:
   ```js
   const SITE_URL = 'https://<your-username>.github.io';
   const BASE_PATH = '/<your-repo-name>';
   ```
3. Push to `main`. The `deploy-docs.yml` workflow builds and deploys
   automatically.

## Notes on accuracy

Every API Reference page is generated directly from the installed package's
type declarations — nothing under `reference/` is hand-transcribed. Every
conceptual guide page elsewhere on this site was written against the real
`.d.ts` files and in-package module READMEs, pulled from the actual
published npm packages, not recalled from memory or copied from
third-party tutorials — consistent with this project's whole reason for
existing. If you add or edit a conceptual guide that references a specific
`mod.*` or utility symbol, verify it against the generated reference (or
`node_modules/<package>/**/*.d.ts` directly) before publishing.
