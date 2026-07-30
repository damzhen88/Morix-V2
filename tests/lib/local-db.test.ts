import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  readAll,
  writeAll,
  insert,
  update,
  remove,
  findById,
  loadDatabase,
  seedIfEmpty,
  resetDatabase,
  isEmpty,
  getVersion,
  exportDatabase,
  importDatabase,
  estimateUsage,
  formatBytes,
  markBackedUp,
  getLastBackupAt,
  shouldRemindBackup,
  StorageFullError,
  COLLECTIONS,
  DB_VERSION,
} from '@/lib/local-db';
import type { Customer } from '@/types';

function customer(over: Partial<Customer> = {}): Customer {
  return {
    id: 'c-1',
    code: 'C-001',
    name: 'ลูกค้าทดสอบ',
    customer_type: 'contractor',
    tier: 'silver',
    credit_term_days: 30,
    created_at: '2026-07-01T00:00:00.000Z',
    updated_at: '2026-07-01T00:00:00.000Z',
    ...over,
  };
}

beforeEach(() => {
  localStorage.clear();
});

// ─────────────────────────────────────────
describe('CRUD', () => {
  it('อ่าน collection ที่ยังไม่มีข้อมูลได้ array ว่าง', () => {
    expect(readAll('customers')).toEqual([]);
  });

  it('เขียนแล้วอ่านกลับได้เหมือนเดิม', () => {
    const rows = [customer(), customer({ id: 'c-2', name: 'ลูกค้าสอง' })];
    writeAll('customers', rows);
    expect(readAll('customers')).toEqual(rows);
  });

  it('insert สร้าง id ให้ถ้าไม่ส่งมา', () => {
    const created = insert('customers', customer({ id: '' }));
    expect(created.id).toBeTruthy();
    expect(readAll('customers')).toHaveLength(1);
  });

  it('insert เคารพ id ที่ส่งมา และเอาแถวใหม่ขึ้นบนสุด', () => {
    insert('customers', customer({ id: 'first' }));
    insert('customers', customer({ id: 'second' }));
    expect(readAll('customers').map(c => c.id)).toEqual(['second', 'first']);
  });

  it('update แก้เฉพาะฟิลด์ที่ส่งมา และไม่ย้ายตำแหน่งแถว', () => {
    insert('customers', customer({ id: 'a', name: 'เอ' }));
    insert('customers', customer({ id: 'b', name: 'บี' }));

    const updated = update('customers', 'a', { credit_term_days: 60 });

    expect(updated?.credit_term_days).toBe(60);
    expect(updated?.name).toBe('เอ');
    expect(readAll('customers').map(c => c.id)).toEqual(['b', 'a']);
  });

  it('update คืน null เมื่อไม่มี id นั้น และไม่แก้อะไร', () => {
    insert('customers', customer({ id: 'a' }));
    expect(update('customers', 'ไม่มีจริง', { name: 'x' })).toBeNull();
    expect(readAll('customers')).toHaveLength(1);
  });

  it('remove ลบเฉพาะแถวที่ระบุ', () => {
    insert('customers', customer({ id: 'a' }));
    insert('customers', customer({ id: 'b' }));

    remove('customers', 'a');
    expect(readAll('customers').map(c => c.id)).toEqual(['b']);

    // ลบ id ที่ไม่มีต้องไม่พังและไม่กระทบข้อมูล
    remove('customers', 'ไม่มีจริง');
    expect(readAll('customers')).toHaveLength(1);
  });

  it('findById', () => {
    insert('customers', customer({ id: 'a', name: 'เอ' }));
    expect(findById('customers', 'a')?.name).toBe('เอ');
    expect(findById('customers', 'zz')).toBeUndefined();
  });
});

// ─────────────────────────────────────────
describe('ข้อมูลเสียหาย', () => {
  it('JSON พังต้องคืน array ว่าง ไม่ throw', () => {
    localStorage.setItem('morix-db-customers', '{ นี่ไม่ใช่ json');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(readAll('customers')).toEqual([]);

    spy.mockRestore();
  });

  it('ข้อมูลที่ไม่ใช่ array ต้องคืน array ว่าง', () => {
    localStorage.setItem('morix-db-customers', '{"a":1}');
    expect(readAll('customers')).toEqual([]);
  });
});

