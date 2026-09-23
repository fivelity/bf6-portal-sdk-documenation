#!/usr/bin/env node
/**
 * TypeDoc + typedoc-plugin-markdown output has no YAML frontmatter, but
 * Starlight's docs collection schema requires a `title` string on every
 * page. This script walks the generated reference trees and prepends
 * minimal frontmatter, derived from each file's own first `#` heading, so
 * the site builds without hand-editing any generated file.
 *
 * Runs automatically after `docs:api:mod-types` / `docs:api:utils` via the
 * `docs:api` script — see package.json.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ALL_TARGETS = {
  'mod-types': 'src/content/docs/reference/mod-types',
  utils: 'src/content/docs/reference/utils',
};

const requestedTarget = process.argv[2];
const TARGETS = requestedTarget
  ? [ALL_TARGETS[requestedTarget]].filter(Boolean)
  : Object.values(ALL_TARGETS);

if (requestedTarget && TARGETS.length === 0) {
  console.error(`[docs:frontmatter] Unknown target "${requestedTarget}". Expected "mod-types" or "utils".`);
  process.exit(1);
}

/** Strip TypeDoc heading noise ("Function: ", "Class: ", parens, backticks). */
function titleFromHeading(heading) {
  return heading
    .replace(/^(Namespace|Function|Class|Interface|Enumeration|Variable|Type Alias):\s*/, '')
    .replace(/`/g, '')
    .replace(/\(\)$/, '')
    .trim();
}

function escapeYamlString(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
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

async function processFile(path, packageLabel) {
  const raw = await readFile(path, 'utf8');

  if (raw.startsWith('---\n')) {
    // Already has frontmatter (e.g. a hand-curated index.md) — leave it alone.
    return;
  }

  const headingMatch = raw.match(/^#{1,6}\s+(.+)$/m);
  const rawHeading = headingMatch ? headingMatch[1] : path.split('/').pop().replace(/\.md$/, '');
  const title = titleFromHeading(rawHeading) || rawHeading;

  const description = `${packageLabel} API reference: ${title}.`;

  const frontmatter = [
    '---',
    `title: "${escapeYamlString(title)}"`,
    `description: "${escapeYamlString(description)}"`,
    'editUrl: false',
    '---',
    '',
    raw,
  ].join('\n');

  await writeFile(path, frontmatter, 'utf8');
}

async function run() {
  let count = 0;
  for (const target of TARGETS) {
    try {
      await stat(target);
    } catch {
      continue;
    }
    const packageLabel = target.endsWith('mod-types')
      ? 'bf6-portal-mod-types'
      : 'bf6-portal-utils';
    for await (const file of walk(target)) {
      await processFile(file, packageLabel);
      count++;
    }
  }
  console.log(`[docs:frontmatter] Added frontmatter to ${count} generated reference page(s).`);
}

run().catch((err) => {
  console.error('[docs:frontmatter] Failed:', err);
  process.exitCode = 1;
});
