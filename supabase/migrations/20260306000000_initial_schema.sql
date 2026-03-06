-- MORIX DECORATIVE CRM Database Schema
-- Version 2.0

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
create table users (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  name text not null,
  role text check (role in ('super_admin', 'admin', 'sales', 'warehouse', 'accounting')) default 'sales',
  email text,
  phone text,
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamptz default now()
);

-- ============================================
-- WAREHOUSES
-- ============================================
create table warehouses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- PRODUCTS
-- ============================================
create table products (
  id uuid default uuid_generate_v4() primary key,
  sku text unique not null,
  name_th text not null,
  name_en text,
  category text check (category in ('ASA', 'WPC', 'SPC', 'ACCESSORIES')) not null,
  unit text check (unit in ('piece', 'box', 'meter', 'sqm', 'set')) default 'sqm',
  spec_size text,
  spec_thickness text,
  spec_color text,
  spec_length text,
  wear_layer text,
  default_supplier text,
  reorder_point integer default 100,
  min_stock integer default 50,
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
create table product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  url text not null,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- INVENTORY
-- ============================================
create table inventory (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  warehouse_id uuid references warehouses(id),
  quantity_on_hand integer default 0,
  quantity_reserved integer default 0,
  quantity_available integer default 0,
  weighted_average_cost_thb numeric(12,2) default 0,
  last_movement_at timestamptz
);

-- ============================================
-- STOCK MOVEMENTS
-- ============================================
create table stock_movements (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  warehouse_id uuid references warehouses(id),
  type text check (type in ('IN', 'OUT', 'ADJUST')) not null,
  quantity integer not null,
  reference_type text,
  reference_id text,
  notes text,
  created_by text,
  created_at timestamptz default now()
);

-- ============================================
-- PURCHASE ORDERS (Import)
-- ============================================
create table purchase_orders (
  id uuid default uuid_generate_v4() primary key,
  po_number text unique not null,
  supplier text not null,
  currency text default 'CNY',
  exchange_rate numeric(10,4) default 5.12,
  status text check (status in ('draft', 'confirmed', 'received', 'cancelled')) default 'draft',
  total_cny numeric(12,2) default 0,
  total_thb numeric(12,2) default 0,
  landed_cost_total_thb numeric(12,2) default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PURCHASE ORDER ITEMS
-- ============================================
create table purchase_order_items (
  id uuid default uuid_generate_v4() primary key,
  purchase_order_id uuid references purchase_orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  unit_price_cny numeric(12,2) not null,
  total_cny numeric(12,2) not null
);

-- ============================================
-- SHIPMENT COSTS
-- ============================================
create table shipment_costs (
  id uuid default uuid_generate_v4() primary key,
  purchase_order_id uuid references purchase_orders(id) on delete cascade,
  description text not null,
  amount_cny numeric(12,2) not null,
  amount_thb numeric(12,2) not null,
  allocation_method text check (allocation_method in ('quantity', 'value', 'weight')) default 'value'
);

-- ============================================
-- CUSTOMERS
-- ============================================
create table customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  customer_type text check (customer_type in ('contractor', 'homeowner', 'dealer', 'project')),
  phone text,
  email text,
  address text,
  status text default 'active',
  created_at timestamptz default now()
);

-- ============================================
-- SALES ORDERS
-- ============================================
create table sales_orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_type text check (customer_type in ('contractor', 'homeowner', 'dealer', 'project')),
  status text check (status in ('draft', 'quoted', 'confirmed', 'delivered', 'closed', 'cancelled')) default 'draft',
  subtotal numeric(12,2) default 0,
  discount numeric(12,2) default 0,
  transport_cost numeric(12,2) default 0,
  labor_cost numeric(12,2) default 0,
  total numeric(12,2) default 0,
  product_cost_thb numeric(12,2) default 0,
  gross_profit numeric(12,2) default 0,
  net_profit numeric(12,2) default 0,
  payment_status text check (payment_status in ('unpaid', 'deposit', 'paid')) default 'unpaid',
  notes text,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- SALES ORDER ITEMS
-- ============================================
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  sales_order_id uuid references sales_orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  unit_price_thb numeric(12,2) not null,
  discount_percent numeric(5,2) default 0,
  total_thb numeric(12,2) not null,
  cost_thb numeric(12,2) default 0,
  profit_thb numeric(12,2) default 0
);

-- ============================================
-- ORDER IMAGES
-- ============================================
create table order_images (
  id uuid default uuid_generate_v4() primary key,
  sales_order_id uuid references sales_orders(id) on delete cascade,
  url text not null,
  type text check (type in ('product', 'packing', 'delivery', 'payment', 'site', 'other')),
  description text,
  created_at timestamptz default now()
);

