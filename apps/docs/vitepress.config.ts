import { defineConfig } from 'vitepress';
import { sidebar } from './src/sidebar.js';
import { nav } from './src/nav.js';

export default defineConfig({
  title: 'BF6 Portal SDK',
  description: 'Searchable reference for bf6-portal-mod-types and bf6-portal-utils',
  base: '/',
  srcDir: 'src',
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap', rel: 'stylesheet' }],
  ],
  themeConfig: {
    logo: { alt: 'BF6 Portal SDK' },
    nav,
    sidebar,
    outline: { level: [2, 3] },
    search: { provider: 'local' },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/deluca-mike/bf6-portal-mod-types' },
      { icon: 'github', link: 'https://github.com/deluca-mike/bf6-portal-utils' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: '© 2026 BF6 Portal SDK Contributors',
    },
    sidebarMenuCollapsible: true,
    sidebarDepth: 3,
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/deluca-mike/bf6-portal-sdk-documenation/edit/main/apps/docs/src/:path',
      text: 'Edit this page on GitHub',
    },
  },
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
  },
  vite: {
    server: { port: 3000 },
    build: { outDir: 'dist', emptyOutDir: true },
  },
});
