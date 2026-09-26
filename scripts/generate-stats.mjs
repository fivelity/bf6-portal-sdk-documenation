#!/usr/bin/env node
/**
 * Counts the real symbol totals in the installed `bf6-portal-mod-types`
 * package and writes them to `src/data/sdk-stats.json`. Conceptual guide
 * pages (`overview.md`, `events-and-enums.md`) and the sidebar badge read
 * from that file instead of hardcoding numbers that silently rot on every
 * SDK version bump.
 *
 * Counts, by source file:
 *   - functions        : `export function` lines in index.d.ts
 *   - enums            : `export enum` lines in enums.d.ts, PLUS one count
 *                         per `export enum` in each runtime-spawn-enums/*.d.ts
 *                         (one `RuntimeSpawn_<Map>` enum per official map)
 *   - typeAliases      : `export type` lines in types.d.ts
 *   - eventHandlerSigs : `export function` / `function` lines in
 *                         event-handler-signatures.d.ts
 *
 * These are line-pattern counts against the package's own ambient
 * declaration style (one declaration per line, `export function Name(` /
 * `export enum Name {` / `export type Name =`), not a full TS AST parse —
 * matching how the package has been authored across versions. If a future
 * SDK release reformats declarations (e.g. multi-line signatures before the
 * opening paren), re-check this script's regexes against the new file
 * rather than trusting stale counts.
 *
 * Run via `pnpm run docs:stats`, and automatically as the first step of
 * `pnpm run docs:api` (see package.json) so the numbers are always fresh
 * before a build.
 */
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const PKG_ROOT = 'node_modules/bf6-portal-mod-types';
const OUT_PATH = 'src/data/sdk-stats.json';

function countMatches(text, regex) {
  return (text.match(regex) ?? []).length;
}

async function run() {
  let indexDts;
  let enumsDts;
  let typesDts;
  let ehsDts;
  let pkgJson;
  try {
    [indexDts, enumsDts, typesDts, ehsDts, pkgJson] = await Promise.all([
      readFile(join(PKG_ROOT, 'index.d.ts'), 'utf8'),
      readFile(join(PKG_ROOT, 'enums.d.ts'), 'utf8'),
      readFile(join(PKG_ROOT, 'types.d.ts'), 'utf8'),
      readFile(join(PKG_ROOT, 'event-handler-signatures.d.ts'), 'utf8'),
      readFile(join(PKG_ROOT, 'package.json'), 'utf8'),
    ]);
  } catch (err) {
    console.error(
      '[docs:stats] Could not read bf6-portal-mod-types from node_modules — run `pnpm install` first.',
    );
    console.error(err.message);
    process.exitCode = 1;
    return;
  }

  const functions = countMatches(indexDts, /^\s*export function \w+/gm);
  const namedEnums = countMatches(enumsDts, /^\s*export enum \w+/gm);
  const typeAliases = countMatches(typesDts, /^\s*export type \w+/gm);
  const eventHandlerSignatures = countMatches(ehsDts, /^\s*(export )?function \w+/gm);

  let runtimeSpawnEnums = 0;
  let runtimeSpawnMapCount = 0;
  const rsDir = join(PKG_ROOT, 'runtime-spawn-enums');
  try {
    const files = (await readdir(rsDir)).filter((f) => f.endsWith('.d.ts'));
    runtimeSpawnMapCount = files.length;
    for (const file of files) {
      const content = await readFile(join(rsDir, file), 'utf8');
      runtimeSpawnEnums += countMatches(content, /^\s*export enum \w+/gm);
    }
  } catch {
    // No runtime-spawn-enums directory in this version — leave at 0.
  }

  const enums = namedEnums + runtimeSpawnEnums;
  const version = JSON.parse(pkgJson).version ?? 'unknown';

  const stats = {
    modTypesVersion: version,
    functions,
    enums,
    enumsBreakdown: { named: namedEnums, perMapRuntimeSpawn: runtimeSpawnEnums, mapCount: runtimeSpawnMapCount },
    typeAliases,
    eventHandlerSignatures,
    generatedAt: new Date().toISOString(),
  };

  await mkdir('src/data', { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(stats, null, 2) + '\n', 'utf8');

  console.log(
    `[docs:stats] bf6-portal-mod-types@${version}: ${functions} functions, ${enums} enums ` +
      `(${namedEnums} named + ${runtimeSpawnEnums} per-map across ${runtimeSpawnMapCount} maps), ` +
      `${typeAliases} type aliases, ${eventHandlerSignatures} event handler signatures.`,
  );
  console.log(`[docs:stats] Wrote ${OUT_PATH}`);
}

run();
