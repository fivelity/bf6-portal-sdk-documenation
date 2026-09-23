// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

// Update `site` and `base` to match your GitHub Pages URL before deploying.
// For a project page at https://<user>.github.io/<repo>/ set base to '/<repo>'.
const SITE_URL = 'https://fivelity.github.io';
const BASE_PATH = '/bf6-portal-sdk-documenation';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  outDir: './dist',
  integrations: [
    starlight({
      title: 'BF6 Portal SDK',
      description:
        'Documentation for bf6-portal-mod-types and bf6-portal-utils — packages based on the Official TypeScript SDK for creating Battlefield 6 Portal Experiences.',
      customCss: ['./src/styles/wardogs-theme.css'],
      components: {
        Sidebar: './src/ReferenceSidebar.astro',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/fivelity/bf6-portal-sdk-documenation',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/fivelity/bf6-portal-sdk-documenation/edit/main/',
      },
      lastUpdated: true,
      pagination: true,
      favicon: '/favicon.svg',
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
        styleOverrides: {
          borderRadius: '2px',
          codeFontFamily:
            "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          codeFontSize: '0.85rem',
        },
      },
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
            {
              label: 'Player / Vehicle / Game Mode Interfaces',
              slug: 'mod-types/interfaces',
            },
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
            { label: 'Other Modules', slug: 'utils/other-modules' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            {
              label: 'mod-types',
              badge: { text: '431 fn · 83 enum', variant: 'note' },
              items: [
                { autogenerate: { directory: 'reference/mod-types', collapsed: true } },
              ],
            },
            {
              label: 'utils',
              badge: { text: '21 modules', variant: 'note' },
              items: [
                { autogenerate: { directory: 'reference/utils', collapsed: true } },
              ],
            },
          ],
        },
      ],
    }),
    mdx(),
  ],
});
