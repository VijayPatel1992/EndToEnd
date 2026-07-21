import { test, Page, expect } from '@playwright/test';
import { loginPage } from '../pages/loginPage';
import { navigationPage } from '../pages/navigationPage';
import { recruitmentPage } from '../pages/recruitmentPage'
import LeftPaneMenu from '../constant/LeftPaneNavigation.json';
import path from 'node:path';
import * as fs from 'fs'
import { ROOT_PATH } from '../utility/GlobalSetUp';


const URL = process.env.BASE_URL!;
let ObjLoginPage: loginPage;
let ObjNavigationPage: navigationPage;
let ObjRecruitmentPage: recruitmentPage;

let RootPath = path.join(ROOT_PATH, 'testData', 'CandidateDetails.json');
const JsonFile = fs.readFileSync(RootPath, 'utf-8');
const JsonData = JSON.parse(JsonFile);

test.beforeEach(async ({ page }) => {

    ObjLoginPage = new loginPage(page);
    ObjNavigationPage = new navigationPage(page);
    ObjRecruitmentPage = new recruitmentPage(page);
    let NewURL = URL + '/web/index.php/dashboard/index'
    await page.goto(NewURL);

})

test.describe.serial("Add Candidate and Download", () => {

    test('Add Candidate', async ({ page }) => {
        await ObjNavigationPage.NavigationThroughLeftPane(LeftPaneMenu.Recruitment);
        await ObjRecruitmentPage.AddCandidate();
        await ObjRecruitmentPage.FillCandidateDetails(JsonData.validCandidate);
    });
  
    test('Download Candidate Details', async ({ page }) => {
        await ObjNavigationPage.NavigationThroughLeftPane(LeftPaneMenu.Recruitment);
        await ObjRecruitmentPage.SearchCandidate(JsonData.SearchCandidate["SearchKeyWord"], JsonData.SearchCandidate["CandidateName"])
        await ObjRecruitmentPage.DownloadCandidateDetails(JsonData.SearchCandidate["CandidateName"]);
    });

});

