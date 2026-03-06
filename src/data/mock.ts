// Realistic Mock Data for MORIX DECORATIVE CRM v2

import { 
  Product, Warehouse, Inventory, StockMovement, PurchaseOrder,
  SalesOrder, CRNDeal, Expense, User, OrderItem, PurchaseOrderItem
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Helper
const now = () => new Date().toISOString();
const id = () => uuidv4();
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

// =======================
// USERS
// =======================

export const users: User[] = [
  { id: id(), username: 'admin', name: 'Admin User', role: 'super_admin', email: 'admin@morix.co.th', status: 'active', created_at: now() },
  { id: id(), username: 'sales1', name: 'สมชาย มาลี', role: 'sales', email: 'somchai@morix.co.th', status: 'active', created_at: now() },
  { id: id(), username: 'warehouse1', name: 'สมศักดิ์ เจริญ', role: 'warehouse', status: 'active', created_at: now() },
];

// =======================
// WAREHOUSES
// =======================

export const warehouses: Warehouse[] = [
  { id: 'wh-1', name: 'คลังสินค้าหลัก', location: 'กรุงเทพมหานคร', is_default: true },
  { id: 'wh-2', name: 'คลังสินค้าสมุทรปราการ', location: 'สมุทรปราการ', is_default: false },
];

// =======================
// PRODUCTS
// =======================

export const products: Product[] = [
  // ASA Products
  {
    id: 'prod-asa-001',
    sku: 'ASA-DK-001',
    name_th: 'แผงวัสดุกันซึม ASA Decking สีเทา',
    name_en: 'ASA Decking Panel - Gray',
    category: 'ASA',
    unit: 'sqm',
    spec: { size: '3.0m x 1.0m', thickness: '3mm', color: 'Gray' },
    default_supplier: 'Guangzhou Factory',
    reorder_point: 500,
    min_stock: 100,
    images: [{ id: id(), url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', is_primary: true, created_at: now() }],
    status: 'active',
    created_at: daysAgo(180),
    updated_at: now(),
  },
  {
    id: 'prod-asa-002',
    sku: 'ASA-DK-002',
    name_th: 'แผงวัสดุกันซึม ASA Decking สีขาว',
    name_en: 'ASA Decking Panel - White',
    category: 'ASA',
    unit: 'sqm',
    spec: { size: '3.0m x 1.0m', thickness: '3mm', color: 'White' },
    default_supplier: 'Guangzhou Factory',
    reorder_point: 500,
    min_stock: 100,
    images: [],
    status: 'active',
    created_at: daysAgo(180),
    updated_at: now(),
  },
  {
    id: 'prod-asa-003',
    sku: 'ASA-DK-003',
    name_th: 'แผงวัสดุกันซึม ASA Decking สีน้ำตาล',
    name_en: 'ASA Decking Panel - Brown',
    category: 'ASA',
    unit: 'sqm',
    spec: { size: '3.0m x 1.0m', thickness: '3mm', color: 'Brown' },
    default_supplier: 'Guangzhou Factory',
    reorder_point: 300,
    min_stock: 50,
    images: [],
    status: 'active',
    created_at: daysAgo(180),
    updated_at: now(),
  },
  // WPC Products
  {
    id: 'prod-wpc-001',
    sku: 'WPC-DK-001',
    name_th: 'พื้น WPC Decking สีเทาเข้ม',
    name_en: 'WPC Decking - Dark Gray',
    category: 'WPC',
    unit: 'sqm',
    spec: { size: '2.4m x 1.45m', thickness: '25mm', color: 'Dark Gray' },
    default_supplier: 'Wuxi Factory',
    reorder_point: 200,
    min_stock: 50,
    images: [{ id: id(), url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', is_primary: true, created_at: now() }],
    status: 'active',
    created_at: daysAgo(150),
    updated_at: now(),
  },
  {
    id: 'prod-wpc-002',
    sku: 'WPC-DK-002',
    name_th: 'พื้น WPC Decking สีน้ำตาลอุ่น',
    name_en: 'WPC Decking - Warm Brown',
    category: 'WPC',
    unit: 'sqm',
    spec: { size: '2.4m x 1.45m', thickness: '25mm', color: 'Warm Brown' },
    default_supplier: 'Wuxi Factory',
    reorder_point: 200,
    min_stock: 50,
    images: [],
    status: 'active',
    created_at: daysAgo(150),
    updated_at: now(),
  },
  // SPC Products
  {
    id: 'prod-spc-001',
    sku: 'SPC-FL-001',
    name_th: 'พื้น SPC ลาย Oak ธรรมชาติ',
    name_en: 'SPC Flooring - Natural Oak',
    category: 'SPC',
    unit: 'sqm',
    spec: { size: '1.2m x 0.18m', thickness: '5mm', wear_layer: '0.5mm', color: 'Natural Oak' },
    default_supplier: 'Shandong Factory',
    reorder_point: 1000,
    min_stock: 200,
    images: [{ id: id(), url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400', is_primary: true, created_at: now() }],
    status: 'active',
    created_at: daysAgo(120),
    updated_at: now(),
  },
  {
    id: 'prod-spc-002',
    sku: 'SPC-FL-002',
    name_th: 'พื้น SPC ลาย Walnut เข้ม',
    name_en: 'SPC Flooring - Dark Walnut',
    category: 'SPC',
    unit: 'sqm',
    spec: { size: '1.2m x 0.18m', thickness: '5mm', wear_layer: '0.5mm', color: 'Dark Walnut' },
    default_supplier: 'Shandong Factory',
    reorder_point: 800,
    min_stock: 150,
    images: [],
    status: 'active',
    created_at: daysAgo(120),
    updated_at: now(),
  },
  {
    id: 'prod-spc-003',
    sku: 'SPC-FL-003',
    name_th: 'พื้น SPC ลาย Concrete เทา',
    name_en: 'SPC Flooring - Concrete Gray',
    category: 'SPC',
    unit: 'sqm',
    spec: { size: '1.2m x 0.18m', thickness: '5mm', wear_layer: '0.5mm', color: 'Concrete Gray' },
    default_supplier: 'Shandong Factory',
    reorder_point: 600,
    min_stock: 100,
    images: [],
    status: 'active',
    created_at: daysAgo(120),
    updated_at: now(),
  },
  // Accessories
  {
    id: 'prod-acc-001',
    sku: 'ACC-CL-001',
    name_th: 'คลิปยึด WPC สแตนเลส',
    name_en: 'WPC Clip - Stainless Steel',
    category: 'ACCESSORIES',
    unit: 'piece',
    spec: { color: 'Silver' },
    default_supplier: 'Hardware Supplier',
    reorder_point: 5000,
    min_stock: 1000,
    images: [],
    status: 'active',
    created_at: daysAgo(90),
    updated_at: now(),
  },
  {
    id: 'prod-acc-002',
    sku: 'ACC-TR-001',
    name_th: 'ขอบบันได WPC สีน้ำตาล',
    name_en: 'WPC Stair Nosing - Brown',
    category: 'ACCESSORIES',
    unit: 'piece',
    spec: { size: '2.4m', color: 'Brown' },
    default_supplier: 'Hardware Supplier',
    reorder_point: 500,
    min_stock: 100,
    images: [],
    status: 'active',
    created_at: daysAgo(90),
    updated_at: now(),
  },
];

// =======================
// INVENTORY
// =======================

export const initialInventory: Inventory[] = products.map(p => ({
  id: id(),
  product_id: p.id,
  warehouse_id: 'wh-1',
  quantity_on_hand: Math.floor(Math.random() * 500) + 100,
  quantity_reserved: 0,
  quantity_available: Math.floor(Math.random() * 500) + 100,
  weighted_average_cost_thb: Math.floor(Math.random() * 500) + 200,
  last_movement_at: daysAgo(Math.floor(Math.random() * 30)),
}));

// Adjust some to be low stock
initialInventory[0].quantity_on_hand = 178;
initialInventory[0].quantity_available = 178;
initialInventory[2].quantity_on_hand = 165;
initialInventory[2].quantity_available = 165;
initialInventory[3].quantity_on_hand = 108;
initialInventory[3].quantity_available = 108;
initialInventory[5].quantity_on_hand = 618;
initialInventory[5].quantity_available = 618;

// =======================
// STOCK MOVEMENTS
// =======================

export const stockMovements: StockMovement[] = [
  { id: id(), product_id: 'prod-asa-001', warehouse_id: 'wh-1', type: 'IN', quantity: 500, reference_type: 'purchase', reference_id: 'po-001', notes: 'Received PO-2026-001', created_by: 'warehouse1', created_at: daysAgo(30) },
  { id: id(), product_id: 'prod-wpc-001', warehouse_id: 'wh-1', type: 'IN', quantity: 300, reference_type: 'purchase', reference_id: 'po-001', notes: 'Received PO-2026-001', created_by: 'warehouse1', created_at: daysAgo(25) },
  { id: id(), product_id: 'prod-spc-001', warehouse_id: 'wh-1', type: 'IN', quantity: 1000, reference_type: 'purchase', reference_id: 'po-002', notes: 'Received PO-2026-002', created_by: 'warehouse1', created_at: daysAgo(20) },
  { id: id(), product_id: 'prod-asa-001', warehouse_id: 'wh-1', type: 'OUT', quantity: 50, reference_type: 'sale', reference_id: 'so-001', created_by: 'sales1', created_at: daysAgo(15) },
  { id: id(), product_id: 'prod-spc-001', warehouse_id: 'wh-1', type: 'OUT', quantity: 200, reference_type: 'sale', reference_id: 'so-002', created_by: 'sales1', created_at: daysAgo(10) },
];

// =======================
// PURCHASE ORDERS
// =======================

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-001',
    po_number: 'PO-2026-001',
    supplier: 'Guangzhou Factory',
    currency: 'CNY',
    exchange_rate: 5.12,
    status: 'received',
    items: [
      { id: id(), product_id: 'prod-asa-001', quantity: 500, unit_price_cny: 45, total_cny: 22500 },
      { id: id(), product_id: 'prod-wpc-001', quantity: 300, unit_price_cny: 38, total_cny: 11400 },
    ],
    shipment_costs: [
      { id: id(), description: 'International Freight', amount_cny: 2500, amount_thb: 12800, allocation_method: 'value' },
      { id: id(), description: 'Customs Clearance', amount_cny: 800, amount_thb: 4096, allocation_method: 'value' },
      { id: id(), description: 'Domestic Transport', amount_cny: 1200, amount_thb: 6144, allocation_method: 'quantity' },
    ],
    total_cny: 33900,
    total_thb: 173568,
    landed_cost_total_thb: 196608,
    created_at: daysAgo(60),
    updated_at: daysAgo(30),
  },
  {
    id: 'po-002',
    po_number: 'PO-2026-002',
    supplier: 'Shandong Factory',
    currency: 'CNY',
    exchange_rate: 5.15,
    status: 'received',
    items: [
      { id: id(), product_id: 'prod-spc-001', quantity: 1500, unit_price_cny: 28, total_cny: 42000 },
      { id: id(), product_id: 'prod-spc-002', quantity: 1000, unit_price_cny: 28, total_cny: 28000 },
    ],
    shipment_costs: [
      { id: id(), description: 'International Freight', amount_cny: 3200, amount_thb: 16480, allocation_method: 'value' },
      { id: id(), description: 'Domestic Transport', amount_cny: 1500, amount_thb: 7725, allocation_method: 'quantity' },
    ],
    total_cny: 70000,
    total_thb: 360500,
    landed_cost_total_thb: 384705,
    created_at: daysAgo(45),
    updated_at: daysAgo(20),
  },
];

// =======================
// SALES ORDERS
// =======================

function createOrderItems(productIds: string[], quantities: number[], prices: number[], costs: number[]): OrderItem[] {
  return productIds.map((product_id, i) => ({
    id: id(),
    product_id,
    quantity: quantities[i],
    unit_price_thb: prices[i],
    discount_percent: 0,
    total_thb: quantities[i] * prices[i],
    cost_thb: quantities[i] * costs[i],
    profit_thb: quantities[i] * (prices[i] - costs[i]),
  }));
}

export const salesOrders: SalesOrder[] = [
  {
    id: 'so-001',
    order_number: 'SO-2026-001',
    customer_id: 'cust-001',
    customer_name: 'บริษัท รีโนเวท คอนสตรัคชั่น จำกัด',
    customer_type: 'contractor',
    status: 'delivered',
    items: createOrderItems(['prod-asa-001'], [50], [650], [280]),
    subtotal: 32500,
    discount: 0,
    transport_cost: 2500,
    labor_cost: 500,
    total: 35500,
    product_cost_thb: 14000,
    gross_profit: 18500,
    net_profit: 15500,
    payment_status: 'paid',
    notes: 'โครงการตกแต่งภายใน',
    images: [{ id: id(), url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', type: 'delivery', description: 'Delivery proof', created_at: now() }],
    created_by: 'sales1',
    created_at: daysAgo(25),
    updated_at: daysAgo(15),
  },
  {
    id: 'so-002',
    order_number: 'SO-2026-002',
    customer_id: 'cust-002',
    customer_name: 'คุณสมชาย ศรีสุข',
    customer_type: 'homeowner',
    status: 'confirmed',
    items: createOrderItems(['prod-wpc-001', 'prod-acc-001'], [20, 100], [850, 12], [380, 5]),
    subtotal: 18200,
    discount: 500,
    transport_cost: 800,
    labor_cost: 300,
    total: 18800,
    product_cost_thb: 8100,
    gross_profit: 9600,
    net_profit: 8500,
    payment_status: 'deposit',
    images: [],
    created_by: 'sales1',
    created_at: daysAgo(10),
    updated_at: daysAgo(5),
  },
  {
    id: 'so-003',
    order_number: 'SO-2026-003',
    customer_id: 'cust-003',
    customer_name: 'โครงการ The Palm Residence',
    customer_type: 'project',
    status: 'quoted',
    items: createOrderItems(['prod-spc-001', 'prod-spc-002'], [500, 300], [520, 520], [220, 220]),
    subtotal: 416000,
    discount: 20000,
    transport_cost: 15000,
    labor_cost: 5000,
    total: 416000,
    product_cost_thb: 176000,
    gross_profit: 220000,
    net_profit: 200000,
    payment_status: 'unpaid',
    notes: 'รอการยืนยันจากลูกค้า',
    images: [],
    created_by: 'sales1',
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
  },
  {
    id: 'so-004',
    order_number: 'SO-2026-004',
    customer_id: 'cust-004',
    customer_name: 'ร้านวัสดุก่อสร้างชัยอนันต์',
    customer_type: 'dealer',
    status: 'delivered',
    items: createOrderItems(['prod-spc-003', 'prod-acc-002'], [150, 50], [480, 180], [200, 75]),
    subtotal: 81000,
    discount: 5000,
    transport_cost: 3500,
    labor_cost: 800,
    total: 80500,
    product_cost_thb: 33750,
    gross_profit: 41750,
    net_profit: 37450,
    payment_status: 'paid',
    images: [],
    created_by: 'sales1',
    created_at: daysAgo(20),
    updated_at: daysAgo(12),
  },
];

// =======================
// CRM DEALS
// =======================

export const crmDeals: CRNDeal[] = [
  { id: 'lead-001', lead_id: 'LEAD-001', customer_name: 'คุณสมชาย มาลี', customer_type: 'contractor', contact_phone: '089-xxx-xxxx', deal_value: 85000, stage: 'inquiry', notes: 'สนใจ WPC Decking', created_at: daysAgo(5), updated_at: daysAgo(2), last_interaction_at: daysAgo(0) },
  { id: 'lead-002', lead_id: 'LEAD-002', customer_name: 'บจก. รีโนเวท คอนสตรัคชั่น', customer_type: 'project', contact_phone: '02-xxx-xxxx', deal_value: 320000, stage: 'inquiry', notes: 'โครงการใหญ่', created_at: daysAgo(10), updated_at: daysAgo(1), last_interaction_at: daysAgo(1) },
  { id: 'lead-003', lead_id: 'LEAD-003', customer_name: 'โครงการ The Palm', customer_type: 'project', deal_value: 913000, stage: 'quoted', notes: 'รอ quote สุดท้าย', sales_order_id: 'so-003', created_at: daysAgo(15), updated_at: daysAgo(3), last_interaction_at: daysAgo(0) },
  { id: 'lead-004', lead_id: 'LEAD-004', customer_name: 'ร้านวัสดุก่อสร้างชัยอนันต์', customer_type: 'dealer', deal_value: 156000, stage: 'quoted', notes: 'ต้องการเป็นตัวแทนจำหน่าย', created_at: daysAgo(8), updated_at: daysAgo(2), last_interaction_at: daysAgo(0) },
  { id: 'lead-005', lead_id: 'LEAD-005', customer_name: 'คุณวิชัย ใจดี', customer_type: 'homeowner', deal_value: 78000, stage: 'paid', notes: 'ชำระมัดจำแล้ว', sales_order_id: 'so-002', created_at: daysAgo(12), updated_at: daysAgo(5), last_interaction_at: daysAgo(1) },
  { id: 'lead-006', lead_id: 'LEAD-006', customer_name: 'บจก. ไทย ดีเวลล็อปเมนท์', customer_type: 'project', deal_value: 245000, stage: 'shipped', notes: 'จัดส่งเรียบร้อย', sales_order_id: 'so-001', created_at: daysAgo(30), updated_at: daysAgo(15), last_interaction_at: daysAgo(2) },
];

// =======================
// EXPENSES
// =======================

export const expenses: Expense[] = [
  { id: id(), description: 'ค่าเช่าคลังสินค้า ม.ค. 2569', category: 'warehouse_rent', amount_thb: 45000, vendor: 'บจก. เอ็นเตอร์ไพรส์', date: '2026-01-01', is_recurring: true, recurring_type: 'monthly', status: 'paid', created_by: 'admin', created_at: daysAgo(65) },
  { id: id(), description: 'เงินเดือนพนักงาน ม.ค. 2569', category: 'salaries', amount_thb: 120000, date: '2026-01-31', is_recurring: true, recurring_type: 'monthly', status: 'paid', created_by: 'admin', created_at: daysAgo(35) },
  { id: id(), description: 'ค่าการตลาด Facebook Ads', category: 'marketing', amount_thb: 15000, vendor: 'Meta', date: '2026-02-15', is_recurring: false, status: 'paid', notes: 'โปรโมทสินค้าใหม่', created_by: 'sales1', created_at: daysAgo(20) },
  { id: id(), description: 'ค่าไฟฟ้าคลังสินค้า', category: 'utilities', amount_thb: 8500, vendor: 'กฟน.', date: '2026-02-28', is_recurring: true, recurring_type: 'monthly', status: 'paid', created_by: 'admin', created_at: daysAgo(10) },
  { id: id(), description: 'ค่าขนส่งสินค้าส่งลูกค้า', category: 'transport', amount_thb: 12000, vendor: 'ขนส่งเร็ว', date: '2026-03-01', is_recurring: false, status: 'paid', created_by: 'warehouse1', created_at: daysAgo(5) },
  { id: id(), description: 'ค่าอุปกรณ์สำนักงาน', category: 'office', amount_thb: 3500, date: '2026-03-02', is_recurring: false, status: 'pending', created_by: 'admin', created_at: daysAgo(4) },
];

// =======================
// MONTHLY TRENDS
// =======================

export const monthlyTrends = [
  { month: 'ต.ค. 68', revenue: 280000, cogs: 168000, profit: 112000 },
  { month: 'พ.ย. 68', revenue: 320000, cogs: 192000, profit: 128000 },
  { month: 'ธ.ค. 68', revenue: 410000, cogs: 246000, profit: 164000 },
  { month: 'ม.ค. 69', revenue: 380000, cogs: 228000, profit: 152000 },
  { month: 'ก.พ. 69', revenue: 445000, cogs: 267000, profit: 178000 },
  { month: 'มี.ค. 69', revenue: 520000, cogs: 312000, profit: 208000 },
];

// =======================
// COST BREAKDOWN
// =======================

export const costBreakdown = [
  { name: 'COGS', value: 312000, color: '#3B82F6' },
  { name: 'ขนส่งต่างประเทศ', value: 45000, color: '#8B5CF6' },
  { name: 'ขนส่งในประเทศ', value: 28000, color: '#06B6D4' },
  { name: 'ค่าโอเวอร์เฮด', value: 35000, color: '#F59E0B' },
  { name: 'แรงงาน', value: 18000, color: '#10B981' },
  { name: 'โฆษณา', value: 22000, color: '#EF4444' },
];
