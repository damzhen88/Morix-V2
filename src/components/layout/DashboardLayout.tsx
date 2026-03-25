// Dashboard Layout for MORIX V2

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  Users, Receipt, TrendingUp, Settings, Menu, X,
  Home, Plus, LogOut, Search, Bell, ChevronLeft, ChevronRight, FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import SearchModal from '@/components/ui/SearchModal';
import ProductFormModal from '@/components/ui/ProductFormModal';
import ClientFormModal from '@/components/ui/ClientFormModal';
import SaleFormModal from '@/components/ui/SaleFormModal';
import ExpenseFormModal from '@/components/ui/ExpenseFormModal';
import PurchaseOrderFormModal from '@/components/ui/PurchaseOrderFormModal';
import CreateMenu from '@/components/ui/CreateMenu';
import { FormModalProvider, useFormModal } from '@/components/ui/FormModalContext';

const menuItems = [
  { id: 'dashboard',  label: 'Overview',        icon: LayoutDashboard, href: '/' },
  { id: 'products',   label: 'Products',          icon: Package,        href: '/products' },
  { id: 'inventory',  label: 'Inventory',         icon: Warehouse,     href: '/inventory' },
  { id: 'purchase',   label: 'Purchase Orders', icon: ShoppingCart,   href: '/purchase' },
  { id: 'sales',     label: 'Sales',             icon: TrendingUp,    href: '/sales' },
  { id: 'crm',       label: 'Clients',            icon: Users,         href: '/crm' },
  { id: 'expenses',  label: 'Expenses',          icon: Receipt,      href: '/expenses' },
  { id: 'reports',   label: 'Reports',            icon: FileText,      href: '/reports' },
  { id: 'settings',  label: 'Settings',          icon: Settings,      href: '/settings' },
];

const SIDEBAR_KEY = 'morix-sidebar-collapsed';

function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeForm, openForm, closeForm } = useFormModal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

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

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  if (pathname === '/login') {
    return <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)' }}>{children}</div>;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  const sidebarW = collapsed ? '5rem' : '18rem';

  // Nav item
  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link key={item.id} href={item.href}
        title={collapsed ? item.label : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
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
        {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)' }}>

      {/* ── DESKTOP SIDEBAR ─────────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40"
        style={{
          width: sidebarW, transition: 'width 300ms ease',
          backgroundColor: 'var(--surface-container-low)',
          borderRight: '1px solid var(--outline-variant)',
        }}
      >
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '1rem 0' : '1.25rem 1.5rem', gap: '0.75rem',
          borderBottom: '1px solid var(--outline-variant)', minHeight: 72,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
          }}>
            <span style={{ color: 'white', fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.125rem' }}>M</span>
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--on-surface)', lineHeight: 1 }}>MORIX</p>
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
              padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
              color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', width: '100%',
            }}>
            {collapsed ? <ChevronRight style={{ width: 20, height: 20 }} /> : <><ChevronLeft style={{ width: 20, height: 20 }} /><span>Collapse</span></>}
          </button>
          <button onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
              color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', width: '100%',
            }}>
            <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
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
                  <span style={{ color: 'white', fontFamily: 'var(--font-headline)', fontWeight: 900 }}>M</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.25rem', color: 'var(--on-surface)' }}>MORIX</p>
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
            <button onClick={handleSignOut}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--error)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', borderTop: '1px solid var(--outline-variant)', marginTop: '0.5rem', paddingTop: '1rem' }}>
              <LogOut style={{ width: 20, height: 20 }} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────── */}
      <div className="hidden lg:block" style={{ paddingLeft: sidebarW, transition: 'padding-left 300ms ease' }}>
        <div style={{ minHeight: '100vh' }}>
          <main style={{ padding: '2.5rem', paddingBottom: '6rem' }}>{children}</main>
        </div>
      </div>
      <div className="lg:hidden">
        <main style={{ padding: '1.5rem', paddingBottom: '6rem' }}>{children}</main>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{
          height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 1rem',
          backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)',
          borderTop: '1px solid var(--outline-variant)',
        }}
      >
        {[
          { label: 'Home',     icon: Home,        href: '/' },
          { label: 'Products', icon: Package,     href: '/products' },
          { label: '',         icon: Plus,         fab: true },
          { label: 'Sales',   icon: TrendingUp,  href: '/sales' },
          { label: 'Menu',    icon: Menu,        mobileMenu: true },
        ].map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          if ((item as any).fab) {
            return (
              <button key={i} onClick={() => setCreateOpen(true)}
                style={{ position: 'relative', top: -20, width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 4px 16px rgba(249,115,22,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 24, height: 24, color: 'white' }} />
              </button>
            );
          }
          if ((item as any).mobileMenu) {
            return (
              <button key={i} onClick={() => setMobileOpen(true)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Menu style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu</span>
              </button>
            );
          }
          return (
            <Link key={i} href={item.href}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)', textDecoration: 'none' }}>
              <Icon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
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
