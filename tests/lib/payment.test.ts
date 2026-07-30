import { describe, it, expect } from 'vitest';
import {
  paidTotal,
  balance,
  overpaidAmount,
  paymentStatus,
  computeDueDate,
  daysOverdue,
  isOverdue,
  agingBucket,
  groupPaymentsByOrder,
  summarize,
  buildAgingReport,
  customerBalance,
  paymentSequenceLabelTH,
  toDateOnly,
  diffDays,
  addDays,
  type PaymentLike,
  type OrderLike,
} from '@/lib/payment';

// วันอ้างอิงคงที่ทุกเทส — ถ้าใช้ new Date() จริงเทสจะพังตามวันที่รัน
const TODAY = new Date('2026-07-30T10:00:00Z');

function pay(amount: number, paidAt = '2026-07-01', orderId = 'so-1'): PaymentLike {
  return { sales_order_id: orderId, amount_thb: amount, paid_at: paidAt };
}

function order(over: Partial<OrderLike> = {}): OrderLike {
  return {
    id: 'so-1',
    customer_id: 'cust-1',
    total: 10000,
    order_date: '2026-07-01',
    credit_term_days: 0,
    ...over,
  };
}

// ─────────────────────────────────────────
describe('ตัวช่วยวันที่', () => {
  it('toDateOnly ตัดเวลาออกทั้งจาก string และ Date', () => {
    expect(toDateOnly('2026-07-30T23:59:59.999Z')).toBe('2026-07-30');
    expect(toDateOnly('2026-07-30')).toBe('2026-07-30');
    expect(toDateOnly(new Date('2026-07-30T10:00:00'))).toBe('2026-07-30');
  });

  it('diffDays นับเป็นวัน ไม่สนเวลา', () => {
    expect(diffDays('2026-07-01', '2026-07-31')).toBe(30);
    expect(diffDays('2026-07-31', '2026-07-01')).toBe(-30);
    expect(diffDays('2026-07-30', '2026-07-30')).toBe(0);
    // ข้ามเวลาในวันเดียวกันต้องยังเป็น 0
    expect(diffDays('2026-07-30T00:00:00Z', '2026-07-30T23:00:00Z')).toBe(0);
  });

  it('addDays ข้ามเดือน ข้ามปี และปีอธิกสุรทิน', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-15', 30)).toBe('2027-01-14');
    // 2028 เป็นปีอธิกสุรทิน มี 29 ก.พ.
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01');
    // 2026 ไม่ใช่ปีอธิกสุรทิน
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });
});

// ─────────────────────────────────────────
describe('ยอดเงินและสถานะการชำระ', () => {
  it('ยังไม่จ่ายเลย', () => {
    expect(paidTotal([])).toBe(0);
    expect(balance(10000, [])).toBe(10000);
    expect(paymentStatus(10000, [])).toBe('unpaid');
  });

  it('จ่ายมัดจำบางส่วน', () => {
    const payments = [pay(3000)];
    expect(paidTotal(payments)).toBe(3000);
    expect(balance(10000, payments)).toBe(7000);
    expect(paymentStatus(10000, payments)).toBe('deposit');
  });

  it('จ่ายหลายงวดรวมเท่ายอดพอดี', () => {
    const payments = [pay(3000), pay(3000), pay(4000)];
    expect(balance(10000, payments)).toBe(0);
    expect(paymentStatus(10000, payments)).toBe('paid');
  });

  it('เศษทศนิยม 333.33 x 3 ต้องนับเป็นชำระครบของยอด 1000', () => {
    const payments = [pay(333.33), pay(333.33), pay(333.34)];
    expect(paymentStatus(1000, payments)).toBe('paid');
    expect(balance(1000, payments)).toBe(0);
  });

  it('เศษที่ขาดไปน้อยกว่าครึ่งสตางค์ยังถือว่าครบ', () => {
    // 333.33 x 3 = 999.99 ขาด 0.01 — ธุรกิจจริงถือว่าปิดยอดแล้ว
    const payments = [pay(333.33), pay(333.33), pay(333.33)];
    expect(paymentStatus(999.99, payments)).toBe('paid');
  });

  it('จ่ายเกิน', () => {
    const payments = [pay(12000)];
    expect(paymentStatus(10000, payments)).toBe('overpaid');
    expect(overpaidAmount(10000, payments)).toBe(2000);
  });

  it('ยอดคงเหลือไม่ติดลบแม้จ่ายเกิน', () => {
    expect(balance(10000, [pay(15000)])).toBe(0);
  });

  it('ยอดบิล 0 ถือว่าชำระครบ ไม่ใช่ค้างชำระ', () => {
    expect(paymentStatus(0, [])).toBe('unpaid');
    expect(balance(0, [])).toBe(0);
  });
});

