import { expect, Locator, Page } from '@playwright/test';
import { Popup } from './Popup';
import { TvshowData } from '../api';

export class Tvshows {
    readonly registerLink: Locator;
    readonly titleInput: Locator;
    readonly synopsisInput: Locator;
    readonly companySelect: Locator;
    readonly releaseYearSelect: Locator;
    readonly seasonsInput: Locator;
    readonly featuredSwitch: Locator;
    readonly coverInput: Locator;
    readonly registerButton: Locator;
    readonly searchInput: Locator;
    readonly popup: Popup;
    readonly registerForm: Locator;
    readonly alert: Locator;

    constructor(private readonly page: Page) {
        this.registerLink = page.locator('.actions a');
        this.titleInput = page.locator('input[name="title"]');
        this.synopsisInput = page.getByRole('textbox', { name: 'Sinopse' });
        this.companySelect = page.locator('#select_company_id').getByRole('textbox');
        this.releaseYearSelect = page.locator('#select_year').getByRole('textbox');
        this.seasonsInput = page.locator('input[name="seasons"]');
        this.featuredSwitch = page.locator('.featured .react-switch');
        this.coverInput = page.locator('input[name="cover"]');
        this.registerButton = page.getByRole('button', { name: 'Cadastrar' });
        this.searchInput = page.getByPlaceholder('Busque pelo nome');
        this.popup = new Popup(page);
        this.registerForm = page.locator('form');
        this.alert = page.locator('.alert');
    }

    async openRegisterForm(): Promise<void> {
        await this.registerLink.click();
        await expect(this.registerForm).toBeVisible();
    }

    async submitForm(): Promise<void> {
        await this.registerButton.click();
    }

    async verifyAlertMessage(message: string | string[]): Promise<void> {
        await expect(this.alert).toHaveText(message);
    }

    async removeTvshow(title: string): Promise<void> {
        const tvshowRow = this.page.getByRole('row').filter({ has: this.page.getByRole('cell', { name: title }) });
        await tvshowRow.getByRole('button').click();
        await this.page.locator('.confirm-removal').click();
    }

    async createTvshow(tvshow: TvshowData): Promise<void> {
        await this.titleInput.fill(tvshow.title);
        await this.synopsisInput.fill(tvshow.overview);
        await this.selectOption(this.companySelect, tvshow.company);
        await this.selectOption(this.releaseYearSelect, tvshow.releaseYear.toString());
        await this.seasonsInput.fill(tvshow.seasons.toString());

        if (tvshow.cover) {
            await this.coverInput.setInputFiles(`tests/support/fixtures${tvshow.cover}`);
        }

        if (tvshow.featured) {
            await this.featuredSwitch.click();
        }

        await this.submitForm();
    }

    async search(term: string): Promise<void> {
        await this.searchInput.fill(term);
        await this.searchInput.press('Enter');
    }

    async verifyTvshowsAreDisplayed(titles: string[]): Promise<void> {
        await expect(this.page.getByRole('row').locator('.title')).toContainText(titles);
    }

    private async selectOption(element: Locator, value: string): Promise<void> {
        await element.fill(value);
        await this.page.locator('[id*="option"]').filter({ hasText: value }).click();
    }

    async visit(): Promise<void> {
        await this.page.goto('/admin/tvshows');
    }
}
