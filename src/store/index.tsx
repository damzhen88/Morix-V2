// State Management for MORIX CRM v2
// Using React Context + useReducer for global state

'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { 
  Product, Inventory, StockMovement, PurchaseOrder, SalesOrder,
  CRNDeal, Expense, Warehouse, User, DashboardKPIs, MonthlyTrend
} from '@/types';
import api, { Product as SupabaseProduct, Customer, Warehouse as SupabaseWarehouse, SalesOrder as SupabaseSalesOrder, CrmDeal, Expense as SupabaseExpense } from '@/lib/supabase';

// =======================
// STATE TYPES
// =======================

interface AppState {
  // Data
  products: Product[];
  inventory: Inventory[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  crmDeals: CRNDeal[];
  expenses: Expense[];
  warehouses: Warehouse[];
  users: User[];
  
  // UI State
  currentUser: User | null;
  isLoading: boolean;
  
  // Computed
  kpis: DashboardKPIs;
  trends: MonthlyTrend[];
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INIT_DATA'; payload: Partial<AppState> }
  // Products
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  // Inventory
  | { type: 'ADD_STOCK_MOVEMENT'; payload: StockMovement }
  | { type: 'UPDATE_INVENTORY'; payload: Inventory }
  // Purchase Orders
  | { type: 'ADD_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'UPDATE_PURCHASE_ORDER'; payload: PurchaseOrder }
  // Sales Orders
  | { type: 'ADD_SALES_ORDER'; payload: SalesOrder }
  | { type: 'UPDATE_SALES_ORDER'; payload: SalesOrder }
  | { type: 'DELETE_SALES_ORDER'; payload: string }
  // CRM
  | { type: 'ADD_CRM_DEAL'; payload: CRNDeal }
  | { type: 'UPDATE_CRM_DEAL'; payload: CRNDeal }
  | { type: 'DELETE_CRM_DEAL'; payload: string }
  // Expenses
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string };

// =======================
// INITIAL STATE
// =======================

function calculateKPIs(state: AppState): DashboardKPIs {
  const confirmedOrders = state.salesOrders.filter(o => 
    ['confirmed', 'delivered', 'closed'].includes(o.status)
  );
  
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.total_thb || 0), 0);
  const totalCOGS = confirmedOrders.reduce((sum, o) => sum + (o.cost_thb || 0), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = confirmedOrders.reduce((sum, o) => sum + (o.net_profit || 0), 0);
  
  const inventoryValue = state.inventory.reduce((sum, inv) => 
    sum + (inv.quantity_on_hand * inv.weighted_average_cost_thb), 0
  );
  
  const lowStockCount = state.products.filter(p => p.status === 'active').filter(p => {
    const inv = state.inventory.find(i => i.product_id === p.id);
    return inv && inv.quantity_on_hand < p.reorder_point;
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

const initialState: AppState = {
  products: [
    // Sample products
    { id: '1', sku: 'ASA-001', name_th: 'แผ่นพื้น ASA', name_en: 'ASA Flooring', category: 'flooring', unit: 'sqm', cost_thb: 150, price_thb: 250, stock: 1000, reorder_point: 100, status: 'active', supplier_id: '1', created_at: new Date().toISOString() },
    { id: '2', sku: 'WPC-001', name_th: 'แผ่นพื้น WPC', name_en: 'WPC Flooring', category: 'flooring', unit: 'sqm', cost_thb: 200, price_thb: 350, stock: 800, reorder_point: 100, status: 'active', supplier_id: '1', created_at: new Date().toISOString() },
    { id: '3', sku: 'SPC-001', name_th: 'แผ่นพื้น SPC', name_en: 'SPC Flooring', category: 'flooring', unit: 'sqm', cost_thb: 180, price_thb: 280, stock: 1200, reorder_point: 100, status: 'active', supplier_id: '1', created_at: new Date().toISOString() },
  ],
  inventory: [],
  stockMovements: [],
  purchaseOrders: [],
  salesOrders: [
    { id: "1", order_number: "SO-001", customer_id: "1", customer_name: "บริษัท ลูกค้า จำกัด", status: "delivered", items: [{ id: "1", product_id: "1", quantity: 100, unit_price_thb: 250, total_thb: 25000, cost_thb: 150, profit_thb: 100 }], subtotal: 25000, discount: 0, transport_cost: 0, labor_cost: 0, total: 25000, product_cost_thb: 15000, gross_profit: 10000, net_profit: 10000, payment_status: "paid", notes: "", images: [], created_by: "admin", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "2", order_number: "SO-002", customer_id: "2", customer_name: "หจก. อีกาฟู้ดส์", status: "confirmed", items: [{ id: "2", product_id: "2", quantity: 50, unit_price_thb: 350, total_thb: 17500, cost_thb: 200, profit_thb: 150 }], subtotal: 17500, discount: 0, transport_cost: 500, labor_cost: 0, total: 18000, product_cost_thb: 10000, gross_profit: 7500, net_profit: 7000, payment_status: "paid", notes: "", images: [], created_by: "admin", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  crmDeals: [
    // Sample CRM deals to prevent NaN
    { id: '1', lead_id: 'LEAD-001', customer_name: 'บริษัท ลูกค้า จำกัด', customer_type: 'contractor', contact_phone: '089-111-1111', deal_value: 50000, stage: 'inquiry', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_interaction_at: new Date().toISOString() },
    { id: '2', lead_id: 'LEAD-002', customer_name: 'หจก. อีกาฟู้ดส์', customer_type: 'dealer', contact_phone: '089-222-2222', deal_value: 75000, stage: 'quoted', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_interaction_at: new Date().toISOString() },
    { id: '3', lead_id: 'LEAD-003', customer_name: 'บริษัท ไทยพรีเมียม', customer_type: 'project', contact_phone: '089-333-3333', deal_value: 120000, stage: 'paid', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_interaction_at: new Date().toISOString() },
    { id: '4', lead_id: 'LEAD-004', customer_name: 'หจก. วินเนอร์', customer_type: 'homeowner', contact_phone: '089-444-4444', deal_value: 35000, stage: 'shipped', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_interaction_at: new Date().toISOString() },
  ],
  expenses: [],
  warehouses: [],
  users: [],
  currentUser: null,
  isLoading: true,
  kpis: {
    totalRevenue: 0,
    totalCOGS: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    inventoryValue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
    activeDeals: 0,
  },
  trends: [],
};

// =======================
// REDUCER
// =======================

function appReducer(state: AppState, action: Action): AppState {
  let newState = state;
  
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'INIT_DATA':
      newState = { ...state, ...action.payload, isLoading: false };
      break;
    
    // Products
    case 'ADD_PRODUCT':
      newState = { ...state, products: [...state.products, action.payload] };
      break;
    case 'UPDATE_PRODUCT':
      newState = {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
      break;
    case 'DELETE_PRODUCT':
      newState = {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      };
      break;
    
    // Inventory
    case 'ADD_STOCK_MOVEMENT':
      newState = {
        ...state,
        stockMovements: [...state.stockMovements, action.payload],
      };
      break;
    case 'UPDATE_INVENTORY':
      newState = {
        ...state,
        inventory: state.inventory.map(i =>
          i.id === action.payload.id ? action.payload : i
        ),
      };
      break;
    
    // Purchase Orders
    case 'ADD_PURCHASE_ORDER':
      newState = {
        ...state,
        purchaseOrders: [...state.purchaseOrders, action.payload],
      };
      break;
    case 'UPDATE_PURCHASE_ORDER':
      newState = {
        ...state,
        purchaseOrders: state.purchaseOrders.map(po =>
          po.id === action.payload.id ? action.payload : po
        ),
      };
      break;
    
    // Sales Orders
    case 'ADD_SALES_ORDER':
      newState = { ...state, salesOrders: [...state.salesOrders, action.payload] };
      break;
    case 'UPDATE_SALES_ORDER':
      newState = {
        ...state,
        salesOrders: state.salesOrders.map(so =>
          so.id === action.payload.id ? action.payload : so
        ),
      };
      break;
    case 'DELETE_SALES_ORDER':
      newState = {
        ...state,
        salesOrders: state.salesOrders.filter(so => so.id !== action.payload),
      };
      break;
    
    // CRM
    case 'ADD_CRM_DEAL':
      newState = { ...state, crmDeals: [...state.crmDeals, action.payload] };
      break;
    case 'UPDATE_CRM_DEAL':
      newState = {
        ...state,
        crmDeals: state.crmDeals.map(d =>
          d.id === action.payload.id ? action.payload : d
        ),
      };
      break;
    case 'DELETE_CRM_DEAL':
      newState = {
        ...state,
        crmDeals: state.crmDeals.filter(d => d.id !== action.payload),
      };
      break;
    
    // Expenses
    case 'ADD_EXPENSE':
      newState = { ...state, expenses: [...state.expenses, action.payload] };
      break;
    case 'UPDATE_EXPENSE':
      newState = {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
      break;
    case 'DELETE_EXPENSE':
      newState = {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
      };
      break;
    
    default:
      return state;
  }
  
  // Recalculate KPIs after any data change
  return { ...newState, kpis: calculateKPIs(newState) };
}

// =======================
// CONTEXT
// =======================

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// =======================
// PROVIDER
// =======================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  useEffect(() => {
    // Load data from Supabase
    async function loadData() {
      try {
        const api = (await import('@/lib/supabase')).default;
        
        const [products, customers, warehouses, salesOrders, crmDeals, expenses] = await Promise.all([
          api.getProducts(),
          api.getCustomers(),
          api.getWarehouses(),
          api.getSalesOrders(),
          api.getCrmDeals(),
          api.getExpenses(),
        ]);

        dispatch({
          type: 'INIT_DATA',
          payload: {
            products: products || [],
            customers: customers || [],
            warehouses: warehouses || [],
            salesOrders: salesOrders || [],
            crmDeals: crmDeals || [],
            expenses: expenses || [],
            inventory: [],
            stockMovements: [],
            purchaseOrders: [],
          },
        });
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fall back to empty data
        dispatch({
          type: 'INIT_DATA',
          payload: {
            products: [],
            customers: [],
            warehouses: [],
            salesOrders: [
    { id: "1", order_number: "SO-001", customer_id: "1", customer_name: "บริษัท ลูกค้า จำกัด", status: "delivered", items: [{ id: "1", product_id: "1", quantity: 100, unit_price_thb: 250, total_thb: 25000, cost_thb: 150, profit_thb: 100 }], subtotal: 25000, discount: 0, transport_cost: 0, labor_cost: 0, total: 25000, product_cost_thb: 15000, gross_profit: 10000, net_profit: 10000, payment_status: "paid", notes: "", images: [], created_by: "admin", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "2", order_number: "SO-002", customer_id: "2", customer_name: "หจก. อีกาฟู้ดส์", status: "confirmed", items: [{ id: "2", product_id: "2", quantity: 50, unit_price_thb: 350, total_thb: 17500, cost_thb: 200, profit_thb: 150 }], subtotal: 17500, discount: 0, transport_cost: 500, labor_cost: 0, total: 18000, product_cost_thb: 10000, gross_profit: 7500, net_profit: 7000, payment_status: "paid", notes: "", images: [], created_by: "admin", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
            crmDeals: [],
            expenses: [],
            inventory: [],
            stockMovements: [],
            purchaseOrders: [],
          },
        });
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

// =======================
// HOOK
// =======================

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// =======================
// SELECTORS (computed helpers)
// =======================

export function useProducts() {
  const { state } = useApp();
  return state.products;
}

export function useInventory() {
  const { state } = useApp();
  return state.inventory;
}

export function useSalesOrders() {
  const { state } = useApp();
  return state.salesOrders;
}

export function useCRDeals() {
  const { state } = useApp();
  return state.crmDeals;
}

export function useExpenses() {
  const { state } = useApp();
  return state.expenses;
}

export function useKPIs() {
  const { state } = useApp();
  return state.kpis;
}

export function useWarehouses() {
  const { state } = useApp();
  return state.warehouses;
}
