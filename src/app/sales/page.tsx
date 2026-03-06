// Sales Page for MORIX CRM v2

'use client';

import { useState } from 'react';
import { useApp } from '@/store';
import { Card, Button, Input, Select, Badge, Modal, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, EmptyState, PageLoader, TextArea } from '@/components/ui';
import { formatDate, formatCurrency, generateId } from '@/lib/utils';
import { SalesOrder, OrderItem, CustomerType } from '@/types';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Search, FileText, DollarSign, Users, Edit, Trash2, Eye, Image as ImageIcon, Upload } from 'lucide-react';

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
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.order_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price_thb), 0);
    const productCost = items.reduce((sum, item) => sum + (item.quantity * item.cost_thb), 0);
    const discount = formData.discount;
    const total = subtotal - discount + formData.transport_cost + formData.labor_cost;
    const grossProfit = subtotal - discount - productCost;
    const netProfit = grossProfit - formData.transport_cost - formData.labor_cost;
    return { subtotal, productCost, discount, total, grossProfit, netProfit };
  };

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 0, unit_price_thb: 0, cost_thb: 0 }]);
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

    // SAVE TO SUPABASE
    try {
      const orderData = {
        order_number: order.order_number,
        customer_id: order.customer_name, // Using customer_name as customer_id
        order_date: order.created_at.split('T')[0],
        status: order.status,
        total_thb: order.total,
        profit_thb: order.net_profit,
        cost_thb: order.product_cost_thb,
        shipping_thb: (order.transport_cost || 0) + (order.labor_cost || 0),
      };

      if (editingOrder) {
        const { error } = await supabase
          .from('sales_orders')
          .update(orderData)
          .eq('id', order.id);
        
        if (error) {
          console.error('Supabase update error:', error);
          alert('เกิดข้อผิดพลาดในการอัปเดต: ' + error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('sales_orders')
          .insert({ ...orderData, id: order.id, created_at: order.created_at });
        
        if (error) {
          console.error('Supabase insert error:', error);
          alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
          return;
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึก');
      return;
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

  const handleEdit = (order: SalesOrder) => {
    setEditingOrder(order);
    setIsViewMode(false);
    setFormData({
      customer_name: order.customer_name,
      customer_type: order.customer_type,
      status: order.status,
      discount: order.discount,
      transport_cost: order.transport_cost,
      labor_cost: order.labor_cost,
      payment_status: order.payment_status,
      notes: order.notes || '',
    });
    setItems(order.items.map(i => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price_thb: i.unit_price_thb,
      cost_thb: i.cost_thb,
    })));
    setIsModalOpen(true);
  };

  const handleView = (order: SalesOrder) => {
    setEditingOrder(order);
    setIsViewMode(true);
    setFormData({
      customer_name: order.customer_name,
      customer_type: order.customer_type,
      status: order.status,
      discount: order.discount,
      transport_cost: order.transport_cost,
      labor_cost: order.labor_cost,
      payment_status: order.payment_status,
      notes: order.notes || '',
    });
    setItems(order.items.map(i => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price_thb: i.unit_price_thb,
      cost_thb: i.cost_thb,
    })));
    setIsModalOpen(true);
  };

  const handleDelete = (orderId: string) => {
    if (confirm('คุณแน่ใจที่จะลบใบสั่งซื้อนี้หรือไม่?')) {
      dispatch({ type: 'DELETE_SALES_ORDER', payload: orderId });
    }
  };

  if (state.isLoading) {
    return <PageLoader />;
  }

  const totals = state.salesOrders.reduce((acc, o) => ({
    revenue: acc.revenue + o.total,
    profit: acc.profit + o.net_profit,
  }), { revenue: 0, profit: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การขาย</h1>
          <p className="text-gray-500 mt-1">จัดการคำสั่งซื้อและรายได้</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          สร้างใบสั่งซื้อ
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">รายได้รวม</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.revenue)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">กำไรสุทธิ</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.profit)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">จำนวนใบสั่งซื้อ</p>
            <p className="text-xl font-bold text-gray-900">{state.salesOrders.length}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาลูกค้าหรือเลขที่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">ทุกสถานะ</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>เลขที่</TableHeadCell>
              <TableHeadCell>ลูกค้า</TableHeadCell>
              <TableHeadCell>ประเภท</TableHeadCell>
              <TableHeadCell>สถานะ</TableHeadCell>
              <TableHeadCell>ยอดรวม</TableHeadCell>
              <TableHeadCell>กำไร</TableHeadCell>
              <TableHeadCell>วันที่</TableHeadCell>
              <TableHeadCell>จัดการ</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map(order => (
              <TableRow key={order.id}>
                <TableCell>
                  <span className="font-mono text-sm font-medium text-gray-900">{order.order_number}</span>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                </TableCell>
                <TableCell>
                  <Badge className={order.customer_type === 'contractor' ? 'bg-blue-100 text-blue-700' :
                    order.customer_type === 'project' ? 'bg-orange-100 text-orange-700' :
                    order.customer_type === 'dealer' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}>
                    {order.customer_type === 'contractor' ? 'ผู้รับเหมา' :
                     order.customer_type === 'project' ? 'โครงการ' :
                     order.customer_type === 'dealer' ? 'ตัวแทน' : 'เจ้าของบ้าน'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'confirmed' ? 'bg-orange-100 text-orange-700' :
                    order.status === 'quoted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                    {statusOptions.find(s => s.value === order.status)?.label || order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                <TableCell className="text-green-600">{formatCurrency(order.net_profit)}</TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleView(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(order)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={isViewMode ? 'รายละเอียดใบสั่งซื้อ' : editingOrder ? 'แก้ไขใบสั่งซื้อ' : 'สร้างใบสั่งซื้อใหม่'}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              {isViewMode ? 'ปิด' : 'ยกเลิก'}
            </Button>
            {!isViewMode && <Button onClick={handleSave}>{editingOrder ? 'บันทึก' : 'สร้างใบสั่งซื้อ'}</Button>}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ชื่อลูกค้า"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              disabled={isViewMode}
            />
            <Select
              label="ประเภทลูกค้า"
              options={customerTypeOptions}
              value={formData.customer_type}
              onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as CustomerType })}
              disabled={isViewMode}
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="สถานะ"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as SalesOrder['status'] })}
              disabled={isViewMode}
            />
            <Select
              label="สถานะการชำระเงิน"
              options={[
                { value: 'unpaid', label: 'ยังไม่ชำระ' },
                { value: 'deposit', label: 'มัดจำ' },
                { value: 'paid', label: 'ชำระแล้ว' },
              ]}
              value={formData.payment_status}
              onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as 'unpaid' | 'deposit' | 'paid' })}
              disabled={isViewMode}
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">รายการสินค้า</h4>
              {!isViewMode && <Button size="sm" variant="secondary" onClick={handleAddItem}>+ เพิ่มสินค้า</Button>}
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2">
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    value={item.product_id}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].product_id = e.target.value;
                      setItems(newItems);
                    }}
                    disabled={isViewMode}
                  >
                    <option value="">เลือกสินค้า</option>
                    {state.products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} - {p.name_th}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="จำนวน"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].quantity = parseInt(e.target.value) || 0;
                      setItems(newItems);
                    }}
                    disabled={isViewMode}
                  />
                  <Input
                    type="number"
                    placeholder="ราคาขาย"
                    value={item.unit_price_thb}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].unit_price_thb = parseFloat(e.target.value) || 0;
                      setItems(newItems);
                    }}
                    disabled={isViewMode}
                  />
                  <Input
                    type="number"
                    placeholder="ต้นทุน"
                    value={item.cost_thb}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].cost_thb = parseFloat(e.target.value) || 0;
                      setItems(newItems);
                    }}
                    disabled={isViewMode}
                  />
                  <div className="flex items-center justify-end">
                    <span className="text-sm font-medium text-gray-600">
                      {formatCurrency(item.quantity * (item.unit_price_thb - item.cost_thb))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Costs */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="ส่วนลด (THB)"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
              disabled={isViewMode}
            />
            <Input
              label="ค่าขนส่ง (THB)"
              type="number"
              value={formData.transport_cost}
              onChange={(e) => setFormData({ ...formData, transport_cost: parseFloat(e.target.value) || 0 })}
              disabled={isViewMode}
            />
            <Input
              label="ค่าแรง (THB)"
              type="number"
              value={formData.labor_cost}
              onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) || 0 })}
              disabled={isViewMode}
            />
          </div>

          {/* Notes */}
          <TextArea
            label="หมายเหตุ"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={isViewMode}
            rows={2}
          />

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">รวม:</span>
              <span>{formatCurrency(calculateTotals().subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ส่วนลด:</span>
              <span>-{formatCurrency(calculateTotals().discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ค่าขนส่ง+แรง:</span>
              <span>{formatCurrency(formData.transport_cost + formData.labor_cost)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>ยอดรวม:</span>
              <span>{formatCurrency(calculateTotals().total)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span className="text-sm">กำไรสุทธิ:</span>
              <span className="font-medium">{formatCurrency(calculateTotals().netProfit)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
