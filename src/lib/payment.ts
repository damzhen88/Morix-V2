/**
 * MORIX V2 — ตรรกะการรับเงิน (มัดจำ / แบ่งชำระ / เครดิต)
 *
 * โมดูลนี้เป็น pure function ล้วน ไม่แตะ store ไม่แตะที่เก็บข้อมูล
 * สถานะการชำระและยอดค้างทั้งหมด "คำนวณสด" จากรายการรับเงิน ไม่เก็บเป็นฟิลด์
 * เพื่อให้มีแหล่งความจริงที่เดียวและยอดไม่มีทางเพี้ยนจากกัน
 */

import type { Payment, PaymentMethod, SalesOrder } from '@/types';

// ─────────────────────────────────────────
// ประเภท
// ─────────────────────────────────────────

/** 'deposit' = จ่ายมาบางส่วน (ใช้ token เดิมเพื่อให้ getStatusColor ให้สีถูกอยู่แล้ว) */
export type PaymentStatus = 'unpaid' | 'deposit' | 'paid' | 'overpaid';

export type AgingBucket = 'current' | 'd0_30' | 'd31_60' | 'd60_plus';

/** รูปขั้นต่ำที่ฟังก์ชันในไฟล์นี้ต้องใช้ — รับทั้ง Payment เต็มและ object ที่มีแค่นี้ */
export interface PaymentLike {
  sales_order_id: string;
  amount_thb: number;
  paid_at: string;
}

/** รูปขั้นต่ำของบิลที่ต้องใช้คำนวณ */
export interface OrderLike {
  id: string;
  customer_id: string;
  total: number;
  order_date: string;
  due_date?: string | null;
  credit_term_days?: number;
}

// ─────────────────────────────────────────
// ป้ายภาษาไทย — อยู่ติดกับ type ที่มันอธิบาย
// ─────────────────────────────────────────

export const PAYMENT_STATUS_LABEL_TH: Record<PaymentStatus, string> = {
  unpaid: 'ยังไม่ชำระ',
  deposit: 'ชำระบางส่วน',
  paid: 'ชำระครบ',
  overpaid: 'ชำระเกิน',
};

export const PAYMENT_METHOD_LABEL_TH: Record<PaymentMethod, string> = {
  cash: 'เงินสด',
  transfer: 'โอนเงิน',
  cheque: 'เช็ค',
  card: 'บัตรเครดิต',
};

export const AGING_BUCKET_LABEL_TH: Record<AgingBucket, string> = {
  current: 'ยังไม่ครบกำหนด',
  d0_30: 'ค้าง 1-30 วัน',
  d31_60: 'ค้าง 31-60 วัน',
  d60_plus: 'ค้างเกิน 60 วัน',
};

export const AGING_BUCKET_ORDER: AgingBucket[] = ['current', 'd0_30', 'd31_60', 'd60_plus'];

/** ตัวเลือกเครดิตในฟอร์ม — 0 = เงินสด */
export const CREDIT_TERM_OPTIONS = [0, 30, 60, 90] as const;

export function creditTermLabelTH(days: number): string {
  return days <= 0 ? 'เงินสด' : `เครดิต ${days} วัน`;
}

// ─────────────────────────────────────────
// วันที่ — ทำงานใน space YYYY-MM-DD เท่านั้น
// ─────────────────────────────────────────

/**
 * ตัดเวลาออกให้เหลือแต่วัน
 *
 * ต้องเทียบแบบวันที่ ไม่ใช่ timestamp ไม่งั้นบิลที่ครบกำหนดวันนี้
 * จะอ่านเป็นเลยกำหนด 1 วันหรือไม่เลย ขึ้นกับ timezone ของเครื่องที่เปิด
 */
export function toDateOnly(value: string | Date): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // รับได้ทั้ง '2026-07-30' และ '2026-07-30T12:34:56.000Z'
  return value.slice(0, 10);
}

