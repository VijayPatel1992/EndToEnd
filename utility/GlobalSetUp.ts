import { chromium } from '@playwright/test';
import * as fs from 'fs';
import { loginPage } from '../pages/loginPage';
import os from 'os';
import path from 'path';

async function globalSetup() {
  const URL = process.env.BASE_URL!;
  const userName = process.env.LOGIN_USERNAME!;
  const password = process.env.LOGIN_PASSWORD!;

  const statePath = storageStatePath;
  const allureDir = path.resolve(ROOT_PATH, 'allure-results');

  if (!fs.existsSync(statePath) || isExpired(statePath)) {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const objLoginPage = new loginPage(page);
    await page.goto(URL, { timeout: 60 * 1000 });
    await objLoginPage.DoLogin(userName, password);

    await context.storageState({ path: statePath });
    await browser.close();
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

  if (!fs.existsSync(allureDir)) {
    fs.mkdirSync(allureDir, { recursive: true });
  }

  fs.writeFileSync(path.join(allureDir, 'environment.properties'), envDetails.trim());
}

function isExpired(filePath: string): boolean {
  const stats = fs.statSync(filePath);
  const ageInMin = (Date.now() - stats.mtimeMs) / (1000 * 60);
  const FileMinutes = ageInMin > 5;
  return ageInMin > 5;
}

export default globalSetup;

export const ROOT_PATH = path.join(__dirname, '..');
export const DOWNLOAD_PATH = path.resolve(ROOT_PATH, 'download');
export const UPLOAD_PATH = path.resolve(ROOT_PATH, 'fileToUpload');
export const storageStatePath = path.resolve(ROOT_PATH, 'storageState.json');