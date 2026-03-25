'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  Users, Receipt, TrendingUp, Settings, Menu, X,
  Home, Plus, LogOut, Search, Bell, ChevronLeft, ChevronRight, FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import SearchModal from '@/components/ui/SearchModal';
import CreateMenu from '@/components/ui/CreateMenu';

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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router  = useRouter();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [collapsed,  setCollapsed]    = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [createOpen, setCreateOpen]   = useState(false);
  const [notifCount, setNotifCount]  = useState(3);

  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    try {
      const s = localStorage.getItem(SIDEBAR_KEY);
      if (s !== null) setCollapsed(JSON.parse(s));
    } catch { /* ignore */ }
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Cmd+K for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

  const cw = collapsed ? 'w-20' : 'w-72';
  const pad = collapsed ? 'lg:pl-20' : 'lg:pl-72';
  const hdr = collapsed ? 'lg:left-20' : 'lg:left-72';

  // ── DESKTOP SIDEBAR ──────────────────────────────
  const sidebarDesktop = (
    <aside
      style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40,
        width: collapsed ? '5rem' : '18rem', transition: 'width 300ms ease',
        backgroundColor: 'var(--surface-container-low)',
        borderRight: '1px solid var(--outline-variant)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
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
        {menuItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
                transition: 'all 150ms',
                color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                backgroundColor: isActive ? 'var(--surface-container-lowest)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                position: 'relative',
                textDecoration: 'none',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 4, height: '2rem', borderRadius: '0 4px 4px 0',
                  backgroundColor: 'var(--primary)',
                }} />
              )}
              <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* FAB */}
      {!collapsed && (
        <div style={{ padding: '0.75rem 0.75rem 0.5rem' }}>
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              width: '100%', padding: '0.875rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white', borderRadius: 9999, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(249,115,22,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            <Plus style={{ width: 20, height: 20 }} />
            Create New
          </button>
        </div>
      )}

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--outline-variant)', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        <button
          onClick={toggleCollapse}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            width: '100%',
          }}
        >
          {collapsed
            ? <ChevronRight style={{ width: 20, height: 20 }} />
            : <><ChevronLeft style={{ width: 20, height: 20 }} /><span>Collapse</span></>
          }
        </button>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--on-surface-variant)', fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            width: '100%',
          }}
        >
          <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  // ── DESKTOP HEADER ─────────────────────────────
  const headerDesktop = (
    <header
      style={{
        position: 'fixed', top: 0, zIndex: 30,
        left: collapsed ? '5rem' : '18rem', right: 0, height: 64,
        transition: 'left 300ms ease',
        display: 'flex', alignItems: 'center',
        padding: '0 1.5rem',
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--outline-variant)',
        gap: '1rem',
      }}
    >
      {/* Search — stretches to fill available space */}
      <button
        onClick={() => setSearchOpen(true)}
        style={{
          flex: 1,
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--surface-container-low)', borderRadius: 9999,
          border: '1px solid var(--outline-variant)', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
          color: 'var(--on-surface-variant)', transition: 'all 150ms', maxWidth: 640,
          margin: '0 auto',
        }}
      >
        <Search style={{ width: 16, height: 16, flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>Search products, clients, orders…</span>
        <kbd style={{
          fontSize: '0.625rem', padding: '0.125rem 0.5rem', borderRadius: 6,
          backgroundColor: 'var(--surface-container-high)',
          fontFamily: 'monospace', flexShrink: 0,
        }}>⌘K</kbd>
      </button>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={() => setNotifCount(0)}
          style={{ position: 'relative', padding: '0.5rem', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--on-surface-variant)' }}
        >
          <Bell style={{ width: 20, height: 20 }} />
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 16, height: 16, borderRadius: '50%',
              backgroundColor: 'var(--error)', color: 'white',
              fontSize: '0.5625rem', fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{notifCount > 9 ? '9+' : notifCount}</span>
          )}
        </button>
        <div style={{ width: 1, height: 24, backgroundColor: 'var(--outline-variant)', margin: '0 0.25rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--primary-dark)' }}>{(user?.email?.[0] || 'A').toUpperCase()}</span>
          </div>
          {!collapsed && (
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--on-surface)' }}>
              {user?.email?.split('@')[0] || 'Admin'}
            </span>
          )}
        </div>
      </div>
    </header>
  );

  // ── MOBILE SIDEBAR ──────────────────────────────
  const sidebarMobile = mobileOpen ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
        onClick={() => setMobileOpen(false)}
      />
      <div style={{
        position: 'absolute', left: 0, top: 0, height: '100%', width: '18rem',
        backgroundColor: 'var(--surface-container-low)',
        padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
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
          <button onClick={() => setMobileOpen(false)} style={{ padding: '0.5rem', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {menuItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.href} onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: 12,
                  color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                  backgroundColor: isActive ? 'var(--surface-container-lowest)' : 'transparent',
                  fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  position: 'relative',
                }}>
                {isActive && <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 4, height: '2rem', borderRadius: '0 4px 4px 0', backgroundColor: 'var(--primary)' }} />}
                <Icon style={{ width: 20, height: 20 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem', borderRadius: 12,
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--error)', fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            borderTop: '1px solid var(--outline-variant)', marginTop: '0.5rem', paddingTop: '1rem',
          }}>
          <LogOut style={{ width: 20, height: 20 }} />
          Logout
        </button>
      </div>
    </div>
  ) : null;

  // ── MOBILE HEADER ───────────────────────────────
  const headerMobile = (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--outline-variant)',
      }}
      className="lg:hidden"
    >
      <button onClick={() => setMobileOpen(true)} style={{ padding: '0.5rem', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <Menu style={{ width: 20, height: 20 }} />
      </button>
      <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>MORIX</span>
      <button onClick={() => setSearchOpen(true)} style={{ padding: '0.5rem', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <Search style={{ width: 20, height: 20 }} />
      </button>
    </header>
  );

  // ── MOBILE BOTTOM NAV ────────────────────────────
  const mobileNav = (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 80, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 1rem',
        backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--outline-variant)',
      }}
      className="lg:hidden"
    >
      {[
        { label: 'Home',     icon: Home,        href: '/' },
        { label: 'Products', icon: Package,     href: '/products' },
        { label: '',         icon: Plus,         href: '/products', fab: true },
        { label: 'Sales',    icon: TrendingUp,  href: '/sales' },
        { label: 'Suite',    icon: Settings,    href: '/settings' },
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
        return (
          <Link key={i} href={item.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
              textDecoration: 'none',
            }}>
            <Icon style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)' }}>
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">{sidebarDesktop}</div>

      {/* Desktop header */}
      <div className="hidden lg:block" style={{ paddingLeft: collapsed ? '5rem' : '18rem', transition: 'padding-left 300ms ease' }}>
        {headerDesktop}
      </div>

      {/* Mobile header */}
      {headerMobile}

      {/* Mobile sidebar overlay */}
      {sidebarMobile}

      {/* Main content */}
      <div style={{ paddingLeft: collapsed ? '5rem' : '18rem', paddingTop: 64, transition: 'padding-left 300ms ease' }} className="hidden lg:block">
        <main style={{ minHeight: 'calc(100vh - 64px)', paddingBottom: '6rem' }}>
          <div style={{ padding: '2.5rem' }}>{children}</div>
        </main>
      </div>
      <div style={{ paddingTop: 64, paddingBottom: '6rem' }} className="lg:hidden">
        <main style={{ minHeight: 'calc(100vh - 64px - 80px)' }}>
          <div style={{ padding: '1.5rem' }}>{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {mobileNav}

      {/* Global modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CreateMenu  isOpen={createOpen}  onClose={() => setCreateOpen(false)} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
