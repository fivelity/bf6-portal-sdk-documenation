/**
 * Real numbers only. This file is hand-maintained, not generated — update
 * it when these figures actually change. The header badge strip reads
 * from here rather than hardcoding copy, so a stale number is a one-line
 * fix instead of a hunt through a component.
 */
export interface BuildStats {
  tool: string;
  model: string;
  /** Approximate token spend, already formatted for display, e.g. "2.4M". */
  tokensApprox: string;
  /** Elapsed project day count. */
  day: number;
  /** Elapsed hour count within that day, or total hours — your call. */
  hour: number;
}

export const buildStats: BuildStats = {
  tool: 'Claude',
  model: 'Sonnet 4.5',
  tokensApprox: '—', // fill in with a real figure before shipping
  day: 1,
  hour: 0,
};
