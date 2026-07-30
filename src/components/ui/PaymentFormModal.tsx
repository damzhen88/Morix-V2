'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Wallet, Calendar, Hash, Paperclip, Banknote, Landmark, FileCheck, CreditCard, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useApp, useMutations, usePaymentsByOrder } from '@/store';
import { StorageFullError } from '@/lib/local-db';
import { saveImage, deleteImage, imageKey } from '@/lib/local-images';
import { useLocalImage } from '@/lib/use-local-image';
import { formatTHB, formatThaiDate } from '@/lib/format';
import {
  balance, paidTotal, paymentStatus, summarize, paymentSequenceLabelTH,
  toOrderLike, toDateOnly,
  PAYMENT_METHOD_LABEL_TH, PAYMENT_STATUS_LABEL_TH,
} from '@/lib/payment';
import type { Payment, PaymentMethod, SalesOrder } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface PaymentFormModalProps {
  isOpen: boolean;
  /** บิลที่จะรับเงิน — modal นี้ไม่ผ่าน FormModalContext เพราะ context ส่ง payload ไม่ได้ */
  order: SalesOrder | null;
  onClose: () => void;
}

const METHODS: { value: PaymentMethod; icon: typeof Banknote }[] = [
  { value: 'cash', icon: Banknote },
  { value: 'transfer', icon: Landmark },
  { value: 'cheque', icon: FileCheck },
  { value: 'card', icon: CreditCard },
];

