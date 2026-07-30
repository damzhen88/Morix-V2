/**
 * MORIX V2 — ที่เก็บข้อมูลบนเครื่อง (local on device)
 *
 * ข้อมูลทั้งหมดอยู่ใน localStorage ของเบราว์เซอร์ ไม่มีการต่อเซิร์ฟเวอร์
 * รูปภาพไม่ได้อยู่ที่นี่ — ไปอยู่ IndexedDB ผ่าน local-images.ts เพราะ localStorage
 * มีเพดานราว 5MB ซึ่งรูปเดียวก็เกือบเต็ม
 *
 * ทุกฟังก์ชันปลอดภัยกับ SSR (คืนค่าว่างเมื่อไม่มี window) เพราะ Next.js
 * prerender หน้าฝั่งเซิร์ฟเวอร์ที่ไม่มี localStorage
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Product, Customer, Warehouse, SalesOrder, Payment,
  PurchaseOrder, CRNDeal, Expense, Inventory, StockMovement,
} from '@/types';
import * as mock from '@/data/mock';

const PREFIX = 'morix-db-';
const VERSION_KEY = 'morix-db-version';

/** เพิ่มเลขนี้เมื่อรูปข้อมูลเปลี่ยนแบบที่ต้อง migrate ข้อมูลเก่าบนเครื่องผู้ใช้ */
export const DB_VERSION = 1;

// ─────────────────────────────────────────
// รูปแบบข้อมูล
// ─────────────────────────────────────────

export interface LocalDatabase {
  products: Product[];
  customers: Customer[];
  warehouses: Warehouse[];
  salesOrders: SalesOrder[];
  payments: Payment[];
  purchaseOrders: PurchaseOrder[];
  crmDeals: CRNDeal[];
  expenses: Expense[];
  inventory: Inventory[];
  stockMovements: StockMovement[];
}

export type Collection = keyof LocalDatabase;

export const COLLECTIONS: Collection[] = [
  'products', 'customers', 'warehouses', 'salesOrders', 'payments',
  'purchaseOrders', 'crmDeals', 'expenses', 'inventory', 'stockMovements',
];

function emptyDatabase(): LocalDatabase {
  return {
    products: [], customers: [], warehouses: [], salesOrders: [], payments: [],
    purchaseOrders: [], crmDeals: [], expenses: [], inventory: [], stockMovements: [],
  };
}

// ─────────────────────────────────────────
// ข้อผิดพลาด
// ─────────────────────────────────────────

/** พื้นที่เก็บข้อมูลเต็ม — UI ต้องจับตัวนี้แล้วแสดงข้อความให้ผู้ใช้ ห้ามเงียบ */
export class StorageFullError extends Error {
  constructor() {
    super('พื้นที่เก็บข้อมูลบนเครื่องเต็ม กรุณาส่งออกข้อมูลเพื่อสำรอง แล้วลบรายการหรือรูปที่ไม่ใช้');
    this.name = 'StorageFullError';
  }
}

function isQuotaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  // ชื่อ error ต่างกันตามเบราว์เซอร์ Safari บน iOS ใช้ QuotaExceededError เหมือนกัน
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    // Safari โหมดส่วนตัวโยน error ที่ไม่มีชื่อชัดเจน
    /quota/i.test(err.message)
  );
}

// ─────────────────────────────────────────
// อ่าน / เขียนระดับล่าง
// ─────────────────────────────────────────

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function rawGet(key: string): string | null {
  if (!hasStorage()) return null;
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function rawSet(key: string, value: string): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch (err) {
    if (isQuotaError(err)) throw new StorageFullError();
    throw err;
  }
}

// ─────────────────────────────────────────
// อ่าน / เขียนระดับ collection
// ─────────────────────────────────────────

export function readAll<C extends Collection>(collection: C): LocalDatabase[C] {
  const raw = rawGet(collection);
  if (raw === null) return [] as LocalDatabase[C];

  try {
    const parsed = JSON.parse(raw);
    // ข้อมูลเสียหาย (แก้มือ / เขียนไม่จบ) ต้องไม่ทำให้แอปพังทั้งหน้า
    if (!Array.isArray(parsed)) return [] as LocalDatabase[C];
    return parsed as LocalDatabase[C];
  } catch {
    console.error(`[local-db] อ่าน "${collection}" ไม่สำเร็จ ข้อมูลอาจเสียหาย`);
    return [] as LocalDatabase[C];
  }
}

