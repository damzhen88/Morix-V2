'use client';

import { useMemo, useState } from 'react';
import { useApp, usePaymentsByOrder } from '@/store';
import { useFormModal } from '@/components/ui/FormModalContext';
import ClientFormModal from '@/components/ui/ClientFormModal';
import PaymentFormModal from '@/components/ui/PaymentFormModal';
import {
  Plus, Search, Users, Mail, Phone, MapPin, Star, Pencil,
  Wallet, AlertTriangle, Download,
} from 'lucide-react';
import { formatTHB, formatThaiDate } from '@/lib/format';
import { exportRows } from '@/lib/export-excel';
import { markBackedUp } from '@/lib/local-db';
import { useToast } from '@/components/ui/Toast';
import { summarize, toOrderLike, creditTermLabelTH } from '@/lib/payment';
import type { Customer, CustomerTier, SalesOrder } from '@/types';

const TIER_LABEL: Record<CustomerTier, string> = { gold: 'ทอง', silver: 'เงิน', bronze: 'ทองแดง' };
const TIER_COLOR: Record<CustomerTier, string> = { gold: '#F59E0B', silver: '#6B7280', bronze: '#EA580C' };

const TYPE_LABEL: Record<string, string> = {
  contractor: 'ผู้รับเหมา',
  homeowner: 'เจ้าของบ้าน',
  dealer: 'ตัวแทนจำหน่าย',
  project: 'โครงการ',
};

const TIER_FILTERS: { id: 'all' | CustomerTier; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'gold', label: 'ทอง' },
  { id: 'silver', label: 'เงิน' },
  { id: 'bronze', label: 'ทองแดง' },
];

