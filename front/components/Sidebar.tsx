"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, AlertTriangle, X } from "lucide-react";
import { Nav } from "@/app/variables/adminnavbar";

interface SidebarProps {
  navItems: Nav[];
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  navItems,
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full">
      {/* سربرگ سایدبار */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight">سیستم مدیریت</div>
            <div className="text-xs text-slate-400 leading-tight">
              بار شبکه برق
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
            aria-label="بستن منو"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* لیست لینک‌ها */}
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="text-xs text-slate-500 uppercase tracking-wider px-3 py-2 mt-2">
          منو اصلی
        </div>
        <nav className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/" ? pathname === "/" : pathname.startsWith(to);
            console.log(to === "/", pathname === "/", pathname.startsWith(to));

            return (
              <Link
                key={to}
                href={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* فوتر سایدبار */}
      <div className="px-4 py-3 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/50 rounded-lg px-3 py-2">
          <AlertTriangle size={12} className="shrink-0" />
          <span>داده آزمایشی — ذخیره در مرورگر</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* نسخه دسکتاپ (فیکس در سمت راست) */}
      <div className="hidden lg:block fixed top-0 bottom-0 right-0 z-20 w-64">
        {sidebarContent}
      </div>

      {/* نسخه موبایل (کشویی با لایه تاریک پشت آن) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="h-full z-10">{sidebarContent}</div>
          <div
            className="flex-1 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
        </div>
      )}
    </>
  );
}
