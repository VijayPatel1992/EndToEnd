import {test, expect, Page} from '@playwright/test'
import { navigationPage } from '../pages/navigationPage';
import { loginPage } from '../pages/loginPage';

let URL : string = process.env.BASE_URL!
let UserName : string = process.env.LOGIN_USERNAME!
let Password : string = process.env.LOGIN_PASSWORD!


let ObjNavigationPage : navigationPage;
let ObjLoginPage: loginPage;

test('Open Help Page', async ({page}) =>{

    ObjNavigationPage = new navigationPage(page);    
    ObjLoginPage = new loginPage(page);

    await page.goto(URL);
    ObjLoginPage.DoLogin(UserName, Password);
    const HelpPageTab =  await ObjNavigationPage.NavigateToHelpPage();
    expect((await HelpPageTab)).toHaveURL(/starterhelp\.orangehrm\.com/);

})