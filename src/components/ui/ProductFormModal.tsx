'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  X, Package, Tag, Hash, Layers, DollarSign, ToggleLeft,
  Upload, Image, Trash2, Plus, CheckCircle, AlertCircle, GripVertical
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { api, uploadImage, deleteImage } from '@/lib/supabase';

interface ProductImageItem {
  id: string;
  url: string;
  file?: File;
  uploading?: boolean;
  preview?: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'ASA', label: 'ASA Wall Panels' },
  { value: 'WPC', label: 'WPC Flooring / Decking' },
  { value: 'SPC', label: 'SPC Surface' },
  { value: 'ACCESSORIES', label: 'Accessories' },
  { value: 'CEILING', label: 'Ceiling Panels' },
];

const UNITS = [
  { value: 'piece', label: 'Piece (pcs)' },
  { value: 'sqm', label: 'Square Meter (m²)' },
  { value: 'meter', label: 'Meter (m)' },
  { value: 'roll', label: 'Roll' },
  { value: 'box', label: 'Box' },
  { value: 'set', label: 'Set' },
];

const fieldStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface-container-low)',
  border: '1px solid transparent',
  borderRadius: 12,
  padding: '0.75rem 1rem',
  width: '100%',
  fontSize: '0.875rem',
  color: 'var(--on-surface)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.625rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--on-surface-variant)',
  marginBottom: '0.5rem',
};

const groupStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
};

