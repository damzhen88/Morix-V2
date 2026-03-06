// Dashboard Page for MORIX CRM v2 - ANTI-SLOP EDITION

'use client';

import { useApp, useKPIs } from '@/store';
import { Card, Badge, PageLoader } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { 
  DollarSign, TrendingUp, Package, Users, 
  AlertTriangle, ShoppingCart, ArrowUpRight, ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

// =======================
// KPI CARD - Distinctive Design
// =======================

function KPICard({ 
  title, value, subtitle, change, changeType = 'up', icon: Icon, color, href, delay = 0
}: {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeType?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  href?: string;
  delay?: number;
}) {
  const content = (
    <div 
      className="relative group bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover:shadow-float transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative element */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 ${color} opacity-10 rounded-full blur-2xl group-hover:opacity-15 transition-opacity`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 font-[var(--font-display)]">{value}</p>
          
          {(change || subtitle) && (
            <div className="flex items-center gap-3 mt-3">
              {change && (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  changeType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {changeType === 'up' ? '↑' : '↓'} {change}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-gray-400">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      {href && (
        <Link 
          href={href}
          className="absolute bottom-4 right-4 text-gray-300 hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// =======================
// TREND CHART - Clean Design
// =======================

function TrendChart() {
  const { state } = useApp();
  
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 font-[var(--font-display)]">แนวโน้มรายเดือน</h3>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-500">ยอดขาย</span>
          </span>
          <span className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-500">กำไร</span>
          </span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={state.trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#A8A29E" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#A8A29E" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
              dx={-10}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{ 
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                padding: '12px 16px',
              }}
              labelStyle={{ color: '#78716C', fontSize: '12px', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#F97316" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#F97316', stroke: 'white', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#22C55E" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#22C55E', stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =======================
// COST BREAKDOWN
// =======================

const costData = [
  { name: 'COGS', value: 312000, color: '#F97316' },
  { name: 'ขนส่งต่างประเทศ', value: 45000, color: '#8B5CF6' },
  { name: 'ขนส่งในประเทศ', value: 28000, color: '#06B6D4' },
  { name: 'โอเวอร์เฮด', value: 35000, color: '#F59E0B' },
  { name: 'แรงงาน', value: 18000, color: '#10B981' },
  { name: 'โฆษณา', value: 22000, color: '#EF4444' },
];

function CostBreakdown() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft animate-fade-in-up" style={{ animationDelay: '250ms' }}>
      <h3 className="text-lg font-bold text-gray-900 font-[var(--font-display)] mb-4">โครงสร้างต้นทุน</h3>
      
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={costData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {costData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {costData.slice(0, 4).map(item => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =======================
// LOW STOCK ALERTS
// =======================

function LowStockAlerts() {
  const { state } = useApp();
  
  const lowStockProducts = state.products
    .filter(p => p.status === 'active')
    .filter(p => {
      const inv = state.inventory.find(i => i.product_id === p.id);
      return inv && inv.quantity_on_hand < p.reorder_point;
    })
    .slice(0, 5);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 font-[var(--font-display)] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          สินค้าคงคลังต่ำ
        </h3>
        <Badge className="bg-red-100 text-red-700 font-semibold px-3 py-1">{lowStockProducts.length}</Badge>
      </div>
      
      {lowStockProducts.length > 0 ? (
        <div className="space-y-2">
          {lowStockProducts.map(p => {
            const inv = state.inventory.find(i => i.product_id === p.id);
            return (
              <div 
                key={p.id}
                className="flex items-center justify-between p-3 bg-red-50/50 rounded-2xl border border-red-100/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name_th}</p>
                  <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-red-600">{inv?.quantity_on_hand || 0}</p>
                  <p className="text-xs text-gray-400">min: {p.reorder_point}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-8">ไม่มีสินค้าคงคลังต่ำ</p>
      )}
    </div>
  );
}

// =======================
// CRM DEALS PREVIEW
// =======================

function CRMPreview() {
  const { state } = useApp();
  
  const deals = state.crmDeals.slice(0, 4);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft animate-fade-in-up" style={{ animationDelay: '350ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 font-[var(--font-display)] flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          ลูกค้าเป้าหมาย
        </h3>
        <Link href="/crm" className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
          ดูทั้งหมด <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="space-y-2">
        {deals.map(deal => (
          <div 
            key={deal.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-orange-50/50 transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{deal.customer_name}</p>
              <p className="text-xs text-gray-400">{deal.lead_id}</p>
            </div>
            <div className="text-right ml-4">
              <p className="text-sm font-bold text-gray-900">{formatCurrency(deal.deal_value)}</p>
              <Badge className="text-[10px] bg-gray-200 text-gray-600">{deal.stage}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =======================
// MAIN DASHBOARD
// =======================

export default function DashboardPage() {
  const { state } = useApp();
  const kpis = useKPIs();

  if (state.isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-900 font-[var(--font-display)] tracking-tight">แดชบอร์ด</h1>
        <p className="text-gray-500 mt-1 font-medium">ภาพรวมธุรกิจ MORIX DECORATIVE</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="ยอดขายรวม"
          value={formatCurrency(kpis.totalRevenue)}
          change="+12.5%"
          changeType="up"
          icon={DollarSign}
          color="bg-orange-500"
          href="/sales"
          delay={0}
        />
        <KPICard 
          title="กำไรขั้นต้น"
          value={formatCurrency(kpis.grossProfit)}
          change="+8.2%"
          changeType="up"
          icon={TrendingUp}
          color="bg-green-500"
          delay={50}
        />
        <KPICard 
          title="มูลค่าสินค้าคงคลัง"
          value={formatCurrency(kpis.inventoryValue)}
          subtitle={`LOW: ${kpis.lowStockCount}`}
          icon={Package}
          color="bg-purple-500"
          href="/inventory"
          delay={100}
        />
        <KPICard 
          title="ดีลที่รอดำเนินการ"
          value={kpis.activeDeals.toString()}
          subtitle="รอดำเนินการ"
          icon={Users}
          color="bg-blue-500"
          href="/crm"
          delay={150}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendChart />
        </div>
        <div>
          <CostBreakdown />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlerts />
        <CRMPreview />
      </div>
    </div>
  );
}
