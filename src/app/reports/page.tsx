'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Package, ShoppingCart, Users, ChevronDown } from 'lucide-react';

const periods = ['Today', 'Last 7 Days', 'This Month', 'Last Quarter', 'YTD'];

// Mock monthly data (Jan–Mar 2026)
const monthlyData = [
  { month: 'Jan', revenue: 1120000, orders: 18, clients: 12 },
  { month: 'Feb', revenue: 1480000, orders: 24, clients: 15 },
  { month: 'Mar', revenue: 1830000, orders: 31, clients: 19 },
];

const topProducts = [
  { name: 'HPL Sheet 1220x2440mm', sku: 'HPL-SH-122', sold: 48, revenue: 268800 },
  { name: 'WPC Decking Board',     sku: 'WPC-DK-014', sold: 35, revenue: 147000 },
  { name: 'Composite Cladding',    sku: 'CP-CLD-160', sold: 30, revenue: 55500  },
  { name: 'Aluminum Panel',         sku: 'AL-PNL-001', sold: 25, revenue: 71250  },
];

const kpis = [
  { label: 'Revenue MTD',      value: '฿1.83M', change: '+23.6%', up: true,  icon: DollarSign },
  { label: 'Orders MTD',        value: '31',    change: '+29.2%', up: true,  icon: ShoppingCart },
  { label: 'Avg Order Value',   value: '฿59K',  change: '-4.3%',  up: false, icon: TrendingUp },
  { label: 'New Clients MTD',   value: '7',     change: '+40%',   up: true,  icon: Users },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState('This Month');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Header */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            Business Intelligence
          </div>
          <h1 className="page-header-title">Reports</h1>
          <p className="page-header-subtitle">March 2026 performance snapshot</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="relative">
            <button className="btn-secondary flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {period}
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <button className="btn-primary">
            <Download className="w-4 h-4" />
            Export PDF
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
                  {kpi.change}
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Chart (placeholder) */}
        <div className="lg:col-span-8 card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline font-bold text-[var(--on-surface)]">Revenue Trend</h3>
              <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">Jan – Mar 2026</p>
            </div>
            <BarChart3 className="w-5 h-5 text-[var(--on-surface-variant)]" />
          </div>

          {/* Bar chart visualization */}
          <div className="flex items-end gap-4 h-48">
            {monthlyData.map((m, i) => {
              const max = Math.max(...monthlyData.map(d => d.revenue));
              const heightPct = (m.revenue / max) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[var(--on-surface)] mb-1">
                      ฿{(m.revenue / 1000000).toFixed(1)}M
                    </span>
                    <div
                      className="w-full rounded-t-xl transition-all hover:opacity-80"
                      style={{
                        height: `${heightPct * 1.6}px`,
                        background: i === monthlyData.length - 1
                          ? 'linear-gradient(to top, var(--primary), var(--primary-light))'
                          : 'var(--surface-container-high)',
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--on-surface-variant)]">{m.month}</span>
                </div>
              );
            })}
          </div>

          {/* Metrics below chart */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--outline-variant)]">
            {monthlyData.map(m => (
              <div key={m.month} className="text-center">
                <p className="font-headline font-bold text-[var(--on-surface)]">{m.orders} orders</p>
                <p className="text-xs text-[var(--on-surface-variant)]">{m.clients} clients</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 card-elevated p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-headline font-bold text-[var(--on-surface)]">Top Products</h3>
            <Package className="w-5 h-5 text-[var(--on-surface-variant)]" />
          </div>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.sku}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--primary-container)] text-[10px] font-black text-[var(--primary-dark)] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--on-surface)] leading-tight">{p.name}</p>
                      <p className="text-[10px] font-mono text-[var(--on-surface-variant)]">{p.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-sm text-[var(--on-surface)]">฿{(p.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-[10px] text-[var(--on-surface-variant)]">{p.sold} sold</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-[var(--surface-container)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full signature-gradient"
                    style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%` }}
                  />
                </div>
                {i < topProducts.length - 1 && <div className="divider" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Period Comparison */}
      <div className="mt-6 card-elevated p-6">
        <h3 className="font-headline font-bold text-[var(--on-surface)] mb-5">Month-over-Month Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface-container-low)]">
                {['Metric', 'January', 'February', 'March', 'Growth (Jan→Mar)'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {[
                { metric: 'Revenue', data: ['฿1.12M', '฿1.48M', '฿1.83M', '+63.4%'] },
                { metric: 'Orders',  data: ['18', '24', '31', '+72.2%'] },
                { metric: 'Avg. Order', data: ['฿62.2K', '฿61.7K', '฿59K', '-5.1%'] },
                { metric: 'New Clients', data: ['4', '5', '7', '+75%'] },
              ].map(row => (
                <tr key={row.metric} className="hover:bg-[var(--surface-container-low)] transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--on-surface)]">{row.metric}</td>
                  {row.data.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-3 text-sm font-medium ${
                      ci === row.data.length - 1 ? (cell.startsWith('+') ? 'text-[var(--success)]' : 'text-[var(--error)]') : 'text-[var(--on-surface)]'
                    }`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
