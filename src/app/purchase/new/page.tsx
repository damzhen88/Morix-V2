// ============================================================
// MORIX CRM - New Purchase Order (Full Page)
// ============================================================
// ✅ Full page route (not modal)
// ✅ Clear section separation
// ✅ Bottom sheets for adding items
// ✅ Sticky summary on desktop
// ✅ Sticky bottom CTA on mobile
// ✅ Anti-slop design principles
// ============================================================

'use client';

import { useState, useRef } from 'react';
import { 
  Factory, CreditCard, Globe, Package, Truck, PlaneTakeoff, Warehouse,
  Plus, Save, Send, ChevronRight, Trash2, Search, Info, X, CheckCircle,
  ShoppingCart, Receipt, GripVertical
} from 'lucide-react';
import { PageLoader } from '@/components/ui';

// Design tokens
const t = {
  primary: '#F97316',
  primaryDark: '#EA580C',
  bg: '#FAFAFA',
  card: '#FFFFFF',
  textMain: '#111827',
  textMuted: '#6B7280',
  border: '#F3F4F6',
  radiusCard: '16px',
};

// Default items for demo
const defaultItems = [
  { id: 1, sku: 'CH-AS-092', name: 'Ultra-Slim Aluminum Chassis', qty: 150, priceUSD: 45.00 },
  { id: 2, sku: 'PCB-GF-44',  name: 'Glass Fiber PCB Panel',       qty: 300, priceUSD: 12.50 },
];

// Logistics options
const logisticsTypes = [
  { id: 'china_domestic',  label: 'China Domestic',   icon: Truck,       color: '#EF4444' },
  { id: 'china_thailand',  label: 'China-Thailand',    icon: PlaneTakeoff, color: '#3B82F6' },
  { id: 'local_delivery',  label: 'Local Delivery',    icon: Warehouse,   color: '#10B981' },
];

