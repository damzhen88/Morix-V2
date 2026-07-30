import type { Metadata } from "next";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AppProvider } from "@/store";
import { ToastProvider } from "@/components/ui/Toast";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "MORIX DECORATIVE - CRM & Inventory",
  description: "ระบบจัดการธุรกิจ MORIX DECORATIVE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">
        <I18nProvider>
          <AppProvider>
            <ToastProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </ToastProvider>
          </AppProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
