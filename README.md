# BF6 Portal SDK Docs

Documentation site for `bf6-portal-mod-types` and `bf6-portal-utils`, built with
[Astro Starlight](https://starlight.astro.build/) and [TypeDoc](https://typedoc.org/).
Styled after the WARDOGS Operations Manifest (dark canvas, brass accent,
JetBrains Mono / Big Shoulders Display).

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
| `pnpm run docs:api` | Runs TypeDoc against both packages, writes markdown into `src/content/docs/reference/` |
| `pnpm run docs:api:mod-types` | TypeDoc for `bf6-portal-mod-types` only |
| `pnpm run docs:api:utils` | TypeDoc for `bf6-portal-utils` only |
| `pnpm run dev` | Astro dev server |
| `pnpm run build` | Runs `docs:api`, then `astro build` → `dist/` |
| `pnpm run preview` | Preview the production build locally |
| `pnpm run typecheck` | `astro check` + `tsc --noEmit` |

## Project structure

```
├── .github/workflows/deploy-docs.yml   # CI: typedoc → build → deploy to Pages
├── astro.config.mjs                     # Starlight config, sidebar, site/base URL
├── typedoc/
│   ├── mod-types.json                   # TypeDoc options for bf6-portal-mod-types
│   └── utils.json                       # TypeDoc options for bf6-portal-utils
├── src/
│   ├── styles/wardogs-theme.css         # Custom Starlight theme (manifest palette)
│   └── content/docs/
│       ├── guides/                      # Getting Started section
│       ├── mod-types/                   # Conceptual docs for bf6-portal-mod-types
│       ├── utils/                       # Conceptual docs for bf6-portal-utils
│       └── reference/                   # Auto-generated — do not hand-edit
└── package.json
```

## Updating SDK versions

Bump `bf6-portal-mod-types` / `bf6-portal-utils` in `package.json`, reinstall,
and re-run `pnpm run docs:api` — the API Reference section regenerates
entirely from whatever version is installed. Conceptual guide pages under
`guides/`, `mod-types/`, and `utils/` are hand-written and won't be touched.

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
type declarations — nothing under `reference/` is hand-transcribed. If you
add a conceptual guide that references a specific `mod.*` or utility symbol,
verify it against the generated reference (or `node_modules/<package>/*.d.ts`
directly) rather than from memory, consistent with the project's broader
practice of never trusting unverified SDK claims.
