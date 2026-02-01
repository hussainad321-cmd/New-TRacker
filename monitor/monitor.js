import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Simple log rotation for monitor logs
const LOG_DIR = path.resolve(process.cwd(), 'logs');
const MONITOR_OUT = 'monitor.out.log';
const MONITOR_ERR = 'monitor.err.log';
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BACKUPS = 5;

function ensureLogDir() {
  try { if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (e) {}
}

function rotate(fileName) {
  try {
    const filePath = path.join(LOG_DIR, fileName);
    if (!fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    if (stat.size < MAX_LOG_SIZE) return;
    for (let i = MAX_BACKUPS - 1; i >= 0; i--) {
      const src = i === 0 ? filePath : `${filePath}.${i}`;
      const dest = `${filePath}.${i + 1}`;
      if (fs.existsSync(src)) {
        try { fs.renameSync(src, dest); } catch (e) {}
      }
    }
  } catch (e) {}
}

function writeMonitorLog(fileName, data) {
  try {
    ensureLogDir();
    rotate(fileName);
    fs.appendFileSync(path.join(LOG_DIR, fileName), data);
  } catch (e) {}
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_RESTARTS = 10;
const RESTART_DELAY_MS = 2000;

let restarts = 0;

function startChild() {
  console.log('[monitor] Starting child process: npm run dev');

  const isWin = process.platform === 'win32';
  const command = isWin ? 'cmd' : 'npm';
  const args = isWin ? ['/c', 'npm run dev'] : ['run', 'dev'];

  const child = spawn(command, args, {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  child.on('exit', (code, signal) => {
    console.error(`[monitor] child exited with code=${code} signal=${signal}`);
    if (signal === 'SIGINT' || signal === 'SIGTERM') {
      console.log('[monitor] Received termination signal — exiting monitor.');
      process.exit(0);
    }

    restarts += 1;
    if (restarts > MAX_RESTARTS) {
      console.error(`[monitor] Exceeded max restarts (${MAX_RESTARTS}), not restarting.`);
      process.exit(1);
    }

    console.log(`[monitor] Restarting child in ${RESTART_DELAY_MS}ms (attempt ${restarts}/${MAX_RESTARTS})`);
    setTimeout(startChild, RESTART_DELAY_MS);
  });

  child.on('error', (err) => {
    console.error('[monitor] child process error', err);
  });

  // Pipe child's stdout/stderr into rotated files and also to parent's stdout/stderr
  if (child.stdout) {
    child.stdout.on('data', (chunk) => {
      try { process.stdout.write(chunk); } catch (e) {}
      writeMonitorLog(MONITOR_OUT, chunk);
    });
  }
  if (child.stderr) {
    child.stderr.on('data', (chunk) => {
      try { process.stderr.write(chunk); } catch (e) {}
      writeMonitorLog(MONITOR_ERR, chunk);
    });
  }
}

// Ensure monitor exits cleanly on signals
process.on('SIGINT', () => {
  console.log('[monitor] SIGINT received, exiting monitor.');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('[monitor] SIGTERM received, exiting monitor.');
  process.exit(0);
});

startChild();
