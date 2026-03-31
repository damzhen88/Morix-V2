import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Export data as JSON (client will convert to Excel)
// Requires authentication via Supabase auth token

export async function GET(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - missing or invalid auth token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    // Create Supabase client with auth
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'products';
    const format = searchParams.get('format') || 'json';

    // Validate type
    const allowedTypes = ['products', 'expenses', 'sales', 'customers'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Allowed: products, expenses, sales, customers' }, { status: 400 });
    }

    // Fetch data (user can only see their own data via RLS)
    let data: any[] = [];

    switch (type) {
      case 'products':
        const products = await supabase.from('products').select('*').order('created_at', { ascending: false });
        data = products.data || [];
        break;
      case 'expenses':
        const expenses = await supabase.from('expenses').select('*').order('date', { ascending: false });
        data = expenses.data || [];
        break;
      case 'sales':
        const sales = await supabase.from('sales').select('*').order('created_at', { ascending: false });
        data = sales.data || [];
        break;
      case 'customers':
        const customers = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        data = customers.data || [];
        break;
    }

    // Return JSON data for client-side Excel generation
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: data,
        type: type,
        count: data.length,
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ 
      error: 'Export failed',
      details: error.message 
    }, { status: 500 });
  }
}
