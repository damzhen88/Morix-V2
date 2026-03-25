'use client';

import React, { useState } from 'react';
import { X, ShoppingCart, Package, Plus, Trash2, Truck, DollarSign, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface PurchaseOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPLIERS = [
  'Global Logistics Pro', 'China Direct Import Co.', 'Siam Materials Supply',
  'Pacific Trade Co.', 'Bangkok Hardware Co.',
];

const IMPORT_PRODUCTS = [
  { name: 'HPL Sheet 1220x2440mm', sku: 'HPL-SH-122', price: 85.00 },
  { name: 'WPC Decking Board 145x21mm', sku: 'WPC-DK-014', price: 120.00 },
  { name: 'Composite Cladding 160x12mm', sku: 'CP-CLD-160', price: 52.00 },
  { name: 'Aluminum Panel 120x240cm', sku: 'AL-PNL-001', price: 42.00 },
  { name: 'Stainless Steel Fastener M8', sku: 'SS-FST-M8', price: 3.50 },
];

const LOGISTICS_TYPES = [
  { label: 'China Domestic Freight', currency: 'CNY', rate: 7.2 },
  { label: 'China → Thailand Freight', currency: 'USD', rate: 35.42 },
  { label: 'Local Delivery (Bangkok)', currency: 'THB', rate: 1 },
];

interface LineItem { product: number; qty: number; unitPrice: number; }
interface LogisticsItem { type: number; amount: string; }

const THB_RATE = 35.42;

export default function PurchaseOrderFormModal({ isOpen, onClose }: PurchaseOrderFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState<LineItem[]>([{ product: 0, qty: 100, unitPrice: IMPORT_PRODUCTS[0].price }]);
  const [logistics, setLogistics] = useState<LogisticsItem[]>([]);
  const [note, setNote] = useState('');

  const itemsSubtotalUSD = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const itemsSubtotalTHB = itemsSubtotalUSD * THB_RATE;

  const logisticsTotalTHB = logistics.reduce((s, l) => {
    const lt = LOGISTICS_TYPES[l.type];
    const amt = parseFloat(l.amount) || 0;
    if (lt.currency === 'CNY') return s + amt * THB_RATE / 7.2;
    if (lt.currency === 'USD') return s + amt * THB_RATE;
    return s + amt;
  }, 0);

  const tax = itemsSubtotalTHB * 0.07;
  const grandTotalTHB = itemsSubtotalTHB + logisticsTotalTHB + tax;
  const grandTotalUSD = itemsSubtotalUSD + logisticsTotalTHB / THB_RATE + tax / THB_RATE;

  const addItem = () => setItems(p => [...p, { product: 0, qty: 100, unitPrice: IMPORT_PRODUCTS[0].price }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, k: keyof LineItem, v: number) => {
    setItems(p => {
      const n = [...p];
      n[i] = { ...n[i], [k]: v };
      if (k === 'product') n[i].unitPrice = IMPORT_PRODUCTS[v]?.price || 0;
      return n;
    });
  };

  const addLogistics = () => setLogistics(p => [...p, { type: 0, amount: '' }]);
  const removeLogistics = (i: number) => setLogistics(p => p.filter((_, idx) => idx !== i));
  const updateLogistics = (i: number, k: keyof LogisticsItem, v: string) => {
    setLogistics(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) { toast('Please select a supplier', 'error'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    toast(`PO created — ฿${grandTotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}`, 'success');
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const fieldStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-container-low)',
    border: '1px solid transparent',
    borderRadius: 12, padding: '0.75rem 1rem',
    width: '100%', fontSize: '0.875rem',
    color: 'var(--on-surface)', fontFamily: 'var(--font-body)', outline: 'none', transition: 'all 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.625rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }} />

      <div style={{
        position: 'relative', zIndex: 1, backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 24, width: '100%', maxWidth: 820,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--surface-container-lowest)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart style={{ width: 20, height: 20, color: '#D97706' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>New Purchase Order</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Import procurement from suppliers abroad</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Supplier + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><ShoppingCart style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Supplier *</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={supplier} onChange={e => setSupplier(e.target.value)}>
                    <option value="">Select supplier…</option>
                    {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}><Calendar style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />PO Date</label>
                <input type="date" style={fieldStyle} value={poDate} onChange={e => setPoDate(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={status} onChange={e => setStatus(e.target.value)}>
                    {['draft', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* Import Products */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  <Package style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />
                  Import Products <span style={{ fontSize: '0.5625rem', opacity: 0.6 }}>(prices in USD)</span>
                </label>
                <button type="button" onClick={addItem}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', borderRadius: 9999, border: 'none', backgroundColor: '#FEF3C7', color: '#D97706', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                  <Plus style={{ width: 14, height: 14 }} />Add Product
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 40px', gap: '0.5rem', padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                {['Product', 'Qty', 'Unit (USD)', 'Subtotal', ''].map((h, i) => (
                  <span key={i} style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>{h}</span>
                ))}
              </div>

              {items.map((item, idx) => {
                const prod = IMPORT_PRODUCTS[item.product];
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 40px', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <select style={{ ...fieldStyle, cursor: 'pointer', appearance: 'none', paddingRight: '2rem' }}
                      value={item.product} onChange={e => updateItem(idx, 'product', +e.target.value)}>
                      {IMPORT_PRODUCTS.map(p => <option key={p.sku} value={IMPORT_PRODUCTS.indexOf(p)}>{p.name}</option>)}
                    </select>
                    <input type="number" min="1" style={{ ...fieldStyle, textAlign: 'right' }}
                      value={item.qty} onChange={e => updateItem(idx, 'qty', +e.target.value)} />
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>$</span>
                      <input type="number" step="0.01" style={{ ...fieldStyle, paddingLeft: '1.5rem', textAlign: 'right' }}
                        value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', +e.target.value)} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)', textAlign: 'right' }}>
                      ${(item.qty * item.unitPrice).toFixed(2)}
                    </span>
                    <button type="button" onClick={() => removeItem(idx)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', justifyContent: 'center', padding: '0.25rem' }}>
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Logistics */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  <Truck style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />
                  Logistics & Shipping
                </label>
                <button type="button" onClick={addLogistics}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', borderRadius: 9999, border: 'none', backgroundColor: '#DBEAFE', color: '#2563EB', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                  <Plus style={{ width: 14, height: 14 }} />Add Cost
                </button>
              </div>

              {logistics.length === 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', padding: '0.75rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 12, textAlign: 'center' }}>
                  No logistics costs added yet
                </p>
              )}

              {logistics.map((l, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <select style={{ ...fieldStyle, cursor: 'pointer', appearance: 'none', paddingRight: '2rem' }}
                    value={l.type} onChange={e => updateLogistics(idx, 'type', e.target.value)}>
                    {LOGISTICS_TYPES.map((lt, i) => (
                      <option key={i} value={i}>{lt.label} ({lt.currency})</option>
                    ))}
                  </select>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                      {LOGISTICS_TYPES[l.type]?.currency === 'USD' ? '$' : LOGISTICS_TYPES[l.type]?.currency === 'CNY' ? '¥' : '฿'}
                    </span>
                    <input type="number" step="0.01" style={{ ...fieldStyle, paddingLeft: '1.75rem', textAlign: 'right' }}
                      placeholder="0.00" value={l.amount} onChange={e => updateLogistics(idx, 'amount', e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeLogistics(idx)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', justifyContent: 'center', padding: '0.25rem' }}>
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ backgroundColor: '#0f172a', borderRadius: 16, padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* USD Column */}
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.75rem' }}>USD</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Items Subtotal</span>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: '#94a3b8' }}>
                      ${itemsSubtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0' }}>Grand Total</span>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.125rem', color: '#f59e0b' }}>
                      ${grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* THB Column */}
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.75rem' }}>THB</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Items Subtotal', value: `฿${itemsSubtotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` },
                    { label: 'Logistics', value: `฿${logisticsTotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` },
                    { label: 'VAT (7%)', value: `฿${tax.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{r.label}</span>
                      <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0' }}>Grand Total</span>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.25rem', color: '#f97316' }}>
                      ฿{grandTotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 60 }}
                placeholder="Delivery address, special instructions…"
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '1rem 2rem 1.5rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--outline-variant)' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.875rem', borderRadius: 9999, border: '1.5px solid var(--outline)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{
                flex: 2, padding: '0.875rem', borderRadius: 9999, border: 'none',
                background: loading ? 'var(--surface-container-high)' : 'linear-gradient(135deg, #D97706, #B45309)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(217,119,6,0.3)',
                transition: 'all 150ms',
              }}>
              {loading
                ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />Creating…</>
                : `Create PO — ฿${grandTotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}`}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
