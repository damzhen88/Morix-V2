'use client';

import React from 'react';
import { Package, TrendingUp, Users, ShoppingCart, X, Receipt } from 'lucide-react';

interface CreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenForm: (key: 'product' | 'client' | 'sale' | 'purchase') => void;
  onNavigate: (path: string) => void;
}

const ITEMS = [
  { label: 'New Product',          desc: 'Add to catalog & inventory', icon: Package,      key: 'product'  as const, color: '#F97316' },
  { label: 'New Sale',            desc: 'Record a customer sale',    icon: TrendingUp,  key: 'sale'     as const, color: '#2563EB' },
  { label: 'New Client',          desc: 'Add a business partner',    icon: Users,       key: 'client'   as const, color: '#7C3AED' },
  { label: 'New Purchase Order', desc: 'Procure import products',     icon: ShoppingCart, key: 'purchase' as const, color: '#D97706', navigate: '/purchase/new' as string },
  { label: 'New Expense',        desc: 'Record a business expense',    icon: Receipt,      key: 'expense'  as const, color: '#DC2626' },
];

export default function CreateMenu({ isOpen, onClose, onOpenForm, onNavigate }: CreateMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 150,
          backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)',
        }}
      />

      {/* Menu card */}
      <div
        style={{
          position: 'fixed', zIndex: 160,
          bottom: '6rem', right: '1.5rem',
          maxWidth: 320, width: '100%',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: 20,
            boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
            border: '1px solid var(--outline-variant)',
            width: 280,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--outline-variant)',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--on-surface-variant)',
              }}
            >
              Create New
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '0.25rem', borderRadius: 8,
              }}
            >
              <X style={{ width: 16, height: 16, color: 'var(--on-surface-variant)' }} />
            </button>
          </div>

          {/* Items */}
          <div style={{ padding: '0.5rem' }}>
            {ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => { if (item.navigate) { onNavigate(item.navigate); onClose(); } else { onOpenForm(item.key); } }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: 12,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { const btn = e.currentTarget as HTMLButtonElement; btn.style.backgroundColor = 'var(--surface-container-low)'; }}
                  onMouseLeave={e => { const btn = e.currentTarget as HTMLButtonElement; btn.style.backgroundColor = 'transparent'; }}
                >
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: `${item.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: 20, height: 20, color: item.color }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>
                      {item.label}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                      {item.desc}
                    </p>
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