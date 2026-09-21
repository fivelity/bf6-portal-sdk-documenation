# BF6 Portal SDK documentation

Starlight site: guides for the global `mod` namespace
(`bf6-portal-mod-types`) and `bf6-portal-utils`, plus a generated API
reference for the confirmed `bf6-portal-utils` subpath modules.

## Develop

```bash
pnpm install
pnpm docs:dev
```

## Build

```bash
pnpm docs:build   # generates the API reference, then builds to ./dist
```

## Deploy

Pushes to `main` build and publish to GitHub Pages through
`.github/workflows/deploy-docs.yml`. In the repository settings, set
**Pages > Source** to **GitHub Actions**.
