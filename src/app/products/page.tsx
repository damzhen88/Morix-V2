'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Package, Plus, Search, Grid, List, MoreVertical, Edit, Copy, Archive, Trash2, Eye, X } from 'lucide-react';
import { useFormModal } from '@/components/ui/FormModalContext';
import ProductFormModal from '@/components/ui/ProductFormModal';
import { formatTHB } from '@/lib/format';
import { api, deleteImage } from '@/lib/supabase';
import { useApp } from '@/store';

const CATEGORY_MAP: Record<string, string> = {
  'ASA': 'Wall Panels',
  'WPC': 'Flooring',
  'SPC': 'Surface',
  'ACCESSORIES': 'Accessories',
  'CEILING': 'Ceiling',
};

const CATEGORIES = ['All', 'Wall Panels', 'Flooring', 'Surface', 'Accessories', 'Ceiling'];

function getStatusStyle(qty: number, minStock: number) {
  if (qty === 0) return { bg: 'bg-[var(--surface-container-high)]', text: 'text-[var(--on-surface-variant)]', label: 'Out of Stock' };
  if (qty <= minStock) return { bg: 'bg-[var(--warning-container)]', text: 'text-[var(--warning)]', label: 'Low Stock' };
  return { bg: 'bg-[var(--success-container)]', text: 'text-[var(--success)]', label: 'In Stock' };
}

// Product image placeholder component
function ProductImage({ name, sku, imageUrl }: { name?: string; sku?: string; imageUrl?: string }) {
  if (imageUrl) {
    return <img src={imageUrl} alt={name || sku} className="w-full h-full object-cover" />;
  }
  const initial = (name || sku || 'P').charAt(0).toUpperCase();
  const colors = ['#FEF3C7', '#DBEAFE', '#D1FAE5', '#EDE9FE', '#FCE7F3'];
  const colorIndex = (sku || name || '').charCodeAt(0) % colors.length;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors[colorIndex] }}>
      <span className="font-headline font-black text-2xl text-[var(--on-surface-variant)] opacity-40">{initial}</span>
    </div>
  );
}

