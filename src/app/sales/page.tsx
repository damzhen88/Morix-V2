// Sales Page for MORIX CRM v2 - REDESIGNED
'use client';

import { useState } from 'react';
import { useApp } from '@/store';
import { Card, Button, Input, Select, Badge, Modal, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell } from '@/components/ui';
import { formatDate, formatCurrency, generateId } from '@/lib/utils';
import { SalesOrder, OrderItem, CustomerType } from '@/types';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Search, FileText, DollarSign, Users, Edit, Trash2, Eye, X, Calculator, ShoppingCart } from 'lucide-react';

const customerTypeOptions = [
  { value: 'contractor', label: 'ผู้รับเหมา' },
  { value: 'homeowner', label: 'เจ้าของบ้าน' },
  { value: 'dealer', label: 'ตัวแทนจำหน่าย' },
  { value: 'project', label: 'โครงการ' },
];

const statusOptions = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'quoted', label: 'เสนอราคา' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'delivered', label: 'จัดส่งแล้ว' },
  { value: 'closed', label: 'ปิดงาน' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

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

  const filteredOrders = state.salesOrders.filter(order => {
    const matchesSearch = !search || 
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 0, unit_price_thb: 0, cost_thb: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price_thb), 0);
    const productCost = items.reduce((sum, item) => sum + (item.quantity * item.cost_thb), 0);
    const total = subtotal + formData.transport_cost + formData.labor_cost - formData.discount;
    const grossProfit = subtotal - productCost;
    const netProfit = total - productCost;
    return { subtotal, productCost, total, grossProfit, netProfit };
  };

  const handleSave = async () => {
    const now = new Date().toISOString();
    const { subtotal, productCost, total, grossProfit, netProfit } = calculateTotals();

    const orderItems: OrderItem[] = items.map(item => ({
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
      customer_id: editingOrder?.customer_id || generateId(),
      customer_name: formData.customer_name,
      customer_type: formData.customer_type,
      status: formData.status,
      items: orderItems,
      subtotal,
      discount: formData.discount,
      transport_cost: formData.transport_cost,
      labor_cost: formData.labor_cost,
      total,
      product_cost_thb: productCost,
      gross_profit: grossProfit,
      net_profit: netProfit,
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
        if (error) { alert('Error: ' + error.message); return; }
      } else {
        const { error } = await supabase.from('sales_orders').insert({ ...orderData, id: order.id, created_at: order.created_at });
        if (error) { alert('Error: ' + error.message); return; }
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

  const { subtotal, total, netProfit } = calculateTotals();

  return (
    <div className="min-h-screen mesh-gradient pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6 sticky top-0 z-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ขายสินค้า</h1>
            <p className="text-sm text-gray-500">จัดการใบสั่งขาย</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-dark transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>+ สร้างใบขาย</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ใบขาย ชื่อลูกค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setStatusFilter('')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${!statusFilter ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>ทั้งหมด</button>
          {statusOptions.map(opt => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${statusFilter === opt.value ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>{opt.label}</button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีใบขาย</p>
              <p className="text-sm text-gray-400">กดปุ่ม "+ สร้างใบขาย" เพื่อสร้างใบขายใหม่</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} onClick={() => openView(order)} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'confirmed' ? 'bg-green-100 text-green-700' : order.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>
                        {statusOptions.find(s => s.value === order.status)?.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{order.customer_name}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent text-lg">{formatCurrency(order.total || 0)}</p>
                    <p className="text-xs text-gray-500">{order.items?.length || 0} รายการ</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={isViewMode ? 'รายละเอียดใบขาย' : editingOrder ? 'แก้ไขใบขาย' : 'สร้างใบขายใหม่'} size="full" footer={
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1 py-4 text-lg">❌ ยกเลิก</Button>
          {!isViewMode && <Button onClick={handleSave} className="flex-1 py-4 text-lg font-bold">💾 บันทึกใบขาย</Button>}
        </div>
      }>
        <div className="space-y-6">
          {/* Section 1: ข้อมูลลูกค้า */}
          <div className="bg-blue-50 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">👤 ข้อมูลลูกค้า</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🏷️ ชื่อลูกค้า *</label>
                <input type="text" className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-accent" placeholder="ชื่อลูกค้า / บริษัท" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} disabled={isViewMode} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">📋 ประเภทลูกค้า</label>
                  <select className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-accent" value={formData.customer_type} onChange={(e) => setFormData({...formData, customer_type: e.target.value as CustomerType})} disabled={isViewMode}>
                    {customerTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">📊 สถานะใบขาย</label>
                  <select className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-accent" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as SalesOrder['status']})} disabled={isViewMode}>
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: รายการสินค้า */}
          <div className="bg-green-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">📦 รายการสินค้า</h3>
              {!isViewMode && <button onClick={handleAddItem} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm">+ เพิ่มสินค้า</button>}
            </div>
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">ยังไม่มีสินค้า</p>
                  <p className="text-sm text-gray-400">กด "+ เพิ่มสินค้า" เพื่อเพิ่มรายการ</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border-2 border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-bold text-gray-500">รายการที่ {idx + 1}</span>
                      {!isViewMode && <button onClick={() => handleRemoveItem(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">🏷️ เลือกสินค้า</label>
                        <select className="w-full px-3 py-3 border border-gray-200 rounded-lg" value={item.product_id} onChange={(e) => { const newItems = [...items]; newItems[idx].product_id = e.target.value; setItems(newItems); }} disabled={isViewMode}>
                          <option value="">-- เลือกสินค้า --</option>
                          {state.products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name_th}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">🔢 จำนวน (หน่วย)</label>
                          <input type="number" className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center text-lg font-bold" placeholder="0" value={item.quantity || ''} onChange={(e) => { const newItems = [...items]; newItems[idx].quantity = parseInt(e.target.value) || 0; setItems(newItems); }} disabled={isViewMode} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">💰 ราคาต่อหน่วย (บาท)</label>
                          <input type="number" className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center text-lg font-bold" placeholder="0" value={item.unit_price_thb || ''} onChange={(e) => { const newItems = [...items]; newItems[idx].unit_price_thb = parseFloat(e.target.value) || 0; setItems(newItems); }} disabled={isViewMode} />
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg px-3 py-2 flex justify-between items-center">
                        <span className="text-sm text-gray-600">รวมรายการนี้:</span>
                        <span className="font-bold text-accent text-lg">{formatCurrency(item.quantity * item.unit_price_thb)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: ค่าใช้จ่าย */}
          <div className="bg-purple-50 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">💵 ค่าใช้จ่ายเพิ่มเติม</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🚚 ค่าขนส่ง (บาท)</label>
                <input type="number" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg" placeholder="0" value={formData.transport_cost || ''} onChange={(e) => setFormData({...formData, transport_cost: parseFloat(e.target.value) || 0})} disabled={isViewMode} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🔧 ค่าแรง (บาท)</label>
                <input type="number" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg" placeholder="0" value={formData.labor_cost || ''} onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value) || 0})} disabled={isViewMode} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🎯 ส่วนลด (บาท)</label>
                <input type="number" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg" placeholder="0" value={formData.discount || ''} onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} disabled={isViewMode} />
              </div>
            </div>
          </div>

          {/* Section 4: หมายเหตุ */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">📝 หมายเหตุ</h3>
            <textarea className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" rows={3} placeholder="หมายเหตุ..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} disabled={isViewMode} />
          </div>

          {/* Section 5: สรุปยอด */}
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-6 border-2 border-orange-300">
            <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">🧮 สรุปยอดรวม</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-orange-200">
                <span className="text-gray-700">รวมราคาสินค้า:</span>
                <span className="font-bold text-lg">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-orange-200">
                <span className="text-gray-700">+ ค่าขนส่ง:</span>
                <span className="font-bold">{formatCurrency(formData.transport_cost)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-orange-200">
                <span className="text-gray-700">+ ค่าแรง:</span>
                <span className="font-bold">{formatCurrency(formData.labor_cost)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-orange-200">
                <span className="text-gray-700">- ส่วนลด:</span>
                <span className="font-bold text-red-600">-{formatCurrency(formData.discount)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-orange-200 rounded-xl px-4 mt-2">
                <span className="text-xl font-bold text-orange-900">💵 ยอดรวมทั้งสิ้น:</span>
                <span className="text-2xl font-bold text-accent">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
