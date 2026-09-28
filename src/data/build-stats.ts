/**
 * Build provenance shown in the header ribbons (BuildBadges.astro).
 * Update by hand when the tool, model, or elapsed time changes.
 */
export interface BuildStats {
  readonly tool: string;
  readonly model: string;
  readonly day: number;
  readonly hour: number;
}

export const buildStats: BuildStats = {
  tool: 'Claude Desktop (Free)',
  model: 'Sonnet 5 · Low Reasoning',
  day: 13,
  hour: 5,
};