export default function CrmPage() {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<'all' | CustomerTier>('all');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [payingOrder, setPayingOrder] = useState<SalesOrder | null>(null);

  const { openForm } = useFormModal();
  const { state } = useApp();
  const byOrder = usePaymentsByOrder();
  const { toast } = useToast();

  /**
   * รวมข้อมูลการซื้อและยอดค้างของลูกค้าแต่ละราย
   * เดิมหน้านี้เป็น array hardcode 5 ราย และเรียก useApp() ไว้แต่ไม่ได้ใช้
   */
  const clients = useMemo(() => {
    return state.customers.map(customer => {
      const orders = state.salesOrders.filter(o => o.customer_id === customer.id);

      let totalValue = 0;
      let balance = 0;
      let overdueCount = 0;
      let lastOrderDate: string | null = null;
      let oldestOverdue: { order: SalesOrder; days: number } | null = null;

      for (const order of orders) {
        const s = summarize(toOrderLike(order), byOrder.get(order.id) ?? []);
        totalValue += order.total;
        balance += s.balance;

        if (s.overdue) {
          overdueCount += 1;
          if (!oldestOverdue || s.daysOverdue > oldestOverdue.days) {
            oldestOverdue = { order, days: s.daysOverdue };
          }
        }
        if (!lastOrderDate || order.order_date > lastOrderDate) lastOrderDate = order.order_date;
      }

      return { customer, orders, totalValue, balance, overdueCount, lastOrderDate, oldestOverdue };
    });
  }, [state.customers, state.salesOrders, byOrder]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clients.filter(({ customer }) => {
      const matchSearch =
        !q ||
        customer.name.toLowerCase().includes(q) ||
        (customer.contact ?? '').toLowerCase().includes(q) ||
        (customer.phone ?? '').includes(q) ||
        customer.code.toLowerCase().includes(q);

      return matchSearch && (tier === 'all' || customer.tier === tier);
    });
  }, [clients, search, tier]);

  const kpis = useMemo(() => {
    const withBalance = clients.filter(c => c.balance > 0);
    const totalRevenue = clients.reduce((s, c) => s + c.totalValue, 0);

    return [
      { label: 'ลูกค้าทั้งหมด', value: state.customers.length.toString(), sub: 'ราย' },
      { label: 'ลูกค้าเครดิต', value: state.customers.filter(c => c.credit_term_days > 0).length.toString(), sub: 'ราย' },
      { label: 'ยอดขายรวม', value: formatTHB(totalRevenue), sub: `${clients.reduce((s, c) => s + c.orders.length, 0)} บิล` },
      { label: 'ค้างชำระ', value: formatTHB(clients.reduce((s, c) => s + c.balance, 0)), sub: `${withBalance.length} ราย`, alert: withBalance.length > 0 },
    ];
  }, [clients, state.customers]);

  const handleExport = () => {
    if (clients.length === 0) {
      toast('ยังไม่มีลูกค้าให้ส่งออก', 'info');
      return;
    }

    exportRows(
      clients.map(c => ({
        'รหัสลูกค้า': c.customer.code,
        'ชื่อลูกค้า': c.customer.name,
        'ผู้ติดต่อ': c.customer.contact ?? '',
        'เบอร์โทร': c.customer.phone ?? '',
        'อีเมล': c.customer.email ?? '',
        'จังหวัด': c.customer.province ?? '',
        'ประเภท': TYPE_LABEL[c.customer.customer_type] ?? c.customer.customer_type,
        'ระดับ': TIER_LABEL[c.customer.tier],
        'เงื่อนไขชำระ': creditTermLabelTH(c.customer.credit_term_days),
        'เลขผู้เสียภาษี': c.customer.tax_id ?? '',
        'จำนวนบิล': c.orders.length,
        'ยอดซื้อรวม': c.totalValue,
        'ค้างชำระ': c.balance,
        'บิลเกินกำหนด': c.overdueCount || '',
        'ซื้อครั้งล่าสุด': c.lastOrderDate ?? '',
      })),
      'ลูกค้า',
      'morix-customers'
    );

    markBackedUp();
    toast('ส่งออกรายชื่อลูกค้าแล้ว', 'success');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* หัวหน้า */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            ข้อมูลลูกค้า
          </div>
          <h1 className="page-header-title">ลูกค้า</h1>
          <p className="page-header-subtitle">{state.customers.length} ราย</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="btn-primary" onClick={handleExport}
            style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)', boxShadow: 'none' }}>
            <Download className="w-4 h-4" />
            ส่งออก Excel
          </button>
          <button className="btn-primary" onClick={() => openForm('client')}>
            <Plus className="w-4 h-4" />
            เพิ่มลูกค้า
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="flex items-start justify-between mb-4 gap-2">
              <div className="kpi-icon-wrap">
                <Users className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              {k.alert && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-[var(--error-container)] text-[var(--error)] flex-shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  ค้างชำระ
                </span>
              )}
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="mt-1 text-xs text-[var(--on-surface-variant)]">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ค้นหา + ตัวกรอง */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] pointer-events-none" />
          <input
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--surface-container-low)] text-sm outline-none"
            placeholder="ค้นหาชื่อลูกค้า ผู้ติดต่อ หรือเบอร์โทร…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TIER_FILTERS.map(f => (
            <button key={f.id} onClick={() => setTier(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 whitespace-nowrap ${
                tier === f.id
                  ? 'signature-gradient text-white shadow-sm'
                  : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Users className="w-10 h-10 mx-auto mb-4 text-[var(--outline)]" />
          <p className="font-headline font-bold text-[var(--on-surface)] mb-1">
            {state.isLoading ? 'กำลังโหลด…' : state.customers.length === 0 ? 'ยังไม่มีลูกค้า' : 'ไม่พบลูกค้าที่ตรงกับเงื่อนไข'}
          </p>
          <p className="text-sm text-[var(--on-surface-variant)]">
            {state.customers.length === 0 ? 'กดปุ่ม "เพิ่มลูกค้า" เพื่อเริ่มต้น' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {filtered.map(({ customer, orders, totalValue, balance, overdueCount, lastOrderDate, oldestOverdue }) => (
            <div key={customer.id} className="card-elevated p-5 flex flex-col">
              {/* หัวการ์ด */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-headline font-extrabold text-lg text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${TIER_COLOR[customer.tier]}, ${TIER_COLOR[customer.tier]}CC)` }}>
                  {customer.name.trim().charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--on-surface)] leading-snug" style={{ overflowWrap: 'anywhere' }}>
                    {customer.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] font-mono text-[var(--on-surface-variant)]">{customer.code}</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: TIER_COLOR[customer.tier] }}>
                      <Star className="w-3 h-3" style={{ fill: TIER_COLOR[customer.tier] }} />
                      {TIER_LABEL[customer.tier]}
                    </span>
                  </div>
                </div>
                <button onClick={() => setEditing(customer)} aria-label="แก้ไขข้อมูลลูกค้า"
                  className="p-2 rounded-lg hover:bg-[var(--surface-container-low)] transition-colors flex-shrink-0"
                  style={{ color: 'var(--on-surface-variant)' }}>
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* เงื่อนไขชำระ */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: customer.credit_term_days > 0 ? 'var(--primary-container)' : 'var(--surface-container-high)',
                    color: customer.credit_term_days > 0 ? 'var(--primary)' : 'var(--on-surface-variant)',
                  }}>
                  {creditTermLabelTH(customer.credit_term_days)}
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]">
                  {TYPE_LABEL[customer.customer_type] ?? customer.customer_type}
                </span>
              </div>

              {/* ติดต่อ */}
              <div className="mt-4 space-y-1.5 text-xs text-[var(--on-surface-variant)]">
                {customer.contact && (
                  <p className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    <span style={{ overflowWrap: 'anywhere' }}>{customer.contact}</span>
                  </p>
                )}
                {customer.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
                  </p>
                )}
                {customer.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span style={{ overflowWrap: 'anywhere' }}>{customer.email}</span>
                  </p>
                )}
                {customer.province && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {customer.province}
                  </p>
                )}
              </div>

              {/* ตัวเลขการซื้อ */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--outline-variant)]">
                <div>
                  <p className="text-[11px] text-[var(--on-surface-variant)]">บิล</p>
                  <p className="font-headline font-bold text-sm text-[var(--on-surface)]">{orders.length}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--on-surface-variant)]">ยอดซื้อรวม</p>
                  <p className="font-headline font-bold text-sm text-[var(--on-surface)]">{formatTHB(totalValue)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--on-surface-variant)]">ซื้อล่าสุด</p>
                  <p className="text-xs font-semibold text-[var(--on-surface)]">
                    {lastOrderDate ? formatThaiDate(lastOrderDate, { short: true }) : '—'}
                  </p>
                </div>
              </div>

              {/* ยอดค้าง — ส่วนที่ทำให้หน้านี้มีประโยชน์กับการตามเงิน */}
              {balance > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--outline-variant)] flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-[11px] text-[var(--on-surface-variant)]">ค้างชำระ</p>
                    <p className="font-headline font-extrabold"
                      style={{ color: overdueCount > 0 ? 'var(--error)' : 'var(--primary-dark)' }}>
                      {formatTHB(balance)}
                    </p>
                    {overdueCount > 0 && oldestOverdue && (
                      <p className="text-[11px] font-bold mt-0.5" style={{ color: 'var(--error)' }}>
                        เกินกำหนด {overdueCount} บิล · นานสุด {oldestOverdue.days} วัน
                      </p>
                    )}
                  </div>
                  {oldestOverdue ? (
                    <button onClick={() => setPayingOrder(oldestOverdue.order)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                      <Wallet className="w-3.5 h-3.5" />
                      รับเงิน
                    </button>
                  ) : (
                    <a href="/receivables"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: 'var(--primary-container)', color: 'var(--primary)' }}>
                      <Wallet className="w-3.5 h-3.5" />
                      ดูลูกหนี้
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* แก้ไขลูกค้า — modal เดียวกับตอนเพิ่ม ต่างที่ส่ง customer เข้าไป */}
      <ClientFormModal
        isOpen={editing !== null}
        customer={editing}
        onClose={() => setEditing(null)}
      />

      <PaymentFormModal
        isOpen={payingOrder !== null}
        order={payingOrder}
        onClose={() => setPayingOrder(null)}
      />
    </div>
  );
}
