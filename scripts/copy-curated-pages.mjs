#!/usr/bin/env node
/**
 * Typedoc's `cleanOutputDir` (the default) wipes the whole output
 * directory on every run, so hand-written landing pages cannot live
 * inside `src/content/docs/reference/` — the next `pnpm run docs:api`
 * would delete them.
 *
 * The source of truth for curated pages is therefore `curated/<target>/…`,
 * mirroring the generated tree path-for-path. This script is the LAST
 * step of the `docs:api` chain (after TypeDoc, frontmatter injection, and
 * link rewriting), and simply copies each curated file over the generated
 * counterpart — curated content always wins, without ever hand-editing a
 * generated file. The copies land in the already-gitignored reference
 * tree; only `curated/` is tracked.
 *
 * Curated files must carry their own YAML frontmatter (title /
 * description / editUrl) — the frontmatter script never runs on them.
 * Re-running is a plain file copy, so it is idempotent.
 *
 * A missing `curated/<target>/` directory is not an error (utils has no
 * curated pages); see package.json for the chain.
 */
import { readdir, copyFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

const ALL_TARGETS = {
  'mod-types': { source: 'curated/mod-types', dest: 'src/content/docs/reference/mod-types' },
  utils: { source: 'curated/utils', dest: 'src/content/docs/reference/utils' },
};

const requestedTarget = process.argv[2];
const TARGETS = requestedTarget
  ? [requestedTarget].filter((t) => ALL_TARGETS[t])
  : Object.keys(ALL_TARGETS);

if (requestedTarget && TARGETS.length === 0) {
  console.error(`[docs:curate] Unknown target "${requestedTarget}". Expected "mod-types" or "utils".`);
  process.exit(1);
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

async function copyTree(source, dest) {
  const copied = [];
  for await (const file of walk(source)) {
    const target = join(dest, relative(source, file));
    await mkdir(dirname(target), { recursive: true });
    await copyFile(file, target);
    copied.push(relative(source, file).split('\\').join('/'));
  }
  return copied;
}

async function run() {
  for (const name of TARGETS) {
    const { source, dest } = ALL_TARGETS[name];
    try {
      await stat(source);
    } catch {
      console.log(`[docs:curate] No curated pages for "${name}" (no ${source}/) — skipping.`);
      continue;
    }
    await stat(dest); // generated tree must exist (TypeDoc ran first)
    const copied = await copyTree(source, dest);
    console.log(`[docs:curate] Copied ${copied.length} curated page(s) for "${name}":`);
    for (const rel of copied) console.log(`[docs:curate]   ${rel}`);
  }
}

run().catch((err) => {
  console.error('[docs:curate] Failed:', err);
  process.exitCode = 1;
});
