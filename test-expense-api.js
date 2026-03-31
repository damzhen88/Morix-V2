const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ltciqzjcnlrkgbcdnegt.supabase.co';
const supabaseKey = 'sb_publishable_NUj9Ylg4OE7hRYGDyCLV6w_k8s1gNjQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing expense insert with date...');
  
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      description: 'Test expense from API',
      category: 'logistics',
      date: '2026-03-27',
      amount_thb: 1000,
    })
    .select()
    .single();
    
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Success! Created expense:', data);
    
    // Clean up
    if (data?.id) {
      await supabase.from('expenses').delete().eq('id', data.id);
      console.log('Cleaned up test expense');
    }
  }
}

test();
