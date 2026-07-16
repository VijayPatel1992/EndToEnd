import { test, Page, Locator } from '@playwright/test'
import path from 'node:path';

export class recruitmentPage {
    private page: Page;
    private Add_Button: Locator;
    private FirstName_Txb: Locator;
    private LastName_Txb: Locator;
    private MiddleName_Txb: Locator;
    private Browse_Btn: Locator;
    private Consent_CheckBox: Locator;
    private Save_Button: Locator;
    private Search_Button: Locator;
    private DeleteConfirm_Button: Locator;

    constructor(page: Page) {
        this.page = page;
        this.Add_Button = this.page.getByRole('button', { name: 'Add' });
        this.FirstName_Txb = this.page.getByRole('textbox', { name: 'First Name' })
        this.MiddleName_Txb = this.page.getByRole('textbox', { name: 'Middle Name' })
        this.LastName_Txb = this.page.getByRole('textbox', { name: 'Last Name' })
        this.Browse_Btn = this.page.getByText('Browse', { exact: true });
        this.Consent_CheckBox = this.page.getByText('Consent to keep data', { exact: true });
        this.Save_Button = this.page.getByRole('button', { name: "Save" })
        this.Search_Button = this.page.getByRole('button', { name: "Search" });
        this.DeleteConfirm_Button = this.page.getByRole('button', { name: "Yes, Delete" })
    }

    // private getDropdown(label: string): Locator {
    //     return this.page
    //         .locator('.oxd-input-group')
    //         .filter({
    //             has: this.page.locator('label', { hasText: label })
    //         })
    //         .locator('.oxd-select-text');
    // }

    private GetDropDownOptions(option: string): Locator {
        return this.page.getByRole('option').filter({ hasText: option }).first();
    }

    private getDropdown(label: string): Locator {
        return this.page.locator('.oxd-grid-item').filter({ hasText: label }).locator(".oxd-select-text");
    }

    private getTextBox(label: string): Locator {
        return this.page.locator('.oxd-grid-item').filter({ hasText: label }).locator("input");
    }

    private getTextArea(label: string): Locator {
        return this.page.locator('.oxd-grid-item').filter({ hasText: 'Notes' }).locator("textarea");
    }

    private CandidateRecord_Row(name: string): Locator {
        return this.page.locator('div[role=row]')
            .filter({
                has: this.page.getByText(name, { exact: true })
            });
    }

    private CandidatDownload_Button(name: string): Locator {
        return this.CandidateRecord_Row(name)
            .locator('button:has(i.bi-download)').first();
    }



    public async AddCandidate() {
        await this.Add_Button.click();
    }

    public async FillCandidateDetails(
        candidateData: Record<string, string>) {
        await this.FirstName_Txb.click();
        await this.FirstName_Txb.fill(candidateData['firstName']);
        await this.MiddleName_Txb.fill(candidateData['middleName']);
        await this.LastName_Txb.fill(candidateData['lastName']);
        await this.getDropdown("Vacancy").click();
        await this.GetDropDownOptions(candidateData['vacancy']).click();
        await this.getTextBox("Email").fill(candidateData['email']);
        await this.getTextBox("Contact Number").fill(candidateData['contactNumber']);
        const FilePath = path.resolve(process.cwd(), "fileToUpload", candidateData['resumeFile']);
        const [filechooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.Browse_Btn.click()
        ])
        await filechooser.setFiles(FilePath);
        await this.getTextBox("Keywords").fill(candidateData['keywords']);
        await this.getTextArea("Notes").fill(candidateData['notes']);
        await this.Consent_CheckBox.click();
        await this.Save_Button.click();
        await this.page.waitForTimeout(1000);

    }

    public async SearchCandidate(SearchText: string, fullName: string) {
        await this.getTextBox("Candidate Name").fill(SearchText);
        await this.GetDropDownOptions(fullName).click();
        await this.Search_Button.click();
    }

    public async DownloadCandidateDetails(fullName: string) {

        const DownloadPath = path.join(process.cwd(), "download")

        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.CandidatDownload_Button(fullName).click()
        ])
        console.log(DownloadPath);
        console.log(download.suggestedFilename());
        const fileName = path.join(DownloadPath, await download.suggestedFilename());
        console.log(fileName);
        await download.saveAs(fileName);

    }



}