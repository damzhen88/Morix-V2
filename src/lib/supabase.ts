import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ltciqzjcnlrkgbcdnegt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_NUj9Ylg4OE7hRYGDyCLV6w_k8s1gNjQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Product {
  id: string;
  sku: string;
  name_th: string;
  name_en: string | null;
  category: string;
  unit: string;
  spec: Record<string, unknown>;
  default_supplier: string | null;
  cost_cny: number | null;
  cost_thb: number | null;
  price_thb: number | null;
  reorder_point: number;
  min_stock: number;
  images: { id: string; url: string; is_primary: boolean; created_at: string }[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  type: 'corporate' | 'individual';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  is_default: boolean;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  items: { product_id: string; quantity: number; unit_price_thb: number; cost_thb: number }[];
  total_thb: number;
  profit_thb: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier: string;
  order_date: string;
  status: 'pending' | 'shipped' | 'received' | 'cancelled';
  exchange_rate: number;
  items: { product_id: string; quantity: number; unit_price_cny: number }[];
  shipping_cny: number;
  shipping_thb: number;
  domestic_shipping_thb: number;
  total_thb: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmDeal {
  id: string;
  title: string;
  customer_id: string | null;
  stage: 'inquiry' | 'quoted' | 'negotiating' | 'won' | 'lost';
  value_thb: number;
  probability: number;
  expected_close: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount_thb: number;
  date: string;
  receipt_url: string | null;
  created_at: string;
}
