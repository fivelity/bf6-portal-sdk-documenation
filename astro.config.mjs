// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

// GitHub Pages project site: https://fivelity.github.io/bf6-portal-sdk-documenation/
// "documenation" matches the repo name's actual spelling on GitHub.
const REPO = "bf6-portal-sdk-documenation";

export default defineConfig({
  site: "https://fivelity.github.io",
  base: `/${REPO}`,
  integrations: [
    starlight({
      title: "BF6 Portal SDK",
      description:
        "Guides and generated API reference for bf6-portal-utils, plus how it fits with the global mod namespace from bf6-portal-mod-types.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: `https://github.com/fivelity/${REPO}`,
        },
      ],
      customCss: [
        "@fontsource/barlow-condensed/500.css",
        "@fontsource/barlow-condensed/700.css",
        "@fontsource/ibm-plex-sans/400.css",
        "@fontsource/ibm-plex-sans/600.css",
        "@fontsource/jetbrains-mono/400.css",
        "./src/styles/dossier.css",
      ],
      components: {
        PageTitle: "./src/components/DossierTitle.astro",
      },
      plugins: [
        // bf6-portal-utils ships no single barrel entry point — each module is
        // its own subpath export (bf6-portal-utils/logger, /ui, and so on).
        // TypeDoc reads the installed package's .d.ts for each confirmed
        // subpath directly from node_modules. Add a line here for every
        // subpath your installed version actually exports; see SETUP.md.
        starlightTypeDoc({
          entryPoints: [
            "./node_modules/bf6-portal-utils/logger/index.d.ts",
            "./node_modules/bf6-portal-utils/ui/index.d.ts",
          ],
          tsconfig: "./tsconfig.typedoc.json",
          output: "api/utils",
          sidebar: {
            label: "bf6-portal-utils API",
            collapsed: true,
          },
          typeDoc: {
            entryPointStrategy: "expand",
            skipErrorChecking: true,
            excludePrivate: true,
            excludeInternal: true,
          },
        }),
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Core concepts", slug: "getting-started/core-concepts" },
            { label: "Quickstart", slug: "getting-started/quickstart" },
          ],
        },
        {
          label: "The mod namespace",
          items: [
            { label: "Overview", slug: "mod-types/overview" },
            { label: "Events and callbacks", slug: "mod-types/events-and-enums" },
            { label: "Players, vehicles, and objects", slug: "mod-types/interfaces" },
          ],
        },
        {
          label: "bf6-portal-utils",
          items: [
            { label: "Overview", slug: "utils/overview" },
            { label: "Logger", slug: "utils/logger" },
            { label: "UI", slug: "utils/ui" },
            { label: "Events, Timers, and Clocks", slug: "utils/events-timers-clocks" },
            { label: "Other modules", slug: "utils/other-modules" },
          ],
        },
        typeDocSidebarGroup,
      ],
      lastUpdated: true,
    }),
  ],
});
