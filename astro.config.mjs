// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
            { label: 'Logic Helpers & Vector Math', slug: 'utils/logic-and-vector-math' },
            { label: 'Rule Block Generators', slug: 'utils/rule-block-generators' },
            { label: 'State Management Utilities', slug: 'utils/state-management' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'mod-types', autogenerate: { directory: 'reference/mod-types' } },
            { label: 'utils', autogenerate: { directory: 'reference/utils' } },
          ],
        },
      ],
    }),
  ],
});
