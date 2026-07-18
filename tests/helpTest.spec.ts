import { test, expect } from '@playwright/test';
import { navigationPage } from '../pages/navigationPage';
import { loginPage } from '../pages/loginPage';
import { attachment } from 'allure-js-commons';

const URL = process.env.BASE_URL!;

let ObjNavigationPage: navigationPage;
let ObjLoginPage: loginPage;

test.beforeEach(async ({page}) => {
  ObjNavigationPage = new navigationPage(page);
  ObjLoginPage = new loginPage(page);
  let NewURL = URL + '/web/index.php/dashboard/index'
  await page.goto(NewURL);
})

test('Open Help Page', { tag: "@debugg" }, async ({ page }) => {

  const HelpPageTab = await ObjNavigationPage.NavigateToHelpPage();
  await expect(HelpPageTab).toHaveURL(/starterhelp\.orangehrm\.com/);
  test.info().attach(test.info().title.toString());
  attachment(test.info().title.toString(), await page.screenshot(), 'image/png')
});