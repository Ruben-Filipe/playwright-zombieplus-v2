import { expect, Locator, Page } from '@playwright/test';
import { Popup } from './Popup';
import { MovieData } from '../api';

export class Movies {
    readonly registerLink: Locator;
    readonly titleInput: Locator;
    readonly overviewInput: Locator;
    readonly companySelect: Locator;
    readonly releaseYearSelect: Locator;
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
        this.overviewInput = page.locator('textarea[name="overview"]');
        this.companySelect = page.locator('#select_company_id').getByRole('textbox');
        this.releaseYearSelect = page.locator('#select_year').getByRole('textbox');
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

    async removeMovie(title: string): Promise<void> {
        const movieRow = this.page.getByRole('row').filter({ has: this.page.getByRole('cell', { name: title }) });
        await movieRow.getByRole('button').click();
        await this.page.locator('.confirm-removal').click();
    }

    async createMovie(movie: MovieData): Promise<void> {
        await this.titleInput.fill(movie.title);
        await this.overviewInput.fill(movie.overview);
        await this.selectOption(this.companySelect, movie.company);
        await this.selectOption(this.releaseYearSelect, movie.releaseYear.toString());

        if (movie.cover) {
            await this.coverInput.setInputFiles(`tests/support/fixtures${movie.cover}`);
        }

        if (movie.featured) {
            await this.featuredSwitch.click();
        }

        await this.submitForm();
    }

    async search(term: string): Promise<void> {
        await this.searchInput.fill(term);
        await this.searchInput.press('Enter');
    }

    async verifyMoviesAreDisplayed(titles: string[]): Promise<void> {
        await expect(this.page.getByRole('row').locator('.title')).toHaveText(titles);
    }

    private async selectOption(element: Locator, value: string): Promise<void> {
        await element.fill(value);
        await this.page.locator('[id*="option"]').filter({ hasText: value }).click();
    }

    async visit(): Promise<void> {
        await this.page.goto('/admin/movies');
    }
}