// ── Image Upload Zone ──────────────────────────────────────────
function ImageUploadZone({ images, onChange, onUpload, onRemove, disabled }: {
  images: ProductImageItem[];
  onChange: (imgs: ProductImageItem[]) => void;
  onUpload: (img: ProductImageItem) => void;
  onRemove: (img: ProductImageItem) => void;
  disabled: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach(file => {
      if (!validTypes.includes(file.type)) {
        setError('Only JPEG, PNG, WEBP, GIF allowed');
        return;
      }
      if (file.size > maxSize) {
        setError('Max file size is 5MB');
        return;
      }

      const preview = URL.createObjectURL(file);
      const newImg: ProductImageItem = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: preview,
        file,
        uploading: false,
        preview,
      };

      const updated = [...images, newImg];
      onChange(updated);
      // Auto-upload
      onUpload(newImg);
    });
  }, [images, onChange, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  return (
    <div>
      <label style={labelStyle}>
        <Image style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />
        Product Images
        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 4, color: 'var(--on-surface-variant)' }}>
          ({images.filter(i => !i.uploading).length}/10)
        </span>
      </label>

      {/* Drop Zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : error ? 'var(--error)' : 'var(--outline-variant)'}`,
          borderRadius: 16,
          padding: '1.5rem',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: dragging ? 'rgba(249,115,22,0.05)' : 'var(--surface-container-low)',
          transition: 'all 0.15s',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)'; }}
        onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLDivElement).style.borderColor = error ? 'var(--error)' : 'var(--outline-variant)'; }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={e => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          backgroundColor: 'var(--surface-container-high)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 0.75rem',
        }}>
          <Upload style={{ width: 22, height: 22, color: 'var(--primary)' }} />
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
          {dragging ? 'Drop images here' : 'Click or drag images to upload'}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
          JPEG, PNG, WEBP · Max 5MB per file
        </p>
        {error && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.5rem' }}>
            {error}
          </p>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '0.75rem',
          marginTop: '0.75rem',
        }}>
          {images.map((img, idx) => (
            <div key={img.id} style={{ position: 'relative', aspectRatio: '1' }}>
              {/* Image */}
              <div style={{
                width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden',
                border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                position: 'relative',
              }}>
                <img
                  src={img.url}
                  alt={`Product image ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Primary badge */}
                {idx === 0 && (
                  <div style={{
                    position: 'absolute', bottom: 4, left: 4,
                    backgroundColor: 'var(--primary)',
                    color: 'white', fontSize: '0.5rem', fontWeight: 900,
                    padding: '2px 6px', borderRadius: 9999,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    Primary
                  </div>
                )}

                {/* Uploading overlay */}
                {img.uploading && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  </div>
                )}

                {/* Success overlay */}
                {!img.uploading && img.url.startsWith('http') && !img.file && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 20, height: 20, borderRadius: '50%',
                    backgroundColor: 'var(--success)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckCircle style={{ width: 12, height: 12, color: 'white' }} />
                  </div>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={() => onRemove(img)}
                disabled={disabled}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 24, height: 24, borderRadius: '50%',
                  backgroundColor: 'var(--error)',
                  border: '2px solid var(--surface-container-lowest)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: disabled ? 0.5 : 1,
                  zIndex: 2,
                }}
                onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
              >
                <Trash2 style={{ width: 12, height: 12, color: 'white' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.75rem',
          color: 'var(--on-surface-variant)', marginTop: '0.5rem', textAlign: 'center',
        }}>
          No images — first image becomes primary automatically
        </p>
      )}
    </div>
  );
}

// ── Main Modal ──────────────────────────────────────────
export default function ProductFormModal({ isOpen, onClose }: ProductFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [form, setForm] = useState({
    name: '', sku: '', category: 'ASA', unit: 'piece',
    price: '', cost: '', reorderLevel: '10', minStock: '5',
    status: 'active', description: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Upload a single image to Supabase Storage
  const handleImageUpload = useCallback(async (img: ProductImageItem) => {
    if (!img.file) return;

    // Mark as uploading
    setImages(prev => prev.map(i => i.id === img.id ? { ...i, uploading: true } : i));

    try {
      const publicUrl = await uploadImage(img.file, 'products', 'images');
      if (publicUrl) {
        setImages(prev => prev.map(i =>
          i.id === img.id
            ? { ...i, url: publicUrl, uploading: false, file: undefined }
            : i
        ));
      } else {
        throw new Error('Upload returned no URL');
      }
    } catch (err) {
      setImages(prev => prev.filter(i => i.id !== img.id));
      toast('Image upload failed: ' + (err as Error).message, 'error');
    }
  }, [toast]);

  // Remove an image
  const handleImageRemove = useCallback(async (img: ProductImageItem) => {
    // If it's a server image, delete from storage
    if (img.url.startsWith('http') && !img.file) {
      try {
        await deleteImage(img.url, 'products');
      } catch {
        // Ignore delete errors
      }
    } else if (img.preview) {
      URL.revokeObjectURL(img.preview);
    }
    setImages(prev => prev.filter(i => i.id !== img.id));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast('Product name is required', 'error');
      return;
    }
    if (!form.price) {
      toast('Unit price is required', 'error');
      return;
    }

    setLoading(true);
    try {
      // Collect uploaded image URLs
      const imageUrls = images
        .filter(i => !i.uploading && i.url.startsWith('http'))
        .map(i => ({ url: i.url, is_primary: false }));
      if (imageUrls.length > 0) imageUrls[0].is_primary = true;

      const productData = {
        sku: form.sku || `SKU-${Date.now()}`,
        name_th: form.name,
        category: form.category,
        unit: form.unit,
        price_thb: parseFloat(form.price) || 0,
        cost_thb: parseFloat(form.cost) || 0,
        reorder_point: parseInt(form.reorderLevel) || 10,
        min_stock: parseInt(form.minStock) || 5,
        spec: {},
        images: imageUrls,
        status: form.status === 'active' ? 'active' : 'inactive',
      };

      await api.createProduct(productData);
      toast(`Product "${form.name}" created with ${imageUrls.length} image(s)!`, 'success');

      // Cleanup
      setImages([]);
      setForm({ name: '', sku: '', category: 'ASA', unit: 'piece', price: '', cost: '', reorderLevel: '10', minStock: '5', status: 'active', description: '' });
      onClose();
    } catch (err: any) {
      toast('Failed to create product: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} />

      {/* Modal */}
      <div style={{
        position: 'relative', zIndex: 1,
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 24, width: '100%', maxWidth: 720,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0,
          backgroundColor: 'var(--surface-container-lowest)',
          zIndex: 2, borderRadius: '24px 24px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package style={{ width: 20, height: 20, color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-surface)' }}>Add New Product</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Add to catalog and inventory</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 10, color: 'var(--on-surface-variant)' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Image Upload */}
            <ImageUploadZone
              images={images}
              onChange={setImages}
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              disabled={loading}
            />

            {/* Product Name */}
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input
                style={fieldStyle}
                placeholder="e.g. Aluminum Panel 120x240cm"
                value={form.name} onChange={e => set('name', e.target.value)}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--primary)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
              />
            </div>

            {/* SKU + Category */}
            <div style={groupStyle}>
              <div>
                <label style={labelStyle}>SKU</label>
                <input style={fieldStyle} placeholder="AL-PNL-001"
                  value={form.sku} onChange={e => set('sku', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--primary)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }} />
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <Layers style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* Price + Cost + Unit */}
            <div style={groupStyle}>
              <div>
                <label style={labelStyle}>Unit Price (THB) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>฿</span>
                  <input type="number" step="0.01" style={{ ...fieldStyle, paddingLeft: '2rem' }}
                    placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--primary)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Cost (THB)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>฿</span>
                  <input type="number" step="0.01" style={{ ...fieldStyle, paddingLeft: '2rem' }}
                    placeholder="0.00" value={form.cost} onChange={e => set('cost', e.target.value)}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--primary)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
                    value={form.unit} onChange={e => set('unit', e.target.value)}>
                    {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                  <Layers style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* Stock levels */}
            <div style={groupStyle}>
              <div>
                <label style={labelStyle}>Reorder Level</label>
                <input type="number" style={fieldStyle} placeholder="10"
                  value={form.reorderLevel} onChange={e => set('reorderLevel', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--primary)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }} />
              </div>
              <div>
                <label style={labelStyle}>Minimum Stock</label>
                <input type="number" style={fieldStyle} placeholder="5"
                  value={form.minStock} onChange={e => set('minStock', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--primary)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'transparent'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[['active', 'Active', 'var(--success)'], ['inactive', 'Inactive', 'var(--on-surface-variant)']].map(([s, label, color]) => (
                  <button key={s} type="button"
                    onClick={() => set('status', s as string)}
                    style={{
                      flex: 1, padding: '0.625rem', borderRadius: 12, border: form.status === s ? `2px solid ${color}` : '1.5px solid var(--outline-variant)',
                      backgroundColor: form.status === s ? `${color}15` : 'var(--surface-container-low)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600,
                      transition: 'all 150ms',
                      color: form.status === s ? color : 'var(--on-surface-variant)',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Notes / Description</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 80 }}
                placeholder="Optional notes…"
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '1rem 2rem 1.5rem', display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--outline-variant)' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.875rem', borderRadius: 9999, border: '1.5px solid var(--outline)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{
                flex: 2, padding: '0.875rem', borderRadius: 9999, border: 'none',
                background: loading ? 'var(--surface-container-high)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(249,115,22,0.3)',
                transition: 'all 150ms',
              }}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} />
                  Saving…
                </>
              ) : (
                <>
                  <Plus style={{ width: 16, height: 16 }} />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
