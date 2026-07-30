'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Users, ShoppingCart, TrendingUp, X, ArrowRight, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp, usePaymentsByOrder } from '@/store';
import { formatTHB, formatThaiDate } from '@/lib/format';
import { summarize, toOrderLike, PAYMENT_STATUS_LABEL_TH } from '@/lib/payment';
import { getExpenseCategoryLabel } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ResultType = 'product' | 'customer' | 'order' | 'purchase' | 'expense';

interface Result {
  id: string;
  type: ResultType;
  label: string;
  sub: string;
  href: string;
  /** ข้อความที่ใช้เทียบกับคำค้น (ไม่แสดง) */
  haystack: string;
}

const TYPE_LABEL: Record<ResultType, string> = {
  product: 'สินค้า',
  customer: 'ลูกค้า',
  order: 'บิลขาย',
  purchase: 'ใบสั่งซื้อ',
  expense: 'ค่าใช้จ่าย',
};

const TYPE_ICON: Record<ResultType, LucideIcon> = {
  product: Package,
  customer: Users,
  order: TrendingUp,
  purchase: ShoppingCart,
  expense: Wallet,
};

const TYPE_COLOR: Record<ResultType, string> = {
  product: 'text-[var(--primary)]',
  customer: 'text-purple-600',
  order: 'text-blue-600',
  purchase: 'text-amber-600',
  expense: 'text-slate-600',
};

/** ลำดับการแสดงกลุ่ม — เอาสิ่งที่ค้นบ่อยขึ้นก่อน */
const TYPE_ORDER: ResultType[] = ['order', 'customer', 'product', 'purchase', 'expense'];