/** จำนวนวันจาก a ถึง b (b - a) — บวกคือ b อยู่หลัง a */
export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = toDateOnly(a).split('-').map(Number);
  const [by, bm, bd] = toDateOnly(b).split('-').map(Number);
  // UTC เพื่อไม่ให้ DST ทำให้ผลเพี้ยน
  const aUtc = Date.UTC(ay, am - 1, ad);
  const bUtc = Date.UTC(by, bm - 1, bd);
  return Math.round((bUtc - aUtc) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = toDateOnly(date).split('-').map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  const yy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(shifted.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// ─────────────────────────────────────────
// ยอดเงิน
// ─────────────────────────────────────────

/** ค่าคลาดเคลื่อนที่ยอมรับ — กันปัญหา floating point เช่น 333.33 × 3 ไม่เท่า 1000 พอดี */
const EPSILON = 0.005;

/** ปัดเป็นสตางค์ เพื่อไม่ให้เศษ floating point โผล่ในยอดที่แสดง */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function paidTotal(payments: PaymentLike[]): number {
  return round2(payments.reduce((sum, p) => sum + (p.amount_thb || 0), 0));
}

/** ยอดคงเหลือ — ไม่ติดลบ ถ้าจ่ายเกินจะได้ 0 (ดูยอดเกินจาก overpaidAmount) */
export function balance(total: number, payments: PaymentLike[]): number {
  return round2(Math.max(0, (total || 0) - paidTotal(payments)));
}

/** ยอดที่จ่ายเกินมา — 0 ถ้าไม่เกิน */
export function overpaidAmount(total: number, payments: PaymentLike[]): number {
  return round2(Math.max(0, paidTotal(payments) - (total || 0)));
}

export function paymentStatus(total: number, payments: PaymentLike[]): PaymentStatus {
  const paid = paidTotal(payments);
  const amount = total || 0;

  if (paid <= EPSILON) return 'unpaid';
  if (paid > amount + EPSILON) return 'overpaid';
  if (paid >= amount - EPSILON) return 'paid';
  return 'deposit';
}

// ─────────────────────────────────────────
// เครดิต / กำหนดชำระ
// ─────────────────────────────────────────

/** null เมื่อเป็นเงินสด (เครดิต 0 วัน) — ไม่มีกำหนดชำระให้ติดตาม */
export function computeDueDate(orderDate: string, creditTermDays: number): string | null {
  if (!creditTermDays || creditTermDays <= 0) return null;
  return addDays(orderDate, creditTermDays);
}

/**
 * จำนวนวันที่เลยกำหนด — 0 คือยังไม่เลย
 *
 * วันครบกำหนดพอดีคืน 0 (ยังไม่ถือว่าเลย) วันถัดมาคืน 1
 */
export function daysOverdue(dueDate: string | null | undefined, today?: Date): number {
  if (!dueDate) return 0;
  const ref = toDateOnly(today ?? new Date());
  return Math.max(0, diffDays(dueDate, ref));
}

/**
 * เลยกำหนดจริงต้องมียอดค้างด้วย
 *
 * บิลที่จ่ายครบแล้วต้องไม่ถือว่าเลยกำหนด แม้กำหนดชำระผ่านมานานแล้ว
 * ไม่งั้นบิลเก่าที่ปิดไปแล้วจะโผล่ในรายงานลูกหนี้
 */
export function isOverdue(
  dueDate: string | null | undefined,
  balanceTHB: number,
  today?: Date
): boolean {
  if (balanceTHB <= EPSILON) return false;
  return daysOverdue(dueDate, today) > 0;
}

export function agingBucket(
  dueDate: string | null | undefined,
  balanceTHB: number,
  today?: Date
): AgingBucket {
  if (!isOverdue(dueDate, balanceTHB, today)) return 'current';

  const days = daysOverdue(dueDate, today);
  if (days <= 30) return 'd0_30';
  if (days <= 60) return 'd31_60';
  return 'd60_plus';
}

// ─────────────────────────────────────────
// สรุปต่อบิล
// ─────────────────────────────────────────

export function groupPaymentsByOrder<T extends PaymentLike>(payments: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();

  for (const p of payments) {
    const list = map.get(p.sales_order_id);
    if (list) list.push(p);
    else map.set(p.sales_order_id, [p]);
  }

  // เรียงตามวันที่รับเงิน เพื่อให้ "แถวแรก = มัดจำ" เป็นจริงเสมอ
  for (const list of map.values()) {
    list.sort((a, b) => a.paid_at.localeCompare(b.paid_at));
  }

  return map;
}

export interface OrderPaymentSummary {
  paid: number;
  balance: number;
  overpaid: number;
  status: PaymentStatus;
  dueDate: string | null;
  overdue: boolean;
  daysOverdue: number;
  bucket: AgingBucket;
  lastPaidAt: string | null;
  paymentCount: number;
}

export function summarize(
  order: OrderLike,
  payments: PaymentLike[],
  today?: Date
): OrderPaymentSummary {
  const paid = paidTotal(payments);
  const bal = balance(order.total, payments);

  // ใช้ due_date ที่เก็บไว้เป็นหลัก ถ้าไม่มีจึงคำนวณจากเงื่อนไขเครดิต
  const dueDate =
    order.due_date ?? computeDueDate(order.order_date, order.credit_term_days ?? 0);

  const sorted = [...payments].sort((a, b) => a.paid_at.localeCompare(b.paid_at));

  return {
    paid,
    balance: bal,
    overpaid: overpaidAmount(order.total, payments),
    status: paymentStatus(order.total, payments),
    dueDate,
    overdue: isOverdue(dueDate, bal, today),
    daysOverdue: bal > EPSILON ? daysOverdue(dueDate, today) : 0,
    bucket: agingBucket(dueDate, bal, today),
    lastPaidAt: sorted.length > 0 ? sorted[sorted.length - 1].paid_at : null,
    paymentCount: payments.length,
  };
}

/**
 * ป้ายของการรับเงินแต่ละครั้ง อนุมานจากลำดับ
 * @param index ลำดับ (0 = ครั้งแรก) ในรายการที่เรียงตามวันที่แล้ว
 */
export function paymentSequenceLabelTH(
  index: number,
  totalPayments: number,
  closesBalance: boolean
): string {
  if (index === 0 && totalPayments === 1 && closesBalance) return 'ชำระเต็มจำนวน';
  if (index === 0) return 'มัดจำ';
  if (closesBalance) return 'ชำระปิดยอด';
  return `งวดที่ ${index + 1}`;
}

// ─────────────────────────────────────────
// รายงานลูกหนี้ (อายุหนี้)
// ─────────────────────────────────────────

export interface AgingBuckets {
  current: number;
  d0_30: number;
  d31_60: number;
  d60_plus: number;
}

export interface AgingRow extends AgingBuckets {
  customerId: string;
  customerName: string;
  total: number;
  orderCount: number;
}

export interface AgingReport {
  rows: AgingRow[];
  totals: AgingBuckets & { total: number; orderCount: number };
  /** บิลที่ยังมียอดค้าง เรียงตามเลยกำหนดมากสุดก่อน */
  outstanding: { order: OrderLike; summary: OrderPaymentSummary }[];
}

function emptyBuckets(): AgingBuckets {
  return { current: 0, d0_30: 0, d31_60: 0, d60_plus: 0 };
}

export function buildAgingReport(
  orders: OrderLike[],
  paymentsByOrder: Map<string, PaymentLike[]>,
  customerNameById: Map<string, string>,
  today?: Date
): AgingReport {
  const byCustomer = new Map<string, AgingRow>();
  const outstanding: { order: OrderLike; summary: OrderPaymentSummary }[] = [];
  const totals = { ...emptyBuckets(), total: 0, orderCount: 0 };

  for (const order of orders) {
    const summary = summarize(order, paymentsByOrder.get(order.id) ?? [], today);

    // บิลที่ปิดยอดแล้วไม่ใช่ลูกหนี้
    if (summary.balance <= EPSILON) continue;

    outstanding.push({ order, summary });

    let row = byCustomer.get(order.customer_id);
    if (!row) {
      row = {
        customerId: order.customer_id,
        customerName: customerNameById.get(order.customer_id) ?? 'ไม่ระบุลูกค้า',
        ...emptyBuckets(),
        total: 0,
        orderCount: 0,
      };
      byCustomer.set(order.customer_id, row);
    }

    row[summary.bucket] = round2(row[summary.bucket] + summary.balance);
    row.total = round2(row.total + summary.balance);
    row.orderCount += 1;

    totals[summary.bucket] = round2(totals[summary.bucket] + summary.balance);
    totals.total = round2(totals.total + summary.balance);
    totals.orderCount += 1;
  }

  // ค้างมากสุดขึ้นก่อน — คนที่ต้องตามเงินก่อน
  const rows = [...byCustomer.values()].sort((a, b) => b.total - a.total);

  // เลยกำหนดนานสุดขึ้นก่อน ถ้าเท่ากันเอายอดมากก่อน
  outstanding.sort(
    (a, b) =>
      b.summary.daysOverdue - a.summary.daysOverdue || b.summary.balance - a.summary.balance
  );

  return { rows, totals, outstanding };
}

/** ยอดค้างของลูกค้ารายเดียว — ใช้แสดงบนการ์ดในหน้าลูกค้า */
export function customerBalance(
  customerId: string,
  orders: OrderLike[],
  paymentsByOrder: Map<string, PaymentLike[]>
): number {
  return round2(
    orders
      .filter(o => o.customer_id === customerId)
      .reduce((sum, o) => sum + balance(o.total, paymentsByOrder.get(o.id) ?? []), 0)
  );
}

/** ดึงรูปขั้นต่ำที่ payment.ts ต้องใช้ออกจาก SalesOrder เต็ม */
export function toOrderLike(order: SalesOrder): OrderLike {
  return {
    id: order.id,
    customer_id: order.customer_id,
    total: order.total,
    order_date: order.order_date,
    due_date: order.due_date,
    credit_term_days: order.credit_term_days,
  };
}

export type { Payment, PaymentMethod };
