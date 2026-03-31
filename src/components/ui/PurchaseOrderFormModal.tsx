'use client';

import React, { useState } from 'react';
import { X, ShoppingCart, Package, Plus, Trash2, Truck, ChevronDown, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/supabase';

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
  const [expectedDate, setExpectedDate] = useState('');
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

  const logisticsTotalUSD = logistics.reduce((s, l) => {
    const lt = LOGISTICS_TYPES[l.type];
    const amt = parseFloat(l.amount) || 0;
    if (lt.currency === 'CNY') return s + amt / 7.2;
    if (lt.currency === 'THB') return s + amt / THB_RATE;
    return s + amt;
  }, 0);

  const tax = itemsSubtotalTHB * 0.07;
  const grandTotalTHB = itemsSubtotalTHB + logisticsTotalTHB + tax;
  const grandTotalUSD = itemsSubtotalUSD + logisticsTotalUSD + tax / THB_RATE;

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
    try {
      await api.createPurchaseOrder({
        po_number: `PO-${Date.now()}`,
        supplier_id: supplier,
        order_date: new Date().toISOString().split('T')[0],
        expected_arrival_date: expectedDate || null,
        status: 'pending',
        currency: 'CNY',
        exchange_rate_thb: THB_RATE,
        total_thb: grandTotalTHB,
        notes: note || null,
      });
      toast(`PO created — ฿${grandTotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}`, 'success');
      onClose();
    } catch (err: any) {
      toast('Failed to create PO: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-container-low)',
    border: 'none',
    borderRadius: 10,
    padding: '0.625rem 0.875rem',
    width: '100%',
    fontSize: '0.8125rem',
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'all 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    marginBottom: '0.375rem',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }} />

      {/* Modal Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 20,
        width: '100%',
        maxWidth: 680,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>

        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--surface-container-lowest)',
          zIndex: 2,
          borderRadius: '20px 20px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart style={{ width: 18, height: 18, color: '#D97706' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface)' }}>New Purchase Order</h2>
              <p style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)', marginTop: 1 }}>Import procurement from suppliers abroad</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 8, color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Header Fields - Combined */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Supplier *</label>
              <div style={{ position: 'relative' }}>
                <select style={{ ...inputStyle, paddingRight: '2rem', cursor: 'pointer', appearance: 'none' }}
                  value={supplier} onChange={e => setSupplier(e.target.value)}>
                  <option value="">Select…</option>
                  {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>PO Date</label>
              <input type="date" style={inputStyle} value={poDate} onChange={e => setPoDate(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ position: 'relative' }}>
                <select style={{ ...inputStyle, paddingRight: '2rem', cursor: 'pointer', appearance: 'none' }}
                  value={status} onChange={e => setStatus(e.target.value)}>
                  {['draft', 'confirmed', 'shipped', 'delivered'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 14, padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package style={{ width: 14, height: 14, color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)' }}>Products</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--on-surface-variant)' }}>({items.length})</span>
              </div>
              <button type="button" onClick={addItem}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.375rem 0.75rem', borderRadius: 8, border: 'none', backgroundColor: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 700 }}>
                <Plus style={{ width: 12, height: 12 }} />Add
              </button>
            </div>

            {/* Product Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px 36px', gap: '0.5rem', alignItems: 'center' }}>
                  <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', paddingRight: '1.5rem' }}
                    value={item.product} onChange={e => updateItem(idx, 'product', +e.target.value)}>
                    {IMPORT_PRODUCTS.map((p, i) => <option key={p.sku} value={i}>{p.name}</option>)}
                  </select>
                  <input type="number" min="1" style={{ ...inputStyle, textAlign: 'right' }}
                    value={item.qty} onChange={e => updateItem(idx, 'qty', +e.target.value)} />
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>$</span>
                    <input type="number" step="0.01" style={{ ...inputStyle, paddingLeft: '1.5rem', textAlign: 'right' }}
                      value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', +e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeItem(idx)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', justifyContent: 'center', padding: '0.25rem' }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics Section */}
          <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 14, padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck style={{ width: 14, height: 14, color: '#2563EB' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)' }}>Logistics</span>
              </div>
              <button type="button" onClick={addLogistics}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.375rem 0.75rem', borderRadius: 8, border: 'none', backgroundColor: '#2563EB', color: 'white', cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 700 }}>
                <Plus style={{ width: 12, height: 12 }} />Add
              </button>
            </div>

            {logistics.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'center', padding: '0.5rem' }}>No logistics added</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {logistics.map((l, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 36px', gap: '0.5rem', alignItems: 'center' }}>
                    <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', paddingRight: '1.5rem' }}
                      value={l.type} onChange={e => updateLogistics(idx, 'type', e.target.value)}>
                      {LOGISTICS_TYPES.map((lt, i) => <option key={i} value={i}>{lt.label}</option>)}
                    </select>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>
                        {LOGISTICS_TYPES[l.type]?.currency === 'USD' ? '$' : LOGISTICS_TYPES[l.type]?.currency === 'CNY' ? '¥' : '฿'}
                      </span>
                      <input type="number" step="0.01" style={{ ...inputStyle, paddingLeft: '1.5rem', textAlign: 'right' }}
                        placeholder="0" value={l.amount} onChange={e => updateLogistics(idx, 'amount', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removeLogistics(idx)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', justifyContent: 'center', padding: '0.25rem' }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary - Combined dark card */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: 14, padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {/* THB Column */}
            <div>
              <p style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.5rem' }}>THB</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {[
                  { label: 'Items', value: `฿${itemsSubtotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` },
                  { label: 'Logistics', value: `฿${logisticsTotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` },
                  { label: 'Tax (7%)', value: `฿${tax.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>{r.label}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#e2e8f0' }}>Total</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#f97316' }}>฿{grandTotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* USD Column */}
            <div>
              <p style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.5rem' }}>USD</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Items</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>${itemsSubtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Logistics</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>${logisticsTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#e2e8f0' }}>Total</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>${grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, resize: 'none', minHeight: 48 }}
              placeholder="Delivery address, special instructions…"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '0.625rem', paddingTop: '0.25rem' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1.5px solid var(--outline)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--on-surface)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{
                flex: 2, padding: '0.75rem', borderRadius: 12, border: 'none',
                background: loading ? 'var(--surface-container-high)' : 'linear-gradient(135deg, #D97706, #B45309)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8125rem', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(217,119,6,0.3)',
                transition: 'all 150ms',
              }}>
              {loading ? (
                <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />Creating…</>
              ) : (
                <>
                  <Save style={{ width: 14, height: 14 }} />
                  Create PO — ฿{grandTotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                </>
              )}
            </button>
          </div>
        </form>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}