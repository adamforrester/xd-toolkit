import { execSync, exec } from 'node:child_process';

/**
 * Run a command synchronously and return stdout.
 * Throws on non-zero exit.
 */
export function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe', ...opts }).trim();
}

/**
 * Run a command synchronously, returning { ok, stdout, stderr }.
 * Never throws.
 */
export function tryRun(cmd) {
  try {
    const stdout = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim();
    return { ok: true, stdout, stderr: '' };
  } catch (err) {
    return {
      ok: false,
      stdout: (err.stdout || '').trim(),
      stderr: (err.stderr || '').trim(),
    };
  }
}

/**
 * Run a command asynchronously, returning a promise of { ok, stdout, stderr }.
 */
export function runAsync(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { encoding: 'utf-8' }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: (stdout || '').trim(),
        stderr: (stderr || '').trim(),
      });
    });
  });
}
