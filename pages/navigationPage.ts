import { test, Page, Locator } from '@playwright/test';
import { timeStamp } from 'node:console';


export class navigationPage {

    private page: Page;
    private readonly PageHeader_Header: Locator;
    private readonly Help_Icon: Locator;
    


    constructor(page: Page) {
        this.page = page;
        this.PageHeader_Header = this.page.getByRole('heading');
        this.Help_Icon = this.page.getByTitle('Help', { exact: true })
    }
    private LeftPaneMenuItem(menuItem: string) {
        return this.page.getByRole('navigation', { name: 'Sidepanel' }).locator('a').filter({ hasText: menuItem })
    }

    public async GetPageHeader(): Promise<string> {
        const HeaderText = await this.PageHeader_Header.textContent();
        return HeaderText!;
    }

    public async NavigationThroughLeftPane(MenuItem: string) {
        await this.LeftPaneMenuItem(MenuItem).click();
    }

    public async NavigateToHelpPage():Promise<Page>{
        const[newpage] = await Promise.all([
            this.page.context().waitForEvent('page'),
            this.Help_Icon.click()
          ])
          return newpage;
    }




}