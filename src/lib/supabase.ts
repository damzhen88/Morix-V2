import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ltciqzjcnlrkgbcdnegt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
  images: unknown[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string | null;
  order_date: string;
  expected_arrival_date: string | null;
  status: string;
  currency: string;
  exchange_rate_thb: number;
  shipping_cny: number | null;
  shipping_thb: number | null;
  domestic_shipping_thb: number | null;
  other_costs_thb: number | null;
  notes: string | null;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string | null;
  order_date: string;
  status: string;
  total_thb: number;
  profit_thb: number;
  cost_thb: number | null;
  shipping_thb: number | null;
  created_at: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  province: string | null;
  customer_type: string;
  created_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CrmDeal {
  id: string;
  title: string;
  customer_id: string | null;
  stage: string;
  expected_value_thb: number | null;
  created_at: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount_thb: number;
  purchase_order_id: string | null;
  sales_order_id: string | null;
  created_at: string;
}

// API Functions
export const api = {
  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Product[];
  },

  async createProduct(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  // Customers
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Customer[];
  },

  async createCustomer(customer: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    if (error) throw error;
    return data as Customer;
  },

  // Warehouses
  async getWarehouses() {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Warehouse[];
  },

  // Purchase Orders
  async getPurchaseOrders() {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as PurchaseOrder[];
  },

  async createPurchaseOrder(order: Partial<PurchaseOrder>) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(order)
      .select()
      .single();
    if (error) throw error;
    return data as PurchaseOrder;
  },

  // Sales Orders
  async getSalesOrders() {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as SalesOrder[];
  },

  async createSalesOrder(order: Partial<SalesOrder>) {
    const { data, error } = await supabase
      .from('sales_orders')
      .insert(order)
      .select()
      .single();
    if (error) throw error;
    return data as SalesOrder;
  },

  // CRM Deals
  async getCrmDeals() {
    const { data, error } = await supabase
      .from('crm_deals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as CrmDeal[];
  },

  async createCrmDeal(deal: Partial<CrmDeal>) {
    const { data, error } = await supabase
      .from('crm_deals')
      .insert(deal)
      .select()
      .single();
    if (error) throw error;
    return data as CrmDeal;
  },

  async updateCrmDeal(id: string, deal: Partial<CrmDeal>) {
    const { data, error } = await supabase
      .from('crm_deals')
      .update(deal)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as CrmDeal;
  },

  // Expenses
  async getExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as Expense[];
  },

  async createExpense(expense: Partial<Expense>) {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    if (error) throw error;
    return data as Expense;
  },

  // Dashboard Stats
  async getDashboardStats() {
    const [products, customers, salesOrders, expenses, crmDeals] = await Promise.all([
      this.getProducts(),
      this.getCustomers(),
      this.getSalesOrders(),
      this.getExpenses(),
      this.getCrmDeals()
    ]);

    const totalRevenue = salesOrders.reduce((sum, o) => sum + (o.total_thb || 0), 0);
    const totalProfit = salesOrders.reduce((sum, o) => sum + (o.profit_thb || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount_thb || 0), 0);
    const netProfit = totalProfit - totalExpenses;

    const pipelineValue = crmDeals.reduce((sum, d) => sum + (d.expected_value_thb || 0), 0);
    const wonDeals = crmDeals.filter(d => d.stage === 'won').length;
    const activeDeals = crmDeals.filter(d => !['won', 'lost'].includes(d.stage)).length;

    return {
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalRevenue,
      totalProfit,
      totalExpenses,
      netProfit,
      pipelineValue,
      wonDeals,
      activeDeals,
      totalOrders: salesOrders.length
    };
  }
};

export default api;
