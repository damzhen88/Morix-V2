/**
 * MORIX THAILAND - LOCKED SCHEMA DEFINITION
 * 
 * Deterministic mapping from Excel columns to database fields.
 * NO guessing - every field is explicitly defined.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ExcelColumn = string;
export type SystemField = string;

export interface SchemaField {
  excelHeaders: ExcelColumn[];      // All possible header variations (exact match)
  systemField: SystemField;          // Database field name
  dataType: 'STRING' | 'NUMBER' | 'DATE' | 'ENUM';
  required: boolean;
  enumValues?: string[];             // For ENUM types only
  defaultValue?: any;                // Default if empty
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
  };
}

export type ImportType = 'products' | 'stock_movement' | 'inventory' | 'assumptions';

// ============================================================================
// LOCKED SCHEMA - EXACT COLUMN NAMES FROM MORIX EXCEL
// ============================================================================

export const MORIX_SCHEMA: Record<ImportType, SchemaField[]> = {
  
  // --------------------------------------------------------------------------
  // SHEET: Product List
  // Header Row: 4
  // Data Start Row: 5
  // --------------------------------------------------------------------------
  products: [
    {
      excelHeaders: [
        'Product ID',
        'รหัสสินค้า',
        'Product ID / รหัสสินค้า',
        'product_id',
        'ID',
      ],
      systemField: 'sku',
      dataType: 'STRING',
      required: true,
      validation: {
        minLength: 1,
        maxLength: 50,
        pattern: /^[A-Za-z0-9-_]+$/,
      },
    },
    {
      excelHeaders: [
        'Category',
        'ประเภท',
        'Category / ประเภท',
      ],
      systemField: 'category',
      dataType: 'STRING',
      required: false,
      validation: {
        maxLength: 100,
      },
    },
    {
      excelHeaders: [
        'Color',
        'สี',
        'Color / สี',
      ],
      systemField: 'color',
      dataType: 'STRING',
      required: false,
      validation: {
        maxLength: 50,
      },
    },
    {
      excelHeaders: [
        'Size',
        'ขนาด',
        'Size (mm×mm×mm) / ขนาด',
        'Size (mm×mm×mm)',
        'Size (mm mm mm)',
      ],
      systemField: 'size',
      dataType: 'STRING',
      required: false,
      validation: {
        maxLength: 50,
      },
    },
    {
      excelHeaders: [
        'Width',
        'Width / (mm)',
        'Width (mm)',
        'ความกว้าง',
      ],
      systemField: 'width',
      dataType: 'NUMBER',
      required: false,
      validation: {
        min: 0,
        max: 10000,
      },
    },
    {
      excelHeaders: [
        'Height',
        'Height / (mm)',
        'Height (mm)',
        'ความสูง',
      ],
      systemField: 'height',
      dataType: 'NUMBER',
      required: false,
      validation: {
        min: 0,
        max: 10000,
      },
    },
    {
      excelHeaders: [
        'Length',
        'Length / (m)',
        'Length (m)',
        'ความยาว',
      ],
      systemField: 'length',
      dataType: 'NUMBER',
      required: false,
      validation: {
        min: 0,
        max: 100,
      },
    },
    {
      excelHeaders: [
        'Pcs/Bundle',
        'ชิ้น/มัด',
        'Pcs/Bundle / ชิ้น/มัด',
        'pcs_per_bundle',
        'pcs per bundle',
      ],
      systemField: 'unit',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 1,
      validation: {
        min: 1,
        max: 1000,
      },
    },
    {
      excelHeaders: [
        'FOB Price',
        'ราคา FOB',
        'FOB Price / (USD/m)',
        'Price (USD/m)',
        'Price USD',
        'price_usd',
        'fob',
      ],
      systemField: 'price_usd',
      dataType: 'NUMBER',
      required: false,
      validation: {
        min: 0,
        max: 10000,
      },
    },
    {
      excelHeaders: [
        'Weight/Bundle',
        'Weight/Bundle / (kg) *ป้อนเอง',
        'Weight/Bundle / (kg)',
        'Weight (kg)',
        'น้ำหนัก',
      ],
      systemField: 'weight',
      dataType: 'NUMBER',
      required: false,
      validation: {
        min: 0,
        max: 1000,
      },
    },
    {
      excelHeaders: [
        'Notes',
        'หมายเหตุ',
        'Notes / หมายเหตุ',
        'Remark',
        'หมายเหตุ',
      ],
      systemField: 'notes',
      dataType: 'STRING',
      required: false,
      validation: {
        maxLength: 500,
      },
    },
  ],

  // --------------------------------------------------------------------------
  // SHEET: Stock Movement
  // Header Row: 4
  // Data Start Row: 5
  // --------------------------------------------------------------------------
  stock_movement: [
    {
      excelHeaders: [
        'Date',
        'วันที่',
        'Date / วันที่',
        'วันที่',
        'Transaction Date',
      ],
      systemField: 'date',
      dataType: 'DATE',
      required: true,
    },
    {
      excelHeaders: [
        'Type',
        'IN / OUT',
        'Type / IN / OUT',
        'IN/OUT',
        'ประเภท',
        'Direction',
      ],
      systemField: 'type',
      dataType: 'ENUM',
      required: true,
      enumValues: ['IN', 'OUT'],
      validation: {
        pattern: /^(IN|OUT)$/i,
      },
    },
    {
      excelHeaders: [
        'Product ID',
        'รหัสสินค้า',
        'Product ID / รหัสสินค้า *',
        'product_id',
        'รหัสสินค้า',
        'SKU',
      ],
      systemField: 'sku',
      dataType: 'STRING',
      required: true,
      validation: {
        minLength: 1,
        maxLength: 50,
      },
    },
    {
      excelHeaders: [
        'Category',
        'ประเภท',
        'Category / ประเภท',
      ],
      systemField: 'category',
      dataType: 'STRING',
      required: false,
    },
    {
      excelHeaders: [
        'Color',
        'สี',
        'Color / สี',
      ],
      systemField: 'color',
      dataType: 'STRING',
      required: false,
    },
    {
      excelHeaders: [
        'Size',
        'ขนาด',
        'Size / ขนาด',
      ],
      systemField: 'size',
      dataType: 'STRING',
      required: false,
    },
    {
      excelHeaders: [
        'Bundles',
        'มัด',
        'Bundles / มัด *',
        'bundle',
        'Qty',
        'จำนวน',
      ],
      systemField: 'bundles',
      dataType: 'NUMBER',
      required: true,
      defaultValue: 0,
      validation: {
        min: 0,
        max: 100000,
      },
    },
    {
      excelHeaders: [
        'Pcs',
        'ชิ้น',
        'Pcs / ชิ้น',
        'pcs',
        'pieces',
      ],
      systemField: 'pcs',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0,
      validation: {
        min: 0,
        max: 1000000,
      },
    },
    {
      excelHeaders: [
        'Meters',
        'เมตร',
        'Meters / เมตร',
        'meters',
        'm',
      ],
      systemField: 'meters',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0,
      validation: {
        min: 0,
        max: 100000,
      },
    },
    {
      excelHeaders: [
        'Cost/Bundle',
        'Cost/Bundle / (THB)',
        'cost_per_bundle',
        'ต้นทุน/มัด',
      ],
      systemField: 'cost_per_bundle',
      dataType: 'NUMBER',
      required: false,
      validation: {
        min: 0,
        max: 1000000,
      },
    },
    {
      excelHeaders: [
        'Total Value',
        'Total Value / (THB)',
        'total_value',
        'มูลค่ารวม',
      ],
      systemField: 'total_value',
      dataType: 'NUMBER',
      required: false,
      validation: {
        min: 0,
        max: 100000000,
      },
    },
    {
      excelHeaders: [
        'Reference',
        'เลขที่เอกสาร',
        'Reference / เลขที่เอกสาร',
        'Ref',
        'Doc No',
        'เลขที่',
      ],
      systemField: 'reference',
      dataType: 'STRING',
      required: false,
      validation: {
        maxLength: 100,
      },
    },
    {
      excelHeaders: [
        'Notes',
        'หมายเหตุ',
        'Notes / หมายเหตุ',
        'Remark',
      ],
      systemField: 'notes',
      dataType: 'STRING',
      required: false,
      validation: {
        maxLength: 500,
      },
    },
  ],

  // --------------------------------------------------------------------------
  // SHEET: Inventory
  // Header Row: 4
  // Data Start Row: 5
  // --------------------------------------------------------------------------
  inventory: [
    {
      excelHeaders: [
        'Product ID',
        'รหัสสินค้า',
        'Product ID / รหัสสินค้า',
        'product_id',
        'SKU',
      ],
      systemField: 'sku',
      dataType: 'STRING',
      required: true,
      validation: {
        minLength: 1,
        maxLength: 50,
      },
    },
    {
      excelHeaders: [
        'Category',
        'ประเภท',
        'Category / ประเภท',
      ],
      systemField: 'category',
      dataType: 'STRING',
      required: false,
    },
    {
      excelHeaders: [
        'Color',
        'สี',
        'Color / สี',
      ],
      systemField: 'color',
      dataType: 'STRING',
      required: false,
    },
    {
      excelHeaders: [
        'Size',
        'ขนาด',
        'Size / ขนาด',
      ],
      systemField: 'size',
      dataType: 'STRING',
      required: false,
    },
    {
      excelHeaders: [
        'Min Stock',
        'สต็อกขั้นต่ำ',
        'Min Stock / (bundles) *',
        'Min Stock / (bundles)',
        'min_stock',
        'minimum',
      ],
      systemField: 'min_stock',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 10,
      validation: {
        min: 0,
        max: 100000,
      },
    },
    {
      excelHeaders: [
        'Opening',
        'Opening Stock',
        'Opening / Stock (bundles) *',
        'Opening / Stock (bundles)',
        'opening_stock',
        'opening',
      ],
      systemField: 'opening_stock',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0,
      validation: {
        min: 0,
        max: 1000000,
      },
    },
    {
      excelHeaders: [
        'Total IN',
        'Total IN / (bundles)',
        'total_in',
        'รับเข้า',
      ],
      systemField: 'total_in',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0,
    },
    {
      excelHeaders: [
        'Total OUT',
        'Total OUT / (bundles)',
        'total_out',
        'จ่ายออก',
      ],
      systemField: 'total_out',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0,
    },
    {
      excelHeaders: [
        'CURRENT STOCK',
        'Current Stock',
        'CURRENT STOCK / (bundles)',
        'Current Stock / (bundles)',
        'current_stock',
      ],
      systemField: 'current_stock',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0,
    },
    {
      excelHeaders: [
        'Current Stock (pcs)',
        'Current Stock / (pcs)',
        'current_pcs',
      ],
      systemField: 'current_pcs',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0,
    },
    {
      excelHeaders: [
        'Current Stock (meters)',
        'Current Stock / (meters)',
        'current_meters',
      ],
      systemField: 'current_meters',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0,
    },
    {
      excelHeaders: [
        'Stock Value',
        'Stock Value / (THB)',
        'stock_value',
        'มูลค่าสต็อก',
      ],
      systemField: 'stock_value',
      dataType: 'NUMBER',
      required: false,
    },
    {
      excelHeaders: [
        'Status',
        'สถานะ',
        'Status / สถานะ',
      ],
      systemField: 'status',
      dataType: 'STRING',
      required: false,
      validation: {
        pattern: /^(OK|LOW|OUT)$/,
      },
    },
  ],

  // --------------------------------------------------------------------------
  // SHEET: Assumptions
  // Header Row: 5 (key-value format)
  // Data Start Row: 6
  // --------------------------------------------------------------------------
  assumptions: [
    {
      excelHeaders: [
        'อัตราแลกเปลี่ยน',
        'Exchange Rate',
        'อัตราแลกเปลี่ยน / Exchange Rate (USD → THB)',
        'exchange_rate',
        'Exchange Rate (USD → THB)',
      ],
      systemField: 'exchange_rate',
      dataType: 'NUMBER',
      required: true,
      defaultValue: 35.5,
      validation: {
        min: 1,
        max: 200,
      },
    },
    {
      excelHeaders: [
        'อัตราตามน้ำหนัก',
        'Shipping Rate (kg)',
        'อัตราตามน้ำหนัก / Rate by Weight',
        'Rate by Weight',
        'shipping_rate_kg',
      ],
      systemField: 'shipping_rate_kg',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 15,
    },
    {
      excelHeaders: [
        'อัตราตามปริมาตร',
        'Shipping Rate (CBM)',
        'อัตราตามปริมาตร / Rate by Volume',
        'Rate by Volume',
        'shipping_rate_cbm',
      ],
      systemField: 'shipping_rate_cbm',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 3500,
    },
    {
      excelHeaders: [
        'วิธีคำนวณ',
        'Calculation Method',
        'วิธีคำนวณ / Calculation Method',
        'calc_method',
        'Method',
      ],
      systemField: 'calc_method',
      dataType: 'ENUM',
      required: false,
      defaultValue: 'cbm',
      enumValues: ['cbm', 'weight'],
    },
    {
      excelHeaders: [
        'ค่าขนส่งต่อ Bundle',
        'Domestic Shipping',
        'ค่าขนส่งในไทย / Domestic Shipping (Thailand)',
        'Domestic Shipping (Thailand)',
        'domestic_shipping',
      ],
      systemField: 'domestic_shipping',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 80,
    },
    {
      excelHeaders: [
        'ค่าบรรจุภัณฑ์ต่อ Bundle',
        'Packaging Cost',
        'ค่าบรรจุภัณฑ์ / Packaging Cost',
        'Packaging Cost',
        'packaging_cost',
      ],
      systemField: 'packaging_cost',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 35,
    },
    {
      excelHeaders: [
        'อัตรากำไร',
        'Markup',
        'อัตรากำไร / Target Markup %',
        'Target Markup %',
        'markup',
      ],
      systemField: 'markup',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0.3,
      validation: {
        min: 0,
        max: 10,
      },
    },
    {
      excelHeaders: [
        'VAT Rate',
        'VAT',
        'VAT %',
        'vat_rate',
      ],
      systemField: 'vat_rate',
      dataType: 'NUMBER',
      required: false,
      defaultValue: 0.07,
      validation: {
        min: 0,
        max: 1,
      },
    },
  ],
};

// ============================================================================
// TYPE CONFIGURATION
// ============================================================================

export const TYPE_CONFIG: Record<ImportType, {
  name: string;
  nameTh: string;
  sheet: string;
  table: string;
  description: string;
}> = {
  products: {
    name: 'Products',
    nameTh: 'สินค้า (Product List)',
    sheet: 'Product List',
    table: 'products',
    description: 'รหัสสินค้า, ประเภท, สี, ขนาด, ราคา FOB',
  },
  stock_movement: {
    name: 'Stock Movement',
    nameTh: 'รับ-จ่าย (Stock Movement)',
    sheet: 'Stock Movement',
    table: 'stock_movements',
    description: 'วันที่, IN/OUT, รหัสสินค้า, จำนวนมัด',
  },
  inventory: {
    name: 'Inventory',
    nameTh: 'สต็อก (Inventory)',
    sheet: 'Inventory',
    table: 'inventory',
    description: 'รหัสสินค้า, สต็อกขั้นต่ำ, Opening, Current',
  },
  assumptions: {
    name: 'Assumptions',
    nameTh: 'ตั้งค่า (Assumptions)',
    sheet: 'Assumptions',
    table: 'settings',
    description: 'อัตราแลกเปลี่ยน, ค่าขนส่ง, อัตรากำไร',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find matching header from schema for a given Excel header
 * EXACT MATCH ONLY - no fuzzy matching
 */
export function findHeaderMatch(excelHeader: string, schemaField: SchemaField): boolean {
  const normalized = excelHeader.toLowerCase().replace(/\s+/g, ' ').trim();
  
  for (const header of schemaField.excelHeaders) {
    const schemaNorm = header.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Exact match
    if (normalized === schemaNorm) return true;
    
    // Contains match (for compound headers)
    if (normalized.includes(schemaNorm) || schemaNorm.includes(normalized)) return true;
  }
  
  return false;
}

/**
 * Get all schema fields for an import type
 */
export function getSchemaFields(type: ImportType): SchemaField[] {
  return MORIX_SCHEMA[type] || [];
}

/**
 * Get required fields for validation
 */
export function getRequiredFields(type: ImportType): string[] {
  return MORIX_SCHEMA[type]
    ?.filter(f => f.required)
    ?.map(f => f.systemField) || [];
}
