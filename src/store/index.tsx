// State Management for MORIX CRM v2
// React Context + useReducer อ่าน/เขียนข้อมูลบนเครื่องผ่าน local-db
//
// ไม่มีชั้นแปลงข้อมูลอีกแล้ว — เก็บด้วย type เดียวกับที่ UI ใช้
// (เดิมมี transform* 6 ตัวที่ปลอมค่าเพื่อปิดช่องว่างระหว่าง type ของ DB กับของ UI
//  รวมถึงการเดา payment_status จากสถานะจัดส่ง ซึ่งหายไปพร้อมกับการย้ายมา local)

'use client';

import React, {
  createContext, useContext, useReducer, useEffect, useMemo, useCallback, ReactNode,
} from 'react';
import {
  Product, Customer, Inventory, StockMovement, PurchaseOrder, SalesOrder,
  Payment, CRNDeal, Expense, Warehouse, User, DashboardKPIs, MonthlyTrend,
} from '@/types';
import * as db from '@/lib/local-db';
import {
  groupPaymentsByOrder, buildAgingReport, toOrderLike, balance, paymentStatus,
  type PaymentStatus,
} from '@/lib/payment';

interface AppState {
  products: Product[];
  customers: Customer[];
  inventory: Inventory[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  salesOrders: SalesOrder[];
  payments: Payment[];
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
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_INVENTORY'; payload: Inventory }
  | { type: 'UPDATE_INVENTORY'; payload: Inventory }
  | { type: 'ADD_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'UPDATE_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'DELETE_PURCHASE_ORDER'; payload: string }
  | { type: 'ADD_SALES_ORDER'; payload: SalesOrder }
  | { type: 'UPDATE_SALES_ORDER'; payload: SalesOrder }
  | { type: 'DELETE_SALES_ORDER'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'DELETE_PAYMENT'; payload: string }
  | { type: 'ADD_CRM_DEAL'; payload: CRNDeal }
  | { type: 'UPDATE_CRM_DEAL'; payload: CRNDeal }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null };

const emptyKPIs: DashboardKPIs = {
  totalRevenue: 0, totalCOGS: 0, grossProfit: 0, netProfit: 0, profitMargin: 0,
  inventoryValue: 0, lowStockCount: 0, pendingOrders: 0, activeDeals: 0,
};

const initialState: AppState = {
  products: [], customers: [], inventory: [], stockMovements: [],
  purchaseOrders: [], salesOrders: [], payments: [], crmDeals: [],
  expenses: [], warehouses: [], users: [], currentUser: null,
  isLoading: true, error: null, kpis: emptyKPIs, trends: [],
};

// ─────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────

/** เพิ่มแถวใหม่ขึ้นบนสุด ให้ตรงกับที่ local-db เก็บ */
function prepend<T>(list: T[], row: T): T[] {
  return [row, ...list];
}

function replace<T extends { id: string }>(list: T[], row: T): T[] {
  return list.map(item => (item.id === row.id ? row : item));
}

function drop<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter(item => item.id !== id);
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };

    case 'ADD_PRODUCT':
      return { ...state, products: prepend(state.products, action.payload) };
    case 'UPDATE_PRODUCT':
      return { ...state, products: replace(state.products, action.payload) };
    case 'DELETE_PRODUCT':
      return { ...state, products: drop(state.products, action.payload) };

    case 'ADD_CUSTOMER':
      return { ...state, customers: prepend(state.customers, action.payload) };
    case 'UPDATE_CUSTOMER':
      return { ...state, customers: replace(state.customers, action.payload) };
    case 'DELETE_CUSTOMER':
      return { ...state, customers: drop(state.customers, action.payload) };

    case 'ADD_INVENTORY':
      return { ...state, inventory: prepend(state.inventory, action.payload) };
    case 'UPDATE_INVENTORY':
      return { ...state, inventory: replace(state.inventory, action.payload) };

    case 'ADD_PURCHASE_ORDER':
      return { ...state, purchaseOrders: prepend(state.purchaseOrders, action.payload) };
    case 'UPDATE_PURCHASE_ORDER':
      return { ...state, purchaseOrders: replace(state.purchaseOrders, action.payload) };
    case 'DELETE_PURCHASE_ORDER':
      return { ...state, purchaseOrders: drop(state.purchaseOrders, action.payload) };

    case 'ADD_SALES_ORDER':
      return { ...state, salesOrders: prepend(state.salesOrders, action.payload) };
    case 'UPDATE_SALES_ORDER':
      return { ...state, salesOrders: replace(state.salesOrders, action.payload) };
    case 'DELETE_SALES_ORDER':
      return {
        ...state,
        salesOrders: drop(state.salesOrders, action.payload),
        // ลบบิลแล้วการรับเงินของบิลนั้นต้องหายไปด้วย ไม่ทิ้งเงินลอย
        payments: state.payments.filter(p => p.sales_order_id !== action.payload),
      };

    case 'ADD_PAYMENT':
      return { ...state, payments: prepend(state.payments, action.payload) };
    case 'UPDATE_PAYMENT':
      return { ...state, payments: replace(state.payments, action.payload) };
    case 'DELETE_PAYMENT':
      return { ...state, payments: drop(state.payments, action.payload) };

    case 'ADD_CRM_DEAL':
      return { ...state, crmDeals: prepend(state.crmDeals, action.payload) };
    case 'UPDATE_CRM_DEAL':
      return { ...state, crmDeals: replace(state.crmDeals, action.payload) };

    case 'ADD_EXPENSE':
      return { ...state, expenses: prepend(state.expenses, action.payload) };
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: replace(state.expenses, action.payload) };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: drop(state.expenses, action.payload) };

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

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  /** อ่านข้อมูลจากเครื่องใหม่ — ใช้หลังกู้คืนไฟล์สำรองหรือล้างข้อมูล */
  reload: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const reload = useCallback(() => {
    try {
      // เติมข้อมูลตัวอย่างครั้งแรก เพื่อไม่ให้เปิดแอปมาเจอหน้าว่างเปล่า
      db.seedIfEmpty();

      const loaded = db.loadDatabase();
      dispatch({
        type: 'SET_STATE',
        payload: { ...loaded, isLoading: false, error: null },
      });
    } catch (err) {
      console.error('[store] โหลดข้อมูลไม่สำเร็จ', err);
      dispatch({
        type: 'SET_STATE',
        payload: { isLoading: false, error: 'โหลดข้อมูลจากเครื่องไม่สำเร็จ' },
      });
    }
  }, []);

  // โหลดหลัง mount ไม่ใช่ตอน init state — localStorage ไม่มีตอน SSR
  // ถ้าอ่านตอน render แรกจะเกิด hydration mismatch
  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <AppContext.Provider value={{ state, dispatch, reload }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

// ─────────────────────────────────────────
// เขียนข้อมูล — เขียนลงเครื่องแล้ว dispatch ให้ UI อัปเดตทันที
// ─────────────────────────────────────────

/**
 * ทุกฟังก์ชันเขียน local-db ก่อนแล้วจึง dispatch
 * ถ้าเขียนไม่สำเร็จ (พื้นที่เต็ม) จะ throw ออกไปให้ UI แสดงข้อความ
 * และ state จะไม่เปลี่ยน — หน้าจอกับข้อมูลบนเครื่องจึงไม่หลุดกันเอง
 */
export function useMutations() {
  const { dispatch, reload } = useApp();

  return useMemo(
    () => ({
      // ── สินค้า
      addProduct(product: Product) {
        const saved = db.insert('products', product);
        dispatch({ type: 'ADD_PRODUCT', payload: saved });
        return saved;
      },
      updateProduct(id: string, patch: Partial<Product>) {
        const saved = db.update('products', id, patch);
        if (saved) dispatch({ type: 'UPDATE_PRODUCT', payload: saved });
        return saved;
      },
      deleteProduct(id: string) {
        db.remove('products', id);
        dispatch({ type: 'DELETE_PRODUCT', payload: id });
      },

      // ── ลูกค้า
      addCustomer(customer: Customer) {
        const saved = db.insert('customers', customer);
        dispatch({ type: 'ADD_CUSTOMER', payload: saved });
        return saved;
      },
      updateCustomer(id: string, patch: Partial<Customer>) {
        const saved = db.update('customers', id, patch);
        if (saved) dispatch({ type: 'UPDATE_CUSTOMER', payload: saved });
        return saved;
      },
      deleteCustomer(id: string) {
        db.remove('customers', id);
        dispatch({ type: 'DELETE_CUSTOMER', payload: id });
      },

      // ── บิลขาย
      addSalesOrder(order: SalesOrder) {
        const saved = db.insert('salesOrders', order);
        dispatch({ type: 'ADD_SALES_ORDER', payload: saved });
        return saved;
      },
      updateSalesOrder(id: string, patch: Partial<SalesOrder>) {
        const saved = db.update('salesOrders', id, patch);
        if (saved) dispatch({ type: 'UPDATE_SALES_ORDER', payload: saved });
        return saved;
      },
      deleteSalesOrder(id: string) {
        // ลบการรับเงินของบิลนี้ก่อน ไม่ให้เหลือเงินที่ไม่ผูกกับบิลใด
        for (const p of db.readAll('payments').filter(p => p.sales_order_id === id)) {
          db.remove('payments', p.id);
        }
        db.remove('salesOrders', id);
        dispatch({ type: 'DELETE_SALES_ORDER', payload: id });
      },

      // ── การรับเงิน
      addPayment(payment: Payment) {
        const saved = db.insert('payments', payment);
        dispatch({ type: 'ADD_PAYMENT', payload: saved });
        return saved;
      },
      updatePayment(id: string, patch: Partial<Payment>) {
        const saved = db.update('payments', id, patch);
        if (saved) dispatch({ type: 'UPDATE_PAYMENT', payload: saved });
        return saved;
      },
      deletePayment(id: string) {
        db.remove('payments', id);
        dispatch({ type: 'DELETE_PAYMENT', payload: id });
      },

      // ── ใบสั่งซื้อ
      addPurchaseOrder(order: PurchaseOrder) {
        const saved = db.insert('purchaseOrders', order);
        dispatch({ type: 'ADD_PURCHASE_ORDER', payload: saved });
        return saved;
      },
      updatePurchaseOrder(id: string, patch: Partial<PurchaseOrder>) {
        const saved = db.update('purchaseOrders', id, patch);
        if (saved) dispatch({ type: 'UPDATE_PURCHASE_ORDER', payload: saved });
        return saved;
      },
      deletePurchaseOrder(id: string) {
        db.remove('purchaseOrders', id);
        dispatch({ type: 'DELETE_PURCHASE_ORDER', payload: id });
      },

      // ── ค่าใช้จ่าย
      addExpense(expense: Expense) {
        const saved = db.insert('expenses', expense);
        dispatch({ type: 'ADD_EXPENSE', payload: saved });
        return saved;
      },
      updateExpense(id: string, patch: Partial<Expense>) {
        const saved = db.update('expenses', id, patch);
        if (saved) dispatch({ type: 'UPDATE_EXPENSE', payload: saved });
        return saved;
      },
      deleteExpense(id: string) {
        db.remove('expenses', id);
        dispatch({ type: 'DELETE_EXPENSE', payload: id });
      },

      // ── ดีล CRM
      addCrmDeal(deal: CRNDeal) {
        const saved = db.insert('crmDeals', deal);
        dispatch({ type: 'ADD_CRM_DEAL', payload: saved });
        return saved;
      },
      updateCrmDeal(id: string, patch: Partial<CRNDeal>) {
        const saved = db.update('crmDeals', id, patch);
        if (saved) dispatch({ type: 'UPDATE_CRM_DEAL', payload: saved });
        return saved;
      },

      /** อ่านทั้งฐานใหม่ — ใช้หลังกู้คืนไฟล์สำรองหรือล้างข้อมูล */
      reload,
    }),
    [dispatch, reload]
  );
}

// ─────────────────────────────────────────
// ข้อมูลสรุป
// ─────────────────────────────────────────

export function useKPIs() {
  const { state } = useApp();

  return useMemo(() => {
    const confirmedOrders = state.salesOrders.filter(o =>
      ['confirmed', 'delivered', 'closed'].includes(o.status)
    );

    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalCOGS = confirmedOrders.reduce((sum, o) => sum + (o.product_cost_thb || 0), 0);
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = confirmedOrders.reduce((sum, o) => sum + (o.net_profit || 0), 0);

    const inventoryValue = state.inventory.reduce(
      (sum, inv) => sum + (inv.quantity_on_hand || 0) * (inv.weighted_average_cost_thb || 0),
      0
    );

    const lowStockCount = state.products
      .filter(p => p.status === 'active')
      .filter(p => {
        const inv = state.inventory.find(i => i.product_id === p.id);
        return inv !== undefined && (inv.quantity_on_hand || 0) < p.reorder_point;
      }).length;

    const pendingOrders = state.salesOrders.filter(o =>
      ['quoted', 'confirmed'].includes(o.status)
    ).length;

    const activeDeals = state.crmDeals.filter(d =>
      ['inquiry', 'quoted'].includes(d.stage)
    ).length;

    // ยอดค้างรับ — คำนวณสดจากรายการรับเงิน ไม่มีฟิลด์ไหนเก็บไว้
    const byOrder = groupPaymentsByOrder(state.payments);
    let totalOutstanding = 0;
    let overdueCount = 0;
    const today = new Date();

    for (const order of state.salesOrders) {
      const remaining = balance(order.total, byOrder.get(order.id) ?? []);
      if (remaining <= 0) continue;

      totalOutstanding += remaining;

      const due = order.due_date;
      if (due && new Date(due) < today) overdueCount += 1;
    }

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
      totalOutstanding,
      overdueCount,
    };
  }, [state.salesOrders, state.payments, state.products, state.inventory, state.crmDeals]);
}

