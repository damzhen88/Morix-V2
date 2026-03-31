import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly productsLink: Locator;
  readonly inventoryLink: Locator;
  readonly salesLink: Locator;
  readonly clientsLink: Locator;
  readonly expensesLink: Locator;
  readonly settingsLink: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use aria-label or title for better matching
    this.productsLink = page.locator('a[href="/products"]');
    this.inventoryLink = page.locator('a[href="/inventory"]');
    this.salesLink = page.locator('a[href="/sales"]');
    this.clientsLink = page.locator('a[href="/crm"]');
    this.expensesLink = page.locator('a[href="/expenses"]');
    this.settingsLink = page.locator('a[href="/settings"]');
    this.userMenu = page.locator('[class*="user"], button[class*="user"]').first();
    this.logoutButton = page.getByRole('menuitem', { name: /logout|sign out/i }).first();
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToProducts() {
    await this.productsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToInventory() {
    await this.inventoryLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToSales() {
    await this.salesLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToExpenses() {
    await this.expensesLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }
}
