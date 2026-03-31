const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Testing login page directly...');
  await page.goto('https://morix-crm-v2-mrbxmnwra-kritthk-9309s-projects.vercel.app/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  
  const bodyText = await page.locator('body').textContent();
  console.log('Page contains "Email":', bodyText.includes('Email'));
  console.log('Page contains "Sign in":', bodyText.includes('Sign in') || bodyText.includes('เข้าสู่'));
  console.log('Page contains "MORIX":', bodyText.includes('MORIX'));
  
  // Check if we're on Vercel login or Morix login
  if (bodyText.includes('Continue with Email')) {
    console.log('\n⚠️ This is Vercel login page, not Morix login!');
    console.log('Redirect chain might be: Products -> Vercel Auth -> Vercel Login');
  } else if (bodyText.includes('Email')) {
    console.log('\n✅ This is Morix login page');
  }
  
  await browser.close();
})();
