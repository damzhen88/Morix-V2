import type { MetadataRoute } from 'next';

/**
 * Web App Manifest — Next.js เสิร์ฟไฟล์นี้เป็น /manifest.webmanifest
 *
 * หมายเหตุเรื่อง iOS: Safari ไม่อ่าน icons ในนี้ตอนเพิ่มลงหน้าจอโฮม
 * มันใช้ <link rel="apple-touch-icon"> เท่านั้น ซึ่งประกาศไว้ใน layout.tsx
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MORIX PRO V2 — ระบบขายและคลังสินค้า',
    short_name: 'MORIX',
    description: 'ระบบขาย คลังสินค้า และลูกหนี้ ทำงานได้แบบออฟไลน์ ข้อมูลเก็บบนเครื่อง',
    lang: 'th',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#FAF9F7',
    theme_color: '#F97316',
    categories: ['business', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // maskable เผื่อขอบไว้ 10% ให้ Android ครอบเป็นวงกลมได้ไม่กินตัว M
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'เปิดบิลขาย', short_name: 'ขาย', url: '/sales' },
      { name: 'ลูกหนี้', short_name: 'ลูกหนี้', url: '/receivables' },
      { name: 'สินค้า', short_name: 'สินค้า', url: '/products' },
    ],
  };
}