const MAX_PER_TYPE = 6;

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { state } = useApp();
  const byOrder = usePaymentsByOrder();

  /**
   * รายการที่ค้นได้ มาจากข้อมูลจริงบนเครื่อง
   * เดิมเป็น array สมมุติ 13 รายการที่ค้นเจอแต่ของปลอมและกดแล้วไปหน้าเปล่า
   */
  const allItems = useMemo<Result[]>(() => {
    const items: Result[] = [];

    for (const o of state.salesOrders) {
      const s = summarize(toOrderLike(o), byOrder.get(o.id) ?? []);
      items.push({
        id: `order-${o.id}`,
        type: 'order',
        label: `${o.order_number} — ${o.customer_name}`,
        sub: `${formatTHB(o.total)} · ${s.balance > 0 ? `ค้าง ${formatTHB(s.balance)}` : PAYMENT_STATUS_LABEL_TH[s.status]}`,
        href: '/sales',
        haystack: `${o.order_number} ${o.customer_name}`,
      });
    }

    for (const c of state.customers) {
      items.push({
        id: `customer-${c.id}`,
        type: 'customer',
        label: c.name,
        sub: [c.code, c.contact, c.phone, c.province].filter(Boolean).join(' · '),
        href: '/crm',
        haystack: `${c.name} ${c.code} ${c.contact ?? ''} ${c.phone ?? ''} ${c.email ?? ''} ${c.province ?? ''}`,
      });
    }

    for (const p of state.products) {
      items.push({
        id: `product-${p.id}`,
        type: 'product',
        label: p.name_th,
        sub: `${p.sku} · ${p.category}${p.price_thb ? ` · ${formatTHB(p.price_thb)}` : ''}`,
        href: '/products',
        haystack: `${p.name_th} ${p.name_en ?? ''} ${p.sku} ${p.category}`,
      });
    }

    for (const po of state.purchaseOrders) {
      items.push({
        id: `purchase-${po.id}`,
        type: 'purchase',
        label: `${po.po_number} — ${po.supplier}`,
        sub: formatTHB(po.total_thb),
        href: '/purchase',
        haystack: `${po.po_number} ${po.supplier}`,
      });
    }

    for (const e of state.expenses) {
      items.push({
        id: `expense-${e.id}`,
        type: 'expense',
        label: e.description,
        sub: `${getExpenseCategoryLabel(e.category)} · ${formatTHB(e.amount_thb)} · ${formatThaiDate(e.date, { short: true })}`,
        href: '/expenses',
        haystack: `${e.description} ${e.vendor ?? ''} ${getExpenseCategoryLabel(e.category)}`,
      });
    }

    return items;
  }, [state.salesOrders, state.customers, state.products, state.purchaseOrders, state.expenses, byOrder]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // ยังไม่พิมพ์: โชว์ตัวอย่างจากแต่ละกลุ่มให้เห็นว่าค้นอะไรได้
      const preview: Result[] = [];
      for (const type of TYPE_ORDER) {
        preview.push(...allItems.filter(i => i.type === type).slice(0, 3));
      }
      return preview;
    }
    return allItems.filter(i => i.haystack.toLowerCase().includes(q));
  }, [query, allItems]);

  useEffect(() => {
    if (isOpen) {
      // หน่วงเล็กน้อยให้ modal render เสร็จก่อน focus ไม่งั้นคีย์บอร์ดบนมือถือไม่ขึ้น
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    setQuery('');
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  // จัดกลุ่มตามประเภท เรียงตาม TYPE_ORDER และจำกัดจำนวนต่อกลุ่ม
  const groups = TYPE_ORDER
    .map(type => ({ type, items: results.filter(r => r.type === type).slice(0, MAX_PER_TYPE) }))
    .filter(g => g.items.length > 0);

  return (
    <div ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[8vh] px-4"
      onClick={e => e.target === overlayRef.current && onClose()}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative w-full max-w-xl bg-[var(--surface-container-lowest)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--outline-variant)] animate-scale-in">
        {/* ช่องค้นหา */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--outline-variant)]">
          <Search className="w-5 h-5 text-[var(--on-surface-variant)] flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-[var(--on-surface)] text-base font-medium placeholder:text-[var(--on-surface-variant)] focus:outline-none"
            placeholder="ค้นหาบิล ลูกค้า สินค้า หรือค่าใช้จ่าย…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} aria-label="ปิด"
            className="p-1.5 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-[var(--on-surface-variant)]" />
          </button>
        </div>

        {/* ผลการค้นหา */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="py-12 text-center px-6">
              <Search className="w-10 h-10 mx-auto mb-3 text-[var(--outline)]" />
              <p className="text-sm text-[var(--on-surface-variant)]" style={{ overflowWrap: 'anywhere' }}>
                {allItems.length === 0
                  ? 'ยังไม่มีข้อมูลในระบบ'
                  : `ไม่พบผลการค้นหา "${query}"`}
              </p>
            </div>
          )}

          {groups.map(({ type, items }) => (
            <div key={type}>
              <div className="px-5 py-2">
                <span className="text-[11px] font-bold tracking-wide text-[var(--on-surface-variant)]">
                  {TYPE_LABEL[type]}
                </span>
              </div>
              {items.map(item => {
                const Icon = TYPE_ICON[item.type];
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-container-low)] transition-colors group text-left"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--surface-container)] flex-shrink-0 ${TYPE_COLOR[item.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--on-surface)]" style={{ overflowWrap: 'anywhere' }}>
                        {item.label}
                      </p>
                      <p className="text-xs text-[var(--on-surface-variant)]" style={{ overflowWrap: 'anywhere' }}>
                        {item.sub}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--outline)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ท้าย modal */}
        <div className="px-5 py-3 border-t border-[var(--outline-variant)] flex items-center justify-between gap-2 text-[11px] text-[var(--on-surface-variant)]">
          <span>{query.trim() ? `พบ ${results.length} รายการ` : `ค้นได้ ${allItems.length} รายการ`}</span>
          {/* คีย์บอร์ดมีเฉพาะบนคอม ซ่อนบนมือถือ */}
          <span className="hidden md:inline">
            กด <kbd className="font-mono bg-[var(--surface-container-high)] px-1.5 py-0.5 rounded">Esc</kbd> เพื่อปิด
          </span>
        </div>
      </div>
    </div>
  );
}
