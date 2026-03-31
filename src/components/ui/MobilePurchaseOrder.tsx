'use client';

import { useState } from 'react';
import { 
  Save, Send, Package, Truck, Globe, 
  Delete, Plus, ChevronDown, ChevronUp,
  CreditCard, Factory, PlaneTakeoff, Warehouse, X, Info
} from 'lucide-react';

// ============================================================
// MOBILE PURCHASE ORDER - ALL IN ONE PAGE LIKE DESKTOP
// Morix V2 - No wizard, full scrollable form
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

export default function MobilePurchaseOrder() {
  const poNumber = `PO-${Date.now().toString().slice(-6)}`;
  
  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    vendor: true,
    items: true,
    logistics: true,
    notes: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Vendor state
  const [vendor, setVendor] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');

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

  // PO Status
  type POStatus = 'draft' | 'confirmed' | 'received';
  const [poStatus, setPoStatus] = useState<POStatus>('draft');

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
  const logisticsTotalUSD = logisticsTotalTHB / RATE;

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

  const handleAddNewVendor = () => {
    if (newVendorName.trim()) {
      setVendor(newVendorName.trim());
      setShowNewVendor(false);
      setNewVendorName('');
      setNewVendorEmail('');
      setNewVendorPhone('');
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
      alert('กรุณาเพิ่มอย่างน้อย 1 รายการสินค้า');
      return;
    }
    setPoStatus('confirmed');
    alert(`ยืนยันคำสั่งซื้อสำเร็จ!\n\nเลขที่ PO: ${poNumber}\nผู้จัดจำหน่าย: ${vendor}\nจำนวนรายการ: ${items.length}\nรวมทั้งสิ้น: ฿${grandTotalTHB.toLocaleString('th-TH')}`);
  };

  // Section Header Component
  const SectionHeader = ({ title, icon: Icon, sectionKey, count }: { title: string; icon: any; sectionKey: string; count?: string }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 bg-white border-b border-stone-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-stone-900">{title}</span>
        {count && <span className="text-xs text-stone-400">({count})</span>}
      </div>
      {openSections[sectionKey] ? (
        <ChevronUp className="w-5 h-5 text-stone-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-stone-400" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fafaf8] text-stone-900 pb-48">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-stone-200 z-20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-stone-900">{poNumber}</h1>
            <p className="text-xs text-stone-400">
              {poStatus === 'draft' ? 'ฉบับร่าง' : poStatus === 'confirmed' ? 'ยืนยันแล้ว' : 'รับของแล้ว'}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSaveDraft}
              className="px-3 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>

      {/* PO Number & Date */}
      <div className="bg-white border-b border-stone-200 px-4 py-3">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">เลขที่ PO</span>
          <span className="font-semibold text-stone-900">{poNumber}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-stone-500">วันที่</span>
          <span className="font-semibold text-stone-900">{new Date().toLocaleDateString('th-TH')}</span>
        </div>
      </div>

      {/* ======================================== */}
      {/* SECTION 1: VENDOR */}
      {/* ======================================== */}
      <SectionHeader title="ผู้จัดจำหน่าย" icon={Factory} sectionKey="vendor" />
      {openSections.vendor && (
        <div className="bg-white p-4 space-y-4">
          {/* Vendor Selection */}
          <div>
            <label className="text-xs font-bold uppercase text-stone-400 mb-2 block">เลือกผู้จัดจำหน่าย</label>
            <div className="relative">
              <button
                onClick={() => setShowVendorDropdown(!showVendorDropdown)}
                className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-left font-medium text-stone-900 flex items-center justify-between"
              >
                {vendor || 'เลือกผู้จัดจำหน่าย...'}
                <ChevronDown className="w-4 h-4 text-stone-400" />
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
                      onClick={() => { setShowVendorDropdown(false); setShowNewVendor(true); }}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-amber-600 bg-amber-50 border-t border-amber-200"
                    >
                      + เพิ่มผู้จัดจำหน่ายใหม่
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* New Vendor Form */}
          {showNewVendor && (
            <div className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-200">
              <label className="text-xs font-bold uppercase text-orange-700">ผู้จัดจำหน่ายใหม่</label>
              <input
                type="text"
                placeholder="ชื่อผู้จัดจำหน่าย..."
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                className="w-full h-11 bg-white border border-orange-200 rounded-xl px-4 text-sm text-stone-900"
              />
              <input
                type="email"
                placeholder="อีเมล (optional)..."
                value={newVendorEmail}
                onChange={(e) => setNewVendorEmail(e.target.value)}
                className="w-full h-11 bg-white border border-orange-200 rounded-xl px-4 text-sm text-stone-900"
              />
              <input
                type="tel"
                placeholder="โทรศัพท์ (optional)..."
                value={newVendorPhone}
                onChange={(e) => setNewVendorPhone(e.target.value)}
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
                  onClick={() => setShowNewVendor(false)}
                  className="px-4 h-10 bg-stone-100 text-stone-600 text-xs font-bold rounded-lg"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Currency & Exchange Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-stone-400 mb-2 block">สกุลเงิน</label>
              <div className="flex bg-stone-100 rounded-xl p-1">
                {(['USD', 'CNY', 'THB'] as const).map(curr => (
                  <button
                    key={curr}
                    onClick={() => setActiveCurrency(curr)}
                    className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${
                      activeCurrency === curr ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-500'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-stone-400 mb-2 block">อัตราแลกเปลี่ยน</label>
              <div className="relative">
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl px-3 text-sm font-semibold text-stone-900 text-center pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">THB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* SECTION 2: ITEMS */}
      {/* ======================================== */}
      <SectionHeader title="รายการสินค้า" icon={Package} sectionKey="items" count={`${items.length} รายการ`} />
      {openSections.items && (
        <div className="bg-white p-4 space-y-3">
          {/* Items List */}
          {items.map((item, idx) => (
            <div key={item.id} className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-400">#{idx + 1}</span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  placeholder="ชื่อสินค้า"
                  className="w-full h-11 bg-white border border-stone-200 rounded-xl px-4 text-sm font-medium text-stone-900"
                />
                
                <input
                  type="text"
                  value={item.sku}
                  onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                  placeholder="SKU"
                  className="w-full h-10 bg-white border border-stone-200 rounded-xl px-4 text-xs font-mono text-stone-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">จำนวน</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      className="w-full h-11 bg-white border border-stone-200 rounded-xl px-3 text-sm font-semibold text-stone-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">ราคา/{activeCurrency}</label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                      className="w-full h-11 bg-white border border-stone-200 rounded-xl px-3 text-sm font-semibold text-stone-900 text-center"
                    />
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center pt-2 border-t border-stone-200 mt-2">
                  <span className="text-xs text-stone-500">รวม</span>
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
            </div>
          ))}

          {/* Add Item Button */}
          <button
            onClick={addItem}
            className="w-full h-12 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl text-sm font-bold text-amber-600 flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการสินค้า
          </button>
        </div>
      )}

      {/* ======================================== */}
      {/* SECTION 3: LOGISTICS */}
      {/* ======================================== */}
      <SectionHeader title="ค่าขนส่ง" icon={Truck} sectionKey="logistics" />
      {openSections.logistics && (
        <div className="bg-white p-4 space-y-3">
          {/* China Domestic */}
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
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
                className="h-8 bg-white border border-stone-200 rounded-lg px-2 text-xs font-medium"
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
              className="w-full h-12 bg-white border border-stone-200 rounded-xl px-4 text-lg font-semibold text-stone-900"
            />
          </div>

          {/* China-Thailand */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-dashed border-blue-200">
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
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
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
                className="h-8 bg-white border border-stone-200 rounded-lg px-2 text-xs font-medium"
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
              className="w-full h-12 bg-white border border-stone-200 rounded-xl px-4 text-lg font-semibold text-stone-900"
            />
          </div>

          {/* Logistics Total */}
          <div className="bg-stone-100 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-stone-600">รวมค่าขนส่ง</span>
              <span className="text-lg font-bold text-stone-900">
                ฿{logisticsTotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* SECTION 4: NOTES */}
      {/* ======================================== */}
      <SectionHeader title="หมายเหตุ" icon={Info} sectionKey="notes" />
      {openSections.notes && (
        <div className="bg-white p-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ระบุข้อกำหนดบรรจุภัณฑ์, มาตรฐานควบคุมคุณภาพ, หรือคำแนะนำการจัดส่ง..."
            rows={4}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-900 leading-relaxed resize-none placeholder:text-stone-400"
          />
        </div>
      )}

      {/* ======================================== */}
      {/* SUMMARY SECTION */}
      {/* ======================================== */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-t-3xl p-5 mt-4 text-white shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">สรุปคำสั่งซื้อ</h3>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-400">ราคาสินค้า (USD)</span>
            <span className="font-semibold">${itemsSubtotalUSD.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">ราคาสินค้า (THB)</span>
            <span className="font-semibold text-orange-400">฿{itemsSubtotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">ค่าขนส่ง</span>
            <span className="font-semibold text-orange-400">฿{logisticsTotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">ภาษี 7%</span>
            <span className="font-semibold text-orange-400">฿{tax.toLocaleString('th-TH', { maximumFractionDigits: 0 })}</span>
          </div>
          
          <div className="border-t border-stone-700 pt-3 mt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-stone-300 font-semibold">รวมทั้งสิ้น (THB)</span>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400">
                  ฿{grandTotalTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
                <span className="block text-xs text-stone-400 mt-1">
                  ≈ ${grandTotalUSD.toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-4 bg-white/10 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 mt-0.5" />
            <p className="text-xs font-medium text-stone-300 leading-relaxed">
              ราคาคำนวณตามอัตราแลกเปลี่ยนปัจจุบัน การชำระเงินสุทธิจะเกิดขึ้นเมื่อรับสินค้าเข้าคลังแล้ว
            </p>
          </div>
        </div>
      </div>

      {/* ======================================== */}
      {/* BOTTOM ACTION BUTTONS */}
      {/* ======================================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-30 shadow-2xl">
        <div className="space-y-2">
          <button
            onClick={handleConfirm}
            className="w-full h-14 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white text-base font-bold rounded-xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
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
      </div>
    </div>
  );
}
