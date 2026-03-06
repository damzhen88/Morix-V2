// Settings Page for MORIX CRM v2

'use client';

import { Card, Button, Input, Badge, PageLoader } from '@/components/ui';
import { useApp } from '@/store';
import { Settings, User, Building, Bell, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  const { state } = useApp();

  if (state.isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่า</h1>
        <p className="text-gray-500 mt-1">จัดการการตั้งค่าระบบ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">ข้อมูลผู้ใช้</h3>
          </div>
          <div className="space-y-3">
            <Input label="ชื่อ" defaultValue="Admin User" />
            <Input label="อีเมล" defaultValue="admin@morix.co.th" type="email" />
            <Input label="เบอร์โทร" defaultValue="" />
            <Button>บันทึก</Button>
          </div>
        </Card>

        {/* Company */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">ข้อมูลบริษัท</h3>
          </div>
          <div className="space-y-3">
            <Input label="ชื่อบริษัท" defaultValue="MORIX DECORATIVE" />
            <Input label="ที่อยู่" defaultValue="กรุงเทพมหานคร" />
            <Input label="เลขภาษี" defaultValue="010556xxxxxx" />
            <Button>บันทึก</Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">การแจ้งเตือน</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">แจ้งเตือนสต็อกต่ำ</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">แจ้งเตือนออเดอร์ใหม่</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">แจ้งเตือนการชำระเงิน</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">ความปลอดภัย</h3>
          </div>
          <div className="space-y-3">
            <Input label="รหัสผ่านปัจจุบัน" type="password" />
            <Input label="รหัสผ่านใหม่" type="password" />
            <Input label="ยืนยันรหัสผ่าน" type="password" />
            <Button>เปลี่ยนรหัสผ่าน</Button>
          </div>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Database className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900">ข้อมูลระบบ</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">เวอร์ชัน</p>
            <p className="font-medium">v2.0.0</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">สินค้า</p>
            <p className="font-medium">{state.products.length} รายการ</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">ใบสั่งซื้อ</p>
            <p className="font-medium">{state.purchaseOrders.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">ใบสั่งขาย</p>
            <p className="font-medium">{state.salesOrders.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
