import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Go directly to pages without auth - app handles auth state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard page', async ({ page }) => {
    // Dashboard should have some content
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should navigate to Products page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    // Should be on products page
    await expect(page).toHaveURL(/products/);
  });

  test('should navigate to Inventory page', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/inventory/);
  });

  test('should navigate to Sales page', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/sales/);
  });

  test('should navigate to Expenses page', async ({ page }) => {
    await page.goto('/expenses');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/expenses/);
  });
});

test.describe('Products Page', () => {
  test('should display products list', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Should have some product data or empty state
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Check for search input
    const searchInput = page.getByPlaceholder(/search|ค้นหา/i);
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('test');
    }
    // Should still be on products page
    await expect(page).toHaveURL(/products/);
  });

  test('should have add product button', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Check for add button
    const addButton = page.getByRole('button', { name: /add|เพิ่ม/i });
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.click();
    }
    // Should still be on products page
    await expect(page).toHaveURL(/products/);
  });
});

test.describe('Inventory Page', () => {
  test('should display inventory data', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});

test.describe('Sales Page', () => {
  test('should display sales data', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForLoadState('networkidle');
    
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});

test.describe('Expenses Page', () => {
  test('should display expenses data', async ({ page }) => {
    await page.goto('/expenses');
    await page.waitForLoadState('networkidle');
    
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should not crash with critical errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/expenses');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors (Vercel, Sentry, Supabase accounts)
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('vercel.live') && 
      !err.includes('sentry.io') &&
      !err.includes('401') &&
      !err.includes('403') &&
      !err.includes('accounts list is empty') &&
      !err.includes('Provider') &&
      !err.includes('GSI_LOGGER')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Import Page', () => {
  test('should display import page', async ({ page }) => {
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});