export default function ProductsPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid');
  const [openMenu, setOpenMenu]     = useState<string | null>(null);
  const { openForm } = useFormModal();
  const { toast } = useToast();

  const products = state.products;


  // Load data from Supabase on mount
  useEffect(() => {
    dispatch({ type: 'LOAD_ALL' });
  }, [dispatch]);

  // Category counts from real data
  const catCounts: Record<string, number> = { All: products.length };
  CATEGORIES.slice(1).forEach(cat => {
    catCounts[cat] = products.filter(p => {
      const catMapVal = CATEGORY_MAP[p.category];
      return catMapVal === cat;
    }).length;
  });

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      (p.name_th || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const catMapVal = CATEGORY_MAP[p.category];
    const matchCat  = activeCategory === 'All' || catMapVal === activeCategory;
    return matchSearch && matchCat;
  });

  const handleMenuAction = async (action: string, productId: string) => {
    setOpenMenu(null);
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const nameTh = product.name_th || product.sku || 'Unknown';

    switch (action) {
      case 'view':
        alert(`Product: ${product.name_th}\nSKU: ${product.sku}\nPrice: ฿${(product.price_thb || 0).toLocaleString()}\nStock: ${product.min_stock || 0}`);
        break;
      case 'edit':
        openForm('product');
        break;
      case 'duplicate':
        openForm('product');
        break;
      case 'archive':
        try {
          await api.updateProduct(productId, { status: 'inactive' });
          toast('Product archived', 'info');
          dispatch({ type: 'UPDATE_PRODUCT', payload: { ...product, status: 'inactive' } });
        } catch (err: any) { toast('Failed: ' + (err.message || 'Unknown'), 'error'); }
        break;
      case 'delete':
        if (!confirm(`Delete product "${product.name_th}"? This cannot be undone.`)) return;
        try {
          const imgs = (product.images || []) as any[];
          for (const img of imgs) {
            try { if (img.url) await deleteImage(img.url, 'products'); } catch {}
          }
          await api.deleteProduct(productId);
          toast(`"${product.name_th}" deleted`, 'success');
          dispatch({ type: 'DELETE_PRODUCT', payload: productId });
        } catch (err: any) { toast('Failed: ' + (err.message || 'Unknown'), 'error'); }
        break;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* Page Header */}
      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="page-header-eyebrow">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            Product Catalog
          </div>
          <h1 className="page-header-title">Products</h1>
          <p className="page-header-subtitle">
            {filtered.length} of {products.length} items
          </p>
        </div>
        <button className="btn-primary touch-action" onClick={() => openForm('product')}>
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        {/* Live search */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
          <input
            className="input-field-search w-full"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap flex-shrink-0">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 touch-action ${
                activeCategory === cat
                  ? 'signature-gradient text-white shadow-sm'
                  : 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
              }`}>
              {cat}
              {catCounts[cat] > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  activeCategory === cat ? 'bg-white/20 text-white' : 'bg-[var(--surface-container-high)]'
                }`}>
                  {catCounts[cat]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* View toggle — DESKTOP ONLY */}
        <div className="hidden lg:flex items-center gap-1 bg-[var(--surface-container-low)] p-1 rounded-xl flex-shrink-0">
          <button onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[var(--surface-container-lowest)] shadow-sm text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`}>
            <Grid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[var(--surface-container-lowest)] shadow-sm text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MOBILE CARD VIEW (always shown on mobile) ── */}
      {filtered.length > 0 && (
        <div className="lg:hidden mobile-card-list space-y-3 mb-6">
          {filtered.map(product => {
            const statusStyle = getStatusStyle(product.min_stock || 0, product.reorder_point || 5);
            const catLabel = CATEGORY_MAP[product.category] || product.category || '—';
            return (
              <div key={product.id} className="card-elevated p-4 group">
                <div className="flex gap-3">
                  {/* Product image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <ProductImage
                      name={product.name_th}
                      sku={product.sku}
                      imageUrl={((product.images || []) as any[])[0]?.url}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-headline font-semibold text-sm text-[var(--on-surface)] leading-tight truncate">
                          {product.name_th || '—'}
                        </h3>
                        <p className="text-[10px] font-mono text-[var(--on-surface-variant)] mt-0.5">{product.sku || '—'}</p>
                      </div>

                      {/* 3-dot menu — always visible on mobile */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                          className="p-2 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors touch-action"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenu === product.id && (
                          <>
                            <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-10 bg-[var(--surface-container-lowest)] rounded-xl shadow-xl border border-[var(--outline-variant)] py-1 min-w-[160px] z-20 overflow-hidden">
                              {[
                                { icon: Eye,      label: 'View Details', action: 'view' },
                                { icon: Edit,     label: 'Edit Product', action: 'edit' },
                                { icon: Copy,     label: 'Duplicate',   action: 'duplicate' },
                                { icon: Archive,  label: 'Archive',     action: 'archive' },
                                { icon: Trash2,   label: 'Delete',      action: 'delete', danger: true },
                              ].map(item => {
                                const ItemIcon = item.icon;
                                return (
                                  <button key={item.action}
                                    onClick={() => handleMenuAction(item.action, product.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors touch-action ${
                                      (item as any).danger
                                        ? 'text-[var(--error)] hover:bg-[var(--error-container)]'
                                        : 'text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]'
                                    }`}>
                                    <ItemIcon className="w-4 h-4" />
                                    {item.label}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Category + Stock badge */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-[var(--on-surface-variant)]">{catLabel}</span>
                      <span className={`badge ${statusStyle.bg.replace('bg-', 'badge-')}`}>
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Price + Stock qty */}
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <p className="font-headline font-bold text-base text-[var(--on-surface)]">
                          {formatTHB(product.price_thb)}
                        </p>
                        <p className="text-[10px] text-[var(--on-surface-variant)]">per unit</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${statusStyle.text}`}>
                          {product.min_stock || 0}
                        </p>
                        <p className="text-[10px] text-[var(--on-surface-variant)]">{product.unit || 'pcs'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DESKTOP GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 stagger-children">
          {filtered.map(product => {
            const statusStyle = getStatusStyle(product.min_stock || 0, product.reorder_point || 5);
            const catLabel = CATEGORY_MAP[product.category] || product.category || '—';
            return (
              <div key={product.id} className="card-elevated p-5 group relative">
                {/* 3-dot menu */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                    className="p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu === product.id && (
                    <>
                      <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />
                      <div className="absolute right-0 top-8 bg-[var(--surface-container-lowest)] rounded-xl shadow-xl border border-[var(--outline-variant)] py-1 min-w-[160px] z-20 overflow-hidden">
                        {[
                          { icon: Eye,      label: 'View Details',  action: 'view' },
                          { icon: Edit,     label: 'Edit Product',  action: 'edit' },
                          { icon: Copy,     label: 'Duplicate',     action: 'duplicate' },
                          { icon: Archive,  label: 'Archive',       action: 'archive' },
                          { icon: Trash2,   label: 'Delete',        action: 'delete', danger: true },
                        ].map(item => {
                          const ItemIcon = item.icon;
                          return (
                            <button key={item.action}
                              onClick={() => handleMenuAction(item.action, product.id)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                (item as any).danger
                                  ? 'text-[var(--error)] hover:bg-[var(--error-container)]'
                                  : 'text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]'
                              }`}>
                              <ItemIcon className="w-4 h-4" />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Product image */}
                <div className="w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden">
                  <ProductImage
                    name={product.name_th}
                    sku={product.sku}
                    imageUrl={((product.images || []) as any[])[0]?.url}
                  />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div>
                    <h3 className="font-headline font-semibold text-sm text-[var(--on-surface)] leading-tight">
                      {product.name_th || '—'}
                    </h3>
                    <p className="text-[10px] font-mono text-[var(--on-surface-variant)] mt-0.5">{product.sku || '—'}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--on-surface-variant)]">{catLabel}</span>
                    <span className={`badge ${statusStyle.bg.replace('bg-', 'badge-')}`}>
                      {statusStyle.label}
                    </span>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-[var(--outline-variant)]">
                    <div>
                      <span className="text-[10px] text-[var(--on-surface-variant)]">Unit price</span>
                      <p className="font-headline font-bold text-lg text-[var(--on-surface)]">
                        {formatTHB(product.price_thb)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--on-surface-variant)]">
                      {product.min_stock || 0} {product.unit || 'pcs'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DESKTOP LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="hidden lg:block card-elevated overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface-container-low)]">
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Product</th>
                <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Category</th>
                <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Stock</th>
                <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Price</th>
                <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Status</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {filtered.map(product => {
                const statusStyle = getStatusStyle(product.min_stock || 0, product.reorder_point || 5);
                const catLabel = CATEGORY_MAP[product.category] || product.category || '—';
                return (
                  <tr key={product.id} className="hover:bg-[var(--surface-container-low)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden">
                          <ProductImage
                            name={product.name_th}
                            sku={product.sku}
                            imageUrl={((product.images || []) as any[])[0]?.url}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--on-surface)]">{product.name_th || '—'}</p>
                          <p className="text-xs text-[var(--on-surface-variant)] font-mono">{product.sku || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--on-surface-variant)]">{catLabel}</td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-[var(--on-surface)]">
                      {product.min_stock || 0} <span className="text-[var(--on-surface-variant)] font-normal">{product.unit || 'pcs'}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-headline font-bold text-[var(--on-surface)]">
                      {formatTHB(product.price_thb)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`badge ${statusStyle.bg.replace('bg-', 'badge-')}`}>{statusStyle.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {['view', 'edit', 'duplicate', 'archive', 'delete'].map(action => {
                          const icons: Record<string, any> = {
                            view: Eye, edit: Edit, duplicate: Copy, archive: Archive, delete: Trash2
                          };
                          const Icon = icons[action];
                          return (
                            <button key={action}
                              onClick={() => handleMenuAction(action, product.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                action === 'delete'
                                  ? 'text-[var(--error)] hover:bg-[var(--error-container)]'
                                  : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]'
                              }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          </div>
          <h3 className="empty-state-title">No products found</h3>
          <p className="empty-state-desc">
            Try adjusting your search or filter, or add your first product to get started.
          </p>
          <button className="btn-primary touch-action" onClick={() => openForm("product")}>
            <Plus className="w-4 h-4" />
            Add First Product
          </button>
        </div>
      )}
    </div>
  );
}
