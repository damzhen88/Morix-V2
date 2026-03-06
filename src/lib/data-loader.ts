// Data loader for MORIX CRM - connects to Supabase
import api, { Product, Customer, Warehouse, SalesOrder, CrmDeal, Expense } from '@/lib/supabase';
import { Product as LocalProduct, Customer as LocalCustomer, Warehouse as LocalWarehouse, SalesOrder as LocalSalesOrder, CRNDeal as LocalCRNDeal, Expense as LocalExpense, Inventory, StockMovement } from '@/types';

// Transform Supabase data to local format
function transformProduct(p: Product): LocalProduct {
  return {
    id: p.id,
    sku: p.sku,
    name_th: p.name_th,
    name_en: p.name_en || undefined,
    category: p.category as LocalProduct['category'],
    unit: p.unit as LocalProduct['unit'],
    spec: p.spec as LocalProduct['spec'],
    default_supplier: p.default_supplier || undefined,
    reorder_point: p.reorder_point,
    min_stock: p.min_stock,
    images: p.images as LocalProduct['images'],
    status: p.status as LocalProduct['status'],
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

function transformCustomer(c: Customer): LocalCustomer {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    company_name: c.company_name || undefined,
    phone: c.phone || undefined,
    email: c.email || undefined,
    address: undefined,
    district: undefined,
    province: c.province || undefined,
    postal_code: undefined,
    tax_id: undefined,
    customer_type: c.customer_type as LocalCustomer['customer_type'],
    credit_limit: 0,
    notes: undefined,
    created_at: c.created_at,
    updated_at: c.created_at,
  };
}

function transformWarehouse(w: Warehouse): LocalWarehouse {
  return {
    id: w.id,
    name: w.name,
    location: w.location || undefined,
    is_default: w.is_default,
  };
}

function transformSalesOrder(s: SalesOrder): LocalSalesOrder {
  return {
    id: s.id,
    order_number: s.order_number,
    customer_id: s.customer_id,
    order_date: s.order_date,
    status: s.status as LocalSalesOrder['status'],
    subtotal_thb: s.total_thb,
    discount_thb: 0,
    discount_percent: 0,
    vat_thb: 0,
    total_thb: s.total_thb,
    profit_thb: s.profit_thb,
    payment_status: 'unpaid',
    payment_method: undefined,
    notes: undefined,
    created_by: undefined,
    created_at: s.created_at,
    updated_at: s.created_at,
  };
}

function transformCrmDeal(c: CrmDeal): LocalCRNDeal {
  return {
    id: c.id,
    title: c.title,
    customer_id: c.customer_id || undefined,
    contact_name: undefined,
    contact_phone: undefined,
    contact_email: undefined,
    stage: c.stage as LocalCRNDeal['stage'],
    probability: 10,
    expected_value_thb: c.expected_value_thb || 0,
    actual_value_thb: undefined,
    lost_reason: undefined,
    notes: undefined,
    assigned_to: undefined,
    created_by: undefined,
    created_at: c.created_at,
    updated_at: c.created_at,
    closed_at: undefined,
  };
}

function transformExpense(e: Expense): LocalExpense {
  return {
    id: e.id,
    date: e.date,
    category: e.category as LocalExpense['category'],
    description: e.description,
    amount_thb: e.amount_thb,
    vat_included: false,
    vat_amount_thb: 0,
    reference_number: undefined,
    receipt_url: undefined,
    notes: undefined,
    created_by: undefined,
    created_at: e.created_at,
  };
}

// Load all data from Supabase
export async function loadAllData() {
  try {
    const [products, customers, warehouses, salesOrders, crmDeals, expenses] = await Promise.all([
      api.getProducts(),
      api.getCustomers(),
      api.getWarehouses(),
      api.getSalesOrders(),
      api.getCrmDeals(),
      api.getExpenses(),
    ]);

    return {
      products: products.map(transformProduct),
      customers: customers.map(transformCustomer),
      warehouses: warehouses.map(transformWarehouse),
      salesOrders: salesOrders.map(transformSalesOrder),
      crmDeals: crmDeals.map(transformCrmDeal),
      expenses: expenses.map(transformExpense),
      inventory: [] as Inventory[],
      stockMovements: [] as StockMovement[],
      purchaseOrders: [] as any[],
    };
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    throw error;
  }
}

export default loadAllData;
