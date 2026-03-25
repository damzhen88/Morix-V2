// State Management for MORIX CRM v2
// Using React Context + useReducer for global state
// NOW WITH SUPABASE SYNC

'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { 
  Product, Inventory, StockMovement, PurchaseOrder, SalesOrder,
  CRNDeal, Expense, Warehouse, User, DashboardKPIs, MonthlyTrend
} from '@/types';
import { api, Product as SupabaseProduct, Customer, Warehouse as SupabaseWarehouse, SalesOrder as SupabaseSalesOrder, CrmDeal, Expense as SupabaseExpense, PurchaseOrder as SupabasePurchaseOrder } from '@/lib/supabase';

interface AppState {
  products: Product[];
  inventory: Inventory[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  crmDeals: CRNDeal[];
  expenses: Expense[];
  warehouses: Warehouse[];
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  kpis: DashboardKPIs;
  trends: MonthlyTrend[];
}

type AppAction =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_INVENTORY'; payload: Inventory }
  | { type: 'UPDATE_INVENTORY'; payload: Inventory }
  | { type: 'ADD_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'UPDATE_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'ADD_SALES_ORDER'; payload: SalesOrder }
  | { type: 'UPDATE_SALES_ORDER'; payload: SalesOrder }
  | { type: 'DELETE_SALES_ORDER'; payload: string }
  | { type: 'ADD_CRM_DEAL'; payload: CRNDeal }
  | { type: 'UPDATE_CRM_DEAL'; payload: CRNDeal }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null };

