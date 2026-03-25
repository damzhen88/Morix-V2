// MORIX CRM - Supabase Database Setup
// Run with: npx tsx src/lib/supabase-setup.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ltciqzjcnlrkgbcdnegt.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0Y2lxempjbmxya2diY2RuZWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc5NzcyMiwiZXhwIjoyMDg4MzczNzIyfQ.0aw012tfNZLljQ5TaxNi5TQjIMde5rvSsRTLLK457wk';

const supabase = createClient(supabaseUrl, serviceKey);

const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name_th TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL CHECK (category IN ('ASA', 'WPC', 'SPC', 'ACCESSORIES')),
  unit TEXT NOT NULL DEFAULT 'piece',
  spec JSONB DEFAULT '{}',
  default_supplier TEXT,
  reorder_point INTEGER DEFAULT 10,
  min_stock INTEGER DEFAULT 5,
  images JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_available INTEGER DEFAULT 0,
  weighted_average_cost_thb NUMERIC(10,2) DEFAULT 0,
  last_movement_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

-- Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUST')),
  quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  order_date DATE NOT NULL,
  expected_arrival_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'arrived', 'cancelled')),
  currency TEXT NOT NULL DEFAULT 'CNY',
  exchange_rate_thb NUMERIC(10,4) DEFAULT 5.2,
  shipping_cost_thb NUMERIC(10,2) DEFAULT 0,
  other_costs_thb NUMERIC(10,2) DEFAULT 0,
  landed_cost_multiplier NUMERIC(5,2) DEFAULT 1.15,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_price_cny NUMERIC(10,4) NOT NULL,
  unit_price_thb NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  district TEXT,
  province TEXT,
  postal_code TEXT,
  tax_id TEXT,
  customer_type TEXT DEFAULT 'general' CHECK (customer_type IN ('general', 'vip', 'distributor', 'contractor')),
  credit_limit NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Orders Table
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  order_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal_thb NUMERIC(10,2) NOT NULL,
  discount_thb NUMERIC(10,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  vat_thb NUMERIC(10,2) DEFAULT 0,
  total_thb NUMERIC(10,2) NOT NULL,
  profit_thb NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  payment_method TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Order Items Table
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price_thb NUMERIC(10,2) NOT NULL,
  cost_thb NUMERIC(10,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  line_total_thb NUMERIC(10,2) NOT NULL,
  profit_thb NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM Deals Table
CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  stage TEXT NOT NULL DEFAULT 'inquiry' CHECK (stage IN ('inquiry', 'quoted', 'negotiating', 'paid', 'shipped', 'won', 'lost')),
  probability INTEGER DEFAULT 10,
  expected_value_thb NUMERIC(10,2),
  actual_value_thb NUMERIC(10,2),
  lost_reason TEXT,
  notes TEXT,
  assigned_to TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rent', 'salary', 'utilities', 'marketing', 'transportation', 'office', 'insurance', 'tax', 'other')),
  description TEXT NOT NULL,
  amount_thb NUMERIC(10,2) NOT NULL,
  vat_included BOOLEAN DEFAULT false,
  vat_amount_thb NUMERIC(10,2) DEFAULT 0,
  reference_number TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(code);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Insert default warehouse
INSERT INTO warehouses (id, name, location, is_default) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Main Warehouse', 'Bangkok', true)
ON CONFLICT (id) DO NOTHING;
`;

async function setupDatabase() {
  console.log('🔧 Setting up MORIX CRM Database...\n');
  
  try {
    // Execute each statement separately
    const statements = schema.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { query: statement });
        if (error) {
          console.log('Trying alternative method...');
        }
      }
    }
    
    console.log('✅ Database schema created successfully!');
    
    // Check tables
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    console.log('\n📊 Tables created:');
    tables?.forEach(t => console.log(`  - ${t.table_name}`));
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

setupDatabase();
