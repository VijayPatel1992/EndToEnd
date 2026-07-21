import { Page, Locator } from '@playwright/test';

export class loginPage {

    private readonly page: Page;
    private readonly usernameInput : Locator;
    private readonly passwordInput : Locator;
    private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
     this.usernameInput = this.page.getByRole('textbox', {name : /username/i});
        this.passwordInput = this.page.getByRole('textbox', {name : 'password'})
        this.loginButton = this.page.getByRole('button', {name: 'Login'});
  }

  async DoLogin(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }


}