export function writeAll<C extends Collection>(collection: C, rows: LocalDatabase[C]): void {
  rawSet(collection, JSON.stringify(rows));
}

type Row = { id: string };

export function insert<C extends Collection>(
  collection: C,
  row: LocalDatabase[C][number]
): LocalDatabase[C][number] {
  const rows = readAll(collection) as Row[];
  const withId = { ...(row as Row) };
  if (!withId.id) withId.id = uuidv4();

  // แถวใหม่ขึ้นก่อน เพราะทุกหน้าแสดงรายการล่าสุดบนสุด
  writeAll(collection, [withId, ...rows] as LocalDatabase[C]);
  return withId as LocalDatabase[C][number];
}

export function update<C extends Collection>(
  collection: C,
  id: string,
  patch: Partial<LocalDatabase[C][number]>
): LocalDatabase[C][number] | null {
  const rows = readAll(collection) as Row[];
  const index = rows.findIndex(r => r.id === id);
  if (index === -1) return null;

  const updated = { ...rows[index], ...patch } as Row;
  const next = [...rows];
  next[index] = updated;

  writeAll(collection, next as LocalDatabase[C]);
  return updated as LocalDatabase[C][number];
}

export function remove<C extends Collection>(collection: C, id: string): void {
  const rows = readAll(collection) as Row[];
  writeAll(collection, rows.filter(r => r.id !== id) as LocalDatabase[C]);
}

export function findById<C extends Collection>(
  collection: C,
  id: string
): LocalDatabase[C][number] | undefined {
  return (readAll(collection) as Row[]).find(r => r.id === id) as
    | LocalDatabase[C][number]
    | undefined;
}

// ─────────────────────────────────────────
// ทั้งฐานข้อมูล
// ─────────────────────────────────────────

export function loadDatabase(): LocalDatabase {
  const db = emptyDatabase();
  for (const c of COLLECTIONS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any)[c] = readAll(c);
  }
  return db;
}

export function saveDatabase(db: LocalDatabase): void {
  for (const c of COLLECTIONS) {
    writeAll(c, db[c]);
  }
  setVersion(DB_VERSION);
}

export function getVersion(): number | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(VERSION_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

function setVersion(version: number): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(VERSION_KEY, String(version));
  } catch {
    /* เวอร์ชันเขียนไม่ได้ไม่ใช่เรื่องคอขาดบาดตาย */
  }
}

export function isEmpty(): boolean {
  // ถือว่าว่างเมื่อไม่มีทั้งสินค้าและลูกค้า — สองอย่างที่แอปใช้ไม่ได้เลยถ้าไม่มี
  return readAll('products').length === 0 && readAll('customers').length === 0;
}

/**
 * เติมข้อมูลตัวอย่างครั้งแรกที่เปิดแอป
 *
 * ไม่ทับข้อมูลที่มีอยู่แล้วเด็ดขาด — ถ้ามีข้อมูลจะไม่ทำอะไรเลย
 */
export function seedIfEmpty(): boolean {
  if (!hasStorage()) return false;
  if (getVersion() !== null || !isEmpty()) {
    // เคยเปิดมาแล้ว แค่ประทับเวอร์ชันไว้เผื่อยังไม่มี
    if (getVersion() === null) setVersion(DB_VERSION);
    return false;
  }

  saveDatabase({
    products: mock.products,
    customers: mock.customers,
    warehouses: mock.warehouses,
    salesOrders: mock.salesOrders,
    payments: mock.payments,
    purchaseOrders: mock.purchaseOrders,
    crmDeals: mock.crmDeals,
    expenses: mock.expenses,
    inventory: mock.initialInventory,
    stockMovements: mock.stockMovements,
  });

  return true;
}

/** ลบข้อมูลทั้งหมดแล้วเริ่มใหม่ด้วยข้อมูลตัวอย่าง */
export function resetDatabase(): void {
  if (!hasStorage()) return;

  for (const c of COLLECTIONS) {
    try {
      window.localStorage.removeItem(PREFIX + c);
    } catch {
      /* ไม่มีอะไรทำได้ถ้าลบไม่ได้ */
    }
  }
  try {
    window.localStorage.removeItem(VERSION_KEY);
  } catch {
    /* ไม่เป็นไร */
  }

  seedIfEmpty();
}

