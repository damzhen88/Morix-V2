'use client';

import React, { useEffect, useState } from 'react';
import { X, Users, Building2, Mail, Phone, MapPin, Star, User, Globe, CalendarClock } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useMutations } from '@/store';
import { CREDIT_TERM_OPTIONS, creditTermLabelTH } from '@/lib/payment';
import { StorageFullError } from '@/lib/local-db';
import type { Customer, CustomerType, CustomerTier } from '@/types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** ส่งลูกค้าเดิมมาเพื่อแก้ไข ไม่ส่ง = เพิ่มใหม่ */
  customer?: Customer | null;
}

const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: 'contractor', label: 'ผู้รับเหมา' },
  { value: 'homeowner', label: 'เจ้าของบ้าน' },
  { value: 'dealer', label: 'ตัวแทนจำหน่าย' },
  { value: 'project', label: 'โครงการ' },
];

const TIERS: { id: CustomerTier; label: string; color: string }[] = [
  { id: 'gold', label: 'ทอง', color: '#F59E0B' },
  { id: 'silver', label: 'เงิน', color: '#6B7280' },
  { id: 'bronze', label: 'ทองแดง', color: '#EA580C' },
];

const emptyForm = {
  name: '', contact: '', email: '', phone: '',
  province: '', customer_type: 'contractor' as CustomerType, tier: 'silver' as CustomerTier,
  address: '', tax_id: '', notes: '', credit_term_days: 0,
};

