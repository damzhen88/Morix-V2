import type { Metadata, Viewport } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AppProvider } from "@/store";
import { ToastProvider } from "@/components/ui/Toast";
import InstallPrompt from "@/components/ui/InstallPrompt";

/**
 * Sarabun — ฟอนต์ไทยที่ next/font โฮสต์เองบนโดเมนเรา
 *
 * เดิมโหลด Outfit + DM Sans จาก Google Fonts ซึ่ง**ไม่มี glyph ไทยเลยทั้งคู่**
 * ตัวอักษรไทยทุกตัวจึงตกไปใช้ฟอนต์ระบบและดูไม่เข้ากับตัวเลขข้างกัน
 *
 * Sarabun หนักสุด 800 (ไม่มี 900) — จุดที่เคยใช้ font-black/900 ถูกปรับเป็น 800 แล้ว
 * ไม่งั้นเบราว์เซอร์จะสังเคราะห์น้ำหนักให้และตัวหนังสือจะเบลอ
 */
const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "MORIX PRO V2 — ระบบขายและคลังสินค้า",
  description: "ระบบจัดการธุรกิจ MORIX DECORATIVE — ขาย คลังสินค้า ลูกหนี้ ทำงานได้แบบออฟไลน์",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "MORIX",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    // iOS ใช้ตัวนี้ตอนเพิ่มลงหน้าจอโฮม และไม่ทำมุมมนให้เอง
    // จึงต้องมีกรอบมนมาในไฟล์รูปแล้ว
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    // เบอร์โทรในตารางไม่ต้องให้ iOS แปลงเป็นลิงก์เอง สีจะเพี้ยนจากดีไซน์
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // จำเป็นสำหรับ safe area บน iPhone ที่มี home indicator
  viewportFit: "cover",
  themeColor: "#F97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={sarabun.variable}>
      <head>
        {/*
          Next.js 16 ปล่อยเฉพาะ mobile-web-app-capable (ชื่อมาตรฐานใหม่)
          ซึ่ง iOS 16.4+ รองรับ แต่ iOS รุ่นเก่ากว่านั้นอ่านแค่ชื่อเดิม
          ถ้าไม่มีตัวนี้ เปิดจากหน้าจอโฮมจะยังเห็นแถบ Safari
        */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <AppProvider>
          <ToastProvider>
            <DashboardLayout>{children}</DashboardLayout>
            <InstallPrompt />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
