'use client';

import { useState } from 'react';
import {
  Factory, Package, Truck, CreditCard, CheckCircle, ChevronDown,
  ChevronUp, Plus, Minus, X, AlertCircle, Save, Send, ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

// ─── Design Tokens ─────────────────────────────────────────────
const css = {
  primary:     'var(--primary)',
  primaryDark: 'var(--primary-dark)',
  surface:     'var(--surface-container-low)',
  card:        'var(--surface-container-lowest)',
  border:      'var(--outline-variant)',
  text:        'var(--on-surface)',
  textMuted:   'var(--on-surface-variant)',
  success:     'var(--success)',
  successBg:   'var(--success-container)',
  error:       'var(--error)',
  amber:       '#F59E0B',
  amberBg:     '#FEF3C7',
};

// ─── Mobile Step Card ─────────────────────────────────────────
function StepCard({ step, label, icon: Icon, active, completed, onToggle, children }: {
  step: number;
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  active: boolean;
  completed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      borderRadius: 16,
      border: `1.5px solid ${active ? css.primary : css.border}`,
      backgroundColor: css.card,
      overflow: 'hidden',
      transition: 'border-color 0.15s',
      marginBottom: 12,
    }}>
      {/* Step Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '1rem 1.25rem',
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Step number */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          backgroundColor: completed ? css.success : active ? css.primary : 'var(--surface-container-high)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.15s',
        }}>
          {completed
            ? <CheckCircle style={{ width: 16, height: 16, color: 'white' }} />
            : <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '0.875rem', color: active ? 'white' : css.textMuted }}>
                {step}
              </span>
          }
        </div>

        {/* Label */}
        <span style={{
          flex: 1, fontFamily: 'var(--font-body)', fontWeight: 700,
          fontSize: '0.9375rem', color: active ? css.text : css.textMuted,
        }}>
          {label}
        </span>

        {/* Chevron */}
        {active
          ? <ChevronUp style={{ width: 18, height: 18, color: css.primary }} />
          : <ChevronDown style={{ width: 18, height: 18, color: css.textMuted }} />
        }
      </button>

      {/* Step Content */}
      {active && (
        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: `1px solid ${css.border}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Add Item Sheet ────────────────────────────────────
function AddItemSheet({ open, onClose, onAdd }: {
  open: boolean;
  onClose: () => void;
  onAdd: (item: { sku: string; name: string; qty: number; price: number }) => void;
}) {
  const [sku, setSku]     = useState('');
  const [name, setName]   = useState('');
  const [qty, setQty]     = useState('1');
  const [price, setPrice] = useState('');

  if (!open) return null;

  const handleAdd = () => {
    if (!name) return;
    onAdd({ sku, name, qty: parseInt(qty) || 1, price: parseFloat(price) || 0 });
    setSku(''); setName(''); setQty('1'); setPrice('');
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    backgroundColor: 'var(--surface-container-low)',
    border: '1.5px solid transparent', borderRadius: 12,
    fontSize: '0.9375rem', color: css.text,
    fontFamily: 'var(--font-body)', outline: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: css.card, borderRadius: '24px 24px 0 0',
        maxHeight: '85vh', overflowY: 'auto',
        padding: '1.5rem',
        animation: 'slideUp 300ms ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: css.border }} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.125rem', color: css.text, marginBottom: '1.25rem' }}>
          Add Product
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: css.textMuted, display: 'block', marginBottom: 6 }}>
              Product Name *
            </label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aluminum Panel 120x240cm"
              style={inputStyle}
              onFocus={e => Object.assign(e.target.style, { borderColor: css.primary, boxShadow: '0 0 0 3px rgba(249,115,22,0.12)' })}
              onBlur={e => Object.assign(e.target.style, { borderColor: 'transparent', boxShadow: 'none' })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: css.textMuted, display: 'block', marginBottom: 6 }}>SKU</label>
              <input value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU-001" style={inputStyle}
                onFocus={e => Object.assign(e.target.style, { borderColor: css.primary, boxShadow: '0 0 0 3px rgba(249,115,22,0.12)' })}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'transparent', boxShadow: 'none' })} />
            </div>
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: css.textMuted, display: 'block', marginBottom: 6 }}>Qty *</label>
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="1" style={inputStyle}
                onFocus={e => Object.assign(e.target.style, { borderColor: css.primary, boxShadow: '0 0 0 3px rgba(249,115,22,0.12)' })}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'transparent', boxShadow: 'none' })} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: css.textMuted, display: 'block', marginBottom: 6 }}>Unit Price (USD) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: css.textMuted }}>$</span>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={{ ...inputStyle, paddingLeft: '2rem' }}
                onFocus={e => Object.assign(e.target.style, { borderColor: css.primary, boxShadow: '0 0 0 3px rgba(249,115,22,0.12)' })}
                onBlur={e => Object.assign(e.target.style, { borderColor: 'transparent', boxShadow: 'none' })} />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!name}
            style={{
              width: '100%', height: 52, borderRadius: 12, border: 'none',
              background: name ? `linear-gradient(135deg, ${css.primary}, ${css.primaryDark})` : 'var(--surface-container-high)',
              color: name ? 'white' : css.textMuted,
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem',
              cursor: name ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: name ? `0 4px 16px rgba(249,115,22,0.3)` : 'none',
              marginTop: 4,
            }}>
            <Plus style={{ width: 18, height: 18 }} />
            Add to Order
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── Item Card (Mobile) ────────────────────────────────────────
function ItemCard({ item, onRemove }: {
  item: { id: string; sku: string; name: string; qty: number; price: number };
  onRemove: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0.875rem 0',
      borderBottom: `1px solid ${css.border}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: 'var(--surface-container-low)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: '0.75rem', color: css.textMuted,
        flexShrink: 0,
      }}>
        {item.name.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: css.text, marginBottom: 2 }}>
          {item.name}
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: css.textMuted }}>
          {item.sku || '—'} · {item.qty}x${item.price.toFixed(2)}
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.875rem', color: css.text }}>
          ${(item.qty * item.price).toFixed(2)}
        </p>
        <p style={{ fontSize: '0.6875rem', color: css.primary }}>
          ฿{(item.qty * item.price * 35.42).toLocaleString()}
        </p>
      </div>
      <button onClick={onRemove}
        style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          backgroundColor: 'var(--error-container)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
        <Minus style={{ width: 14, height: 14, color: 'var(--error)' }} />
      </button>
    </div>
  );
}

