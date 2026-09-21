export function sidebar() {
  return {
    '/': [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'TypeScript Setup', link: '/guide/typescript-setup' },
          { text: 'API Reference', link: '/guide/api-reference' },
        ],
      },
      {
        text: 'Mod Types (bf6-portal-mod-types)',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Functions', link: '/mod/functions' },
          { text: 'Types', link: '/mod/types' },
          { text: 'Enums', link: '/mod/enums' },
          { text: 'Events', link: '/mod/events' },
          { text: 'Spawn Enums', link: '/mod/spawn' },
          { text: 'Constants', link: '/mod/constants' },
        ],
      },
      {
        text: 'Utils (bf6-portal-utils)',
        items: [
          { text: 'Overview', link: '/utils' },
          { text: 'Runtime & Events', link: '/utils/runtime' },
          { text: 'Diagnostics', link: '/utils/diagnostics' },
          { text: 'Interface', link: '/utils/interface' },
          { text: 'Gameplay & World', link: '/utils/gameplay' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Migration Guide', link: '/guide/migration' },
          { text: 'Best Practices', link: '/guide/best-practices' },
          { text: 'Examples', link: '/guide/examples' },
          { text: 'Changelog', link: '/guide/changelog' },
        ],
      },
    ],
  };
}
