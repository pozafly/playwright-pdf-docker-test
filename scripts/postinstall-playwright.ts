import { execSync } from 'node:child_process';

if (process.env.SKIP_PLAYWRIGHT_INSTALL) {
  console.log('▶ Skip Playwright install (CI/Docker)');
  process.exit(0);
}

console.log('▶ Installing Playwright Chromium...');
execSync('npx playwright install chromium', { stdio: 'inherit' });
