// Inventory Page for MORIX CRM v2

'use client';

import { useState } from 'react';
import { useApp } from '@/store';
import { Card, Button, Input, Select, Badge, Modal, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, EmptyState, PageLoader } from '@/components/ui';
import { formatDate, formatCurrency, getStatusColor, generateId } from '@/lib/utils';
import { StockMovement } from '@/types';
import { Plus, Search, ArrowUpDown, Package, AlertTriangle, TrendingUp, History } from 'lucide-react';

export default function InventoryPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [movementForm, setMovementForm] = useState({
    product_id: '',
    quantity: 0,
    notes: '',
  });

  // Merge inventory with products
  const inventoryData = state.products.map(product => {
    const inv = state.inventory.find(i => i.product_id === product.id);
    return {
      ...product,
      inventory: inv,
    };
  });

  const filteredInventory = inventoryData.filter(item => 
    !search || 
    item.name_th.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = state.inventory.reduce((sum, inv) => 
    sum + (inv.quantity_on_hand * inv.weighted_average_cost_thb), 0
  );

  const lowStockCount = state.products.filter(p => {
    const inv = state.inventory.find(i => i.product_id === p.id);
    return inv && inv.quantity_on_hand < p.reorder_point;
  }).length;

  const handleOpenMovement = (productId: string) => {
    setMovementForm({ product_id: productId, quantity: 0, notes: '' });
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = () => {
    const now = new Date().toISOString();
    const product = state.products.find(p => p.id === movementForm.product_id);
    const inv = state.inventory.find(i => i.product_id === movementForm.product_id);

    // Create movement record
    const movement: StockMovement = {
      id: generateId(),
      product_id: movementForm.product_id,
      warehouse_id: 'wh-1',
      type: movementType,
      quantity: movementForm.quantity,
      notes: movementForm.notes,
      created_by: 'admin',
      created_at: now,
    };

    // Update inventory
    if (inv) {
      const newQty = movementType === 'OUT' 
        ? inv.quantity_on_hand - movementForm.quantity 
        : inv.quantity_on_hand + movementForm.quantity;

      dispatch({
        type: 'UPDATE_INVENTORY',
        payload: {
          ...inv,
          quantity_on_hand: Math.max(0, newQty),
          quantity_available: Math.max(0, newQty),
          last_movement_at: now,
        },
      });
    }

    dispatch({ type: 'ADD_STOCK_MOVEMENT', payload: movement });
    setIsMovementModalOpen(false);
  };

  if (state.isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คลังสินค้า</h1>
          <p className="text-gray-500 mt-1">จัดการสต็อกและการเคลื่อนไหว</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">มูลค่าสินค้าคงคลัง</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">จำนวน SKU</p>
            <p className="text-xl font-bold text-gray-900">{state.products.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">สินค้าต่ำกว่าจุดสั่งซื้อ</p>
            <p className="text-xl font-bold text-red-600">{lowStockCount}</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card padding="sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </Card>

      {/* Inventory Table */}
      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>SKU</TableHeadCell>
              <TableHeadCell>สินค้า</TableHeadCell>
              <TableHeadCell>หมวด</TableHeadCell>
              <TableHeadCell>คงคลัง</TableHeadCell>
              <TableHeadCell>จุดสั่งซื้อ</TableHeadCell>
              <TableHeadCell>มูลค่า</TableHeadCell>
              <TableHeadCell>สถานะ</TableHeadCell>
              <TableHeadCell>จัดการ</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.map(item => {
              const qty = item.inventory?.quantity_on_hand || 0;
              const isLow = qty < item.reorder_point;
              const value = qty * (item.inventory?.weighted_average_cost_thb || 0);
              
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="font-mono text-sm text-gray-600">{item.sku}</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900">{item.name_th}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={item.category === 'ASA' ? 'bg-purple-100 text-purple-700' :
                      item.category === 'WPC' ? 'bg-orange-100 text-orange-700' :
                      item.category === 'SPC' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                      {qty}
                    </span>
                  </TableCell>
                  <TableCell>{item.reorder_point}</TableCell>
                  <TableCell>{formatCurrency(value)}</TableCell>
                  <TableCell>
                    {isLow ? (
                      <Badge variant="danger">ต่ำ</Badge>
                    ) : (
                      <Badge variant="success">ปกติ</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenMovement(item.id)}>
                        + Stock
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Movement Modal */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="เพิ่มการเคลื่อนไหวสต็อก"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsMovementModalOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSaveMovement}>บันทึก</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMovementType('IN')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                movementType === 'IN' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              + Stock In
            </button>
            <button
              onClick={() => setMovementType('OUT')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                movementType === 'OUT' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              - Stock Out
            </button>
          </div>

          <Input
            label="จำนวน"
            type="number"
            value={movementForm.quantity}
            onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) || 0 })}
          />

          <Input
            label="หมายเหตุ"
            value={movementForm.notes}
            onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
