'use client';

import React, { useState } from 'react';
import { X, TrendingUp, User, Package, Plus, Trash2, Calendar, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/supabase';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLIENTS = [
  'AEC Living Co., Ltd.', 'Skyline Interior Design', 'Modern Home Corporation',
  'Urban Build Co.', 'Lumpoon Architecture Studio', 'New Client…',
];

const PRODUCTS = [
  { name: 'Aluminum Panel 120x240cm', sku: 'AL-PNL-001', price: 2850 },
  { name: 'WPC Decking Board 145x21mm', sku: 'WPC-DK-014', price: 4200 },
  { name: 'HPL Sheet 1220x2440mm', sku: 'HPL-SH-122', price: 5600 },
  { name: 'Aluminum Trim Strip 2.5m', sku: 'AL-TRM-025', price: 380 },
  { name: 'Composite Cladding 160x12mm', sku: 'CP-CLD-160', price: 1850 },
];

interface LineItem {
  product: number;
  qty: number;
  unitPrice: number;
}

export default function SaleFormModal({ isOpen, onClose }: SaleFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('confirmed');
  const [items, setItems] = useState<LineItem[]>([
    { product: 0, qty: 1, unitPrice: PRODUCTS[0].price },
  ]);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState('');

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;
  const vat = total * 0.07;
  const grandTotal = total + vat;

  const addItem = () => setItems(prev => [...prev, { product: 0, qty: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: keyof LineItem, value: number) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      if (key === 'product') {
        next[idx].unitPrice = PRODUCTS[value]?.price || 0;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) { toast('Please select a client', 'error'); return; }
    if (items.length === 0) { toast('Please add at least one item', 'error'); return; }
    setLoading(true);
    try {
      await api.createSalesOrder({
        order_number: `SO-${Date.now()}`,
        customer_id: client.id,
        order_date: new Date().toISOString().split('T')[0],
        status: 'confirmed',
        total_thb: grandTotal,
        profit_thb: grandTotal - subtotal,
        cost_thb: subtotal,
        shipping_thb: 0,
      });
      toast(`Sale order created — ฿${grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 0 })}`, 'success');
      onClose();
    } catch (err: any) {
      toast('Failed to create sale: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
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

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.625rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} />

      <div style={{
        position: 'relative', zIndex: 1, backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 24, width: '100%', maxWidth: 760,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--surface-container-lowest)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ width: 20, height: 20, color: '#2563EB' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>New Sale Order</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Record an outbound sale transaction</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Client + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><User style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Client *</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={client} onChange={e => setClient(e.target.value)}>
                    <option value="">Select client…</option>
                    {CLIENTS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}><Calendar style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Order Date</label>
                <input type="date" style={fieldStyle} value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={status} onChange={e => setStatus(e.target.value)}>
                    {['confirmed', 'pending', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}><Package style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Line Items</label>
                <button type="button" onClick={addItem}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', borderRadius: 9999, border: 'none', backgroundColor: 'var(--primary-container)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                  <Plus style={{ width: 14, height: 14 }} />Add Item
                </button>
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 120px 40px', gap: '0.5rem', padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                {['Product', 'Qty', 'Unit Price', 'Subtotal', ''].map((h, i) => (
                  <span key={i} style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>{h}</span>
                ))}
              </div>

              {items.map((item, idx) => {
                const product = PRODUCTS[item.product];
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 120px 40px', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <select style={{ ...fieldStyle, cursor: 'pointer', appearance: 'none', paddingRight: '2rem' }}
                      value={item.product} onChange={e => updateItem(idx, 'product', +e.target.value)}>
                      {PRODUCTS.map((p, i) => <option key={p.sku} value={i}>{p.name}</option>)}
                    </select>
                    <input type="number" min="1" style={{ ...fieldStyle, textAlign: 'right' }}
                      value={item.qty} onChange={e => updateItem(idx, 'qty', +e.target.value)} />
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>฿</span>
                      <input type="number" style={{ ...fieldStyle, paddingLeft: '1.75rem', textAlign: 'right' }}
                        value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', +e.target.value)} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)', textAlign: 'right' }}>
                      ฿{(item.qty * item.unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                    </span>
                    <button type="button" onClick={() => removeItem(idx)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', justifyContent: 'center', padding: '0.25rem' }}>
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Discount */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <label style={{ ...labelStyle, marginBottom: 0, whiteSpace: 'nowrap' }}>Discount (%)</label>
              <input type="number" min="0" max="100" style={{ ...fieldStyle, width: 80, textAlign: 'center' }}
                value={discount} onChange={e => setDiscount(+e.target.value)} />
            </div>

            {/* Summary */}
            <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Subtotal', value: `฿${subtotal.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` },
                ...(discountAmount > 0 ? [{ label: `Discount (${discount}%)`, value: `-฿${discountAmount.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` }] : []),
                { label: 'VAT (7%)', value: `฿${vat.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--on-surface)' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)' }}>Grand Total</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.25rem', color: '#2563EB' }}>
                  ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 60 }}
                placeholder="Delivery instructions, special notes…"
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
                background: loading ? 'var(--surface-container-high)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
                transition: 'all 150ms',
              }}>
              {loading ? (
                <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />Creating…</>
              ) : `Create Sale — ฿${grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 0 })}`}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
