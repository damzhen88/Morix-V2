-- STEP 1: Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name_th TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ASA', 'WPC', 'SPC', 'ACCESSORIES')),
  unit TEXT NOT NULL DEFAULT 'piece',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Warehouses Table
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  email TEXT,
  province TEXT,
  customer_type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Sales Orders Table
CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  order_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  total_thb NUMERIC(10,2) NOT NULL,
  profit_thb NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 5: CRM Deals Table
CREATE TABLE crm_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  stage TEXT DEFAULT 'inquiry',
  expected_value_thb NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Expenses Table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_thb NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 7: Insert default warehouse
INSERT INTO warehouses (name, location, is_default) VALUES ('Main Warehouse', 'Bangkok', true);
