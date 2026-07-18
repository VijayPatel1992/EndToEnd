import { Page, Locator } from '@playwright/test';

export class loginPage {

    private readonly page: Page;
    private readonly UserName_Input : Locator;
    private readonly Password_Input : Locator;
    private readonly Login_Btn: Locator;

  constructor(page: Page) {
    this.page = page;
     this.UserName_Input = this.page.getByRole('textbox', {name : /username/i});
        this.Password_Input = this.page.getByRole('textbox', {name : 'password'})
        this.Login_Btn = this.page.getByRole('button', {name: 'Login'});
  }

  async DoLogin(username: string, password: string) {
    await this.UserName_Input.fill(username);
    await this.Password_Input.fill(password);
    await this.Login_Btn.click();
  }


}