// ─── Logistics Card (Mobile) ───────────────────────────────────
function LogisticsCard({ active, label, icon: Icon, color, colorBg, value, onChange, onToggle }: {
  active: boolean;
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  color: string;
  colorBg: string;
  value: string;
  onChange: (v: string) => void;
  onToggle: () => void;
}) {
  return (
    <div style={{
      borderRadius: 14, padding: '0.875rem 1rem',
      border: `1.5px solid ${active ? color : css.border}`,
      backgroundColor: active ? colorBg : 'var(--surface-container-low)',
      transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: active ? 10 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon style={{ width: 18, height: 18, color }} />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8125rem', color: css.text }}>{label}</span>
        </div>
        <button onClick={onToggle}
          style={{
            width: 28, height: 28, borderRadius: 8, border: 'none',
            backgroundColor: active ? color : 'var(--surface-container-high)',
            color: active ? 'white' : css.textMuted,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          {active ? <CheckCircle style={{ width: 16, height: 16 }} /> : <Plus style={{ width: 14, height: 14 }} />}
        </button>
      </div>
      {active && (
        <div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: css.textMuted }}>$</span>
            <input value={value} onChange={e => onChange(e.target.value)} placeholder="0.00"
              style={{
                width: '100%', padding: '0.625rem 0.75rem 0.625rem 2rem',
                backgroundColor: 'white', border: `1.5px solid ${color}40`,
                borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
                color: css.text, fontFamily: 'var(--font-body)', outline: 'none',
              }} />
          </div>
          {value && <p style={{ fontSize: '0.6875rem', color: css.primary, textAlign: 'right', marginTop: 4 }}>
            ≈ ฿{(parseFloat(value) * 35.42).toLocaleString()}
          </p>}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Summary Sheet ──────────────────────────────────────
function SummarySheet({ open, onClose, items, logistics, rate, onConfirm }: {
  open: boolean;
  onClose: () => void;
  items: any[];
  logistics: Record<string, string>;
  rate: number;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const subtotalUSD = items.reduce((s, i) => s + i.qty * i.price, 0);
  const logUSD = Object.values(logistics).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const subtotalTHB = subtotalUSD * rate;
  const logTHB = logUSD * rate;
  const taxTHB = subtotalTHB * 0.07;
  const total = subtotalTHB + logTHB + taxTHB;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: css.card, borderRadius: '24px 24px 0 0',
        padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: css.border }} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.125rem', color: css.text, marginBottom: '1rem' }}>Order Summary</h3>

        {[
          { label: `Items (${items.length})`, value: `$${subtotalUSD.toFixed(2)}`, sub: `฿${subtotalTHB.toLocaleString()}` },
          ...(logUSD > 0 ? [{ label: 'Logistics', value: `$${logUSD.toFixed(2)}`, sub: `฿${logTHB.toLocaleString()}` }] : []),
          { label: 'Tax (7%)', value: `฿${taxTHB.toLocaleString()}`, sub: '' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: `1px solid ${css.border}` }}>
            <span style={{ fontSize: '0.875rem', color: css.textMuted }}>{row.label}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: css.text }}>
              {row.value}
              {row.sub && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: css.primary, marginLeft: 4 }}>{row.sub}</span>}
            </span>
          </div>
        ))}

        <div style={{ margin: '1rem 0', padding: '1rem', background: `linear-gradient(135deg, ${css.primary}12, ${css.primary}06)`, borderRadius: 14, border: `1.5px solid ${css.primary}30` }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: css.textMuted, marginBottom: 4 }}>Grand Total</p>
          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.5rem', color: css.primary }}>
            ฿{total.toLocaleString()}
          </p>
        </div>

        <button onClick={onConfirm}
          style={{
            width: '100%', height: 52, borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${css.primary}, ${css.primaryDark})`,
            color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: `0 4px 16px rgba(249,115,22,0.3)`,
          }}>
          <CheckCircle style={{ width: 18, height: 18 }} />
          Confirm Order
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function PurchasePage() {
  const { toast } = useToast();

  // Steps
  const [activeStep, setActiveStep] = useState(1);
  const STEPS = [
    { n: 1, label: 'Supplier & Currency', icon: Factory },
    { n: 2, label: 'Products', icon: Package },
    { n: 3, label: 'Logistics & Costs', icon: Truck },
    { n: 4, label: 'Review & Confirm', icon: CreditCard },
  ];

  // Form
  const [supplier, setSupplier]       = useState('');
  const [currency, setCurrency]         = useState('USD');
  const [exchangeRate, setExchangeRate] = useState('35.42');
  const [items, setItems]               = useState<{ id: string; sku: string; name: string; qty: number; price: number }[]>([
    { id: '1', sku: 'AL-PNL-001', name: 'Aluminum Panel 120x240cm', qty: 150, price: 45.00 },
    { id: '2', sku: 'PCB-GF-44', name: 'Glass Fiber PCB Panel', qty: 300, price: 12.50 },
  ]);
  const [logistics, setLogistics] = useState<Record<string, string>>({});
  const [notes, setNotes]       = useState('');

  // Sheet states
  const [sheetOpen, setSheetOpen]     = useState(false);
  const [summaryOpen, setSummaryOpen]   = useState(false);
  const [saving, setSaving]            = useState(false);

  const rate = parseFloat(exchangeRate) || 35.42;
  const subtotalUSD = items.reduce((s, i) => s + i.qty * i.price, 0);
  const logUSD = Object.values(logistics).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const subtotalTHB = subtotalUSD * rate;
  const logTHB = logUSD * rate;
  const taxTHB = subtotalTHB * 0.07;
  const totalTHB = subtotalTHB + logTHB + taxTHB;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    backgroundColor: 'var(--surface-container-low)',
    border: '1.5px solid transparent', borderRadius: 12,
    fontSize: '0.9375rem', color: css.text,
    fontFamily: 'var(--font-body)', outline: 'none',
  };

  const addItem = (item: { sku: string; name: string; qty: number; price: number }) => {
    setItems([...items, { ...item, id: `item-${Date.now()}` }]);
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const handleSaveDraft = () => {
    if (!supplier) { toast('Please select a supplier first', 'error'); return; }
    setSaving(true);
    api.createPurchaseOrder({
      po_number: `PO-${Date.now()}`,
      supplier_id: supplier,
      order_date: new Date().toISOString().split('T')[0],
      status: 'draft',
      currency: 'CNY',
      exchange_rate_thb: rate,
      total_thb: totalTHB,
      notes: notes || null,
    }).then(() => {
      toast('Draft saved!', 'success');
    }).catch((err: any) => {
      toast('Failed: ' + (err.message || 'Unknown'), 'error');
    }).finally(() => setSaving(false));
  };

  const handleConfirm = () => {
    if (!supplier) { toast('Please select a supplier', 'error'); return; }
    if (items.length === 0) { toast('Please add at least one item', 'error'); return; }
    setSaving(true);
    api.createPurchaseOrder({
      po_number: `PO-${Date.now()}`,
      supplier_id: supplier,
      order_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      currency: 'CNY',
      exchange_rate_thb: rate,
      total_thb: totalTHB,
      notes: notes || null,
    }).then(() => {
      toast('Purchase Order confirmed!', 'success');
      setSummaryOpen(false);
    }).catch((err: any) => {
      toast('Failed: ' + (err.message || 'Unknown'), 'error');
    }).finally(() => setSaving(false));
  };

  const suppliers = [
    'Global Logistics Pro', 'Shenzhen Tech Supplies',
    'Guangzhou Trading Co.', 'Bangkok Freight Co.',
  ];

  const LOGISTICS = [
    { id: 'china_domestic', label: 'China Domestic', icon: Truck, color: '#EF4444', colorBg: '#FEE2E2' },
    { id: 'china_thailand', label: 'China → Thailand', icon: Truck, color: '#3B82F6', colorBg: '#DBEAFE' },
    { id: 'local_delivery', label: 'Local Delivery', icon: Truck, color: '#10B981', colorBg: '#D1FAE5' },
  ];

  const stepCompleted = (n: number) => {
    if (n === 1) return !!supplier;
    if (n === 2) return items.length > 0;
    if (n === 3) return true;
    if (n === 4) return supplier && items.length > 0;
    return false;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)' }}>

      {/* ── PAGE HEADER ─────────────────────────── */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: `1px solid ${css.border}`, backgroundColor: css.card, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Link href="/" style={{ color: css.textMuted }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.primary }}>
                  Procurement
                </span>
              </Link>
              <span style={{ color: css.textMuted, fontSize: '0.75rem' }}>/</span>
              <span style={{ fontSize: '0.75rem', color: css.text }}>Purchase Order</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', letterSpacing: '-0.02em', color: css.text }}>
              New Purchase Order
            </h1>
          </div>

          {/* Desktop header actions */}
          <div className="hidden lg:flex" style={{ gap: 8 }}>
            <button onClick={handleSaveDraft} disabled={saving}
              style={{
                height: 40, padding: '0 1rem', borderRadius: 10, border: `1.5px solid ${css.border}`,
                background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8125rem', color: css.text,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              <Save style={{ width: 14, height: 14 }} />
              Save Draft
            </button>
            <button onClick={() => setActiveStep(4)}
              style={{
                height: 40, padding: '0 1rem', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${css.primary}, ${css.primaryDark})`,
                color: 'white', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8125rem',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: `0 2px 8px rgba(249,115,22,0.3)`,
              }}>
              <Send style={{ width: 14, height: 14 }} />
              Review
            </button>
          </div>
        </div>

        {/* Mobile step progress */}
        <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                flex: 1, height: 4, borderRadius: 9999,
                backgroundColor: stepCompleted(s.n) ? css.success : activeStep === s.n ? css.primary : 'var(--surface-container-high)',
                transition: 'background-color 0.3s',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────── */}
      <div style={{ padding: '1.25rem' }}>

        {/* ── MOBILE VERSION ── */}
        <div className="lg:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Step 1: Supplier */}
          <StepCard
            step={1} label="Supplier & Currency" icon={Factory}
            active={activeStep === 1} completed={stepCompleted(1)}
            onToggle={() => setActiveStep(activeStep === 1 ? 0 : 1)}>
            <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: css.textMuted, display: 'block', marginBottom: 6 }}>
                  Supplier *
                </label>
                <select value={supplier} onChange={e => setSupplier(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select supplier…</option>
                  {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: css.textMuted, display: 'block', marginBottom: 6 }}>Currency</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['USD', 'CNY', 'THB'].map(c => (
                    <button key={c} onClick={() => setCurrency(c)}
                      style={{
                        flex: 1, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem',
                        backgroundColor: currency === c ? css.primary : 'var(--surface-container-low)',
                        color: currency === c ? 'white' : css.textMuted,
                        transition: 'all 0.15s',
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: css.textMuted, display: 'block', marginBottom: 6 }}>
                  Exchange Rate (THB)
                </label>
                <input value={exchangeRate} onChange={e => setExchangeRate(e.target.value)}
                  type="number" style={inputStyle} />
              </div>
            </div>
          </StepCard>

          {/* Step 2: Products */}
          <StepCard
            step={2} label={`Products (${items.length})`} icon={Package}
            active={activeStep === 2} completed={stepCompleted(2)}
            onToggle={() => setActiveStep(activeStep === 2 ? 0 : 2)}>
            <div style={{ paddingTop: '1rem' }}>
              {/* Item list */}
              {items.map(item => (
                <ItemCard key={item.id} item={item} onRemove={() => removeItem(item.id)} />
              ))}

              {/* Add button */}
              <button onClick={() => setSheetOpen(true)}
                style={{
                  width: '100%', marginTop: 8, height: 48, borderRadius: 12,
                  border: `1.5px dashed ${css.primary}`,
                  background: `${css.primary}08`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: css.primary,
                }}>
                <Plus style={{ width: 16, height: 16 }} />
                Add Product
              </button>

              {/* Subtotal */}
              {items.length > 0 && (
                <div style={{ marginTop: 12, padding: '0.75rem 1rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: css.textMuted }}>Items Subtotal</span>
                  <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1rem', color: css.text }}>
                    ${subtotalUSD.toFixed(2)} <span style={{ fontSize: '0.75rem', color: css.primary }}>฿{subtotalTHB.toLocaleString()}</span>
                  </span>
                </div>
              )}
            </div>
          </StepCard>

          {/* Step 3: Logistics */}
          <StepCard
            step={3} label="Logistics & Costs" icon={Truck}
            active={activeStep === 3} completed={stepCompleted(3)}
            onToggle={() => setActiveStep(activeStep === 3 ? 0 : 3)}>
            <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LOGISTICS.map(log => (
                <LogisticsCard
                  key={log.id}
                  {...log}
                  active={!!logistics[log.id]}
                  value={logistics[log.id] || ''}
                  onChange={v => setLogistics({ ...logistics, [log.id]: v })}
                  onToggle={() => {
                    if (logistics[log.id]) {
                      const updated = { ...logistics };
                      delete updated[log.id];
                      setLogistics(updated);
                    } else {
                      setLogistics({ ...logistics, [log.id]: '' });
                    }
                  }}
                />
              ))}
            </div>
          </StepCard>

          {/* Step 4: Review */}
          <StepCard
            step={4} label="Review & Confirm" icon={CreditCard}
            active={activeStep === 4} completed={stepCompleted(4)}
            onToggle={() => setActiveStep(activeStep === 4 ? 0 : 4)}>
            <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Supplier', value: supplier || '—' },
                { label: 'Items', value: `${items.length} product(s)` },
                { label: 'Subtotal', value: `$${subtotalUSD.toFixed(2)}` },
                ...(logUSD > 0 ? [{ label: 'Logistics', value: `$${logUSD.toFixed(2)}` }] : []),
                { label: 'Tax (7%)', value: `฿${taxTHB.toLocaleString()}` },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${css.border}` }}>
                  <span style={{ fontSize: '0.875rem', color: css.textMuted }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: css.text }}>{row.value}</span>
                </div>
              ))}

              <div style={{ padding: '1rem', background: `linear-gradient(135deg, ${css.primary}12, ${css.primary}06)`, borderRadius: 14, border: `1.5px solid ${css.primary}30` }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: css.textMuted, marginBottom: 4 }}>Grand Total</p>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.75rem', color: css.primary }}>
                  ฿{totalTHB.toLocaleString()}
                </p>
              </div>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Internal notes…"
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              />
            </div>
          </StepCard>

          {/* Mobile sticky bottom CTA */}
          <div style={{
            position: 'fixed', bottom: 80, left: 0, right: 0, zIndex: 40,
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)',
            borderTop: `1px solid ${css.border}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.6875rem', color: css.textMuted }}>Total</p>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.125rem', color: css.primary }}>
                ฿{totalTHB.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => {
                if (!supplier) { toast('Please select a supplier first', 'error'); return; }
                if (items.length === 0) { toast('Please add products first', 'error'); return; }
                handleConfirm();
              }}
              style={{
                height: 48, padding: '0 1.5rem', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${css.primary}, ${css.primaryDark})`,
                color: 'white', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: `0 4px 16px rgba(249,115,22,0.3)`,
              }}>
              <CheckCircle style={{ width: 18, height: 18 }} />
              Confirm
            </button>
          </div>
        </div>

        {/* ── DESKTOP VERSION ── */}
        <div className="hidden lg:block" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Supplier */}
            <div style={{ backgroundColor: css.card, borderRadius: 16, border: `1.5px solid ${css.border}`, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${css.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Factory style={{ width: 18, height: 18, color: css.primary }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: css.text }}>Supplier Information</h2>
                  <p style={{ fontSize: '0.75rem', color: css.textMuted }}>Select supplier and pricing currency</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: 6 }}>Supplier *</label>
                  <select value={supplier} onChange={e => setSupplier(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select…</option>
                    {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: 6 }}>Currency</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['USD', 'CNY', 'THB'].map(c => (
                      <button key={c} onClick={() => setCurrency(c)}
                        style={{
                          flex: 1, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8125rem',
                          backgroundColor: currency === c ? css.primary : 'var(--surface-container-low)',
                          color: currency === c ? 'white' : css.textMuted,
                        }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: 6 }}>Rate (THB)</label>
                  <input value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} type="number" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div style={{ backgroundColor: css.card, borderRadius: 16, border: `1.5px solid ${css.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${css.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${css.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package style={{ width: 18, height: 18, color: css.primary }} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: css.text }}>
                    Products ({items.length})
                  </h2>
                </div>
                <button onClick={() => setSheetOpen(true)}
                  style={{
                    height: 36, padding: '0 1rem', borderRadius: 10, border: 'none',
                    background: `linear-gradient(135deg, ${css.primary}, ${css.primaryDark})`,
                    color: 'white', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8125rem',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: `0 2px 8px rgba(249,115,22,0.25)`,
                  }}>
                  <Plus style={{ width: 14, height: 14 }} />
                  Add
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--surface-container-low)' }}>
                      {['Product', 'SKU', 'Qty', 'Price (USD)', 'Subtotal', ''].map((h, i) => (
                        <th key={h} style={{ padding: '0.625rem 1rem', textAlign: i >= 3 ? 'right' : 'left', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} style={{ borderTop: idx === 0 ? undefined : `1px solid ${css.border}` }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', color: css.textMuted, flexShrink: 0 }}>
                              {item.name.charAt(0)}
                            </div>
                            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: css.text }}>{item.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 0.5rem' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: css.textMuted, backgroundColor: 'var(--surface-container-low)', padding: '2px 8px', borderRadius: 6 }}>
                            {item.sku}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 0.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: css.text }}>{item.qty}</td>
                        <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right', fontWeight: 600, fontSize: '0.875rem', color: css.text }}>${item.price.toFixed(2)}</td>
                        <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.875rem', color: css.text }}>${(item.qty * item.price).toFixed(2)}</td>
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                          <button onClick={() => removeItem(item.id)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: css.textMuted, opacity: 0.5 }}>
                            <X style={{ width: 14, height: 14 }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: 'var(--surface-container-low)' }}>
                      <td colSpan={4} style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.75rem', color: css.textMuted, fontWeight: 600 }}>Items Subtotal</td>
                      <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '0.875rem', color: css.text }}>
                        ${subtotalUSD.toFixed(2)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Logistics */}
            <div style={{ backgroundColor: css.card, borderRadius: 16, border: `1.5px solid ${css.border}`, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${css.amber}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck style={{ width: 18, height: 18, color: css.amber }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: css.text }}>Logistics & Costs</h2>
                  <p style={{ fontSize: '0.75rem', color: css.textMuted }}>Shipping fees (auto-converted to THB)</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {LOGISTICS.map(log => (
                  <LogisticsCard
                    key={log.id}
                    {...log}
                    active={!!logistics[log.id]}
                    value={logistics[log.id] || ''}
                    onChange={v => setLogistics({ ...logistics, [log.id]: v })}
                    onToggle={() => {
                      if (logistics[log.id]) {
                        const updated = { ...logistics };
                        delete updated[log.id];
                        setLogistics(updated);
                      } else {
                        setLogistics({ ...logistics, [log.id]: '' });
                      }
                    }}
                  />
                ))}
              </div>
              {logUSD > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${css.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: css.textMuted }}>Logistics Total</p>
                    <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1rem', color: css.text }}>
                      ${logUSD.toFixed(2)} <span style={{ fontSize: '0.75rem', color: css.primary, fontWeight: 700 }}>฿{logTHB.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary Sticky */}
          <div style={{ position: 'sticky', top: '1.5rem' }}>
            <div style={{ backgroundColor: css.card, borderRadius: 16, border: `1.5px solid ${css.border}`, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${css.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard style={{ width: 18, height: 18, color: css.primary }} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: css.text }}>Order Summary</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: `Items (${items.length})`, value: `$${subtotalUSD.toFixed(2)}`, sub: `฿${subtotalTHB.toLocaleString()}` },
                  ...(logUSD > 0 ? [{ label: 'Logistics', value: `$${logUSD.toFixed(2)}`, sub: `฿${logTHB.toLocaleString()}` }] : []),
                  { label: 'Est. Tax (7%)', value: `฿${taxTHB.toLocaleString()}`, sub: '' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: css.textMuted }}>{row.label}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: css.text }}>
                      {row.value}
                      {row.sub && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: css.primary, marginLeft: 4 }}>{row.sub}</span>}
                    </span>
                  </div>
                ))}

                <div style={{ marginTop: 4, padding: '1rem', background: `linear-gradient(135deg, ${css.primary}12, ${css.primary}06)`, borderRadius: 14, border: `1.5px solid ${css.primary}30` }}>
                  <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, marginBottom: 4 }}>Grand Total</p>
                  <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.75rem', color: css.primary, letterSpacing: '-0.02em' }}>
                    ฿{totalTHB.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: css.textMuted, marginTop: 4 }}>
                    ≈ ${(totalTHB / rate).toFixed(2)} {currency}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: '1.25rem' }}>
                <button onClick={handleConfirm} disabled={saving}
                  style={{
                    width: '100%', height: 48, borderRadius: 12, border: 'none',
                    background: `linear-gradient(135deg, ${css.primary}, ${css.primaryDark})`,
                    color: 'white', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: `0 4px 16px rgba(249,115,22,0.3)`,
                    opacity: saving ? 0.6 : 1,
                  }}>
                  <CheckCircle style={{ width: 18, height: 18 }} />
                  {saving ? 'Saving…' : 'Confirm Order'}
                </button>
                <button onClick={handleSaveDraft} disabled={saving}
                  style={{
                    width: '100%', height: 44, borderRadius: 12,
                    border: `1.5px solid ${css.border}`, background: 'transparent', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: css.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  <Save style={{ width: 16, height: 16 }} />
                  Save Draft
                </button>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertCircle style={{ width: 14, height: 14, color: css.amber, flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: '0.6875rem', color: css.textMuted, lineHeight: 1.5 }}>
                  Final settlement on inventory receipt. Exchange rate: 1 USD = ฿{rate.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SHEETS ─────────────────────────── */}
      <AddItemSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onAdd={addItem} />
      <SummarySheet
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        items={items}
        logistics={logistics}
        rate={rate}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
