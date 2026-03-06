-- MORIX CRM V2 - Supabase Database Setup
-- Copy and run this in Supabase SQL Editor

-- ========================
-- STEP 1: Enable UUID
-- ========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- STEP 2: Create Tables
-- ========================

-- Products Table
CREATE TABLE products (
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
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouses Table
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE inventory (
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

-- Suppliers Table
CREATE TABLE suppliers (
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
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  order_date DATE NOT NULL,
  expected_arrival_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
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
CREATE TABLE purchase_order_items (
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
CREATE TABLE customers (
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
  customer_type TEXT DEFAULT 'general',
  credit_limit NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Orders Table
CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  order_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal_thb NUMERIC(10,2) NOT NULL,
  discount_thb NUMERIC(10,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  vat_thb NUMERIC(10,2) DEFAULT 0,
  total_thb NUMERIC(10,2) NOT NULL,
  profit_thb NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  payment_method TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Order Items Table
CREATE TABLE sales_order_items (
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
CREATE TABLE crm_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  stage TEXT NOT NULL DEFAULT 'inquiry',
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
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  category TEXT NOT NULL,
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

-- ========================
-- STEP 3: Seed Data
-- ========================

-- Insert default warehouse
INSERT INTO warehouses (name, location, is_default) 
VALUES ('Main Warehouse', 'Bangkok', true)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (sku, name_th, name_en, category, unit, default_supplier, reorder_point, min_stock, status) VALUES
('ASA-001', 'ASA Flooring Premium', 'ASA Premium Flooring', 'ASA', 'sqm', 'China Supplier A', 50, 20, 'active'),
('ASA-002', 'ASA Flooring Standard', 'ASA Standard Flooring', 'ASA', 'sqm', 'China Supplier A', 50, 20, 'active'),
('WPC-001', 'WPC Decking Classic', 'WPC Classic Decking', 'WPC', 'sqm', 'China Supplier B', 30, 10, 'active'),
('WPC-002', 'WPC Decking Premium', 'WPC Premium Decking', 'WPC', 'sqm', 'China Supplier B', 30, 10, 'active'),
('SPC-001', 'SPC Flooring Oak', 'SPC Oak Flooring', 'SPC', 'sqm', 'China Supplier C', 100, 50, 'active'),
('SPC-002', 'SPC Flooring Walnut', 'SPC Walnut Flooring', 'SPC', 'sqm', 'China Supplier C', 100, 50, 'active'),
('ACC-001', 'Plastic Edge Strip', 'Plastic Edge Strip', 'ACCESSORIES', 'piece', 'China Supplier A', 200, 100, 'active'),
('ACC-002', 'Aluminum Profile', 'Aluminum Profile', 'ACCESSORIES', 'meter', 'China Supplier B', 100, 50, 'active')
ON CONFLICT (sku) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (code, name, company_name, phone, email, province, customer_type) VALUES
('CUST-001', 'สมชาย วงศ์สกุล', 'บริษัท ก่อสร้าง จำกัด', '089-123-4567', 'somchai@construction.co.th', 'กรุงเทพฯ', 'contractor'),
('CUST-002', 'สมศักดิ์ รักษา', 'หจก. ออกแบบภายใน', '086-987-6543', 'somsak@interior.th', 'เชียงใหม่', 'general'),
('CUST-003', 'พิชญา สุขสันติ', 'บริษัท พิชญา ดีเวลล็อปเมนต์', '081-456-7890', 'pichaya@pd.co.th', 'ชลบุรี', 'vip')
ON CONFLICT (code) DO NOTHING;

-- Insert sample inventory
INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_available, weighted_average_cost_thb)
SELECT p.id, w.id, 100, 100, 150
FROM products p, warehouses w
WHERE p.status = 'active' AND w.is_default = true
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

SELECT '🎉 Database setup complete!' as result;
