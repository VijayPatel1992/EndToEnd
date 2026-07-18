import { test, Page, expect } from '@playwright/test';
import { loginPage } from '../pages/loginPage';
import { navigationPage } from '../pages/navigationPage';
import { recruitmentPage } from '../pages/recruitmentPage'
import LeftPaneMenu from '../constant/LeftPaneNavigation.json';
import path from 'node:path';
import * as fs from 'fs'

const storageStatePath = path.resolve(process.cwd(), 'storageState.json');

test.use({ storageState: storageStatePath });

const URL = process.env.BASE_URL!;
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
    let NewURL = URL + '/web/index.php/dashboard/index'
    await page.goto(NewURL);

})

test('Add Candidate', async ({ page }) => {

    await ObjNavigationPage.NavigationThroughLeftPane(LeftPaneMenu.Recruitment);
    await ObjRecruitmentPage.AddCandidate();
    await ObjRecruitmentPage.FillCandidateDetails(CandidateData);
})

// test('Download Candidate Details',{ tag: '@debugg' },  async ({ page }) => {
test('Download Candidate Details', async ({ page }) => {
    
    await ObjNavigationPage.NavigationThroughLeftPane(LeftPaneMenu.Recruitment);
    await ObjRecruitmentPage.SearchCandidate("Vijaykumar", "Vijaykumar Ramnikbhai Patel")
    await ObjRecruitmentPage.DownloadCandidateDetails("Vijaykumar Ramnikbhai Patel");
})