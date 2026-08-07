import { expect, Locator, Page } from '@playwright/test';
import { Popup } from './Popup';

export class Login {
    readonly loginForm: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly popup: Popup;
    readonly alert: Locator;
    readonly loggedUser: Locator;

    constructor(private readonly page: Page) {
        this.loginForm = page.locator('.login-form');
        this.emailInput = page.getByPlaceholder('E-mail');
        this.passwordInput = page.getByPlaceholder('Senha');
        this.loginButton = page.getByRole('button', { name: /entrar/i });
        this.popup = new Popup(page);
        this.alert = page.locator('[class$="alert"]');
        this.loggedUser = page.locator('.logged-user');
    }
    
    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
    
    async verifyAlertMessage(message: string | string[]): Promise<void> {
        await expect(this.alert).toHaveText(message);
    }

    async verifyUserIsLoggedIn(username: string): Promise<void> {
        await expect(this.loggedUser).toHaveText(`Olá, ${username}`);
    }
    
    async visit(): Promise<void> {
        await this.page.goto('/admin/login');
        await expect(this.loginForm).toBeVisible();
    }
}