export default function NewPurchasePage() {
  // ── Form State ────────────────────────────────────────
  const [supplier, setSupplier]     = useState('');
  const [currency, setCurrency]     = useState('USD');
  const [exchangeRate, setExchangeRate] = useState('35.42');
  const [items, setItems]           = useState(defaultItems);
  const [logistics, setLogistics]   = useState({ china_domestic: '', china_thailand: '', local_delivery: '' });
  const [notes, setNotes]           = useState('');

  // ── Bottom Sheet State ────────────────────────────────
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [sheetType, setSheetType]   = useState<'product' | 'logistics'>('product');
  const [newItem, setNewItem]       = useState({ sku: '', name: '', qty: '1', priceUSD: '0' });
  const [newLogType, setNewLogType] = useState('');

  // ── Loading State ────────────────────────────────────
  const [isLoading, setIsLoading]   = useState(false);

  if (isLoading) return <PageLoader />;

  // ── Calculations ──────────────────────────────────────
  const rate = parseFloat(exchangeRate) || 35.42;

  const subtotalUSD = items.reduce((s, i) => s + i.qty * i.priceUSD, 0);
  const subtotalTHB = subtotalUSD * rate;

  const logisticsUSD = Object.values(logistics).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const logisticsTHB = logisticsUSD * rate;

  const taxTHB   = subtotalTHB * 0.07;
  const totalTHB = subtotalTHB + logisticsTHB + taxTHB;
  const totalUSD = totalTHB / rate;

  // ── Handlers ─────────────────────────────────────────
  const openProductSheet = () => { setSheetType('product'); setSheetOpen(true); };
  const openLogisticsSheet = (logId?: string) => { setSheetType('logistics'); setNewLogType(logId || 'china_domestic'); setSheetOpen(true); };

  const addItem = () => {
    if (!newItem.name) return;
    setItems([...items, {
      id: Date.now(),
      sku: newItem.sku || `SKU-${items.length + 1}`,
      name: newItem.name,
      qty: parseInt(newItem.qty) || 1,
      priceUSD: parseFloat(newItem.priceUSD) || 0,
    }]);
    setNewItem({ sku: '', name: '', qty: '1', priceUSD: '0' });
    setSheetOpen(false);
  };

  const removeItem = (id: number) => setItems(items.filter(i => i.id !== id));

  const addLogistics = () => {
    if (!newLogType) return;
    setLogistics({ ...logistics, [newLogType]: '0' });
    setSheetOpen(false);
  };

  const removeLogistics = (key: string) => {
    const updated = { ...logistics };
    delete updated[key];
    setLogistics(updated);
  };

  const handleSaveDraft = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Draft saved!');
    }, 800);
  };

  const handleConfirm = () => {
    if (!supplier) { alert('Please select a supplier'); return; }
    if (items.length === 0) { alert('Please add at least one item'); return; }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Purchase Order confirmed!\nTotal: ฿${totalTHB.toLocaleString()}`);
    }, 800);
  };

  // ── Bottom Sheet Component ────────────────────────────
  const BottomSheet = () => {
    if (!sheetOpen) return null;

    return (
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          onClick={() => setSheetOpen(false)} 
        />
        
        {/* Sheet */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-auto animate-slide-up"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">
              {sheetType === 'product' ? 'Add Product' : 'Add Logistics'}
            </h3>
            <button onClick={() => setSheetOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {sheetType === 'product' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Product Name *</label>
                  <input 
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    placeholder="Enter product name..."
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">SKU</label>
                    <input 
                      className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                      placeholder="SKU-001"
                      value={newItem.sku}
                      onChange={e => setNewItem({ ...newItem, sku: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Quantity</label>
                    <input 
                      className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                      type="number"
                      value={newItem.qty}
                      onChange={e => setNewItem({ ...newItem, qty: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Unit Price (USD)</label>
                  <input 
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    type="number"
                    placeholder="0.00"
                    value={newItem.priceUSD}
                    onChange={e => setNewItem({ ...newItem, priceUSD: e.target.value })}
                  />
                </div>
                <button 
                  onClick={addItem}
                  className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add to Order
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">Select a logistics type to add:</p>
                <div className="space-y-3">
                  {logisticsTypes.filter(l => !logistics[l.id]).map(l => {
                    const Icon = l.icon;
                    return (
                      <button 
                        key={l.id}
                        onClick={() => { setNewLogType(l.id); addLogistics(); }}
                        className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${l.color}20` }}>
                          <Icon className="w-6 h-6" style={{ color: l.color }} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">{l.label}</p>
                          <p className="text-xs text-gray-400">Add to order</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
                New Procurement
              </p>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                Purchase Order
              </h1>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={handleSaveDraft}
                className="h-11 px-5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button 
                onClick={handleConfirm}
                className="h-11 px-7 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-5 pb-36">

        {/* ── Section 1: Supplier Info ─────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 lg:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Factory className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Supplier Information</h2>
              <p className="text-xs text-gray-400">Select your supplier and currency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supplier */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Supplier</label>
              <div className="relative">
                <select 
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer appearance-none"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                >
                  <option value="">Select a supplier...</option>
                  <option>Global Logistics Pro</option>
                  <option>Shenzhen Tech Supplies</option>
                  <option>Guangzhou Trading Co.</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Currency</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                {['USD', 'CNY', 'THB'].map(c => (
                  <button key={c}
                    onClick={() => setCurrency(c)}
                    className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                      currency === c ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Exchange Rate (THB per 1 USD)</label>
              <div className="relative max-w-xs">
                <input 
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 pr-12 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  value={exchangeRate}
                  onChange={e => setExchangeRate(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  THB/USD
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Products ─────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Section Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Products</h2>
                <p className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''} added</p>
              </div>
            </div>
            <button 
              onClick={openProductSheet}
              className="h-10 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Items Table */}
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Product</th>
                    <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">SKU</th>
                    <th className="py-3 px-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Qty</th>
                    <th className="py-3 px-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Price (USD)</th>
                    <th className="py-3 px-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Subtotal</th>
                    <th className="py-3 px-5 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map(item => (
                    <tr key={item.id} className="group hover:bg-orange-50/30 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                            {item.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{item.sku}</span>
                      </td>
                      <td className="py-4 px-3 text-center text-sm font-semibold text-gray-700">{item.qty}</td>
                      <td className="py-4 px-3 text-right text-sm font-semibold text-gray-700">${item.priceUSD.toFixed(2)}</td>
                      <td className="py-4 px-3 text-right text-sm font-black text-gray-900">
                        ${(item.qty * item.priceUSD).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-5">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500 mb-1">No products added</p>
              <p className="text-sm text-gray-400 mb-4">Add your first product to this order</p>
              <button onClick={openProductSheet} className="text-orange-500 font-bold text-sm hover:underline">
                + Add Product
              </button>
            </div>
          )}

          {/* Summary Row */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Items Subtotal</p>
              <p className="text-lg font-black text-gray-900">
                ${subtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                <span className="text-xs font-medium text-gray-400 ml-2">
                  (฿{subtotalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })})
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 3: Logistics ─────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Section Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Logistics & Costs</h2>
                <p className="text-xs text-gray-400">Shipping and handling fees</p>
              </div>
            </div>
            <button 
              onClick={() => openLogisticsSheet()}
              className="h-10 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Cost
            </button>
          </div>

          {/* Logistics Cards */}
          {Object.entries(logistics).filter(([, v]) => v).length > 0 ? (
            <div className="p-5 space-y-3">
              {Object.entries(logistics).filter(([, v]) => v).map(([key, value]) => {
                const logType = logisticsTypes.find(l => l.id === key);
                if (!logType) return null;
                const Icon = logType.icon;
                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${logType.color}15` }}>
                        <Icon className="w-5 h-5" style={{ color: logType.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{logType.label}</p>
                        <p className="text-xs text-gray-400">฿{((parseFloat(value) || 0) * rate).toLocaleString('th-TH', { minimumFractionDigits: 0 })} THB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">$</span>
                        <input 
                          className="w-28 h-10 bg-white border border-gray-200 rounded-xl pl-7 pr-3 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-right"
                          type="number"
                          value={value}
                          onChange={e => setLogistics({ ...logistics, [key]: e.target.value })}
                        />
                      </div>
                      <button 
                        onClick={() => removeLogistics(key)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500 mb-1">No logistics added</p>
              <p className="text-sm text-gray-400 mb-4">Add shipping costs if applicable</p>
              <button onClick={() => openLogisticsSheet()} className="text-orange-500 font-bold text-sm hover:underline">
                + Add Cost
              </button>
            </div>
          )}

          {/* Summary Row */}
          {Object.values(logistics).some(v => v) && (
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Logistics Total</p>
                <p className="text-lg font-black text-gray-900">
                  ${logisticsUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── Section 4: Notes ─────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Notes</h2>
              <p className="text-xs text-gray-400">Internal notes for this order</p>
            </div>
          </div>
          <textarea 
            className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-gray-400"
            placeholder="Add any special instructions, packaging requirements, or quality notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </section>

      </div>

      {/* ── STICKY SUMMARY (Desktop) ──────────────── */}
      <div className="hidden lg:block fixed right-8 top-24 w-80">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-lg">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-orange-500" />
            Order Summary
          </h3>
          
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Items ({items.length})</span>
              <span className="font-semibold text-gray-900">${subtotalUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Logistics</span>
              <span className="font-semibold text-gray-900">${logisticsUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax (7%)</span>
              <span className="font-semibold text-gray-900">฿{taxTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}</span>
            </div>
            <div className="h-px bg-gray-100 my-2" />
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Grand Total</p>
              <p className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                ฿{totalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                ≈ ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={handleConfirm}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Order
            </button>
            <button 
              onClick={handleSaveDraft}
              className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM CTA ─────────────── */}
      <div className="lg:hidden fixed bottom-20 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-black text-gray-900">
              ฿{totalTHB.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSaveDraft}
              className="h-12 px-5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Save Draft
            </button>
            <button 
              onClick={handleConfirm}
              className="h-12 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </div>
      </div>

      {/* ── INFO BANNER ──────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-amber-50 border-t border-amber-100 p-3 text-center">
        <p className="text-xs text-amber-700 flex items-center justify-center gap-2">
          <Info className="w-3 h-3" />
          Exchange rate: 1 USD = ฿{rate.toFixed(2)} THB
        </p>
      </div>

      {/* ── BOTTOM SHEET ─────────────────────────── */}
      <BottomSheet />

      {/* ── ANIMATIONS ──────────────────────────── */}
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 300ms ease-out;
        }
      `}</style>
    </div>
  );
}