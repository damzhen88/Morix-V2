// Utility Functions for MORIX CRM v2

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Format currency (THB)
export function formatCurrency(amount: number, currency: string = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date for input
export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Calculate weighted average cost
export function calculateWeightedAverage(
  existingQty: number,
  existingCost: number,
  newQty: number,
  newCost: number
): number {
  if (existingQty + newQty === 0) return 0;
  return ((existingQty * existingCost) + (newQty * newCost)) / (existingQty + newQty);
}

// Convert CNY to THB
export function cnyToThb(cny: number, rate: number): number {
  return cny * rate;
}

// Calculate profit
export function calculateProfit(sellingPrice: number, cost: number): number {
  return sellingPrice - cost;
}

export function calculateProfitPercent(sellingPrice: number, cost: number): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - cost) / sellingPrice) * 100;
}

// Status colors mapping
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Product status
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    // Order status
    draft: 'bg-gray-100 text-gray-700',
    quoted: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    closed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    // Payment status
    unpaid: 'bg-red-100 text-red-700',
    deposit: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    // PO status
    received: 'bg-green-100 text-green-700',
    // Expense status
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

// Category colors
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    ASA: 'bg-purple-100 text-purple-700',
    WPC: 'bg-orange-100 text-orange-700',
    SPC: 'bg-blue-100 text-blue-700',
    ACCESSORIES: 'bg-gray-100 text-gray-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
}

// CRM Stage colors
export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    inquiry: 'bg-gray-100 text-gray-700',
    quoted: 'bg-blue-100 text-blue-700',
    paid: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-green-100 text-green-700',
  };
  return colors[stage] || 'bg-gray-100 text-gray-700';
}

// Customer type colors
export function getCustomerTypeColor(type: string): string {
  const colors: Record<string, string> = {
    contractor: 'bg-blue-100 text-blue-700',
    homeowner: 'bg-green-100 text-green-700',
    dealer: 'bg-purple-100 text-purple-700',
    project: 'bg-orange-100 text-orange-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}

// Expense category labels (Thai)
export function getExpenseCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    warehouse_rent: 'ค่าเช่าคลัง',
    salaries: 'เงินเดือน',
    packer_wages: 'ค่าจ้างแรงงาน',
    marketing: 'ค่าการตลาด',
    utilities: 'ค่าสาธารณูปโภค',
    office: 'ค่าสำนักงาน',
    transport: 'ค่าขนส่ง',
    miscellaneous: 'ค่าใช้จ่ายอื่น',
  };
  return labels[category] || category;
}

// Order status labels (Thai)
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'ฉบับร่าง',
    quoted: 'เสนอราคา',
    confirmed: 'ยืนยันแล้ว',
    delivered: 'จัดส่งแล้ว',
    closed: 'ปิดงาน',
    cancelled: 'ยกเลิก',
  };
  return labels[status] || status;
}

// Deal stage labels (Thai)
export function getDealStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    inquiry: 'สอบถาม',
    quoted: 'เสนอราคา',
    paid: 'ชำระเงิน',
    shipped: 'จัดส่งแล้ว',
  };
  return labels[stage] || stage;
}

// Get time ago
export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
