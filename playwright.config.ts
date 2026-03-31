import { defineConfig, devices } from '@playwright/test';

// Use environment variable or default to latest deployment
const baseUrl = process.env.E2E_BASE_URL || 
  'https://morix-crm-v2-f2etp91vv-kritthk-9309s-projects.vercel.app';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000, // Increased for slower Vercel
  expect: { timeout: 15000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
