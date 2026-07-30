'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2, Database, Download, Upload, Trash2, HardDrive,
  AlertTriangle, Save, Info, ShieldCheck, Image as ImageIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useApp, useMutations } from '@/store';
import {
  readSettings, writeSettings, exportDatabase, importDatabase,
  estimateUsage, formatBytes, resetDatabase, markBackedUp, getLastBackupAt,
  StorageFullError, DEFAULT_SETTINGS, type AppSettings,
} from '@/lib/local-db';
import { clearImages, estimateImageBytes } from '@/lib/local-images';
import { downloadJson } from '@/lib/export-excel';
import { formatThaiDate, timeAgoTH } from '@/lib/format';
import { CREDIT_TERM_OPTIONS, creditTermLabelTH } from '@/lib/payment';

export default function SettingsPage() {
  const { toast } = useToast();
  const { state } = useApp();
  const { reload } = useMutations();
  const fileInput = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);
  const [usage, setUsage] = useState({ bytes: 0, percent: 0, quota: 0 });
  const [imageBytes, setImageBytes] = useState(0);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  // อ่านค่าหลัง mount — localStorage ไม่มีตอน SSR
  useEffect(() => {
    setSettings(readSettings());
    setUsage(estimateUsage());
    setLastBackup(getLastBackupAt());
    estimateImageBytes().then(setImageBytes);
  }, []);

  const refreshUsage = () => {
    setUsage(estimateUsage());
    setLastBackup(getLastBackupAt());
    estimateImageBytes().then(setImageBytes);
  };

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => {
    setSettings(s => ({ ...s, [k]: v }));
    setDirty(true);
  };

  const saveSettings = () => {
    try {
      writeSettings(settings);
      setDirty(false);
      toast('บันทึกการตั้งค่าแล้ว', 'success');
    } catch (err) {
      toast(err instanceof StorageFullError ? err.message : 'บันทึกไม่สำเร็จ', 'error');
    }
  };

  // ── สำรองข้อมูล
  const handleExport = () => {
    try {
      downloadJson(exportDatabase(), 'morix-backup');
      markBackedUp();
      refreshUsage();
      toast('ส่งออกไฟล์สำรองแล้ว เก็บไฟล์ไว้ในที่ปลอดภัย', 'success');
    } catch {
      toast('ส่งออกไฟล์สำรองไม่สำเร็จ', 'error');
    }
  };

  const handleImportFile = async (file: File) => {
    if (!confirm(
      'การกู้คืนจะแทนที่ข้อมูลทั้งหมดที่มีอยู่บนเครื่องนี้\n\n' +
      'ข้อมูลปัจจุบันจะหายและกู้กลับไม่ได้ ถ้ายังไม่ได้สำรองไว้ ให้กดยกเลิกแล้วส่งออกก่อน\n\n' +
      'ต้องการกู้คืนต่อหรือไม่ ?'
    )) return;

    try {
      const text = await file.text();
      importDatabase(JSON.parse(text));
      reload();
      refreshUsage();
      toast('กู้คืนข้อมูลเรียบร้อย', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'อ่านไฟล์สำรองไม่สำเร็จ', 'error');
    } finally {
      // เคลียร์ค่าเพื่อให้เลือกไฟล์เดิมซ้ำได้
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleReset = async () => {
    if (!confirm(
      'ล้างข้อมูลทั้งหมดบนเครื่องนี้ แล้วเริ่มใหม่ด้วยข้อมูลตัวอย่าง\n\n' +
      'บิล ลูกค้า สินค้า การรับเงิน และรูปทั้งหมดจะถูกลบและกู้กลับไม่ได้\n\n' +
      'ยืนยันหรือไม่ ?'
    )) return;

    if (!confirm('ยืนยันอีกครั้ง — ข้อมูลจะหายถาวร')) return;

    try {
      await clearImages();
      resetDatabase();
      reload();
      refreshUsage();
      toast('ล้างข้อมูลและเริ่มใหม่แล้ว', 'info');
    } catch {
      toast('ล้างข้อมูลไม่สำเร็จ', 'error');
    }
  };

  const recordCounts = useMemo(
    () => [
      { label: 'สินค้า', value: state.products.length },
      { label: 'ลูกค้า', value: state.customers.length },
      { label: 'บิลขาย', value: state.salesOrders.length },
      { label: 'การรับเงิน', value: state.payments.length },
      { label: 'ใบสั่งซื้อ', value: state.purchaseOrders.length },
      { label: 'ค่าใช้จ่าย', value: state.expenses.length },
    ],
    [state]
  );

  const backupStale = !lastBackup || Date.now() - new Date(lastBackup).getTime() > 7 * 86_400_000;

  const fieldStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-container-low)',
    border: '1px solid transparent',
    borderRadius: 12, padding: '0.75rem 1rem',
    width: '100%', fontSize: '0.875rem',
    color: 'var(--on-surface)', fontFamily: 'var(--font-body)', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 700,
    letterSpacing: '0.02em',
    color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface)' }}>

      {/* หัวหน้า */}
      <div className="page-header">
        <div className="page-header-eyebrow">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
          ตั้งค่าระบบ
        </div>
        <h1 className="page-header-title">ตั้งค่า</h1>
        <p className="page-header-subtitle">ข้อมูลกิจการ และการสำรองข้อมูล</p>
      </div>

      {/* เตือนสำรองข้อมูล — ขึ้นก่อนทุกอย่างเพราะเป็นความเสี่ยงจริงของแอปที่เก็บข้อมูลบนเครื่อง */}
      {backupStale && state.products.length > 0 && (
        <div className="card-elevated p-5 mb-6 border-l-4" style={{ borderLeftColor: 'var(--warning)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--on-surface)]">
                {lastBackup ? 'ควรสำรองข้อมูลอีกครั้ง' : 'ยังไม่เคยสำรองข้อมูล'}
              </p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1 leading-relaxed">
                ข้อมูลทั้งหมดเก็บอยู่บนเครื่องนี้เท่านั้น ถ้าล้างข้อมูลเบราว์เซอร์
                ลบแอปออกจากหน้าจอโฮม หรือเครื่องหาย ข้อมูลจะหายถาวรและกู้กลับไม่ได้
                {lastBackup && ` · สำรองครั้งล่าสุด ${timeAgoTH(lastBackup)}`}
              </p>
              <button onClick={handleExport}
                className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                <Download className="w-3.5 h-3.5" />
                สำรองข้อมูลตอนนี้
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── ข้อมูลกิจการ ── */}
        <section className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="font-headline font-bold text-[var(--on-surface)]">ข้อมูลกิจการ</h2>
              <p className="text-xs text-[var(--on-surface-variant)]">ใช้แสดงในเอกสารและรายงาน</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label style={labelStyle}>ชื่อกิจการ</label>
              <input style={fieldStyle} value={settings.companyName}
                onChange={e => set('companyName', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>เลขผู้เสียภาษี</label>
                <input style={fieldStyle} placeholder="0-0000-00000-00-0"
                  value={settings.taxId} onChange={e => set('taxId', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>เบอร์โทร</label>
                <input type="tel" style={fieldStyle} placeholder="02-000-0000"
                  value={settings.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>ที่อยู่</label>
              <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 64 }}
                value={settings.address} onChange={e => set('address', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>อัตรา VAT (%)</label>
                <input type="number" min="0" max="100" step="0.01" inputMode="decimal" style={fieldStyle}
                  value={settings.vatPercent}
                  onChange={e => set('vatPercent', Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div>
                <label style={labelStyle}>เครดิตตั้งต้นของลูกค้าใหม่</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...fieldStyle, cursor: 'pointer', appearance: 'none' }}
                    value={settings.defaultCreditTermDays}
                    onChange={e => set('defaultCreditTermDays', Number(e.target.value))}>
                    {CREDIT_TERM_OPTIONS.map(d => (
                      <option key={d} value={d}>{creditTermLabelTH(d)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={saveSettings} disabled={!dirty}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              style={{
                background: dirty ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--surface-container-high)',
                color: dirty ? 'white' : 'var(--on-surface-variant)',
                cursor: dirty ? 'pointer' : 'not-allowed',
              }}>
              <Save className="w-4 h-4" />
              {dirty ? 'บันทึกการตั้งค่า' : 'บันทึกแล้ว'}
            </button>
          </div>
        </section>

        {/* ── ข้อมูลและการสำรอง ── */}
        <section className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-container)] flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="font-headline font-bold text-[var(--on-surface)]">ข้อมูลและการสำรอง</h2>
              <p className="text-xs text-[var(--on-surface-variant)]">ข้อมูลเก็บบนเครื่องนี้เท่านั้น</p>
            </div>
          </div>

          {/* จำนวนรายการ */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {recordCounts.map(r => (
              <div key={r.label} className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface-container-low)' }}>
                <p className="font-headline font-extrabold text-lg text-[var(--on-surface)]">{r.value}</p>
                <p className="text-[11px] text-[var(--on-surface-variant)]">{r.label}</p>
              </div>
            ))}
          </div>

          {/* พื้นที่ที่ใช้ */}
          <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: 'var(--surface-container-low)' }}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="flex items-center gap-2 text-xs font-bold text-[var(--on-surface-variant)]">
                <HardDrive className="w-3.5 h-3.5" />
                พื้นที่ข้อมูล
              </span>
              <span className="text-xs font-bold text-[var(--on-surface)]">
                {formatBytes(usage.bytes)} / {formatBytes(usage.quota)}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-container-high)' }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(2, usage.percent)}%`,
                  backgroundColor: usage.percent > 80 ? 'var(--error)' : usage.percent > 60 ? 'var(--warning)' : 'var(--primary)',
                }} />
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-[var(--on-surface-variant)] mt-2">
              <ImageIcon className="w-3 h-3 flex-shrink-0" />
              รูปภาพอีก {formatBytes(imageBytes)} (เก็บแยกไม่กินพื้นที่ก้อนนี้)
            </p>
            {usage.percent > 80 && (
              <p className="text-[11px] font-bold mt-1.5" style={{ color: 'var(--error)' }}>
                พื้นที่ใกล้เต็ม — ควรสำรองข้อมูลแล้วลบรายการเก่าที่ไม่ใช้
              </p>
            )}
          </div>

          {/* ปุ่มสำรอง / กู้คืน */}
          <div className="space-y-3">
            <button onClick={handleExport}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--outline-variant)] hover:shadow-md transition-all text-left">
              <Download className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--on-surface)]">ส่งออกไฟล์สำรอง (JSON)</p>
                <p className="text-xs text-[var(--on-surface-variant)]">
                  ได้ข้อมูลทั้งหมดในไฟล์เดียว กู้กลับเข้าแอปได้
                  {lastBackup && ` · ล่าสุด ${formatThaiDate(lastBackup, { short: true })}`}
                </p>
              </div>
            </button>

            <input ref={fileInput} type="file" accept="application/json,.json" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); }} />

            <button onClick={() => fileInput.current?.click()}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--outline-variant)] hover:shadow-md transition-all text-left">
              <Upload className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--on-surface)]">กู้คืนจากไฟล์สำรอง</p>
                <p className="text-xs text-[var(--on-surface-variant)]">แทนที่ข้อมูลทั้งหมดบนเครื่องนี้</p>
              </div>
            </button>

            <button onClick={handleReset}
              className="w-full flex items-center gap-3 p-4 rounded-xl border hover:shadow-md transition-all text-left"
              style={{ borderColor: 'var(--error)' }}>
              <Trash2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--error)' }} />
              <div className="min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--error)' }}>ล้างข้อมูลและเริ่มใหม่</p>
                <p className="text-xs text-[var(--on-surface-variant)]">ลบทุกอย่างแล้วใส่ข้อมูลตัวอย่างกลับมา</p>
              </div>
            </button>
          </div>

          {/* หมายเหตุเรื่องข้อจำกัด — บอกตรงๆ ดีกว่าให้ผู้ใช้มาเจอเองตอนข้อมูลหาย */}
          <div className="mt-5 pt-5 border-t border-[var(--outline-variant)] space-y-2.5">
            {[
              { icon: ShieldCheck, text: 'ข้อมูลไม่ถูกส่งออกจากเครื่องนี้เลย ไม่มีการเชื่อมต่อเซิร์ฟเวอร์' },
              { icon: Info, text: 'ข้อมูลผูกกับเบราว์เซอร์ตัวนี้ เปิดจากเครื่องอื่นหรือเบราว์เซอร์อื่นจะไม่เห็นข้อมูลเดียวกัน' },
              { icon: AlertTriangle, text: 'ลบแอปออกจากหน้าจอโฮม หรือล้างข้อมูลเบราว์เซอร์ = ข้อมูลหายถาวร ควรสำรองสม่ำเสมอ' },
            ].map((n, i) => {
              const Icon = n.icon;
              return (
                <p key={i} className="flex items-start gap-2 text-[11px] text-[var(--on-surface-variant)] leading-relaxed">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {n.text}
                </p>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
