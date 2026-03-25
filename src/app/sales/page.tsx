'use client';

import { useState } from 'react';
import SaleFormModal from '@/components/ui/SaleFormModal';
import { TrendingUp, Plus, Download, Filter, Calendar, DollarSign, Package, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatTHB } from '@/lib/format';

const salesData = [
  { id: 'SALE-1247', client: 'AEC Living Co.',    date: '2026-03-24', items: 3, total: 89400,   status: 'confirmed',  type: 'outbound' },
  { id: 'SALE-1246', client: 'Skyline Interior',  date: '2026-03-23', items: 1, total: 285000,  status: 'pending',    type: 'outbound' },
  { id: 'SALE-1245', client: 'Modern Home Corp.',  date: '2026-03-22', items: 5, total: 142500,  status: 'confirmed',  type: 'outbound' },
  { id: 'SALE-1244', client: 'Urban Build Ltd.',  date: '2026-03-20', items: 2, total: 57600,   status: 'delivered',  type: 'outbound' },
  { id: 'SALE-1243', client: 'Lumpoon Arch.',      date: '2026-03-18', items: 4, total: 315000,  status: 'confirmed',  type: 'outbound' },
];

const kpis = [
  { label: 'Revenue (MTD)',     value: '฿3.8M',    change: '+18.4%', up: true,  icon: DollarSign, polarity: 'higher_is_better' as const },
  { label: 'Orders (MTD)',       value: '47',        change: '+6',     up: true,  icon: Package,    polarity: 'higher_is_better' as const },
  { label: 'Avg. Order Value',   value: '฿80.8K',   change: '+12.2%', up: true,  icon: TrendingUp, polarity: 'higher_is_better' as const },
  { label: 'Active Clients',     value: '23',        change: '-2',     up: false, icon: Users,      polarity: 'higher_is_better' as const },
];

export default function SalesPage() {
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = filter === 'all' ? salesData : salesData.filter(s => s.status === filter);

  const statusBadge = (status: string) => ({
    confirmed:  'badge-success',
    pending:    'badge-warning',
    delivered:  'badge-info',
  }[status] || 'badge-secondary');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Header */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            Sales Pipeline
          </div>
          <h1 className="page-header-title">Sales</h1>
          <p className="page-header-subtitle">March 2026 — ฿3.8M revenue tracked</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            New Sale
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="kpi-card">
              <div className="flex items-start justify-between mb-4">
                <div className="kpi-icon-wrap">
                  <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  kpi.up ? 'bg-[var(--success-container)] text-[var(--success)]' : 'bg-[var(--error-container)] text-[var(--error)]'
                }`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.change}
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Sales Table */}
      <div className="card-elevated overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[var(--outline-variant)]">
          <h2 className="font-headline font-bold text-[var(--on-surface)]">Recent Transactions</h2>
          <div className="flex gap-2">
            {['all', 'confirmed', 'pending', 'delivered'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  filter === f
                    ? 'signature-gradient text-white'
                    : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-[var(--surface-container-low)]">
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Order ID</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Client</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Date</th>
              <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Items</th>
              <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Total</th>
              <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--outline-variant)]">
            {filtered.map(sale => (
              <tr key={sale.id} className="hover:bg-[var(--surface-container-low)] transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-sm font-mono font-semibold text-[var(--primary-dark)]">{sale.id}</span>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-[var(--on-surface)]">{sale.client}</td>
                <td className="px-4 py-4 text-sm text-[var(--on-surface-variant)]">{sale.date}</td>
                <td className="px-4 py-4 text-right text-sm text-[var(--on-surface-variant)]">{sale.items} items</td>
                <td className="px-4 py-4 text-right">
                  <span className="font-headline font-bold text-[var(--on-surface)]">
                    {formatTHB(sale.total)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`badge ${statusBadge(sale.status)} capitalize`}>{sale.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[var(--surface-container-low)]">
              <td colSpan={4} className="px-6 py-4 text-sm font-bold text-[var(--on-surface)]">Total</td>
              <td className="px-4 py-4 text-right">
                <span className="font-headline font-black text-lg" style={{ color: 'var(--primary-dark)' }}>
                  ฿{filtered.reduce((s, r) => s + r.total, 0).toLocaleString('th-TH')}
                </span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
