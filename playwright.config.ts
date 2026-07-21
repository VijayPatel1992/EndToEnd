import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'node:path';
import * as fs from 'fs';
import { ROOT_PATH, storageStatePath } from './utility/GlobalSetUp';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : `.env.qa`;
console.log('Loading env file from:', path.resolve(ROOT_PATH, 'env', envFile));
dotenv.config({ path: path.resolve(ROOT_PATH, 'env', envFile) });
console.log(`ENV file successfully loaded - ${envFile}`);

console.log('Storage state path in Config file:', storageStatePath);
console.log('Storage state file exists:', fs.existsSync(storageStatePath));

// Determine which storage state to use
let finalStorageStatePath: string | undefined;
if (fs.existsSync(storageStatePath)) {
  finalStorageStatePath = storageStatePath;
  console.log('✓ Using existing storage state file');
} else {
  console.warn('⚠ Storage state file does not exist yet. It will be created by globalSetup.');
  // Don't set storageState in use config if file doesn't exist yet
  // It will be created during globalSetup
}

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
  timeout: 40 * 1000,
  globalSetup: require.resolve('./utility/GlobalSetUp.ts'),
  
  
  use: {
    ...(finalStorageStatePath ? { storageState: finalStorageStatePath } : {}),
    baseURL: process.env.BASE_URL,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
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
