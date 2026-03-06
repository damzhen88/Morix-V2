import type { Metadata } from "next";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AppProvider } from "@/store";

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
        <AppProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </AppProvider>
      </body>
    </html>
  );
}
