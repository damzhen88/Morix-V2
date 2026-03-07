// State Management for MORIX CRM v2
// Using React Context + useReducer for global state

'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { 
  Product, Inventory, StockMovement, PurchaseOrder, SalesOrder,
  CRNDeal, Expense, Warehouse, User, DashboardKPIs, MonthlyTrend
} from '@/types';

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
  | { type: 'SET_USER'; payload: User | null };

const initialState: AppState = {
  products: [
    { id: '1', sku: 'ASA-001', name_th: 'แผ่นพื้น ASA', name_en: 'ASA Flooring', category: 'ASA', unit: 'sqm', cost_thb: 150, price_thb: 250, stock: 1000, reorder_point: 100, status: 'active', supplier_id: '1', images: [], created_at: new Date().toISOString() },
    { id: '2', sku: 'WPC-001', name_th: 'แผ่นพื้น WPC', name_en: 'WPC Flooring', category: 'WPC', unit: 'sqm', cost_thb: 200, price_thb: 350, stock: 800, reorder_point: 100, status: 'active', supplier_id: '1', images: [], created_at: new Date().toISOString() },
    { id: '3', sku: 'SPC-001', name_th: 'แผ่นพื้น SPC', name_en: 'SPC Flooring', category: 'SPC', unit: 'sqm', cost_thb: 180, price_thb: 280, stock: 1200, reorder_point: 100, status: 'active', supplier_id: '1', images: [], created_at: new Date().toISOString() },
  ],
  inventory: [
    { id: '1', product_id: '1', warehouse_id: '1', quantity_on_hand: 500, weighted_average_cost_thb: 150, min_level: 100, max_level: 2000, created_at: new Date().toISOString() },
    { id: '2', product_id: '2', warehouse_id: '1', quantity_on_hand: 300, weighted_average_cost_thb: 200, min_level: 100, max_level: 2000, created_at: new Date().toISOString() },
    { id: '3', product_id: '3', warehouse_id: '1', quantity_on_hand: 800, weighted_average_cost_thb: 180, min_level: 100, max_level: 2000, created_at: new Date().toISOString() },
  ],
  stockMovements: [],
  purchaseOrders: [],
  salesOrders: [
    { id: '1', order_number: 'SO-001', customer_id: '1', customer_name: 'บริษัท ลูกค้า จำกัด', status: 'delivered', items: [{ id: '1', product_id: '1', quantity: 100, unit_price_thb: 250, total_thb: 25000, cost_thb: 150, profit_thb: 100 }], subtotal: 25000, discount: 0, transport_cost: 0, labor_cost: 0, total: 25000, product_cost_thb: 15000, gross_profit: 10000, net_profit: 10000, payment_status: 'paid', notes: '', images: [], created_by: 'admin', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', order_number: 'SO-002', customer_id: '2', customer_name: 'หจก. อีกาฟู้ดส์', status: 'confirmed', items: [{ id: '2', product_id: '2', quantity: 50, unit_price_thb: 350, total_thb: 17500, cost_thb: 200, profit_thb: 150 }], subtotal: 17500, discount: 0, transport_cost: 500, labor_cost: 0, total: 18000, product_cost_thb: 10000, gross_profit: 7500, net_profit: 7000, payment_status: 'paid', notes: '', images: [], created_by: 'admin', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  crmDeals: [
    { id: '1', lead_id: 'LEAD-001', customer_name: 'บริษัท ลูกค้า จำกัด', customer_type: 'contractor', contact_phone: '089-111-1111', deal_value: 50000, stage: 'inquiry', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_interaction_at: new Date().toISOString() },
    { id: '2', lead_id: 'LEAD-002', customer_name: 'หจก. อีกาฟู้ดส์', customer_type: 'dealer', contact_phone: '089-222-2222', deal_value: 75000, stage: 'quoted', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_interaction_at: new Date().toISOString() },
    { id: '3', lead_id: 'LEAD-003', customer_name: 'บริษัท ไทยพรีเมียม', customer_type: 'project', contact_phone: '089-333-3333', deal_value: 120000, stage: 'paid', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_interaction_at: new Date().toISOString() },
    { id: '4', lead_id: 'LEAD-004', customer_name: 'หจก. วินเนอร์', customer_type: 'homeowner', contact_phone: '089-444-4444', deal_value: 35000, stage: 'shipped', notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_interaction_at: new Date().toISOString() },
  ],
  expenses: [],
  warehouses: [{ id: '1', name: 'คลังหลัก', location: 'กรุงเทพฯ', created_at: new Date().toISOString() }],
  users: [],
  currentUser: null,
  isLoading: true,
  kpis: { totalRevenue: 0, totalCOGS: 0, grossProfit: 0, netProfit: 0, profitMargin: 0, inventoryValue: 0, lowStockCount: 0, pendingOrders: 0, activeDeals: 0 },
  trends: [
    { month: 'ส.ค.', revenue: 150000, profit: 50000 },
    { month: 'ก.ย.', revenue: 180000, profit: 60000 },
    { month: 'ต.ค.', revenue: 200000, profit: 75000 },
  ],
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
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: false });
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
  
  const inventoryValue = state.inventory.reduce((sum, inv) => 
    sum + ((inv.quantity_on_hand || 0) * (inv.weighted_average_cost_thb || 0)), 0
  );
  
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
