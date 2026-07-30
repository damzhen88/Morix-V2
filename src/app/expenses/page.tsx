'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/store';
import { useFormModal } from '@/components/ui/FormModalContext';
import { Receipt, Plus, Download, Search, CreditCard, Truck, Package, Zap, Wrench, Building, TrendingUp, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatTHB, formatThaiDate } from '@/lib/format';
import { exportRows } from '@/lib/export-excel';
import { markBackedUp } from '@/lib/local-db';
import { useToast } from '@/components/ui/Toast';
import { getExpenseCategoryLabel } from '@/lib/utils';
import type { ExpenseCategory } from '@/types';

/**
 * หมวดค่าใช้จ่าย — ต้องตรงกับ ExpenseCategory ใน @/types
 * เดิมใช้ id ที่ไม่มีในระบบ (logistics/facility/payroll/admin/maintenance)
 * ตรงกันแค่ 2 จาก 7 ค่า ทำให้กรองแล้วไม่เจอรายการ และบันทึกลงหมวดผิด
 */
const categories: { id: ExpenseCategory; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'transport',      label: 'ค่าขนส่ง',        icon: Truck,      color: '#2563EB' },
  { id: 'warehouse_rent', label: 'ค่าเช่าคลัง',      icon: Building,    color: '#7C3AED' },
  { id: 'utilities',      label: 'ค่าสาธารณูปโภค',  icon: Zap,         color: '#D97706' },
  { id: 'salaries',       label: 'เงินเดือน',       icon: CreditCard,  color: '#059669' },
  { id: 'packer_wages',   label: 'ค่าจ้างแรงงาน',   icon: Wrench,      color: '#DC2626' },
  { id: 'marketing',      label: 'ค่าการตลาด',     icon: TrendingUp,  color: '#DB2777' },
  { id: 'office',         label: 'ค่าสำนักงาน',     icon: Package,     color: '#0891B2' },
  { id: 'miscellaneous',  label: 'อื่นๆ',           icon: Receipt,     color: '#6B7280' },
];

export default function ExpensesPage() {
  const [search, setSearch]   = useState('');
  const [cat, setCat]         = useState('all');
  const { openForm } = useFormModal();
  const { state } = useApp();
  const { toast } = useToast();


  // Load data from store
  useEffect(() => { }, []);

  const filtered = state.expenses.filter((e: any) => {
    const desc = (e.description || e.desc || '').toLowerCase();
    const vendor = (e.vendor || '').toLowerCase();
    const match = desc.includes(search.toLowerCase()) || vendor.includes(search.toLowerCase());
    return cat === 'all' ? match : match && e.category === cat;
  });

  const getAmount = (e: any) => e.amount_thb ?? e.amount ?? 0;
  const getDesc = (e: any) => e.description || e.desc || '';

  const total = filtered.reduce((s, e) => s + getAmount(e), 0);

  const handleExport = () => {
    if (filtered.length === 0) {
      toast('ไม่มีรายการให้ส่งออก', 'info');
      return;
    }
    exportRows(
      filtered.map(e => ({
        'วันที่': e.date,
        'รายละเอียด': getDesc(e),
        'หมวด': getExpenseCategoryLabel(e.category),
        'ผู้ขาย/ผู้รับเงิน': e.vendor ?? '',
        'จำนวนเงิน': getAmount(e),
        'หมายเหตุ': e.notes ?? '',
      })),
      'ค่าใช้จ่าย',
      'morix-expenses'
    );
    markBackedUp();
    toast('ส่งออกไฟล์ Excel แล้ว', 'success');
  };

  const catData = categories.map(c => ({
    ...c,
    amount: filtered.filter(e => e.category === c.id).reduce((s, e) => s + getAmount(e), 0),
  }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Header */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            ติดตามค่าใช้จ่าย
          </div>
          <h1 className="page-header-title">ค่าใช้จ่าย</h1>
          <p className="page-header-subtitle">{filtered.length} รายการ · รวม {formatTHB(total)}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary" style={{ background: "var(--surface-container-high)", color: "var(--on-surface)", boxShadow: "none" }} onClick={handleExport}>
            <Download className="w-4 h-4" />
            ส่งออก Excel
          </button>
          <button className="btn-primary" onClick={() => openForm('expense')}><Plus className="w-4 h-4" />บันทึกค่าใช้จ่าย</button>
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
          <input className="input-field-search w-full" placeholder="ค้นหาค่าใช้จ่าย…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="card-surface px-5 py-3 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
            Total ({filtered.length})
          </span>
          <span className="font-headline font-extrabold text-[var(--error)]">
            ฿{total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Expense List — MOBILE CARD VIEW */}
      <div className="md:hidden mobile-card-list space-y-3 mb-6">
        {filtered.map(exp => {
          const catInfo = categories.find(c => c.id === exp.category);
          const CatIcon = catInfo?.icon || Receipt;
          return (
            <div key={exp.id} className="card-elevated p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${catInfo?.color}15` }}>
                  <CatIcon className="w-5 h-5" style={{ color: catInfo?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--on-surface)]">{getDesc(exp)}</p>
                      <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">{exp.vendor}</p>
                      {exp.notes && (
                        <span className="text-xs text-[var(--on-surface-variant)] mt-0.5 inline-block" style={{ overflowWrap: 'anywhere' }}>{exp.notes}</span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-headline font-bold text-[var(--on-surface)]">
                        ฿{getAmount(exp).toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--on-surface-variant)]">{exp.date}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="badge badge-secondary capitalize text-xs">{catInfo?.label || exp.category}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Mobile total summary */}
        {filtered.length > 0 && (
          <div className="card-surface p-4 flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--on-surface)]">Total ({filtered.length})</span>
            <span className="font-headline font-extrabold text-lg text-[var(--error)]">
              ฿{total.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Expense List — DESKTOP TABLE VIEW */}
      <div className="hidden md:block space-y-3 stagger-children">
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
                <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{getDesc(exp)}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-[var(--on-surface-variant)]">{exp.vendor}</span>
                  {exp.notes && (
                    <>
                      <span className="text-[var(--outline)]">·</span>
                      <span className="text-xs text-[var(--on-surface-variant)]">{exp.notes}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-headline font-bold text-[var(--on-surface)]">
                  ฿{getAmount(exp).toLocaleString()}
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
          <h3 className="empty-state-title">ไม่พบรายการค่าใช้จ่าย</h3>
          <p className="empty-state-desc">ลองเปลี่ยนคำค้นหาหรือหมวดที่เลือก</p>
        </div>
      )}
    </div>
  );
}
