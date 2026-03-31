'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2, ArrowLeft, Package, Database, Receipt, Settings } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ImportType, MORIX_SCHEMA, TYPE_CONFIG, getRequiredFields } from '@/lib/morix-schema';
import { convertValue, validateRow, hasRequiredFields } from '@/lib/morix-validator';

// Dynamic import xlsx to avoid SSR issues
const XLSX = dynamic(() => import('xlsx'), { ssr: false });

export default function ImportPage() {
  const [step, setStep] = useState<'select' | 'preview' | 'importing' | 'done'>('select');
  const [importType, setImportType] = useState<ImportType>('products');
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [workbook, setWorkbook] = useState<any>(null);
  const [result, setResult] = useState({ success: 0, failed: 0, skipped: 0, errors: [] as any[] });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = TYPE_CONFIG[importType];
  const schema = MORIX_SCHEMA[importType];

  // Parse Excel file
  const parseExcel = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const XLSXModule = await import('xlsx');
      const XLSXLib = XLSXModule.default || XLSXModule;
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const wb = XLSXLib.read(data, { type: 'array' });
          setWorkbook(wb);

          const sheetNames = wb.SheetNames;
          setSheets(sheetNames);

          // Auto-select sheet
          const autoSheet = sheetNames.find(s => 
            s.toLowerCase().includes(config.sheet.toLowerCase())
          ) || sheetNames[0];
          setSelectedSheet(autoSheet);

          // Parse the sheet
          parseSheet(wb, autoSheet, XLSXLib);
        } catch (err) {
          alert('ไม่สามารถอ่านไฟล์ได้');
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการโหลดไลบรารี');
      setLoading(false);
    }
  }, [config.sheet]);

  const parseSheet = (wb: any, sheetName: string, XLSXLib: any) => {
    const ws = wb.Sheets[sheetName];
    const json = XLSXLib.utils.sheet_to_json(ws, { header: 1 }) as any[][];

    if (json.length < 2) {
      alert('ไฟล์ว่างเปล่า');
      return;
    }

    // Find header row using deterministic method
    let headerIdx = 0;
    for (let i = 0; i < Math.min(10, json.length); i++) {
      const row = json[i];
      let matchCount = 0;

      for (const cell of row) {
        const cellStr = String(cell || '').toLowerCase().replace(/\s+/g, ' ');
        
        for (const field of schema) {
          for (const header of field.excelHeaders) {
            const headerStr = header.toLowerCase().replace(/\s+/g, ' ');
            if (cellStr.includes(headerStr) || headerStr.includes(cellStr)) {
              matchCount++;
              break;
            }
          }
        }
      }

      if (matchCount >= 2) {
        headerIdx = i;
        break;
      }
    }

    const actualHeaders = json[headerIdx].map((h: any) => String(h || '').trim());
    const dataRows = json.slice(headerIdx + 1).filter(row => 
      row.some(cell => cell !== null && cell !== undefined && cell !== '')
    );

    // Convert to objects
    const dataObjects = dataRows.map(row => {
      const obj: Record<string, any> = {};
      actualHeaders.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    setHeaders(actualHeaders);
    setRawData(dataObjects);
    setStep('preview');
  };

  // Handle reset
  const handleReset = () => {
    setStep('select');
    setFileName('');
    setSheets([]);
    setSelectedSheet('');
    setHeaders([]);
    setRawData([]);
    setWorkbook(null);
    setResult({ success: 0, failed: 0, skipped: 0, errors: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle import
  const handleImport = async () => {
    setStep('importing');
    let success = 0, failed = 0, skipped = 0;
    const errors: any[] = [];

    const tableMap: Record<ImportType, string> = {
      products: 'products',
      stock_movement: 'stock_movements',
      inventory: 'inventory',
      assumptions: 'settings',
    };

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNumber = i + 2;

      // Check required fields
      if (!hasRequiredFields(row, headers, importType)) {
        errors.push({ row: rowNumber, message: 'Missing required fields', code: 'MISSING_REQUIRED' });
        skipped++;
        continue;
      }

      // Build record using schema
      const record: Record<string, any> = {};
      let isValid = true;

      for (const field of schema) {
        const matchedHeader = headers.find(h => {
          const hNorm = h.toLowerCase().replace(/\s+/g, ' ');
          return field.excelHeaders.some(sh => {
            const shNorm = sh.toLowerCase().replace(/\s+/g, ' ');
            return hNorm === shNorm || hNorm.includes(shNorm) || shNorm.includes(hNorm);
          });
        });

        if (matchedHeader && row[matchedHeader] !== undefined) {
          record[field.systemField] = convertValue(row[matchedHeader], field);
        } else if (field.defaultValue !== undefined) {
          record[field.systemField] = field.defaultValue;
        }
      }

      // Validate
      const { errors: validationErrors } = validateRow(row, headers, importType);
      if (validationErrors.length > 0) {
        for (const err of validationErrors) {
          errors.push({ row: rowNumber, field: err.field, message: err.message, code: 'VALIDATION_ERROR' });
        }
        failed++;
        continue;
      }

      // Insert
      try {
        let result;
        if (importType === 'assumptions') {
          result = await supabase.from(tableMap[importType]).upsert([{ key: importType, ...record }], { onConflict: 'key' });
        } else {
          result = await supabase.from(tableMap[importType]).insert(record);
        }

        if (result.error) throw result.error;
        success++;
      } catch (err: any) {
        errors.push({ row: rowNumber, message: err.message, code: 'INSERT_ERROR' });
        failed++;
      }
    }

    setResult({ success, failed, skipped, errors: errors.slice(0, 20) });
    setStep('done');
  };

  // Preview data
  const getPreview = () => {
    return rawData.slice(0, 8).map(row => {
      const obj: Record<string, any> = {};
      for (const field of schema.slice(0, 6)) {
        const matchedHeader = headers.find(h => {
          const hNorm = h.toLowerCase().replace(/\s+/g, ' ');
          return field.excelHeaders.some(sh => {
            const shNorm = sh.toLowerCase().replace(/\s+/g, ' ');
            return hNorm === shNorm || hNorm.includes(shNorm) || shNorm.includes(hNorm);
          });
        });
        obj[field.systemField] = matchedHeader ? row[matchedHeader] : '-';
      }
      return obj;
    });
  };

  const matchedCount = schema.filter(f => 
    headers.some(h => {
      const hNorm = h.toLowerCase().replace(/\s+/g, ' ');
      return f.excelHeaders.some(sh => {
        const shNorm = sh.toLowerCase().replace(/\s+/g, ' ');
        return hNorm === shNorm || hNorm.includes(shNorm) || shNorm.includes(hNorm);
      });
    })
  ).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)', padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} />
        กลับหน้าหลัก
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
          📥 Morix Import System
        </h1>
        <p style={{ color: 'var(--on-surface-variant)' }}>
          นำเข้าข้อมูลจาก Excel ด้วย Locked Schema
        </p>
      </div>

      {/* Step: Select Type */}
      {step === 'select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.75rem', display: 'block' }}>
              เลือกประเภทข้อมูล:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {(Object.entries(TYPE_CONFIG) as [ImportType, typeof TYPE_CONFIG.products][]).map(([key, cfg]) => {
                const Icon = cfg.table === 'products' ? Package : 
                             cfg.table === 'stock_movements' ? Receipt : 
                             cfg.table === 'inventory' ? Database : Settings;
                return (
                  <button key={key} onClick={() => setImportType(key)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 16,
                      border: importType === key ? '2px solid var(--primary)' : '1px solid var(--outline)',
                      backgroundColor: importType === key ? 'var(--primary-container)' : 'var(--surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <Icon style={{ width: 24, height: 24, color: importType === key ? 'var(--primary)' : 'var(--on-surface)' }} />
                      <span style={{ fontWeight: 700, color: importType === key ? 'var(--primary)' : 'var(--on-surface)' }}>
                        {cfg.nameTh}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{cfg.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schema Fields */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 12 }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--on-surface)' }}>
              🔒 Locked Schema ({config.nameTh}):
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {schema.map((field, i) => (
                <span key={i} style={{ 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: field.required ? 'var(--error-container)' : 'var(--surface)',
                  color: field.required ? 'var(--error)' : 'var(--on-surface-variant)',
                  borderRadius: 6,
                  fontSize: '0.7rem',
                  fontWeight: field.required ? 600 : 400,
                }}>
                  {field.systemField} {field.required && '*'}
                </span>
              ))}
            </div>
          </div>

          {/* Upload */}
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 2rem', borderRadius: 16, border: '2px dashed var(--outline)', cursor: 'pointer', backgroundColor: 'var(--surface-container-low)' }}>
            {loading ? (
              <Loader2 style={{ width: 48, height: 48, color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Upload style={{ width: 48, height: 48, color: 'var(--primary)' }} />
            )}
            <div>
              <p style={{ fontWeight: 700, color: 'var(--on-surface)' }}>คลิกเลือกไฟล์ Excel</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>.xlsx, .xls</p>
            </div>
            <input type="file" accept=".xlsx,.xls" onChange={parseExcel} ref={fileInputRef} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 20, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--primary-container)', borderRadius: 12 }}>
            <FileSpreadsheet style={{ width: 24, height: 24, color: 'var(--primary)' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: 'var(--on-primary-container)' }}>{fileName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-primary-container)', opacity: 0.8 }}>
                {rawData.length} rows • Sheet: {selectedSheet}
              </p>
            </div>
            <select value={selectedSheet} onChange={async e => {
              setSelectedSheet(e.target.value);
              if (workbook) {
                const XLSXModule = await import('xlsx');
                const XLSXLib = XLSXModule.default || XLSXModule;
                parseSheet(workbook, e.target.value, XLSXLib);
              }
            }} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--outline)' }}>
              {sheets.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Mapping Progress */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: 12, marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Schema Mapping</span>
              <span style={{ color: matchedCount === schema.length ? 'var(--success)' : 'var(--warning)' }}>
                {matchedCount}/{schema.length} fields
              </span>
            </div>
            <div style={{ height: 4, backgroundColor: 'var(--surface-container-high)', borderRadius: 2 }}>
              <div style={{ 
                width: `${(matchedCount / schema.length) * 100}%`, 
                height: '100%', 
                backgroundColor: matchedCount === schema.length ? 'var(--success)' : 'var(--warning)',
                borderRadius: 2,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          {/* Preview Table */}
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>ตัวอย่างข้อมูล:</h3>
          <div style={{ overflow: 'auto', maxHeight: 400, marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-container-high)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>#</th>
                  {schema.slice(0, 6).map((field, i) => (
                    <th key={i} style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>
                      {field.systemField}{field.required && <span style={{ color: 'var(--error)' }}> *</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getPreview().map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--outline-variant)' }}>
                    <td style={{ padding: '0.75rem' }}>{i + 1}</td>
                    {schema.slice(0, 6).map((field, j) => (
                      <td key={j} style={{ padding: '0.75rem' }}>
                        {row[field.systemField] !== undefined ? String(row[field.systemField]).substring(0, 20) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setStep('select')} style={{ padding: '0.75rem 1.5rem', borderRadius: 12, border: '1px solid var(--outline)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
              ยกเลิก
            </button>
            <button onClick={handleImport} style={{ padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
              นำเข้า {rawData.length} รายการ
            </button>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === 'importing' && (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 20 }}>
          <Loader2 style={{ width: 48, height: 48, color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>กำลังนำเข้า {rawData.length} รายการ...</p>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: result.failed === 0 ? 'var(--success-container)' : 'var(--warning-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            {result.failed === 0 ? <Check style={{ width: 36, height: 36, color: 'var(--success)' }} /> : <AlertCircle style={{ width: 36, height: 36, color: 'var(--warning)' }} />}
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {result.failed === 0 ? '✅ นำเข้าสำเร็จ!' : '⚠️ นำเข้าเสร็จบางส่วน'}
          </h3>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--success-container)', borderRadius: 12 }}>
              <p style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--success)' }}>{result.success}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>สำเร็จ</p>
            </div>
            {result.skipped > 0 && (
              <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--warning-container)', borderRadius: 12 }}>
                <p style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--warning)' }}>{result.skipped}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>ข้าม</p>
              </div>
            )}
            {result.failed > 0 && (
              <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--error-container)', borderRadius: 12 }}>
                <p style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--error)' }}>{result.failed}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>ล้มเหลว</p>
              </div>
            )}
          </div>

          {result.errors.length > 0 && (
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: 8, textAlign: 'left', marginBottom: '1.5rem', maxHeight: 150, overflow: 'auto' }}>
              {result.errors.map((e, i) => <p key={i} style={{ fontSize: '0.75rem', color: 'var(--error)', fontFamily: 'monospace' }}>Row {e.row}: {e.message}</p>)}
            </div>
          )}

          <button onClick={() => setStep('select')} style={{ padding: '0.875rem 2rem', borderRadius: 12, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
            นำเข้าไฟล์อื่น
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
