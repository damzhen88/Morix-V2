'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'th' | 'en';

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  th: {
    // Navigation
    'nav.overview': 'ภาพรวม',
    'nav.products': 'สินค้า',
    'nav.inventory': 'คลังสินค้า',
    'nav.purchase': 'ใบสั่งซื้อ',
    'nav.sales': 'ขายสินค้า',
    'nav.clients': 'ลูกค้า',
    'nav.expenses': 'ค่าใช้จ่าย',
    'nav.reports': 'รายงาน',
    'nav.settings': 'ตั้งค่า',
    'nav.collapse': 'ยุบ',
    'nav.logout': 'ออกจากระบบ',
    'nav.home': 'หน้าแรก',
    'nav.menu': 'เมนู',

    // Dashboard
    'dashboard.title': 'ภาพรวม',
    'dashboard.subtitle': 'วันพุธที่ 26 มีนาคม 2569 — กรุงเทพฯ',
    'dashboard.kpi.totalProducts': 'สินค้าทั้งหมด',
    'dashboard.kpi.pendingOrders': 'รอดำเนินการ',
    'dashboard.kpi.revenue': 'รายได้เดือนนี้',
    'dashboard.kpi.activeClients': 'ลูกค้าที่ใช้งาน',
    'dashboard.kpi.view': 'ดู',
    'dashboard.recentActivity': 'กิจกรรมล่าสุด',
    'dashboard.viewAll': 'ดูทั้งหมด',
    'dashboard.quickActions': 'เมนูลัด',
    'dashboard.thisMonth': 'เดือนนี้',

    // Products
    'products.title': 'สินค้า',
    'products.addNew': 'เพิ่มสินค้าใหม่',
    'products.search': 'ค้นหาสินค้า...',
    'products.all': 'ทั้งหมด',
    'products.inStock': 'มีสินค้า',
    'products.lowStock': 'สินค้าใกล้หมด',
    'products.outOfStock': 'สินค้าหมด',
    'products.grid': 'การ์ด',
    'products.list': 'รายการ',
    'products.sku': 'SKU',
    'products.category': 'หมวดหมู่',
    'products.price': 'ราคา',
    'products.stock': 'สต็อก',
    'products.actions': 'จัดการ',
    'products.view': 'ดู',
    'products.edit': 'แก้ไข',
    'products.duplicate': 'คัดลอก',
    'products.archive': 'เก็บ',
    'products.delete': 'ลบ',

    // Sales
    'sales.title': 'ขายสินค้า',
    'sales.newSale': 'ขายใหม่',
    'sales.export': 'ส่งออก',
    'sales.pipeline': 'ไพพ์ไลน์การขาย',
    'sales.all': 'ทั้งหมด',
    'sales.confirmed': 'ยืนยันแล้ว',
    'sales.pending': 'รอดำเนินการ',
    'sales.delivered': 'จัดส่งแล้ว',
    'sales.recentOrders': 'คำสั่งซื้อล่าสุด',
    'sales.noOrders': 'ยังไม่มีคำสั่งซื้อ',
    'sales.order': 'คำสั่งซื้อ',
    'sales.customer': 'ลูกค้า',
    'sales.amount': 'จำนวน',
    'sales.status': 'สถานะ',

    // Expenses
    'expenses.title': 'ค่าใช้จ่าย',
    'expenses.newExpense': 'เพิ่มค่าใช้จ่าย',
    'expenses.search': 'ค้นหาค่าใช้จ่าย...',
    'expenses.all': 'ทั้งหมด',
    'expenses.total': 'รวม',
    'expenses.byCategory': 'ตามหมวดหมู่',
    'expenses.recent': 'ค่าใช้จ่ายล่าสุด',
    'expenses.noExpenses': 'ยังไม่มีค่าใช้จ่าย',

    // Purchase
    'purchase.title': 'ใบสั่งซื้อ',
    'purchase.newPo': 'ใบสั่งซื้อใหม่',
    'purchase.vendor': 'ผู้จำหน่าย',
    'purchase.selectVendor': 'เลือกผู้จำหน่าย...',
    'purchase.addNewVendor': '+ เพิ่มผู้จำหน่ายใหม่',
    'purchase.newVendorDetails': 'รายละเอียดผู้จำหน่ายใหม่',
    'purchase.vendorName': 'ชื่อผู้จำหน่าย',
    'purchase.contactEmail': 'อีเมลติดต่อ (ไม่บังคับ)',
    'purchase.phone': 'เบอร์โทร (ไม่บังคับ)',
    'purchase.addVendor': 'เพิ่มผู้จำหน่าย',
    'purchase.cancel': 'ยกเลิก',
    'purchase.items': 'รายการสินค้า',
    'purchase.addItem': 'เพิ่มรายการ',
    'purchase.description': 'รายละเอียด',
    'purchase.qty': 'จำนวน',
    'purchase.unitPrice': 'ราคาต่อหน่วย',
    'purchase.subtotal': 'รวมย่อย',
    'purchase.logistics': 'ค่าขนส่ง',
    'purchase.chinaDomestic': 'ภายในประเทศจีน',
    'purchase.chinaThailand': 'จีน-ไทย',
    'purchase.localDelivery': 'ขนส่งในประเทศ',
    'purchase.notes': 'หมายเหตุ',
    'purchase.summary': 'สรุปคำสั่งซื้อ',
    'purchase.itemsSubtotal': 'รวมรายการ',
    'purchase.logisticsTotal': 'ค่าขนส่ง',
    'purchase.tax': 'ภาษี (7%)',
    'purchase.grandTotal': 'รวมทั้งสิ้น',
    'purchase.saveDraft': 'บันทึกแบบร่าง',
    'purchase.confirmOrder': 'ยืนยันคำสั่งซื้อ',
    'purchase.deleteItem': 'ลบ',

    // CRM
    'crm.title': 'ลูกค้า',
    'crm.addClient': 'เพิ่มลูกค้าใหม่',
    'crm.search': 'ค้นหาลูกค้า...',
    'crm.all': 'ทั้งหมด',
    'crm.active': 'ใช้งาน',
    'crm.inactive': 'ไม่ใช้งาน',
    'crm.gold': 'ทอง',
    'crm.silver': 'เงิน',
    'crm.bronze': 'บอนซ์',
    'crm.recentClients': 'ลูกค้าล่าสุด',
    'crm.totalOrders': 'คำสั่งซื้อทั้งหมด',
    'crm.totalValue': 'มูลค่ารวม',
    'crm.lastOrder': 'คำสั่งซื้อล่าสุด',
    'crm.contact': 'ติดต่อ',
    'crm.email': 'อีเมล',
    'crm.phone': 'โทรศัพท์',
    'crm.location': 'สถานที่',
    'crm.type': 'ประเภท',
    'crm.tier': 'ระดับ',

    // Inventory
    'inventory.title': 'คลังสินค้า',
    'inventory.stockLevel': 'ระดับสต็อก',
    'inventory.lowStock': 'สินค้าใกล้หมด',
    'inventory.outOfStock': 'สินค้าหมด',
    'inventory.alerts': 'แจ้งเตือน',
    'inventory.movements': 'การเคลื่อนไหว',

    // Reports
    'reports.title': 'รายงาน',
    'reports.revenue': 'รายได้',
    'reports.orders': 'คำสั่งซื้อ',
    'reports.customers': 'ลูกค้า',
    'reports.products': 'สินค้า',

    // Settings
    'settings.title': 'ตั้งค่า',
    'settings.identity': 'ตัวตน',
    'settings.general': 'ทั่วไป',
    'settings.financial': 'การเงิน',
    'settings.notifications': 'การแจ้งเตือน',
    'settings.access': 'การเข้าถึง',
    'settings.saveChanges': 'บันทึกการเปลี่ยนแปลง',
    'settings.discard': 'ยกเลิก',

    // Common
    'common.loading': 'กำลังโหลด...',
    'common.save': 'บันทึก',
    'common.cancel': 'ยกเลิก',
    'common.delete': 'ลบ',
    'common.edit': 'แก้ไข',
    'common.add': 'เพิ่ม',
    'common.search': 'ค้นหา',
    'common.filter': 'กรอง',
    'common.export': 'ส่งออก',
    'common.view': 'ดู',
    'common.actions': 'จัดการ',
    'common.confirm': 'ยืนยัน',
    'common.back': 'กลับ',
    'common.next': 'ถัดไป',
    'common.previous': 'ก่อนหน้า',
    'common.yes': 'ใช่',
    'common.no': 'ไม่',
    'common.success': 'สำเร็จ',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.warning': 'คำเตือน',
    'common.info': 'ข้อมูล',
  },
  en: {
    // Navigation
    'nav.overview': 'Overview',
    'nav.products': 'Products',
    'nav.inventory': 'Inventory',
    'nav.purchase': 'Purchase Orders',
    'nav.sales': 'Sales',
    'nav.clients': 'Clients',
    'nav.expenses': 'Expenses',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.collapse': 'Collapse',
    'nav.logout': 'Logout',
    'nav.home': 'Home',
    'nav.menu': 'Menu',

    // Dashboard
    'dashboard.title': 'Dashboard Overview',
    'dashboard.subtitle': 'Wednesday, March 26, 2026 — Bangkok, Thailand',
    'dashboard.kpi.totalProducts': 'Total Products',
    'dashboard.kpi.pendingOrders': 'Pending Orders',
    'dashboard.kpi.revenue': 'Revenue MTD',
    'dashboard.kpi.activeClients': 'Active Clients',
    'dashboard.kpi.view': 'View',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.viewAll': 'View All',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.thisMonth': 'This Month',

    // Products
    'products.title': 'Products',
    'products.addNew': 'Add New Product',
    'products.search': 'Search products...',
    'products.all': 'All',
    'products.inStock': 'In Stock',
    'products.lowStock': 'Low Stock',
    'products.outOfStock': 'Out of Stock',
    'products.grid': 'Grid',
    'products.list': 'List',
    'products.sku': 'SKU',
    'products.category': 'Category',
    'products.price': 'Price',
    'products.stock': 'Stock',
    'products.actions': 'Actions',
    'products.view': 'View',
    'products.edit': 'Edit',
    'products.duplicate': 'Duplicate',
    'products.archive': 'Archive',
    'products.delete': 'Delete',

    // Sales
    'sales.title': 'Sales',
    'sales.newSale': 'New Sale',
    'sales.export': 'Export',
    'sales.pipeline': 'Sales Pipeline',
    'sales.all': 'All',
    'sales.confirmed': 'Confirmed',
    'sales.pending': 'Pending',
    'sales.delivered': 'Delivered',
    'sales.recentOrders': 'Recent Orders',
    'sales.noOrders': 'No orders yet',
    'sales.order': 'Order',
    'sales.customer': 'Customer',
    'sales.amount': 'Amount',
    'sales.status': 'Status',

    // Expenses
    'expenses.title': 'Expenses',
    'expenses.newExpense': 'Add Expense',
    'expenses.search': 'Search expenses...',
    'expenses.all': 'All',
    'expenses.total': 'Total',
    'expenses.byCategory': 'By Category',
    'expenses.recent': 'Recent Expenses',
    'expenses.noExpenses': 'No expenses yet',

    // Purchase
    'purchase.title': 'Purchase Order',
    'purchase.newPo': 'New Purchase Order',
    'purchase.vendor': 'Vendor',
    'purchase.selectVendor': 'Select a Vendor...',
    'purchase.addNewVendor': '+ Add New Vendor',
    'purchase.newVendorDetails': 'New Vendor Details',
    'purchase.vendorName': 'Vendor name',
    'purchase.contactEmail': 'Contact email (optional)',
    'purchase.phone': 'Phone number (optional)',
    'purchase.addVendor': 'Add Vendor',
    'purchase.cancel': 'Cancel',
    'purchase.items': 'Purchase Items',
    'purchase.addItem': 'Add Item',
    'purchase.description': 'Description',
    'purchase.qty': 'Qty',
    'purchase.unitPrice': 'Unit Price',
    'purchase.subtotal': 'Subtotal',
    'purchase.logistics': 'Logistics',
    'purchase.chinaDomestic': 'China Domestic',
    'purchase.chinaThailand': 'China-Thailand',
    'purchase.localDelivery': 'Local Delivery',
    'purchase.notes': 'Notes',
    'purchase.summary': 'Order Summary',
    'purchase.itemsSubtotal': 'Items Subtotal',
    'purchase.logisticsTotal': 'Logistics Total',
    'purchase.tax': 'Est. Tax (7%)',
    'purchase.grandTotal': 'Grand Total',
    'purchase.saveDraft': 'Save as Draft',
    'purchase.confirmOrder': 'Confirm Order',
    'purchase.deleteItem': 'Delete',

    // CRM
    'crm.title': 'Clients',
    'crm.addClient': 'Add New Client',
    'crm.search': 'Search clients...',
    'crm.all': 'All',
    'crm.active': 'Active',
    'crm.inactive': 'Inactive',
    'crm.gold': 'Gold',
    'crm.silver': 'Silver',
    'crm.bronze': 'Bronze',
    'crm.recentClients': 'Recent Clients',
    'crm.totalOrders': 'Total Orders',
    'crm.totalValue': 'Total Value',
    'crm.lastOrder': 'Last Order',
    'crm.contact': 'Contact',
    'crm.email': 'Email',
    'crm.phone': 'Phone',
    'crm.location': 'Location',
    'crm.type': 'Type',
    'crm.tier': 'Tier',

    // Inventory
    'inventory.title': 'Inventory',
    'inventory.stockLevel': 'Stock Level',
    'inventory.lowStock': 'Low Stock',
    'inventory.outOfStock': 'Out of Stock',
    'inventory.alerts': 'Alerts',
    'inventory.movements': 'Movements',

    // Reports
    'reports.title': 'Reports',
    'reports.revenue': 'Revenue',
    'reports.orders': 'Orders',
    'reports.customers': 'Customers',
    'reports.products': 'Products',

    // Settings
    'settings.title': 'Settings',
    'settings.identity': 'Identity',
    'settings.general': 'General',
    'settings.financial': 'Financial',
    'settings.notifications': 'Notifications',
    'settings.access': 'Access Control',
    'settings.saveChanges': 'Save Changes',
    'settings.discard': 'Discard',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.view': 'View',
    'common.actions': 'Actions',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.warning': 'Warning',
    'common.info': 'Info',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'morix-language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && (saved === 'th' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export type { Language };
