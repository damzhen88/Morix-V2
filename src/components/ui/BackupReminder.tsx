'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { shouldRemindBackup, getLastBackupAt } from '@/lib/local-db';
import { timeAgoTH } from '@/lib/format';

/** ปิดแล้วเงียบไป 1 วัน แล้วเตือนอีก — ไม่ปิดถาวรเพราะความเสี่ยงไม่หายไป */
const SNOOZE_KEY = 'morix-backup-reminder-snooze';
const SNOOZE_MS = 86_400_000;

/**
 * เตือนให้สำรองข้อมูล
 *
 * ข้อมูลอยู่บนเครื่องเท่านั้น การล้างข้อมูลเบราว์เซอร์หรือลบแอปออกจากหน้าจอโฮม
 * ทำให้ข้อมูลหายถาวร แถบนี้จึงไม่ใช่ของฟุ่มเฟือย
 */
export default function BackupReminder() {
  const [show, setShow] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    // หน่วงไว้ให้ store โหลดข้อมูลก่อน ไม่งั้น isEmpty() จะยังเป็น true
    const timer = setTimeout(() => {
      try {
        const snoozedAt = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
        if (Date.now() - snoozedAt < SNOOZE_MS) return;
      } catch {
        /* โหมดส่วนตัวอ่านไม่ได้ ถือว่าไม่เคย snooze */
      }

      if (shouldRemindBackup()) {
        setLastBackup(getLastBackupAt());
        setShow(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const snooze = () => {
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now())); } catch { /* ไม่เป็นไร */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="card-surface p-4 mb-6 border-l-4 flex items-start gap-3" style={{ borderLeftColor: 'var(--warning)' }}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[var(--on-surface)]">
          {lastBackup ? 'ควรสำรองข้อมูลอีกครั้ง' : 'ยังไม่เคยสำรองข้อมูล'}
        </p>
        <p className="text-xs text-[var(--on-surface-variant)] mt-0.5 leading-relaxed">
          ข้อมูลเก็บอยู่บนเครื่องนี้เท่านั้น ถ้าล้างข้อมูลเบราว์เซอร์หรือลบแอปออก ข้อมูลจะหายถาวร
          {lastBackup && ` · สำรองล่าสุด ${timeAgoTH(lastBackup)}`}
        </p>
        <Link href="/settings"
          className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold hover:underline"
          style={{ color: 'var(--primary)' }}>
          ไปสำรองข้อมูล
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <button onClick={snooze} aria-label="ปิดการเตือน"
        className="p-1.5 rounded-lg hover:bg-[var(--surface-container-low)] transition-colors flex-shrink-0"
        style={{ color: 'var(--on-surface-variant)' }}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
