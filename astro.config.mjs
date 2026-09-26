// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import { buildReferenceSidebar } from './scripts/reference-sidebar.mjs';

// Update `site` and `base` to match your GitHub Pages URL before deploying.
// For a project page at https://<user>.github.io/<repo>/ set base to '/<repo>'.
// NOTE: the repo slug below is spelled exactly as on GitHub ("documenation").
const SITE_URL = 'https://fivelity.github.io';
const BASE_PATH = '/bf6-portal-sdk-documenation';
const REPO_URL = 'https://github.com/fivelity/bf6-portal-sdk-documenation';

/**
 * The generated API reference for one package, as a single collapsed
 * "API Reference" subgroup. index 0 = mod-types, 1 = utils.
 */
const referenceGroups = buildReferenceSidebar();
/** @param {number} i */
const apiGroup = (i) => {
  const g = referenceGroups[i];
  if (!g) throw new Error(`[astro.config] No reference sidebar group at index ${i}`);
  return { label: 'API Reference', collapsed: true, items: g.items };
};

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  outDir: './dist',
  integrations: [
    starlight({
      title: 'BF6 Portal SDK',
      description:
        'Documentation for bf6-portal-mod-types and bf6-portal-utils — packages based on the Official TypeScript SDK for creating Battlefield 6 Portal Experiences.',
      favicon: '/favicon.svg',
      lastUpdated: true,
      pagination: true,
      social: [{ icon: 'github', label: 'GitHub', href: REPO_URL }],
      editLink: { baseUrl: `${REPO_URL}/edit/main/` },

      // Publishes /llms.txt, /llms-full.txt, and /llms-small.txt so LLM
      // tooling and agents can consume this site directly instead of
      // scraping rendered HTML. Every page is generated from the real
      // .d.ts files (see README "Notes on accuracy"), so the full-text
      // dump is safe to hand to a model as ground truth.
      plugins: [
        starlightLlmsTxt({
          projectName: 'BF6 Portal SDK',
          description:
            'TypeScript documentation for bf6-portal-mod-types and bf6-portal-utils, generated directly from the installed packages\u2019 .d.ts files.',
          // Reference symbol pages dominate the tree (~950 pages) and are
          // low-value as full-text context compared to the conceptual
          // guides; llms.txt still links every reference index so an
          // agent can fetch a specific symbol page on demand.
          demote: ['reference/**'],
          promote: ['index', 'guides/**', 'mod-types/**', 'utils/**'],
        }),
      ],

      // Order matters: fonts first, then the theme entry.
      // Fontsource variable fonts are self-hosted → no third-party request.
      customCss: [
        '@fontsource-variable/big-shoulders-display',
        '@fontsource-variable/inter',
        '@fontsource-variable/jetbrains-mono',
        './src/styles/wardogs-theme.css',
      ],

      components: {
        Head: './src/components/Head.astro',
        Sidebar: './src/components/ReferenceSidebar.astro',
        MarkdownContent: './src/components/MarkdownContent.astro',
      },

      // Warm Gruvbox syntax themes sit naturally next to the brass palette.
      expressiveCode: {
        themes: ['gruvbox-dark-hard', 'gruvbox-light-hard'],
        useStarlightUiThemeColors: false,
        styleOverrides: {
          borderRadius: '2px',
          codeFontFamily:
            "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          codeFontSize: '0.85rem',
          uiFontFamily: "'Inter Variable', 'Inter', system-ui, sans-serif",
        },
      },

      // One dropdown per package. Each holds that package's guides AND its
      // generated API reference, so the tree never splits a package across
      // two places. `buildReferenceSidebar()` flattens TypeDoc's wrapper
      // directories (see scripts/reference-sidebar.mjs).
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'guides/introduction' },
            { label: 'Installation & Setup', slug: 'guides/installation' },
            { label: 'Architecture & Core Concepts', slug: 'guides/architecture' },
            { label: 'Quickstart Guide', slug: 'guides/quickstart' },
          ],
        },
        {
          label: 'bf6-portal-mod-types',
          items: [
            { label: 'Overview & Schemas', slug: 'mod-types/overview' },
            { label: 'Event Handlers & Enums', slug: 'mod-types/events-and-enums' },
            { label: 'Player / Vehicle / Game Mode Interfaces', slug: 'mod-types/interfaces' },
            apiGroup(0),
          ],
        },
        {
          label: 'bf6-portal-utils',
          items: [
            { label: 'Overview', slug: 'utils/overview' },
            { label: 'Vector Math', slug: 'utils/vector-math' },
            { label: 'Events', slug: 'utils/events' },
            { label: 'Timers & Clocks', slug: 'utils/timers-and-clocks' },
            { label: 'UI Components', slug: 'utils/ui-components' },
            { label: 'Solid UI (Reactive)', slug: 'utils/solid-ui' },
            { label: 'Mod Extensions', slug: 'utils/mod-extensions' },
            { label: 'Module Usage Examples', slug: 'utils/module-examples' },
            { label: 'State & Rule Patterns', slug: 'utils/state-and-rules' },
            apiGroup(1),
          ],
        },
      ],
    }),
  ],
});
