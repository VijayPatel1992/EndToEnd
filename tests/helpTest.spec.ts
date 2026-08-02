import { test, expect } from '@playwright/test';
import { navigationPage } from '../pages/navigationPage';
import { loginPage } from '../pages/loginPage';
import { attachment } from 'allure-js-commons';
import { storageStatePath } from '../utility/GlobalSetUp';


const URL = process.env.BASE_URL!;
const userName = process.env.LOGIN_USERNAME!;
const password = process.env.LOGIN_PASSWORD!;

let ObjNavigationPage: navigationPage;
let ObjLoginPage: loginPage;

test.beforeEach(async ({page}) => {
  ObjNavigationPage = new navigationPage(page);
  ObjLoginPage = new loginPage(page);
  let NewURL = URL + '/web/index.php/dashboard/index'
  await page.goto(NewURL);
    if (page.url().includes('/auth/login')) {
          await ObjLoginPage.DoLogin(userName, password);
          await page.goto('/web/index.php/dashboard/index');
          await page.context().storageState({ path: storageStatePath });
      }
})

test('[10]Open Help Page', async ({ page }) => {

  const HelpPageTab = await ObjNavigationPage.NavigateToHelpPage();
  await expect(HelpPageTab).toHaveURL(/starterhelp\.orangehrm\.com/);
  test.info().attach(test.info().title.toString());
  attachment(test.info().title.toString(), await HelpPageTab.screenshot(), 'image/png')
});
