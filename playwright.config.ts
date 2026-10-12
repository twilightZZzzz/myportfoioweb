import { defineConfig, devices } from '@playwright/test';

const PORT = 4330;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  // channel: 'chromium' — полноценный Chromium в новом headless-режиме
  // функциональные тесты — без анимаций; анимации проверяются в tests/e2e/motion.spec.ts
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure', channel: 'chromium', reducedMotion: 'reduce' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // Черновики включены, чтобы проверить шаблон кейса на образце
  webServer: {
    command: `E2E=1 SHOW_DRAFTS=1 npx astro dev --port ${PORT} --ignore-lock`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
