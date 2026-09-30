/**
 * Build provenance shown by the header badges. Computed at build time.
 *
 * Elapsed time = (build time) − (first commit). Because the site is static,
 * it reflects the moment of the last deploy, not the moment you view it.
 */
import { execFileSync } from 'node:child_process';
import { provenance, startedAtFallback, startedAtOverride } from './project.config';

export interface BuildInfo {
  readonly tool: string;
  readonly model: string;
  readonly startedAt: Date;
  readonly builtAt: Date;
  /** Compact label, e.g. `13d 5h`. */
  readonly elapsedLabel: string;
  /** Full sentence for a tooltip. */
  readonly elapsedTitle: string;
}

function git(args: readonly string[]): string | undefined {
  try {
    return execFileSync('git', [...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
}

/** First-commit date, or undefined when history is missing or truncated. */
function firstCommitDate(): Date | undefined {
  if (git(['rev-parse', '--is-shallow-repository']) !== 'false') return undefined;
  const first = git(['log', '--reverse', '--format=%aI'])?.split('\n')[0];
  if (!first) return undefined;
  const date = new Date(first);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function resolveStart(): Date {
  if (startedAtOverride) return new Date(startedAtOverride);
  return firstCommitDate() ?? new Date(startedAtFallback);
}

export function formatElapsed(ms: number): string {
  const totalHours = Math.max(0, Math.floor(ms / 3_600_000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

const builtAt = new Date();
const startedAt = resolveStart();
const elapsedLabel = formatElapsed(builtAt.getTime() - startedAt.getTime());

export const buildInfo: BuildInfo = {
  tool: provenance.tool,
  model: provenance.model,
  startedAt,
  builtAt,
  elapsedLabel,
  elapsedTitle: `Development time elapsed: ${elapsedLabel} since ${startedAt.toISOString().slice(0, 10)}, as of this build`,
};
