// Purchase Order Page for MORIX V2 - Anti-Slop Design
// Works within DashboardLayout - NO duplicate header/sidebar

'use client';

import { useState } from 'react';
import { useApp } from '@/store';
import { PageLoader } from '@/components/ui';
import { 
  Save, Send, CheckCircle, Package, Truck, Globe, 
  Delete, Plus, Info, ChevronRight,
  CreditCard, Factory, PlaneTakeoff, Warehouse
} from 'lucide-react';

// ============================================================
// ANTI-SLOP DESIGN SYSTEM - MORIX V2
// ============================================================
// ✅ NO Inter/Roboto (using Outfit + DM Sans)
// ✅ NO purple gradients (using amber/orange palette)
// ✅ NO uniform rounded corners (varied 8px-16px-24px)
// ✅ NO generic cards (layered depth with shadows)
// ✅ Custom noise texture backgrounds
// ============================================================

export default function PurchasePage() {
  const { state } = useApp();
  const [activeCurrency, setActiveCurrency] = useState('USD');
  const [logistics, setLogistics] = useState({
    chinaDomestic: { amount: '', currency: 'CNY' },
    chinaThailand: { amount: '', currency: 'USD' },
    localDelivery: { amount: '', currency: 'THB' },
  });
  const [formData, setFormData] = useState({
    vendor: '',
    exchangeRate: '35.42',
    items: [
      { id: 1, name: 'Ultra-Slim Aluminum Chassis', sku: 'CH-AS-092', quantity: 150, unit_price: 45.00 },
      { id: 2, name: 'Glass Fiber PCB Panel', sku: 'PCB-GF-44', quantity: 300, unit_price: 12.50 },
    ],
    notes: '',
  });

  // ============================================================
  // CALCULATIONS — Final always in THB
  // USD/CNY used for import products & international freight input
  // ============================================================
  const RATE = parseFloat(formData.exchangeRate) || 35.42; // THB per 1 USD

  // Items subtotal in THB (items priced in USD by default)
  const calculateItemsSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };
  const itemsSubtotalUSD = calculateItemsSubtotal();
  const itemsSubtotalTHB = itemsSubtotalUSD * RATE;

  // Logistics: CNY → THB, USD → THB, THB stays THB
  const calculateLogisticsTotal = () => {
    let totalTHB = 0;
    const logisticsData = [
      logistics.chinaDomestic,
      logistics.chinaThailand,
      logistics.localDelivery
    ];
    logisticsData.forEach(log => {
      const amount = parseFloat(log.amount) || 0;
      if (log.currency === 'CNY') totalTHB += amount * (RATE / 7.2);   // CNY→THB approx
      else if (log.currency === 'USD') totalTHB += amount * RATE;        // USD→THB
      else totalTHB += amount;                                           // THB stays
    });
    return totalTHB;
  };
  const logisticsTotalTHB = calculateLogisticsTotal();

  const calculateTax = () => itemsSubtotalTHB * 0.07;
  const calculateGrandTotal = () => itemsSubtotalTHB + logisticsTotalTHB + calculateTax();
  const calculateGrandTotalUSD = () => itemsSubtotalUSD + (logisticsTotalTHB / RATE) + (calculateTax() / RATE);

  const deleteItem = (id: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id),
    });
  };

  const updateLogisticsAmount = (key: string, amount: string) => {
    setLogistics({
      ...logistics,
      [key]: { ...logistics[key], amount }
    });
  };

  const updateLogisticsCurrency = (key: string, currency: string) => {
    setLogistics({
      ...logistics,
      [key]: { ...logistics[key], currency }
    });
  };

  const handleSaveDraft = () => {
    alert(`Draft saved!\n\nPO Number: ${formData.poNumber}\nSupplier: ${formData.supplier}\nItems: ${formData.items.length}\nTotal: ฿${calculateGrandTotal().toLocaleString()}`);
  };

  const handleConfirm = () => {
    if (!formData.supplier) {
      alert('Please select a supplier first');
      return;
    }
    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    alert(`Purchase Order confirmed!\n\nPO Number: ${formData.poNumber}\nSupplier: ${formData.supplier}\nItems: ${formData.items.length}\nTotal: ฿${calculateGrandTotal().toLocaleString()}`);
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (state.isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-900">
      {/* ============================================================ */}
      {/* NOISE TEXTURE OVERLAY */}
      {/* ============================================================ */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ============================================================ */}
      {/* PAGE HEADER - NO FIXED HEADER (DashboardLayout provides one) */}
      {/* ============================================================ */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              New Procurement Request
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-stone-900 leading-none">
              Purchase Order
              <span className="text-xl lg:text-2xl font-light text-stone-300 ml-3">#PO-2847</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-11 px-5 bg-white border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center gap-2 shadow-sm" onClick={handleSaveDraft}>
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button className="h-11 px-7 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all flex items-center gap-2" onClick={handleConfirm}>
              <Send className="w-4 h-4" />
              Confirm Order
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* WORKFLOW STEPPER */}
      {/* ============================================================ */}
      <div className="mb-8 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {/* Step 1 - Active */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900">Draft</div>
              <div className="text-xs text-stone-400">In Progress</div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex-1 mx-3">
            <div className="h-0.5 bg-gradient-to-r from-amber-500 to-stone-200 rounded-full" />
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-400">Confirmed</div>
              <div className="text-xs text-stone-300">Pending</div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex-1 mx-3">
            <div className="h-0.5 bg-stone-200 rounded-full" />
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-400">Received</div>
              <div className="text-xs text-stone-300">Awaiting</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN GRID */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN - Forms */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Vendor & Currency Section */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Vendor Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                  <Factory className="w-3 h-3" />
                  Vendor Selection
                </label>
                <div className="relative">
                  <select 
                    className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-sm font-medium text-stone-900 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer pr-10"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  >
                    <option value="">Select a Vendor...</option>
                    <option>Global Logistics Pro</option>
                    <option>Shenzhen Tech Supplies</option>
                    <option value="new">+ Add New Vendor</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Import Pricing Currency */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                  <CreditCard className="w-3 h-3" />
                  Import Pricing (USD/CNY)
                </label>
                <div className="flex bg-stone-100 rounded-xl p-1.5">
                  {['USD', 'CNY', 'THB'].map((curr) => (
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
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Exchange Rate (THB)
                </label>
                <div className="relative">
                  <input 
                    className="w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 pr-14 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    type="text"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                    / 1 {activeCurrency}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Purchase Items Table */}
          <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="p-5 pb-3 flex justify-between items-center border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Purchase Items</h3>
              </div>
              <button className="h-8 px-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Add Item
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50/80">
                    <th className="py-3 px-6 text-left text-[9px] font-bold uppercase tracking-widest text-stone-400">Item Description</th>
                    <th className="py-3 px-3 text-left text-[9px] font-bold uppercase tracking-widest text-stone-400">SKU</th>
                    <th className="py-3 px-3 text-center text-[9px] font-bold uppercase tracking-widest text-stone-400">Qty</th>
                    <th className="py-3 px-3 text-right text-[9px] font-bold uppercase tracking-widest text-stone-400">Unit Price</th>
                    <th className="py-3 px-3 text-right text-[9px] font-bold uppercase tracking-widest text-stone-400">Subtotal (USD)</th>
                    <th className="py-3 px-3 text-right text-[9px] font-bold uppercase tracking-widest text-stone-400">Subtotal (THB)</th>
                    <th className="py-3 px-6 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className={`group transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50/30'} hover:bg-amber-50/20`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-500 font-bold text-xs">
                            {item.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-stone-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {item.sku}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-sm font-semibold text-stone-700">{item.quantity}</span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="text-sm font-semibold text-stone-700">${item.unit_price.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="text-sm font-black text-stone-900">
                          ${(item.quantity * item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="text-sm font-bold text-orange-600">
                          ฿{(item.quantity * item.unit_price * RATE).toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Delete className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Logistics Section - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* China Domestic */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">China Domestic</h4>
                  <p className="text-[10px] text-stone-400">Freight within China</p>
                </div>
              </div>
              <div className="space-y-2">
                <input 
                  className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl px-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="0.00"
                  type="number"
                  value={logistics.chinaDomestic.amount}
                  onChange={(e) => updateLogisticsAmount('chinaDomestic', e.target.value)}
                />
                <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
                  {['CNY', 'USD', 'THB'].map((curr) => (
                    <button 
                      key={curr}
                      onClick={() => updateLogisticsCurrency('chinaDomestic', curr)}
                      className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${
                        logistics.chinaDomestic.currency === curr 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm' 
                          : 'text-stone-500 hover:bg-white hover:text-stone-700'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* China-Thailand */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-5 hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <PlaneTakeoff className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">China-Thailand</h4>
                  <p className="text-[10px] text-stone-400">International shipping</p>
                </div>
              </div>
              <div className="space-y-2">
                <input 
                  className="w-full h-10 bg-white border-2 border-dashed border-stone-200 rounded-xl px-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="0.00"
                  type="number"
                  value={logistics.chinaThailand.amount}
                  onChange={(e) => updateLogisticsAmount('chinaThailand', e.target.value)}
                />
                <div className="flex gap-1 p-1 bg-stone-50 rounded-xl">
                  {['CNY', 'USD', 'THB'].map((curr) => (
                    <button 
                      key={curr}
                      onClick={() => updateLogisticsCurrency('chinaThailand', curr)}
                      className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${
                        logistics.chinaThailand.currency === curr 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm' 
                          : 'text-stone-500 hover:bg-white hover:text-stone-700'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Local Delivery */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md hover:border-green-200 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Warehouse className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Local Delivery</h4>
                  <p className="text-[10px] text-stone-400">Thailand warehouse</p>
                </div>
              </div>
              <div className="space-y-2">
                <input 
                  className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl px-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                  placeholder="0.00"
                  type="number"
                  value={logistics.localDelivery.amount}
                  onChange={(e) => updateLogisticsAmount('localDelivery', e.target.value)}
                />
                <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
                  {['CNY', 'USD', 'THB'].map((curr) => (
                    <button 
                      key={curr}
                      onClick={() => updateLogisticsCurrency('localDelivery', curr)}
                      className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${
                        logistics.localDelivery.currency === curr 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm' 
                          : 'text-stone-500 hover:bg-white hover:text-stone-700'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Notes */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-3">
              <Info className="w-3 h-3" />
              Internal Vendor Notes
            </label>
            <textarea 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-900 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-stone-400"
              placeholder="Mention specific packaging requirements, quality control standards, or delivery instructions..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </section>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN - Summary Sidebar */}
        {/* ============================================================ */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xl shadow-stone-200/50">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-black text-stone-900 tracking-tight">Order Summary</h3>
              </div>

              <div className="space-y-3">
                {/* Items — show both USD input and THB equivalent */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500 font-medium">Items Subtotal</span>
                  <div className="text-right">
                    <span className="font-bold text-stone-400 text-xs mr-2">USD</span>
                    <span className="font-bold text-stone-900">
                      ${itemsSubtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="mx-1 text-stone-300">|</span>
                    <span className="font-bold text-orange-600">
                      ฿{itemsSubtotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Logistics */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500 font-medium">Logistics Total</span>
                  <div className="text-right">
                    <span className="font-bold text-orange-600">
                      ฿{logisticsTotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-500 font-medium">Est. Tax (7%)</span>
                  <span className="font-bold text-orange-600">
                    ฿{calculateTax().toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                  </span>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent my-4" />
                
                {/* GRAND TOTAL — Always THB */}
                <div className="py-4 px-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Grand Total (THB)</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      ฿{calculateGrandTotal().toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-stone-400">
                      ≈ $ {calculateGrandTotalUSD().toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                <button className="w-full h-12 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2" onClick={handleConfirm}>
                  <Send className="w-4 h-4" />
                  Confirm Order
                </button>
                <button className="w-full h-12 bg-white border-2 border-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-50 hover:border-stone-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4" />
                  Save as Draft
                </button>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100/50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                  Prices are calculated using the current exchange rate. Final settlement occurs upon inventory receipt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="mt-10 flex justify-center">
        <div className="flex items-center gap-2.5 opacity-15">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          <span className="text-[9px] font-black tracking-[0.25em] uppercase text-stone-400">
            MORIX ERP • Executive Procurement System
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
        </div>
      </footer>
    </div>
  );
}