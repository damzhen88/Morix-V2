'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Send, CheckCircle, Package, Truck, Globe, 
  Delete, Plus, Info, ChevronRight, ChevronLeft,
  CreditCard, Factory, PlaneTakeoff, Warehouse, X
} from 'lucide-react';

// ============================================================
// MOBILE PURCHASE ORDER FORM - MORIX V2
// Card-based layout for mobile devices
// ============================================================

interface LineItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
}

interface MobilePurchaseOrderProps {
  initialVendor?: string;
  initialItems?: LineItem[];
}

export default function MobilePurchaseOrder({ 
  initialVendor = '',
  initialItems = [
    { id: 1, name: 'Ultra-Slim Aluminum Chassis', sku: 'CH-AS-092', quantity: 150, unit_price: 45.00 },
    { id: 2, name: 'Glass Fiber PCB Panel', sku: 'PCB-GF-44', quantity: 300, unit_price: 12.50 },
  ]
}: MobilePurchaseOrderProps) {
  const [step, setStep] = useState<'info' | 'items' | 'logistics' | 'summary'>('info');
  const [vendor, setVendor] = useState(initialVendor);
  const [exchangeRate, setExchangeRate] = useState('35.42');
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [notes, setNotes] = useState('');
  const [logistics, setLogistics] = useState({
    chinaDomestic: { amount: '', currency: 'CNY' },
    chinaThailand: { amount: '', currency: 'USD' },
    localDelivery: { amount: '', currency: 'THB' },
  });
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  // Calculations
  const RATE = parseFloat(exchangeRate) || 35.42;
  const itemsSubtotalUSD = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const itemsSubtotalTHB = itemsSubtotalUSD * RATE;
  
  const logisticsTotalTHB = [
    logistics.chinaDomestic,
    logistics.chinaThailand,
    logistics.localDelivery
  ].reduce((sum, log) => {
    const amount = parseFloat(log.amount) || 0;
    if (log.currency === 'CNY') return sum + amount * (RATE / 7.2);
    if (log.currency === 'USD') return sum + amount * RATE;
    return sum + amount;
  }, 0);

  const logisticsTotalUSD = [
    logistics.chinaDomestic,
    logistics.chinaThailand,
    logistics.localDelivery
  ].reduce((sum, log) => {
    const amount = parseFloat(log.amount) || 0;
    if (log.currency === 'CNY') return sum + amount / 7.2;
    if (log.currency === 'USD') return sum + amount;
    return sum + amount / RATE;
  }, 0);

  const tax = itemsSubtotalTHB * 0.07;
  const grandTotalTHB = itemsSubtotalTHB + logisticsTotalTHB + tax;
  const grandTotalUSD = itemsSubtotalUSD + logisticsTotalUSD + tax / RATE;

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

  const vendors = [
    'Global Logistics Pro',
    'Shenzhen Tech Supplies',
    'Bangkok Hardware Co.',
    'Pacific Trade Co.',
  ];

  // Step indicator
  const steps = [
    { key: 'info', label: 'ข้อมูล', icon: Factory },
    { key: 'items', label: 'รายการ', icon: Package },
    { key: 'logistics', label: 'ขนส่ง', icon: Truck },
    { key: 'summary', label: 'สรุป', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const goNext = () => {
    const idx = currentStepIndex;
    if (idx < steps.length - 1) {
      setStep(steps[idx + 1].key as typeof step);
    }
  };

  const goBack = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setStep(steps[idx - 1].key as typeof step);
    }
  };

  const handleSave = () => {
    alert(`บันทึก PO สำเร็จ!\n\nผู้จัดจำหน่าย: ${vendor}\nจำนวนรายการ: ${items.length}\nรวมทั้งสิ้น: ฿${grandTotalTHB.toLocaleString('th-TH')}`);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-stone-200 z-20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'info' ? (
              <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-stone-100">
                <ChevronLeft className="w-5 h-5 text-stone-600" />
              </button>
            ) : (
              <div className="w-10" />
            )}
            <div>
              <h1 className="text-lg font-black text-stone-900">Purchase Order</h1>
              <p className="text-xs text-stone-400">#PO-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20"
          >
            บันทึก
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mt-4 px-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = s.key === step;
            const isCompleted = idx < currentStepIndex;
            return (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30' :
                    'bg-stone-100 text-stone-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-stone-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        
        {/* STEP 1: Vendor Info */}
        {step === 'info' && (
          <>
            {/* Vendor Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
                <Factory className="w-4 h-4" />
                ผู้จัดจำหน่าย
              </label>
              
              <div className="relative">
                <button
                  onClick={() => setShowVendorDropdown(!showVendorDropdown)}
                  className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-left font-medium text-stone-900 flex items-center justify-between"
                >
                  {vendor || 'เลือกผู้จัดจำหน่าย...'}
                  <ChevronRight className="w-4 h-4 text-stone-400 rotate-90" />
                </button>
                
                {showVendorDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-xl z-30 overflow-hidden">
                    {vendors.map(v => (
                      <button
                        key={v}
                        onClick={() => { setVendor(v); setShowVendorDropdown(false); }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-stone-900 hover:bg-amber-50 border-b border-stone-100 last:border-b-0"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Exchange Rate Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4" />
                อัตราแลกเปลี่ยน (THB/USD)
              </label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-lg font-bold text-stone-900 text-center"
              />
              <p className="text-xs text-stone-400 mt-2 text-center">ใช้สำหรับคำนวณราคา THB จาก USD</p>
            </div>
          </>
        )}

        {/* STEP 2: Items */}
        {step === 'items' && (
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
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Item Name */}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="ชื่อสินค้า"
                    className="w-full h-11 bg-stone-50 border border-stone-200 rounded-xl px-4 text-sm font-medium text-stone-900 mb-2"
                  />
                  
                  {/* SKU */}
                  <input
                    type="text"
                    value={item.sku}
                    onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                    placeholder="SKU"
                    className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl px-4 text-xs font-mono text-stone-500 mb-2"
                  />
                  
                  {/* Qty & Price */}
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
                      <label className="text-[10px] font-bold text-stone-400 uppercase">ราคา/ชิ้น ($)</label>
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
                    <span className="text-sm font-bold text-stone-900">
                      ${(item.quantity * item.unit_price).toFixed(2)} ≈ ฿{(item.quantity * item.unit_price * RATE).toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item Button */}
            <button
              onClick={addItem}
              className="w-full h-12 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl text-sm font-bold text-amber-600 flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการ
            </button>
          </>
        )}

        {/* STEP 3: Logistics */}
        {step === 'logistics' && (
          <>
            {/* China Domestic */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <PlaneTakeoff className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">China Domestic Freight</p>
                  <p className="text-xs text-stone-400">ขนส่งในประเทศจีน (CNY)</p>
                </div>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={logistics.chinaDomestic.amount}
                onChange={(e) => setLogistics({...logistics, chinaDomestic: {...logistics.chinaDomestic, amount: e.target.value}})}
                className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-lg font-semibold text-stone-900"
              />
            </div>

            {/* China to Thailand */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">China → Thailand Freight</p>
                  <p className="text-xs text-stone-400">ขนส่งข้ามพรมแดน (USD)</p>
                </div>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={logistics.chinaThailand.amount}
                onChange={(e) => setLogistics({...logistics, chinaThailand: {...logistics.chinaThailand, amount: e.target.value}})}
                className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-lg font-semibold text-stone-900"
              />
            </div>

            {/* Local Delivery */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">Local Delivery</p>
                  <p className="text-xs text-stone-400">ขนส่งในประเทศไทย (THB)</p>
                </div>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={logistics.localDelivery.amount}
                onChange={(e) => setLogistics({...logistics, localDelivery: {...logistics.localDelivery, amount: e.target.value}})}
                className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-lg font-semibold text-stone-900"
              />
            </div>
          </>
        )}

        {/* STEP 4: Summary */}
        {step === 'summary' && (
          <>
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-5 text-white shadow-xl">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">สรุปคำสั่งซื้อ</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">ผู้จัดจำหน่าย</span>
                  <span className="font-semibold">{vendor || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">จำนวนรายการ</span>
                  <span className="font-semibold">{items.length} รายการ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">ราคาสินค้า (USD)</span>
                  <span className="font-semibold">${itemsSubtotalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">ค่าขนส่ง (THB)</span>
                  <span className="font-semibold">฿{logisticsTotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">ภาษี 7%</span>
                  <span className="font-semibold">฿{tax.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
                </div>
                
                <div className="border-t border-stone-700 pt-3 flex justify-between items-baseline">
                  <span className="text-stone-300 font-semibold">รวมทั้งสิ้น (THB)</span>
                  <span className="text-2xl font-black text-amber-400">
                    ฿{grandTotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Preview */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 mb-3">รายการสินค้า</h3>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-stone-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{item.name || '(ไม่ระบุชื่อ)'}</p>
                      <p className="text-xs text-stone-400">{item.quantity} × ${item.unit_price}</p>
                    </div>
                    <span className="text-sm font-semibold text-stone-900">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-20">
        <div className="flex gap-3">
          {step !== 'summary' ? (
            <>
              <button
                onClick={goBack}
                className="flex-1 h-12 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600"
              >
                กลับ
              </button>
              <button
                onClick={goNext}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20"
              >
                ต่อไป
              </button>
            </>
          ) : (
            <>
              <button
                onClick={goBack}
                className="flex-1 h-12 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600"
              >
                แก้ไข
              </button>
              <button
                onClick={handleSave}
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                ยืนยัน PO
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
