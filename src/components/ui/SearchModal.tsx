'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Users, ShoppingCart, TrendingUp, X, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const allItems = [
  // Products
  { id: 'p1', type: 'product', label: 'Aluminum Panel 120x240cm',   sub: 'Wall Panels',      href: '/products', icon: Package      },
  { id: 'p2', type: 'product', label: 'WPC Decking Board 145x21mm',  sub: 'Flooring',         href: '/products', icon: Package      },
  { id: 'p3', type: 'product', label: 'HPL Sheet 1220x2440mm',       sub: 'Surface',           href: '/products', icon: Package      },
  { id: 'p4', type: 'product', label: 'Composite Cladding 160x12mm', sub: 'Wall Panels',      href: '/products', icon: Package      },
  { id: 'p5', type: 'product', label: 'Aluminum Trim Strip 2.5m',    sub: 'Accessories',       href: '/products', icon: Package      },
  // Clients
  { id: 'c1', type: 'client',  label: 'AEC Living Co., Ltd.',       sub: 'Architectural Firm', href: '/crm',     icon: Users        },
  { id: 'c2', type: 'client',  label: 'Skyline Interior Design',      sub: 'Interior Design',   href: '/crm',     icon: Users        },
  { id: 'c3', type: 'client',  label: 'Modern Home Corporation',      sub: 'Developer',         href: '/crm',     icon: Users        },
  { id: 'c4', type: 'client',  label: 'Urban Build Co.',             sub: 'Contractor',       href: '/crm',     icon: Users        },
  // Orders / Sales
  { id: 's1', type: 'order',   label: 'SALE-1247 — AEC Living Co.',  sub: '฿89,400 · confirmed', href: '/sales', icon: TrendingUp  },
  { id: 's2', type: 'order',   label: 'SALE-1246 — Skyline Interior',sub: '฿285,000 · pending', href: '/sales', icon: TrendingUp  },
  { id: 's3', type: 'order',   label: 'PO-2847 — Global Logistics',  sub: 'Import · Draft',     href: '/purchase',icon: ShoppingCart},
  // Inventory
  { id: 'i1', type: 'inventory',label: 'HPL Sheet — Low Stock (12)',  sub: 'WH-B-01',           href: '/inventory',icon: Package     },
];

const TYPE_LABELS: Record<string, string> = {
  product:   'Product',
  client:    'Client',
  order:     'Order',
  inventory: 'Inventory',
};

const TYPE_COLORS: Record<string, string> = {
  product:   'text-[var(--primary)]',
  client:    'text-purple-600',
  order:     'text-blue-600',
  inventory: 'text-green-600',
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(allItems);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(allItems);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(allItems);
    } else {
      const q = query.toLowerCase();
      setResults(allItems.filter(i =>
        i.label.toLowerCase().includes(q) ||
        i.sub.toLowerCase().includes(q) ||
        TYPE_LABELS[i.type].toLowerCase().includes(q)
      ));
    }
  }, [query]);

  // ESC to close
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

  // Group results by type
  const groups: Record<string, typeof allItems> = {};
  results.forEach(r => {
    if (!groups[r.type]) groups[r.type] = [];
    groups[r.type].push(r);
  });

  return (
    <div ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh]"
      onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl mx-4 bg-[var(--surface-container-lowest)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--outline-variant)] animate-scale-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--outline-variant)]">
          <Search className="w-5 h-5 text-[var(--on-surface-variant)] flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-[var(--on-surface)] text-base font-medium placeholder:text-[var(--on-surface-variant)] focus:outline-none"
            placeholder="Search products, clients, orders…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">
            <X className="w-4 h-4 text-[var(--on-surface-variant)]" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 mx-auto mb-3 text-[var(--outline)]" />
              <p className="text-sm text-[var(--on-surface-variant)]">No results for &quot;{query}&quot;</p>
            </div>
          )}

          {Object.entries(groups).map(([type, items]) => (
            <div key={type}>
              <div className="px-5 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
                  {TYPE_LABELS[type]}s
                </span>
              </div>
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-container-low)] transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--surface-container)] ${TYPE_COLORS[item.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{item.label}</p>
                      <p className="text-xs text-[var(--on-surface-variant)]">{item.sub}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--outline)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-[10px] text-[var(--on-surface-variant)]">
          <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
          <span>Press <kbd className="font-mono bg-[var(--surface-container-high)] px-1.5 py-0.5 rounded">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
