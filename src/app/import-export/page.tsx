'use client';

import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, FileSpreadsheet, Check, AlertCircle, Loader2, ArrowLeft, Database, Package, Receipt, ShoppingCart, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/store';

// ============ MORIX EXCEL FIELD MAPPINGS ============
// กำหนดว่า column ใน Excel ตรงกับ field ในระบบอย่างไร

const MORIX_SHEETS = {
  products: {
    name: 'Product List',
    expectedHeaders: ['product_id', 'productid', 'รหัสสินค้า', 'product id', 'id'],
    fieldMapping: {
      'product_id': 'sku',
      'productid': 'sku',
      'รหัสสินค้า': 'sku',
      'product id': 'sku',
      'category': 'category',
      'ประเภท': 'category',
      'color': 'color',
      'สี': 'color',
      'size': 'size',
      'ขนาด': 'size',
      'width': 'width',
      'height': 'height',
      'length': 'length',
      'pcs/bundle': 'unit',
      'ชิ้น/มัด': 'unit',
      'fob price': 'price_usd',
      'fob': 'price_usd',
      'price (usd/m)': 'price_usd',
      'ราคา fob': 'price_usd',
      'notes': 'notes',
      'หมายเหตุ': 'notes',
    },
    requiredFields: ['sku'],
  },
  inventory: {
    name: 'Inventory',
    expectedHeaders: ['product_id', 'รหัสสินค้า', 'productid'],
    fieldMapping: {
      'product_id': 'sku',
      'productid': 'sku',
      'รหัสสินค้า': 'sku',
      'category': 'category',
      'ประเภท': 'category',
      'color': 'color',
      'สี': 'color',
      'size': 'size',
      'ขนาด': 'size',
      'min stock': 'min_stock',
      'สต็อกขั้นต่ำ': 'min_stock',
      'opening': 'opening_stock',
      'opening stock': 'opening_stock',
      'opening bundles': 'opening_stock',
      'current stock': 'current_stock',
      'current bundles': 'current_stock',
      'current stock (bundles)': 'current_stock',
    },
    requiredFields: ['sku'],
  },
  stock_movement: {
    name: 'Stock Movement',
    expectedHeaders: ['date', 'วันที่', 'type', 'in/out', 'product id', 'รหัสสินค้า'],
    fieldMapping: {
      'date': 'date',
      'วันที่': 'date',
      'type': 'type',
      'in/out': 'type',
      'product id': 'sku',
      'รหัสสินค้า': 'sku',
      'category': 'category',
      'ประเภท': 'category',
      'color': 'color',
      'สี': 'color',
      'bundles': 'bundles',
      'มัด': 'bundles',
      'pcs': 'pcs',
      'ชิ้น': 'pcs',
      'meters': 'meters',
      'เมตร': 'meters',
      'cost/bundle': 'cost',
      'total value': 'total_value',
      'reference': 'reference',
      'เลขที่เอกสาร': 'reference',
      'notes': 'notes',
      'หมายเหตุ': 'notes',
    },
    requiredFields: ['date', 'type', 'sku', 'bundles'],
  },
  assumptions: {
    name: 'Assumptions',
    expectedHeaders: ['exchange rate', 'อัตราแลกเปลี่ยน'],
    fieldMapping: {
      'exchange rate': 'exchange_rate',
      'อัตราแลกเปลี่ยน': 'exchange_rate',
      'shipping rate (cbm)': 'shipping_rate_cbm',
      'อัตราตามปริมาตร': 'shipping_rate_cbm',
      'shipping rate (kg)': 'shipping_rate_kg',
      'domestic shipping': 'domestic_shipping',
      'ค่าขนส่งในไทย': 'domestic_shipping',
      'packaging cost': 'packaging_cost',
      'ค่าบรรจุภัณฑ์': 'packaging_cost',
      'markup': 'markup',
      'อัตรากำไร': 'markup',
    },
    requiredFields: [],
  },
};

