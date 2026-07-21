import { test, Page, expect } from '@playwright/test';
import { loginPage } from '../pages/loginPage';
import { navigationPage } from '../pages/navigationPage';
import { recruitmentPage } from '../pages/recruitmentPage'
import LeftPaneMenu from '../constant/LeftPaneNavigation.json';
import path from 'node:path';
import * as fs from 'fs'
import { ROOT_PATH } from '../utility/GlobalSetUp';
import { DOWNLOAD_PATH } from '../utility/GlobalSetUp';
import { FileHelper } from '../utility/fileHelper'

const URL = process.env.BASE_URL!;
let ObjLoginPage: loginPage;
let ObjNavigationPage: navigationPage;
let ObjRecruitmentPage: recruitmentPage;

let CandidateDetailsPath;
let CandidateData: any;

test.beforeAll(async () => {
    // One-time setup before the suite
    console.log(`Running tests on ${process.env.BASE_URL}`);
    console.log(`Browser: ${process.env.BROWSER || 'chromium'}`);
    console.log(`Node: ${process.version}`);
    CandidateDetailsPath = path.join(ROOT_PATH, 'testData', 'CandidateDetails.json');
    CandidateData = JSON.parse(fs.readFileSync(CandidateDetailsPath, 'utf-8'));

});


test.beforeEach(async ({ page }) => {

    ObjLoginPage = new loginPage(page);
    ObjNavigationPage = new navigationPage(page);
    ObjRecruitmentPage = new recruitmentPage(page);
    await page.goto('/web/index.php/dashboard/index');
})

test.afterEach(async ({ page }, testInfo) => {
    // Capture screenshot if a test fails
    if (testInfo.status !== testInfo.expectedStatus) {
        await page.screenshot({ path: `screenshots/${testInfo.title}.png` });
    }
});

test.afterAll(async () => {
    // Clean downloads folder after all tests
    const deletedCount = FileHelper.cleanDirectory(DOWNLOAD_PATH);
    console.log(`Cleaned ${deletedCount} files from download folder`);
});


test.describe.serial("Add Candidate and Download", () => {

    test('Add Candidate', { tag: '@debugg' }, async ({ page }) => {
        await ObjNavigationPage.NavigationThroughLeftPane(LeftPaneMenu.Recruitment);
        await ObjRecruitmentPage.AddCandidate();
        await ObjRecruitmentPage.FillCandidateDetails(CandidateData.validCandidate);
        await ObjRecruitmentPage.SaveCandidate();
        await ObjNavigationPage.NavigationThroughLeftPane(LeftPaneMenu.Recruitment);
        await ObjRecruitmentPage.SearchCandidate(CandidateData.SearchCandidate["SearchKeyWord"], CandidateData.SearchCandidate["CandidateName"])

        const CandidateList = await ObjRecruitmentPage.GetAllCandidates();
        console.log('Candidate List:', CandidateList);
        console.log('Expected Candidate:', CandidateData.SearchCandidate["CandidateName"]);
        expect(CandidateList).toContain(CandidateData.SearchCandidate["CandidateName"]);

    });

    test('Download Candidate Details', async ({ page }) => {
        await ObjNavigationPage.NavigationThroughLeftPane(LeftPaneMenu.Recruitment);
        await ObjRecruitmentPage.SearchCandidate(CandidateData.SearchCandidate["SearchKeyWord"], CandidateData.SearchCandidate["CandidateName"])
        const FilePath = await ObjRecruitmentPage.DownloadCandidateDetails(CandidateData.SearchCandidate["CandidateName"]);
        expect(FileHelper.fileExists(FilePath)).toBeTruthy();
    });

});


