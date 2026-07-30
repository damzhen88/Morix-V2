/**
 * Service Worker ของ MORIX PRO V2
 *
 * ข้อมูลทั้งหมดอยู่ใน localStorage/IndexedDB บนเครื่องแล้ว
 * งานเดียวของไฟล์นี้คือแคชตัวแอป (HTML/JS/CSS/ฟอนต์/ไอคอน)
 * ให้เปิดใช้ได้ตอนไม่มีเน็ต
 *
 * กลยุทธ์:
 * - หน้าเว็บ (navigation): network-first แล้ว fallback ไปแคช
 *   เพื่อให้ได้เวอร์ชันใหม่เสมอเมื่อมีเน็ต แต่ยังเปิดได้เมื่อออฟไลน์
 * - ไฟล์ static: cache-first เพราะ Next.js ใส่ hash ในชื่อไฟล์อยู่แล้ว
 *   ไฟล์ที่เปลี่ยนจะมีชื่อใหม่ ไม่มีปัญหาแคชค้าง
 */

const VERSION = 'v1';
const APP_CACHE = `morix-app-${VERSION}`;
const PAGE_CACHE = `morix-pages-${VERSION}`;

/** ไฟล์ที่ต้องมีแน่ๆ ตอนออฟไลน์ */
const PRECACHE = [
  '/',
  '/manifest.webmanifest',
  '/apple-touch-icon.png',
  '/icon-192.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_CACHE);
      // ใช้ทีละไฟล์ ไม่ใช้ addAll เพราะถ้าไฟล์เดียวพลาด addAll จะล้มทั้งชุด
      await Promise.allSettled(PRECACHE.map(url => cache.add(new Request(url, { cache: 'reload' }))));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // ลบแคชเวอร์ชันเก่าทิ้ง ไม่ให้กินพื้นที่บนเครื่องผู้ใช้
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(k => k.startsWith('morix-') && k !== APP_CACHE && k !== PAGE_CACHE)
          .map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // จัดการแค่ GET และเฉพาะโดเมนตัวเอง
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // หน้าเว็บ: เอาของใหม่ก่อน ถ้าไม่มีเน็ตใช้ของในแคช
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(PAGE_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          // ถ้าหน้านั้นยังไม่เคยเปิด ใช้หน้าแรกแทน (แอปเป็น SPA จะ route ต่อเองได้)
          return cached ?? (await caches.match('/')) ?? Response.error();
        }
      })()
    );
    return;
  }

  // ไฟล์ static: ใช้ของในแคชก่อน เร็วกว่าและใช้ได้ตอนออฟไลน์
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const fresh = await fetch(request);
        // แคชเฉพาะที่สำเร็จจริง ไม่แคช 404 หรือ error
        if (fresh.ok) {
          const cache = await caches.open(APP_CACHE);
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch {
        return Response.error();
      }
    })()
  );
});
