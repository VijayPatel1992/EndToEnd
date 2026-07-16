import {test, BrowserType, chromium, firefox, webkit} from '@playwright/test'
import * as fs from 'fs';
import { loginPage } from '../pages/loginPage';
import dotenv from 'dotenv';
import os from 'os'
import path from 'path';

// Point dotenv to the exact file
const ENVFIle = process.env.NODE_ENV? `.env.${process.env.NODE_ENV}` : `.env.qa`

console.log(path.resolve(process.cwd() ,'env', ENVFIle ));
dotenv.config({path: path.resolve(process.cwd() ,'env', ENVFIle )})
// dotenv.config({ path: path.resolve(__dirname, '../env/.env.qa') });

const URL = process.env.BASE_URL!;
const userName = process.env.LOGIN_USERNAME!;
const password = process.env.LOGIN_PASSWORD!;

if (!URL || !userName || !password) {
  throw new Error(`Missing required environment values. BASE_URL=${!!URL}, LOGIN_USERNAME=${!!userName}, LOGIN_PASSWORD=${!!password}`);
}

async function globalSetup() {  const statePath = 'storageState.json';


  // If file doesn’t exist or is too old, regenerate
  if (!fs.existsSync(statePath) || isExpired(statePath)) {
   
    const browser = await chromium.launch({headless : false});
    const context = await browser.newContext();
    const page = await context.newPage();

    const ObjloginPage: loginPage = new loginPage(page);
    await page.goto(URL);
    await ObjloginPage.DoLogin(userName, password);

    await context.storageState({ path: statePath });
    await browser.close();
  }

  // --- NEW: Write environment details for Allure ---
  const envDetails = `
  Browser=${process.env.BROWSER || 'chromium'}
  OS=${os.type()} ${os.release()}
  Node=${process.version}
  BaseURL=${URL}
  User=${userName}
  Build=${process.env.BUILD_NUMBER || 'local'}
  Executor=Playwright GlobalSetup
  Envrionment=${process.env.NODE_ENV}
  `;

  // Ensure allure-results folder exists
  if (!fs.existsSync('allure-results')) {
    fs.mkdirSync('allure-results');
  }

  fs.writeFileSync('allure-results/environment.properties', envDetails.trim());
}

function isExpired(path: string): boolean {
  const stats = fs.statSync(path);
  const ageInMin = (Date.now() - stats.mtimeMs) / (1000 * 60);
  return ageInMin > 5; // refresh if older than 5 minutes
}

export default globalSetup;