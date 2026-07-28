import { chromium } from '@playwright/test';
import * as fs from 'fs';
import path from 'path';
import os from 'os';
import { loginPage } from '../pages/loginPage';

export const ROOT_PATH = path.join(process.cwd());
export const storageStatePath = path.resolve(ROOT_PATH, 'storageState.json');
export const DOWNLOAD_PATH = path.resolve(ROOT_PATH, 'download');
export const UPLOAD_PATH = path.resolve(ROOT_PATH, 'fileToUpload');

const allureDir = path.resolve(ROOT_PATH, 'allure-results');

// ✅ Collect logs in an array
const setupLogs: string[] = [];
function log(message: string) {
  console.log(message);          // visible in pipeline logs
  setupLogs.push(message);       // stored for Allure
}

async function globalSetup() {
  try {
    log('=== Global Setup Started ===');

    const URL = process.env.BASE_URL!;
    const userName = process.env.LOGIN_USERNAME!;
    const password = process.env.LOGIN_PASSWORD!;

    // --- Prepare Allure folder & environment file first ---
    if (!fs.existsSync(allureDir)) {
      fs.mkdirSync(allureDir, { recursive: true });
      log("Directory created");
    }

    const envDetails = `Browser=${process.env.BROWSER || 'chromium'}
OS=${os.type()} ${os.release()}
Node=${process.version}
BaseURL=${URL}
User=${userName}
Build=${process.env.BUILD_NUMBER || 'local'}
Executor=Playwright GlobalSetup
Environment=${process.env.NODE_ENV}
`;
    fs.writeFileSync(path.join(allureDir, 'environment.properties'), envDetails.trim());
    log('Environment properties file created');

    
    log(`Storage state path: ${storageStatePath}`);
    log(`Environment: ${process.env.NODE_ENV}`);

    const forceRefresh = !!process.env.CI;
    log(`Force Refresh: ${forceRefresh}`);
    log(`File Exist: ${fs.existsSync(storageStatePath)}`);

    if (forceRefresh && fs.existsSync(storageStatePath)) {
      fs.unlinkSync(storageStatePath);
      log("File deleted forcefully.");
    }

    if (forceRefresh || !fs.existsSync(storageStatePath) || isExpired(storageStatePath)) {
      log('Creating new storage state...');
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      log(`Navigating to: ${URL}`);
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 60 * 1000 });

      log(`Logging in as: ${userName}`);
      const objLoginPage = new loginPage(page);

      try {
        await objLoginPage.DoLogin(userName, password);
        log("Login successful");
        const screenshot = await page.screenshot();
        fs.writeFileSync(path.join(allureDir, 'globalSetup-login.png'), screenshot);
      } catch (error) {
        log("Login failed");
        const screenshot = await page.screenshot();
        fs.writeFileSync(path.join(allureDir, 'globalSetup-failed.png'), screenshot);
        throw error;
      }

      await context.storageState({ path: storageStatePath });
      log('Storage state saved successfully');

      await context.close();
      await browser.close();
    } else {
      log('Using existing storage state (valid and not expired)');
    }

    // --- Flush logs into allure-results ---
    fs.writeFileSync(path.join(allureDir, 'globalSetup-log.txt'), setupLogs.join('\n'));

    
    log('=== Global Setup Completed Successfully ===\n');

  } catch (error) {
    log('=== Global Setup Failed ===');
    log(`Error: ${error}`);
    fs.writeFileSync(path.join(allureDir, 'globalSetup-log.txt'), setupLogs.join('\n'));
    throw new Error(`Global setup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function isExpired(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    const ageInMin = (Date.now() - stats.mtimeMs) / (1000 * 60);
    const expired = ageInMin > 30;
    log(`Storage state age: ${ageInMin.toFixed(2)} minutes, Expired: ${expired}`);
    return expired;
  } catch (error) {
    log(`Error checking file expiration: ${error}`);
    return true;
  }
}

export default globalSetup;
