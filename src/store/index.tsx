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
  
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCOGS = confirmedOrders.reduce((sum, o) => sum + o.product_cost_thb, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = confirmedOrders.reduce((sum, o) => sum + o.net_profit, 0);
  
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
    // Initialize with empty data (will load from Supabase later)
    dispatch({
      type: 'INIT_DATA',
      payload: {
        products: [],
        inventory: [],
        stockMovements: [],
        purchaseOrders: [],
        salesOrders: [],
        crmDeals: [],
        expenses: [],
        warehouses: [],
      },
    });
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
