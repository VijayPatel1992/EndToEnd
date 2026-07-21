import { chromium } from '@playwright/test';
import * as fs from 'fs';
import { loginPage } from '../pages/loginPage';
import os from 'os';
import path from 'path';

// Export ROOT_PATH first so it can be used in other exports
export const ROOT_PATH = path.join(__dirname, '..');
export const DOWNLOAD_PATH = path.resolve(ROOT_PATH, 'download');
export const UPLOAD_PATH = path.resolve(ROOT_PATH, 'fileToUpload');
export const storageStatePath = path.resolve(ROOT_PATH, 'storageState.json');

async function globalSetup() {
  try {
    const URL = process.env.BASE_URL!;
    const userName = process.env.LOGIN_USERNAME!;
    const password = process.env.LOGIN_PASSWORD!;

    console.log('=== Global Setup Started ===');
    console.log('Storage state path:', storageStatePath);
    console.log('Environment:', process.env.NODE_ENV);

    const allureDir = path.resolve(ROOT_PATH, 'allure-results');

    // 🔑 Force fresh login in CI/CD
    const forceRefresh = !!process.env.CI;

    if (forceRefresh || !fs.existsSync(storageStatePath) || isExpired(storageStatePath)) {
      console.log('Creating new storage state...');
      
      const browser = await chromium.launch({ headless: false });
      const context = await browser.newContext();
      const page = await context.newPage();

      console.log(`Logging in as: ${userName}`);
      const objLoginPage = new loginPage(page);

      await page.goto(URL, { waitUntil: 'networkidle', timeout: 60 * 1000 });
      await objLoginPage.DoLogin(userName, password);

      // ✅ Assert login success before saving
      //await page.waitForSelector('#dashboard', { timeout: 30 * 1000 });

      await context.storageState({ path: storageStatePath });
      console.log('Storage state saved successfully');
       console.log(`File created Cross verification in global set up: ${fs.existsSync(storageStatePath)}`);

      await context.close();
      await browser.close();
    } else {
      console.log('Using existing storage state (valid and not expired)');
    }

    // Environment properties for Allure
    const envDetails = `Browser=${process.env.BROWSER || 'chromium'}
OS=${os.type()} ${os.release()}
Node=${process.version}
BaseURL=${URL}
User=${userName}
Build=${process.env.BUILD_NUMBER || 'local'}
Executor=Playwright GlobalSetup
Environment=${process.env.NODE_ENV}
`;

    if (!fs.existsSync(allureDir)) {
      fs.mkdirSync(allureDir, { recursive: true });
    }

    fs.writeFileSync(path.join(allureDir, 'environment.properties'), envDetails.trim());
    console.log('Environment properties file created');
    console.log('=== Global Setup Completed Successfully ===\n');

  } catch (error) {
    console.error('=== Global Setup Failed ===');
    console.error('Error:', error);
    throw new Error(`Global setup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}


function isExpired(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    const ageInMin = (Date.now() - stats.mtimeMs) / (1000 * 60);
    const expired = ageInMin > 30;
    console.log(`Storage state age: ${ageInMin.toFixed(2)} minutes, Expired: ${expired}`);
    return expired;
  } catch (error) {
    console.error('Error checking file expiration:', error);
    return true; // Consider as expired if we can't check
  }
}

export default globalSetup;