'use client';

import { useMemo, useState } from 'react';
import { useApp, useKPIs, usePaymentsByOrder } from '@/store';
import { useFormModal } from '@/components/ui/FormModalContext';
import PaymentFormModal from '@/components/ui/PaymentFormModal';
import {
  TrendingUp, Plus, Download, DollarSign, Package, Wallet,
  AlertTriangle, Search, ArrowRight,
} from 'lucide-react';
import { formatTHB, formatThaiDate } from '@/lib/format';
import { exportSheets } from '@/lib/export-excel';
import { markBackedUp } from '@/lib/local-db';
import { useToast } from '@/components/ui/Toast';
import {
  summarize, toOrderLike, PAYMENT_STATUS_LABEL_TH, PAYMENT_METHOD_LABEL_TH,
  paymentSequenceLabelTH, balance,
} from '@/lib/payment';
import { getOrderStatusLabel } from '@/lib/utils';
import type { SalesOrder } from '@/types';

/** ตัวกรองรวมสถานะการชำระกับเกินกำหนดไว้ด้วยกัน เพราะผู้ใช้คิดเป็นเรื่องเดียว */
type Filter = 'all' | 'unpaid' | 'deposit' | 'paid' | 'overdue';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'unpaid', label: 'ยังไม่ชำระ' },
  { id: 'deposit', label: 'ชำระบางส่วน' },
  { id: 'paid', label: 'ชำระครบ' },
  { id: 'overdue', label: 'เกินกำหนด' },
];

