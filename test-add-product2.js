const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'log') logs.push(msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
  
  console.log('1. Testing Products page...');
  await page.goto('https://morix-crm-v2-bk59h24ko-kritthk-9309s-projects.vercel.app/products');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Get all buttons on page
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons`);
  for (const btn of buttons) {
    const text = await btn.textContent().catch(() => '');
    const classes = await btn.getAttribute('class').catch(() => '');
    if (text.trim()) console.log(`  Button: "${text.trim()}" class="${classes}"`);
  }
  
  // Check page content
  const bodyText = await page.locator('body').textContent();
  console.log('\n2. Checking page content...');
  console.log('Has Products:', bodyText.includes('Product'));
  console.log('Has Add:', bodyText.includes('เพิ่ม') || bodyText.includes('Add'));
  console.log('Has +:', bodyText.includes('+'));
  
  // Try clicking any "+" button
  const plusButtons = await page.locator('button').filter({ hasText: '+' }).all();
  console.log(`\n3. Found ${plusButtons.length} + buttons`);
  
  if (plusButtons.length > 0) {
    await plusButtons[0].click();
    console.log('Clicked + button');
    await page.waitForTimeout(2000);
    
    // Check if modal or menu appeared
    const menuText = await page.locator('body').textContent();
    console.log('Menu appeared:', menuText.includes('สินค้า') || menuText.includes('Product'));
  }
  
  // Check errors
  console.log('\n4. Console errors:', errors.filter(e => !e.includes('vercel') && !e.includes('sentry') && !e.includes('Provider') && !e.includes('401') && !e.includes('403')));
  
  await browser.close();
})();