-- ============================================
-- CRM DEALS
-- ============================================
create table crm_deals (
  id uuid default uuid_generate_v4() primary key,
  lead_id text unique not null,
  customer_name text not null,
  customer_type text check (customer_type in ('contractor', 'homeowner', 'dealer', 'project')),
  contact_phone text,
  contact_email text,
  deal_value numeric(12,2) default 0,
  stage text check (stage in ('inquiry', 'quoted', 'paid', 'shipped')) default 'inquiry',
  notes text,
  sales_order_id uuid references sales_orders(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_interaction_at timestamptz default now()
);

-- ============================================
-- EXPENSES
-- ============================================
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  category text check (category in ('warehouse_rent', 'salaries', 'packer_wages', 'marketing', 'utilities', 'office', 'transport', 'miscellaneous')) not null,
  amount_thb numeric(12,2) not null,
  vendor text,
  date date not null,
  is_recurring boolean default false,
  recurring_type text,
  attachment_url text,
  status text check (status in ('pending', 'approved', 'paid')) default 'pending',
  notes text,
  created_by text,
  created_at timestamptz default now()
);

-- ============================================
-- EXCHANGE RATES (History)
-- ============================================
create table exchange_rates (
  id uuid default uuid_generate_v4() primary key,
  from_currency text not null,
  to_currency text not null,
  rate numeric(10,4) not null,
  effective_date date not null,
  created_at timestamptz default now()
);

-- ============================================
-- AUDIT LOG
-- ============================================
create table audit_logs (
  id uuid default uuid_generate_v4() primary key,
  table_name text not null,
  record_id uuid not null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  changed_by text,
  created_at timestamptz default now()
);

-- ============================================
-- SEED DATA
-- ============================================

-- Default warehouse
insert into warehouses (id, name, location, is_default) 
values ('11111111-1111-1111-1111-111111111111', 'คลังสินค้าหลัก', 'กรุงเทพมหานคร', true);

-- Default user
insert into users (id, username, name, role, email, status)
values ('11111111-1111-1111-1111-111111111112', 'admin', 'Admin User', 'super_admin', 'admin@morix.co.th', 'active');

-- Sample products
insert into products (id, sku, name_th, name_en, category, unit, spec_size, spec_thickness, spec_color, reorder_point, min_stock, status, created_at, updated_at) values
('prod-001', 'ASA-DK-001', 'แผงวัสดุกันซึม ASA Decking สีเทา', 'ASA Decking Panel - Gray', 'ASA', 'sqm', '3.0m x 1.0m', '3mm', 'Gray', 500, 100, 'active', now(), now()),
('prod-002', 'ASA-DK-002', 'แผงวัสดุกันซึม ASA Decking สีขาว', 'ASA Decking Panel - White', 'ASA', 'sqm', '3.0m x 1.0m', '3mm', 'White', 500, 100, 'active', now(), now()),
('prod-003', 'WPC-DK-001', 'พื้น WPC Decking สีเทาเข้ม', 'WPC Decking - Dark Gray', 'WPC', 'sqm', '2.4m x 1.45m', '25mm', 'Dark Gray', 200, 50, 'active', now(), now()),
('prod-004', 'SPC-FL-001', 'พื้น SPC ลาย Oak ธรรมชาติ', 'SPC Flooring - Natural Oak', 'SPC', 'sqm', '1.2m x 0.18m', '5mm', 'Natural Oak', 1000, 200, 'active', now(), now()),
('prod-005', 'ACC-CL-001', 'คลิปยึด WPC สแตนเลส', 'WPC Clip - Stainless Steel', 'ACCESSORIES', 'piece', null, null, 'Silver', 5000, 1000, 'active', now(), now());

-- Sample customers
insert into customers (id, name, customer_type, phone, email, status, created_at) values
('cust-001', 'บริษัท รีโนเวท คอนสตรัคชั่น จำกัด', 'contractor', '02-123-4567', 'contact@renovate.co.th', 'active', now()),
('cust-002', 'คุณสมชาย ศรีสุข', 'homeowner', '089-123-4567', null, 'active', now()),
('cust-003', 'โครงการ The Palm Residence', 'project', '02-999-9999', 'info@palm.co.th', 'active', now());

-- Sample inventory
insert into inventory (id, product_id, warehouse_id, quantity_on_hand, quantity_available, weighted_average_cost_thb, last_movement_at)
select i.id, i.product_id, w.id, i.quantity_on_hand, i.quantity_on_hand, i.weighted_average_cost_thb, now()
from (
  select generate_series(1, 5) as idx, unnest(array[
    'prod-001', 'prod-002', 'prod-003', 'prod-004', 'prod-005'
  ]) as product_id, unnest(array[178, 218, 108, 618, 2500]) as quantity_on_hand, unnest(array[280, 280, 350, 220, 5]) as weighted_average_cost_thb
) i
cross join (select id from warehouses limit 1) w;

-- Sample exchange rate
insert into exchange_rates (from_currency, to_currency, rate, effective_date) values
('CNY', 'THB', 5.12, current_date);