// ─────────────────────────────────────────
// สำรอง / กู้คืน
// ─────────────────────────────────────────

export interface DatabaseBackup {
  version: number;
  exported_at: string;
  data: LocalDatabase;
}

export function exportDatabase(): DatabaseBackup {
  return {
    version: DB_VERSION,
    exported_at: new Date().toISOString(),
    data: loadDatabase(),
  };
}

/**
 * กู้คืนจากไฟล์สำรอง — ทับข้อมูลเดิมทั้งหมด
 * ผู้เรียกต้องยืนยันกับผู้ใช้ก่อน
 */
export function importDatabase(backup: unknown): void {
  if (typeof backup !== 'object' || backup === null) {
    throw new Error('ไฟล์สำรองไม่ถูกต้อง');
  }

  // รับได้ทั้งไฟล์ที่ห่อด้วย { version, data } และ object ของ collection ตรงๆ
  const candidate = 'data' in backup ? (backup as DatabaseBackup).data : backup;

  if (typeof candidate !== 'object' || candidate === null) {
    throw new Error('ไฟล์สำรองไม่ถูกต้อง');
  }

  const source = candidate as Partial<LocalDatabase>;

  // ต้องมีอย่างน้อยหนึ่ง collection ที่รู้จัก ไม่งั้นเป็นไฟล์อื่น
  const known = COLLECTIONS.filter(c => Array.isArray(source[c]));
  if (known.length === 0) {
    throw new Error('ไม่พบข้อมูล MORIX ในไฟล์นี้');
  }

  const next = emptyDatabase();
  for (const c of COLLECTIONS) {
    if (Array.isArray(source[c])) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next as any)[c] = source[c];
    }
  }

  saveDatabase(next);
}

// ─────────────────────────────────────────
// พื้นที่ที่ใช้
// ─────────────────────────────────────────

/** เพดาน localStorage โดยทั่วไปคือ 5MB (เท่ากันทั้ง Safari iOS และเดสก์ท็อป) */
const QUOTA_BYTES = 5 * 1024 * 1024;

export function estimateUsage(): { bytes: number; percent: number; quota: number } {
  if (!hasStorage()) return { bytes: 0, percent: 0, quota: QUOTA_BYTES };

  let bytes = 0;
  for (const c of COLLECTIONS) {
    const raw = rawGet(c);
    // UTF-16 ในหน่วยความจำ แต่เก็บเป็น UTF-8 — ประมาณ 2 ไบต์ต่อตัวอักษรเป็นค่าที่ปลอดภัย
    if (raw) bytes += raw.length * 2;
  }

  return {
    bytes,
    percent: Math.min(100, Math.round((bytes / QUOTA_BYTES) * 100)),
    quota: QUOTA_BYTES,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─────────────────────────────────────────
// เตือนให้สำรองข้อมูล
// ─────────────────────────────────────────

const LAST_BACKUP_KEY = 'morix-last-backup-at';

/** จำนวนวันที่ปล่อยให้ไม่สำรองได้ก่อนขึ้นเตือน */
export const BACKUP_REMINDER_DAYS = 7;

export function markBackedUp(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
  } catch {
    /* ไม่เป็นไร */
  }
}

export function getLastBackupAt(): string | null {
  if (!hasStorage()) return null;
  try {
    return window.localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

/**
 * ควรเตือนให้สำรองหรือยัง
 *
 * ข้อมูลอยู่บนเครื่องเท่านั้น ล้างข้อมูลเบราว์เซอร์หรือลบแอปออกจากหน้าจอโฮม
 * = ข้อมูลหายถาวร การเตือนจึงไม่ใช่ของฟุ่มเฟือย
 */
export function shouldRemindBackup(today: Date = new Date()): boolean {
  if (!hasStorage()) return false;
  if (isEmpty()) return false;

  const last = getLastBackupAt();
  if (last === null) return true;

  const days = (today.getTime() - new Date(last).getTime()) / 86_400_000;
  return days >= BACKUP_REMINDER_DAYS;
}
