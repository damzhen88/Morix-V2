'use client';

import { useMemo, useState } from 'react';
import { useApp, usePaymentsByOrder, useReceivables } from '@/store';
import PaymentFormModal from '@/components/ui/PaymentFormModal';
import {
  Wallet, AlertTriangle, FileText, Users, Download, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { formatTHB, formatThaiDate } from '@/lib/format';
import { exportSheets } from '@/lib/export-excel';
import { markBackedUp } from '@/lib/local-db';
import { useToast } from '@/components/ui/Toast';
import {
  AGING_BUCKET_LABEL_TH, AGING_BUCKET_ORDER, creditTermLabelTH,
  type AgingBucket,
} from '@/lib/payment';
import type { SalesOrder } from '@/types';

/** สีของแต่ละช่วงอายุหนี้ — ยิ่งค้างนานยิ่งแดง */
const BUCKET_COLOR: Record<AgingBucket, string> = {
  current: 'var(--on-surface-variant)',
  d0_30: 'var(--warning)',
  d31_60: '#EA580C',
  d60_plus: 'var(--error)',
};

export default function ReceivablesPage() {
  const { state } = useApp();
  const report = useReceivables();
  const byOrder = usePaymentsByOrder();
  const { toast } = useToast();
  const [payingOrder, setPayingOrder] = useState<SalesOrder | null>(null);

  /** map กลับไปหาบิลเต็ม เพราะรายงานเก็บแค่รูปย่อ */
  const orderById = useMemo(
    () => new Map(state.salesOrders.map(o => [o.id, o])),
    [state.salesOrders]
  );

  const overdueRows = report.outstanding.filter(r => r.summary.overdue);

  const kpis = [
    {
      label: 'ยอดค้างรับรวม',
      value: formatTHB(report.totals.total),
      sub: `${report.totals.orderCount} บิล`,
      icon: Wallet,
    },
    {
      label: 'เกินกำหนดชำระ',
      value: formatTHB(
        AGING_BUCKET_ORDER.filter(b => b !== 'current').reduce((s, b) => s + report.totals[b], 0)
      ),
      sub: `${overdueRows.length} บิล`,
      icon: AlertTriangle,
      alert: overdueRows.length > 0,
    },
    {
      label: 'ยังไม่ครบกำหนด',
      value: formatTHB(report.totals.current),
      sub: `${report.outstanding.length - overdueRows.length} บิล`,
      icon: FileText,
    },
    {
      label: 'ลูกค้าค้างชำระ',
      value: report.rows.length.toString(),
      sub: 'ราย',
      icon: Users,
    },
  ];

  const handleExport = () => {
    if (report.outstanding.length === 0) {
      toast('ไม่มีลูกหนี้ค้างชำระให้ส่งออก', 'info');
      return;
    }

    exportSheets(
      [
        {
          name: 'อายุหนี้ตามลูกค้า',
          rows: [
            ...report.rows.map(r => ({
              'ลูกค้า': r.customerName,
              'จำนวนบิล': r.orderCount,
              'ยังไม่ครบกำหนด': r.current,
              'ค้าง 1-30 วัน': r.d0_30,
              'ค้าง 31-60 วัน': r.d31_60,
              'ค้างเกิน 60 วัน': r.d60_plus,
              'รวมค้างชำระ': r.total,
            })),
            {
              'ลูกค้า': 'รวมทั้งหมด',
              'จำนวนบิล': report.totals.orderCount,
              'ยังไม่ครบกำหนด': report.totals.current,
              'ค้าง 1-30 วัน': report.totals.d0_30,
              'ค้าง 31-60 วัน': report.totals.d31_60,
              'ค้างเกิน 60 วัน': report.totals.d60_plus,
              'รวมค้างชำระ': report.totals.total,
            },
          ],
        },
        {
          name: 'บิลค้างชำระ',
          rows: report.outstanding.map(({ order, summary }) => {
            const full = orderById.get(order.id);
            return {
              'เลขที่บิล': full?.order_number ?? '',
              'ลูกค้า': full?.customer_name ?? '',
              'วันที่เปิดบิล': order.order_date,
              'เงื่อนไข': creditTermLabelTH(order.credit_term_days ?? 0),
              'ครบกำหนด': summary.dueDate ?? '',
              'ยอดบิล': order.total,
              'ชำระแล้ว': summary.paid,
              'คงเหลือ': summary.balance,
              'เกินกำหนด (วัน)': summary.daysOverdue || '',
              'ช่วงอายุหนี้': AGING_BUCKET_LABEL_TH[summary.bucket],
              'รับเงินครั้งล่าสุด': summary.lastPaidAt ?? '',
            };
          }),
        },
      ],
      'morix-receivables'
    );

    markBackedUp();
    toast('ส่งออกรายงานลูกหนี้แล้ว', 'success');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* หัวหน้า */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            ลูกหนี้การค้า
          </div>
          <h1 className="page-header-title">ลูกหนี้</h1>
          <p className="page-header-subtitle">
            บิลที่ยังเก็บเงินไม่ครบ แยกตามอายุหนี้
          </p>
        </div>
        <button className="btn-primary" onClick={handleExport}
          style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface)', boxShadow: 'none' }}>
          <Download className="w-4 h-4" />
          ส่งออก Excel
        </button>
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

      {report.outstanding.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--success)' }} />
          <p className="font-headline font-bold text-lg text-[var(--on-surface)] mb-1">
            {state.isLoading ? 'กำลังโหลด…' : 'เก็บเงินครบทุกบิล'}
          </p>
          <p className="text-sm text-[var(--on-surface-variant)]">
            ไม่มีลูกหนี้ค้างชำระในระบบ
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── บิลเกินกำหนด ── */}
          {overdueRows.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--error)' }} />
                <h2 className="font-headline font-bold text-[var(--on-surface)]">
                  บิลเกินกำหนดชำระ ({overdueRows.length})
                </h2>
              </div>

              <div className="space-y-3">
                {overdueRows.map(({ order, summary }) => {
                  const full = orderById.get(order.id);
                  if (!full) return null;
                  return (
                    <div key={order.id} className="card-elevated p-4 border-l-4" style={{ borderLeftColor: BUCKET_COLOR[summary.bucket] }}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-mono font-bold text-[var(--primary-dark)]">
                              {full.order_number}
                            </span>
                            <span className="badge badge-error whitespace-nowrap">
                              เกินกำหนด {summary.daysOverdue} วัน
                            </span>
                          </div>
                          <p className="font-semibold text-[var(--on-surface)] mt-1" style={{ overflowWrap: 'anywhere' }}>
                            {full.customer_name}
                          </p>
                          <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                            {creditTermLabelTH(order.credit_term_days ?? 0)}
                            {summary.dueDate && ` · ครบกำหนด ${formatThaiDate(summary.dueDate, { short: true })}`}
                            {summary.lastPaidAt && ` · รับเงินล่าสุด ${formatThaiDate(summary.lastPaidAt, { short: true })}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="text-right">
                            <p className="text-[11px] text-[var(--on-surface-variant)]">คงเหลือ</p>
                            <p className="font-headline font-extrabold text-lg" style={{ color: 'var(--error)' }}>
                              {formatTHB(summary.balance)}
                            </p>
                            <p className="text-[11px] text-[var(--on-surface-variant)]">
                              จาก {formatTHB(order.total)}
                            </p>
                          </div>
                          <button onClick={() => setPayingOrder(full)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                            <Wallet className="w-3.5 h-3.5" />
                            รับเงิน
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── ตารางอายุหนี้ ── */}
          <section>
            <h2 className="font-headline font-bold text-[var(--on-surface)] mb-4">สรุปอายุหนี้ตามลูกค้า</h2>

            {/* การ์ดบนมือถือ */}
            <div className="md:hidden space-y-3">
              {report.rows.map(row => (
                <div key={row.customerId} className="card-elevated p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[var(--on-surface)]" style={{ overflowWrap: 'anywhere' }}>
                      {row.customerName}
                    </p>
                    <div className="text-right flex-shrink-0">
                      <p className="font-headline font-extrabold" style={{ color: 'var(--primary-dark)' }}>
                        {formatTHB(row.total)}
                      </p>
                      <p className="text-[11px] text-[var(--on-surface-variant)]">{row.orderCount} บิล</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[var(--outline-variant)] space-y-1.5">
                    {AGING_BUCKET_ORDER.filter(b => row[b] > 0).map(b => (
                      <div key={b} className="flex items-center justify-between gap-2">
                        <span className="text-xs" style={{ color: BUCKET_COLOR[b] }}>
                          {AGING_BUCKET_LABEL_TH[b]}
                        </span>
                        <span className="text-sm font-bold" style={{ color: BUCKET_COLOR[b] }}>
                          {formatTHB(row[b])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ตารางบน iPad / คอม */}
            <div className="hidden md:block card-elevated overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--surface-container-low)]">
                      <th className="px-4 py-4 text-left text-[11px] font-bold text-[var(--on-surface-variant)] whitespace-nowrap">ลูกค้า</th>
                      <th className="px-4 py-4 text-center text-[11px] font-bold text-[var(--on-surface-variant)] whitespace-nowrap">บิล</th>
                      {AGING_BUCKET_ORDER.map(b => (
                        <th key={b} className="px-4 py-4 text-right text-[11px] font-bold whitespace-nowrap" style={{ color: BUCKET_COLOR[b] }}>
                          {AGING_BUCKET_LABEL_TH[b]}
                        </th>
                      ))}
                      <th className="px-4 py-4 text-right text-[11px] font-bold text-[var(--on-surface-variant)] whitespace-nowrap">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--outline-variant)]">
                    {report.rows.map(row => (
                      <tr key={row.customerId} className="hover:bg-[var(--surface-container-low)] transition-colors">
                        <td className="px-4 py-4 text-sm font-semibold text-[var(--on-surface)]" style={{ overflowWrap: 'anywhere', minWidth: '10rem' }}>
                          {row.customerName}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-[var(--on-surface-variant)]">{row.orderCount}</td>
                        {AGING_BUCKET_ORDER.map(b => (
                          <td key={b} className="px-4 py-4 text-right text-sm whitespace-nowrap"
                            style={{ color: row[b] > 0 ? BUCKET_COLOR[b] : 'var(--outline)', fontWeight: row[b] > 0 ? 600 : 400 }}>
                            {row[b] > 0 ? formatTHB(row[b]) : '—'}
                          </td>
                        ))}
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <span className="font-headline font-bold text-sm" style={{ color: 'var(--primary-dark)' }}>
                            {formatTHB(row.total)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[var(--surface-container-low)]">
                      <td className="px-4 py-4 text-sm font-bold text-[var(--on-surface)]">รวมทั้งหมด</td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-[var(--on-surface)]">{report.totals.orderCount}</td>
                      {AGING_BUCKET_ORDER.map(b => (
                        <td key={b} className="px-4 py-4 text-right font-headline font-bold text-sm whitespace-nowrap" style={{ color: BUCKET_COLOR[b] }}>
                          {report.totals[b] > 0 ? formatTHB(report.totals[b]) : '—'}
                        </td>
                      ))}
                      <td className="px-4 py-4 text-right font-headline font-extrabold whitespace-nowrap" style={{ color: 'var(--primary-dark)' }}>
                        {formatTHB(report.totals.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>

          {/* ── บิลค้างที่ยังไม่ครบกำหนด ── */}
          {report.outstanding.length > overdueRows.length && (
            <section>
              <h2 className="font-headline font-bold text-[var(--on-surface)] mb-4">
                บิลค้างที่ยังไม่ครบกำหนด ({report.outstanding.length - overdueRows.length})
              </h2>
              <div className="space-y-3">
                {report.outstanding.filter(r => !r.summary.overdue).map(({ order, summary }) => {
                  const full = orderById.get(order.id);
                  if (!full) return null;
                  return (
                    <div key={order.id} className="card-surface p-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-mono font-bold text-[var(--primary-dark)]">{full.order_number}</span>
                          <span className="text-xs text-[var(--on-surface-variant)]">
                            {summary.dueDate
                              ? `ครบกำหนด ${formatThaiDate(summary.dueDate, { short: true })}`
                              : 'เงินสด'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[var(--on-surface)] mt-0.5" style={{ overflowWrap: 'anywhere' }}>
                          {full.customer_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[11px] text-[var(--on-surface-variant)]">คงเหลือ</p>
                          <p className="font-headline font-bold" style={{ color: 'var(--primary-dark)' }}>
                            {formatTHB(summary.balance)}
                          </p>
                        </div>
                        <button onClick={() => setPayingOrder(full)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: 'var(--primary-container)', color: 'var(--primary)' }}>
                          <Wallet className="w-3.5 h-3.5" />
                          รับเงิน
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <a href="/sales" className="card-surface p-5 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-container-high)] flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[var(--on-surface-variant)]" />
              </div>
              <p className="text-sm font-bold text-[var(--on-surface)]">ดูบิลขายทั้งหมด</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
          </a>
        </div>
      )}

      <PaymentFormModal
        isOpen={payingOrder !== null}
        order={payingOrder}
        onClose={() => setPayingOrder(null)}
      />
    </div>
  );
}
