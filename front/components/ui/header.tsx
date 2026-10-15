"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronDown,
  CircleUserRound,
  Menu,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui";
import { titles } from "@/app/variables/titles";

interface HeaderSuperAdminProps {
  onOpenMobileMenu?: () => void;
}

export default function HeaderSuperAdmin({
  onOpenMobileMenu,
}: HeaderSuperAdminProps) {
  const [company, setCompany] = useState("همه شرکت‌ها");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={onOpenMobileMenu}
        aria-label="باز کردن منو"
      >
        <Menu size={20} />
      </Button>

      <div className="hidden md:block">
        <div className="text-xs text-slate-400">مدیریت ارشد /</div>
        <div className="mt-1 text-sm font-bold text-slate-800">
          {titles[pathname] ?? "پلتفرم"}
        </div>
      </div>

      <div className="mx-auto flex min-w-0 max-w-xl flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Building2 size={16} className="shrink-0 text-slate-400" />
        <div className="hidden shrink-0 text-xs text-slate-500 sm:block">
          شرکت فعال:
        </div>
        <select
          aria-label="انتخاب شرکت"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-700 outline-none"
        >
          <option>همه شرکت‌ها</option>
          <option>TEH-01 — توزیع نیروی برق تهران | تهران</option>
          <option>ESF-02 — توزیع نیروی برق اصفهان | اصفهان</option>
          <option>FRS-04 — توزیع نیروی برق فارس | فارس</option>
        </select>
        <ChevronDown size={14} className="text-slate-400" />
      </div>

      <Button variant="ghost" size="sm" className="relative text-slate-500">
        <Bell size={18} />
        <span className="absolute left-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="hidden text-slate-500 sm:inline-flex"
      >
        <Search size={18} />
      </Button>

      <CircleUserRound size={28} className="text-slate-400" />
    </header>
  );
}
