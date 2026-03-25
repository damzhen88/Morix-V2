import type { Metadata } from "next";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AppProvider } from "@/store";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";

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
        <AuthProvider>
          <AppProvider>
            <ToastProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
