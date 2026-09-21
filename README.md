# BF6 Portal SDK Reference

Single-file SPA documenting `bf6-portal-mod-types@4.2.0` and `bf6-portal-utils@9.4.0`,
styled after the WARDOGS operations manifest.

## Run

Open `index.html` through any static server (`npm run serve`). The data is already embedded,
so it also works from `file://`.

## Regenerate after upgrading the packages

```bash
npm install                 # installs the pinned typings/utils
npm run docs:extract        # parses the .d.ts files, rewrites sdk-data.json AND re-embeds it in index.html
```

`scripts/extract-sdk.ts` uses the TypeScript compiler API (strict, zero `any`) and needs Node >= 22.18
(native type stripping). Nothing in the site is hand-typed API data.

## Layout

| Path | Role |
| --- | --- |
| `index.html` | The SPA: styles, hash router, views, search palette, markdown renderer |
| `sdk-data.json` | Extracted data (also embedded between `<!--SDK-DATA-START/END-->`) |
| `scripts/extract-sdk.ts` | Extractor; exports the `SdkData` interface |

## Routes

`#/` · `#/start` · `#/mod` · `#/mod/functions/<group>[/<name>]` · `#/mod/fn/<name>` · `#/mod/types` ·
`#/mod/enums[/<name>]` · `#/mod/events` · `#/mod/spawn[/<enum>]` · `#/utils` · `#/utils/<id>[/guide|api[/<anchor>]]`

## Features

- **Verify a symbol** (home): paste `mod.RayCast`, `player.GetPosition()`, etc. Returns confirmed / wrong-case /
  exists-elsewhere / not found, with closest matches. Members it cannot enumerate (e.g. `Events` channels) are reported
  as "cannot confirm", never as false negatives.
- **Search palette**: `/` or Ctrl/Cmd+K across functions, types, enums (+members), events, modules, every exported
  utility symbol, and spawn objects.
- Per-function permalinks, overload grouping, linked type names in signatures, copy buttons, rendered module guides with
  cross-module links, keyboard-accessible, responsive with a mobile drawer.

## Notes

- The typings package has two newer releases than the pin? Bump the versions in `package.json` and re-run extract.
- Fonts load from Google Fonts with system fallbacks.
