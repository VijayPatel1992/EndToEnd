import { test, Page, Locator } from '@playwright/test'
import path from 'node:path';
import { UPLOAD_PATH, DOWNLOAD_PATH } from '../utility/GlobalSetUp'

export class recruitmentPage {
    private page: Page;
    private addButton: Locator;
    private firstNameInput: Locator;
    private lastNameInput: Locator;
    private middleNameInput: Locator;
    private browseButton: Locator;
    private consentCheckBox: Locator;
    private saveButton: Locator;
    private searchButton: Locator;
    private deleteConfirmButton: Locator;
    private allCandidate: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addButton = this.page.getByRole('button', { name: 'Add' });
        this.firstNameInput = this.page.getByRole('textbox', { name: 'First Name' })
        this.middleNameInput = this.page.getByRole('textbox', { name: 'Middle Name' })
        this.lastNameInput = this.page.getByRole('textbox', { name: 'Last Name' })
        this.browseButton = this.page.getByText('Browse', { exact: true });
        this.consentCheckBox = this.page.getByText('Consent to keep data', { exact: true });
        this.saveButton = this.page.getByRole('button', { name: "Save" })
        this.searchButton = this.page.getByRole('button', { name: "Search" });
        this.deleteConfirmButton = this.page.getByRole('button', { name: "Yes, Delete" });
        this.allCandidate = this.page.locator(`div[role ="row"]>div:nth-child(3) div`);
    }


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
        await this.addButton.click();
    }

    public async SaveCandidate() {
        await this.saveButton.click();
    }
    public async FillCandidateDetails(
        candidateData: Record<string, string>) {
        await this.firstNameInput.click();
        await this.firstNameInput.fill(candidateData['firstName']);
        await this.middleNameInput.fill(candidateData['middleName']);
        await this.lastNameInput.fill(candidateData['lastName']);
        await this.getDropdown("Vacancy").click();
        await this.GetDropDownOptions(candidateData['vacancy']).click();
        await this.getTextBox("Email").fill(candidateData['email']);
        await this.getTextBox("Contact Number").fill(candidateData['contactNumber']);
        const FilePath = path.resolve(UPLOAD_PATH, candidateData['resumeFile']);
        const [filechooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.browseButton.click()
        ])
        await filechooser.setFiles(FilePath);
        await this.getTextBox("Keywords").fill(candidateData['keywords']);
        await this.getTextArea("Notes").fill(candidateData['notes']);
        await this.consentCheckBox.click();

    }

    public async SearchCandidate(SearchText: string, fullName: string) {

        await test.step(`Search for candidate ${SearchText}`, async () => {
            await this.getTextBox("Candidate Name").fill(SearchText);
            await this.GetDropDownOptions(fullName).click();
            await this.searchButton.click();
        }
    )}
        
    

    public async DownloadCandidateDetails(fullName: string) {

        const DownloadPath = DOWNLOAD_PATH;

        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.CandidatDownload_Button(fullName).click()
        ])
        console.log(DownloadPath);
        console.log(download.suggestedFilename());
        const fileName = path.join(DownloadPath, await download.suggestedFilename());
        console.log(fileName);
        await download.saveAs(fileName);
        return fileName;

    }

    public async GetAllCandidates() {
        await this.allCandidate.first().waitFor({ state: 'visible' });
        const AllCandidateName = await this.allCandidate.allTextContents();
        return AllCandidateName;
    }



}