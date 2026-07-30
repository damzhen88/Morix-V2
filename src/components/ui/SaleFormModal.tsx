'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, TrendingUp, User, Package, Plus, Trash2, Calendar, ChevronDown, CalendarClock, Wallet } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useApp, useMutations } from '@/store';
import { StorageFullError, readSettings } from '@/lib/local-db';
import { formatTHB } from '@/lib/format';
import { CREDIT_TERM_OPTIONS, creditTermLabelTH, computeDueDate, toDateOnly } from '@/lib/payment';
import { formatThaiDate } from '@/lib/format';
import type { OrderItem, Payment, SalesOrder } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LineItem {
  /** id ของสินค้าใน store — ว่างคือยังไม่เลือก */
  productId: string;
  qty: number;
  unitPrice: number;
  /** ต้นทุนต่อหน่วย ดึงจากสินค้า แก้ได้ */
  unitCost: number;
}

const STATUS_OPTIONS: { value: SalesOrder['status']; label: string }[] = [
  { value: 'quoted', label: 'เสนอราคา' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'delivered', label: 'จัดส่งแล้ว' },
  { value: 'draft', label: 'ฉบับร่าง' },
];



export default function SaleFormModal({ isOpen, onClose }: SaleFormModalProps) {
  const { toast } = useToast();
  const { state } = useApp();
  const { addSalesOrder, addPayment } = useMutations();

  const [saving, setSaving] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [orderDate, setOrderDate] = useState(toDateOnly(new Date()));
  const [status, setStatus] = useState<SalesOrder['status']>('confirmed');
  const [items, setItems] = useState<LineItem[]>([{ productId: '', qty: 1, unitPrice: 0, unitCost: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [transportCost, setTransportCost] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [creditTermDays, setCreditTermDays] = useState(0);
  const [note, setNote] = useState('');
  /** อัตรา VAT มาจากหน้าตั้งค่า อ่านหลัง mount เพราะ localStorage ไม่มีตอน SSR */
  const [vatPercent, setVatPercent] = useState(7);

  const products = state.products;
  const customers = state.customers;
  const selectedCustomer = customers.find(c => c.id === customerId);

  // ล้างฟอร์มทุกครั้งที่เปิดใหม่ ไม่ให้ค่าจากบิลก่อนค้างมา
  useEffect(() => {
    if (!isOpen) return;
    setVatPercent(readSettings().vatPercent);
    setCustomerId('');
    setOrderDate(toDateOnly(new Date()));
    setStatus('confirmed');
    setItems([{ productId: '', qty: 1, unitPrice: 0, unitCost: 0 }]);
    setDiscount(0);
    setTransportCost(0);
    setDepositAmount(0);
    setCreditTermDays(0);
    setNote('');
  }, [isOpen]);

  // เงื่อนไขเครดิตตั้งต้นตามลูกค้าที่เลือก แก้ต่อบิลได้
  useEffect(() => {
    if (selectedCustomer) setCreditTermDays(selectedCustomer.credit_term_days ?? 0);
  }, [selectedCustomer]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
    // ต้นทุนสินค้าคือผลรวมต้นทุนต่อหน่วย ไม่ใช่ยอดขาย (ของเดิมเอา subtotal มาเป็น cost)
    const productCost = items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);

    const afterDiscount = subtotal - discount;
    const vat = afterDiscount * (vatPercent / 100);
    const total = afterDiscount + vat + transportCost;

    const grossProfit = afterDiscount - productCost;
    const netProfit = grossProfit - transportCost;

    return { subtotal, productCost, afterDiscount, vat, total, grossProfit, netProfit };
  }, [items, discount, transportCost, vatPercent]);

  const dueDate = computeDueDate(orderDate, creditTermDays);

  const addItem = () => setItems(prev => [...prev, { productId: '', qty: 1, unitPrice: 0, unitCost: 0 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, patch: Partial<LineItem>) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };

      // เลือกสินค้าแล้วเติมราคาขายและต้นทุนให้อัตโนมัติ
      if (patch.productId !== undefined) {
        const product = products.find(p => p.id === patch.productId);
        if (product) {
          next[idx].unitPrice = product.price_thb ?? 0;
          next[idx].unitCost = product.cost_thb ?? 0;
        }
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) { toast('กรุณาเลือกลูกค้า', 'error'); return; }

    const validItems = items.filter(i => i.productId && i.qty > 0);
    if (validItems.length === 0) { toast('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ', 'error'); return; }
    if (depositAmount > totals.total) { toast('ยอดมัดจำมากกว่ายอดบิล', 'error'); return; }

    setSaving(true);
    try {
      const now = new Date().toISOString();

      const orderItems: OrderItem[] = validItems.map(i => {
        const lineTotal = i.qty * i.unitPrice;
        const lineCost = i.qty * i.unitCost;
        return {
          id: uuidv4(),
          product_id: i.productId,
          quantity: i.qty,
          unit_price_thb: i.unitPrice,
          discount_percent: 0,
          total_thb: lineTotal,
          cost_thb: lineCost,
          profit_thb: lineTotal - lineCost,
        };
      });

      const order = addSalesOrder({
        id: '',
        order_number: `SO-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        customer_type: selectedCustomer.customer_type,
        status,
        items: orderItems,
        subtotal: totals.subtotal,
        discount,
        transport_cost: transportCost,
        labor_cost: 0,
        total: totals.total,
        product_cost_thb: totals.productCost,
        gross_profit: totals.grossProfit,
        net_profit: totals.netProfit,
        order_date: orderDate,
        credit_term_days: creditTermDays,
        due_date: dueDate,
        notes: note || undefined,
        images: [],
        created_by: 'local',
        created_at: now,
        updated_at: now,
      } as SalesOrder);

      // มัดจำคือการรับเงินแถวแรกของบิล ไม่ใช่ฟิลด์แยก
      if (depositAmount > 0) {
        addPayment({
          id: '',
          sales_order_id: order.id,
          paid_at: orderDate,
          amount_thb: depositAmount,
          method: 'cash',
          note: 'มัดจำ (บันทึกพร้อมเปิดบิล)',
          has_slip: false,
          created_at: now,
        } as Payment);
      }

      toast(
        depositAmount > 0
          ? `เปิดบิล ${order.order_number} และรับมัดจำ ${formatTHB(depositAmount)} แล้ว`
          : `เปิดบิล ${order.order_number} — ${formatTHB(totals.total)}`,
        'success'
      );
      onClose();
    } catch (err) {
      toast(err instanceof StorageFullError ? err.message : 'เปิดบิลไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const fieldStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-container-low)',
    border: '1px solid transparent',
    borderRadius: 12, padding: '0.75rem 1rem',
    width: '100%', fontSize: '0.875rem',
    color: 'var(--on-surface)', fontFamily: 'var(--font-body)', outline: 'none', transition: 'all 0.15s',
  };

  // ไม่ uppercase และไม่ tracking กว้าง — ไม่มีผลกับไทยและตัดวรรณยุกต์
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 700,
    letterSpacing: '0.02em',
    color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
  };

  const summaryRows = [
    { label: 'รวมค่าสินค้า', value: formatTHB(totals.subtotal) },
    ...(discount > 0 ? [{ label: 'ส่วนลด', value: `-${formatTHB(discount)}` }] : []),
    { label: `VAT ${Number(vatPercent.toFixed(2))}%`, value: formatTHB(totals.vat) },
    ...(transportCost > 0 ? [{ label: 'ค่าขนส่ง', value: formatTHB(transportCost) }] : []),
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} />

      <div style={{
        position: 'relative', zIndex: 1, backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 24, width: '100%', maxWidth: 760,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
      }}>
        {/* หัว modal */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--surface-container-lowest)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ width: 20, height: 20, color: '#2563EB' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>เปิดบิลขายใหม่</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>รับมัดจำได้เลยตอนเปิดบิล</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="ปิด" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ลูกค้า / วันที่ / สถานะ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><User style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />ลูกค้า *</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={customerId} onChange={e => setCustomerId(e.target.value)}>
                    <option value="">เลือกลูกค้า…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
                {customers.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.375rem' }}>
                    ยังไม่มีลูกค้าในระบบ กรุณาเพิ่มลูกค้าก่อน
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}><Calendar style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />วันที่เปิดบิล</label>
                <input type="date" style={fieldStyle} value={orderDate} onChange={e => setOrderDate(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>สถานะบิล</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={status} onChange={e => setStatus(e.target.value as SalesOrder['status'])}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* รายการสินค้า */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}><Package style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />รายการสินค้า</label>
                <button type="button" onClick={addItem}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', borderRadius: 9999, border: 'none', backgroundColor: 'var(--primary-container)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-body)', flexShrink: 0 }}>
                  <Plus style={{ width: 14, height: 14 }} />เพิ่มรายการ
                </button>
              </div>

              {/* หัวตาราง — ซ่อนบนจอเล็กเพราะแถวจะเรียงเป็นบล็อกแทน */}
              <div className="hidden sm:grid" style={{ gridTemplateColumns: '1fr 70px 110px 110px 100px 36px', gap: '0.5rem', padding: '0.25rem 0 0.5rem' }}>
                {['สินค้า', 'จำนวน', 'ราคา/หน่วย', 'ต้นทุน/หน่วย', 'รวม', ''].map((h, i) => (
                  <span key={i} style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>{h}</span>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 sm:grid-cols-[1fr_70px_110px_110px_100px_36px]" style={{ gap: '0.5rem', alignItems: 'center' }}>
                    <div className="col-span-2 sm:col-span-1">
                      <select style={{ ...fieldStyle, cursor: 'pointer', appearance: 'none' }}
                        value={item.productId} onChange={e => updateItem(idx, { productId: e.target.value })}>
                        <option value="">เลือกสินค้า…</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name_th}</option>)}
                      </select>
                    </div>

                    <label className="sm:hidden" style={{ ...labelStyle, marginBottom: 0, alignSelf: 'center' }}>จำนวน</label>
                    <input type="number" min="1" inputMode="numeric" aria-label="จำนวน" style={{ ...fieldStyle, textAlign: 'right' }}
                      value={item.qty} onChange={e => updateItem(idx, { qty: Math.max(0, +e.target.value) })} />

                    <label className="sm:hidden" style={{ ...labelStyle, marginBottom: 0, alignSelf: 'center' }}>ราคา/หน่วย</label>
                    <input type="number" min="0" inputMode="decimal" aria-label="ราคาต่อหน่วย" style={{ ...fieldStyle, textAlign: 'right' }}
                      value={item.unitPrice} onChange={e => updateItem(idx, { unitPrice: Math.max(0, +e.target.value) })} />

                    <label className="sm:hidden" style={{ ...labelStyle, marginBottom: 0, alignSelf: 'center' }}>ต้นทุน/หน่วย</label>
                    <input type="number" min="0" inputMode="decimal" aria-label="ต้นทุนต่อหน่วย" style={{ ...fieldStyle, textAlign: 'right' }}
                      value={item.unitCost} onChange={e => updateItem(idx, { unitCost: Math.max(0, +e.target.value) })} />

                    <span className="col-span-1 sm:col-span-1" style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)', textAlign: 'right' }}>
                      {formatTHB(item.qty * item.unitPrice)}
                    </span>

                    <button type="button" onClick={() => removeItem(idx)} aria-label="ลบรายการ"
                      disabled={items.length === 1}
                      style={{ background: 'transparent', border: 'none', cursor: items.length === 1 ? 'not-allowed' : 'pointer', opacity: items.length === 1 ? 0.3 : 1, color: 'var(--error)', display: 'flex', justifyContent: 'center', padding: '0.25rem' }}>
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ส่วนลด + ค่าขนส่ง */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>ส่วนลด (บาท)</label>
                <input type="number" min="0" inputMode="decimal" style={{ ...fieldStyle, textAlign: 'right' }}
                  value={discount} onChange={e => setDiscount(Math.max(0, +e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>ค่าขนส่ง (บาท)</label>
                <input type="number" min="0" inputMode="decimal" style={{ ...fieldStyle, textAlign: 'right' }}
                  value={transportCost} onChange={e => setTransportCost(Math.max(0, +e.target.value))} />
              </div>
            </div>

            {/* เงื่อนไขการชำระเงิน */}
            <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  <CalendarClock style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                  เงื่อนไขการชำระเงิน
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {CREDIT_TERM_OPTIONS.map(days => {
                    const active = creditTermDays === days;
                    return (
                      <button key={days} type="button" onClick={() => setCreditTermDays(days)}
                        style={{
                          flex: '1 1 6rem', padding: '0.625rem 0.5rem', borderRadius: 12,
                          border: '2px solid', cursor: 'pointer',
                          fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 700,
                          transition: 'all 150ms',
                          borderColor: active ? 'var(--primary)' : 'var(--outline-variant)',
                          backgroundColor: active ? 'var(--primary-container)' : 'var(--surface-container-lowest)',
                          color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
                        }}>
                        {creditTermLabelTH(days)}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
                  {dueDate
                    ? `ครบกำหนดชำระ ${formatThaiDate(dueDate)}`
                    : 'ชำระทันที ไม่มีกำหนดชำระให้ติดตาม'}
                  {selectedCustomer && selectedCustomer.credit_term_days !== creditTermDays && (
                    <> · ลูกค้ารายนี้ตั้งค่าไว้ {creditTermLabelTH(selectedCustomer.credit_term_days)}</>
                  )}
                </p>
              </div>

              {/* รับมัดจำ */}
              <div>
                <label style={labelStyle}>
                  <Wallet style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                  รับมัดจำตอนนี้ (ไม่บังคับ)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="number" min="0" inputMode="decimal" placeholder="0"
                    style={{ ...fieldStyle, textAlign: 'right', flex: '1 1 8rem' }}
                    value={depositAmount || ''} onChange={e => setDepositAmount(Math.max(0, +e.target.value))} />
                  {[0.3, 0.5].map(pct => (
                    <button key={pct} type="button"
                      onClick={() => setDepositAmount(Math.round(totals.total * pct))}
                      disabled={totals.total <= 0}
                      style={{
                        padding: '0.625rem 0.875rem', borderRadius: 9999, border: 'none',
                        backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)',
                        cursor: totals.total > 0 ? 'pointer' : 'not-allowed',
                        opacity: totals.total > 0 ? 1 : 0.4,
                        fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                      }}>
                      {pct * 100}%
                    </button>
                  ))}
                  {depositAmount > 0 && (
                    <button type="button" onClick={() => setDepositAmount(0)}
                      style={{ padding: '0.625rem 0.875rem', borderRadius: 9999, border: 'none', background: 'transparent', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                      ล้าง
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* สรุปยอด */}
            <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {summaryRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--on-surface)' }}>{row.value}</span>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)' }}>ยอดรวมทั้งสิ้น</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: '#2563EB' }}>
                  {formatTHB(totals.total)}
                </span>
              </div>

              {depositAmount > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>รับมัดจำ</span>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--success)' }}>
                      -{formatTHB(depositAmount)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>คงเหลือ</span>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                      {formatTHB(Math.max(0, totals.total - depositAmount))}
                    </span>
                  </div>
                </>
              )}

              {/* กำไรที่คำนวณถูกแล้ว — ของเดิมเก็บ profit เป็น (VAT - ส่วนลด) และ cost เป็นยอดขาย */}
              <div style={{ borderTop: '1px dashed var(--outline-variant)', paddingTop: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                  ต้นทุนสินค้า {formatTHB(totals.productCost)}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: totals.netProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  กำไรสุทธิ {formatTHB(totals.netProfit)}
                </span>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div>
              <label style={labelStyle}>หมายเหตุ</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 60 }}
                placeholder="รายละเอียดการจัดส่ง หรือข้อตกลงพิเศษ"
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>

          {/* ปุ่มท้าย modal */}
          <div style={{ padding: '1rem 2rem 1.5rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--outline-variant)' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.875rem', borderRadius: 9999, border: '1.5px solid var(--outline)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={saving}
              style={{
                flex: 2, padding: '0.875rem', borderRadius: 9999, border: 'none',
                background: saving ? 'var(--surface-container-high)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: saving ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
                transition: 'all 150ms',
              }}>
              {saving ? (
                <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />กำลังบันทึก…</>
              ) : `เปิดบิล — ${formatTHB(totals.total)}`}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
