import type { Metadata, Viewport } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AppProvider } from "@/store";
import { ToastProvider } from "@/components/ui/Toast";

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
      <body className="antialiased">
        <AppProvider>
          <ToastProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
