'use client';

import React, { useState } from 'react';
import { X, Package, Tag, Hash, Layers, DollarSign, ToggleLeft, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ['Wall Panels', 'Flooring', 'Surface', 'Accessories', 'Ceiling'];
const UNITS = ['pcs', 'm²', 'm', 'box', 'roll', 'kg', 'liter'];

const formFieldStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface-container-low)',
  border: '1px solid transparent',
  borderRadius: 12,
  padding: '0.75rem 1rem',
  width: '100%',
  fontSize: '0.875rem',
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
  letterSpacing: '0.1em',
  color: 'var(--on-surface-variant)',
  marginBottom: '0.5rem',
};

const groupStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
};

export default function ProductFormModal({ isOpen, onClose }: ProductFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', category: 'Wall Panels', unit: 'pcs',
    price: '', stock: '', reorderLevel: '20', status: 'active',
    description: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast('Please fill in required fields (Name, Price)', 'error');
      return;
    }
    setLoading(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 800));
    toast(`Product "${form.name}" created successfully!`, 'success');
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', zIndex: 1,
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 24, width: '100%', maxWidth: 680,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--surface-container-lowest)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package style={{ width: 20, height: 20, color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>Add New Product</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Add to catalog and inventory</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Product Name */}
            <div>
              <label style={labelStyle}><Package style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Product Name *</label>
              <input
                style={formFieldStyle}
                placeholder="e.g. Aluminum Panel 120x240cm"
                value={form.name} onChange={e => set('name', e.target.value)}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--primary)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
              />
            </div>

            {/* SKU + Category */}
            <div style={groupStyle}>
              <div>
                <label style={labelStyle}><Hash style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />SKU *</label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-container-low)', borderRadius: 12, overflow: 'hidden' }}>
                  <span style={{ padding: '0.75rem 0.75rem 0.75rem 1rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)', borderRight: '1px solid var(--outline-variant)', flexShrink: 0 }}>SKU</span>
                  <input
                    style={{ ...formFieldStyle, background: 'transparent', border: 'none', borderRadius: 0, paddingLeft: '0.75rem' }}
                    placeholder="AL-PNL-001"
                    value={form.sku} onChange={e => set('sku', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}><Tag style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Category *</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...formFieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <Layers style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* Price + Unit */}
            <div style={groupStyle}>
              <div>
                <label style={labelStyle}><DollarSign style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Unit Price (THB) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>฿</span>
                  <input type="number" style={{ ...formFieldStyle, paddingLeft: '2rem' }}
                    placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}><Layers style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Unit</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...formFieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={form.unit} onChange={e => set('unit', e.target.value)}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <Layers style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* Stock + Reorder */}
            <div style={groupStyle}>
              <div>
                <label style={labelStyle}>Current Stock</label>
                <input type="number" style={formFieldStyle} placeholder="0"
                  value={form.stock} onChange={e => set('stock', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}><AlertTriangle style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Reorder Level</label>
                <input type="number" style={formFieldStyle} placeholder="20"
                  value={form.reorderLevel} onChange={e => set('reorderLevel', e.target.value)} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}><ToggleLeft style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Status</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['active', 'low', 'out'].map(s => (
                  <button key={s} type="button"
                    onClick={() => set('status', s)}
                    style={{
                      flex: 1, padding: '0.625rem', borderRadius: 12, border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600,
                      transition: 'all 150ms',
                      backgroundColor: form.status === s ? (
                        s === 'active' ? 'var(--success-container)' :
                        s === 'low' ? 'var(--warning-container)' : 'var(--surface-container-high)'
                      ) : 'var(--surface-container-low)',
                      color: form.status === s ? (
                        s === 'active' ? 'var(--success)' :
                        s === 'low' ? 'var(--warning)' : 'var(--on-surface-variant)'
                      ) : 'var(--on-surface-variant)',
                    }}>
                    {s === 'active' ? 'Active' : s === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...formFieldStyle, resize: 'vertical', minHeight: 80 }}
                placeholder="Optional product description or notes…"
                value={form.description} onChange={e => set('description', e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '1rem 2rem 1.5rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--outline-variant)' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.875rem', borderRadius: 9999, border: '1.5px solid var(--outline)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 2, padding: '0.875rem', borderRadius: 9999, border: 'none',
                background: loading ? 'var(--surface-container-high)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(249,115,22,0.3)',
                transition: 'all 150ms',
              }}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />
                  Saving…
                </>
              ) : (
                <>Add Product</>
              )}
            </button>
          </div>
        </form>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