// ─────────────────────────────────────────
describe('เครดิตและกำหนดชำระ', () => {
  it('เงินสด (0 วัน) ไม่มีกำหนดชำระ', () => {
    expect(computeDueDate('2026-07-01', 0)).toBeNull();
  });

  it('เครดิต 30/60/90 วัน', () => {
    expect(computeDueDate('2026-07-01', 30)).toBe('2026-07-31');
    expect(computeDueDate('2026-07-01', 60)).toBe('2026-08-30');
    expect(computeDueDate('2026-07-01', 90)).toBe('2026-09-29');
  });

  it('daysOverdue = 0 ในวันครบกำหนดพอดี และ 1 ในวันถัดมา', () => {
    expect(daysOverdue('2026-07-30', TODAY)).toBe(0);
    expect(daysOverdue('2026-07-29', TODAY)).toBe(1);
    // ยังไม่ถึงกำหนด
    expect(daysOverdue('2026-08-15', TODAY)).toBe(0);
  });

  it('ไม่มีกำหนดชำระ = ไม่เลยกำหนด', () => {
    expect(daysOverdue(null, TODAY)).toBe(0);
    expect(isOverdue(null, 5000, TODAY)).toBe(false);
  });

  it('บิลที่จ่ายครบแล้วต้องไม่เลยกำหนด แม้ผ่านมานาน', () => {
    // เคสสำคัญ — ถ้าพลาดข้อนี้บิลเก่าที่ปิดแล้วจะโผล่ในรายงานลูกหนี้
    expect(isOverdue('2020-01-01', 0, TODAY)).toBe(false);
    expect(agingBucket('2020-01-01', 0, TODAY)).toBe('current');
  });

  it('มียอดค้าง + เลยกำหนด = เลยกำหนดจริง', () => {
    expect(isOverdue('2026-07-29', 5000, TODAY)).toBe(true);
  });
});

// ─────────────────────────────────────────
describe('ช่วงอายุหนี้ ที่ขอบพอดี', () => {
  const cases: [string, number, string][] = [
    ['ยังไม่ครบกำหนด', 0, 'current'],
    ['เลย 1 วัน', 1, 'd0_30'],
    ['เลย 30 วันพอดี', 30, 'd0_30'],
    ['เลย 31 วัน', 31, 'd31_60'],
    ['เลย 60 วันพอดี', 60, 'd31_60'],
    ['เลย 61 วัน', 61, 'd60_plus'],
  ];

  for (const [label, overdue, expected] of cases) {
    it(`${label} -> ${expected}`, () => {
      const dueDate = addDays(toDateOnly(TODAY), -overdue);
      expect(agingBucket(dueDate, 1000, TODAY)).toBe(expected);
    });
  }
});

// ─────────────────────────────────────────
describe('groupPaymentsByOrder', () => {
  it('แยกตามบิลและเรียงตามวันที่รับเงิน', () => {
    const payments = [
      pay(100, '2026-07-20', 'so-1'),
      pay(200, '2026-07-05', 'so-1'),
      pay(300, '2026-07-10', 'so-2'),
    ];
    const grouped = groupPaymentsByOrder(payments);

    expect(grouped.get('so-1')!.map(p => p.paid_at)).toEqual(['2026-07-05', '2026-07-20']);
    expect(grouped.get('so-2')).toHaveLength(1);
    expect(grouped.has('so-3')).toBe(false);
  });
});

