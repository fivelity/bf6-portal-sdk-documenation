import { spawn } from 'child_process';
import path from 'path';

/**
 * Generates markdown API documentation from .d.ts files using TypeDoc CLI.
 * Outputs to apps/docs/src/.vitepress/api/ for use in VitePress.
 */
function main() {
  const outDir = path.resolve('apps/docs/src/.vitepress/api');
  
  const args = [
    'node_modules/bf6-portal-mod-types/index.d.ts',
    'node_modules/bf6-portal-utils/vectors/index.d.ts',
    'node_modules/bf6-portal-utils/ui/index.d.ts',
    'node_modules/bf6-portal-utils/timers/index.d.ts',
    'node_modules/bf6-portal-utils/sounds/index.d.ts',
    'node_modules/bf6-portal-utils/solid-ui/index.d.ts',
    'node_modules/bf6-portal-utils/scavenger-drop/index.d.ts',
    'node_modules/bf6-portal-utils/raycast/index.d.ts',
    'node_modules/bf6-portal-utils/portal-gadget/index.d.ts',
    'node_modules/bf6-portal-utils/player-undeploy-fixer/index.d.ts',
    'node_modules/bf6-portal-utils/performance-stats/index.d.ts',
    '--plugin', 'typedoc-plugin-markdown',
    '--out', outDir,
    '--excludePrivate',
    '--excludeProtected',
    '--excludeExternals',
    '--readme', 'none',
    '--categorizeByGroup',
    '--name', 'bf6-portal-sdk',
    '--includeVersion',
    '--tsconfig', 'tsconfig.json',
  ];

  const cli = spawn('npx', ['typedoc', ...args], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  });

  cli.on('close', (code) => {
    if (code === 0) {
      console.log(`TypeDoc markdown generation complete. Output: ${outDir}`);
    } else {
      console.error(`TypeDoc generation failed with exit code ${code}`);
      process.exit(code ?? 1);
    }
  });
}

main();
