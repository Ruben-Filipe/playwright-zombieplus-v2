import { expect, Locator, Page } from '@playwright/test';

export class Popup {
    readonly popup: Locator;

    constructor(private readonly page: Page) {
        this.popup = page.locator('.swal2-html-container');
    }

    async verifyMessage(message: string): Promise<void> {
        await expect(this.popup).toHaveText(message);
    }
}
