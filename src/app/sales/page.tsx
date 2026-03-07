// Sales Page for MORIX CRM v2 - MOBILE FIRST DESIGN
'use client';

import { useState } from 'react';
import { useApp } from '@/store';
import { formatDate, formatCurrency } from '@/lib/utils';
import { SalesOrder, CustomerType } from '@/types';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Search, FileText, DollarSign, Users, Eye, X, Calculator, ShoppingCart, ChevronRight, ArrowLeft, Check, Trash2 } from 'lucide-react';

// ============================================
// MOBILE-FIRST UI COMPONENTS
// ============================================

// Clean Card Component
function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Floating Action Button - iOS Style
function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-xl shadow-orange-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 z-50"
    >
      <Plus className="w-7 h-7 text-white" />
    </button>
  );
}

// Input Field - Mobile Optimized
function InputField({ 
  label, value, onChange, type = 'text', placeholder = '', icon, suffix, disabled = false 
}: { 
  label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; icon?: React.ReactNode; suffix?: string; disabled?: boolean 
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-base ${icon ? 'pl-10' : ''} ${suffix ? 'pr-12' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</div>}
      </div>
    </div>
  );
}

// Select Field - Mobile Optimized
function SelectField({ label, value, onChange, options, disabled = false }: { 
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean 
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-base appearance-none cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    quoted: 'bg-blue-100 text-blue-600',
    confirmed: 'bg-green-100 text-green-600',
    delivered: 'bg-emerald-100 text-emerald-600',
    closed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-100 text-red-600',
  };
  const labels: Record<string, string> = {
    draft: 'ร่าง',
    quoted: 'เสนอราคา',
    confirmed: 'ยืนยันแล้ว',
    delivered: 'จัดส่งแล้ว',
    closed: 'ปิดงาน',
    cancelled: 'ยกเลิก',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}

// Order Card - Mobile Optimized
function OrderCard({ order, onClick }: { order: SalesOrder; onClick: () => void }) {
  return (
    <Card onClick={onClick} className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-base truncate">{order.order_number}</p>
            <p className="text-sm text-gray-500 truncate">{order.customer_name}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={order.status} />
          <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">{order.items?.length || 0} รายการ</p>
        <p className="font-bold text-orange-600 text-lg">{formatCurrency(order.total || 0)}</p>
      </div>
    </Card>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function SalesPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_type: 'contractor' as CustomerType,
    status: 'draft' as SalesOrder['status'],
    discount: 0,
    transport_cost: 0,
    labor_cost: 0,
    payment_status: 'unpaid' as const,
    notes: '',
  });
  const [items, setItems] = useState<{product_id: string; quantity: number; unit_price_thb: number; cost_thb: number}[]>([]);

  // Filter orders
  const filteredOrders = state.salesOrders.filter(order => {
    const matchesSearch = !search || 
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price_thb), 0);
    const total = subtotal + formData.transport_cost + formData.labor_cost - formData.discount;
    return { subtotal, total };
  };
  const { subtotal, total } = calculateTotals();

  // Add item row
  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 0, unit_price_thb: 0, cost_thb: 0 }]);
  };

  // Remove item row
  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Update item
  const handleUpdateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[idx] as any)[field] = field === 'quantity' ? parseInt(value) || 0 : parseFloat(value) || 0;
    setItems(newItems);
  };

  // Save order
  const handleSave = async () => {
    if (!formData.customer_name.trim()) {
      alert('กรุณากรอกชื่อลูกค้า');
      return;
    }
    if (items.length === 0 || !items[0].product_id) {
      alert('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const now = new Date().toISOString();
    
    const orderItems = items.map(item => ({
      id: uuidv4(),
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_thb: item.unit_price_thb,
      discount_percent: 0,
      total_thb: item.quantity * item.unit_price_thb,
      cost_thb: item.quantity * item.cost_thb,
      profit_thb: item.quantity * (item.unit_price_thb - item.cost_thb),
    }));

    const order: SalesOrder = {
      id: editingOrder?.id || uuidv4(),
      order_number: editingOrder?.order_number || `SO-2026-${Date.now().toString().slice(-4)}`,
      customer_id: editingOrder?.customer_id || uuidv4(),
      customer_name: formData.customer_name,
      customer_type: formData.customer_type,
      status: formData.status,
      items: orderItems,
      subtotal,
      discount: formData.discount,
      transport_cost: formData.transport_cost,
      labor_cost: formData.labor_cost,
      total,
      product_cost_thb: orderItems.reduce((s, i) => s + (i.cost_thb || 0), 0),
      gross_profit: orderItems.reduce((s, i) => s + (i.profit_thb || 0), 0),
      net_profit: orderItems.reduce((s, i) => s + (i.profit_thb || 0), 0),
      payment_status: formData.payment_status,
      notes: formData.notes,
      images: editingOrder?.images || [],
      created_by: 'admin',
      created_at: editingOrder?.created_at || now,
      updated_at: now,
    };

    // Save to Supabase
    try {
      const orderData = {
        order_number: order.order_number,
        customer_id: null,
        order_date: order.created_at.split('T')[0],
        status: order.status,
        total_thb: order.total,
        profit_thb: order.net_profit,
        cost_thb: order.product_cost_thb,
        shipping_thb: (order.transport_cost || 0) + (order.labor_cost || 0),
      };

      if (editingOrder) {
        const { error } = await supabase.from('sales_orders').update(orderData).eq('id', order.id);
        if (error) console.error('Update error:', error);
      } else {
        const { error } = await supabase.from('sales_orders').insert({ ...orderData, id: order.id, created_at: order.created_at });
        if (error) console.error('Insert error:', error);
      }
    } catch (err) {
      console.error('Save error:', err);
    }

    if (editingOrder) {
      dispatch({ type: 'UPDATE_SALES_ORDER', payload: order });
    } else {
      dispatch({ type: 'ADD_SALES_ORDER', payload: order });
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setEditingOrder(null);
    setIsViewMode(false);
    setFormData({
      customer_name: '',
      customer_type: 'contractor',
      status: 'draft',
      discount: 0,
      transport_cost: 0,
      labor_cost: 0,
      payment_status: 'unpaid',
      notes: '',
    });
    setItems([]);
  };

  // Open view
  const openView = (order: SalesOrder) => {
    setEditingOrder(order);
    setIsViewMode(true);
    setFormData({
      customer_name: order.customer_name,
      customer_type: order.customer_type || 'contractor',
      status: order.status,
      discount: order.discount || 0,
      transport_cost: order.transport_cost || 0,
      labor_cost: order.labor_cost || 0,
      payment_status: order.payment_status || 'unpaid',
      notes: order.notes || '',
    });
    setItems(order.items?.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_thb: item.unit_price_thb,
      cost_thb: item.cost_thb,
    })) || []);
    setIsModalOpen(true);
  };

  const statusOptions = [
    { value: 'draft', label: 'ฉบับร่าง' },
    { value: 'quoted', label: 'เสนอราคา' },
    { value: 'confirmed', label: 'ยืนยันแล้ว' },
    { value: 'delivered', label: 'จัดส่งแล้ว' },
    { value: 'closed', label: 'ปิดงาน' },
  ];

  const customerTypeOptions = [
    { value: 'contractor', label: 'ผู้รับเหมา' },
    { value: 'homeowner', label: 'เจ้าของบ้าน' },
    { value: 'dealer', label: 'ตัวแทนจำหน่าย' },
    { value: 'project', label: 'โครงการ' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">ใบขาย</h1>
            <p className="text-xs text-gray-500">{filteredOrders.length} รายการ</p>
          </div>
        </div>
      </div>

      {/* Search - Mobile Optimized */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาใบขาย..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
      </div>

      {/* Status Filter - Horizontal Scroll */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${!statusFilter ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          ทั้งหมด
        </button>
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === opt.value ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders List - Mobile Cards */}
      <div className="p-4 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">ยังไม่มีใบขาย</p>
            <p className="text-sm text-gray-400 mt-1">กดปุ่ม + เพื่อสร้างใบขายใหม่</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} onClick={() => openView(order)} />
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <FAB onClick={() => { resetForm(); setIsModalOpen(true); }} />

      {/* Modal - Full Screen on Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => { setIsModalOpen(false); resetForm(); }} />
          
          {/* Modal Content */}
          <div className="relative w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                {isViewMode ? (
                  <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 -ml-2">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                ) : null}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {isViewMode ? 'รายละเอียด' : editingOrder ? 'แก้ไขใบขาย' : 'ใบขายใหม่'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isViewMode ? formatDate(editingOrder?.created_at || '') : 'กรอกข้อมูลใบขาย'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Customer Section */}
              <Card className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" /> ข้อมูลลูกค้า
                </h3>
                <div className="space-y-3">
                  <InputField
                    label="ชื่อลูกค้า"
                    value={formData.customer_name}
                    onChange={(v) => setFormData({...formData, customer_name: v})}
                    placeholder="ชื่อลูกค้า / บริษัท"
                    disabled={isViewMode}
                  />
                  <SelectField
                    label="ประเภทลูกค้า"
                    value={formData.customer_type}
                    onChange={(v) => setFormData({...formData, customer_type: v as CustomerType})}
                    options={customerTypeOptions}
                    disabled={isViewMode}
                  />
                </div>
              </Card>

              {/* Products Section */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-500" /> รายการสินค้า
                  </h3>
                  {!isViewMode && (
                    <button onClick={handleAddItem} className="text-xs text-orange-500 font-semibold">+ เพิ่ม</button>
                  )}
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="text-center text-gray-400 py-4 text-sm">ยังไม่มีสินค้า</p>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">รายการ {idx + 1}</span>
                          {!isViewMode && (
                            <button onClick={() => handleRemoveItem(idx)} className="text-red-500 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <select
                          className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          value={item.product_id}
                          onChange={(e) => handleUpdateItem(idx, 'product_id', e.target.value)}
                          disabled={isViewMode}
                        >
                          <option value="">เลือกสินค้า</option>
                          {state.products.map(p => (
                            <option key={p.id} value={p.id}>{p.sku} - {p.name_th}</option>
                          ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="จำนวน"
                            className="px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center"
                            value={item.quantity || ''}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                            disabled={isViewMode}
                          />
                          <input
                            type="number"
                            placeholder="ราคา/หน่วย"
                            className="px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center"
                            value={item.unit_price_thb || ''}
                            onChange={(e) => handleUpdateItem(idx, 'unit_price_thb', e.target.value)}
                            disabled={isViewMode}
                          />
                        </div>
                        {item.quantity > 0 && item.unit_price_thb > 0 && (
                          <p className="text-xs text-right text-orange-600 font-medium">
                            = {formatCurrency(item.quantity * item.unit_price_thb)}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Costs Section */}
              <Card className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-orange-500" /> ค่าใช้จ่าย
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <InputField
                    label="ค่าขนส่ง"
                    value={formData.transport_cost}
                    onChange={(v) => setFormData({...formData, transport_cost: parseFloat(v) || 0})}
                    type="number"
                    suffix="฿"
                    disabled={isViewMode}
                  />
                  <InputField
                    label="ค่าแรง"
                    value={formData.labor_cost}
                    onChange={(v) => setFormData({...formData, labor_cost: parseFloat(v) || 0})}
                    type="number"
                    suffix="฿"
                    disabled={isViewMode}
                  />
                  <InputField
                    label="ส่วนลด"
                    value={formData.discount}
                    onChange={(v) => setFormData({...formData, discount: parseFloat(v) || 0})}
                    type="number"
                    suffix="฿"
                    disabled={isViewMode}
                  />
                </div>
              </Card>

              {/* Summary */}
              <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">ยอดรวม</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(total)}</p>
                  </div>
                  <Calculator className="w-8 h-8 text-orange-300" />
                </div>
              </Card>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">หมายเหตุ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  disabled={isViewMode}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl mt-1.5 text-base focus:bg-white focus:border-orange-500"
                  rows={2}
                  placeholder="หมายเหตุ..."
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold active:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              {!isViewMode && (
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold active:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> บันทึก
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
