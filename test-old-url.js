const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Try old deployment
  const urls = [
    'https://morix-crm-v2.vercel.app/login',
    'https://morix-crm-v2-bk59h24ko-kritthk-9309s-projects.vercel.app/login',
    'https://morix-crm-v2-55hg48euy-kritthk-9309s-projects.vercel.app/login',
  ];
  
  for (const url of urls) {
    console.log(`\nTesting: ${url}`);
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    console.log('Is Vercel login:', finalUrl.includes('vercel.com/login'));
    
    if (!finalUrl.includes('vercel.com/login')) {
      const bodyText = await page.locator('body').textContent();
      console.log('Has Morix content:', bodyText.includes('MORIX') || bodyText.includes('Email'));
    }
  }
  
  await browser.close();
})();
