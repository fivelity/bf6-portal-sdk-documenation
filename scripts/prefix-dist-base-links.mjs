#!/usr/bin/env node
/**
 * Astro/Starlight only applies `base` to navigation, sidebar, and config
 * links — root-relative links written in markdown BODY content pass
 * through untouched. On a GitHub project page
 * (`https://<user>.github.io/<repo>/`), a body link like
 * `href="/mod-types/events-and-enums/"` resolves against the site ROOT
 * and 404s.
 *
 * This script runs as the last step of `pnpm build`, after `astro build`,
 * and prefixes every root-relative `href`/`src` attribute in the HTML
 * files under `dist/` with the site base. The base is read from
 * astro.config.mjs's `BASE_PATH` constant (the single source of truth) by
 * parsing the file's source text rather than importing it — see
 * `siteBase()` below for why — so changing `BASE_PATH` there is all that
 * is ever needed; content keeps using plain root-relative links.
 *
 * Skips protocol-relative (`//…`), already-prefixed, and external
 * (`https:`, `mailto:`, `data:`) values; idempotent, so re-running over a
 * prefixed dist is a no-op. Note: `astro dev` serves unprefixed body
 * links — verify link behavior with `pnpm build && pnpm preview`.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
/** A root-relative href/src attribute (single or double quoted). */
const ATTR_RE = /(\s(?:href|src)=)(["'])(\/(?![/])[^"']*)\2/g;

/**
 * Reads `BASE_PATH` out of astro.config.mjs's source text rather than
 * dynamically importing the module. Importing would also execute every
 * plugin the config wires up (e.g. `starlight-llms-txt`, whose package
 * ships a `.ts` entry point) — fine under Astro's own Vite-powered loader,
 * but Node's native ESM loader refuses to strip types for anything under
 * node_modules, so a plain `import()` from a standalone script fails with
 * ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING. astro.config.mjs documents
 * `BASE_PATH` as its single source of truth for the site base, so this
 * regex read honors that contract without re-running the whole config.
 */
async function siteBase() {
  const configSource = await readFile('astro.config.mjs', 'utf8');
  const match = configSource.match(/const\s+BASE_PATH\s*=\s*(['"])([^'"]*)\1/);
  if (!match) {
    throw new Error(
      '[docs:base] Could not find `const BASE_PATH = \'...\'` in astro.config.mjs — update the regex if that line changed shape.',
    );
  }
  const base = match[2];
  return base === '/' ? '' : base.replace(/\/$/, '');
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield full;
    }
  }
}

async function run() {
  try {
    await stat(DIST);
  } catch {
    console.error('[docs:base] No dist/ found — run `astro build` first.');
    process.exit(1);
  }

  const base = await siteBase();
  if (base === '') {
    console.log('[docs:base] No site base configured — nothing to prefix.');
    return;
  }

  let html = 0;
  let replaced = 0;
  for await (const file of walk(DIST)) {
    const raw = await readFile(file, 'utf8');
    const next = raw.replace(ATTR_RE, (match, attr, quote, value) => {
      if (value === base || value.startsWith(base + '/')) return match;
      replaced += 1;
      return `${attr}${quote}${base}${value}${quote}`;
    });
    html += 1;
    if (next !== raw) await writeFile(file, next, 'utf8');
  }

  console.log(`[docs:base] Prefixed ${replaced} root-relative link(s) with "${base}" across ${html} HTML file(s).`);
}

run().catch((err) => {
  console.error('[docs:base] Failed:', err);
  process.exitCode = 1;
});
