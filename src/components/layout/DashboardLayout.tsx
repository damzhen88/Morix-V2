// Dashboard Layout for MORIX CRM v2 - ANTI-SLOP EDITION

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, Warehouse, ShoppingCart, 
  Users, Receipt, TrendingUp, Settings, Menu, X,
  Home, FileText
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard, href: '/' },
  { id: 'products', label: 'สินค้า', icon: Package, href: '/products' },
  { id: 'inventory', label: 'คลังสินค้า', icon: Warehouse, href: '/inventory' },
  { id: 'purchase', label: 'นำเข้า', icon: ShoppingCart, href: '/purchase' },
  { id: 'sales', label: 'ขายสินค้า', icon: Users, href: '/sales' },
  { id: 'crm', label: 'ลูกค้า (CRM)', icon: TrendingUp, href: '/crm' },
  { id: 'expenses', label: 'ค่าใช้จ่าย', icon: Receipt, href: '/expenses' },
  { id: 'reports', label: 'รายงาน', icon: FileText, href: '/reports' },
  { id: 'settings', label: 'ตั้งค่า', icon: Settings, href: '/settings' },
];

const mobileNavItems = [
  { id: 'home', label: 'หน้าหลัก', icon: Home, href: '/' },
  { id: 'products', label: 'สินค้า', icon: Package, href: '/products' },
  { id: 'sales', label: 'ขาย', icon: Users, href: '/sales' },
  { id: 'crm', label: 'CRM', icon: TrendingUp, href: '/crm' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mesh">
      {/* Desktop Sidebar - Asymmetric, floating */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-4 lg:left-4 lg:z-40 lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 h-full bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-float overflow-hidden">
          {/* Logo - distinctive design */}
          <div className="relative px-6 pt-8 pb-6 border-b border-orange-100/50">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 -rotate-3">
                <span className="text-white font-bold text-xl font-[var(--font-display)]">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-[var(--font-display)] tracking-tight">MORIX</h1>
                <p className="text-xs text-orange-600/70 font-medium tracking-widest uppercase">DECORATIVE</p>
              </div>
            </div>
          </div>

          {/* Navigation - with hover effects */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 animate-fade-in-up stagger-${idx + 1} ${
                    isActive 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                      : 'text-gray-600 hover:bg-orange-50/80 hover:text-orange-700'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User - minimal design */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors group">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-semibold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
                <p className="text-xs text-gray-400 truncate">admin@morix.co.th</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-gray-900 font-[var(--font-display)]">MORIX</span>
          </div>

          <div className="w-9" />
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl animate-fade-in-left">
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="font-bold text-gray-900">MORIX</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <nav className="p-3 space-y-1 overflow-y-auto">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all ${
                      isActive 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-80">
        <main className="min-h-screen pb-20 lg:pb-0">
          {/* Spacer for mobile header */}
          <div className="lg:hidden h-14" />
          
          <div className="p-4 lg:p-6 lg:pt-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-30 pb-6">
        <div className="flex items-center justify-around h-14">
          {mobileNavItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
