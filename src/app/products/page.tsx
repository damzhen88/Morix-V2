'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Package, Plus, Search, Grid, List, MoreVertical, Edit, Copy, Archive, Trash2, Eye } from 'lucide-react';
import { useFormModal } from '@/components/ui/FormModalContext';
import ProductFormModal from '@/components/ui/ProductFormModal';
import { formatTHB } from '@/lib/format';
import { api, deleteImage } from '@/lib/supabase';

const CATEGORY_MAP: Record<string, string> = {
  'ASA': 'Wall Panels',
  'WPC': 'Flooring',
  'SPC': 'Surface',
  'ACCESSORIES': 'Accessories',
  'CEILING': 'Ceiling',
};

const CATEGORIES = ['All', 'Wall Panels', 'Flooring', 'Surface', 'Accessories', 'Ceiling'];

function getStatusStyle(product: any) {
  const qty = product.quantity_on_hand || 0;
  if (qty === 0) return { bg: 'bg-[var(--surface-container-high)]', text: 'text-[var(--on-surface-variant)]', label: 'Out of Stock' };
  if (qty <= (product.min_stock || 5)) return { bg: 'bg-[var(--warning-container)]', text: 'text-[var(--warning)]', label: 'Low Stock' };
  return { bg: 'bg-[var(--success-container)]', text: 'text-[var(--success)]', label: 'In Stock' };
}

export default function ProductsPage() {
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid');
  const [openMenu, setOpenMenu]     = useState<number | null>(null);
  const { openForm } = useFormModal();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', sku: '' });
  
  // Category counts
  const catCounts: Record<string, number> = { All: products.length };
  categories.slice(1).forEach(cat => {
    catCounts[cat] = products.filter(p => p.category === cat).length;
  });

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat    = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleMenuAction = async (action: string, productId: string) => {
    setOpenMenu(null);
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const nameTh = product.name_th || product.sku || 'Unknown';
    if (!product) return;

    switch (action) {
      case 'view':
        alert(`Product: ${product.name_th}\nSKU: ${product.sku}\nPrice: ฿${(product.price_thb || 0).toLocaleString()}\nStock: ${product.stock || 0} ${product.unit}`);
        break;
      case 'edit':
        openForm('product');
        break;
      case 'duplicate':
        setForm(f => ({ ...f, name: `${nameTh} (Copy)`, sku: `${product.sku || ''}-COPY` }));
        openForm('product');
        break;
      case 'archive':
        try {
          await api.updateProduct(productId, { status: 'inactive' });
          toast('Product archived', 'info');
          setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'inactive' } : p));
        } catch (err: any) { toast('Failed: ' + (err.message || 'Unknown'), 'error'); }
        break;
      case 'delete':
        if (!confirm(`Delete product "${product.name_th}"? This cannot be undone.`)) return;
        try {
          // Delete images from storage
          for (const img of (product.images || [])) {
            try { await deleteImage(img.url, 'products'); } catch {}
          }
          // Delete product record
          await api.deleteProduct(productId);
          toast(`"${product.name_th}" deleted`, 'success');
          setProducts(prev => prev.filter(p => p.id !== productId));
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
        <button className="btn-primary" onClick={() => openForm('product')}>
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        {/* Live search — full width on mobile, fixed width on desktop */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
          <input
            className="input-field-search w-full"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter with counts */}
        <div className="flex gap-2 flex-wrap flex-shrink-0">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
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

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[var(--surface-container-low)] p-1 rounded-xl flex-shrink-0">
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

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
          {filtered.map(product => {
            const statusStyle = getStatusStyle(product.status);
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
                          { icon: Eye,       label: 'View Details',   action: 'view'      },
                          { icon: Edit,      label: 'Edit Product',   action: 'edit'      },
                          { icon: Copy,      label: 'Duplicate',      action: 'duplicate' },
                          { icon: Archive,   label: 'Archive',        action: 'archive'   },
                          { icon: Trash2,    label: 'Delete',         action: 'delete',   danger: true },
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
                <div className="w-full aspect-[4/3] mb-4">
                  <ProductImage name={product.name_th || product.name} sku={product.sku} imageUrl={product.images?.[0]?.url} />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div>
                    <h3 className="font-headline font-semibold text-sm text-[var(--on-surface)] leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-mono text-[var(--on-surface-variant)] mt-0.5">{product.sku}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--on-surface-variant)]">{product.category}</span>
                    <span className={`badge ${statusStyle.bg.replace('bg-', 'badge-')}`}>
                      {statusStyle.label}
                    </span>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-[var(--outline-variant)]">
                    <div>
                      <span className="text-[10px] text-[var(--on-surface-variant)]">Unit price</span>
                      <p className="font-headline font-bold text-lg text-[var(--on-surface)]">
                        {formatTHB(product.price)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--on-surface-variant)]">
                      {product.stock} {product.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card-elevated overflow-hidden">
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
                const statusStyle = getStatusStyle(product.status);
                return (
                  <tr key={product.id} className="hover:bg-[var(--surface-container-low)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden">
                          <ProductImage name={product.name_th || product.name} sku={product.sku} imageUrl={product.images?.[0]?.url} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--on-surface)]">{product.name}</p>
                          <p className="text-xs text-[var(--on-surface-variant)] font-mono">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--on-surface-variant)]">{product.category}</td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-[var(--on-surface)]">
                      {product.stock} <span className="text-[var(--on-surface-variant)] font-normal">{product.unit}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-headline font-bold text-[var(--on-surface)]">
                      {formatTHB(product.price)}
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
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            Add First Product
          </button>
        </div>
      )}
    </div>
  );
}
