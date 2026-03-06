// Purchase/Import Page for MORIX CRM v2

'use client';

import { useState } from 'react';
import { useApp } from '@/store';
import { Card, Button, Input, Select, Badge, Modal, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, EmptyState, PageLoader } from '@/components/ui';
import { formatDate, formatCurrency, generateId, cnyToThb } from '@/lib/utils';
import { PurchaseOrder, PurchaseOrderItem } from '@/types';
import { Plus, Search, FileText, Truck, DollarSign, Calendar, Edit } from 'lucide-react';

export default function PurchasePage() {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState({
    supplier: '',
    exchange_rate: 5.12,
    status: 'draft' as const,
  });
  const [items, setItems] = useState<{product_id: string; quantity: number; unit_price_cny: number}[]>([]);
  const [shipmentCosts, setShipmentCosts] = useState<{description: string; amount_cny: number}[]>([]);

  const calculateTotal = () => {
    const productsTotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price_cny), 0);
    const shippingTotal = shipmentCosts.reduce((sum, cost) => sum + cost.amount_cny, 0);
    const totalCny = productsTotal + shippingTotal;
    const totalThb = cnyToThb(totalCny, formData.exchange_rate);
    return { totalCny, totalThb };
  };

  const handleAddItem = () => {
    // Get first product if available
    const firstProduct = state.products[0];
    setItems([...items, { product_id: firstProduct?.id || '', quantity: 1, unit_price_cny: 0 }]);
  };

  const handleAddShipmentCost = () => {
    setShipmentCosts([...shipmentCosts, { description: '', amount_cny: 0 }]);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const { totalCny, totalThb } = calculateTotal();

    const po: PurchaseOrder = {
      id: editingPO?.id || generateId(),
      po_number: editingPO?.po_number || `PO-2026-${Date.now().toString().slice(-4)}`,
      supplier: formData.supplier,
      currency: 'CNY',
      exchange_rate: formData.exchange_rate,
      status: formData.status,
      items: items.map(item => ({
        id: generateId(),
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_cny: item.unit_price_cny,
        total_cny: item.quantity * item.unit_price_cny,
      })),
      shipment_costs: shipmentCosts.map(cost => ({
        id: generateId(),
        description: cost.description,
        amount_cny: cost.amount_cny,
        amount_thb: cnyToThb(cost.amount_cny, formData.exchange_rate),
        allocation_method: 'value' as const,
      })),
      total_cny: totalCny,
      total_thb: totalThb,
      landed_cost_total_thb: totalThb,
      created_at: editingPO?.created_at || now,
      updated_at: now,
    };

    if (editingPO) {
      dispatch({ type: 'UPDATE_PURCHASE_ORDER', payload: po });
    } else {
      dispatch({ type: 'ADD_PURCHASE_ORDER', payload: po });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingPO(null);
    setFormData({ supplier: '', exchange_rate: 5.12, status: 'draft' });
    setItems([]);
    setShipmentCosts([]);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setEditingPO(po);
    setFormData({
      supplier: po.supplier,
      exchange_rate: po.exchange_rate,
      status: po.status,
    });
    setItems(po.items.map(i => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price_cny: i.unit_price_cny,
    })));
    setShipmentCosts(po.shipment_costs.map(c => ({
      description: c.description,
      amount_cny: c.amount_cny,
    })));
    setIsModalOpen(true);
  };

  if (state.isLoading) {
    return <PageLoader />;
  }

  const totals = state.purchaseOrders.reduce((acc, po) => ({
    totalCny: acc.totalCny + po.total_cny,
    totalThb: acc.totalThb + po.total_thb,
  }), { totalCny: 0, totalThb: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">นำเข้าสินค้า</h1>
          <p className="text-gray-500 mt-1">จัดการใบสั่งซื้อและต้นทุนการนำเข้า</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          สร้างใบสั่งซื้อ
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">ใบสั่งซื้อทั้งหมด</p>
            <p className="text-xl font-bold text-gray-900">{state.purchaseOrders.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">มูลค่ารวม (CNY)</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.totalCny, 'CNY')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Truck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">มูลค่ารวม (THB)</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.totalThb)}</p>
          </div>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>เลขที่ PO</TableHeadCell>
              <TableHeadCell>ผู้จัดจำหน่าย</TableHeadCell>
              <TableHeadCell>อัตราแลก</TableHeadCell>
              <TableHeadCell>มูลค่า (CNY)</TableHeadCell>
              <TableHeadCell>มูลค่า (THB)</TableHeadCell>
              <TableHeadCell>สถานะ</TableHeadCell>
              <TableHeadCell>วันที่</TableHeadCell>
              <TableHeadCell>จัดการ</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.purchaseOrders.map(po => (
              <TableRow key={po.id}>
                <TableCell>
                  <span className="font-mono text-sm font-medium text-gray-900">{po.po_number}</span>
                </TableCell>
                <TableCell>{po.supplier}</TableCell>
                <TableCell>{po.exchange_rate} THB/CNY</TableCell>
                <TableCell>{formatCurrency(po.total_cny, 'CNY')}</TableCell>
                <TableCell className="font-medium">{formatCurrency(po.total_thb)}</TableCell>
                <TableCell>
                  <Badge className={po.status === 'received' ? 'bg-green-100 text-green-700' :
                    po.status === 'confirmed' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'}>
                    {po.status === 'received' ? 'รับแล้ว' :
                     po.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ฉบับร่าง'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(po.created_at)}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(po)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingPO ? 'แก้ไขใบสั่งซื้อ' : 'สร้างใบสั่งซื้อใหม่'}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>ยกเลิก</Button>
            <Button onClick={handleSave}>บันทึก</Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ผู้จัดจำหน่าย"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
            <Input
              label="อัตราแลกเปลี่ยน (THB/CNY)"
              type="number"
              step="0.01"
              value={formData.exchange_rate}
              onChange={(e) => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">📦 รายการสินค้า</h4>
              <Button size="sm" variant="secondary" onClick={handleAddItem}>+ เพิ่มสินค้า</Button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => {
                const product = state.products.find(p => p.id === item.product_id);
                const unitLabel = product?.unit === 'sqm' ? 'ตร.ม.' : 
                                  product?.unit === 'piece' ? 'ชิ้น' : 
                                  product?.unit === 'box' ? 'กล่อง' : 
                                  product?.unit === 'meter' ? 'เมตร' : 
                                  product?.unit === 'set' ? 'ชุด' : 'หน่วย';
                return (
                <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <select
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    value={item.product_id}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].product_id = e.target.value;
                      setItems(newItems);
                    }}
                  >
                    <option value="">เลือกสินค้า</option>
                    {state.products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name_th} ({p.unit === 'sqm' ? 'ตร.ม.' : p.unit === 'piece' ? 'ชิ้น' : p.unit === 'box' ? 'กล่อง' : p.unit === 'meter' ? 'เมตร' : p.unit === 'set' ? 'ชุด' : p.unit})
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">จำนวน ({unitLabel})</label>
                    <Input
                    type="number"
                    placeholder="0"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].quantity = parseInt(e.target.value) || 0;
                      setItems(newItems);
                    }}
                  />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">ราคาต่อหน่วย (CNY)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={item.unit_price_cny}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].unit_price_cny = parseFloat(e.target.value) || 0;
                      setItems(newItems);
                    }}
                  />
                  </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-500">รวม:</span>
                    <span className="text-sm font-bold text-orange-600">
                      {formatCurrency(item.quantity * item.unit_price_cny, 'CNY')}
                    </span>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Shipment Costs */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">🚚 ค่าขนส่งและค่าใช้จ่าย</h4>
              <Button size="sm" variant="secondary" onClick={handleAddShipmentCost}>+ เพิ่ม</Button>
            </div>
            <div className="space-y-2">
              {shipmentCosts.map((cost, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="เช่น ค่าขนส่งท่าเรือ"
                    value={cost.description}
                    onChange={(e) => {
                      const newCosts = [...shipmentCosts];
                      newCosts[idx].description = e.target.value;
                      setShipmentCosts(newCosts);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="CNY"
                    className="w-24"
                    value={cost.amount_cny}
                    onChange={(e) => {
                      const newCosts = [...shipmentCosts];
                      newCosts[idx].amount_cny = parseFloat(e.target.value) || 0;
                      setShipmentCosts(newCosts);
                    }}
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    ≈ {formatCurrency(cnyToThb(cost.amount_cny, formData.exchange_rate))}
                  </span>
                </div>
              ))}
              {shipmentCosts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">ยังไม่มีค่าใช้จ่าย</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">รวม (CNY):</span>
              <span className="font-medium">{formatCurrency(calculateTotal().totalCny, 'CNY')}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">รวม (THB):</span>
              <span className="font-bold text-lg">{formatCurrency(calculateTotal().totalThb)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
