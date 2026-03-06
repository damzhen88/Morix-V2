// Core Types for MORIX DECORATIVE CRM v2

// =======================
// PRODUCT TYPES
// =======================

export type ProductCategory = 'ASA' | 'WPC' | 'SPC' | 'ACCESSORIES';
export type ProductUnit = 'sqm' | 'meter' | 'piece' | 'box' | 'set';
export type ProductStatus = 'active' | 'inactive';

export interface ProductSpec {
  size?: string;
  thickness?: string;
  color?: string;
  length?: string;
  wear_layer?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name_th: string;
  name_en?: string;
  category: ProductCategory;
  unit: ProductUnit;
  spec: ProductSpec;
  default_supplier?: string;
  
  // Cost & Pricing
  cost_cny?: number;        // ต้นทุนต่อหน่วย (หยวน)
  cost_thb?: number;        // ต้นทุนต่อหน่วย (บาท)
  price_thb?: number;       // ราคาขายต่อหน่วย
  
  // Stock
  reorder_point: number;
  min_stock: number;
  
  images: ProductImage[];
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

// =======================
// INVENTORY TYPES
// =======================

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  is_default: boolean;
}

export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_id: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reference_type?: 'purchase' | 'sale' | 'adjustment';
  reference_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  weighted_average_cost_thb: number;
  last_movement_at: string;
}

// =======================
// IMPORT/COST TYPES
// =======================

export interface PurchaseOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_cny: number;
  total_cny: number;
}

export interface ShipmentCost {
  id: string;
  description: string;
  amount_cny: number;
  amount_thb: number;
  allocation_method: 'quantity' | 'value' | 'weight';
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier: string;
  currency: 'CNY';
  exchange_rate: number;
  status: 'draft' | 'confirmed' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  shipment_costs: ShipmentCost[];
  total_cny: number;
  total_thb: number;
  landed_cost_total_thb: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// =======================
// SALES TYPES
// =======================

export type CustomerType = 'contractor' | 'homeowner' | 'dealer' | 'project';

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_thb: number;
  discount_percent: number;
  total_thb: number;
  cost_thb: number;
  profit_thb: number;
}

export interface OrderImage {
  id: string;
  url: string;
  type: 'product' | 'packing' | 'delivery' | 'payment' | 'site' | 'other';
  description?: string;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_type: CustomerType;
  status: 'draft' | 'quoted' | 'confirmed' | 'delivered' | 'closed' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  transport_cost: number;
  labor_cost: number;
  total: number;
  product_cost_thb: number;
  gross_profit: number;
  net_profit: number;
  payment_status: 'unpaid' | 'deposit' | 'paid';
  notes?: string;
  images: OrderImage[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// =======================
// CUSTOMER/CRM TYPES
// =======================

export type DealStage = 'inquiry' | 'quoted' | 'paid' | 'shipped';

export interface CRNDeal {
  id: string;
  lead_id: string;
  customer_name: string;
  customer_type: CustomerType;
  contact_phone?: string;
  contact_email?: string;
  deal_value: number;
  stage: DealStage;
  notes?: string;
  sales_order_id?: string;
  created_at: string;
  updated_at: string;
  last_interaction_at: string;
}

// =======================
// EXPENSE TYPES
// =======================

export type ExpenseCategory = 
  | 'warehouse_rent'
  | 'salaries'
  | 'packer_wages'
  | 'marketing'
  | 'utilities'
  | 'office'
  | 'transport'
  | 'miscellaneous';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount_thb: number;
  vendor?: string;
  date: string;
  is_recurring: boolean;
  recurring_type?: 'monthly' | 'quarterly' | 'yearly';
  attachment_url?: string;
  status: 'pending' | 'approved' | 'paid';
  notes?: string;
  created_by: string;
  created_at: string;
}

// =======================
// USER TYPES
// =======================

export type UserRole = 'super_admin' | 'admin' | 'sales' | 'warehouse' | 'accounting';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

// =======================
// DASHBOARD TYPES
// =======================

export interface DashboardKPIs {
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  inventoryValue: number;
  lowStockCount: number;
  pendingOrders: number;
  activeDeals: number;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  cogs: number;
  profit: number;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  profit: number;
  percentage: number;
}
