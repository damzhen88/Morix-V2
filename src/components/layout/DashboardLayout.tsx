// Dashboard Layout for MORIX V2

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  Users, Receipt, TrendingUp, Settings, Menu, X,
  Home, Plus, Search, ChevronLeft, ChevronRight, FileText, Upload, Wallet,

} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SearchModal from '@/components/ui/SearchModal';
import ProductFormModal from '@/components/ui/ProductFormModal';
import ClientFormModal from '@/components/ui/ClientFormModal';
import SaleFormModal from '@/components/ui/SaleFormModal';
import ExpenseFormModal from '@/components/ui/ExpenseFormModal';
import PurchaseOrderFormModal from '@/components/ui/PurchaseOrderFormModal';
import CreateMenu from '@/components/ui/CreateMenu';
import { FormModalProvider, useFormModal } from '@/components/ui/FormModalContext';

const menuItems = [
  { id: 'dashboard',   label: 'ภาพรวม',        icon: LayoutDashboard, href: '/' },
  { id: 'products',    label: 'สินค้า',         icon: Package,         href: '/products' },
  { id: 'inventory',   label: 'คลังสินค้า',      icon: Warehouse,       href: '/inventory' },
  { id: 'purchase',    label: 'ใบสั่งซื้อ (PO)', icon: ShoppingCart,    href: '/purchase' },
  { id: 'sales',       label: 'ขายสินค้า',      icon: TrendingUp,      href: '/sales' },
  { id: 'receivables', label: 'ลูกหนี้',        icon: Wallet,          href: '/receivables' },
  { id: 'crm',         label: 'ลูกค้า',         icon: Users,           href: '/crm' },
  { id: 'expenses',    label: 'ค่าใช้จ่าย',      icon: Receipt,         href: '/expenses' },
  { id: 'reports',     label: 'รายงาน',        icon: FileText,        href: '/reports' },
  { id: 'settings',    label: 'ตั้งค่า',         icon: Settings,        href: '/settings' },
  { id: 'import',      label: 'นำเข้า Excel',   icon: Upload,          href: '/import' },
];

const SIDEBAR_KEY = 'morix-sidebar-collapsed';

/** แถบเมนูล่างบนมือถือ — union type ทำให้ href มีเฉพาะรายการที่เป็นลิงก์จริง */
type BottomNavItem =
  | { kind: 'link'; label: string; icon: LucideIcon; href: string }
  | { kind: 'fab'; icon: LucideIcon }
  | { kind: 'menu'; label: string; icon: LucideIcon };

const BOTTOM_NAV: BottomNavItem[] = [
  { kind: 'link', label: 'ภาพรวม',   icon: Home,       href: '/' },
  { kind: 'link', label: 'ขายสินค้า', icon: TrendingUp, href: '/sales' },
  { kind: 'fab',                      icon: Plus },
  { kind: 'link', label: 'ลูกหนี้',    icon: Wallet,     href: '/receivables' },
  { kind: 'menu', label: 'เมนู',      icon: Menu },
];

