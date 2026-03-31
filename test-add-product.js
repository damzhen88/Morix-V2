const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  
  console.log('Testing Products Add...');
  await page.goto('https://morix-crm-v2-bk59h24ko-kritthk-9309s-projects.vercel.app/products');
  await page.waitForLoadState('networkidle');
  
  // Try to find and click Add button
  const addButton = page.getByRole('button', { name: /เพิ่ม|add/i }).first();
  if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Found Add button, clicking...');
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Fill form if visible
    const modal = page.locator('[class*="modal"], [class*="dialog"]').first();
    if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Modal opened, trying to fill form...');
      
      // Try to fill SKU
      const skuInput = page.locator('input[placeholder*="SKU"], input[placeholder*="รหัส"]').first();
      if (await skuInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await skuInput.fill('TEST-' + Date.now());
        console.log('Filled SKU');
      }
      
      // Try to fill name
      const nameInput = page.locator('input[placeholder*="name"], input[placeholder*="ชื่อ"]').first();
      if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nameInput.fill('Test Product');
        console.log('Filled Name');
      }
      
      // Click save
      const saveBtn = page.getByRole('button', { name: /บันทึก|save/i }).first();
      if (await saveBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await saveBtn.click();
        console.log('Clicked Save');
        await page.waitForTimeout(2000);
      }
    }
  } else {
    console.log('Add button not found or visible');
  }
  
  // Check for critical errors
  const criticalErrors = errors.filter(e => 
    !e.includes('vercel') && !e.includes('sentry') && !e.includes('Provider')
  );
  
  console.log('\n--- Results ---');
  console.log('Errors:', criticalErrors.length > 0 ? criticalErrors : 'None');
  
  await browser.close();
})();
