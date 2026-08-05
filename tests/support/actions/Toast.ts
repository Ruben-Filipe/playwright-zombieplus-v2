import { expect, Locator, Page } from '@playwright/test';

export class Toast {
    readonly toast: Locator;

    constructor(private readonly page: Page) {
        this.toast = page.locator('.toast');
    }

    async verifyMessage(message: string): Promise<void> {
        await expect(this.toast).toContainText(message, { timeout: 2500 });
        await expect(this.toast).not.toBeVisible({ timeout: 6000 });
    }
}
