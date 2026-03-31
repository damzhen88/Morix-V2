'use client';

import { useState } from 'react';
import { 
  Save, Send, CheckCircle, Package, Truck, Globe, 
  Delete, Plus, ChevronRight, ChevronLeft,
  CreditCard, Factory, PlaneTakeoff, Warehouse, X, Info
} from 'lucide-react';

// ============================================================
// MOBILE PURCHASE ORDER - FULL FEATURES LIKE DESKTOP
// Morix V2 - All features included
// ============================================================

interface LineItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
}

interface LogisticsCost {
  amount: string;
  currency: 'CNY' | 'USD' | 'THB';
}

interface VendorForm {
  name: string;
  email: string;
  phone: string;
}

export default function MobilePurchaseOrder() {
  const poNumber = `PO-${Date.now().toString().slice(-6)}`;
  
  // PO Status workflow
  type POStatus = 'draft' | 'confirmed' | 'received';
  const [poStatus, setPoStatus] = useState<POStatus>('draft');
  
  // Step for the wizard
  type WizardStep = 'vendor' | 'items' | 'logistics' | 'notes' | 'summary';
  const [currentStep, setCurrentStep] = useState<WizardStep>('vendor');
  const steps: WizardStep[] = ['vendor', 'items', 'logistics', 'notes', 'summary'];
  
  // Vendor state
  const [vendor, setVendor] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showNewVendorForm, setShowNewVendorForm] = useState(false);
  const [newVendor, setNewVendor] = useState<VendorForm>({ name: '', email: '', phone: '' });
  
  // Currency state
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'CNY' | 'THB'>('USD');
  const [exchangeRate, setExchangeRate] = useState('35.42');
  
  // Items state
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, name: 'Ultra-Slim Aluminum Chassis', sku: 'CH-AS-092', quantity: 150, unit_price: 45.00 },
    { id: 2, name: 'Glass Fiber PCB Panel', sku: 'PCB-GF-44', quantity: 300, unit_price: 12.50 },
  ]);
  
  // Logistics state
  const [logistics, setLogistics] = useState<Record<string, LogisticsCost>>({
    chinaDomestic: { amount: '', currency: 'CNY' },
    chinaThailand: { amount: '', currency: 'USD' },
    localDelivery: { amount: '', currency: 'THB' },
  });
  
  // Notes state
  const [notes, setNotes] = useState('');

  // Vendor list
  const vendors = [
    'Global Logistics Pro',
    'Shenzhen Tech Supplies',
    'Bangkok Hardware Co.',
    'Pacific Trade Co.',
    'China Direct Import Co.',
  ];

  // Calculations
  const RATE = parseFloat(exchangeRate) || 35.42;
  const CNY_RATE = RATE / 7.2;

  const itemsSubtotalUSD = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const itemsSubtotalTHB = itemsSubtotalUSD * RATE;

  const calculateLogisticsTHB = () => {
    let total = 0;
    Object.values(logistics).forEach(log => {
      const amount = parseFloat(log.amount) || 0;
      if (log.currency === 'CNY') total += amount * CNY_RATE;
      else if (log.currency === 'USD') total += amount * RATE;
      else total += amount;
    });
    return total;
  };
  const logisticsTotalTHB = calculateLogisticsTHB();

  const tax = itemsSubtotalTHB * 0.07;
  const grandTotalTHB = itemsSubtotalTHB + logisticsTotalTHB + tax;
  const grandTotalUSD = grandTotalTHB / RATE;

  // Item functions
  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, name: '', sku: '', quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: field === 'name' || field === 'sku' ? value : Number(value) || 0 } : item
    ));
  };

  const deleteItem = (id: number) => {
    if (items.length <= 1) {
      alert('ต้องมีรายการอย่างน้อย 1 รายการ');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  // Navigation
  const goNext = () => {
    const idx = steps.indexOf(currentStep);
    if (idx < steps.length - 1) {
      setCurrentStep(steps[idx + 1]);
    }
  };

  const goBack = () => {
    const idx = steps.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(steps[idx - 1]);
    }
  };

  const canProceed = () => {
    if (currentStep === 'vendor' && !vendor) {
      alert('กรุณาเลือกผู้จัดจำหน่าย');
      return false;
    }
    if (currentStep === 'items' && items.length === 0) {
      alert('กรุณาเพิ่มอย่างน้อย 1 รายการ');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (canProceed()) {
      goNext();
    }
  };

  // Actions
  const handleSaveDraft = () => {
    setPoStatus('draft');
    alert(`บันทึกฉบับร่างสำเร็จ!\n\nเลขที่ PO: ${poNumber}\nผู้จัดจำหน่าย: ${vendor}\nจำนวนรายการ: ${items.length}\nรวมทั้งสิ้น: ฿${grandTotalTHB.toLocaleString('th-TH')}`);
  };

  const handleConfirm = () => {
    if (!vendor) {
      alert('กรุณาเลือกผู้จัดจำหน่าย');
      return;
    }
    if (items.filter(i => i.name).length === 0) {
      alert('กรุณาเพิ่มอย่างน้อย 1 รายการ');
      return;
    }
    setPoStatus('confirmed');
    alert(`ยืนยันคำสั่งซื้อสำเร็จ!\n\nเลขที่ PO: ${poNumber}\nผู้จัดจำหน่าย: ${vendor}\nจำนวนรายการ: ${items.length}\nรวมทั้งสิ้น: ฿${grandTotalTHB.toLocaleString('th-TH')}`);
  };

  const handleAddNewVendor = () => {
    if (newVendor.name.trim()) {
      setVendor(newVendor.name.trim());
      setShowNewVendorForm(false);
      setNewVendor({ name: '', email: '', phone: '' });
    }
  };

  const stepLabels: Record<WizardStep, string> = {
    vendor: 'ผู้จัดจำหน่าย',
    items: 'รายการ',
    logistics: 'ขนส่ง',
    notes: 'หมายเหตุ',
    summary: 'สรุป',
  };

  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-900 pb-36">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-stone-200 z-20">
        {/* PO Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep !== 'vendor' ? (
              <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-stone-100 active:bg-stone-200">
                <ChevronLeft className="w-5 h-5 text-stone-600" />
              </button>
            ) : (
              <div className="w-10" />
            )}
            <div>
              <h1 className="text-lg font-black text-stone-900">{poNumber}</h1>
              <p className="text-xs text-stone-400">
                {poStatus === 'draft' ? 'ฉบับร่าง' : poStatus === 'confirmed' ? 'ยืนยันแล้ว' : 'รับของแล้ว'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-white border border-stone-200 text-stone-700 text-sm font-semibold rounded-xl"
          >
            บันทึก
          </button>
        </div>

        {/* Workflow Steps */}
        <div className="px-4 pb-3 flex items-center gap-1">
          {(['draft', 'confirmed', 'received'] as POStatus[]).map((status, idx) => {
            const isActive = status === poStatus;
            const isPast = (['draft', 'confirmed', 'received'].indexOf(poStatus) > idx);
            return (
              <div key={status} className="flex items-center flex-1">
                <div className={`flex flex-col items-center flex-1`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isPast ? 'bg-green-500 text-white' :
                    isActive ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' :
                    'bg-stone-100 text-stone-400'
                  }`}>
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[9px] font-medium mt-1 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}>
                    {status === 'draft' ? 'ฉบับร่าง' : status === 'confirmed' ? 'ยืนยัน' : 'รับของ'}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`h-0.5 flex-1 mx-1 ${isPast ? 'bg-green-500' : 'bg-stone-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Wizard Steps */}
        <div className="flex px-4 pb-3 gap-1 overflow-x-auto">
          {steps.map((step) => {
            const isActive = step === currentStep;
            const isCompleted = steps.indexOf(step) < currentStepIndex;
            return (
              <button
                key={step}
                onClick={() => {
                  const idx = steps.indexOf(step);
                  if (idx <= currentStepIndex || (step === 'vendor' || canProceed())) {
                    setCurrentStep(step);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                  isCompleted ? 'bg-amber-100 text-amber-700' :
                  'bg-stone-100 text-stone-500'
                }`}
              >
                {stepLabels[step]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        
        {/* STEP: Vendor */}
        {currentStep === 'vendor' && (
          <>
            {/* Vendor Selection */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
                <Factory className="w-4 h-4" />
                ผู้จัดจำหน่าย
              </label>
              
              <div className="relative">
                <button
                  onClick={() => { setShowVendorDropdown(!showVendorDropdown); setShowNewVendorForm(false); }}
                  className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-left font-medium text-stone-900 flex items-center justify-between"
                >
                  {vendor || 'เลือกผู้จัดจำหน่าย...'}
                  <ChevronRight className="w-4 h-4 text-stone-400 rotate-90" />
                </button>
                
                {showVendorDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowVendorDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      {vendors.map(v => (
                        <button
                          key={v}
                          onClick={() => { setVendor(v); setShowVendorDropdown(false); }}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-stone-900 hover:bg-amber-50 border-b border-stone-100 last:border-b-0"
                        >
                          {v}
                        </button>
                      ))}
                      <button
                        onClick={() => { setShowVendorDropdown(false); setShowNewVendorForm(true); }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 border-t border-amber-200"
                      >
                        + เพิ่มผู้จัดจำหน่ายใหม่
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* New Vendor Form */}
            {showNewVendorForm && (
              <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 shadow-sm">
                <label className="text-xs font-bold text-orange-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Factory className="w-4 h-4" />
                  ผู้จัดจำหน่ายใหม่
                </label>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="ชื่อผู้จัดจำหน่าย..."
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                    className="w-full h-11 bg-white border border-orange-200 rounded-xl px-4 text-sm text-stone-900"
                  />
                  <input
                    type="email"
                    placeholder="อีเมลติดต่อ (optional)..."
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                    className="w-full h-11 bg-white border border-orange-200 rounded-xl px-4 text-sm text-stone-900"
                  />
                  <input
                    type="tel"
                    placeholder="เบอร์โทรศัพท์ (optional)..."
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                    className="w-full h-11 bg-white border border-orange-200 rounded-xl px-4 text-sm text-stone-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddNewVendor}
                      className="flex-1 h-10 bg-orange-500 text-white text-xs font-bold rounded-lg"
                    >
                      เพิ่ม
                    </button>
                    <button
                      onClick={() => { setShowNewVendorForm(false); setNewVendor({ name: '', email: '', phone: '' }); }}
                      className="px-4 h-10 bg-stone-100 text-stone-600 text-xs font-bold rounded-lg"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Currency Selection */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4" />
                สกุลเงินสินค้านำเข้า
              </label>
              <div className="flex bg-stone-100 rounded-xl p-1.5">
                {(['USD', 'CNY', 'THB'] as const).map((curr) => (
                  <button 
                    key={curr}
                    onClick={() => setActiveCurrency(curr)}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${
                      activeCurrency === curr 
                        ? 'bg-white text-orange-600 shadow-sm' 
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4" />
                อัตราแลกเปลี่ยน (THB)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-500">1 {activeCurrency} =</span>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="flex-1 h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-lg font-bold text-stone-900 text-center"
                />
                <span className="text-sm font-bold text-stone-500">THB</span>
              </div>
            </div>
          </>
        )}

        {/* STEP: Items */}
        {currentStep === 'items' && (
          <>
            {/* Items List */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-400">#{idx + 1}</span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="ชื่อสินค้า"
                    className="w-full h-11 bg-stone-50 border border-stone-200 rounded-xl px-4 text-sm font-medium text-stone-900 mb-2"
                  />
                  
                  <input
                    type="text"
                    value={item.sku}
                    onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                    placeholder="SKU"
                    className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl px-4 text-xs font-mono text-stone-500 mb-2"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase">จำนวน</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        className="w-full h-11 bg-stone-50 border border-stone-200 rounded-xl px-3 text-sm font-semibold text-stone-900 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase">ราคา/หน่วย ({activeCurrency})</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                        className="w-full h-11 bg-stone-50 border border-stone-200 rounded-xl px-3 text-sm font-semibold text-stone-900 text-center"
                      />
                    </div>
                  </div>
                  
                  {/* Subtotal */}
                  <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between items-center">
                    <span className="text-xs text-stone-400">รวม</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-stone-900">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </span>
                      <span className="text-xs text-stone-400 ml-2">
                        ≈ ฿{(item.quantity * item.unit_price * RATE).toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="w-full h-12 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl text-sm font-bold text-amber-600 flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการ
            </button>
          </>
        )}

        {/* STEP: Logistics */}
        {currentStep === 'logistics' && (
          <>
            {/* China Domestic */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-stone-900">China Domestic</p>
                  <p className="text-xs text-stone-400">ขนส่งในประเทศจีน</p>
                </div>
                <select
                  value={logistics.chinaDomestic.currency}
                  onChange={(e) => setLogistics({...logistics, chinaDomestic: {...logistics.chinaDomestic, currency: e.target.value as any}})}
                  className="h-8 bg-stone-50 border border-stone-200 rounded-lg px-2 text-xs font-medium"
                >
                  <option value="CNY">CNY</option>
                  <option value="USD">USD</option>
                  <option value="THB">THB</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={logistics.chinaDomestic.amount}
                onChange={(e) => setLogistics({...logistics, chinaDomestic: {...logistics.chinaDomestic, amount: e.target.value}})}
                className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-lg font-semibold text-stone-900"
              />
            </div>

            {/* China-Thailand */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <PlaneTakeoff className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-stone-900">China - Thailand</p>
                  <p className="text-xs text-stone-400">ขนส่งข้ามพรมแดน</p>
                </div>
                <select
                  value={logistics.chinaThailand.currency}
                  onChange={(e) => setLogistics({...logistics, chinaThailand: {...logistics.chinaThailand, currency: e.target.value as any}})}
                  className="h-8 bg-white border-2 border-dashed border-stone-200 rounded-lg px-2 text-xs font-medium"
                >
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                  <option value="THB">THB</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={logistics.chinaThailand.amount}
                onChange={(e) => setLogistics({...logistics, chinaThailand: {...logistics.chinaThailand, amount: e.target.value}})}
                className="w-full h-12 bg-white border-2 border-dashed border-stone-200 rounded-xl px-4 text-lg font-semibold text-stone-900"
              />
            </div>

            {/* Local Delivery */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Warehouse className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-stone-900">Local Delivery</p>
                  <p className="text-xs text-stone-400">ขนส่งในประเทศไทย</p>
                </div>
                <select
                  value={logistics.localDelivery.currency}
                  onChange={(e) => setLogistics({...logistics, localDelivery: {...logistics.localDelivery, currency: e.target.value as any}})}
                  className="h-8 bg-stone-50 border border-stone-200 rounded-lg px-2 text-xs font-medium"
                >
                  <option value="THB">THB</option>
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={logistics.localDelivery.amount}
                onChange={(e) => setLogistics({...logistics, localDelivery: {...logistics.localDelivery, amount: e.target.value}})}
                className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-lg font-semibold text-stone-900"
              />
            </div>

            {/* Logistics Total */}
            <div className="bg-stone-100 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-stone-600">รวมค่าขนส่ง</span>
                <span className="text-lg font-bold text-stone-900">
                  ฿{logisticsTotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </>
        )}

        {/* STEP: Notes */}
        {currentStep === 'notes' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
              <Info className="w-4 h-4" />
              หมายเหตุภายใน
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุข้อกำหนดบรรจุภัณฑ์, มาตรฐานควบคุมคุณภาพ, หรือคำแนะนำการจัดส่ง..."
              rows={5}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-900 leading-relaxed resize-none placeholder:text-stone-400"
            />
            
            <div className="mt-4 bg-amber-50 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-xs font-medium text-amber-800 leading-relaxed">
                  ราคาคำนวณตามอัตราแลกเปลี่ยนปัจจุบัน การชำระเงินสุทธิจะเกิดขึ้นเมื่อรับสินค้าเข้าคลังแล้ว
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Summary */}
        {currentStep === 'summary' && (
          <>
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">สรุปคำสั่งซื้อ</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">ผู้จัดจำหน่าย</span>
                  <span className="font-semibold">{vendor || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">จำนวนรายการ</span>
                  <span className="font-semibold">{items.length} รายการ</span>
                </div>
                
                <div className="border-t border-stone-700 pt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">ราคาสินค้า</span>
                    <div className="text-right">
                      <span className="text-stone-300 mr-2">USD</span>
                      <span>${itemsSubtotalUSD.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">ราคาสินค้า (THB)</span>
                    <span className="text-orange-400">฿{itemsSubtotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">ค่าขนส่ง</span>
                    <span className="text-orange-400">฿{logisticsTotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">ภาษี 7%</span>
                    <span className="text-orange-400">฿{tax.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
                
                <div className="border-t border-stone-700 pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-stone-300 font-semibold">รวมทั้งสิ้น (THB)</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-400">
                        ฿{grandTotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="block text-xs text-stone-400 mt-1">
                        ≈ $ {grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Preview */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 mb-3">รายการสินค้า</h3>
              <div className="space-y-2">
                {items.filter(i => i.name).map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-stone-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{item.name}</p>
                      <p className="text-xs text-stone-400">{item.quantity} × ${item.unit_price}</p>
                    </div>
                    <span className="text-sm font-semibold text-stone-900">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </span>
                  </div>
                ))}
                {items.filter(i => i.name).length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-2">ยังไม่มีรายการสินค้า</p>
                )}
              </div>
            </div>

            {/* Notes Preview */}
            {notes && (
              <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-stone-900 mb-2">หมายเหตุ</h3>
                <p className="text-sm text-stone-600">{notes}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-20">
        {currentStep === 'summary' ? (
          <div className="space-y-2">
            <button
              onClick={handleConfirm}
              className="w-full h-12 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              ยืนยันคำสั่งซื้อ
            </button>
            <button
              onClick={handleSaveDraft}
              className="w-full h-11 bg-white border-2 border-stone-200 text-stone-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              บันทึกฉบับร่าง
            </button>
          </div>
        ) : (
          <button
            onClick={handleNext}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20"
          >
            ต่อไป
          </button>
        )}
      </div>
    </div>
  );
}
