'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, TrendingUp, Users, ShoppingCart, X, Plus } from 'lucide-react';
import ProductFormModal from './ProductFormModal';
import ClientFormModal from './ClientFormModal';
import SaleFormModal from './SaleFormModal';
import PurchaseOrderFormModal from './PurchaseOrderFormModal';

interface CreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMenu({ isOpen, onClose }: CreateMenuProps) {
  const router = useRouter();

  const handleAction = (href: string) => {
    onClose();
    if (href === '#') {
      // These open modals on their respective pages
      router.push('/products');
    } else {
      router.push(href);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[150]" onClick={onClose} />

      {/* Menu */}
      <div className="fixed bottom-24 right-6 z-[160] animate-fade-in-up">
        <div
          className="bg-[var(--surface-container-lowest)] rounded-2xl shadow-2xl border border-[var(--outline-variant)] p-2 min-w-[240px] overflow-hidden"
          style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 mb-1">
            <span className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">
              Create New
            </span>
            <button onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">
              <X className="w-3.5 h-3.5 text-[var(--on-surface-variant)]" />
            </button>
          </div>

          {/* Items */}
          <div className="space-y-0.5">
            {[
              { label: 'New Product',        desc: 'Add to catalog & inventory', icon: Package,      href: '/products',  color: '#F97316' },
              { label: 'New Sale',          desc: 'Record a customer sale',     icon: TrendingUp,  href: '/sales',     color: '#2563EB' },
              { label: 'New Client',        desc: 'Add a business partner',     icon: Users,       href: '/crm',        color: '#7C3AED' },
              { label: 'New Purchase Order',desc: 'Procure import products',    icon: ShoppingCart,href: '/purchase',  color: '#D97706' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleAction(item.href)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors group text-left"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${item.color}18` }}>
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--on-surface)]">{item.label}</p>
                    <p className="text-xs text-[var(--on-surface-variant)]">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
