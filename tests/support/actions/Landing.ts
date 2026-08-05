import { expect, Locator, Page } from '@playwright/test';
import { Toast } from './Toast';

export class Landing {
    readonly playButton: Locator;
    readonly leadDialogHeader: Locator;
    readonly nameInput: Locator;
    readonly emailInput: Locator;
    readonly submitButton: Locator;
    readonly toast: Toast;
    readonly alert: Locator;

    constructor(private readonly page: Page) {
        this.playButton = page.getByRole('button', { name: 'Aperte o play' });
        this.leadDialogHeader = page.getByRole('dialog').getByRole('heading');
        this.nameInput = page.getByPlaceholder('Informe seu nome');
        this.emailInput = page.getByPlaceholder('Informe seu email');
        this.submitButton = page.getByRole('button', { name: 'Quero entrar na fila!' });
        this.toast = new Toast(page);
        this.alert = page.locator('.alert');
    }

    async openLeadModal(): Promise<void> {
        await this.playButton.click();
        await expect(this.leadDialogHeader).toHaveText('Fila de espera');
    }

    async submitLeadForm(name: string, email: string): Promise<void> {
        await this.nameInput.fill(name);
        await this.emailInput.fill(email);
        await this.submitButton.click();
    }

    async verifyAlertMessage(message: string | string[]): Promise<void> {
        await expect(this.alert).toHaveText(message);
    }

    async visit(): Promise<void> {
        await this.page.goto('/');
    }
}
