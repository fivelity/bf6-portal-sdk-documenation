/**
 * Hand-maintained project metadata — the ONLY hand-edited data file.
 *
 * Everything else the UI shows (SDK version, symbol totals, elapsed time)
 * is derived: see sdk-info.ts and build-info.ts. What lives here can't be
 * discovered from the repo: which tool and model were used.
 */
export const provenance = {
  tool: 'Claude (Free)',
  model: 'Sonnet 5 · Low',
} as const;

/**
 * Elapsed time is measured from the repository's first commit. Set this if
 * meaningful work predates the repo (ISO 8601) — it then takes precedence.
 */
export const startedAtOverride: string | undefined = undefined;

/**
 * Used only when git history is unavailable at build time (e.g. a ZIP
 * download with no `.git`, or a shallow CI checkout). Keep it equal to the
 * real first-commit date.
 */
export const startedAtFallback = '2026-09-21T02:37:55-07:00';
