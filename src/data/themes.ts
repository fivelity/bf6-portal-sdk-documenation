/**
 * Colour-palette registry — the single list the UI and CI read from.
 *
 * Palettes are a second axis, independent of Starlight's light/dark/auto
 * mode: every palette defines BOTH a dark and a light variant.
 *
 * To add one:
 *   1. add an entry below (id must be lowercase-kebab),
 *   2. copy src/styles/theme/palettes/hud.css to <id>.css and edit the values,
 *   3. add `@import './theme/palettes/<id>.css';` to src/styles/theme.css.
 * `pnpm run docs:verify` fails if step 2 is skipped.
 */
export interface PaletteDef {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export const PALETTES = [
  { id: 'hud', label: 'Frontline HUD', description: 'Gunmetal canvas, cyan readouts, angular corner cuts.' },
  { id: 'manifest', label: 'Wardogs Manifest', description: 'Warm paper tones, brass accents, square plates.' },
] as const satisfies readonly PaletteDef[];

export type PaletteId = (typeof PALETTES)[number]['id'];

export const DEFAULT_PALETTE: PaletteId = 'hud';
export const PALETTE_STORAGE_KEY = 'bf6-palette';
export const PALETTE_ATTRIBUTE = 'data-palette';

export function isPaletteId(value: unknown): value is PaletteId {
  return PALETTES.some((p) => p.id === value);
}
