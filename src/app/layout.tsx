import type { Metadata } from "next";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AppProvider } from "@/store";
import { AuthProvider } from "@/lib/auth-context";

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
            <DashboardLayout>{children}</DashboardLayout>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
