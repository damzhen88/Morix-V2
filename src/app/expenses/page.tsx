// Expenses Page for MORIX CRM v2

'use client';

import { useState } from 'react';
import { useApp } from '@/store';
import { Card, Button, Input, Select, Badge, Modal, Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, EmptyState, PageLoader, TextArea } from '@/components/ui';
import { formatDate, formatCurrency, generateId, getExpenseCategoryLabel } from '@/lib/utils';
import { Expense, ExpenseCategory } from '@/types';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Search, DollarSign, Receipt, Edit, Trash2, Calendar, TrendingDown } from 'lucide-react';

const categoryOptions = [
  { value: 'warehouse_rent', label: 'ค่าเช่าคลัง' },
  { value: 'salaries', label: 'เงินเดือน' },
  { value: 'packer_wages', label: 'ค่าจ้างแรงงาน' },
  { value: 'marketing', label: 'ค่าการตลาด' },
  { value: 'utilities', label: 'ค่าสาธารณูปโภค' },
  { value: 'office', label: 'ค่าสำนักงาน' },
  { value: 'transport', label: 'ค่าขนส่ง' },
  { value: 'miscellaneous', label: 'ค่าใช้จ่ายอื่น' },
];

const statusOptions = [
  { value: 'pending', label: 'รออนุมัติ' },
  { value: 'approved', label: 'อนุมัติแล้ว' },
  { value: 'paid', label: 'ชำระแล้ว' },
];