// ─────────────────────────────────────────
describe('summarize', () => {
  it('ใช้ due_date ที่เก็บไว้เป็นหลัก ไม่คำนวณทับ', () => {
    // เครดิตบอก 90 วัน แต่ due_date ที่เก็บบอก 30 — ต้องเชื่อ due_date
    const s = summarize(
      order({ credit_term_days: 90, due_date: '2026-07-31' }),
      [],
      TODAY
    );
    expect(s.dueDate).toBe('2026-07-31');
  });

  it('คำนวณกำหนดชำระให้เมื่อไม่มี due_date เก็บไว้', () => {
    const s = summarize(order({ credit_term_days: 30, due_date: null }), [], TODAY);
    expect(s.dueDate).toBe('2026-07-31');
  });

  it('สรุปยอดบิลที่จ่ายมัดจำแล้วและเลยกำหนด', () => {
    const s = summarize(
      order({ total: 10000, due_date: '2026-07-15' }),
      [pay(3000, '2026-07-02'), pay(1000, '2026-07-10')],
      TODAY
    );

    expect(s.paid).toBe(4000);
    expect(s.balance).toBe(6000);
    expect(s.status).toBe('deposit');
    expect(s.overdue).toBe(true);
    expect(s.daysOverdue).toBe(15);
    expect(s.bucket).toBe('d0_30');
    expect(s.lastPaidAt).toBe('2026-07-10');
    expect(s.paymentCount).toBe(2);
  });

  it('บิลที่ปิดยอดแล้ว daysOverdue เป็น 0', () => {
    const s = summarize(order({ due_date: '2026-01-01' }), [pay(10000)], TODAY);
    expect(s.status).toBe('paid');
    expect(s.overdue).toBe(false);
    expect(s.daysOverdue).toBe(0);
  });
});

// ─────────────────────────────────────────
describe('ป้ายลำดับการรับเงิน', () => {
  it('จ่ายครั้งเดียวเต็มจำนวน', () => {
    expect(paymentSequenceLabelTH(0, 1, true)).toBe('ชำระเต็มจำนวน');
  });

  it('ครั้งแรกที่ยังไม่ปิดยอด = มัดจำ', () => {
    expect(paymentSequenceLabelTH(0, 3, false)).toBe('มัดจำ');
  });

  it('ครั้งกลาง = งวดที่ N', () => {
    expect(paymentSequenceLabelTH(1, 3, false)).toBe('งวดที่ 2');
  });

  it('ครั้งที่ปิดยอด', () => {
    expect(paymentSequenceLabelTH(2, 3, true)).toBe('ชำระปิดยอด');
  });
});

