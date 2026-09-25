import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Database, Clock, GitBranch, Calculator, Calendar,
  Zap, AlertTriangle
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'داشبورد', icon: LayoutDashboard },
  { to: '/load-data', label: 'داده‌های بار شبکه', icon: Database },
  { to: '/temporal-constraints', label: 'محدودیت‌های زمانی خاموشی', icon: Clock },
  { to: '/feeder-relations', label: 'محدودیت‌های هم‌زمانی فیدرها', icon: GitBranch },
  { to: '/calculation', label: 'محاسبه برنامه هفتگی', icon: Calculator },
  { to: '/schedule', label: 'مشاهده برنامه خاموشی', icon: Calendar },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex" style={{ direction: 'rtl', fontFamily: 'Vazirmatn, sans-serif' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 fixed top-0 bottom-0 right-0 z-20">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight">سیستم مدیریت</div>
            <div className="text-xs text-slate-400 leading-tight">بار شبکه برق</div>
          </div>
        </div>

        <div className="px-3 py-2 flex-1 overflow-y-auto">
          <div className="text-xs text-slate-500 uppercase tracking-wider px-3 py-2 mt-2">منو اصلی</div>
          <nav className="space-y-0.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-4 py-3 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/50 rounded-lg px-3 py-2">
            <AlertTriangle size={12} />
            <span>داده آزمایشی — ذخیره در مرورگر</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 mr-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
