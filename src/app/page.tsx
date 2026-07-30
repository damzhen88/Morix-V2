'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Package, TrendingUp, Users, Receipt, Warehouse, ShoppingCart,
  ArrowRight, Clock, AlertTriangle, Wallet,
} from 'lucide-react';
import { formatTHB } from '@/lib/format';
import { useApp, useKPIs, usePaymentsByOrder } from '@/store';
import { formatThaiDate, timeAgoTH } from '@/lib/format';
import { balance, paymentSequenceLabelTH } from '@/lib/payment';

type Activity = {
  type: 'sale' | 'payment' | 'expense' | 'purchase';
  title: string;
  desc: string;
  amount: string;
  at: string;
  href: string;
};

export default function Dashboard() {
  const { state } = useApp();
  const kpi = useKPIs();
  const byOrder = usePaymentsByOrder();
  const loading = state.isLoading;

  const kpis = [
    {
      label: 'สินค้าทั้งหมด',
      value: loading ? '…' : state.products.length.toString(),
      sub: 'รายการ',
      icon: Package,
      href: '/products',
    },
    {
      label: 'บิลรอดำเนินการ',
      value: loading ? '…' : kpi.pendingOrders.toString(),
      sub: 'บิล',
      icon: ShoppingCart,
      href: '/sales',
    },
    {
      label: 'ยอดค้างรับ',
      value: loading ? '…' : formatTHB(kpi.totalOutstanding),
      sub: kpi.overdueCount > 0 ? `เกินกำหนด ${kpi.overdueCount} บิล` : 'ไม่มีบิลเกินกำหนด',
      icon: Wallet,
      href: '/receivables',
      alert: kpi.overdueCount > 0,
    },
    {
      label: 'ลูกค้าทั้งหมด',
      value: loading ? '…' : state.customers.length.toString(),
      sub: 'ราย',
      icon: Users,
      href: '/crm',
    },
  ];

  // กิจกรรมล่าสุดจากข้อมูลจริงบนเครื่อง (เดิมเป็นรายการสมมุติที่ hardcode ไว้)
  const recentActivity = useMemo<Activity[]>(() => {
    const items: Activity[] = [];

    for (const order of state.salesOrders) {
      items.push({
        type: 'sale',
        title: order.order_number,
        desc: order.customer_name || 'ไม่ระบุลูกค้า',
        amount: formatTHB(order.total),
        at: order.created_at,
        href: '/sales',
      });
    }

    for (const payment of state.payments) {
      const order = state.salesOrders.find(o => o.id === payment.sales_order_id);
      const siblings = byOrder.get(payment.sales_order_id) ?? [];
      const index = siblings.findIndex(p => p === payment);
      const closes = order ? balance(order.total, siblings.slice(0, index + 1)) <= 0 : false;

      items.push({
        type: 'payment',
        title: `รับเงิน ${order?.order_number ?? ''}`.trim(),
        desc: `${paymentSequenceLabelTH(Math.max(0, index), siblings.length, closes)} · ${order?.customer_name ?? 'ไม่ระบุลูกค้า'}`,
        amount: formatTHB(payment.amount_thb),
        at: payment.created_at,
        href: '/sales',
      });
    }

    for (const expense of state.expenses) {
      items.push({
        type: 'expense',
        title: expense.description,
        desc: expense.vendor || 'ค่าใช้จ่าย',
        amount: formatTHB(expense.amount_thb),
        at: expense.created_at,
        href: '/expenses',
      });
    }

    for (const po of state.purchaseOrders) {
      items.push({
        type: 'purchase',
        title: po.po_number,
        desc: po.supplier || 'ผู้จำหน่าย',
        amount: formatTHB(po.total_thb),
        at: po.created_at,
        href: '/purchase',
      });
    }

    return items
      .filter(i => Boolean(i.at))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 6);
  }, [state.salesOrders, state.payments, state.expenses, state.purchaseOrders, byOrder]);

  // สรุปเดือนนี้จากข้อมูลจริง
  const thisMonth = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const cashIn = state.payments
      .filter(p => p.paid_at.startsWith(prefix))
      .reduce((sum, p) => sum + p.amount_thb, 0);

    const monthExpenses = state.expenses
      .filter(e => (e.date || '').startsWith(prefix))
      .reduce((sum, e) => sum + e.amount_thb, 0);

    const monthOrders = state.salesOrders.filter(o => (o.order_date || '').startsWith(prefix));

    return [
      { label: 'เงินรับเข้าเดือนนี้', value: formatTHB(cashIn), sub: `${state.payments.filter(p => p.paid_at.startsWith(prefix)).length} รายการ` },
      { label: 'บิลที่เปิดเดือนนี้', value: `${monthOrders.length} บิล`, sub: formatTHB(monthOrders.reduce((s, o) => s + o.total, 0)) },
      { label: 'ค่าใช้จ่ายเดือนนี้', value: formatTHB(monthExpenses), sub: `${state.expenses.filter(e => (e.date || '').startsWith(prefix)).length} รายการ` },
    ];
  }, [state.payments, state.expenses, state.salesOrders]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* หัวหน้า */}
      <div className="page-header mb-8">
        <div className="page-header-eyebrow">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
          ภาพรวมธุรกิจ
        </div>
        <h1 className="page-header-title">ภาพรวม</h1>
        <p className="page-header-subtitle">{formatThaiDate(new Date().toISOString(), { weekday: true })}</p>
      </div>

      {/* การ์ด KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10 stagger-children">
        {kpis.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.href} className="kpi-card group cursor-pointer block relative">
              <span className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="kpi-icon-wrap">
                  <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                {stat.alert && (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-[var(--error-container)] text-[var(--error)] flex-shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                    ต้องติดตาม
                  </span>
                )}
              </div>
              <div className="kpi-value">{stat.value}</div>
              <div className="kpi-label">{stat.label}</div>
              <div className="mt-1 text-xs text-[var(--on-surface-variant)]" style={{ overflowWrap: 'anywhere' }}>
                {stat.sub}
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                ดูรายละเอียด <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* กิจกรรมล่าสุด */}
        <div className="lg:col-span-7 card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-[var(--on-surface)]">กิจกรรมล่าสุด</h2>
            <Link href="/reports" className="text-xs font-bold text-[var(--primary)] hover:underline">
              ดูทั้งหมด
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-[var(--on-surface-variant)] py-8 text-center">
              {loading ? 'กำลังโหลด…' : 'ยังไม่มีกิจกรรม'}
            </p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item, i) => (
                <Link key={i} href={item.href}
                  className="flex items-center justify-between gap-3 p-4 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor:
                          item.type === 'purchase' ? '#FEF3C7' :
                          item.type === 'sale'     ? '#DBEAFE' :
                          item.type === 'payment'  ? '#D1FAE5' :
                                                     '#F3F4F6',
                      }}>
                      {item.type === 'purchase' && <ShoppingCart className="w-5 h-5 text-amber-600" />}
                      {item.type === 'sale'     && <TrendingUp className="w-5 h-5 text-blue-600" />}
                      {item.type === 'payment'  && <Wallet className="w-5 h-5 text-green-600" />}
                      {item.type === 'expense'  && <Receipt className="w-5 h-5 text-slate-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--on-surface)]" style={{ overflowWrap: 'anywhere' }}>
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-[var(--on-surface-variant)]" style={{ overflowWrap: 'anywhere' }}>
                          {item.desc}
                        </span>
                        <span className="text-[var(--outline)]">·</span>
                        <Clock className="w-3 h-3 text-[var(--on-surface-variant)] flex-shrink-0" />
                        <span className="text-xs text-[var(--on-surface-variant)] whitespace-nowrap">
                          {timeAgoTH(item.at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="font-headline font-bold text-sm text-[var(--on-surface)] flex-shrink-0 whitespace-nowrap">
                    {item.amount}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* คอลัมน์ขวา */}
        <div className="lg:col-span-5 space-y-4">
          {/* เมนูลัด */}
          <div className="card-elevated p-6">
            <h2 className="font-headline font-bold text-[var(--on-surface)] mb-5">เมนูลัด</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'ลูกหนี้', icon: Wallet, href: '/receivables', color: 'var(--primary)' },
                { label: 'ขายสินค้า', icon: TrendingUp, href: '/sales', color: '#2563EB' },
                { label: 'สินค้า', icon: Package, href: '/products', color: '#7C3AED' },
                { label: 'ลูกค้า', icon: Users, href: '/crm', color: '#059669' },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} href={action.href}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-[var(--outline-variant)]
                      hover:border-transparent hover:shadow-md transition-all text-center group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: action.color === 'var(--primary)' ? 'var(--primary-container)' : `${action.color}18` }}>
                      <Icon className="w-6 h-6" style={{ color: action.color }} />
                    </div>
                    <span className="text-xs font-bold text-[var(--on-surface)]">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* เดือนนี้ */}
          <div className="card-surface p-6">
            <h3 className="font-headline font-bold text-sm text-[var(--on-surface)] mb-4">เดือนนี้</h3>
            <div className="space-y-3">
              {thisMonth.map((row, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--on-surface-variant)]">{row.label}</span>
                  <div className="text-right flex-shrink-0">
                    <p className="font-headline font-bold text-sm text-[var(--on-surface)]">{row.value}</p>
                    <p className="text-[11px] text-[var(--on-surface-variant)]">{row.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* คลังสินค้าใกล้หมด */}
          {kpi.lowStockCount > 0 && (
            <Link href="/inventory" className="card-surface p-6 flex items-center gap-4 hover:shadow-md transition-shadow block">
              <div className="w-10 h-10 rounded-xl bg-[var(--warning-container)] flex items-center justify-center flex-shrink-0">
                <Warehouse className="w-5 h-5" style={{ color: 'var(--warning)' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--on-surface)]">สินค้าใกล้หมด {kpi.lowStockCount} รายการ</p>
                <p className="text-xs text-[var(--on-surface-variant)]">แตะเพื่อดูคลังสินค้า</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
