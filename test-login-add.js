const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'log') console.log('LOG:', msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
  
  console.log('1. Testing Login flow...');
  await page.goto('https://morix-crm-v2-bk59h24ko-kritthk-9309s-projects.vercel.app/login');
  await page.waitForLoadState('networkidle');
  
  // Check if login page has email input
  const emailInput = page.locator('input[type="email"], input[placeholder*="Email"], input[placeholder*="อีเมล"]');
  const passwordInput = page.locator('input[type="password"], input[placeholder*="Password"], input[placeholder*="รหัส"]');
  
  console.log('Email input visible:', await emailInput.isVisible({ timeout: 2000 }).catch(() => false));
  console.log('Password input visible:', await passwordInput.isVisible({ timeout: 2000 }).catch(() => false));
  
  // Check for email/password form
  const emailForm = page.locator('form').filter({ has: emailInput }).first();
  if (await emailForm.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('\n2. Found login form, attempting login...');
    
    // Try to login with test credentials
    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpassword123');
    
    // Find and click submit button
    const submitBtn = page.getByRole('button', { name: /login|sign in|เข้าสู่/i });
    if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await submitBtn.click();
      console.log('Clicked login button');
      await page.waitForTimeout(3000);
    }
    
    // Check URL
    console.log('Current URL:', page.url());
  }
  
  // Check if we're logged in
  console.log('\n3. Checking if logged in...');
  await page.goto('https://morix-crm-v2-bk59h24ko-kritthk-9309s-projects.vercel.app/products');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const pageContent = await page.locator('body').textContent();
  console.log('On products page:', pageContent.includes('Product') || pageContent.includes('สินค้า'));
  console.log('Has login buttons:', pageContent.includes('Continue with'));
  
  // Check errors
  const criticalErrors = errors.filter(e => 
    !e.includes('vercel') && !e.includes('sentry') && !e.includes('Provider') && 
    !e.includes('401') && !e.includes('403') && !e.includes('429')
  );
  console.log('\n4. Critical errors:', criticalErrors.length > 0 ? criticalErrors : 'None');
  
  await browser.close();
})();
