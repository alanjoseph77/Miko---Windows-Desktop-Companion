import { spawn, ChildProcess } from 'child_process';
import * as esbuild from 'esbuild';
import * as path from 'path';

async function buildElectron(): Promise<void> {
  await esbuild.build({
    entryPoints: [
      path.resolve(__dirname, 'main.ts'),
      path.resolve(__dirname, 'preload.ts'),
    ],
    outdir: path.resolve(__dirname, '../dist-electron'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    external: ['electron'],
    sourcemap: 'inline',
  });
  console.log('[DevRunner] Electron bundle compiled.');
}

async function start(): Promise<void> {
  await buildElectron();

  // Find local electron binary
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const electronPath: string = require('electron');

  const electronProcess: ChildProcess = spawn(
    electronPath,
    [path.resolve(__dirname, '../dist-electron/main.js')],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    }
  );

  electronProcess.on('close', (code) => {
    console.log(`[DevRunner] Electron process exited with code ${code}`);
    process.exit(code ?? 0);
  });
}

start().catch((err) => {
  console.error('[DevRunner] Failed to start electron:', err);
  process.exit(1);
});