type ImportType = 'products' | 'inventory' | 'stock_movement' | 'assumptions';

interface ParsedRow {
  [key: string]: any;
}

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importType, setImportType] = useState<ImportType>('products');
  const [step, setStep] = useState<'select' | 'preview' | 'importing' | 'done'>('select');
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportResult>({ success: 0, failed: 0, skipped: 0, errors: [] });
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();

  // ============ FILE UPLOAD HANDLER ============
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get all sheet names
        const sheetNames = workbook.SheetNames;
        setSheets(sheetNames);

        // Auto-select sheet based on import type
        const typeConfig = MORIX_SHEETS[importType as keyof typeof MORIX_SHEETS] || MORIX_SHEETS.products;
        const autoSheet = sheetNames.find(s => 
          s.toLowerCase().includes(typeConfig.name.toLowerCase()) ||
          typeConfig.expectedHeaders.some(h => 
            workbook.Sheets[s] && 
            JSON.stringify(workbook.Sheets[s]).toLowerCase().includes(h.toLowerCase())
          )
        ) || sheetNames[0];

        setSelectedSheet(autoSheet);
        parseSheet(workbook, autoSheet);
      } catch (err) {
        console.error(err);
        alert('ไม่สามารถอ่านไฟล์ได้');
      }
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }, [importType]);

  // ============ PARSE SHEET ============
  const parseSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
    const ws = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

    if (jsonData.length < 2) {
      alert('ไฟล์ว่างเปล่าหรือไม่มีข้อมูล');
      return;
    }

    // Find header row (usually row 1 or row with column names)
    let headerRowIndex = 0;
    const headerRow = jsonData[0].map((h: any) => String(h || '').trim());
    
    // Check if row 1 is headers or data
    const isRow1Header = headerRow.some((h: string) => 
      h.includes('product') || h.includes('รหัส') || h.includes('date') || h.includes('วันที่') ||
      h.includes('category') || h.includes('ประเภท') || h.includes('amount') || h.includes('จำนวน')
    );

    if (!isRow1Header && jsonData.length > 1) {
      // Row 1 might be title, check row 2
      const row2 = jsonData[1].map((h: any) => String(h || '').trim());
      if (row2.some((h: string) => h.toLowerCase().includes('product') || h.includes('รหัส'))) {
        headerRowIndex = 1;
      }
    }

    const actualHeaders = jsonData[headerRowIndex].map((h: any) => String(h || '').trim());
    const dataRows = jsonData.slice(headerRowIndex + 1).filter(row => 
      row.some(cell => cell !== null && cell !== undefined && cell !== '')
    );

    setHeaders(actualHeaders);
    setRows(dataRows.map(row => {
      const obj: ParsedRow = {};
      actualHeaders.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    }));

    // Auto-map columns
    const typeConfig = MORIX_SHEETS[importType as keyof typeof MORIX_SHEETS] || MORIX_SHEETS.products;
    const autoMappings: Record<string, string> = {};
    
    actualHeaders.forEach(header => {
      const lowerHeader = header.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Direct match
      if (typeConfig.fieldMapping[lowerHeader]) {
        autoMappings[header] = typeConfig.fieldMapping[lowerHeader];
      } else {
        // Fuzzy match
        for (const [key, value] of Object.entries(typeConfig.fieldMapping)) {
          if (lowerHeader.includes(key) || key.includes(lowerHeader)) {
            autoMappings[header] = value;
            break;
          }
        }
      }
    });

    setFieldMappings(autoMappings);
    setStep('preview');
  };

  // ============ HANDLE IMPORT ============
  const handleImport = async () => {
    setStep('importing');
    const errors: string[] = [];
    let success = 0;
    let failed = 0;
    let skipped = 0;

    // Check required fields
    const typeConfig = MORIX_SHEETS[importType as keyof typeof MORIX_SHEETS] || MORIX_SHEETS.products;
    const mappedRequired = typeConfig.requiredFields.filter(field => 
      Object.values(fieldMappings).includes(field)
    );

    if (mappedRequired.length < typeConfig.requiredFields.length) {
      alert(`กรุณาเลือกฟิลด์ที่จำเป็น: ${typeConfig.requiredFields.join(', ')}`);
      setStep('preview');
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Build record based on mappings
      const record: ParsedRow = {};
      Object.entries(fieldMappings).forEach(([excelCol, systemField]) => {
        if (systemField && row[excelCol] !== undefined && row[excelCol] !== '') {
          let value = row[excelCol];

          // Type conversions
          if (['price_usd', 'cost', 'amount', 'total_value', 'exchange_rate', 'shipping_rate'].includes(systemField)) {
            value = parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
          }
          if (['min_stock', 'opening_stock', 'current_stock', 'bundles', 'pcs', 'meters', 'width', 'height'].includes(systemField)) {
            value = parseInt(String(value).replace(/[^0-9]/g, '')) || 0;
          }
          if (['date'].includes(systemField)) {
            // Handle Excel date serial numbers
            if (typeof value === 'number') {
              const date = new Date((value - 25569) * 86400 * 1000);
              value = date.toISOString().split('T')[0];
            } else if (typeof value === 'string') {
              // Try to parse string date
              const parsed = new Date(value);
              if (!isNaN(parsed.getTime())) {
                value = parsed.toISOString().split('T')[0];
              }
            }
          }
          if (['type'].includes(systemField)) {
            value = String(value).toUpperCase().trim();
            if (!['IN', 'OUT'].includes(value)) {
              if (value.includes('IN') || value.includes('รับ')) value = 'IN';
              else if (value.includes('OUT') || value.includes('จ่าย') || value.includes('ขาย')) value = 'OUT';
            }
          }

          record[systemField] = value;
        }
      });

      // Check required fields
      const hasRequired = typeConfig.requiredFields.every(field => 
        record[field] !== undefined && record[field] !== ''
      );

      if (!hasRequired) {
        skipped++;
        continue;
      }

      try {
        let tableName = importType;
        
        // Map to correct table
        if (importType === 'products') {
          tableName = 'products';
        } else if (importType === 'stock_movement') {
          tableName = 'stock_movements';
        } else if (importType === 'inventory') {
          tableName = 'inventory';
        }

        const { error } = await supabase.from(tableName).insert(record);

        if (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
          failed++;
        } else {
          success++;
        }
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
        failed++;
      }
    }

    setResult({ success, failed, skipped, errors: errors.slice(0, 10) });
    setStep('done');
    dispatch({ type: 'LOAD_ALL' });
  };

  // ============ EXPORT HANDLER ============
  const handleExport = async () => {
    setLoading(true);
    try {
      let tableName = importType === 'products' ? 'products' : 
                      importType === 'stock_movement' ? 'stock_movements' : 
                      importType === 'inventory' ? 'inventory' : importType;

      const { data, error } = await supabase.from(tableName).select('*');

      if (error) throw error;

      // Convert to Excel
      const ws = XLSX.utils.json_to_sheet(data || []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Auto-width
      const cols = Object.keys(data?.[0] || {});
      const colWidths = cols.map(col => ({
        wch: Math.min(Math.max(col.length, ...(data || []).map(row => String(row[col] || '').length)) + 2, 50)
      }));
      ws['!cols'] = colWidths;

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `morix_${importType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Export failed');
    }
    setLoading(false);
  };

  // ============ RESET ============
  const resetForm = () => {
    setStep('select');
    setFileName('');
    setSheets([]);
    setSelectedSheet('');
    setHeaders([]);
    setRows([]);
    setFieldMappings({});
    setResult({ success: 0, failed: 0, skipped: 0, errors: [] });
  };

  // ============ TYPE CONFIG ============
  const typeLabels: Record<ImportType, { th: string; en: string; icon: any }> = {
    products: { th: 'รายการสินค้า', en: 'Product List', icon: Package },
    inventory: { th: 'สต็อกคงคลัง', en: 'Inventory', icon: Database },
    stock_movement: { th: 'รับ-จ่ายสินค้า', en: 'Stock Movement', icon: Receipt },
    assumptions: { th: 'ค่าตั้งต้น', en: 'Assumptions', icon: Settings },
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)', padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} />
        กลับหน้าหลัก
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
          📊 Import / Export Excel
        </h1>
        <p style={{ color: 'var(--on-surface-variant)' }}>
          นำเข้า-ส่งออกข้อมูลจากไฟล์ Excel ของ Morix Thailand
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--surface-container-low)', padding: '0.375rem', borderRadius: 16 }}>
        {(['import', 'export'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); resetForm(); }}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              borderRadius: 12,
              border: 'none',
              backgroundColor: activeTab === tab ? 'var(--surface)' : 'transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--on-surface-variant)',
              fontWeight: activeTab === tab ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
            {tab === 'import' ? <Upload style={{ width: 18, height: 18 }} /> : <Download style={{ width: 18, height: 18 }} />}
            {tab === 'import' ? 'นำเข้า Import' : 'ส่งออก Export'}
          </button>
        ))}
      </div>

      {/* Type Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.75rem', display: 'block' }}>
          เลือกประเภทข้อมูล
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {(Object.entries(typeLabels) as [ImportType, typeof typeLabels.products][]).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <button key={type} onClick={() => setImportType(type)}
                style={{
                  padding: '1rem',
                  borderRadius: 12,
                  border: importType === type ? '2px solid var(--primary)' : '1px solid var(--outline)',
                  backgroundColor: importType === type ? 'var(--primary-container)' : 'var(--surface)',
                  color: importType === type ? 'var(--primary)' : 'var(--on-surface)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}>
                <Icon style={{ width: 24, height: 24, margin: '0 auto 0.5rem' }} />
                <div>{config.th}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{config.en}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* IMPORT STEP */}
      {activeTab === 'import' && (
        <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 20, padding: '2rem' }}>
          {step === 'select' && (
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 2rem', borderRadius: 16, border: '2px dashed var(--outline)', cursor: 'pointer' }}>
                {loading ? (
                  <Loader2 style={{ width: 48, height: 48, color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <FileSpreadsheet style={{ width: 48, height: 48, color: 'var(--primary)' }} />
                )}
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--on-surface)' }}>เลือกไฟล์ Excel ของ Morix</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>.xlsx, .xls</p>
                </div>
                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} disabled={loading} />
              </label>
              
              <div style={{ marginTop: '2rem', textAlign: 'left', backgroundColor: 'var(--surface)', borderRadius: 12, padding: '1rem' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>📋 รูปแบบที่รองรับ:</h4>
                <ul style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><strong>Product List:</strong> รหัสสินค้า, ประเภท, สี, ขนาด, ราคา FOB</li>
                  <li><strong>Inventory:</strong> รหัสสินค้า, สต็อกขั้นต่ำ, Opening, Current</li>
                  <li><strong>Stock Movement:</strong> วันที่, IN/OUT, รหัสสินค้า, จำนวนมัด</li>
                  <li><strong>Assumptions:</strong> อัตราแลกเปลี่ยน, ค่าขนส่ง, Markup</li>
                </ul>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div>
              {/* File Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--primary-container)', borderRadius: 12, marginBottom: '1.5rem' }}>
                <FileSpreadsheet style={{ width: 20, height: 20, color: 'var(--primary)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: 'var(--on-primary-container)' }}>{fileName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-primary-container)', opacity: 0.8 }}>
                    {rows.length} rows • {headers.length} columns • Sheet: {selectedSheet}
                  </p>
                </div>
                <select value={selectedSheet} onChange={e => {
                  setSelectedSheet(e.target.value);
                  // Re-parse selected sheet
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const data = new Uint8Array(evt.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    parseSheet(workbook, e.target.value);
                  };
                  // Need to reload file - this is simplified
                }}
                  style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--outline)', backgroundColor: 'var(--surface)' }}>
                  {sheets.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Field Mapping */}
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>จับคู่คอลัมน์:</h3>
              <div style={{ maxHeight: 400, overflow: 'auto', marginBottom: '1.5rem' }}>
                {headers.map((header, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{header}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                        ตัวอย่าง: {String(rows[0]?.[header] || '-').substring(0, 30)}
                      </p>
                    </div>
                    <span style={{ color: 'var(--on-surface-variant)' }}>→</span>
                    <select value={fieldMappings[header] || ''} onChange={e => setFieldMappings({ ...fieldMappings, [header]: e.target.value })}
                      style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--outline)', backgroundColor: 'var(--surface)', fontSize: '0.875rem' }}>
                      <option value="">-- ไม่นำเข้า --</option>
                      {Object.entries((MORIX_SHEETS[importType as keyof typeof MORIX_SHEETS] || MORIX_SHEETS.products).fieldMapping).map(([key, value]) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Data Preview */}
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>ตัวอย่างข้อมูล (5 แถวแรก):</h3>
              <div style={{ overflow: 'auto', marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: 8, overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--surface-container-high)' }}>
                      {headers.slice(0, 8).map((h, i) => (
                        <th key={i} style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--outline-variant)' }}>
                        {headers.slice(0, 8).map((h, j) => (
                          <td key={j} style={{ padding: '0.5rem', color: 'var(--on-surface-variant)' }}>{String(row[h] || '-')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={resetForm} style={{ padding: '0.75rem 1.5rem', borderRadius: 12, border: '1px solid var(--outline)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>ยกเลิก</button>
                <button onClick={handleImport} style={{ padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                  นำเข้า {rows.length} รายการ
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader2 style={{ width: 48, height: 48, color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>กำลังนำเข้า {rows.length} รายการ...</p>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: result.failed === 0 ? 'var(--success-container)' : 'var(--warning-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                {result.failed === 0 ? <Check style={{ width: 32, height: 32, color: 'var(--success)' }} /> : <AlertCircle style={{ width: 32, height: 32, color: 'var(--warning)' }} />}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                {result.failed === 0 ? 'นำเข้าสำเร็จ!' : 'นำเข้าเสร็จบางส่วน'}
              </h3>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--success-container)', borderRadius: 12 }}>
                  <p style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--success)' }}>{result.success}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>สำเร็จ</p>
                </div>
                {result.skipped > 0 && (
                  <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--warning-container)', borderRadius: 12 }}>
                    <p style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--warning)' }}>{result.skipped}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>ข้าม</p>
                  </div>
                )}
                {result.failed > 0 && (
                  <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--error-container)', borderRadius: 12 }}>
                    <p style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--error)' }}>{result.failed}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>ล้มเหลว</p>
                  </div>
                )}
              </div>
              {result.errors.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: 8, textAlign: 'left', maxHeight: 150, overflow: 'auto' }}>
                  {result.errors.map((err, i) => (
                    <p key={i} style={{ fontSize: '0.75rem', color: 'var(--error)', fontFamily: 'monospace' }}>{err}</p>
                  ))}
                </div>
              )}
              <button onClick={resetForm} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                นำเข้าไฟล์อื่น
              </button>
            </div>
          )}
        </div>
      )}

      {/* EXPORT STEP */}
      {activeTab === 'export' && (
        <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 20, padding: '2rem', textAlign: 'center' }}>
          <Download style={{ width: 48, height: 48, color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Export {typeLabels[importType].th}
          </h3>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
            ส่งออกข้อมูล {typeLabels[importType].en} เป็นไฟล์ Excel
          </p>
          <button onClick={handleExport} disabled={loading}
            style={{ padding: '0.875rem 2rem', borderRadius: 12, border: 'none', background: 'var(--primary)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.6 : 1 }}>
            {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Download style={{ width: 18, height: 18 }} />}
            {loading ? 'กำลังส่งออก...' : 'ดาวน์โหลด Excel'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
