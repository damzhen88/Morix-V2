// CRM Page for MORIX CRM v2

'use client';

import { useState } from 'react';
import { useApp } from '@/store';
import { Card, Button, Input, Badge, Modal, EmptyState, PageLoader } from '@/components/ui';
import { formatCurrency, generateId, getDealStageLabel, getCustomerTypeColor } from '@/lib/utils';
import { CRNDeal, DealStage, CustomerType } from '@/types';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Phone, Mail, MessageSquare, ArrowRight, DollarSign, Users, Calendar } from 'lucide-react';

const stageColumns: { id: DealStage; label: string; color: string }[] = [
  { id: 'inquiry', label: 'สอบถาม', color: 'bg-gray-50 border-gray-200' },
  { id: 'quoted', label: 'เสนอราคา', color: 'bg-blue-50 border-blue-200' },
  { id: 'paid', label: 'ชำระเงิน', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'shipped', label: 'จัดส่งแล้ว', color: 'bg-green-50 border-green-200' },
];

export default function CRMPage() {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<CRNDeal | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_type: 'contractor' as CustomerType,
    contact_phone: '',
    contact_email: '',
    deal_value: 0,
    stage: 'inquiry' as DealStage,
    notes: '',
  });

  const handleSave = async () => {
    // Validate required fields
    if (!formData.customer_name.trim()) {
      alert('กรุณากรอกชื่อลูกค้า');
      return;
    }

    setIsSaving(true);
    
    const now = new Date().toISOString();
    
    const deal: CRNDeal = {
      id: editingDeal?.id || uuidv4(),
      lead_id: editingDeal?.lead_id || `LEAD-${Date.now().toString().slice(-4)}`,
      customer_name: formData.customer_name,
      customer_type: formData.customer_type,
      contact_phone: formData.contact_phone,
      contact_email: formData.contact_email,
      deal_value: formData.deal_value,
      stage: formData.stage,
      notes: formData.notes,
      created_at: editingDeal?.created_at || now,
      updated_at: now,
      last_interaction_at: now,
    };

    // SAVE TO SUPABASE
    try {
      const dealData = {
        lead_id: deal.lead_id,
        title: deal.customer_name,
        contact_name: deal.customer_name,
        contact_phone: deal.contact_phone || null,
        contact_email: deal.contact_email || null,
        customer_type: deal.customer_type,
        expected_value_thb: deal.deal_value,
        stage: deal.stage,
        notes: deal.notes || null,
        probability: 10,
      };

      if (editingDeal) {
        const { error } = await supabase
          .from('crm_deals')
          .update(dealData)
          .eq('id', deal.id);
        
        if (error) {
          console.error('Supabase update error:', error);
          // Continue with local state anyway
        }
      } else {
        const { error } = await supabase
          .from('crm_deals')
          .insert({ ...dealData, id: deal.id, created_at: deal.created_at });
        
        if (error) {
          console.error('Supabase insert error:', error);
          // Continue with local state anyway
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      // Continue with local state
    }

    if (editingDeal) {
      dispatch({ type: 'UPDATE_CRM_DEAL', payload: deal });
    } else {
      dispatch({ type: 'ADD_CRM_DEAL', payload: deal });
    }

    setIsSaving(false);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingDeal(null);
    setIsViewMode(false);
    setIsSaving(false);
    setFormData({
      customer_name: '',
      customer_type: 'contractor',
      contact_phone: '',
      contact_email: '',
      deal_value: 0,
      stage: 'inquiry',
      notes: '',
    });
  };

  const handleEdit = (deal: CRNDeal) => {
    setEditingDeal(deal);
    setIsViewMode(false);
    setFormData({
      customer_name: deal.customer_name || '',
      customer_type: (deal.customer_type as CustomerType) || 'contractor',
      contact_phone: deal.contact_phone || '',
      contact_email: deal.contact_email || '',
      deal_value: deal.deal_value || 0,
      stage: deal.stage || 'inquiry',
      notes: deal.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleView = (deal: CRNDeal) => {
    setEditingDeal(deal);
    setIsViewMode(true);
    setFormData({
      customer_name: deal.customer_name || '',
      customer_type: (deal.customer_type as CustomerType) || 'contractor',
      contact_phone: deal.contact_phone || '',
      contact_email: deal.contact_email || '',
      deal_value: deal.deal_value || 0,
      stage: deal.stage || 'inquiry',
      notes: deal.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (dealId: string) => {
    if (!dealId) return;
    
    if (!confirm('คุณแน่ใจที่จะลบดีลนี้หรือไม่?')) {
      return;
    }
    
    // Try to delete from Supabase
    try {
      await supabase.from('crm_deals').delete().eq('id', dealId);
    } catch (err) {
      console.error('Delete error:', err);
    }
    
    // Delete from local state
    dispatch({ type: 'DELETE_CRM_DEAL', payload: dealId });
    alert('ลบสำเร็จ!');
  };

  const moveToStage = (deal: CRNDeal, newStage: DealStage) => {
    dispatch({
      type: 'UPDATE_CRM_DEAL',
      payload: { ...deal, stage: newStage, updated_at: new Date().toISOString() },
    });
  };

  if (state.isLoading) {
    return <PageLoader />;
  }

  // Calculate totals
  const totalPipeline = state.crmDeals.reduce((sum, d) => sum + d.deal_value, 0);
  const dealsByStage = stageColumns.reduce((acc, col) => {
    acc[col.id] = state.crmDeals.filter(d => d.stage === col.id).length;
    return acc;
  }, {} as Record<DealStage, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ลูกค้า (CRM)</h1>
          <p className="text-gray-500 mt-1">จัดการไพล์น์และโอกาสทางธุรกิจ</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มลูกค้าใหม่
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">มูลค่าไพล์น์ทั้งหมด</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPipeline)}</p>
          </div>
        </Card>
        {stageColumns.map(col => (
          <Card key={col.id} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${col.color.replace('bg-', 'bg-').replace(' border-', '/20 ')} flex items-center justify-center`}>
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{col.label}</p>
              <p className="text-xl font-bold text-gray-900">{dealsByStage[col.id]}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stageColumns.map(column => {
          const columnDeals = state.crmDeals.filter(d => d.stage === column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`p-3 rounded-t-2xl ${column.color} border-b`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{column.label}</h3>
                  <Badge>{columnDeals.length}</Badge>
                </div>
              </div>
              
              {/* Deals */}
              <div className="flex-1 bg-gray-50 rounded-b-2xl p-2 space-y-2 min-h-[200px]">
                {columnDeals.map(deal => (
                  <div 
                    key={deal.id}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleView(deal)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-400">{deal.lead_id}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(deal); }}
                        className="text-gray-400 hover:text-orange-500"
                      >
                        ✏️
                      </button>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">{deal.customer_name}</h4>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCustomerTypeColor(deal.customer_type)}>
                        {deal.customer_type === 'contractor' ? 'ผู้รับเหมา' :
                         deal.customer_type === 'project' ? 'โครงการ' :
                         deal.customer_type === 'dealer' ? 'ตัวแทน' : 'เจ้าของบ้าน'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-600">{formatCurrency(deal.deal_value)}</span>
                    </div>

                    {/* Move to next stage */}
                    {column.id !== 'shipped' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextStage = column.id === 'inquiry' ? 'quoted' : 
                                           column.id === 'quoted' ? 'paid' : 'shipped';
                          moveToStage(deal, nextStage);
                        }}
                        className="mt-2 w-full py-1.5 text-xs text-orange-600 hover:bg-orange-50 rounded-lg flex items-center justify-center gap-1"
                      >
                        ไป {stageColumns.find(s => s.id === (column.id === 'inquiry' ? 'quoted' : column.id === 'quoted' ? 'paid' : 'shipped'))?.label}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                {columnDeals.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                    ไม่มีดีล
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={isViewMode ? 'รายละเอียดลูกค้า' : editingDeal ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}
        size="md"
        footer={
          <div className="flex justify-between">
            <Button 
              variant="danger" 
              onClick={() => { handleDelete(editingDeal?.id || ''); setIsModalOpen(false); }}
              className={!editingDeal ? 'hidden' : ''}
            >
              ลบ
            </Button>
            <div className="flex gap-3 ml-auto">
              <Button variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                {isViewMode ? 'ปิด' : 'ยกเลิก'}
              </Button>
              {!isViewMode && <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'กำลังบันทึก...' : (editingDeal ? 'บันทึก' : 'เพิ่มลูกค้า')}
              </Button>}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="ชื่อลูกค้า"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            disabled={isViewMode}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทลูกค้า</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                value={formData.customer_type}
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as CustomerType })}
                disabled={isViewMode}
              >
                <option value="contractor">ผู้รับเหมา</option>
                <option value="homeowner">เจ้าของบ้าน</option>
                <option value="dealer">ตัวแทนจำหน่าย</option>
                <option value="project">โครงการ</option>
              </select>
            </div>
            <Input
              label="มูลค่าดีล"
              type="number"
              value={formData.deal_value}
              onChange={(e) => setFormData({ ...formData, deal_value: parseFloat(e.target.value) || 0 })}
              disabled={isViewMode}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="เบอร์โทรศัพท์"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              disabled={isViewMode}
            />
            <Input
              label="อีเมล"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              disabled={isViewMode}
            />
          </div>

          {!isViewMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะ</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
              >
                {stageColumns.map(col => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">หมายเหตุ</label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isViewMode}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
