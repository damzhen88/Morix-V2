// Reports Page for MORIX CRM v2

'use client';

import { useApp, useKPIs } from '@/store';
import { Card, PageLoader } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FileText, TrendingUp, Package, Users, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  const { state } = useApp();
  const kpis = useKPIs();

  if (state.isLoading) {
    return <PageLoader />;
  }

  // Category performance
  const categoryPerformance = ['ASA', 'WPC', 'SPC', 'ACCESSORIES'].map(cat => {
    const products = state.products.filter(p => p.category === cat);
    const productIds = products.map(p => p.id);
    const sales = state.salesOrders.flatMap(o => 
      o.items.filter(i => productIds.includes(i.product_id))
    );
    const revenue = sales.reduce((sum, i) => sum + i.total_thb, 0);
    const profit = sales.reduce((sum, i) => sum + i.profit_thb, 0);
    return { category: cat, revenue, profit };
  });

  // Top products
  const topProducts = state.products.map(product => {
    const sales = state.salesOrders.flatMap(o => 
      o.items.filter(i => i.product_id === product.id)
    );
    const revenue = sales.reduce((sum, i) => sum + i.total_thb, 0);
    const quantity = sales.reduce((sum, i) => sum + i.quantity, 0);
    return { ...product, revenue, quantity };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รายงาน</h1>
        <p className="text-gray-500 mt-1">ภาพรวมและวิเคราะห์ธุรกิจ</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalRevenue)}</p>
          <p className="text-sm text-gray-500">รายได้รวม</p>
        </Card>
        <Card className="text-center">
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.grossProfit)}</p>
          <p className="text-sm text-gray-500">กำไรขั้นต้น</p>
        </Card>
        <Card className="text-center">
          <Package className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.inventoryValue)}</p>
          <p className="text-sm text-gray-500">มูลค่าสินค้าคงคลัง</p>
        </Card>
        <Card className="text-center">
          <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{state.crmDeals.length}</p>
          <p className="text-sm text-gray-500">ดีลที่มี</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">แนวโน้มรายได้และกำไร</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={state.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="รายได้" />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} name="กำไร" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Performance */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">ผลตอบแทนตามหมวดหมู่</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="category" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#3B82F6" name="รายได้" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10B981" name="กำไร" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">สินค้าขายดีที่สุด</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">สินค้า</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">ขายแล้ว</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">รายได้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map((product, idx) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{product.sku}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{product.name_th}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.quantity}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
