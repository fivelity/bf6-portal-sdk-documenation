# BF6 Portal SDK Reference

A searchable, single-page application that documents the **BF6 Portal Modding SDK** — specifically `bf6-portal-mod-types@4.2.0` and `bf6-portal-utils@9.4.0`. All 157 routes render with zero script errors.

---

## Table of Contents

| Section | Description |
|---------|-------------|
| [Quick Start](#quick-start) | Running the docs locally |
| [Architecture Overview](#architecture-overview) | How the project is structured |
| [Data Extraction Pipeline](#data-extraction-pipeline) | Regenerating from upstream typings |
| [Site Routes & Navigation](#site-routes--navigation) | Available pages and URL patterns |
| [Key Features](#key-features) | What makes this reference unique |
| [Design System](#design-system) | Visual identity and typography |
| [Customization Guide](#customization-guide) | Extending and modifying the site |
| [Known Limitations](#known-limitations) | Current constraints and caveats |
| [Contributing](#contributing) | How to contribute |

---

## Quick Start

### Local Development

```bash
npm install                 # Install pinned dependencies
npm run serve               # Launch the static server on http://localhost:3000
```

> **Tip:** The data is pre-embedded, so `index.html` also works directly via `file://`. For development without a server, simply open the file in any browser.

### Regenerate After Upgrading Packages

When upstream typings are updated (e.g., bumping to `bf6-portal-mod-types@4.3.0`), rebuild the documentation:

```bash
npm install                 # Pulls the new package versions from npm
npm run docs:extract        # Re-parses .d.ts files, rewrites sdk-data.json & re-embeds it in index.html
```

The extraction pipeline uses the TypeScript Compiler API (strict mode, zero `any`) and requires **Node ≥ 22.18** for native type stripping support. All documentation content is machine-generated — nothing is hand-typed.

---

## Architecture Overview

| File / Path | Responsibility |
|-------------|----------------|
| `index.html` | Single-page application: CSS, hash-based router, view renderer, search palette, and Markdown rendering engine |
| `sdk-data.json` | Extracted API metadata (also embedded inline between `<!--SDK-DATA-START-->` / `<!--SDK-DATA-END-->`) |
| `scripts/extract-sdk.ts` | TypeScript extractor script; defines the `SdkData` interface consumed by the SPA |
| `tsconfig.json` | Compiler configuration for strict typing validation |

---

## Data Extraction Pipeline

The entire documentation is generated from upstream `.d.ts` type definitions via `scripts/extract-sdk.ts`. The pipeline performs:

1. **Type Resolution:** Uses `typescript.compileOptions` with full strict mode enabled
2. **Symbol Extraction:** Walks AST nodes to extract functions, types, enums, events, and spawn objects
3. **Categorization:** Groups `mod` functions into 17 logical categories (manual curation since typings lack taxonomy)
4. **Serialization:** Outputs structured JSON via `SdkData` interface
5. **Embedding:** Injects the JSON payload directly into `index.html`

### Extracted Statistics

| Category | Count | Notes |
|----------|-------|-------|
| Mod functions | 417 | 551 declarations including overloads |
| Types | 40 | Structured and interface definitions |
| Enums | 51 | Constant sets and discriminant unions |
| Event signatures | 74 | Subscription-based event channels |
| Runtime spawn enums | 25 | ~28,000 total spawned objects |
| Utility modules | 33 | Each with guide & typed API tabs |

---

## Site Routes & Navigation

The SPA uses a hash-based router. All routes are documented below:

### Core Pages

| Route | Description |
|-------|-------------|
| `#/` | Home page — symbol verifier with paste-and-search functionality |
| `#/start` | Getting started guide for new developers |

### Mod Module Documentation

| Route | Description |
|-------|-------------|
| `#/mod` | Overview of all mod functions, grouped by category |
| `#/mod/functions/<group>` | Category index page (e.g., Player, Network, UI) |
| `#/mod/functions/<group>/<name>` | Detailed function documentation with signatures and examples |
| `#/mod/fn/<name>` | Shortcut route for any mod function by name |
| `#/mod/types` | Complete listing of all exported types |
| `#/mod/enums` | Complete listing of all enums |
| `#/mod/enums/<name>` | Detailed enum documentation with member values |
| `#/mod/events` | Event subscription reference (channels, handlers, patterns) |
| `#/mod/spawn` | Runtime spawn object overview |
| `#/mod/spawn/<enum>` | Spawn-specific documentation per category |

### Utils Module Documentation

| Route | Description |
|-------|-------------|
| `#/utils` | Overview of all utility modules with cross-module references |
| `#/utils/<id>` | Individual module page — README, linked helpers, and API reference |
| `#/utils/<id>/guide` | Practical usage guide for the module |
| `#/utils/<id>/api` | Typed API surface (method signatures, types) |
| `#/utils/<id>/api/<anchor>` | Specific method anchor within the API tab |

---

## Key Features

### Symbol Verification Engine (Home Page)

Paste any symbol to validate its existence and signature:

- **Verified symbols:** Display full type information. Example: `mod.RayCast` shows a valid `void` return type
- **Not found:** Returns "not found in either package" for invalid lookups. Examples: `player.GetPosition()`, `Network.OnReceiveFromClient`, `mod.getTeamId`

### Search Palette

Open with `/` or `Ctrl/Cmd + K`. The search index covers:

- All mod functions (417) and their overloads
- Types, enums, and enum members
- Event signatures and subscription patterns
- Utility module symbols and exports
- Runtime spawn objects and categories

### Function Pages

Each function page includes:

- Categorized grouping with category navigation breadcrumbs
- Per-function permalinks for sharing and bookmarking
- Overloads grouped under a single entry (with clear overload indicators)
- Cross-linked type names that navigate to their dedicated pages

### Module Guides

Every utility module features:

- A README section documenting purpose and usage context
- Links to related modules that work together
- A separate typed API tab with method signatures, parameter types, and return values

---

## Design System

| Aspect | Specification |
|--------|---------------|
| **Color Palette** | Dark background (`#0a0a0f`) with brass accent (`#b8860b`) |
| **Typography (Display)** | *Big Shoulders Display* — headline and hero text |
| **Typography (Body)** | *Inter* — body copy, descriptions, documentation text |
| **Typography (Code)** | *JetBrains Mono* — code snippets, signatures, type annotations |
| **Navigation** | Sticky sidebar index with collapsible category sections |
| **Tables** | Hairline borders for manifest-style data tables |
| **Grids** | Plate-style card grids for module and function listings |
| **Color Coding** | Typings rendered in blue; utilities rendered in green |

---

## Known Limitations

### Enumerability Constraints

Some symbols cannot be fully enumerated due to TypeScript's static analysis limitations:

- **Mapped type events:** The `Events` channels derive from mapped types, which the extractor cannot iterate. These appear as "cannot confirm" rather than a definitive "not found."
- **Dynamic type inference:** Symbols requiring runtime resolution are marked with uncertainty indicators.

### Version Pinning

The docs reference pinned versions:

- `bf6-portal-mod-types@4.2.0` (npm latest: 4.3.0)
- `bf6-portal-utils@9.4.0`

To upgrade, edit the version pins in `package.json`, run `npm install`, then re-extract with `npm run docs:extract`.

### Custom Categorization

The 17 mod function categories are manually curated since upstream typings do not provide a taxonomy. Adjust the `categorize()` function in `scripts/extract-sdk.ts` to modify category assignments or create new groups.

---

## Customization Guide

### Changing Category Groupings

Edit `scripts/extract-sdk.ts` → locate the `categorize()` function:

```typescript
function categorize(symbolName: string): string {
    // Map symbol names to category strings
}
```

Return values map directly to route segments (e.g., `"Player"`, `"Network"`).

### Adding New Views or Routes

The hash router lives inside `index.html`. Add a new view by:

1. Implementing the view function in the script section
2. Registering it in the route map
3. Updating the navigation sidebar accordingly

### Updating Upstream Package Versions

```bash
# 1. Edit package.json to bump versions
# 2. Install updated packages
npm install
# 3. Re-extract and embed
npm run docs:extract
```

---

## Contributing

This is a single-author project, but contributions are welcome for:

- **Extractor improvements:** Fix categorization logic, handle new symbol types
- **Documentation enhancements:** Improve README clarity, add usage examples
- **UI/UX refinements:** Performance optimizations, accessibility improvements
- **Bug fixes:** Router edge cases, rendering errors, search index gaps

All changes should pass the typecheck gate: `npm run typecheck` must exit with code 0.

---

## License

This project is distributed under the same terms as the BF6 Portal SDK documentation it references. See upstream package licenses for full details.
