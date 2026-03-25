-- MORIX CRM V2 - Supabase Database Schema
-- Run this in Supabase SQL Editor: https://ltciqzjcnlrkgbcdnegt.supabase.co/project/default/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name_th TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL DEFAULT 'ACCESSORIES',
  unit TEXT NOT NULL DEFAULT 'piece',
  spec JSONB DEFAULT '{}',
  cost_cny NUMERIC(12,2),
  cost_thb NUMERIC(12,2),
  price_thb NUMERIC(12,2),
  default_supplier TEXT,
  reorder_point INTEGER DEFAULT 10,
  min_stock INTEGER DEFAULT 5,
  images JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WAREHOUSES
-- ============================================================
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_available INTEGER DEFAULT 0,
  weighted_average_cost_thb NUMERIC(12,2) DEFAULT 0,
  last_movement_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================
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

-- ============================================================
-- SUPPLIERS
-- ============================================================
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

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  customer_type TEXT DEFAULT 'dealer',
  tier TEXT DEFAULT 'silver',
  tax_id TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_arrival_date DATE,
  status TEXT DEFAULT 'pending',
  currency TEXT DEFAULT 'CNY',
  exchange_rate NUMERIC(10,4) DEFAULT 8.5,
  total_amount NUMERIC(14,2) DEFAULT 0,
  total_thb NUMERIC(14,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PURCHASE ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id TEXT,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price_cny NUMERIC(12,4),
  unit_price NUMERIC(12,4),
  total_cny NUMERIC(14,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SALES ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_type TEXT DEFAULT 'dealer',
  status TEXT DEFAULT 'draft',
  subtotal NUMERIC(14,2) DEFAULT 0,
  discount NUMERIC(14,2) DEFAULT 0,
  transport_cost NUMERIC(12,2) DEFAULT 0,
  labor_cost NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(14,2) DEFAULT 0,
  product_cost_thb NUMERIC(14,2) DEFAULT 0,
  profit_thb NUMERIC(14,2) DEFAULT 0,
  net_profit NUMERIC(14,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SALES ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id TEXT,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(12,2),
  total NUMERIC(14,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CRM DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead','qualified','proposal','negotiation','won','lost')),
  expected_value_thb NUMERIC(14,2) DEFAULT 0,
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_thb NUMERIC(14,2) NOT NULL,
  amount_currency NUMERIC(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  reference_po TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (for now)
CREATE POLICY "Allow authenticated" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON warehouses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON stock_movements FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON purchase_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON purchase_order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON sales_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON sales_order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON crm_deals FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated" ON expenses FOR ALL TO authenticated USING (true);

-- ============================================================
-- SEED DATA - Sample Products
-- ============================================================
INSERT INTO products (sku, name_th, category, unit, price_thb, cost_thb, reorder_point, min_stock, spec, status) VALUES
  ('HPL-SH-122', 'HPL Sheet 1220x2440mm', 'ASA', 'piece', 1400, 850, 20, 10, '{"size":"1220x2440mm","thickness":"0.8mm"}', 'active'),
  ('WPC-DK-014', 'WPC Decking Board 145x21mm', 'WPC', 'piece', 4200, 2800, 15, 5, '{"size":"145x21mm","length":"3m"}', 'active'),
  ('AL-PNL-001', 'Aluminum Panel 120x240cm', 'ASA', 'piece', 2850, 1700, 25, 10, '{"size":"120x240cm","thickness":"3mm"}', 'active'),
  ('CP-CLD-160', 'Composite Cladding Panel', 'WPC', 'piece', 950, 580, 30, 10, '{"size":"160x3600mm"}', 'active'),
  ('AL-TRM-025', 'Aluminum Trim Strip 2.5m', 'ACCESSORIES', 'piece', 380, 210, 50, 20, '{"size":"2.5m","width":"25mm"}', 'active')
ON CONFLICT (sku) DO NOTHING;

-- Seed default warehouse
INSERT INTO warehouses (name, location, is_default) VALUES
  ('Main Warehouse', 'Bangkok, Thailand', true),
  ('Chiang Mai Branch', 'Chiang Mai, Thailand', false)
ON CONFLICT DO NOTHING;
