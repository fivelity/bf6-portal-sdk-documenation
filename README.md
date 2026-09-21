# BF6 Portal SDK Documentation

A high-performance, searchable documentation site for the **BF6 Portal SDK** — covering `bf6-portal-mod-types` and `bf6-portal-utils`.

## Features

- **VitePress-powered** — Ultra-fast static site generation
- **Auto-generated API docs** — TypeDoc pipeline extracts all symbols from upstream `.d.ts` files
- **GitHub Actions CI/CD** — Automatic deployment to GitHub Pages on push to `main`
- **Symbol Verifier** — Built-in search to validate any symbol
- **33+ pages** — Complete reference for all 417 mod functions, 40 types, 51 enums, 74 events, and 33 utility modules

## Quick Start

```bash
# Install dependencies
pnpm install

# Generate documentation data
pnpm run docs:generate

# Start development server
pnpm run docs:dev

# Build for production
pnpm run docs:build
```

## Architecture

| Component | Technology |
|-----------|------------|
| Framework | VitePress (Vue 3) |
| API Docs | TypeDoc + typedoc-plugin-markdown |
| Data Pipeline | `scripts/extract-sdk.ts` (TypeScript Compiler API) |
| CI/CD | GitHub Actions → GitHub Pages |
| Package Manager | pnpm workspaces |

## Documentation Sections

- **[Getting Started](/guide/getting-started)** — Installation, configuration, quick start
- **[Mod Types](/mod)** — All `bf6-portal-mod-types` API (417 functions, 40 types, 51 enums, 74 events)
- **[Utils](/utils)** — All `bf6-portal-utils` modules (33 modules across 4 categories)
- **[API Reference](/guide/api-reference)** — Complete typed API surface
- **[Guides](/guide)** — Migration, best practices, examples, changelog

## Project Structure

```
apps/docs/          # VitePress documentation site
  src/              # Source pages, styles, theme, components
  typedoc.json      # TypeDoc configuration
  vitepress.config.ts  # VitePress configuration

scripts/            # Data extraction scripts
  extract-sdk.ts    # Parse .d.ts files → sdk-data.json
  generate-typedoc.ts  # Generate TypeDoc markdown

.github/workflows/  # CI/CD pipeline
  deploy.yml        # GitHub Pages deployment

tsconfig.json       # TypeScript configuration
pnpm-workspace.yaml # pnpm workspace configuration
```

## Development

```bash
# Start dev server
pnpm run docs:dev

# Generate all documentation
pnpm run docs:generate

# Build for production
pnpm run docs:build

# Type check
pnpm run typecheck
```

## Deployment

The site deploys to GitHub Pages automatically via GitHub Actions on every push to `main`.

## License

Released under the MIT License. See upstream package licenses for details.
