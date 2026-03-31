'use client';

import React, { useState } from 'react';
import { X, Users, Building2, Mail, Phone, MapPin, Star, User, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/supabase';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLIENT_TYPES = ['Architectural Firm', 'Interior Design', 'Developer', 'Contractor', 'Retailer', 'Government', 'Other'];
const TIERS = [
  { id: 'gold',   label: 'Gold',   color: '#F59E0B' },
  { id: 'silver', label: 'Silver', color: '#6B7280' },
  { id: 'bronze', label: 'Bronze', color: '#EA580C' },
];

export default function ClientFormModal({ isOpen, onClose }: ClientFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', contact: '', email: '', phone: '',
    location: '', type: 'Architectural Firm', tier: 'silver',
    address: '', taxId: '', note: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast('Please fill in Company Name', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.createCustomer({
        name: form.name,
        company_name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        province: form.location || null,
        customer_type: form.type.toLowerCase().replace(/[\s-]+/g, '_'),
      });
      toast(`Client "${form.name}" added successfully!`, 'success');
      // Reset form
      setForm({ name: '', contact: '', email: '', phone: '', location: '', type: 'Architectural Firm', tier: 'silver', address: '', taxId: '', note: '' });
      onClose();
    } catch (err: any) {
      toast('Failed to add client: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fieldStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-container-low)',
    border: '1px solid transparent',
    borderRadius: 12,
    padding: '0.75rem 1rem',
    width: '100%', fontSize: '0.875rem',
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-body)',
    outline: 'none', transition: 'all 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.625rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} />

      <div style={{
        position: 'relative', zIndex: 1, backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 24, width: '100%', maxWidth: 700,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--surface-container-lowest)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: 20, height: 20, color: '#7C3AED' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>Add New Client</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Add a business partner to your CRM</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Company Name */}
            <div>
              <label style={labelStyle}><Building2 style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Company Name *</label>
              <input style={fieldStyle} placeholder="e.g. AEC Living Co., Ltd."
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            {/* Contact + Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><User style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Contact Person</label>
                <input style={fieldStyle} placeholder="e.g. Prasert S."
                  value={form.contact} onChange={e => set('contact', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Business Type</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={form.type} onChange={e => set('type', e.target.value)}>
                    {CLIENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <Building2 style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* Email + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><Mail style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Email Address *</label>
                <input type="email" style={fieldStyle} placeholder="contact@company.co.th"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}><Phone style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Phone</label>
                <input style={fieldStyle} placeholder="+66 2 888 1234"
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            {/* Location + Tax ID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><MapPin style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Location / City</label>
                <input style={fieldStyle} placeholder="e.g. Bangkok"
                  value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}><Building2 style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Tax ID</label>
                <input style={fieldStyle} placeholder="0-0000-00000-00-0"
                  value={form.taxId} onChange={e => set('taxId', e.target.value)} />
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label style={labelStyle}><Globe style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Full Address</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 64 }}
                placeholder="Full business address…"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            {/* Client Tier */}
            <div>
              <label style={labelStyle}><Star style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />Client Tier</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {TIERS.map(t => (
                  <button key={t.id} type="button"
                    onClick={() => set('tier', t.id)}
                    style={{
                      flex: 1, padding: '0.875rem', borderRadius: 14, border: '2px solid',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 700,
                      transition: 'all 150ms',
                      borderColor: form.tier === t.id ? t.color : 'var(--outline-variant)',
                      backgroundColor: form.tier === t.id ? `${t.color}15` : 'var(--surface-container-low)',
                      color: form.tier === t.id ? t.color : 'var(--on-surface-variant)',
                    }}>
                    <Star style={{ width: 14, height: 14, fill: form.tier === t.id ? t.color : 'none' }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 64 }}
                placeholder="Any notes about this client…"
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
                background: loading ? 'var(--surface-container-high)' : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(124,58,237,0.3)',
                transition: 'all 150ms',
              }}>
              {loading ? (
                <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />Saving…</>
              ) : 'Add Client'}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
