#!/usr/bin/env node
/**
 * TypeDoc writes cross-links the way they resolve from the markdown
 * SOURCE file (`../type-aliases/Vector.md`, `../../../../index.md`).
 * Astro serves every reference file as a directory route one level deeper
 * than the source file sits, with lowercased, extensionless paths — so in
 * the browser every one of those hrefs 404s (wrong depth, `.md`
 * extension, AND case).
 *
 * This script walks each generated tree and rewrites every relative `.md`
 * link to a page-relative URL computed against the FINAL page path:
 *
 *   source : .../mod/functions/AllPlayers.md   (page: .../functions/allplayers/)
 *   link   : ../type-aliases/Vector.md
 *   result : ../../type-aliases/vector/
 *
 * Links stay page-relative (never base-prefixed) so they keep working if
 * the site `base` changes; `#anchors` are preserved; fenced code blocks
 * are skipped. Idempotent: a rewritten link no longer ends in `.md`, so
 * re-running over already-converted files is a no-op.
 *
 * Runs automatically after frontmatter injection via the `docs:api` chain
 * — see package.json. Never hand-edit files under
 * src/content/docs/reference/; run `pnpm run docs:api` instead.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, posix, relative, resolve, sep } from 'node:path';

const ALL_TARGETS = {
  'mod-types': 'src/content/docs/reference/mod-types',
  utils: 'src/content/docs/reference/utils',
};

const requestedTarget = process.argv[2];
const TARGETS = requestedTarget
  ? [ALL_TARGETS[requestedTarget]].filter(Boolean)
  : Object.values(ALL_TARGETS);

if (requestedTarget && TARGETS.length === 0) {
  console.error(`[docs:links] Unknown target "${requestedTarget}". Expected "mod-types" or "utils".`);
  process.exit(1);
}

const DOCS_ROOT = resolve('src/content/docs');
/** A markdown link target ending in `.md`, optionally followed by an anchor. */
const LINK_RE = /\]\(([^()\s]+?\.md)(#[^)\s]*)?\)/g;
const FENCE_RE = /^\s*(```|~~~)/;

/**
 * The route directory a source markdown file is served from, e.g.
 * `reference/mod-types/.../type-aliases/vector/` — lowercased, `.md`
 * stripped, `/index` stripped (Astro builds directory routes).
 * Returns null for files outside the docs root.
 */
function routeDirOf(absFile) {
  let rel = relative(DOCS_ROOT, absFile);
  if (rel.startsWith('..')) return null;
  rel = rel.split(sep).join('/');
  let route = rel.replace(/\.md$/i, '');
  if (route.endsWith('/index')) route = route.slice(0, -'/index'.length);
  else if (route === 'index') route = '';
  return route.split('/').map((seg) => seg.toLowerCase()).join('/') + '/';
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield full;
    }
  }
}

async function processFile(file) {
  const pageDir = routeDirOf(file);
  const lines = (await readFile(file, 'utf8')).split('\n');
  const missing = new Set();
  let rewritten = 0;
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    if (FENCE_RE.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    lines[i] = lines[i].replace(LINK_RE, (match, target, hash) => {
      // External (`https:`, `mailto:`) or root-absolute targets aren't ours.
      if (target.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(target)) return match;
      const absTarget = resolve(dirname(file), target);
      const targetDir = existsSync(absTarget) ? routeDirOf(absTarget) : null;
      if (!pageDir || !targetDir) {
        missing.add(target);
        return match;
      }
      const rel = posix.relative(pageDir, targetDir);
      rewritten += 1;
      return `](${rel === '' ? './' : rel + '/'}${hash ?? ''})`;
    });
  }

  if (rewritten > 0) await writeFile(file, lines.join('\n'), 'utf8');
  return { rewritten, missing };
}

async function run() {
  let rewritten = 0;
  let touched = 0;
  const missing = new Set();

  for (const target of TARGETS) {
    try {
      await stat(target);
    } catch {
      continue;
    }
    for await (const file of walk(target)) {
      const result = await processFile(file);
      if (result.rewritten > 0) {
        rewritten += result.rewritten;
        touched += 1;
      }
      for (const m of result.missing) missing.add(m);
    }
  }

  console.log(`[docs:links] Rewrote ${rewritten} cross-link(s) to page URLs across ${touched} file(s).`);
  if (missing.size > 0) {
    console.warn(`[docs:links] WARNING: ${missing.size} link target(s) not found — left untouched:`);
    for (const m of missing) console.warn(`[docs:links]   ${m}`);
  }
}

run().catch((err) => {
  console.error('[docs:links] Failed:', err);
  process.exitCode = 1;
});
