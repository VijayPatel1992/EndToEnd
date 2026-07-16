import { test, Page, expect } from '@playwright/test';
import { loginPage } from '../pages/loginPage';
import { navigationPage } from '../pages/navigationPage';
import { recruitmentPage } from '../pages/recruitmentPage'
import LeftPaneMenu from '../constant/LeftPaneNavigation.json'
import Candidate_TestData from '../testData/CandidateDetails.json'
import path from 'node:path';
import * as fs from 'fs'
import { json } from 'node:stream/consumers';

const storageStatePath = path.resolve(process.cwd(), 'storageState.json');

test.use({ storageState: storageStatePath });

const URL = process.env.BASE_URL!;
const UserName = process.env.LOGIN_USERNAME!
const Password = process.env.LOGIN_PASSWORD!
let ObjLoginPage: loginPage;
let ObjNavigationPage: navigationPage;
let ObjRecruitmentPage: recruitmentPage;

let RootPath = path.join(process.cwd(), 'testData', 'CandidateDetails.json');
const JsonFile = fs.readFileSync(RootPath, 'utf-8');
const JsonData = JSON.parse(JsonFile);
const CandidateData = JsonData.validCandidate;

test.beforeEach(async ({ page }) => {
    ObjLoginPage = new loginPage(page);
    ObjNavigationPage = new navigationPage(page);
    ObjRecruitmentPage = new recruitmentPage(page);
})

test('Add Candidate',{tag: '@debugg'},async ({ page }) => {
    let NewURL = URL + '/web/index.php/dashboard/index'
    await page.goto(NewURL);
    //await ObjLoginPage.DoLogin(UserName, Password);
    await ObjNavigationPage.NavigationThroughLeftPane(LeftPaneMenu.Recruitment);
    await ObjRecruitmentPage.AddCandidate();
    await ObjRecruitmentPage.FillCandidateDetails(Candidate_TestData.validCandidate);
})

// test('Download Candidate Details',{ tag: '@debugg' },  async ({ page }) => {
// test('Download Candidate Details',  async ({ page }) => {
//     await page.goto(URL);
//     //await ObjLoginPage.DoLogin(UserName, Password);
//     await ObjNavigationPage.NavigationThroughLeftPane(LeftPaneMenu.Recruitment);
//     await ObjRecruitmentPage.SearchCandidate("Vijaykumar", "Vijaykumar Ramnikbhai Patel")
//     await ObjRecruitmentPage.DownloadCandidateDetails("Vijaykumar Ramnikbhai Patel");
// })