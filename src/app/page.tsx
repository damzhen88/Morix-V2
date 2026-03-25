'use client';

import Link from 'next/link';
import { Package, TrendingUp, Users, Receipt, Warehouse, ShoppingCart, Plus, ArrowRight, Clock, TrendingDown } from 'lucide-react';
import { formatTHB } from '@/lib/format';

const kpis = [
  { label: 'Total Products',  value: '248',  change: '+12%', icon: Package,      href: '/products', polarity: 'higher_is_better' as const },
  { label: 'Pending Orders',  value: '18',  change: '-5%',  icon: ShoppingCart, href: '/sales',    polarity: 'lower_is_better' as const },
  { label: 'Revenue MTD',     value: '฿3.8M', change: '+23%', icon: TrendingUp,  href: '/sales',    polarity: 'higher_is_better' as const },
  { label: 'Active Clients',   value: '23',  change: '+8%',  icon: Users,       href: '/crm',      polarity: 'higher_is_better' as const },
];

const recentActivity = [
  { type: 'purchase',  title: 'PO #2847 Confirmed',  desc: 'Global Logistics Pro', amount: '฿397,943', time: '2 hours ago', href: '/purchase', trend: 'up' },
  { type: 'sale',     title: 'SALE-1247',           desc: 'AEC Living Co.',         amount: '฿89,400',  time: '5 hours ago', href: '/sales',    trend: 'up' },
  { type: 'inventory',title: 'Stock Alert',          desc: 'HPL Sheet — Low Stock',  quantity: '12 pcs', time: '1 day ago',  href: '/inventory',trend: 'down' },
  { type: 'crm',      title: 'New Client Added',     desc: 'Modern Build Corp.',     amount: 'Gold Tier',time: '1 day ago', href: '/crm',     trend: 'up' },
  { type: 'expense',  title: 'Expense Recorded',    desc: 'China Domestic Freight', amount: '฿12,000', time: '2 days ago', href: '/expenses', trend: 'down' },
];

function getBadgeColor(change: string, polarity: 'higher_is_better' | 'lower_is_better') {
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');
  if (isNegative) {
    return polarity === 'lower_is_better'
      ? 'bg-[var(--success-container)] text-[var(--success)]'
      : 'bg-[var(--error-container)] text-[var(--error)]';
  }
  if (isPositive) {
    return polarity === 'higher_is_better'
      ? 'bg-[var(--success-container)] text-[var(--success)]'
      : 'bg-[var(--error-container)] text-[var(--error)]';
  }
  return 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]';
}

export default function Dashboard() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Page Header */}
      <div className="page-header mb-8">
        <div className="page-header-eyebrow">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
          Executive Briefing
        </div>
        <h1 className="page-header-title">Dashboard Overview</h1>
        <p className="page-header-subtitle">Wednesday, March 25, 2026 — Bangkok, Thailand</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10 stagger-children">
        {kpis.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.href}
              className="kpi-card group cursor-pointer block relative">
              {/* Left border on hover */}
              <span className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4">
                <div className="kpi-icon-wrap">
                  <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${getBadgeColor(stat.change, stat.polarity)}`}>
                  {stat.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <div className="kpi-value">{stat.value}</div>
              <div className="kpi-label">{stat.label}</div>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                View <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-7 card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-[var(--on-surface)]">Recent Activity</h2>
            <Link href="/reports"
              className="text-xs font-bold text-[var(--primary)] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <Link key={i} href={item.href}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: item.type === 'purchase'  ? '#FEF3C7' :
                                       item.type === 'sale'      ? '#DBEAFE' :
                                       item.type === 'inventory' ? '#D1FAE5' :
                                       item.type === 'crm'       ? '#EDE9FE' :
                                                                '#F3F4F6',
                    }}>
                    {item.type === 'purchase'  && <ShoppingCart className="w-5 h-5 text-amber-600" />}
                    {item.type === 'sale'      && <TrendingUp   className="w-5 h-5 text-blue-600" />}
                    {item.type === 'inventory' && <Warehouse    className="w-5 h-5 text-green-600" />}
                    {item.type === 'crm'       && <Users        className="w-5 h-5 text-purple-600" />}
                    {item.type === 'expense'   && <Receipt      className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--on-surface)]">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--on-surface-variant)]">{item.desc}</span>
                      <span className="text-[var(--outline)]">·</span>
                      <Clock className="w-3 h-3 text-[var(--on-surface-variant)]" />
                      <span className="text-xs text-[var(--on-surface-variant)]">{item.time}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-headline font-bold text-sm text-[var(--on-surface)]">
                    {item.amount || item.quantity}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Actions */}
          <div className="card-elevated p-6">
            <h2 className="font-headline font-bold text-[var(--on-surface)] mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Purchase Order', icon: ShoppingCart, href: '/purchase', color: '#2563EB' },
                { label: 'New Sale',      icon: TrendingUp,   href: '/sales',    color: 'var(--primary)' },
                { label: 'Add Product',   icon: Package,      href: '/products', color: '#7C3AED' },
                { label: 'Add Client',    icon: Users,        href: '/crm',      color: '#059669' },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} href={action.href}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-[var(--outline-variant)]
                      hover:border-transparent hover:shadow-md transition-all text-center group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${action.color}18` }}>
                      <Icon className="w-6 h-6" style={{ color: action.color === 'var(--primary)' ? 'var(--primary)' : action.color }} />
                    </div>
                    <span className="text-xs font-bold text-[var(--on-surface)]">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* This Month */}
          <div className="card-surface p-6">
            <h3 className="font-headline font-bold text-sm text-[var(--on-surface)] mb-4">This Month</h3>
            <div className="space-y-3">
              {[
                { label: 'Purchase Orders', value: '24', sub: '+8 vs last month' },
                { label: 'Expenses',        value: '฿423K', sub: 'Logistics: 60%' },
                { label: 'Avg. Delivery',   value: '18 days', sub: 'China → Bangkok' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--on-surface-variant)]">{row.label}</span>
                  <div className="text-right">
                    <p className="font-headline font-bold text-sm text-[var(--on-surface)]">{row.value}</p>
                    <p className="text-[10px] text-[var(--on-surface-variant)]">{row.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
