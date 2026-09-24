/**
 * Builds the "API Reference" sidebar groups from the generated TypeDoc tree.
 *
 * Why this exists
 * ---------------
 * `autogenerate: { directory }` mirrors the filesystem one-to-one. TypeDoc's
 * output is deeply wrapped:
 *
 *   reference/mod-types/bf6-portal-mod-types/namespaces/mod/functions/*.md
 *   reference/utils/ui/namespaces/UI/classes/*.md
 *
 * so autogenerate produced 5-6 levels of single-child wrapper groups
 * ("bf6-portal-mod-types" > "namespaces" > "mod" > "functions" ...), each
 * rendered as its own collapsible group with its own guide rail.
 *
 * This module instead emits an EXPLICIT, shallow structure:
 *
 *   bf6-portal-mod-types        <- ONE dropdown for the whole package
 *     Overview
 *     Functions        (432)    <- category groups, collapsed
 *     Enumerations     (84)
 *     ...
 *   bf6-portal-utils            <- ONE dropdown for the whole package
 *     Overview
 *     events                    <- one group per module, collapsed
 *     ...
 *
 * Wrapper directories (`namespaces/`, the package dir, the namespace dir) are
 * skipped entirely. Symbol pages are sorted alphabetically; a category's own
 * `index.md` becomes the group's first link ("Overview").
 *
 * It reads the tree at config time, so run `pnpm run docs:api` BEFORE
 * `astro dev/build` (the `build` script already does). If the tree does not
 * exist yet (fresh clone, first `astro check`), it degrades to just the
 * package landing link instead of throwing.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DOCS_ROOT = 'src/content/docs';

/** Human labels for TypeDoc's category directory names. */
const CATEGORY_LABELS = {
  functions: 'Functions',
  enumerations: 'Enumerations',
  'type-aliases': 'Type Aliases',
  variables: 'Variables',
  classes: 'Classes',
  interfaces: 'Interfaces',
};

/** Preferred order for category groups; unknown ones sort after, alphabetically. */
const CATEGORY_ORDER = ['functions', 'classes', 'interfaces', 'enumerations', 'type-aliases', 'variables'];

const categoryRank = (dir) => {
  const i = CATEGORY_ORDER.indexOf(dir);
  return i === -1 ? CATEGORY_ORDER.length : i;
};

/** Directory entries (sync — sidebar is built while the config loads). */
function ls(dir) {
  return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : [];
}

/**
 * Slug for a docs-relative file path, the way Astro's content layer computes an
 * entry id: strip `.md`, lowercase each segment, and treat a trailing `/index`
 * as the directory route (`a/b/index.md` -> `a/b`).
 *
 * That last rule also catches a symbol whose own name is "Index" — SolidUI
 * exports an `Index` component, so TypeDoc writes `functions/Index.md`, which
 * Astro normalises to the `functions` route. Linking `.../functions/index`
 * would throw "slug does not exist" at build time, so we mirror Astro exactly.
 */
function slugOf(relPath) {
  return relPath
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace(/\/index$/, '');
}

