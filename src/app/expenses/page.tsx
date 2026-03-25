'use client';

import { useState } from 'react';
import { Receipt, Plus, Download, Search, CreditCard, Truck, Package, Zap, Wrench, Building, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

const expenses = [
  { id: 1, date: '2026-03-24', desc: 'China Domestic Freight (PO-2847)',  category: 'logistics', amount: 12000, currency: 'THB', vendor: 'Fast Ship Co.', ref: 'PO-2847' },
  { id: 2, date: '2026-03-23', desc: 'International Shipping (PO-2846)',   category: 'logistics', amount: 85000, currency: 'THB', vendor: 'KERRY Express', ref: 'PO-2846' },
  { id: 3, date: '2026-03-22', desc: 'Warehouse Rental — March 2026',     category: 'facility',  amount: 45000, currency: 'THB', vendor: 'Siam Logistics', ref: '' },
  { id: 4, date: '2026-03-21', desc: 'Electricity Bill — Feb 2026',       category: 'utilities', amount: 12800, currency: 'THB', vendor: 'MEA', ref: '' },
  { id: 5, date: '2026-03-20', desc: 'Office Supplies Restock',            category: 'admin',     amount: 3500,  currency: 'THB', vendor: 'Siam Stationery', ref: '' },
  { id: 6, date: '2026-03-19', desc: 'Equipment Repair — Forklift',         category: 'maintenance', amount: 18500, currency: 'THB', vendor: 'Thai Machinery', ref: '' },
  { id: 7, date: '2026-03-18', desc: 'Staff Salary — March (Batch 1)',     category: 'payroll',   amount: 180000, currency: 'THB', vendor: 'Internal', ref: '' },
  { id: 8, date: '2026-03-17', desc: 'Marketing Campaign — Google Ads',    category: 'marketing', amount: 25000, currency: 'THB', vendor: 'Google Ads', ref: '' },
];

const categories = [
  { id: 'all',         label: 'All',         icon: Receipt,     color: 'var(--on-surface-variant)' },
  { id: 'logistics',   label: 'Logistics',    icon: Truck,       color: '#2563EB' },
  { id: 'facility',    label: 'Facility',     icon: Building,    color: '#7C3AED' },
  { id: 'utilities',   label: 'Utilities',    icon: Zap,         color: '#D97706' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench,      color: '#DC2626' },
  { id: 'payroll',     label: 'Payroll',      icon: CreditCard,  color: '#059669' },
  { id: 'marketing',    label: 'Marketing',    icon: TrendingUp,  color: '#DB2777' },
  { id: 'admin',       label: 'Admin',        icon: Package,     color: '#6B7280' },
];

export default function ExpensesPage() {
  const [search, setSearch]   = useState('');
  const [cat, setCat]         = useState('all');

  const filtered = expenses.filter(e => {
    const match = e.desc.toLowerCase().includes(search.toLowerCase()) || e.vendor.toLowerCase().includes(search.toLowerCase());
    return cat === 'all' ? match : match && e.category === cat;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const catData = categories.filter(c => c.id !== 'all').map(c => ({
    ...c,
    amount: expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0),
  }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Header */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            Financial Tracking
          </div>
          <h1 className="page-header-title">Expenses</h1>
          <p className="page-header-subtitle">March 2026 — ฿{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()} total expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline"><Download className="w-4 h-4" />Export</button>
          <button className="btn-primary"><Plus className="w-4 h-4" />Add Expense</button>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        {catData.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => setCat(cat === c.id ? 'all' : c.id)}
              className={`p-4 rounded-xl border transition-all text-left ${
                cat === c.id
                  ? 'border-transparent shadow-md'
                  : 'border-[var(--outline-variant)] hover:border-[var(--outline)]'
              }`}
              style={cat === c.id ? { background: `linear-gradient(135deg, ${c.color}18, ${c.color}08)` } : {}}>
              <Icon className="w-5 h-5 mb-2" style={{ color: cat === c.id ? c.color : 'var(--on-surface-variant)' }} />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1">{c.label}</p>
              <p className="font-headline font-bold text-sm text-[var(--on-surface)]">
                ฿{(c.amount / 1000).toFixed(0)}K
              </p>
            </button>
          );
        })}
      </div>

      {/* Search + Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
          <input className="input-field-search w-full" placeholder="Search expenses…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="card-surface px-5 py-3 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
            Total ({filtered.length})
          </span>
          <span className="font-headline font-black text-[var(--error)]">
            ฿{total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3 stagger-children">
        {filtered.map(exp => {
          const catInfo = categories.find(c => c.id === exp.category);
          const CatIcon = catInfo?.icon || Receipt;
          return (
            <div key={exp.id} className="card-elevated p-5 flex items-center gap-4 group hover:border-[var(--primary-pale)] transition-all">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${catInfo?.color}15` }}>
                <CatIcon className="w-5 h-5" style={{ color: catInfo?.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{exp.desc}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-[var(--on-surface-variant)]">{exp.vendor}</span>
                  {exp.ref && (
                    <>
                      <span className="text-[var(--outline)]">·</span>
                      <span className="text-xs font-mono text-[var(--primary-dark)]">{exp.ref}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-headline font-bold text-[var(--on-surface)]">
                  ฿{exp.amount.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--on-surface-variant)]">{exp.date}</p>
              </div>
              <button className="p-2 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Receipt className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="empty-state-title">No expenses found</h3>
          <p className="empty-state-desc">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
}
