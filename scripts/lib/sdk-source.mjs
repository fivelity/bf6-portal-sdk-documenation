/**
 * Single source of truth for everything the site says about the SDK.
 *
 * Every number and version string shown anywhere on the site (header badges,
 * footer, overview pages, stat strip) is derived here from the INSTALLED
 * packages in node_modules — never typed by hand. Two independent ways of
 * counting exist on purpose so `docs:verify` can cross-check them:
 *
 *   1. readSourceSymbols()   — parses the .d.ts declarations directly
 *   2. countReferencePages() — counts the pages TypeDoc actually generated
 *
 * If those ever disagree, the docs have drifted from the SDK.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const MOD_TYPES_ROOT = 'node_modules/bf6-portal-mod-types';
export const UTILS_ROOT = 'node_modules/bf6-portal-utils';
export const REFERENCE_ROOT = 'src/content/docs/reference';

/** Category folder names TypeDoc writes, mapped to the stat they verify. */
const MOD_NAMESPACE_DIR = 'bf6-portal-mod-types/namespaces/mod';

const read = (path) => readFile(path, 'utf8');
const matches = (text, re) => text.match(re) ?? [];

async function readJson(path) {
  return JSON.parse(await read(path));
}

/**
 * The official BF6 Portal SDK uses a four-part version (e.g. 1.4.3.0).
 * index.d.ts states it in its header comment — the authoritative source.
 * If that header ever disappears, fall back to the mapping documented in the
 * mod-types README: package `b.c.x` <-> SDK `1.b.c.0`.
 *
 * @returns {{ sdkVersion: string, sdkVersionSource: 'header' | 'derived' }}
 */
export function parseSdkVersion(indexDts, packageVersion) {
  const header = indexDts.match(/^\s*\/\/\s*Version:\s*(\d+(?:\.\d+){2,3})\s*$/m);
  if (header?.[1]) return { sdkVersion: header[1], sdkVersionSource: 'header' };

  const [major = '0', minor = '0'] = packageVersion.split('.');
  return { sdkVersion: `1.${major}.${minor}.0`, sdkVersionSource: 'derived' };
}

/** Counts declarations by parsing the raw .d.ts files. */
export async function readSourceSymbols() {
  const [indexDts, enumsDts, typesDts, handlersDts, pkg, utilsPkg] = await Promise.all([
    read(join(MOD_TYPES_ROOT, 'index.d.ts')),
    read(join(MOD_TYPES_ROOT, 'enums.d.ts')),
    read(join(MOD_TYPES_ROOT, 'types.d.ts')),
    read(join(MOD_TYPES_ROOT, 'event-handler-signatures.d.ts')),
    readJson(join(MOD_TYPES_ROOT, 'package.json')),
    readJson(join(UTILS_ROOT, 'package.json')),
  ]);

  // `export function Name` — the SDK overloads many functions, so the raw
  // declaration count (570) is larger than the number of unique callable
  // names (431). The docs publish one page per unique name.
  const fnNames = matches(indexDts, /^\s*export function (\w+)/gm).map((m) =>
    m.replace(/^\s*export function /, ''),
  );

  const namedEnums = matches(enumsDts, /^\s*export enum \w+/gm).length;

  let perMapEnums = 0;
  let mapCount = 0;
  const spawnDir = join(MOD_TYPES_ROOT, 'runtime-spawn-enums');
  if (existsSync(spawnDir)) {
    const files = (await readdir(spawnDir)).filter((f) => f.endsWith('.d.ts'));
    mapCount = files.length;
    for (const f of files) {
      perMapEnums += matches(await read(join(spawnDir, f)), /^\s*export enum \w+/gm).length;
    }
  }

  const utilsModules = (await readdir(UTILS_ROOT, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && existsSync(join(UTILS_ROOT, e.name, 'index.d.ts')))
    .map((e) => e.name)
    .sort();

  return {
    ...parseSdkVersion(indexDts, pkg.version),
    modTypesVersion: pkg.version,
    utilsVersion: utilsPkg.version,
    functions: new Set(fnNames).size,
    functionOverloads: fnNames.length,
    enums: namedEnums + perMapEnums,
    enumsBreakdown: { named: namedEnums, perMapRuntimeSpawn: perMapEnums, mapCount },
    typeAliases: matches(typesDts, /^\s*export type \w+/gm).length,
    eventHandlerSignatures: matches(handlersDts, /^\s*(?:export )?function \w+/gm).length,
    utilsModules: utilsModules.length,
    utilsModuleNames: utilsModules,
  };
}

/** Number of symbol pages (excluding index.md) directly inside `dir`. */
async function pagesIn(dir) {
  if (!existsSync(dir)) return 0;
  return (await readdir(dir, { withFileTypes: true })).filter(
    (e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md',
  ).length;
}

/** Counts the pages TypeDoc generated — what the sidebar badges show. */
export async function countReferencePages() {
  const mod = join(REFERENCE_ROOT, 'mod-types', MOD_NAMESPACE_DIR);
  const utilsRoot = join(REFERENCE_ROOT, 'utils');
  const utilsDirs = existsSync(utilsRoot)
    ? (await readdir(utilsRoot, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];

  return {
    functions: await pagesIn(join(mod, 'functions')),
    enums: await pagesIn(join(mod, 'enumerations')),
    typeAliases: await pagesIn(join(mod, 'type-aliases')),
    eventHandlerSignatures: await pagesIn(join(mod, 'namespaces/EventHandlerSignatures/functions')),
    utilsModules: utilsDirs.length,
  };
}

export async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
