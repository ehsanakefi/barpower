"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { adminNavItems } from "../variables/adminnavbar";
import HeaderSuperAdmin from "@/components/ui/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ direction: "rtl", fontFamily: "Vazirmatn, sans-serif" }}
    >
      {/* نوار کناری برای دسکتاپ و موبایل */}
      <Sidebar
        navItems={adminNavItems}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* بخش اصلی شامل هدر و بدنه صفحه */}
      <div className="lg:mr-64 flex flex-col min-h-screen transition-all">
        <HeaderSuperAdmin onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
}
