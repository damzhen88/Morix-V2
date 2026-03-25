'use client';

import React, { useState } from 'react';
import { X, Receipt, Tag, Truck, Zap, Wrench, Building, CreditCard, Plus, Trash2, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/supabase';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'logistics',   label: 'Logistics',    icon: Truck,        color: '#2563EB' },
  { id: 'facility',    label: 'Facility',     icon: Building,      color: '#7C3AED' },
  { id: 'utilities',   label: 'Utilities',    icon: Zap,           color: '#D97706' },
  { id: 'maintenance', label: 'Maintenance',  icon: Wrench,       color: '#DC2626' },
  { id: 'payroll',     label: 'Payroll',      icon: CreditCard,    color: '#059669' },
  { id: 'marketing',   label: 'Marketing',    icon: Tag,           color: '#DB2777' },
  { id: 'admin',      label: 'Admin',         icon: Receipt,      color: '#6B7280' },
];

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

export default function ExpenseFormModal({ isOpen, onClose }: ExpenseFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    description: '', category: 'logistics', vendor: '', date: new Date().toISOString().split('T')[0],
    amount: '', currency: 'THB', ref: '', note: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) {
      toast('Please fill in description and amount', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.createExpense({
        description: form.description,
        category: form.category,
        date: form.date,
        amount_thb: parseFloat(form.amount) || 0,
        
        notes: form.note || null,
      });
      toast(`Expense "${form.description}" recorded!`, 'success');
      onClose();
    } catch (err: any) {
      toast('Failed to record expense: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const cat = CATEGORIES.find(c => c.id === form.category) || CATEGORIES[0];
  const CatIcon = cat.icon;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} />

      <div style={{
        position: 'relative', zIndex: 1, backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 24, width: '100%', maxWidth: 600,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--surface-container-lowest)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CatIcon style={{ width: 20, height: 20, color: cat.color }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>Add Expense</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Record a business expense</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Category selector */}
            <div>
              <label style={labelStyle}>Category *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {CATEGORIES.map(c => {
                  const Icon = c.icon;
                  return (
                    <button key={c.id} type="button"
                      onClick={() => set('category', c.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.5rem 0.875rem', borderRadius: 9999, border: '2px solid',
                        cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600,
                        transition: 'all 150ms',
                        borderColor: form.category === c.id ? c.color : 'var(--outline-variant)',
                        backgroundColor: form.category === c.id ? `${c.color}15` : 'var(--surface-container-low)',
                        color: form.category === c.id ? c.color : 'var(--on-surface-variant)',
                      }}>
                      <Icon style={{ width: 14, height: 14 }} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}><Receipt style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Description *</label>
              <input style={fieldStyle} placeholder="e.g. China Domestic Freight (PO-2847)"
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            {/* Vendor + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Vendor / Payee</label>
                <input style={fieldStyle} placeholder="e.g. Fast Ship Co."
                  value={form.vendor} onChange={e => set('vendor', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}><Calendar style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Date</label>
                <input type="date" style={fieldStyle} value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>

            {/* Amount + Currency + Ref */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label style={labelStyle}><DollarSign style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Amount *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                    {form.currency === 'USD' ? '$' : form.currency === 'CNY' ? '¥' : '฿'}
                  </span>
                  <input type="number" step="0.01" style={{ ...fieldStyle, paddingLeft: '2rem' }}
                    placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Currency</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={form.currency} onChange={e => set('currency', e.target.value)}>
                    <option>THB</option>
                    <option>USD</option>
                    <option>CNY</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Reference / PO #</label>
                <input style={fieldStyle} placeholder="PO-2847"
                  value={form.ref} onChange={e => set('ref', e.target.value)} />
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 64 }}
                placeholder="Additional notes…"
                value={form.note} onChange={e => set('note', e.target.value)} />
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
                background: loading ? 'var(--surface-container-high)' : `linear-gradient(135deg, ${cat.color}, ${cat.color}CC)`,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 150ms',
              }}>
              {loading ? (
                <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />Saving…</>
              ) : 'Add Expense'}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
