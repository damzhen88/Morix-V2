// Products Page for MORIX CRM v2

'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/store';
import { Card, Button, Input, Select, Badge, Modal, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, EmptyState, PageLoader } from '@/components/ui';
import { formatDate, getCategoryColor, getStatusColor, generateId } from '@/lib/utils';
import { Product, ProductCategory, ProductUnit } from '@/types';
import { Plus, Search, Edit, Trash2, Eye, Upload, X, Image as ImageIcon, Package } from 'lucide-react';

const categoryOptions = [
  { value: 'ASA', label: 'ASA' },
  { value: 'WPC', label: 'WPC' },
  { value: 'SPC', label: 'SPC' },
  { value: 'ACCESSORIES', label: 'อุปกรณ์เสริม' },
];

const unitOptions = [
  { value: 'piece', label: 'ชิ้น' },
  { value: 'box', label: 'กล่อง' },
  { value: 'meter', label: 'เมตร' },
  { value: 'sqm', label: 'ตร.ม.' },
  { value: 'set', label: 'ชุด' },
];

export default function ProductsPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name_th: '',
    name_en: '',
    category: 'ASA' as ProductCategory,
    unit: 'sqm' as ProductUnit,
    spec_size: '',
    spec_thickness: '',
    spec_color: '',
    default_supplier: '',
    reorder_point: 100,
    min_stock: 50,
    status: 'active' as const,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter products
  const filteredProducts = state.products.filter(p => {
    const matchesSearch = !search || 
      p.name_th.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsViewMode(false);
    setFormData({
      sku: `PRD-${Date.now().toString().slice(-6)}`,
      name_th: '',
      name_en: '',
      category: 'ASA',
      unit: 'sqm',
      spec_size: '',
      spec_thickness: '',
      spec_color: '',
      default_supplier: '',
      reorder_point: 100,
      min_stock: 50,
      status: 'active',
    });
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsViewMode(false);
    setFormData({
      sku: product.sku,
      name_th: product.name_th,
      name_en: product.name_en || '',
      category: product.category,
      unit: product.unit,
      spec_size: product.spec?.size || '',
      spec_thickness: product.spec?.thickness || '',
      spec_color: product.spec?.color || '',
      default_supplier: product.default_supplier || '',
      reorder_point: product.reorder_point,
      min_stock: product.min_stock,
      status: product.status as any,
    });
    setImagePreview(product.images[0]?.url || '');
    setIsModalOpen(true);
  };

  const handleView = (product: Product) => {
    setEditingProduct(product);
    setIsViewMode(true);
    setFormData({
      sku: product.sku,
      name_th: product.name_th,
      name_en: product.name_en || '',
      category: product.category,
      unit: product.unit,
      spec_size: product.spec?.size || '',
      spec_thickness: product.spec?.thickness || '',
      spec_color: product.spec?.color || '',
      default_supplier: product.default_supplier || '',
      reorder_point: product.reorder_point,
      min_stock: product.min_stock,
      status: product.status as any,
    });
    setImagePreview(product.images[0]?.url || '');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    
    const productData: Product = {
      id: editingProduct?.id || generateId(),
      sku: formData.sku,
      name_th: formData.name_th,
      name_en: formData.name_en || undefined,
      category: formData.category,
      unit: formData.unit,
      spec: {
        size: formData.spec_size || undefined,
        thickness: formData.spec_thickness || undefined,
        color: formData.spec_color || undefined,
      },
      default_supplier: formData.default_supplier || undefined,
      reorder_point: formData.reorder_point,
      min_stock: formData.min_stock,
      images: editingProduct?.images || [],
      status: formData.status,
      created_at: editingProduct?.created_at || now,
      updated_at: now,
    };

    // Add image if new one uploaded
    if (imagePreview && !editingProduct?.images.find(i => i.url === imagePreview)) {
      productData.images = [{
        id: generateId(),
        url: imagePreview,
        is_primary: true,
        created_at: now,
      }];
    } else if (imagePreview && editingProduct) {
      // Update existing primary image
      productData.images = editingProduct.images.map(img => 
        img.is_primary ? { ...img, url: imagePreview } : img
      );
    }

    if (editingProduct) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: productData });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (productId: string) => {
    if (confirm('คุณแน่ใจที่จะลบสินค้านี้หรือไม่?')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    }
  };

  if (state.isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สินค้า</h1>
          <p className="text-gray-500 mt-1">จัดการข้อมูลสินค้า {state.products.length} รายการ</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มสินค้าใหม่
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหรือ SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">ทุกหมวดหมู่</option>
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>
          <Button 
            variant="secondary" 
            onClick={() => { setSearch(''); setCategoryFilter(''); setStatusFilter(''); }}
          >
            ล้างตัวกรอง
          </Button>
        </div>
      </Card>

      {/* Products Table */}
      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>รูปภาพ</TableHeadCell>
              <TableHeadCell>SKU</TableHeadCell>
              <TableHeadCell>ชื่อสินค้า</TableHeadCell>
              <TableHeadCell>หมวดหมู่</TableHeadCell>
              <TableHeadCell>คงคลัง</TableHeadCell>
              <TableHeadCell>สถานะ</TableHeadCell>
              <TableHeadCell>จัดการ</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map(product => {
              const inv = state.inventory.find(i => i.product_id === product.id);
              const stock = inv?.quantity_on_hand || 0;
              const isLowStock = stock < product.reorder_point;
              
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                      {product.images[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name_th} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-gray-600">{product.sku}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{product.name_th}</p>
                      {product.name_en && <p className="text-xs text-gray-500">{product.name_en}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(product.category)}>{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isLowStock && <span className="text-red-500">⚠️</span>}
                      <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {stock}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleView(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="ดู">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(product)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="แก้ไข">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="ลบ">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredProducts.length === 0 && (
          <EmptyState 
            icon={<Package className="w-12 h-12" />}
            title="ไม่พบสินค้า"
            description="ลองค้นหาด้วยคำอื่น"
          />
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'รายละเอียดสินค้า' : editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {isViewMode ? 'ปิด' : 'ยกเลิก'}
            </Button>
            {!isViewMode && (
              <Button onClick={handleSave}>
                {editingProduct ? 'บันทึก' : 'เพิ่มสินค้า'}
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="flex flex-col items-center">
            <div 
              className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors overflow-hidden"
              onClick={() => !isViewMode && fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <Upload className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">เพิ่มรูป</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              disabled={isViewMode || !!editingProduct}
              required
            />
            <Select
              label="หมวดหมู่"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
              disabled={isViewMode}
            />
          </div>

          <Input
            label="ชื่อสินค้า (ไทย)"
            value={formData.name_th}
            onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
            disabled={isViewMode}
            required
          />

          <Input
            label="ชื่อสินค้า (อังกฤษ)"
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            disabled={isViewMode}
          />

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="หน่วย"
              options={unitOptions}
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
              disabled={isViewMode}
            />
            <Input
              label="ขนาด"
              value={formData.spec_size}
              onChange={(e) => setFormData({ ...formData, spec_size: e.target.value })}
              disabled={isViewMode}
            />
            <Input
              label="ความหนา"
              value={formData.spec_thickness}
              onChange={(e) => setFormData({ ...formData, spec_thickness: e.target.value })}
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="สี"
              value={formData.spec_color}
              onChange={(e) => setFormData({ ...formData, spec_color: e.target.value })}
              disabled={isViewMode}
            />
            <Input
              label="ผู้จัดจำหน่าย"
              value={formData.default_supplier}
              onChange={(e) => setFormData({ ...formData, default_supplier: e.target.value })}
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="จุดสั่งซื้อใหม่"
              type="number"
              value={formData.reorder_point}
              onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) || 0 })}
              disabled={isViewMode}
            />
            <Input
              label="สต็อกขั้นต่ำ"
              type="number"
              value={formData.min_stock}
              onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
              disabled={isViewMode}
            />
          </div>

          {!isViewMode && (
            <Select
              label="สถานะ"
              options={[
                { value: 'active', label: 'ใช้งาน' },
                { value: 'inactive', label: 'ไม่ใช้งาน' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            />
          )}

          {isViewMode && editingProduct && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm"><span className="font-medium">สร้างเมื่อ:</span> {formatDate(editingProduct.created_at)}</p>
              <p className="text-sm"><span className="font-medium">อัปเดตล่าสุด:</span> {formatDate(editingProduct.updated_at)}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
