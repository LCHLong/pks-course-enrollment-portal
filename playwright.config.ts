import { defineConfig, devices } from '@playwright/test';

const isLocalServer = process.env.USE_LOCAL_SERVER === '1';

export default defineConfig({
  testDir: './client/e2e',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.CLIENT_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: isLocalServer
    ? [
        {
          command: 'npm run start:server',
          port: 5000,
          reuseExistingServer: true,
          timeout: 30000,
        },
        {
          command: 'npm run dev:client',
          port: 5173,
          reuseExistingServer: true,
          timeout: 30000,
        },
      ]
    : undefined,
});