export default function SalesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [payingOrder, setPayingOrder] = useState<SalesOrder | null>(null);

  const { openForm } = useFormModal();
  const { state } = useApp();
  const kpi = useKPIs();
  const byOrder = usePaymentsByOrder();
  const { toast } = useToast();

  /** ผูกบิลกับสรุปการชำระไว้ครั้งเดียว ทุกที่ในหน้านี้อ่านจากนี่ */
  const rows = useMemo(
    () =>
      state.salesOrders.map(order => ({
        order,
        summary: summarize(toOrderLike(order), byOrder.get(order.id) ?? []),
      })),
    [state.salesOrders, byOrder]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter(({ order, summary }) => {
      if (q && !order.order_number.toLowerCase().includes(q) && !order.customer_name.toLowerCase().includes(q)) {
        return false;
      }
      if (filter === 'all') return true;
      if (filter === 'overdue') return summary.overdue;
      // ชำระเกินนับรวมกับชำระครบ เพราะผู้ใช้มองว่าปิดยอดแล้วเหมือนกัน
      if (filter === 'paid') return summary.status === 'paid' || summary.status === 'overpaid';
      return summary.status === filter;
    });
  }, [rows, filter, search]);

  const totals = useMemo(
    () => ({
      total: filtered.reduce((s, r) => s + r.order.total, 0),
      paid: filtered.reduce((s, r) => s + r.summary.paid, 0),
      balance: filtered.reduce((s, r) => s + r.summary.balance, 0),
    }),
    [filtered]
  );

  const kpis = [
    { label: 'ยอดขายรวม', value: formatTHB(rows.reduce((s, r) => s + r.order.total, 0)), sub: `${rows.length} บิล`, icon: DollarSign },
    { label: 'เก็บเงินแล้ว', value: formatTHB(rows.reduce((s, r) => s + r.summary.paid, 0)), sub: 'รับเข้าจริง', icon: Wallet },
    { label: 'ยอดค้างรับ', value: formatTHB(kpi.totalOutstanding), sub: `${rows.filter(r => r.summary.balance > 0).length} บิลค้าง`, icon: TrendingUp },
    { label: 'เกินกำหนด', value: rows.filter(r => r.summary.overdue).length.toString(), sub: 'บิล', icon: AlertTriangle, alert: rows.some(r => r.summary.overdue) },
  ];

  const handleExport = () => {
    if (rows.length === 0) {
      toast('ยังไม่มีบิลให้ส่งออก', 'info');
      return;
    }

    exportSheets(
      [
        {
          name: 'บิลขาย',
          rows: rows.map(({ order, summary }) => ({
            'เลขที่บิล': order.order_number,
            'วันที่': order.order_date,
            'ลูกค้า': order.customer_name,
            'สถานะบิล': getOrderStatusLabel(order.status),
            'ยอดบิล': order.total,
            'ชำระแล้ว': summary.paid,
            'คงเหลือ': summary.balance,
            'สถานะชำระ': PAYMENT_STATUS_LABEL_TH[summary.status],
            'เงื่อนไข': order.credit_term_days > 0 ? `เครดิต ${order.credit_term_days} วัน` : 'เงินสด',
            'ครบกำหนด': summary.dueDate ?? '',
            'เกินกำหนด (วัน)': summary.daysOverdue || '',
          })),
        },
        {
          name: 'การรับเงิน',
          rows: state.payments
            .slice()
            .sort((a, b) => b.paid_at.localeCompare(a.paid_at))
            .map(p => {
              const order = state.salesOrders.find(o => o.id === p.sales_order_id);
              const siblings = byOrder.get(p.sales_order_id) ?? [];
              const index = siblings.findIndex(s => (s as typeof p).id === p.id);
              const closes = order ? balance(order.total, siblings.slice(0, index + 1)) <= 0.005 : false;
              return {
                'วันที่รับเงิน': p.paid_at,
                'เลขที่บิล': order?.order_number ?? '',
                'ลูกค้า': order?.customer_name ?? '',
                'ประเภท': paymentSequenceLabelTH(Math.max(0, index), siblings.length, closes),
                'จำนวนเงิน': p.amount_thb,
                'ช่องทาง': PAYMENT_METHOD_LABEL_TH[p.method],
                'เลขอ้างอิง': p.reference_no ?? '',
                'หมายเหตุ': p.note ?? '',
                'มีสลิป': p.has_slip ? 'มี' : '',
              };
            }),
        },
      ],
      'morix_ขายสินค้า'
    );

    markBackedUp();
    toast('ส่งออกไฟล์ Excel แล้ว', 'success');
  };

  const statusBadge = (s: ReturnType<typeof summarize>) => {
    if (s.overdue) return { text: `เกินกำหนด ${s.daysOverdue} วัน`, cls: 'badge-error' };
    if (s.status === 'paid' || s.status === 'overpaid') return { text: PAYMENT_STATUS_LABEL_TH[s.status], cls: 'badge-success' };
    if (s.status === 'deposit') return { text: PAYMENT_STATUS_LABEL_TH.deposit, cls: 'badge-warning' };
    return { text: PAYMENT_STATUS_LABEL_TH.unpaid, cls: 'badge-secondary' };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* หัวหน้า */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            ขายสินค้า
          </div>
          <h1 className="page-header-title">บิลขาย</h1>
          <p className="page-header-subtitle">
            {rows.length} บิล · ค้างรับ {formatTHB(kpi.totalOutstanding)}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="btn-primary" onClick={handleExport}
            style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)', boxShadow: 'none' }}>
            <Download className="w-4 h-4" />
            ส่งออก Excel
          </button>
          <button className="btn-primary" onClick={() => openForm('sale')}>
            <Plus className="w-4 h-4" />
            เปิดบิลใหม่
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="kpi-card">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="kpi-icon-wrap">
                  <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                {k.alert && (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-[var(--error-container)] text-[var(--error)] flex-shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                    ต้องติดตาม
                  </span>
                )}
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
              <div className="mt-1 text-xs text-[var(--on-surface-variant)]">{k.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ค้นหา + ตัวกรอง */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] pointer-events-none" />
          <input
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--surface-container-low)] text-sm outline-none"
            placeholder="ค้นหาเลขที่บิลหรือชื่อลูกค้า…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex-shrink-0 whitespace-nowrap ${
                filter === f.id
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
          <Package className="w-10 h-10 mx-auto mb-4 text-[var(--outline)]" />
          <p className="font-headline font-bold text-[var(--on-surface)] mb-1">
            {state.isLoading ? 'กำลังโหลด…' : rows.length === 0 ? 'ยังไม่มีบิลขาย' : 'ไม่พบบิลที่ตรงกับเงื่อนไข'}
          </p>
          <p className="text-sm text-[var(--on-surface-variant)]">
            {rows.length === 0 ? 'กดปุ่ม "เปิดบิลใหม่" เพื่อเริ่มต้น' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'}
          </p>
        </div>
      ) : (
        <>
          {/* ── การ์ดบนมือถือ ── */}
          <div className="md:hidden space-y-3 mb-6">
            {filtered.map(({ order, summary }) => {
              const badge = statusBadge(summary);
              return (
                <div key={order.id} className="card-elevated p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm font-mono font-bold text-[var(--primary-dark)]">{order.order_number}</span>
                      <p className="font-semibold text-[var(--on-surface)] mt-0.5" style={{ overflowWrap: 'anywhere' }}>
                        {order.customer_name}
                      </p>
                    </div>
                    <span className={`badge ${badge.cls} flex-shrink-0 whitespace-nowrap`}>{badge.text}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--outline-variant)]">
                    {[
                      { label: 'ยอดบิล', value: formatTHB(order.total), color: 'var(--on-surface)' },
                      { label: 'ชำระแล้ว', value: formatTHB(summary.paid), color: 'var(--success)' },
                      { label: 'คงเหลือ', value: formatTHB(summary.balance), color: summary.balance > 0 ? 'var(--primary)' : 'var(--success)' },
                    ].map(c => (
                      <div key={c.label}>
                        <p className="text-[11px] text-[var(--on-surface-variant)]">{c.label}</p>
                        <p className="font-headline font-bold text-sm" style={{ color: c.color }}>{c.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[var(--outline-variant)] flex-wrap">
                    <p className="text-xs text-[var(--on-surface-variant)]">
                      {formatThaiDate(order.order_date, { short: true })}
                      {summary.dueDate && ` · ครบกำหนด ${formatThaiDate(summary.dueDate, { short: true })}`}
                    </p>
                    {summary.balance > 0 && (
                      <button onClick={() => setPayingOrder(order)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                        <Wallet className="w-3.5 h-3.5" />
                        รับเงิน
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="card-surface p-4 flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-[var(--on-surface)]">รวม {filtered.length} บิล</span>
              <div className="text-right">
                <p className="font-headline font-extrabold text-lg" style={{ color: 'var(--primary-dark)' }}>
                  {formatTHB(totals.total)}
                </p>
                <p className="text-xs text-[var(--on-surface-variant)]">ค้างรับ {formatTHB(totals.balance)}</p>
              </div>
            </div>
          </div>

          {/* ── ตารางบน iPad / คอม ── */}
          <div className="hidden md:block card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--surface-container-low)]">
                    {['เลขที่บิล', 'ลูกค้า', 'วันที่', 'ครบกำหนด', 'ยอดบิล', 'ชำระแล้ว', 'คงเหลือ', 'สถานะ', ''].map((h, i) => (
                      <th key={i}
                        className={`px-4 py-4 text-[11px] font-bold tracking-wide text-[var(--on-surface-variant)] whitespace-nowrap ${
                          i >= 4 && i <= 6 ? 'text-right' : i === 7 ? 'text-center' : 'text-left'
                        }`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  {filtered.map(({ order, summary }) => {
                    const badge = statusBadge(summary);
                    return (
                      <tr key={order.id} className="hover:bg-[var(--surface-container-low)] transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-sm font-mono font-semibold text-[var(--primary-dark)] whitespace-nowrap">
                            {order.order_number}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-[var(--on-surface)]" style={{ overflowWrap: 'anywhere', minWidth: '9rem' }}>
                          {order.customer_name}
                        </td>
                        <td className="px-4 py-4 text-sm text-[var(--on-surface-variant)] whitespace-nowrap">
                          {formatThaiDate(order.order_date, { short: true })}
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap"
                          style={{ color: summary.overdue ? 'var(--error)' : 'var(--on-surface-variant)', fontWeight: summary.overdue ? 700 : 400 }}>
                          {summary.dueDate ? formatThaiDate(summary.dueDate, { short: true }) : 'เงินสด'}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-[var(--on-surface)] whitespace-nowrap">
                          {formatTHB(order.total)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm whitespace-nowrap" style={{ color: 'var(--success)' }}>
                          {summary.paid > 0 ? formatTHB(summary.paid) : '—'}
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <span className="font-headline font-bold text-sm"
                            style={{ color: summary.balance > 0 ? 'var(--primary-dark)' : 'var(--success)' }}>
                            {summary.balance > 0 ? formatTHB(summary.balance) : 'ครบ'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`badge ${badge.cls} whitespace-nowrap`}>{badge.text}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {summary.balance > 0 && (
                            <button onClick={() => setPayingOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white whitespace-nowrap"
                              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                              <Wallet className="w-3.5 h-3.5" />
                              รับเงิน
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[var(--surface-container-low)]">
                    <td colSpan={4} className="px-4 py-4 text-sm font-bold text-[var(--on-surface)]">
                      รวม {filtered.length} บิล
                    </td>
                    <td className="px-4 py-4 text-right font-headline font-extrabold text-[var(--on-surface)] whitespace-nowrap">
                      {formatTHB(totals.total)}
                    </td>
                    <td className="px-4 py-4 text-right font-headline font-bold whitespace-nowrap" style={{ color: 'var(--success)' }}>
                      {formatTHB(totals.paid)}
                    </td>
                    <td className="px-4 py-4 text-right font-headline font-extrabold whitespace-nowrap" style={{ color: 'var(--primary-dark)' }}>
                      {formatTHB(totals.balance)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ลิงก์ไปหน้าลูกหนี้ */}
      {kpi.totalOutstanding > 0 && (
        <a href="/receivables"
          className="mt-6 card-surface p-5 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)] flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--on-surface)]">ดูรายงานลูกหนี้แยกอายุหนี้</p>
              <p className="text-xs text-[var(--on-surface-variant)]">
                ค้างรับรวม {formatTHB(kpi.totalOutstanding)}
                {kpi.overdueCount > 0 && ` · เกินกำหนด ${kpi.overdueCount} บิล`}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
        </a>
      )}

      <PaymentFormModal
        isOpen={payingOrder !== null}
        order={payingOrder}
        onClose={() => setPayingOrder(null)}
      />
    </div>
  );
}
