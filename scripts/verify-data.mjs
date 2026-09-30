#!/usr/bin/env node
/**
 * `pnpm run docs:verify` — fails when the site's numbers cannot be trusted.
 *
 * Cross-checks the two independent counts in scripts/lib/sdk-source.mjs
 * (declarations parsed from the .d.ts vs. pages TypeDoc generated) and that
 * every registered colour palette actually has CSS. Exits 1 on drift so CI
 * can block a deploy that would publish wrong totals.
 *
 * Pass `--warn` to report without failing (used for local builds).
 */
import { readFile } from 'node:fs/promises';
import { readSourceSymbols, countReferencePages } from './lib/sdk-source.mjs';

const warnOnly = process.argv.includes('--warn');
const problems = [];

const source = await readSourceSymbols();
const pages = await countReferencePages();

/** [label, declared in .d.ts, generated pages] */
const pairs = [
  ['functions (unique names)', source.functions, pages.functions],
  ['enumerations', source.enums, pages.enums],
  ['type aliases', source.typeAliases, pages.typeAliases],
  ['event handler signatures', source.eventHandlerSignatures, pages.eventHandlerSignatures],
  ['utils modules', source.utilsModules, pages.utilsModules],
];

for (const [label, declared, generated] of pairs) {
  const ok = declared === generated;
  console.log(`[docs:verify] ${ok ? 'OK  ' : 'FAIL'} ${label}: declared ${declared} · generated ${generated}`);
  if (!ok) problems.push(`${label}: ${declared} declared vs ${generated} generated pages`);
}

// Every palette in src/data/themes.ts needs a CSS block in src/styles/theme/palettes/<id>.css
const themesSrc = await readFile('src/data/themes.ts', 'utf8');
const ids = [...themesSrc.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
for (const id of ids) {
  let css = '';
  try {
    css = await readFile(`src/styles/theme/palettes/${id}.css`, 'utf8');
  } catch {
    /* handled below */
  }
  const ok = css.includes(`data-palette='${id}'`);
  console.log(`[docs:verify] ${ok ? 'OK  ' : 'FAIL'} palette "${id}" has CSS`);
  if (!ok) problems.push(`palette "${id}" is registered in themes.ts but src/styles/theme/palettes/${id}.css is missing or has no [data-palette='${id}'] selector`);
}

if (problems.length > 0) {
  console.error(`\n[docs:verify] ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  if (!warnOnly) process.exit(1);
} else {
  console.log('[docs:verify] All data sources agree.');
}
