'use client';

import { useEffect, useState } from 'react';
import { Share, Plus, X, Download, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'morix-install-dismissed';

/** BeforeInstallPromptEvent ยังไม่อยู่ใน TS lib มาตรฐาน */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * ลงทะเบียน service worker และชวนติดตั้งเป็นแอปบนเครื่อง
 *
 * iOS ไม่ให้เด้ง prompt อัตโนมัติแบบ Android — ต้องบอกวิธีทำมือ
 * (แชร์ -> เพิ่มไปยังหน้าจอโฮม) จึงต้องแยกการแสดงผลสองแบบ
 */
export default function InstallPrompt() {
  const [platform, setPlatform] = useState<'ios' | 'prompt' | null>(null);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    // ลงทะเบียน service worker เพื่อให้เปิดแอปได้ตอนออฟไลน์
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('[pwa] ลงทะเบียน service worker ไม่สำเร็จ', err);
      });
    }

    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    // ติดตั้งไปแล้ว: iOS ใช้ navigator.standalone, ที่อื่นใช้ display-mode
    const installed =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (installed) return;

    const ua = window.navigator.userAgent;
    // iPadOS 13+ รายงานตัวเองเป็น Mac ต้องเช็ค touch ประกอบ
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);

    if (isIOS) {
      // Safari เท่านั้นที่เพิ่มลงหน้าจอโฮมได้ Chrome บน iOS ทำไม่ได้
      const isSafari = !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
      if (isSafari) setPlatform('ios');
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
      setPlatform('prompt');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* โหมดส่วนตัวเขียนไม่ได้ */ }
    setPlatform(null);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') dismiss();
  };

  if (!platform) return null;

  return (
    <div
      className="fixed left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[90] card-elevated p-4"
      style={{ bottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
          <Smartphone className="w-5 h-5 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--on-surface)]">ติดตั้งเป็นแอปบนเครื่อง</p>

          {platform === 'ios' ? (
            <>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1 leading-relaxed">
                เปิดใช้งานได้เร็วขึ้นและใช้ได้แม้ไม่มีเน็ต
              </p>
              <ol className="text-xs text-[var(--on-surface-variant)] mt-2 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--primary)]">1.</span>
                  กดปุ่มแชร์
                  <Share className="w-3.5 h-3.5 inline flex-shrink-0" />
                  ด้านล่างจอ
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--primary)]">2.</span>
                  เลือก
                  <Plus className="w-3.5 h-3.5 inline flex-shrink-0" />
                  <span className="font-semibold">เพิ่มไปยังหน้าจอโฮม</span>
                </li>
              </ol>
            </>
          ) : (
            <>
              <p className="text-xs text-[var(--on-surface-variant)] mt-1 leading-relaxed">
                เปิดใช้งานได้เร็วขึ้นและใช้ได้แม้ไม่มีเน็ต
              </p>
              <button onClick={install}
                className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                <Download className="w-3.5 h-3.5" />
                ติดตั้งเลย
              </button>
            </>
          )}
        </div>

        <button onClick={dismiss} aria-label="ปิด"
          className="p-1.5 rounded-lg hover:bg-[var(--surface-container-low)] transition-colors flex-shrink-0"
          style={{ color: 'var(--on-surface-variant)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
