import { chromium } from '@playwright/test';
import * as fs from 'fs';
import { loginPage } from '../pages/loginPage';
import os from 'os';
import path from 'path';

const URL = process.env.BASE_URL!;
const userName = process.env.LOGIN_USERNAME!;
const password = process.env.LOGIN_PASSWORD!;

if (!URL || !userName || !password) {
  throw new Error(`Missing required environment values. BASE_URL=${!!URL}, LOGIN_USERNAME=${!!userName}, LOGIN_PASSWORD=${!!password}`);
}

async function globalSetup() {
  const statePath = path.resolve(process.cwd(), 'storageState.json');
  const allureDir = path.resolve(process.cwd(), 'allure-results');

  if (!fs.existsSync(statePath) || isExpired(statePath)) {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const objLoginPage = new loginPage(page);
    await page.goto(URL, {timeout : 60*1000});
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
  const FileMinutes = ageInMin >5;
  return ageInMin > 5;
}

export default globalSetup;

export const ROOT_PATH = path.resolve(__dirname);
export const DOWNLOAD_PATH = path.resolve(__dirname, 'downloads');
export const storageStatePath = path.resolve(process.cwd(), 'storageState.json');