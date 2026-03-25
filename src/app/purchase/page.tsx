'use client';

import { useState } from 'react';
import {
  Factory, CreditCard, Globe, Package, Truck, PlaneTakeoff, Warehouse,
  Plus, Save, Send, ChevronRight, Trash2, Info, X, CheckCircle,
  ShoppingCart, Receipt, ArrowLeft, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

// ─── Anti-Slop Design Tokens (MORIX V2) ───────────────────────
const css = {
  primary:   'var(--primary)',
  primaryBg:  'var(--primary-container)',
  surface:   'var(--surface-container-lowest)',
  card:      'var(--surface-container-lowest)',
  cardMid:   'var(--surface-container-low)',
  border:    'var(--outline-variant)',
  text:      'var(--on-surface)',
  textMuted: 'var(--on-surface-variant)',
  error:     'var(--error)',
  success:   'var(--success)',
  amber:     '#F59E0B',
  amberBg:   '#FEF3C7',
  blue:      '#3B82F6',
  blueBg:    '#DBEAFE',
  green:     '#10B981',
  greenBg:   '#D1FAE5',
};

// ─── Default Items ────────────────────────────────────────────
const DEFAULT_ITEMS = [
  { id: 1, sku: 'CH-AS-092', name: 'Ultra-Slim Aluminum Chassis', qty: 150, priceUSD: 45.00 },
  { id: 2, sku: 'PCB-GF-44',  name: 'Glass Fiber PCB Panel',       qty: 300, priceUSD: 12.50 },
];

const LOGISTICS = [
  { id: 'china_domestic',  label: 'China Domestic',   icon: Truck,       color: '#EF4444', colorBg: '#FEE2E2' },
  { id: 'china_thailand',  label: 'China → Thailand', icon: PlaneTakeoff, color: '#3B82F6', colorBg: '#DBEAFE' },
  { id: 'local_delivery',  label: 'Local Delivery',   icon: Warehouse,   color: '#10B981', colorBg: '#D1FAE5' },
];

const SUPPLIERS = [
  'Global Logistics Pro',
  'Shenzhen Tech Supplies',
  'Guangzhou Trading Co.',
  'Bangkok Freight Co.',
];

// ─── Card Component ─────────────────────────────────────────────
function Card({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border ${className}`}
      style={{
        backgroundColor: css.card,
        borderColor: css.border,
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── Section Title ─────────────────────────────────────────────
function SectionTitle({ icon: Icon, title, subtitle, badge, color = css.primary }: {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
  badge?: string;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 18, height: 18, color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: css.text }}>
            {title}
          </h2>
          {badge && (
            <span style={{
              fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: 9999, backgroundColor: `${color}18`, color,
            }}>{badge}</span>
          )}
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: css.textMuted, marginTop: 2 }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── Bottom Sheet ─────────────────────────────────────────────
function BottomSheet({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: '24px 24px 0 0',
        maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        animation: 'slideUp 300ms ease-out',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: 'var(--outline-variant)' }} />
        </div>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem', borderBottom: `1px solid ${css.border}`,
        }}>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1rem', color: css.text }}>
            {title}
          </h3>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '0.375rem', borderRadius: 8, color: css.textMuted,
          }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>
        {/* Content */}
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function PurchasePage() {
  const [supplier, setSupplier]         = useState('');
  const [currency, setCurrency]           = useState('USD');
  const [exchangeRate, setExchangeRate] = useState('35.42');
  const [items, setItems]               = useState(DEFAULT_ITEMS);
  const [logistics, setLogistics]       = useState<Record<string, string>>({});
  const [notes, setNotes]               = useState('');

  // Sheet state
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [sheetTitle, setSheetTitle]     = useState('');
  const [sheetContent, setSheetContent] = useState<'add-product' | 'add-logistics'>('add-product');
  const [newItem, setNewItem]           = useState({ sku: '', name: '', qty: '1', price: '0' });

  // Calc
  const rate = parseFloat(exchangeRate) || 35.42;
  const subtotalUSD = items.reduce((s, i) => s + i.qty * i.priceUSD, 0);
  const subtotalTHB = subtotalUSD * rate;
  const logisticsUSD = Object.values(logistics).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const logisticsTHB = logisticsUSD * rate;
  const taxTHB   = subtotalTHB * 0.07;
  const totalTHB = subtotalTHB + logisticsTHB + taxTHB;
  const totalUSD = totalTHB / rate;

  const openSheet = (title: string, content: 'add-product' | 'add-logistics') => {
    setSheetTitle(title);
    setSheetContent(content);
    setSheetOpen(true);
  };

  const addItem = () => {
    if (!newItem.name) return;
    setItems([...items, {
      id: Date.now(),
      sku: newItem.sku || `SKU-${items.length + 1}`,
      name: newItem.name,
      qty: parseInt(newItem.qty) || 1,
      priceUSD: parseFloat(newItem.price) || 0,
    }]);
    setNewItem({ sku: '', name: '', qty: '1', price: '0' });
    setSheetOpen(false);
  };

  const removeItem = (id: number) => setItems(items.filter(i => i.id !== id));
  const toggleLogistics = (id: string) => {
    if (logistics[id]) {
      const updated = { ...logistics };
      delete updated[id];
      setLogistics(updated);
    } else {
      setLogistics({ ...logistics, [id]: '' });
    }
  };

  const handleSaveDraft = () => {
    alert(`Draft saved!\n\nPO #2847\nSupplier: ${supplier || '—'}\nItems: ${items.length}\nTotal: ฿${totalTHB.toLocaleString()}`);
  };

  const handleConfirm = () => {
    if (!supplier) { alert('Please select a supplier first'); return; }
    if (items.length === 0) { alert('Please add at least one item'); return; }
    alert(`Purchase Order confirmed!\n\nTotal: ฿${totalTHB.toLocaleString()}`);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-container-low)',
    border: '1px solid transparent',
    borderRadius: 12,
    padding: '0.75rem 1rem',
    width: '100%',
    fontSize: '0.875rem',
    color: css.text,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const focusStyle: React.CSSProperties = {
    borderColor: css.primary,
    boxShadow: '0 0 0 3px rgba(249,115,22,0.12)',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)' }}>

      {/* ── PAGE HEADER ─────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Link href="/purchase" style={{ color: css.textMuted, display: 'flex', alignItems: 'center' }}>
                <ArrowLeft style={{ width: 16, height: 16 }} />
              </Link>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: css.primary, display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: css.primary }} />
                New Procurement
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2rem)', letterSpacing: '-0.02em', color: css.text }}>
              Purchase Order
              <span style={{ fontWeight: 400, color: css.textMuted, marginLeft: '0.75rem', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                #PO-2847
              </span>
            </h1>
          </div>

          {/* Desktop CTA */}
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            <button onClick={handleSaveDraft}
              style={{
                height: 44, padding: '0 1.25rem',
                borderRadius: 12, border: `1.5px solid ${css.border}`,
                background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem',
                color: css.text, display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface-container-low)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
              <Save style={{ width: 16, height: 16 }} />
              Save Draft
            </button>
            <button onClick={handleConfirm}
              style={{
                height: 44, padding: '0 1.5rem',
                borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${css.primary}, var(--primary-dark))`,
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem',
                color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
              }}>
              <Send style={{ width: 16, height: 16 }} />
              Confirm Order
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Supplier Info */}
          <Card style={{ padding: '1.5rem' }}>
            <SectionTitle icon={Factory} title="Supplier Information" subtitle="Select supplier and set pricing currency" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: '0.5rem' }}>Supplier *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                    onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                    style={{ ...inputStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}>
                    <option value="">Select supplier…</option>
                    {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronRight style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', width: 16, height: 16, color: css.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: '0.5rem' }}>Import Currency</label>
                <div style={{ display: 'flex', gap: '0.375rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 12, padding: '0.25rem' }}>
                  {['USD', 'CNY', 'THB'].map(c => (
                    <button key={c}
                      onClick={() => setCurrency(c)}
                      style={{
                        flex: 1, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8125rem',
                        transition: 'all 0.15s',
                        backgroundColor: currency === c ? 'white' : 'transparent',
                        color: currency === c ? css.primary : css.textMuted,
                        boxShadow: currency === c ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: '0.5rem' }}>Exchange Rate (THB)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={exchangeRate}
                    onChange={e => setExchangeRate(e.target.value)}
                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                    onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                    style={{ ...inputStyle, paddingRight: '3.5rem', fontWeight: 600 }}
                  />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 600, color: css.textMuted }}>
                    THB/{currency}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Products */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: `1px solid ${css.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${css.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package style={{ width: 18, height: 18, color: css.primary }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: css.text }}>Products</h2>
                  <p style={{ fontSize: '0.75rem', color: css.textMuted }}>{items.length} item{items.length !== 1 ? 's' : ''} added</p>
                </div>
              </div>
              <button onClick={() => openSheet('Add Product', 'add-product')}
                style={{
                  height: 36, padding: '0 1rem',
                  borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${css.primary}, var(--primary-dark))`,
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8125rem',
                  color: 'white', display: 'flex', alignItems: 'center', gap: '0.375rem',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                }}>
                <Plus style={{ width: 14, height: 14 }} />
                Add
              </button>
            </div>

            {/* Table */}
            {items.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--surface-container-low)' }}>
                      {['Product', 'SKU', 'Qty', 'Price (USD)', 'Subtotal', ''].map((h, i) => (
                        <th key={h} style={{
                          padding: '0.625rem 1rem',
                          textAlign: i >= 3 ? 'right' : 'left',
                          fontSize: '0.5625rem', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          color: css.textMuted, whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} style={{
                        borderTop: idx === 0 ? undefined : `1px solid ${css.border}`,
                        transition: 'background-color 0.15s',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(249,115,22,0.03)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'; }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              backgroundColor: 'var(--surface-container-low)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 900, fontSize: '0.75rem', color: css.textMuted, flexShrink: 0,
                            }}>{item.name.charAt(0)}</div>
                            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: css.text }}>
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 0.5rem' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: css.textMuted, backgroundColor: 'var(--surface-container-low)', padding: '2px 8px', borderRadius: 6 }}>
                            {item.sku}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 0.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: css.text }}>{item.qty}</td>
                        <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right', fontWeight: 600, fontSize: '0.875rem', color: css.text }}>${item.priceUSD.toFixed(2)}</td>
                        <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.875rem', color: css.text }}>
                          ${(item.qty * item.priceUSD).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                          <button onClick={() => removeItem(item.id)}
                            style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              padding: '0.375rem', borderRadius: 8, color: css.textMuted,
                              opacity: 0.5, transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.color = 'var(--error)';
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--error-container)';
                              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.color = css.textMuted;
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                              (e.currentTarget as HTMLButtonElement).style.opacity = '0.5';
                            }}>
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Subtotal row */}
                  <tfoot>
                    <tr style={{ backgroundColor: 'var(--surface-container-low)' }}>
                      <td colSpan={4} style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.75rem', color: css.textMuted, fontWeight: 600 }}>Items Subtotal</td>
                      <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '0.875rem', color: css.text }}>
                        ${subtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <Package style={{ width: 40, height: 40, color: css.textMuted, margin: '0 auto 0.75rem', opacity: 0.3 }} />
                <p style={{ fontWeight: 600, color: css.textMuted, marginBottom: '0.5rem' }}>No products added</p>
                <button onClick={() => openSheet('Add Product', 'add-product')}
                  style={{ color: css.primary, fontWeight: 700, fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  + Add Product
                </button>
              </div>
            )}
          </Card>

          {/* Logistics */}
          <Card style={{ padding: '1.5rem' }}>
            <SectionTitle icon={Truck} title="Logistics & Costs" subtitle="Shipping and handling fees (auto-converted to THB)" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {LOGISTICS.map(log => {
                const Icon = log.icon;
                const active = !!logistics[log.id];
                return (
                  <div key={log.id}
                    style={{
                      borderRadius: 16, padding: '1rem',
                      border: `1.5px solid ${active ? log.color : css.border}`,
                      backgroundColor: active ? log.colorBg : 'var(--surface-container-low)',
                      transition: 'all 0.15s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          backgroundColor: `${log.color}20`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon style={{ width: 16, height: 16, color: log.color }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8125rem', color: css.text }}>{log.label}</span>
                      </div>
                      <button
                        onClick={() => toggleLogistics(log.id)}
                        style={{
                          width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer',
                          backgroundColor: active ? log.color : 'var(--surface-container-high)',
                          color: active ? 'white' : css.textMuted,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                        {active ? <CheckCircle style={{ width: 14, height: 14 }} /> : <Plus style={{ width: 14, height: 14 }} />}
                      </button>
                    </div>
                    {active && (
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                          fontSize: '0.875rem', fontWeight: 700, color: css.textMuted,
                        }}>$</span>
                        <input
                          value={logistics[log.id]}
                          onChange={e => setLogistics({ ...logistics, [log.id]: e.target.value })}
                          placeholder="0.00"
                          style={{
                            width: '100%', paddingLeft: '2rem', padding: '0.625rem 0.75rem',
                            backgroundColor: 'white', border: `1.5px solid ${log.color}40`,
                            borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
                            color: css.text, fontFamily: 'var(--font-body)', outline: 'none',
                          }}
                        />
                        <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: css.textMuted, textAlign: 'right' }}>
                          ≈ ฿{((parseFloat(logistics[log.id]) || 0) * rate).toLocaleString('th-TH', { minimumFractionDigits: 0 })} THB
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Logistics subtotal */}
            {logisticsUSD > 0 && (
              <div style={{
                marginTop: '1rem', paddingTop: '1rem',
                borderTop: `1px solid ${css.border}`,
                display: 'flex', justifyContent: 'flex-end',
              }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: css.textMuted, marginBottom: 2 }}>Logistics Total</p>
                  <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1rem', color: css.text }}>
                    ${logisticsUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: css.primary, marginLeft: '0.5rem' }}>
                      ฿{logisticsTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card style={{ padding: '1.5rem' }}>
            <SectionTitle icon={Receipt} title="Internal Notes" subtitle="Special instructions or comments" />
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add special instructions, packaging requirements, or quality notes…"
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 80,
                fontFamily: 'var(--font-body)',
              }}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
            />
          </Card>
        </div>

        {/* ── RIGHT COLUMN (Summary) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
            <SectionTitle icon={CreditCard} title="Order Summary" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: `Items (${items.length})`, value: `$${subtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, sub: `฿${subtotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` },
                { label: 'Logistics', value: logisticsUSD > 0 ? `$${logisticsUSD.toFixed(2)}` : '—', sub: logisticsUSD > 0 ? `฿${logisticsTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}` : undefined },
                { label: 'Est. Tax (7%)', value: `฿${taxTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}`, highlight: false },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: css.textMuted }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.875rem', color: css.text }}>
                    {row.value}
                    {row.sub && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: css.primary, marginLeft: '0.375rem' }}>{row.sub}</span>}
                  </span>
                </div>
              ))}

              {/* Grand total */}
              <div style={{
                marginTop: '0.5rem', padding: '1rem',
                background: `linear-gradient(135deg, ${css.primary}12, ${css.primary}06)`,
                borderRadius: 16, border: `1.5px solid ${css.primary}30`,
              }}>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, marginBottom: '0.375rem' }}>
                  Grand Total
                </p>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: css.primary, letterSpacing: '-0.02em' }}>
                  ฿{totalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                </p>
                <p style={{ fontSize: '0.75rem', color: css.textMuted, marginTop: '0.25rem' }}>
                  ≈ ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '1.25rem' }}>
              <button onClick={handleConfirm}
                style={{
                  width: '100%', height: 48, borderRadius: 12, border: 'none',
                  background: `linear-gradient(135deg, ${css.primary}, var(--primary-dark))`,
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                }}>
                <CheckCircle style={{ width: 18, height: 18 }} />
                Confirm Order
              </button>
              <button onClick={handleSaveDraft}
                style={{
                  width: '100%', height: 44, borderRadius: 12,
                  border: `1.5px solid ${css.border}`,
                  background: 'transparent', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem',
                  color: css.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}>
                <Save style={{ width: 16, height: 16 }} />
                Save as Draft
              </button>
            </div>

            {/* Info note */}
            <div style={{
              marginTop: '1rem', padding: '0.75rem',
              backgroundColor: 'var(--surface-container-low)',
              borderRadius: 12, display: 'flex', gap: '0.625rem', alignItems: 'flex-start',
            }}>
              <Info style={{ width: 14, height: 14, color: css.amber, flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.6875rem', color: css.textMuted, lineHeight: 1.5 }}>
                Prices calculated using exchange rate 1 USD = ฿{rate.toFixed(2)}. Final settlement on inventory receipt.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Bottom Sheet ─────────────────────────── */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={sheetTitle}>
        {sheetContent === 'add-product' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: '0.5rem' }}>
                Product Name *
              </label>
              <input
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. Ultra-Slim Aluminum Chassis"
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: '0.5rem' }}>SKU</label>
                <input value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} placeholder="SKU-001" style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: '0.5rem' }}>Quantity *</label>
                <input type="number" value={newItem.qty} onChange={e => setNewItem({ ...newItem, qty: e.target.value })} placeholder="1" style={inputStyle}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: css.textMuted, display: 'block', marginBottom: '0.5rem' }}>Unit Price (USD) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', fontWeight: 700, color: css.textMuted }}>$</span>
                <input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="0.00" style={{ ...inputStyle, paddingLeft: '2rem' }}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }} />
              </div>
            </div>
            <button
              onClick={addItem}
              disabled={!newItem.name}
              style={{
                width: '100%', height: 52, borderRadius: 12, border: 'none',
                background: newItem.name ? `linear-gradient(135deg, ${css.primary}, var(--primary-dark))` : 'var(--surface-container-high)',
                cursor: newItem.name ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9375rem',
                color: newItem.name ? 'white' : css.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: newItem.name ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
              }}>
              <Plus style={{ width: 18, height: 18 }} />
              Add to Order
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {LOGISTICS.filter(l => !logistics[l.id]).map(log => {
              const Icon = log.icon;
              return (
                <button key={log.id}
                  onClick={() => { toggleLogistics(log.id); setSheetOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem', borderRadius: 14, border: `1.5px solid ${css.border}`,
                    background: 'transparent', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface-container-low)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: log.colorBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: 22, height: 22, color: log.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9375rem', color: css.text }}>{log.label}</p>
                    <p style={{ fontSize: '0.75rem', color: css.textMuted, marginTop: 2 }}>Add logistics cost</p>
                  </div>
                  <ChevronRight style={{ width: 18, height: 18, color: css.textMuted }} />
                </button>
              );
            })}
            {LOGISTICS.filter(l => !logistics[l.id]).length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: css.textMuted }}>
                <CheckCircle style={{ width: 32, height: 32, margin: '0 auto 0.75rem', color: css.success }} />
                <p style={{ fontWeight: 600 }}>All logistics added!</p>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* ── MOBILE STICKY BOTTOM CTA ─────────────── */}
      <div
        className="purchase-sticky-cta"
        style={{
          position: 'fixed', bottom: 80, left: 0, right: 0, zIndex: 40,
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)',
          borderTop: `1px solid ${css.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        }}>
        <div>
          <p style={{ fontSize: '0.625rem', color: css.textMuted }}>Total</p>
          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.125rem', color: css.primary }}>
            ฿{totalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <button onClick={handleConfirm}
          style={{
            height: 44, padding: '0 1.25rem', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${css.primary}, var(--primary-dark))`,
            cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem',
            color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
          }}>
          <CheckCircle style={{ width: 16, height: 16 }} />
          Confirm
        </button>
      </div>


    </div>
  );
}
