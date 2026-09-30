/**
 * Typed access to the generated SDK stats.
 *
 * `sdk-stats.json` is written by `scripts/generate-stats.mjs` (part of
 * `pnpm run docs:api`) from the installed packages. This module is the ONLY
 * place UI code should read SDK versions and totals from — never hardcode a
 * number in a component or page.
 */
import raw from './sdk-stats.json';

export interface SdkStats {
  /** Official four-part SDK version, e.g. `1.4.3.0`. */
  readonly sdkVersion: string;
  /** Whether it was read from index.d.ts's header or derived from the npm semver. */
  readonly sdkVersionSource: 'header' | 'derived';
  readonly modTypesVersion: string;
  readonly utilsVersion: string;
  /** Unique callable names (one docs page each). */
  readonly functions: number;
  /** Raw `export function` declarations, including overloads. */
  readonly functionOverloads: number;
  readonly enums: number;
  readonly enumsBreakdown: {
    readonly named: number;
    readonly perMapRuntimeSpawn: number;
    readonly mapCount: number;
  };
  readonly typeAliases: number;
  readonly eventHandlerSignatures: number;
  readonly utilsModules: number;
  readonly utilsModuleNames: readonly string[];
  readonly generatedAt: string;
}

/**
 * `raw`'s JSON-import type widens `sdkVersionSource` to `string` (JSON
 * modules can't carry a literal-union type), so it's narrowed here with a
 * runtime check instead of an `as` cast — a value the generator script
 * didn't actually write is a real problem worth catching, not silencing.
 */
function assertSdkStats(value: typeof raw): SdkStats {
  if (value.sdkVersionSource !== 'header' && value.sdkVersionSource !== 'derived') {
    throw new Error(
      `sdk-stats.json has an unexpected sdkVersionSource: ${JSON.stringify(value.sdkVersionSource)}. ` +
        'Re-run `pnpm run docs:stats` — this file should never be hand-edited.',
    );
  }
  return { ...value, sdkVersionSource: value.sdkVersionSource };
}

export const sdkStats: SdkStats = assertSdkStats(raw);

const numberFormat = new Intl.NumberFormat('en-US');
export const formatCount = (n: number): string => numberFormat.format(n);
