import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, Bell, Building2, ChevronDown, CircleUserRound, Database,
  Gauge, LogOut, Menu, Search, Settings, ShieldCheck, Users, X, Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';





export default function SuperAdminLayout() {
 

  // const sidebar = (
  //   <aside className="flex h-full w-72 flex-col bg-slate-950 text-white">
  //     <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
  //       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950">
  //         <Zap size={21} fill="currentColor" />
  //       </div>
  //       <div className="min-w-0">
  //         <div className="text-sm font-bold">مرکز کنترل توان</div>
  //         <div className="mt-0.5 text-xs text-slate-400">مدیریت ارشد پلتفرم</div>
  //       </div>
  //       <Button variant="ghost" size="sm" className="mr-auto text-slate-400 lg:hidden" onClick={() => setMobileOpen(false)}>
  //         <X size={18} />
  //       </Button>
  //     </div>

  //     <div className="px-4 pt-5">
  //       <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
  //         <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
  //           <ShieldCheck size={14} className="text-emerald-400" />
  //           دسترسی سطح پلتفرم
  //         </div>
  //         <div className="flex items-center gap-2">
  //           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-blue-300">SA</div>
  //           <div>
  //             <div className="text-xs font-semibold">مدیر ارشد سیستم</div>
  //             <div className="text-[11px] text-slate-500">superadmin@grid.ir</div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
  //       <div className="px-3 pb-2 text-[11px] font-medium text-slate-500">مدیریت پلتفرم</div>
  //       {navItems.map(({ to, label, icon: Icon, count }) => (
  //         <NavLink
  //           key={to}
  //           to={to}
  //           end={to === '/'}
  //           onClick={() => setMobileOpen(false)}
  //           className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
  //             isActive
  //               ? 'bg-blue-600 font-medium text-white shadow-md shadow-blue-950/40'
  //               : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
  //           }`}
  //         >
  //           <Icon size={17} />
  //           <span>{label}</span>
  //           {count && <span className="mr-auto rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">{count}</span>}
  //         </NavLink>
  //       ))}
  //     </nav>

  //     <div className="border-t border-slate-800 p-4">
  //       <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-900 hover:text-white" onClick={() => navigate('/tenant')}>
  //         <LogOut size={16} />
  //         ورود به پنل بهره‌بردار
  //       </Button>
  //     </div>
  //   </aside>
  // );

  return (
   
  );
}
