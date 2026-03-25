import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ltciqzjcnlrkgbcdnegt.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0Y2lxempjbmxya2diY2RuZWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc5NzcyMiwiZXhwIjoyMDg4MzczNzIyfQ.0aw012tfNZLljQ5TaxNi5TQjIMde5rvSsRTLLK457wk';

const supabase = createClient(supabaseUrl, serviceKey);

// Use PostgREST to create tables - this is limited but let's try
async function createTables() {
  console.log('Attempting to create tables using REST API...');
  
  // The REST API can only create tables via special endpoint in some cases
  // Let's try using the schema endpoint
  
  const tables = [
    {
      name: 'products',
      columns: [
        { name: 'id', type: 'uuid', default: 'gen_random_uuid()', primary_key: true },
        { name: 'sku', type: 'text', unique: true, not_null: true },
        { name: 'name_th', type: 'text', not_null: true },
        { name: 'category', type: 'text', not_null: true },
        { name: 'unit', type: 'text', default: 'piece' },
        { name: 'status', type: 'text', default: 'active' },
        { name: 'created_at', type: 'timestamptz', default: 'now()' }
      ]
    }
  ];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table.name).select('*').limit(0);
      console.log(`Table ${table.name}:`, error?.message || 'exists');
    } catch (e: any) {
      console.log(`Table ${table.name}: Cannot create via REST API`);
    }
  }
}

createTables();