// ─────────────────────────────────────────
describe('buildAgingReport', () => {
  const orders: OrderLike[] = [
    // ค้าง 6000 เลยกำหนด 15 วัน
    { id: 'so-1', customer_id: 'c1', total: 10000, order_date: '2026-06-15', due_date: '2026-07-15' },
    // ค้าง 5000 เลยกำหนด 45 วัน
    { id: 'so-2', customer_id: 'c1', total: 5000, order_date: '2026-05-16', due_date: '2026-06-15' },
    // ค้าง 8000 ยังไม่ครบกำหนด
    { id: 'so-3', customer_id: 'c2', total: 8000, order_date: '2026-07-20', due_date: '2026-08-19' },
    // ปิดยอดแล้ว ต้องไม่อยู่ในรายงาน
    { id: 'so-4', customer_id: 'c2', total: 3000, order_date: '2026-01-01', due_date: '2026-01-31' },
  ];

  const paymentsByOrder = groupPaymentsByOrder([
    pay(4000, '2026-07-01', 'so-1'),
    pay(3000, '2026-02-01', 'so-4'),
  ]);

  const names = new Map([
    ['c1', 'บริษัท เอ จำกัด'],
    ['c2', 'คุณบี'],
  ]);

  const report = buildAgingReport(orders, paymentsByOrder, names, TODAY);

  it('ไม่นับบิลที่ปิดยอดแล้ว', () => {
    expect(report.outstanding.map(o => o.order.id)).not.toContain('so-4');
    expect(report.totals.orderCount).toBe(3);
  });

  it('จัดยอดเข้าช่วงอายุหนี้ถูกช่อง', () => {
    const c1 = report.rows.find(r => r.customerId === 'c1')!;
    expect(c1.d0_30).toBe(6000);   // so-1 เลย 15 วัน
    expect(c1.d31_60).toBe(5000);  // so-2 เลย 45 วัน
    expect(c1.total).toBe(11000);
    expect(c1.orderCount).toBe(2);

    const c2 = report.rows.find(r => r.customerId === 'c2')!;
    expect(c2.current).toBe(8000);
    expect(c2.total).toBe(8000);
  });

  it('ยอดรวมเท่ากับผลรวมแถว และเท่ากับผลรวมยอดค้างของบิล', () => {
    const sumRows = report.rows.reduce((s, r) => s + r.total, 0);
    const sumOrders = report.outstanding.reduce((s, o) => s + o.summary.balance, 0);

    expect(report.totals.total).toBe(19000);
    expect(sumRows).toBe(19000);
    expect(sumOrders).toBe(19000);
  });

  it('ยอดรวมแต่ละช่วงเท่ากับผลรวมของช่วงนั้นในทุกแถว', () => {
    for (const bucket of ['current', 'd0_30', 'd31_60', 'd60_plus'] as const) {
      const sum = report.rows.reduce((s, r) => s + r[bucket], 0);
      expect(report.totals[bucket]).toBe(sum);
    }
  });

  it('เรียงลูกค้าตามยอดค้างมากสุดก่อน', () => {
    expect(report.rows.map(r => r.customerId)).toEqual(['c1', 'c2']);
  });

  it('เรียงบิลค้างตามเลยกำหนดนานสุดก่อน', () => {
    expect(report.outstanding.map(o => o.order.id)).toEqual(['so-2', 'so-1', 'so-3']);
  });

  it('ใส่ชื่อลูกค้า และมี fallback เมื่อหาไม่เจอ', () => {
    expect(report.rows.find(r => r.customerId === 'c1')!.customerName).toBe('บริษัท เอ จำกัด');

    const orphan = buildAgingReport(
      [{ id: 'so-x', customer_id: 'ไม่มีในระบบ', total: 100, order_date: '2026-07-01' }],
      new Map(),
      new Map(),
      TODAY
    );
    expect(orphan.rows[0].customerName).toBe('ไม่ระบุลูกค้า');
  });

  it('ไม่มีบิลค้างเลย ได้รายงานว่างที่ยอดเป็น 0', () => {
    const empty = buildAgingReport([], new Map(), new Map(), TODAY);
    expect(empty.rows).toEqual([]);
    expect(empty.totals.total).toBe(0);
    expect(empty.outstanding).toEqual([]);
  });
});

// ─────────────────────────────────────────
describe('customerBalance', () => {
  it('รวมยอดค้างของลูกค้ารายเดียวจากทุกบิล', () => {
    const orders: OrderLike[] = [
      { id: 'so-1', customer_id: 'c1', total: 10000, order_date: '2026-07-01' },
      { id: 'so-2', customer_id: 'c1', total: 5000, order_date: '2026-07-01' },
      { id: 'so-3', customer_id: 'c2', total: 9000, order_date: '2026-07-01' },
    ];
    const grouped = groupPaymentsByOrder([pay(4000, '2026-07-05', 'so-1')]);

    expect(customerBalance('c1', orders, grouped)).toBe(11000);
    expect(customerBalance('c2', orders, grouped)).toBe(9000);
    expect(customerBalance('ไม่มี', orders, grouped)).toBe(0);
  });
});
