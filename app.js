import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hii ni bridge ya kuendesha server.ts kwa kutumia tsx kwenye Namecheap
console.log("Starting Dr Mitambo TZ Server...");

const child = spawn('npx', ['tsx', 'server.ts'], {
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
  console.log(`Server process exited with code ${code}`);
});
