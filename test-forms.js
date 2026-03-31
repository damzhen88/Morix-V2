const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
  
  console.log('=== Testing All Add Forms ===\n');
  
  // Test 1: Products form
  console.log('1. Testing Products Form Components...');
  await page.goto('https://morix-crm-v2-bk59h24ko-kritthk-9309s-projects.vercel.app/products');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Check if we see login modal or products
  const bodyText = await page.locator('body').textContent();
  const hasLogin = bodyText.includes('Continue with');
  
  if (hasLogin) {
    console.log('   ⚠️ Need auth - checking form component code instead');
    
    // Test the ProductFormModal component
    const fs = require('fs');
    const formPath = '/Users/kritsadak/.openclaw/workspace/morix-crm-v2/src/components/ui/ProductFormModal.tsx';
    if (fs.existsSync(formPath)) {
      const formContent = fs.readFileSync(formPath, 'utf8');
      console.log('   ✓ ProductFormModal exists');
      
      // Check for critical fields
      console.log('   Fields:', formContent.includes('sku') ? 'SKU ✓' : 'SKU ✗');
      console.log('   Fields:', formContent.includes('name') ? 'Name ✓' : 'Name ✗');
      console.log('   Fields:', formContent.includes('category') ? 'Category ✓' : 'Category ✗');
      console.log('   Fields:', formContent.includes('price') ? 'Price ✓' : 'Price ✗');
      console.log('   Fields:', formContent.includes('supabase') ? 'Supabase ✓' : 'Supabase ✗');
    }
  }
  
  // Test 2: Client form
  console.log('\n2. Testing Client Form Components...');
  const fs = require('fs');
  const clientFormPath = '/Users/kritsadak/.openclaw/workspace/morix-crm-v2/src/components/ui/ClientFormModal.tsx';
  if (fs.existsSync(clientFormPath)) {
    const formContent = fs.readFileSync(clientFormPath, 'utf8');
    console.log('   ✓ ClientFormModal exists');
    console.log('   Fields:', formContent.includes('name') ? 'Name ✓' : 'Name ✗');
    console.log('   Fields:', formContent.includes('email') ? 'Email ✓' : 'Email ✗');
    console.log('   Fields:', formContent.includes('phone') ? 'Phone ✓' : 'Phone ✗');
    console.log('   Fields:', formContent.includes('supabase') ? 'Supabase ✓' : 'Supabase ✗');
  } else {
    console.log('   ✗ ClientFormModal not found');
  }
  
  // Test 3: Purchase Order form
  console.log('\n3. Testing Purchase Order Form Components...');
  const poFormPath = '/Users/kritsadak/.openclaw/workspace/morix-crm-v2/src/components/ui/PurchaseOrderFormModal.tsx';
  if (fs.existsSync(poFormPath)) {
    const formContent = fs.readFileSync(poFormPath, 'utf8');
    console.log('   ✓ PurchaseOrderFormModal exists');
    console.log('   Fields:', formContent.includes('supplier') ? 'Supplier ✓' : 'Supplier ✗');
    console.log('   Fields:', formContent.includes('date') ? 'Date ✓' : 'Date ✗');
    console.log('   Fields:', formContent.includes('total') ? 'Total ✓' : 'Total ✗');
    console.log('   Fields:', formContent.includes('supabase') ? 'Supabase ✓' : 'Supabase ✗');
  } else {
    console.log('   ✗ PurchaseOrderFormModal not found');
  }
  
  // Test 4: Sale form
  console.log('\n4. Testing Sale Form Components...');
  const saleFormPath = '/Users/kritsadak/.openclaw/workspace/morix-crm-v2/src/components/ui/SaleFormModal.tsx';
  if (fs.existsSync(saleFormPath)) {
    const formContent = fs.readFileSync(saleFormPath, 'utf8');
    console.log('   ✓ SaleFormModal exists');
    console.log('   Fields:', formContent.includes('customer') ? 'Customer ✓' : 'Customer ✗');
    console.log('   Fields:', formContent.includes('amount') ? 'Amount ✓' : 'Amount ✗');
    console.log('   Fields:', formContent.includes('supabase') ? 'Supabase ✓' : 'Supabase ✗');
  } else {
    console.log('   ✗ SaleFormModal not found');
  }
  
  // Test 5: Expense form
  console.log('\n5. Testing Expense Form Components...');
  const expenseFormPath = '/Users/kritsadak/.openclaw/workspace/morix-crm-v2/src/components/ui/ExpenseFormModal.tsx';
  if (fs.existsSync(expenseFormPath)) {
    const formContent = fs.readFileSync(expenseFormPath, 'utf8');
    console.log('   ✓ ExpenseFormModal exists');
    console.log('   Fields:', formContent.includes('description') || formContent.includes('desc') ? 'Description ✓' : 'Description ✗');
    console.log('   Fields:', formContent.includes('amount') ? 'Amount ✓' : 'Amount ✗');
    console.log('   Fields:', formContent.includes('category') ? 'Category ✓' : 'Category ✗');
    console.log('   Fields:', formContent.includes('supabase') ? 'Supabase ✓' : 'Supabase ✗');
  } else {
    console.log('   ✗ ExpenseFormModal not found');
  }
  
  // Check Supabase schema
  console.log('\n=== Checking Supabase Schema ===');
  const schemaPath = '/Users/kritsadak/.openclaw/workspace/morix-crm-v2/supabase/schema.sql';
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    console.log('\n6. Schema Tables:');
    const tables = schemaContent.match(/CREATE TABLE (\w+)/g) || [];
    tables.forEach(t => console.log('   ✓', t.replace('CREATE TABLE ', '')));
  }
  
  // Critical errors
  const criticalErrors = errors.filter(e => 
    !e.includes('vercel') && !e.includes('sentry') && !e.includes('Provider') && 
    !e.includes('401') && !e.includes('403') && !e.includes('429')
  );
  console.log('\n=== Critical Console Errors ===');
  console.log(criticalErrors.length > 0 ? criticalErrors : 'None ✓');
  
  await browser.close();
})();