function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeForm, openForm, closeForm } = useFormModal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  /** iPad แนวตั้ง (768-1023px) — กว้างพอสำหรับตาราง แต่ไม่พอถ้า sidebar กางเต็ม 18rem */
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
    const sync = () => setIsTablet(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SIDEBAR_KEY);
      if (s !== null) setCollapsed(JSON.parse(s));
    } catch {}

    // Cmd+K shortcut
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // บน iPad แนวตั้งบังคับย่อ ไม่ว่าผู้ใช้จะเคยกางไว้หรือไม่ (18rem จะเหลือเนื้อหาแค่ 480px)
  const sidebarCollapsed = collapsed || isTablet;
  const sidebarW = sidebarCollapsed ? '5rem' : '18rem';

  // Nav item
  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    // Handle divider
    if ('divider' in item && item.divider) {
      return (
        <div
          key="divider"
          style={{
            height: 1,
            backgroundColor: 'var(--outline-variant)',
            margin: '0.5rem 1rem',
          }}
        />
      );
    }
    const isActive = pathname === (item as typeof menuItems[0]).href;
    const Icon = (item as typeof menuItems[0]).icon;
    return (
      <Link key={item.id as string} href={(item as typeof menuItems[0]).href}
        title={sidebarCollapsed ? (item as typeof menuItems[0]).label : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: sidebarCollapsed ? '0.75rem 0' : '0.75rem 1rem',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '0.875rem',
          transition: 'all 150ms',
          color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
          backgroundColor: isActive ? 'var(--surface-container-lowest)' : 'transparent',
          fontWeight: isActive ? 600 : 500,
          boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
          position: 'relative', textDecoration: 'none',
        }}
      >
        {isActive && (
          <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 4, height: '2rem', borderRadius: '0 4px 4px 0', backgroundColor: 'var(--primary)' }} />
        )}
        <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
        {!sidebarCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(item as typeof menuItems[0]).label}</span>}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)' }}>

      {/* ── DESKTOP SIDEBAR ─────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-40"
        style={{
          width: sidebarW, transition: 'width 300ms ease',
          backgroundColor: 'var(--surface-container-low)',
          borderRight: '1px solid var(--outline-variant)',
        }}
      >
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          padding: sidebarCollapsed ? '1rem 0' : '1.25rem 1.5rem', gap: '0.75rem',
          borderBottom: '1px solid var(--outline-variant)', minHeight: 72,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
          }}>
            <span style={{ color: 'white', fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.125rem' }}>M</span>
          </div>
          {!sidebarCollapsed && (
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--on-surface)', lineHeight: 1 }}>MORIX</p>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>PRO v2</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {menuItems.map(item => <NavItem key={item.id} item={item} />)}
        </nav>

        {/* FAB - REMOVED: Desktop primary action is now ONLY in header (see header section) */}

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--outline-variant)', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <button onClick={toggleCollapse}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: sidebarCollapsed ? '0.75rem 0' : '0.75rem 1rem',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
              color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', width: '100%',
            }}>
            {sidebarCollapsed ? <ChevronRight style={{ width: 20, height: 20 }} /> : <><ChevronLeft style={{ width: 20, height: 20 }} /><span>ย่อเมนู</span></>}
          </button>
        </div>
      </aside>



      {/* ── MOBILE SIDEBAR OVERLAY ──────────── */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%', width: '18rem',
            backgroundColor: 'var(--surface-container-low)', padding: '1.25rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            animation: 'slideInLeft 200ms ease-out',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontFamily: 'var(--font-headline)', fontWeight: 800 }}>M</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--on-surface)' }}>MORIX</p>
                  <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>PRO</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ padding: '0.5rem', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {menuItems.map(item => <NavItem key={item.id} item={item} />)}
            </nav>
          </div>
        </div>
      )}

      {/* ── MOBILE HEADER ────────────────────
          เดิมเว้น paddingTop 64 ไว้ให้ header ที่ไม่มีอยู่จริง จอบนมือถือจึงว่างเปล่า
          และไม่มีทางเข้าถึงการค้นหาเลย (Cmd+K ใช้บนมือถือไม่ได้) */}
      <header className="md:hidden flex items-center justify-between fixed top-0 left-0 right-0 z-30 safe-top"
        style={{
          minHeight: 64, padding: '0 1rem',
          backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--outline-variant)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.9375rem' }}>M</span>
          </div>
          <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
            MORIX
          </span>
        </Link>

        <button onClick={() => setSearchOpen(true)} aria-label="ค้นหา"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 0.875rem', borderRadius: 9999, border: 'none',
            backgroundColor: 'var(--surface-container-low)', cursor: 'pointer',
            color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600,
          }}>
          <Search style={{ width: 16, height: 16 }} />
          ค้นหา
        </button>
      </header>

      {/* ── MAIN CONTENT ─────────────────────── */}
      <div className="hidden md:block" style={{ paddingLeft: sidebarW, transition: 'padding-left 300ms ease' }}>
        <div style={{ minHeight: '100vh' }}>
          <main style={{ padding: '2.5rem', paddingBottom: '6rem' }}>{children}</main>
        </div>
      </div>
      <div className="md:hidden dashboard-main-mobile" style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px))' }}>
        <main style={{ padding: '1.5rem', paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────── */}
      <nav className="md:hidden flex items-center justify-around fixed bottom-0 left-0 right-0 z-30 safe-bottom"
        style={{
          minHeight: 80, padding: '0 1rem',
          backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)',
          borderTop: '1px solid var(--outline-variant)',
        }}
      >
        {BOTTOM_NAV.map((item, i) => {
          const Icon = item.icon;
          const isActive = item.kind === 'link' && pathname === item.href;
          if (item.kind === 'fab') {
            return (
              <button key={i} onClick={() => setCreateOpen(true)}
                style={{ position: 'relative', top: -20, width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 4px 16px rgba(249,115,22,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 24, height: 24, color: 'white' }} />
              </button>
            );
          }
          if (item.kind === 'menu') {
            return (
              <button key={i} onClick={() => setMobileOpen(true)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Menu style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>เมนู</span>
              </button>
            );
          }
          return (
            <Link key={i} href={item.href}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)', textDecoration: 'none' }}>
              <Icon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── GLOBAL MODALS ────────────────────── */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <CreateMenu
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onOpenForm={openForm}
        onNavigate={(path) => { setCreateOpen(false); router.push(path); }}
      />

      {/* Form modals */}
      <ProductFormModal         isOpen={activeForm === 'product'}   onClose={closeForm} />
      <ClientFormModal          isOpen={activeForm === 'client'}    onClose={closeForm} />
      <SaleFormModal           isOpen={activeForm === 'sale'}      onClose={closeForm} />
      <PurchaseOrderFormModal  isOpen={activeForm === 'purchase'}  onClose={closeForm} />
      <ExpenseFormModal       isOpen={activeForm === 'expense'}   onClose={closeForm} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <FormModalProvider>
      <InnerLayout>{children}</InnerLayout>
    </FormModalProvider>
  );
}
