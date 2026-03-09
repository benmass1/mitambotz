import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bridge ya kuendesha server.ts kwa kutumia tsx kwenye Namecheap
console.log("Starting Dr Mitambo TZ Server...");

// Hakikisha tsx ipo
const tsxPath = path.resolve(__dirname, 'node_modules/.bin/tsx');

const start = () => {
  const child = spawn(tsxPath, ['server.ts'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  child.on('error', (err) => {
    console.error('Failed to start child process:', err);
  });

  child.on('exit', (code) => {
    console.log(`Server process exited with code ${code}. Restarting...`);
    setTimeout(start, 5000);
  });
};

start();