export default function ClientFormModal({ isOpen, onClose, customer }: ClientFormModalProps) {
  const { toast } = useToast();
  const { addCustomer, updateCustomer } = useMutations();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const isEdit = Boolean(customer);

  // เติมค่าเดิมเมื่อเปิดเพื่อแก้ไข และล้างฟอร์มเมื่อเปิดเพื่อเพิ่มใหม่
  useEffect(() => {
    if (!isOpen) return;

    setForm(
      customer
        ? {
            name: customer.name ?? '',
            contact: customer.contact ?? '',
            email: customer.email ?? '',
            phone: customer.phone ?? '',
            province: customer.province ?? '',
            customer_type: customer.customer_type ?? 'contractor',
            tier: customer.tier ?? 'silver',
            address: customer.address ?? '',
            tax_id: customer.tax_id ?? '',
            notes: customer.notes ?? '',
            credit_term_days: customer.credit_term_days ?? 0,
          }
        : emptyForm
    );
  }, [isOpen, customer]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast('กรุณากรอกชื่อลูกค้า', 'error');
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();

      if (customer) {
        updateCustomer(customer.id, { ...form, updated_at: now });
        toast(`บันทึกข้อมูล "${form.name}" แล้ว`, 'success');
      } else {
        addCustomer({
          id: '',
          // รหัสลูกค้าจากเวลา เพื่อไม่ให้ซ้ำโดยไม่ต้องไปนับของเดิม
          code: `C-${Date.now().toString(36).toUpperCase().slice(-6)}`,
          ...form,
          created_at: now,
          updated_at: now,
        } as Customer);
        toast(`เพิ่มลูกค้า "${form.name}" แล้ว`, 'success');
      }

      onClose();
    } catch (err) {
      // พื้นที่เต็มต้องบอกผู้ใช้ตรงๆ ไม่ใช่หายไปเงียบๆ
      toast(err instanceof StorageFullError ? err.message : 'บันทึกไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
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

  // ไม่ใช้ uppercase/letter-spacing กว้าง เพราะไม่มีผลกับอักษรไทยและทำให้วรรณยุกต์ถูกตัด
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem', fontWeight: 700,
    letterSpacing: '0.02em',
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
        {/* หัว modal */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--surface-container-lowest)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: 20, height: 20, color: '#7C3AED' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>
                {isEdit ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                กำหนดเงื่อนไขเครดิตได้ที่นี่ จะใช้เป็นค่าตั้งต้นเวลาเปิดบิล
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="ปิด" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ชื่อลูกค้า */}
            <div>
              <label style={labelStyle}><Building2 style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />ชื่อลูกค้า / บริษัท *</label>
              <input style={fieldStyle} placeholder="เช่น บริษัท รีโนเวท คอนสตรัคชั่น จำกัด"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            {/* ผู้ติดต่อ + ประเภท */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><User style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />ชื่อผู้ติดต่อ</label>
                <input style={fieldStyle} placeholder="เช่น คุณประเสริฐ"
                  value={form.contact} onChange={e => set('contact', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>ประเภทลูกค้า</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={form.customer_type} onChange={e => set('customer_type', e.target.value as CustomerType)}>
                    {CUSTOMER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <Building2 style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* เงื่อนไขเครดิต */}
            <div>
              <label style={labelStyle}>
                <CalendarClock style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                เงื่อนไขการชำระเงิน
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {CREDIT_TERM_OPTIONS.map(days => {
                  const active = form.credit_term_days === days;
                  return (
                    <button key={days} type="button"
                      onClick={() => set('credit_term_days', days)}
                      style={{
                        flex: '1 1 6rem', padding: '0.75rem 0.5rem', borderRadius: 12,
                        border: '2px solid', cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 700,
                        transition: 'all 150ms',
                        borderColor: active ? 'var(--primary)' : 'var(--outline-variant)',
                        backgroundColor: active ? 'var(--primary-container)' : 'var(--surface-container-low)',
                        color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
                      }}>
                      {creditTermLabelTH(days)}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
                {form.credit_term_days > 0
                  ? `บิลของลูกค้ารายนี้จะครบกำหนดชำระใน ${form.credit_term_days} วันหลังเปิดบิล`
                  : 'ชำระทันทีเมื่อเปิดบิล ไม่มีกำหนดชำระให้ติดตาม'}
              </p>
            </div>

            {/* อีเมล + โทรศัพท์ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><Mail style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />อีเมล</label>
                <input type="email" style={fieldStyle} placeholder="contact@example.co.th"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}><Phone style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />เบอร์โทร</label>
                <input type="tel" style={fieldStyle} placeholder="02-555-1234"
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            {/* จังหวัด + เลขผู้เสียภาษี */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><MapPin style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />จังหวัด</label>
                <input style={fieldStyle} placeholder="เช่น กรุงเทพมหานคร"
                  value={form.province} onChange={e => set('province', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}><Building2 style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />เลขผู้เสียภาษี</label>
                <input style={fieldStyle} placeholder="0-0000-00000-00-0"
                  value={form.tax_id} onChange={e => set('tax_id', e.target.value)} />
              </div>
            </div>

            {/* ที่อยู่ */}
            <div>
              <label style={labelStyle}><Globe style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />ที่อยู่</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 64 }}
                placeholder="ที่อยู่สำหรับออกใบกำกับภาษีและจัดส่ง"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            {/* ระดับลูกค้า */}
            <div>
              <label style={labelStyle}><Star style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />ระดับลูกค้า</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {TIERS.map(t => {
                  const active = form.tier === t.id;
                  return (
                    <button key={t.id} type="button"
                      onClick={() => set('tier', t.id)}
                      style={{
                        flex: 1, padding: '0.875rem', borderRadius: 14, border: '2px solid',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 700,
                        transition: 'all 150ms',
                        borderColor: active ? t.color : 'var(--outline-variant)',
                        backgroundColor: active ? `${t.color}15` : 'var(--surface-container-low)',
                        color: active ? t.color : 'var(--on-surface-variant)',
                      }}>
                      <Star style={{ width: 14, height: 14, fill: active ? t.color : 'none' }} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* หมายเหตุ */}
            <div>
              <label style={labelStyle}>หมายเหตุ</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 64 }}
                placeholder="ข้อมูลอื่นที่ควรจำเกี่ยวกับลูกค้ารายนี้"
                value={form.notes} onChange={e => set('notes', e.target.value)} />
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
                background: saving ? 'var(--surface-container-high)' : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: saving ? 'none' : '0 4px 12px rgba(124,58,237,0.3)',
                transition: 'all 150ms',
              }}>
              {saving ? (
                <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />กำลังบันทึก…</>
              ) : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