export default function ExpensesPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: 'office' as ExpenseCategory,
    amount_thb: 0,
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_type: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    status: 'pending' as 'paid' | 'pending' | 'approved',
    notes: '',
  });

  const filteredExpenses = state.expenses.filter(exp => {
    const matchesSearch = !search || 
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      exp.vendor?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = state.expenses.reduce((sum, e) => sum + e.amount_thb, 0);
  
  const expensesByCategory = categoryOptions.reduce((acc, cat) => {
    acc[cat.value] = state.expenses
      .filter(e => e.category === cat.value)
      .reduce((sum, e) => sum + e.amount_thb, 0);
    return acc;
  }, {} as Record<string, number>);

  const handleSave = async () => {
    const now = new Date().toISOString();
    
    const expense: Expense = {
      id: editingExpense?.id || uuidv4(),
      description: formData.description,
      category: formData.category,
      amount_thb: formData.amount_thb,
      vendor: formData.vendor || undefined,
      date: formData.date,
      
      recurring_type: formData.is_recurring ? formData.recurring_type : undefined,
      status: formData.status,
      notes: formData.notes || undefined,
      created_by: 'admin',
      created_at: editingExpense?.created_at || now,
    };

    // SAVE TO SUPABASE
    try {
      const expenseData = {
        description: expense.description,
        category: expense.category,
        amount_thb: expense.amount_thb,
        date: expense.date,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expense.id);
        
        if (error) {
          console.error('Supabase update error:', error);
          alert('เกิดข้อผิดพลาดในการอัปเดต: ' + error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert({ ...expenseData, id: expense.id, created_at: expense.created_at });
        
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

    if (editingExpense) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: expense });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingExpense(null);
    setIsViewMode(false);
    setFormData({
      description: '',
      category: 'office',
      amount_thb: 0,
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_type: 'monthly',
      status: 'pending',
      notes: '',
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsViewMode(false);
    setFormData({
      description: expense.description,
      category: expense.category,
      amount_thb: expense.amount_thb,
      vendor: expense.vendor || '',
      date: expense.date.split('T')[0],
      
      recurring_type: (expense.recurring_type || 'monthly') as 'monthly' | 'quarterly' | 'yearly',
      status: (expense.status || 'pending') as 'paid' | 'pending' | 'approved',
      notes: expense.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleView = (expense: Expense) => {
    setEditingExpense(expense);
    setIsViewMode(true);
    setFormData({
      description: expense.description,
      category: expense.category,
      amount_thb: expense.amount_thb,
      vendor: expense.vendor || '',
      date: expense.date.split('T')[0],
      
      recurring_type: (expense.recurring_type || 'monthly') as 'monthly' | 'quarterly' | 'yearly',
      status: (expense.status || 'pending') as 'paid' | 'pending' | 'approved',
      notes: expense.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('คุณแน่ใจที่จะลบรายการนี้หรือไม่?')) {
      return;
    }
    
    // Delete from Supabase
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);
    
    if (error) {
      console.error('Delete error:', error);
      alert('เกิดข้อผิดพลาดในการลบ: ' + error.message);
      return;
    }
    
    dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
  };

  if (state.isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ค่าใช้จ่าย</h1>
          <p className="text-gray-500 mt-1">จัดการค่าใช้จ่ายธุรกิจ (OPEX)</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มรายการ
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">ค่าใช้จ่ายรวม</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
          </div>
        </Card>
        {categoryOptions.slice(0, 3).map(cat => (
          <Card key={cat.value} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{cat.label}</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(expensesByCategory[cat.value])}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาค่าใช้จ่าย..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">ทุกประเภท</option>
            {categoryOptions.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Expenses Table - Mobile Responsive */}
      <Card padding="none">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>รายการ</TableHeadCell>
                <TableHeadCell>ประเภท</TableHeadCell>
                <TableHeadCell>ผู้ขาย/ผู้จัด</TableHeadCell>
                <TableHeadCell>จำนวน</TableHeadCell>
                <TableHeadCell>สถานะ</TableHeadCell>
                <TableHeadCell>วันที่</TableHeadCell>
                <TableHeadCell>จัดการ</TableHeadCell>
              </TableRow>
            </TableHead>
          <TableBody>
            {filteredExpenses.map(expense => (
              <TableRow key={expense.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    {expense.is_recurring && (
                      <Badge className="text-[10px] mt-1 bg-purple-100 text-purple-700">
                        ซ้ำทุกเดือน
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge>{getExpenseCategoryLabel(expense.category)}</Badge>
                </TableCell>
                <TableCell>{expense.vendor || '-'}</TableCell>
                <TableCell className="font-medium">{formatCurrency(expense.amount_thb)}</TableCell>
                <TableCell>
                  <Badge className={expense.status === 'paid' ? 'bg-green-100 text-green-700' :
                    expense.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}>
                    {statusOptions.find(s => s.value === expense.status)?.label}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleView(expense)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      👁️
                    </button>
                    <button onClick={() => handleEdit(expense)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredExpenses.map(expense => (
            <div key={expense.id} className="p-4 bg-white">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium text-gray-900">{expense.description}</p>
                <Badge className={expense.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {expense.status === 'paid' ? 'จ่ายแล้ว' : 'รอจ่าย'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                <span>{expense.category}</span>
                <span>•</span>
                <span>{expense.date?.split('T')[0]}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="font-bold text-orange-600">฿{expense.amount_thb?.toLocaleString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleView(expense)} className="px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg text-sm">ดู</button>
                  <button onClick={() => handleEdit(expense)} className="px-3 py-1.5 text-orange-600 bg-orange-50 rounded-lg text-sm">แก้ไข</button>
                  <button onClick={() => handleDelete(expense.id)} className="px-3 py-1.5 text-red-600 bg-red-50 rounded-lg text-sm">ลบ</button>
                </div>
              </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div className="p-8 text-center text-gray-500">ไม่พบรายการค่าใช้จ่าย</div>
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={isViewMode ? 'รายละเอียด' : editingExpense ? 'แก้ไข' : 'เพิ่มรายการค่าใช้จ่าย'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              {isViewMode ? 'ปิด' : 'ยกเลิก'}
            </Button>
            {!isViewMode && <Button onClick={handleSave}>{editingExpense ? 'บันทึก' : 'เพิ่มรายการ'}</Button>}
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="รายการค่าใช้จ่าย"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isViewMode}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="ประเภท"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
              disabled={isViewMode}
            />
            <Input
              label="จำนวน (THB)"
              type="number"
              value={formData.amount_thb}
              onChange={(e) => setFormData({ ...formData, amount_thb: parseFloat(e.target.value) || 0 })}
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ผู้ขาย/ผู้จัด"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              disabled={isViewMode}
            />
            <Input
              label="วันที่"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="สถานะ"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Expense['status'] })}
              disabled={isViewMode}
            />
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                disabled={isViewMode}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="is_recurring" className="text-sm text-gray-700">รายการซ้ำ</label>
            </div>
          </div>

          <TextArea
            label="หมายเหตุ"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={isViewMode}
            rows={2}
          />
        </div>
      </Modal>
    </div>
  );
}
