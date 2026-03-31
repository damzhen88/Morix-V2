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
  
  console.log('1. Testing products page...');
  await page.goto('https://morix-crm-v2-mrbxmnwra-kritthk-9309s-projects.vercel.app/products');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Check URL and page state
  console.log('URL:', page.url());
  
  // Check for login modal
  const bodyText = await page.locator('body').textContent();
  const hasLogin = bodyText.includes('Continue with Email');
  const hasProducts = bodyText.includes('Products') || bodyText.includes('Product');
  const hasAdd = bodyText.includes('เพิ่ม') || bodyText.includes('Add') || bodyText.includes('+');
  
  console.log('Has login modal:', hasLogin);
  console.log('Has products text:', hasProducts);
  console.log('Has add button:', hasAdd);
  
  if (hasLogin) {
    console.log('\n⚠️ User needs to login first');
    console.log('Trying to find login form...');
    
    // Look for email input
    const emailInput = page.locator('input[type="email"], input[placeholder*="Email"], input[placeholder*="อีเมล"]').first();
    const hasEmailInput = await emailInput.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Has email input:', hasEmailInput);
  }
  
  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log('\n2. Found', buttons.length, 'buttons');
  for (const btn of buttons.slice(0, 15)) {
    const text = (await btn.textContent().catch(() => '')).trim();
    const isVisible = await btn.isVisible().catch(() => false);
    if (text && isVisible) {
      console.log(`  - "${text.substring(0, 50)}"`);
    }
  }
  
  // Check for modals/menus
  const modals = await page.locator('[class*="modal"], [class*="dialog"], [style*="fixed"][style*="inset: 0"]').all();
  console.log('\n3. Found', modals.length, 'modals/menus');
  
  // Log relevant console messages
  const relevantLogs = logs.filter(l => l.includes('Opening form') || l.includes('Closing form'));
  if (relevantLogs.length > 0) {
    console.log('\n4. Form context logs:', relevantLogs);
  }
  
  // Critical errors
  const criticalErrors = errors.filter(e => 
    !e.includes('vercel') && !e.includes('sentry') && !e.includes('Provider') && 
    !e.includes('401') && !e.includes('403') && !e.includes('429') &&
    !e.includes('GSI_LOGGER')
  );
  console.log('\n5. Critical errors:', criticalErrors.length > 0 ? criticalErrors : 'None');
  
  await browser.close();
})();
