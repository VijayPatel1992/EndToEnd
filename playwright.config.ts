import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'node:path';
import { ROOT_PATH, storageStatePath } from './utility/GlobalSetUp';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : `.env.qa`;
console.log(path.resolve(ROOT_PATH, 'env', envFile));
dotenv.config({ path: path.resolve(ROOT_PATH, 'env', envFile) });
console.log(`ENV file successfully loaded - ${envFile}`);

console.log('Storage state path in Config file:', storageStatePath);
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: path.join(__dirname, 'junit-results', 'junit-report.xml') }],
    ['allure-playwright', { resultsDir: 'allure-results' }]
  ],
  timeout: 90 * 1000,
  globalSetup: require.resolve('./utility/GlobalSetUp.ts'),
  
  use: {
    // storageState: path.resolve(ROOT_PATH, 'storageState.json'),
    storageState : storageStatePath,
    baseURL: process.env.BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
