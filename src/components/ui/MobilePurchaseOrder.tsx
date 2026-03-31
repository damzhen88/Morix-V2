'use client';

import { useState } from 'react';
import { 
  Save, Send, Package, Truck, PlaneTakeoff, 
  Warehouse, ChevronDown, ChevronUp,
  CreditCard, Factory, X, Info, FileText, Trash2
} from 'lucide-react';

// ============================================================
// MOBILE PURCHASE ORDER - UI FIXED VERSION
// Morix V2 - Fixed text overflow, overlaps, and calculations
// ============================================================

interface LineItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
}

interface LogisticsEntry {
  amount: string;
  currency: 'CNY' | 'USD' | 'THB';
}

export default function MobilePurchaseOrder() {
  // Generate PO number and date
  const poNumber = `PO-${Date.now().toString().slice(-6)}`;
  const today = new Date().toLocaleDateString('th-TH', { 
    day: '2-digit', month: 'short', year: 'numeric' 
  });

  // ========================================
  // SECTION STATE
  // ========================================
  const [sections, setSections] = useState({
    vendor: true,
    items: true,
    logistics: true,
    notes: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ========================================
  // VENDOR STATE
  // ========================================
  const [vendor, setVendor] = useState('');
  const [showVendorList, setShowVendorList] = useState(false);
  const [showNewVendorForm, setShowNewVendorForm] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', email: '', phone: '' });

  // Currency
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'CNY' | 'THB'>('USD');
  const [exchangeRate, setExchangeRate] = useState('35.42');

  // ========================================
  // ITEMS STATE
  // ========================================
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, name: 'Ultra-Slim Aluminum Chassis', sku: 'CH-AS-092', quantity: 150, unit_price: 45.00 },
    { id: 2, name: 'Glass Fiber PCB Panel', sku: 'PCB-GF-44', quantity: 300, unit_price: 12.50 },
  ]);

  // ========================================
  // LOGISTICS STATE
  // ========================================
  const [logistics, setLogistics] = useState<Record<string, LogisticsEntry>>({
    chinaDomestic: { amount: '', currency: 'CNY' },
    chinaThailand: { amount: '', currency: 'USD' },
    localDelivery: { amount: '', currency: 'THB' },
  });

  // ========================================
  // NOTES STATE
  // ========================================
  const [notes, setNotes] = useState('');

  // ========================================
  // PO STATUS
  // ========================================
  const [poStatus, setPoStatus] = useState<'draft' | 'confirmed' | 'received'>('draft');

  // ========================================
  // VENDORS LIST
  // ========================================
  const vendors = [
    'Global Logistics Pro',
    'Shenzhen Tech Supplies',
    'Bangkok Hardware Co.',
    'Pacific Trade Co.',
    'China Direct Import Co.',
  ];

  // ========================================
  // CALCULATIONS - ALL IN ONE PLACE
  // ========================================
  const RATE = parseFloat(exchangeRate) || 35.42;
  const CNY_TO_THB = RATE / 7.2;

  // Items subtotal
  const itemsSubtotalUSD = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const itemsSubtotalTHB = itemsSubtotalUSD * RATE;

  // Logistics total (THB)
  const logisticsTotalTHB = Object.values(logistics).reduce((sum, log) => {
    const amount = parseFloat(log.amount) || 0;
    if (log.currency === 'CNY') return sum + amount * CNY_TO_THB;
    if (log.currency === 'USD') return sum + amount * RATE;
    return sum + amount;
  }, 0);

  // Grand total
  const tax = itemsSubtotalTHB * 0.07;
  const grandTotalTHB = itemsSubtotalTHB + logisticsTotalTHB + tax;
  const grandTotalUSD = grandTotalTHB / RATE;

  // ========================================
  // ITEM FUNCTIONS
  // ========================================
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

  // ========================================
  // VENDOR FUNCTIONS
  // ========================================
  const handleSelectVendor = (v: string) => {
    setVendor(v);
    setShowVendorList(false);
  };

  const handleAddVendor = () => {
    if (newVendor.name.trim()) {
      setVendor(newVendor.name.trim());
      setShowNewVendorForm(false);
      setNewVendor({ name: '', email: '', phone: '' });
    }
  };

  // ========================================
  // ACTIONS
  // ========================================
  const handleSaveDraft = () => {
    setPoStatus('draft');
    alert(`บันทึกฉบับร่าง\nเลขที่: ${poNumber}\nผู้จัด: ${vendor || '-'}\nรายการ: ${items.length}\nยอดรวม: ฿${grandTotalTHB.toLocaleString('th-TH')}`);
  };

  const handleConfirm = () => {
    if (!vendor) { alert('เลือกผู้จัดจำหน่าย'); return; }
    if (items.filter(i => i.name.trim()).length === 0) { alert('เพิ่มอย่างน้อย 1 รายการ'); return; }
    setPoStatus('confirmed');
    alert(`ยืนยันคำสั่งซื้อ\nเลขที่: ${poNumber}\nผู้จัด: ${vendor}\nรายการ: ${items.length}\nยอดรวม: ฿${grandTotalTHB.toLocaleString('th-TH')}`);
  };

  // ========================================
  // SECTION HEADER
  // ========================================
  const SectionHeader = ({ title, icon: Icon, section, badge }: { 
    title: string; 
    icon: any; 
    section: keyof typeof sections;
    badge?: string;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-white border-b border-stone-200 active:bg-stone-50"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          section === 'vendor' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
          section === 'items' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
          section === 'logistics' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
          section === 'notes' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
          'bg-gradient-to-br from-stone-500 to-stone-600'
        }`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="text-left min-w-0">
          <span className="text-sm font-bold text-stone-900 truncate block">{title}</span>
          {badge && <span className="text-xs text-stone-400 truncate block max-w-[200px]">{badge}</span>}
        </div>
      </div>
      {sections[section] ? (
        <ChevronUp className="w-5 h-5 text-stone-400 flex-shrink-0 ml-2" />
      ) : (
        <ChevronDown className="w-5 h-5 text-stone-400 flex-shrink-0 ml-2" />
      )}
    </button>
  );

  // ========================================
  // FORMAT NUMBER
  // ========================================
  const fmtTHB = (n: number) => `฿${n.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;
  const fmtUSD = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-36">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white px-4 py-4 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black truncate">{poNumber}</h1>
            <p className="text-amber-100 text-xs">{today}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
            poStatus === 'draft' ? 'bg-amber-500/30 text-amber-100' :
            poStatus === 'confirmed' ? 'bg-green-500/30 text-green-100' :
            'bg-blue-500/30 text-blue-100'
          }`}>
            {poStatus === 'draft' ? 'ฉบับร่าง' : poStatus === 'confirmed' ? 'ยืนยันแล้ว' : 'รับของแล้ว'}
          </span>
        </div>
        
        {/* Quick Summary Bar */}
        <div className="mt-3 flex gap-4 text-amber-100 overflow-hidden">
          <div className="min-w-0">
            <span className="text-[10px] opacity-70 block">รายการ</span>
            <p className="text-sm font-bold text-white truncate">{items.length} รายการ</p>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] opacity-70 block">ยอดรวม</span>
            <p className="text-sm font-black text-white truncate">{fmtTHB(grandTotalTHB)}</p>
          </div>
        </div>
      </div>

      {/* ======================================== */}
      {/* SECTION 1: VENDOR */}
      {/* ======================================== */}
      <SectionHeader 
        title="ผู้จัดจำหน่าย" 
        icon={Factory} 
        section="vendor"
        badge={vendor || 'ยังไม่เลือก'}
      />
      
      {sections.vendor && (
        <div className="bg-white p-4 space-y-4">
          {/* Vendor Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-2 block">
              เลือกผู้จัดจำหน่าย
            </label>
            <button
              onClick={() => setShowVendorList(!showVendorList)}
              className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-left font-medium text-stone-900 flex items-center justify-between"
            >
              <span className={`truncate ${vendor ? 'text-stone-900' : 'text-stone-400'}`}>
                {vendor || 'เลือกหรือเพิ่มผู้จัดจำหน่าย...'}
              </span>
              <ChevronDown className="w-5 h-5 text-stone-400 flex-shrink-0 ml-2" />
            </button>
            
            {showVendorList && (
              <div className="mt-2 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-20 relative max-h-60 overflow-y-auto">
                {vendors.map(v => (
                  <button
                    key={v}
                    onClick={() => handleSelectVendor(v)}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-stone-900 hover:bg-amber-50 border-b border-stone-100 last:border-b-0 truncate"
                  >
                    {v}
                  </button>
                ))}
                <button
                  onClick={() => { setShowVendorList(false); setShowNewVendorForm(true); }}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-amber-600 bg-amber-50 border-t border-amber-200"
                >
                  + เพิ่มผู้จัดจำหน่ายใหม่
                </button>
              </div>
            )}
          </div>

          {/* New Vendor Form */}
          {showNewVendorForm && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-700 uppercase">เพิ่มผู้จัดจำหน่ายใหม่</span>
                <button onClick={() => setShowNewVendorForm(false)} className="p-1 text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input type="text" placeholder="ชื่อบริษัท..." value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                className="w-full h-11 bg-white border border-orange-200 rounded-lg px-4 text-sm" />
              <input type="email" placeholder="อีเมล (optional)..." value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})}
                className="w-full h-11 bg-white border border-orange-200 rounded-lg px-4 text-sm" />
              <input type="tel" placeholder="โทรศัพท์ (optional)..." value={newVendor.phone} onChange={e => setNewVendor({...newVendor, phone: e.target.value})}
                className="w-full h-11 bg-white border border-orange-200 rounded-lg px-4 text-sm" />
              <div className="flex gap-2">
                <button onClick={handleAddVendor} className="flex-1 h-10 bg-orange-500 text-white text-sm font-bold rounded-lg">บันทึก</button>
                <button onClick={() => setShowNewVendorForm(false)} className="px-4 h-10 bg-stone-200 text-stone-600 text-sm font-bold rounded-lg">ยกเลิก</button>
              </div>
            </div>
          )}

          {/* Currency & Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-2 block">สกุลเงิน</label>
              <div className="flex bg-stone-100 rounded-xl p-1">
                {(['USD', 'CNY', 'THB'] as const).map(c => (
                  <button key={c} onClick={() => setActiveCurrency(c)}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${activeCurrency === c ? 'bg-white text-orange-600 shadow' : 'text-stone-500'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-2 block">อัตราแลกเปลี่ยน</label>
              <div className="relative">
                <input type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)}
                  className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl px-3 text-center text-sm font-semibold pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">THB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* SECTION 2: ITEMS */}
      {/* ======================================== */}
      <SectionHeader 
        title="รายการสินค้า" 
        icon={Package} 
        section="items"
        badge={`${items.length} รายการ • ${fmtUSD(itemsSubtotalUSD)}`}
      />
      
      {sections.items && (
        <div className="bg-white p-4 space-y-3">
          {/* Items List */}
          {items.map((item, idx) => (
            <div key={item.id} className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-400 bg-stone-200 px-2 py-0.5 rounded">#{idx + 1}</span>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <input type="text" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                  placeholder="ชื่อสินค้า..." className="w-full h-12 bg-white border border-stone-200 rounded-xl px-4 text-sm font-medium" />
                <input type="text" value={item.sku} onChange={e => updateItem(item.id, 'sku', e.target.value)}
                  placeholder="SKU / รหัสสินค้า..." className="w-full h-10 bg-white border border-stone-200 rounded-xl px-4 text-xs font-mono" />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-stone-400 uppercase mb-1 block">จำนวน</label>
                    <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      className="w-full h-11 bg-white border border-stone-200 rounded-xl px-3 text-center font-semibold" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-stone-400 uppercase mb-1 block">ราคา/{activeCurrency}</label>
                    <input type="number" value={item.unit_price} onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                      className="w-full h-11 bg-white border border-stone-200 rounded-xl px-3 text-center font-semibold" />
                  </div>
                </div>

                {/* Item Subtotal */}
                <div className="flex justify-between items-center pt-2 border-t border-stone-200 mt-2">
                  <span className="text-xs text-stone-500">รวม</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-stone-900">{fmtUSD(item.quantity * item.unit_price)}</span>
                    <span className="text-xs text-orange-500 ml-2">≈ {fmtTHB(item.quantity * item.unit_price * RATE)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <button onClick={addItem}
            className="w-full h-12 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-xl text-sm font-bold text-amber-600 flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            เพิ่มรายการสินค้า
          </button>
        </div>
      )}

      {/* ======================================== */}
      {/* SECTION 3: LOGISTICS */}
      {/* ======================================== */}
      <SectionHeader 
        title="ค่าขนส่ง" 
        icon={Truck} 
        section="logistics"
        badge={fmtTHB(logisticsTotalTHB)}
      />
      
      {sections.logistics && (
        <div className="bg-white p-4 space-y-3">
          {/* China Domestic */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">China Domestic</p>
                <p className="text-xs text-stone-400">ขนส่งในประเทศจีน</p>
              </div>
              <select value={logistics.chinaDomestic.currency}
                onChange={e => setLogistics({...logistics, chinaDomestic: {...logistics.chinaDomestic, currency: e.target.value as any}})}
                className="h-8 bg-white border border-stone-200 rounded-lg px-2 text-xs font-medium flex-shrink-0">
                <option value="CNY">CNY</option>
                <option value="USD">USD</option>
                <option value="THB">THB</option>
              </select>
            </div>
            <input type="number" value={logistics.chinaDomestic.amount}
              onChange={e => setLogistics({...logistics, chinaDomestic: {...logistics.chinaDomestic, amount: e.target.value}})}
              placeholder="0.00" className="w-full h-12 bg-white border border-stone-200 rounded-xl px-4 text-lg font-semibold" />
          </div>

          {/* China-Thailand */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-dashed border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <PlaneTakeoff className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">China → Thailand</p>
                <p className="text-xs text-stone-400">ขนส่งข้ามพรมแดน</p>
              </div>
              <select value={logistics.chinaThailand.currency}
                onChange={e => setLogistics({...logistics, chinaThailand: {...logistics.chinaThailand, currency: e.target.value as any}})}
                className="h-8 bg-white border-2 border-dashed border-stone-300 rounded-lg px-2 text-xs font-medium flex-shrink-0">
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
                <option value="THB">THB</option>
              </select>
            </div>
            <input type="number" value={logistics.chinaThailand.amount}
              onChange={e => setLogistics({...logistics, chinaThailand: {...logistics.chinaThailand, amount: e.target.value}})}
              placeholder="0.00" className="w-full h-12 bg-white border-2 border-dashed border-stone-300 rounded-xl px-4 text-lg font-semibold" />
          </div>

          {/* Local Delivery */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">Local Delivery</p>
                <p className="text-xs text-stone-400">ขนส่งในประเทศไทย</p>
              </div>
              <select value={logistics.localDelivery.currency}
                onChange={e => setLogistics({...logistics, localDelivery: {...logistics.localDelivery, currency: e.target.value as any}})}
                className="h-8 bg-white border border-stone-200 rounded-lg px-2 text-xs font-medium flex-shrink-0">
                <option value="THB">THB</option>
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
              </select>
            </div>
            <input type="number" value={logistics.localDelivery.amount}
              onChange={e => setLogistics({...logistics, localDelivery: {...logistics.localDelivery, amount: e.target.value}})}
              placeholder="0.00" className="w-full h-12 bg-white border border-stone-200 rounded-xl px-4 text-lg font-semibold" />
          </div>

          {/* Logistics Total */}
          <div className="bg-stone-100 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-stone-600">รวมค่าขนส่ง</span>
              <span className="text-lg font-bold text-stone-900">{fmtTHB(logisticsTotalTHB)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================== */}
      {/* SECTION 4: NOTES */}
      {/* ======================================== */}
      <SectionHeader title="หมายเหตุ" icon={FileText} section="notes" />
      
      {sections.notes && (
        <div className="bg-white p-4">
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="ระบุข้อกำหนดบรรจุภัณฑ์, มาตรฐานควบคุมคุณภาพ..."
            rows={4} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm leading-relaxed resize-none" />
        </div>
      )}

      {/* ======================================== */}
      {/* SUMMARY SECTION */}
      {/* ======================================== */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">สรุปคำสั่งซื้อ</h3>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-400">ราคาสินค้า (USD)</span>
            <span className="font-semibold">{fmtUSD(itemsSubtotalUSD)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">ราคาสินค้า (THB)</span>
            <span className="font-semibold text-orange-400">{fmtTHB(itemsSubtotalTHB)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">ค่าขนส่ง</span>
            <span className="font-semibold text-orange-400">{fmtTHB(logisticsTotalTHB)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">ภาษี 7%</span>
            <span className="font-semibold text-orange-400">{fmtTHB(tax)}</span>
          </div>
          
          <div className="border-t border-stone-700 pt-3 mt-3">
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-stone-300 font-semibold">ยอดรวมทั้งสิ้น</span>
              <div className="text-right">
                <span className="text-xl font-black text-amber-400">{fmtTHB(grandTotalTHB)}</span>
                <span className="block text-xs text-stone-400 mt-1">≈ {fmtUSD(grandTotalUSD)} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-4 bg-white/10 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium text-stone-300 leading-relaxed">
              ราคาคำนวณตามอัตราแลกเปลี่ยนปัจจุบัน การชำระเงินสุทธิจะเกิดขึ้นเมื่อรับสินค้าเข้าคลังแล้ว
            </p>
          </div>
        </div>
      </div>

      {/* ======================================== */}
      {/* BOTTOM ACTION BUTTONS */}
      {/* ======================================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-2xl z-50 pb-safe">
        <div className="space-y-2">
          <button onClick={handleConfirm}
            className="w-full h-14 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white text-base font-bold rounded-xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <Send className="w-5 h-5" />
            ยืนยันคำสั่งซื้อ
          </button>
          <button onClick={handleSaveDraft}
            className="w-full h-12 bg-white border-2 border-stone-200 text-stone-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 active:bg-stone-50 transition-colors">
            <Save className="w-4 h-4" />
            บันทึกฉบับร่าง
          </button>
        </div>
      </div>
    </div>
  );
}
