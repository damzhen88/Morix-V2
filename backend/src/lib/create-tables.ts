import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ltciqzjcnlrkgbcdnegt.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0Y2lxempjbmxya2diY2RuZWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc5NzcyMiwiZXhwIjoyMDg4MzczNzIyfQ.0aw012tfNZLljQ5TaxNi5TQjIMde5rvSsRTLLK457wk';

const supabase = createClient(supabaseUrl, serviceKey);

async function createTables() {
  console.log('Creating tables...');
  
  // Try using pg-sql to execute raw SQL
  // Note: This may not work with standard PostgREST client
  
  // Let's check if there's a way
  const { data, error } = await supabase.from('products').select('*').limit(1);
  
  if (error && error.message.includes('does not exist')) {
    console.log('Tables do not exist yet. Need to create them manually.');
    console.log('Please run the SQL in Supabase SQL Editor.');
  } else {
    console.log('Tables exist or accessible');
  }
}

createTables().catch(console.error);