/** All symbol pages directly inside `dir`, alphabetical, as sidebar links. */
function symbolLinks(dir, docsRelDir) {
  return ls(dir)
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md')
    .map((e) => ({ label: e.name.replace(/\.md$/, ''), slug: slugOf(`${docsRelDir}/${e.name}`) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
}

/**
 * A category directory (e.g. `.../mod/functions`) -> one collapsed group.
 * Returns null when it contains no pages.
 */
function categoryGroup(dir, docsRelDir, dirName, labelOverride) {
  const links = symbolLinks(dir, docsRelDir);
  const hasIndex = existsSync(join(dir, 'index.md'));
  if (links.length === 0 && !hasIndex) return null;

  const items = [];
  if (hasIndex) items.push({ label: 'Overview', slug: slugOf(`${docsRelDir}/index.md`) });
  items.push(...links);

  return {
    label: labelOverride ?? CATEGORY_LABELS[dirName] ?? dirName,
    badge: links.length > 0 ? { text: String(links.length), variant: 'default' } : undefined,
    collapsed: true,
    items,
  };
}

/**
 * Collect every category directory under `root`, IGNORING wrapper levels
 * (`namespaces`, and single-purpose namespace/package dirs). A "category dir"
 * is any directory whose name is a known TypeDoc category.
 * Returns [{ dir, docsRelDir, name }].
 */
function findCategoryDirs(root, docsRelRoot) {
  const found = [];
  const walk = (dir, docsRel) => {
    for (const e of ls(dir)) {
      if (!e.isDirectory()) continue;
      const childDir = join(dir, e.name);
      const childRel = `${docsRel}/${e.name}`;
      if (e.name in CATEGORY_LABELS) found.push({ dir: childDir, docsRelDir: childRel, name: e.name });
      else walk(childDir, childRel); // wrapper: descend, don't emit a group
    }
  };
  walk(root, docsRelRoot);
  return found;
}

/** `bf6-portal-mod-types` package dropdown. */
function modTypesGroup() {
  const root = join(DOCS_ROOT, 'reference/mod-types');
  const rel = 'reference/mod-types';
  const items = [];

  if (existsSync(join(root, 'index.md'))) items.push({ label: 'Reference index', slug: 'reference/mod-types' });

  // `reference/mod-types/variables/` holds only the ambient `console` global; it is
  // added as its own link below, so exclude it from the category groups.
  const cats = findCategoryDirs(root, rel).filter((c) => c.docsRelDir !== 'reference/mod-types/variables');
  // `EventHandlerSignatures/functions` shares the name "functions" with `mod/functions`;
  // disambiguate by looking at the path.
  const groups = cats
    .map(({ dir, docsRelDir, name }) => {
      const isHandlers = docsRelDir.includes('EventHandlerSignatures');
      const label = isHandlers ? 'Event Handlers' : undefined;
      const g = categoryGroup(dir, docsRelDir, name, label);
      return g ? { g, rank: isHandlers ? categoryRank('functions') + 0.5 : categoryRank(name) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank)
    .map(({ g }) => g);

  items.push(...groups);

  // The ambient `console` global lives at reference/mod-types/variables/console.md
  const consoleRel = 'reference/mod-types/variables/console.md';
  if (existsSync(join(DOCS_ROOT, consoleRel))) {
    items.push({ label: 'console (global)', slug: slugOf(consoleRel) });
  }

  return {
    label: 'bf6-portal-mod-types',
    collapsed: true,
    items,
  };
}

/** `bf6-portal-utils` package dropdown: one collapsed group per module. */
function utilsGroup() {
  const root = join(DOCS_ROOT, 'reference/utils');
  const items = [];

  if (existsSync(join(root, 'index.md'))) items.push({ label: 'Reference index', slug: 'reference/utils' });

  const modules = ls(root)
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, 'en'));

  for (const mod of modules) {
    const modDir = join(root, mod);
    const modRel = `reference/utils/${mod}`;
    const sub = [];

    if (existsSync(join(modDir, 'index.md'))) sub.push({ label: 'Overview', slug: slugOf(`${modRel}/index.md`) });

    const cats = findCategoryDirs(modDir, modRel).sort(
      (a, b) => categoryRank(a.name) - categoryRank(b.name),
    );

    // Merge same-named categories (a module can expose e.g. `classes` at two depths)
    // into one flat list per category, so the module has at most ONE level below it.
    const byName = new Map();
    for (const c of cats) {
      const links = symbolLinks(c.dir, c.docsRelDir).map((l) => ({
        ...l,
        label: `${l.label}`,
      }));
      byName.set(c.name, [...(byName.get(c.name) ?? []), ...links]);
    }

    const totalSymbols = [...byName.values()].reduce((n, l) => n + l.length, 0);

    if (totalSymbols <= 12) {
      // Small module: show symbols directly under the module, no extra level.
      for (const [name, links] of byName) {
        sub.push(...links.map((l) => ({ ...l, label: l.label })));
        void name;
      }
    } else {
      // Large module (events, ui, vectors, solid-ui): one collapsed group per category.
      for (const [name, links] of byName) {
        sub.push({
          label: CATEGORY_LABELS[name] ?? name,
          badge: { text: String(links.length), variant: 'default' },
          collapsed: true,
          items: links,
        });
      }
    }

    if (sub.length > 0) items.push({ label: mod, collapsed: true, items: sub });
  }

  return {
    label: 'bf6-portal-utils',
    collapsed: true,
    items,
  };
}

/**
 * The two package dropdowns, in order. The caller places them under the
 * "API Reference" heading.
 */
export function buildReferenceSidebar() {
  return [modTypesGroup(), utilsGroup()];
}
