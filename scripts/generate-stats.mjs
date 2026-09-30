#!/usr/bin/env node
/**
 * Writes `src/data/sdk-stats.json` — the ONLY place site-wide SDK numbers
 * and versions come from. Read by src/data/sdk-info.ts (typed), which feeds
 * the header badges, footer, overview pages and the home-page stat strip.
 *
 * Runs as the LAST step of `docs:api`, after TypeDoc, so the file also
 * records what was actually generated. Run `docs:verify` (or CI) to fail if
 * the source-declaration counts and the generated pages disagree.
 *
 * Nothing in here is hand-maintained: bump the SDK packages, re-run
 * `pnpm run docs:api`, and every number on the site follows.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { readSourceSymbols, countReferencePages } from './lib/sdk-source.mjs';

const OUT_PATH = 'src/data/sdk-stats.json';

async function run() {
  let source;
  try {
    source = await readSourceSymbols();
  } catch (err) {
    console.error('[docs:stats] Could not read the SDK packages from node_modules — run `pnpm install` first.');
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
    return;
  }
  const generated = await countReferencePages();

  const stats = {
    sdkVersion: source.sdkVersion,
    sdkVersionSource: source.sdkVersionSource,
    modTypesVersion: source.modTypesVersion,
    utilsVersion: source.utilsVersion,
    functions: source.functions,
    functionOverloads: source.functionOverloads,
    enums: source.enums,
    enumsBreakdown: source.enumsBreakdown,
    typeAliases: source.typeAliases,
    eventHandlerSignatures: source.eventHandlerSignatures,
    utilsModules: source.utilsModules,
    utilsModuleNames: source.utilsModuleNames,
    generatedPages: generated,
    generatedAt: new Date().toISOString(),
  };

  await mkdir('src/data', { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(stats, null, 2) + '\n', 'utf8');

  console.log(
    `[docs:stats] SDK ${stats.sdkVersion} (${stats.sdkVersionSource}) · mod-types@${stats.modTypesVersion} · utils@${stats.utilsVersion}`,
  );
  console.log(
    `[docs:stats] ${stats.functions} functions (${stats.functionOverloads} overload declarations), ${stats.enums} enums, ` +
      `${stats.typeAliases} type aliases, ${stats.eventHandlerSignatures} handler signatures, ${stats.utilsModules} utils modules.`,
  );
  console.log(`[docs:stats] Wrote ${OUT_PATH}`);
}

run();
