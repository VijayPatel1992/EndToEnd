// import {Page, test, expect} from '@playwright/test';
// import {loginPage} from '../pages/loginPage';
// import {navigationPage} from '../pages/navigationPage'
// import StaticText from '../constant/StaticText.json'
// import LeftaPaneNavigaton from '../constant/LeftPaneNavigation.json'
// import { resolveObjectURL } from 'node:buffer';

// const URL = process.env.BASE_URL!
// const UserName = process.env.LOGIN_USERNAME!
// const Password = process.env.LOGIN_PASSWORD!
// let ObjLoginPage : loginPage;
// let ObjNavigationPage : navigationPage

// test('Perform Login and Verify Dashboard',  async ({page}) =>{
//     test.setTimeout(60*1000);

//     ObjLoginPage = new loginPage(page);
//     ObjNavigationPage = new navigationPage(page);
//     await page.goto(URL);
//     await ObjLoginPage.DoLogin(UserName, Password);    
//      expect(await ObjNavigationPage.GetPageHeader()).toBe(StaticText.Dashboard);

//      await ObjNavigationPage.NavigationThroughLeftPane(LeftaPaneNavigaton.Recruitment);
// })