export default function PaymentFormModal({ isOpen, order, onClose }: PaymentFormModalProps) {
  const { toast } = useToast();
  const { state } = useApp();
  const { addPayment, deletePayment } = useMutations();
  const byOrder = usePaymentsByOrder();
  const fileInput = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [paidAt, setPaidAt] = useState(toDateOnly(new Date()));
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [note, setNote] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  // อ่านรายการรับเงินสดจาก state ไม่ใช่ prop เพื่อให้ประวัติอัปเดตทันทีหลังบันทึก
  const payments = useMemo(
    () => (order ? byOrder.get(order.id) ?? [] : []),
    [order, byOrder]
  );

  const paid = paidTotal(payments);
  const remaining = order ? balance(order.total, payments) : 0;
  const status = order ? paymentStatus(order.total, payments) : 'unpaid';
  const info = order ? summarize(toOrderLike(order), payments) : null;

  const amountValue = Math.max(0, Number(amount) || 0);
  const afterThis = Math.max(0, remaining - amountValue);
  const isOverpay = amountValue > remaining + 0.005;

  useEffect(() => {
    if (!isOpen) return;
    setPaidAt(toDateOnly(new Date()));
    setAmount('');
    setMethod('transfer');
    setReferenceNo('');
    setNote('');
    setSlipFile(null);
    setSlipPreview(null);
  }, [isOpen, order?.id]);

  // ปล่อย object URL ของรูปที่เลือกไว้ ไม่ให้ค้างในหน่วยความจำ
  useEffect(() => {
    if (!slipFile) { setSlipPreview(null); return; }
    const url = URL.createObjectURL(slipFile);
    setSlipPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [slipFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (amountValue <= 0) {
      toast('กรุณากรอกจำนวนเงินที่รับ', 'error');
      return;
    }

    setSaving(true);
    try {
      const paymentId = uuidv4();
      let hasSlip = false;

      // เก็บสลิปก่อน ถ้าเก็บไม่ได้จะได้ไม่บันทึกรายการที่อ้างว่ามีสลิปแต่ไม่มี
      if (slipFile) {
        try {
          await saveImage(imageKey('slip', paymentId), slipFile);
          hasSlip = true;
        } catch (err) {
          toast(
            err instanceof StorageFullError
              ? 'พื้นที่ไม่พอเก็บรูปสลิป — บันทึกรายการรับเงินแต่ไม่มีรูป'
              : 'เก็บรูปสลิปไม่สำเร็จ — บันทึกรายการรับเงินแต่ไม่มีรูป',
            'warning'
          );
        }
      }

      addPayment({
        id: paymentId,
        sales_order_id: order.id,
        paid_at: paidAt,
        amount_thb: amountValue,
        method,
        reference_no: referenceNo || undefined,
        note: note || undefined,
        has_slip: hasSlip,
        created_at: new Date().toISOString(),
      } as Payment);

      const left = Math.max(0, order.total - (paid + amountValue));
      toast(
        left <= 0.005
          ? `รับเงิน ${formatTHB(amountValue)} — ปิดยอดบิล ${order.order_number} แล้ว`
          : `รับเงิน ${formatTHB(amountValue)} — คงเหลือ ${formatTHB(left)}`,
        'success'
      );

      onClose();
    } catch (err) {
      toast(err instanceof StorageFullError ? err.message : 'บันทึกการรับเงินไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (payment: Payment) => {
    if (!confirm(`ลบรายการรับเงิน ${formatTHB(payment.amount_thb)} วันที่ ${formatThaiDate(payment.paid_at, { short: true })} ?`)) {
      return;
    }
    if (payment.has_slip) await deleteImage(imageKey('slip', payment.id));
    deletePayment(payment.id);
    toast('ลบรายการรับเงินแล้ว', 'info');
  };

  if (!isOpen || !order) return null;

  const customer = state.customers.find(c => c.id === order.customer_id);

  const fieldStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-container-low)',
    border: '1px solid transparent',
    borderRadius: 12, padding: '0.75rem 1rem',
    width: '100%', fontSize: '0.875rem',
    color: 'var(--on-surface)', fontFamily: 'var(--font-body)', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 700,
    letterSpacing: '0.02em',
    color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
  };

  /** ปุ่มลัดจำนวนเงิน — ทำให้รับมัดจำและปิดยอดเป็นการกดครั้งเดียว */
  const quickFills = [
    { label: 'มัดจำ 30%', value: Math.round(order.total * 0.3) },
    { label: 'ครึ่งหนึ่ง', value: Math.round(order.total * 0.5) },
    { label: 'ยอดคงเหลือ', value: remaining },
  ].filter(q => q.value > 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} />

      <div style={{
        position: 'relative', zIndex: 1, backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 24, width: '100%', maxWidth: 620,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
      }}>
        {/* หัว modal */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', position: 'sticky', top: 0, backgroundColor: 'var(--surface-container-lowest)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--success-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet style={{ width: 20, height: 20, color: 'var(--success)' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>บันทึกรับเงิน</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 2, overflowWrap: 'anywhere' }}>
                {order.order_number} · {customer?.name ?? order.customer_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="ปิด" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, color: 'var(--on-surface-variant)', flexShrink: 0 }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* สรุปยอดบิล */}
        <div style={{ margin: '1.25rem 1.75rem 0', backgroundColor: 'var(--surface-container-low)', borderRadius: 16, padding: '1rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'ยอดบิล', value: formatTHB(order.total), color: 'var(--on-surface)' },
              { label: 'ชำระแล้ว', value: formatTHB(paid), color: 'var(--success)' },
              { label: 'คงเหลือ', value: formatTHB(remaining), color: remaining > 0 ? 'var(--primary)' : 'var(--success)' },
            ].map(cell => (
              <div key={cell.label}>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: 2 }}>{cell.label}</p>
                <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: cell.color, overflowWrap: 'normal' }}>
                  {cell.value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--outline-variant)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.1875rem 0.625rem', borderRadius: 9999, backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}>
              {PAYMENT_STATUS_LABEL_TH[status]}
            </span>
            {info?.dueDate && (
              <span style={{ fontSize: '0.75rem', color: info.overdue ? 'var(--error)' : 'var(--on-surface-variant)', fontWeight: info.overdue ? 700 : 400 }}>
                {info.overdue
                  ? `เกินกำหนด ${info.daysOverdue} วัน (ครบกำหนด ${formatThaiDate(info.dueDate, { short: true })})`
                  : `ครบกำหนด ${formatThaiDate(info.dueDate, { short: true })}`}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* จำนวนเงิน + ปุ่มลัด */}
            <div>
              <label style={labelStyle}>จำนวนเงินที่รับ *</label>
              <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" autoFocus
                style={{ ...fieldStyle, fontSize: '1.25rem', fontWeight: 700, textAlign: 'right', fontFamily: 'var(--font-headline)' }}
                value={amount} onChange={e => setAmount(e.target.value)} />

              {quickFills.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.625rem' }}>
                  {quickFills.map(q => (
                    <button key={q.label} type="button" onClick={() => setAmount(String(q.value))}
                      style={{
                        padding: '0.5rem 0.875rem', borderRadius: 9999, border: 'none',
                        backgroundColor: 'var(--primary-container)', color: 'var(--primary)',
                        cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700,
                        fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                      }}>
                      {q.label} · {formatTHB(q.value)}
                    </button>
                  ))}
                </div>
              )}

              {/* เตือนแต่ไม่บล็อก — ร้านจริงมีรับเกินและเศษปัด */}
              {isOverpay && (
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--warning)', marginTop: '0.5rem' }}>
                  <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  มากกว่ายอดคงเหลือ {formatTHB(amountValue - remaining)} — บันทึกได้ ระบบจะถือเป็นชำระเกิน
                </p>
              )}
            </div>

            {/* วันที่ + ช่องทาง */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><Calendar style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />วันที่รับเงิน</label>
                <input type="date" style={fieldStyle} value={paidAt} onChange={e => setPaidAt(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}><Hash style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />เลขอ้างอิง / เลขเช็ค</label>
                <input style={fieldStyle} placeholder="เช่น TRF-88213"
                  value={referenceNo} onChange={e => setReferenceNo(e.target.value)} />
              </div>
            </div>

            {/* ช่องทางชำระ */}
            <div>
              <label style={labelStyle}>ช่องทางชำระ</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(7rem, 1fr))', gap: '0.5rem' }}>
                {METHODS.map(m => {
                  const active = method === m.value;
                  const Icon = m.icon;
                  return (
                    <button key={m.value} type="button" onClick={() => setMethod(m.value)}
                      style={{
                        padding: '0.75rem 0.5rem', borderRadius: 12, border: '2px solid',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                        fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 700,
                        borderColor: active ? 'var(--primary)' : 'var(--outline-variant)',
                        backgroundColor: active ? 'var(--primary-container)' : 'var(--surface-container-low)',
                        color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
                        transition: 'all 150ms',
                      }}>
                      <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                      {PAYMENT_METHOD_LABEL_TH[m.value]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* แนบสลิป */}
            <div>
              <label style={labelStyle}><Paperclip style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />แนบรูปสลิป (ไม่บังคับ)</label>
              <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => setSlipFile(e.target.files?.[0] ?? null)} />

              {slipPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 12, padding: '0.75rem' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slipPreview} alt="สลิปที่เลือก"
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)', overflowWrap: 'anywhere' }}>
                      {slipFile?.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                      ระบบจะย่อรูปให้อัตโนมัติก่อนเก็บ
                    </p>
                  </div>
                  <button type="button" onClick={() => setSlipFile(null)} aria-label="ลบรูป"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '0.375rem', flexShrink: 0 }}>
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInput.current?.click()}
                  style={{
                    width: '100%', padding: '0.875rem', borderRadius: 12,
                    border: '1.5px dashed var(--outline)', background: 'transparent', cursor: 'pointer',
                    color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}>
                  <Paperclip style={{ width: 16, height: 16 }} />
                  เลือกรูปสลิป
                </button>
              )}
            </div>

            {/* หมายเหตุ */}
            <div>
              <label style={labelStyle}>หมายเหตุ</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 56 }}
                placeholder="เช่น โอนผ่านบัญชีกสิกร"
                value={note} onChange={e => setNote(e.target.value)} />
            </div>

            {/* ผลหลังบันทึก */}
            {amountValue > 0 && (
              <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 12, padding: '0.875rem 1.125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>คงเหลือหลังรับเงินครั้งนี้</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.0625rem', color: afterThis <= 0 ? 'var(--success)' : 'var(--primary)' }}>
                  {afterThis <= 0 ? 'ปิดยอดครบ' : formatTHB(afterThis)}
                </span>
              </div>
            )}

            {/* ประวัติการรับเงิน */}
            {payments.length > 0 && (
              <div>
                <label style={labelStyle}>ประวัติการรับเงิน ({payments.length} ครั้ง)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {payments.map((p, index) => {
                    const closes = balance(order.total, payments.slice(0, index + 1)) <= 0.005;
                    return (
                      <PaymentHistoryRow
                        key={p.id}
                        payment={p as Payment}
                        label={paymentSequenceLabelTH(index, payments.length, closes)}
                        onDelete={() => handleDeletePayment(p as Payment)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ปุ่มท้าย modal */}
          <div style={{ padding: '1rem 1.75rem 1.5rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--outline-variant)', position: 'sticky', bottom: 0, backgroundColor: 'var(--surface-container-lowest)' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.875rem', borderRadius: 9999, border: '1.5px solid var(--outline)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>
              ปิด
            </button>
            <button type="submit" disabled={saving || amountValue <= 0}
              style={{
                flex: 2, padding: '0.875rem', borderRadius: 9999, border: 'none',
                background: saving || amountValue <= 0 ? 'var(--surface-container-high)' : 'linear-gradient(135deg, #16A34A, #15803D)',
                cursor: saving || amountValue <= 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem',
                color: saving || amountValue <= 0 ? 'var(--on-surface-variant)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 150ms',
              }}>
              {saving ? (
                <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />กำลังบันทึก…</>
              ) : amountValue > 0 ? `รับเงิน ${formatTHB(amountValue)}` : 'กรอกจำนวนเงิน'}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

/** แถวประวัติการรับเงิน แยกออกมาเพราะต้องโหลดรูปสลิปผ่าน hook */
function PaymentHistoryRow({
  payment, label, onDelete,
}: {
  payment: Payment;
  label: string;
  onDelete: () => void;
}) {
  const { url } = useLocalImage(payment.has_slip ? imageKey('slip', payment.id) : null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 12, padding: '0.75rem' }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <a href={url} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
          <img src={url} alt="สลิป" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
        </a>
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Wallet style={{ width: 16, height: 16, color: 'var(--on-surface-variant)' }} />
        </div>
      )}

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--on-surface)' }}>
            {formatTHB(payment.amount_thb)}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{label}</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', overflowWrap: 'anywhere' }}>
          {formatThaiDate(payment.paid_at, { short: true })} · {PAYMENT_METHOD_LABEL_TH[payment.method]}
          {payment.reference_no ? ` · ${payment.reference_no}` : ''}
          {payment.note ? ` · ${payment.note}` : ''}
        </p>
      </div>

      <button type="button" onClick={onDelete} aria-label="ลบรายการรับเงิน"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '0.375rem', flexShrink: 0 }}>
        <Trash2 style={{ width: 15, height: 15 }} />
      </button>
    </div>
  );
}