/** การรับเงินจัดกลุ่มตามบิล — hook แยกไว้เพื่อให้หลายหน้าใช้ผลลัพธ์เดียวกัน */
export function usePaymentsByOrder() {
  const { state } = useApp();
  return useMemo(() => groupPaymentsByOrder(state.payments), [state.payments]);
}

/** รายงานลูกหนี้ (อายุหนี้) */
export function useReceivables() {
  const { state } = useApp();
  const byOrder = usePaymentsByOrder();

  return useMemo(() => {
    const names = new Map(state.customers.map(c => [c.id, c.name]));

    // เผื่อบิลเก่าที่ยังไม่มีลูกค้าใน collection — ใช้ชื่อที่ติดมากับบิล
    for (const order of state.salesOrders) {
      if (!names.has(order.customer_id) && order.customer_name) {
        names.set(order.customer_id, order.customer_name);
      }
    }

    // บิลที่ยกเลิกหรือยังเป็นร่างไม่ใช่ลูกหนี้
    const billable = state.salesOrders.filter(
      o => !['cancelled', 'draft'].includes(o.status)
    );

    return buildAgingReport(billable.map(toOrderLike), byOrder, names);
  }, [state.salesOrders, state.customers, byOrder]);
}

/** สถานะการชำระของบิลหนึ่ง — คำนวณสด ไม่ใช่ฟิลด์ที่เก็บไว้ */
export function useOrderPaymentStatus(order: SalesOrder | null): PaymentStatus {
  const byOrder = usePaymentsByOrder();
  if (!order) return 'unpaid';
  return paymentStatus(order.total, byOrder.get(order.id) ?? []);
}