// ─────────────────────────────────────────
describe('seed ข้อมูลตัวอย่าง', () => {
  it('เติมข้อมูลตอนว่างเปล่า', () => {
    expect(isEmpty()).toBe(true);
    expect(seedIfEmpty()).toBe(true);

    expect(isEmpty()).toBe(false);
    expect(readAll('products').length).toBeGreaterThan(0);
    expect(readAll('customers').length).toBeGreaterThan(0);
    expect(readAll('salesOrders').length).toBeGreaterThan(0);
    expect(readAll('payments').length).toBeGreaterThan(0);
    expect(getVersion()).toBe(DB_VERSION);
  });

  it('ไม่ทับข้อมูลเดิม — นี่คือข้อที่พลาดแล้วข้อมูลผู้ใช้หาย', () => {
    insert('customers', customer({ id: 'ของจริง', name: 'ลูกค้าจริงของผู้ใช้' }));
    insert('products', { id: 'p-1' } as never);

    expect(seedIfEmpty()).toBe(false);

    const rows = readAll('customers');
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('ลูกค้าจริงของผู้ใช้');
  });

  it('เคย seed แล้วลบข้อมูลออกจนหมด ต้องไม่ seed ซ้ำ (ผู้ใช้อาจลบเอง)', () => {
    seedIfEmpty();
    writeAll('products', []);
    writeAll('customers', []);

    expect(seedIfEmpty()).toBe(false);
    expect(readAll('products')).toEqual([]);
  });

  it('resetDatabase ล้างแล้ว seed ใหม่', () => {
    seedIfEmpty();
    insert('customers', customer({ id: 'จะหาย' }));

    resetDatabase();

    expect(findById('customers', 'จะหาย')).toBeUndefined();
    expect(readAll('products').length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────
describe('สำรองและกู้คืน', () => {
  it('export แล้ว import กลับได้ข้อมูลเดิมครบ (round-trip)', () => {
    seedIfEmpty();
    const before = loadDatabase();
    const backup = exportDatabase();

    expect(backup.version).toBe(DB_VERSION);
    expect(backup.exported_at).toBeTruthy();

    localStorage.clear();
    expect(isEmpty()).toBe(true);

    importDatabase(backup);

    expect(loadDatabase()).toEqual(before);
  });

  it('รับไฟล์ที่เป็น object ของ collection ตรงๆ ได้ด้วย', () => {
    importDatabase({ customers: [customer({ id: 'x' })] });
    expect(findById('customers', 'x')).toBeTruthy();
  });

  it('collection ที่ไม่มีในไฟล์กลายเป็นว่าง ไม่ใช่ค้างข้อมูลเดิม', () => {
    seedIfEmpty();
    importDatabase({ customers: [customer({ id: 'x' })] });

    expect(readAll('customers')).toHaveLength(1);
    expect(readAll('products')).toEqual([]);
  });

  it('ปฏิเสธไฟล์ที่ไม่ใช่ข้อมูล MORIX', () => {
    expect(() => importDatabase(null)).toThrow('ไฟล์สำรองไม่ถูกต้อง');
    expect(() => importDatabase('ข้อความ')).toThrow('ไฟล์สำรองไม่ถูกต้อง');
    expect(() => importDatabase({ foo: 'bar' })).toThrow('ไม่พบข้อมูล MORIX');
  });
});

// ─────────────────────────────────────────
describe('พื้นที่ที่ใช้', () => {
  it('ว่างเปล่าใช้ 0 ไบต์', () => {
    expect(estimateUsage().bytes).toBe(0);
  });

  it('มีข้อมูลแล้วนับได้และเปอร์เซ็นต์อยู่ในช่วง 0-100', () => {
    seedIfEmpty();
    const usage = estimateUsage();

    expect(usage.bytes).toBeGreaterThan(0);
    expect(usage.percent).toBeGreaterThanOrEqual(0);
    expect(usage.percent).toBeLessThanOrEqual(100);
  });

  it('formatBytes อ่านง่าย', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB');
  });
});

// ─────────────────────────────────────────
describe('พื้นที่เต็ม', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('โยน StorageFullError ที่จับได้ ไม่ fail เงียบ', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new Error('exceeded the quota');
      err.name = 'QuotaExceededError';
      throw err;
    });

    expect(() => writeAll('customers', [customer()])).toThrow(StorageFullError);
    // ข้อความต้องเป็นภาษาไทยเพราะเอาไปแสดงให้ผู้ใช้ตรงๆ
    expect(() => writeAll('customers', [customer()])).toThrow(/พื้นที่เก็บข้อมูล/);
  });
});

// ─────────────────────────────────────────
describe('เตือนให้สำรองข้อมูล', () => {
  it('ไม่เตือนตอนยังไม่มีข้อมูล', () => {
    expect(shouldRemindBackup()).toBe(false);
  });

  it('เตือนเมื่อมีข้อมูลแต่ยังไม่เคยสำรอง', () => {
    seedIfEmpty();
    expect(getLastBackupAt()).toBeNull();
    expect(shouldRemindBackup()).toBe(true);
  });

  it('ไม่เตือนทันทีหลังสำรอง', () => {
    seedIfEmpty();
    markBackedUp();

    expect(getLastBackupAt()).toBeTruthy();
    expect(shouldRemindBackup()).toBe(false);
  });

  it('เตือนอีกครั้งเมื่อผ่านไป 7 วัน', () => {
    seedIfEmpty();
    markBackedUp();

    const sixDays = new Date(Date.now() + 6 * 86_400_000);
    const sevenDays = new Date(Date.now() + 7 * 86_400_000);

    expect(shouldRemindBackup(sixDays)).toBe(false);
    expect(shouldRemindBackup(sevenDays)).toBe(true);
  });
});

// ─────────────────────────────────────────
describe('loadDatabase', () => {
  it('คืนทุก collection แม้ยังไม่มีข้อมูล', () => {
    const db = loadDatabase();
    for (const c of COLLECTIONS) {
      expect(Array.isArray(db[c])).toBe(true);
    }
  });
});