const initialState: AppState = {
  products: [],
  inventory: [],
  stockMovements: [],
  purchaseOrders: [],
  salesOrders: [],
  crmDeals: [],
  expenses: [],
  warehouses: [],
  users: [],
  currentUser: null,
  isLoading: true,
  error: null,
  kpis: { totalRevenue: 0, totalCOGS: 0, grossProfit: 0, netProfit: 0, profitMargin: 0, inventoryValue: 0, lowStockCount: 0, pendingOrders: 0, activeDeals: 0 },
  trends: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'ADD_INVENTORY':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_INVENTORY':
      return { ...state, inventory: state.inventory.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'ADD_PURCHASE_ORDER':
      return { ...state, purchaseOrders: [...state.purchaseOrders, action.payload] };
    case 'UPDATE_PURCHASE_ORDER':
      return { ...state, purchaseOrders: state.purchaseOrders.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'ADD_SALES_ORDER':
      return { ...state, salesOrders: [...state.salesOrders, action.payload] };
    case 'UPDATE_SALES_ORDER':
      return { ...state, salesOrders: state.salesOrders.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'DELETE_SALES_ORDER':
      return { ...state, salesOrders: state.salesOrders.filter(o => o.id !== action.payload) };
    case 'ADD_CRM_DEAL':
      return { ...state, crmDeals: [...state.crmDeals, action.payload] };
    case 'UPDATE_CRM_DEAL':
      return { ...state, crmDeals: state.crmDeals.map(d => d.id === action.payload.id ? action.payload : d) };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    default:
      return state;
  }
}

// Transform Supabase Product to local Product
function transformProduct(p: SupabaseProduct): Product {
  const images = Array.isArray(p.images) ? p.images as any[] : [];
  return {
    id: p.id,
    sku: p.sku,
    name_th: p.name_th,
    name_en: p.name_en || undefined,
    category: p.category as Product['category'],
    unit: p.unit as Product['unit'],
    spec: p.spec as Product['spec'],
    default_supplier: p.default_supplier || undefined,
    reorder_point: p.reorder_point || 10,
    min_stock: p.min_stock || 5,
    cost_cny: (p as any).cost_cny,
    cost_thb: (p as any).cost_thb,
    price_thb: (p as any).price_thb || 0,
    images: images,
    status: p.status as Product['status'],
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

// Transform Supabase Customer to local format (for CRM)
function transformCustomerToDeal(c: any): CRNDeal {
  return {
    id: c.id,
    lead_id: c.code || `LEAD-${c.id.slice(0, 6)}`,
    customer_name: c.name,
    customer_type: (c.customer_type || 'homeowner') as CRNDeal['customer_type'],
    contact_phone: c.phone || undefined,
    contact_email: c.email || undefined,
    deal_value: 0,
    stage: 'inquiry' as CRNDeal['stage'],
    notes: '',
    created_at: c.created_at,
    updated_at: c.created_at,
    last_interaction_at: c.created_at,
  };
}

// Transform Supabase Warehouse to local Warehouse
function transformWarehouse(w: SupabaseWarehouse): Warehouse {
  return {
    id: w.id,
    name: w.name,
    location: w.location || undefined,
    is_default: w.is_default,
    created_at: w.created_at,
  };
}

// Transform Supabase SalesOrder to local SalesOrder
function transformSalesOrder(s: SupabaseSalesOrder): SalesOrder {
  return {
    id: s.id,
    order_number: s.order_number,
    customer_id: s.customer_id || '',
    customer_name: '',
    customer_type: 'homeowner' as SalesOrder['customer_type'],
    status: s.status as SalesOrder['status'],
    items: [],
    subtotal: s.total_thb || 0,
    discount: 0,
    transport_cost: s.shipping_thb || 0,
    labor_cost: 0,
    total: s.total_thb || 0,
    product_cost_thb: s.cost_thb || 0,
    gross_profit: s.profit_thb || 0,
    net_profit: s.profit_thb || 0,
    payment_status: (s.status === 'delivered' ? 'paid' : 'unpaid') as SalesOrder['payment_status'],
    notes: undefined,
    images: [],
    created_by: 'system',
    created_at: s.created_at,
    updated_at: s.created_at,
  };
}

// Transform Supabase CRM Deal to local CRNDeal
function transformCrmDeal(d: CrmDeal): CRNDeal {
  return {
    id: d.id,
    lead_id: `DEAL-${d.id.slice(0, 6)}`,
    customer_name: '',
    customer_type: 'homeowner' as CRNDeal['customer_type'],
    stage: d.stage as CRNDeal['stage'],
    expected_value_thb: d.expected_value_thb || 0,
    deal_value: d.expected_value_thb || 0,
    notes: '',
    created_at: d.created_at,
    updated_at: d.created_at,
    last_interaction_at: d.created_at,
  };
}

// Transform Supabase Expense to local Expense
function transformExpense(e: SupabaseExpense): Expense {
  return {
    id: e.id,
    date: e.date,
    category: e.category as Expense['category'],
    description: e.description,
    amount_thb: e.amount_thb,
    vendor: undefined,
    is_recurring: false,
    status: 'approved' as Expense['status'],
    notes: e.notes || undefined,
    created_by: 'system',
    created_at: e.created_at,
  };
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        console.log('🔄 Loading data from Supabase...');
        
        const [products, customers, warehouses, salesOrders, crmDeals, expenses, purchaseOrders] = await Promise.all([
          api.getProducts().catch(e => { console.error('Products error:', e); return []; }),
          api.getCustomers().catch(e => { console.error('Customers error:', e); return []; }),
          api.getWarehouses().catch(e => { console.error('Warehouses error:', e); return []; }),
          api.getSalesOrders().catch(e => { console.error('SalesOrders error:', e); return []; }),
          api.getCrmDeals().catch(e => { console.error('CrmDeals error:', e); return []; }),
          api.getExpenses().catch(e => { console.error('Expenses error:', e); return []; }),
          api.getPurchaseOrders().catch(e => { console.error('PurchaseOrders error:', e); return []; }),
        ]);

        console.log(`✅ Loaded: ${products.length} products, ${customers.length} customers, ${warehouses.length} warehouses, ${purchaseOrders.length} purchase orders`);

        dispatch({
          type: 'SET_STATE',
          payload: {
            products: products.map(transformProduct),
            warehouses: warehouses.map(transformWarehouse),
            salesOrders: salesOrders.map(transformSalesOrder),
            crmDeals: [...crmDeals.map(transformCrmDeal), ...customers.map(transformCustomerToDeal)],
            expenses: expenses.map(transformExpense),
            purchaseOrders: purchaseOrders.map((po: any) => ({
              id: po.id,
              po_number: po.po_number,
              supplier_id: po.supplier_id,
              order_date: po.order_date,
              expected_arrival_date: po.expected_arrival_date,
              status: po.status,
              currency: po.currency || 'CNY',
              exchange_rate_thb: po.exchange_rate_thb || 5.12,
              shipping_cny: po.shipping_cny || 0,
              shipping_thb: po.shipping_thb || 0,
              domestic_shipping_thb: po.domestic_shipping_thb || 0,
              other_costs_thb: po.other_costs_thb || 0,
              notes: po.notes,
              items: [],
              total_cny: po.shipping_cny || 0, // Add default value
              total_thb: (po.shipping_cny || 0) * (po.exchange_rate_thb || 5.12), // Add default value
              created_at: po.created_at,
            })),
            inventory: [],
            isLoading: false,
            error: null,
          }
        });
      } catch (error) {
        console.error('❌ Error loading data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data from database' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    loadData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export function useKPIs() {
  const { state } = useApp();
  
  const confirmedOrders = state.salesOrders.filter(o => 
    ['confirmed', 'delivered', 'closed'].includes(o.status)
  );
  
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalCOGS = confirmedOrders.reduce((sum, o) => sum + (o.product_cost_thb || 0), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = confirmedOrders.reduce((sum, o) => sum + (o.net_profit || 0), 0);
  
  const inventoryValue = state.inventory.length > 0 
    ? state.inventory.reduce((sum, inv) => 
        sum + ((inv.quantity_on_hand || 0) * (inv.weighted_average_cost_thb || 0)), 0
      )
    : state.products.reduce((sum, p) => sum + ((p.reorder_point || 0) * 100), 0); // Estimate from products if no inventory data
  
  const lowStockCount = state.products.filter(p => p.status === 'active').filter(p => {
    const inv = state.inventory.find(i => i.product_id === p.id);
    return inv && (inv.quantity_on_hand || 0) < p.reorder_point;
  }).length;
  
  const pendingOrders = state.salesOrders.filter(o => 
    ['quoted', 'confirmed'].includes(o.status)
  ).length;
  
  const activeDeals = state.crmDeals.filter(d => 
    ['inquiry', 'quoted'].includes(d.stage)
  ).length;

  return {
    totalRevenue,
    totalCOGS,
    grossProfit,
    netProfit,
    profitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
    inventoryValue,
    lowStockCount,
    pendingOrders,
    activeDeals,
  };
}
