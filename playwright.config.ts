import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3055);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests',
  testMatch: ['phase-1/**/*.spec.ts', 'phase-2/**/*.spec.ts', 'phase-3/**/*.spec.ts'],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Only auto-start the dev server when PLAYWRIGHT_BASE_URL isn't set —
  // CI can point at a deployed URL and skip the boot.
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: `PORT=${PORT} NEXT_TELEMETRY_DISABLED=1 npx next dev -p ${PORT}`,
          url: BASE_URL + '/fa',
          reuseExistingServer: true,
          timeout: 120_000,
          stdout: 'ignore',
          stderr: 'pipe',
        },
      }),
});
