'use client';

import { useState } from 'react';
import { Warehouse, Plus, Search, Package, AlertTriangle, ArrowUpDown, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const inventoryItems = [
  { id: 1, sku: 'AL-PNL-001',   name: 'Aluminum Panel 120x240cm',          stock: 48,  reorder: 20, unit: 'pcs', value: 136800, trend: 'up',   location: 'WH-A-01' },
  { id: 2, sku: 'WPC-DK-014',   name: 'WPC Decking Board 145x21mm',        stock: 120, reorder: 30, unit: 'pcs', value: 504000, trend: 'up',   location: 'WH-A-02' },
  { id: 3, sku: 'HPL-SH-122',   name: 'HPL Sheet 1220x2440mm',             stock: 12,  reorder: 35, unit: 'pcs', value: 67200,  trend: 'down', location: 'WH-B-01' },
  { id: 4, sku: 'AL-TRM-025',   name: 'Aluminum Trim Strip 2.5m',          stock: 200, reorder: 50, unit: 'pcs', value: 76000,  trend: 'up',   location: 'WH-A-03' },
  { id: 5, sku: 'PVC-CL-060',   name: 'PVC Ceiling Panel 60x60cm',         stock: 0,   reorder: 100,unit: 'pcs', value: 0,      trend: 'down', location: 'WH-B-02' },
  { id: 6, sku: 'CP-CLD-160',   name: 'Composite Cladding 160x12mm',       stock: 72,  reorder: 40, unit: 'pcs', value: 133200, trend: 'up',   location: 'WH-A-04' },
  { id: 7, sku: 'SS-FST-M8',    name: 'Stainless Steel Fastener M8',       stock: 8,   reorder: 200,unit: 'box', value: 4800,   trend: 'down', location: 'WH-C-01' },
  { id: 8, sku: 'GL-SEAL-5M',   name: 'Glass Sealant Cartridge 5m',        stock: 55,  reorder: 30, unit: 'pcs', value: 27500,  trend: 'up',   location: 'WH-C-02' },
];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [showLow, setShowLow] = useState(false);

  const filtered = inventoryItems.filter(i => {
    const match = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    return showLow ? match && (i.stock <= i.reorder) : match;
  });

  const totalValue = inventoryItems.reduce((s, i) => s + i.value, 0);
  const lowStock    = inventoryItems.filter(i => i.stock <= i.reorder).length;
  const outOfStock  = inventoryItems.filter(i => i.stock === 0).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Header */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            Warehouse Operations
          </div>
          <h1 className="page-header-title">Inventory</h1>
          <p className="page-header-subtitle">Real-time stock levels across all warehouses</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          Stock Adjustment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {[
          { label: 'Total SKUs',         value: inventoryItems.length.toString(), icon: Package,       color: 'var(--primary)' },
          { label: 'Total Stock Value',  value: `฿${(totalValue / 1000).toFixed(0)}K`, icon: TrendingUp,  color: 'var(--success)' },
          { label: 'Low Stock Items',     value: lowStock.toString(),             icon: AlertTriangle, color: 'var(--warning)' },
          { label: 'Out of Stock',        value: outOfStock.toString(),           icon: AlertTriangle, color: 'var(--error)' },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="kpi-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${k.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: k.color }} />
                </div>
              </div>
              <div className="kpi-value text-xl">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
          <input
            className="input-field-search w-full"
            placeholder="Search SKU or product name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowLow(!showLow)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            showLow
              ? 'signature-gradient text-white shadow-sm'
              : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
          }`}>
          <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
          Low Stock Only ({lowStock})
        </button>
      </div>

      {/* Inventory Table */}
      <div className="card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--surface-container-low)]">
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">SKU</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Product</th>
              <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Location</th>
              <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Stock</th>
              <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Reorder</th>
              <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Status</th>
              <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--outline-variant)]">
            {filtered.map(item => {
              const isLow = item.stock <= item.reorder && item.stock > 0;
              const isOut = item.stock === 0;
              return (
                <tr key={item.id} className="hover:bg-[var(--surface-container-low)] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-semibold text-[var(--primary-dark)]">{item.sku}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-[var(--on-surface)]">{item.name}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-xs font-mono bg-[var(--surface-container)] px-2 py-1 rounded-lg text-[var(--on-surface-variant)]">
                      {item.location}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.trend === 'up'
                        ? <TrendingUp className="w-3.5 h-3.5 text-[var(--success)]" />
                        : item.trend === 'down'
                          ? <TrendingDown className="w-3.5 h-3.5 text-[var(--error)]" />
                          : null}
                      <span className={`font-bold ${isOut ? 'text-[var(--error)]' : isLow ? 'text-[var(--warning)]' : 'text-[var(--on-surface)]'}`}>
                        {item.stock}
                      </span>
                      <span className="text-[var(--on-surface-variant)] text-xs">{item.unit}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-[var(--on-surface-variant)]">
                    {item.reorder} <span className="text-[10px]">{item.unit}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {isOut
                      ? <span className="badge badge-error">Out of Stock</span>
                      : isLow
                        ? <span className="badge badge-warning">Low Stock</span>
                        : <span className="badge badge-success">In Stock</span>
                    }
                  </td>
                  <td className="px-4 py-4 text-right font-headline font-bold text-[var(--on-surface)]">
                    ฿{item.value.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Warehouse className="w-12 h-12 mx-auto mb-4 text-[var(--on-surface-variant)] opacity-30" />
            <p className="text-[var(--on-surface-variant)]">No items match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
