import { test, Page, Locator } from '@playwright/test';
import { timeStamp } from 'node:console';


export class navigationPage {

    private page: Page;
    private readonly pageHeader: Locator;
    private readonly helpIcon: Locator;
    


    constructor(page: Page) {
        this.page = page;
        this.pageHeader = this.page.getByRole('heading');
        this.helpIcon = this.page.getByTitle('Help', { exact: true })
    }
    private LeftPaneMenuItem(menuItem: string) {
        return this.page.getByRole('navigation', { name: 'Sidepanel' }).locator('a').filter({ hasText: menuItem })
    }

    public async GetPageHeader(): Promise<string> {
        const HeaderText = await this.pageHeader.textContent();
        return HeaderText!;
    }

    public async NavigationThroughLeftPane(MenuItem: string) {
        await this.LeftPaneMenuItem(MenuItem).click();
    }

    public async NavigateToHelpPage():Promise<Page>{
        const[newpage] = await Promise.all([
            this.page.context().waitForEvent('page'),
            this.helpIcon.click()
          ])
          return newpage;
    }




}