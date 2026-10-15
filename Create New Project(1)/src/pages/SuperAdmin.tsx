// import { useMemo, useState } from 'react';
// import {
//   Activity, AlertCircle, ArrowDownLeft, ArrowUpLeft, BarChart3, Building2,
//   CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronsUpDown, Circle,
//   Clock3, Database, Download, Edit3, Eye, FileWarning, Filter, Gauge,
//   KeyRound, Layers3, MapPin, MoreHorizontal, Plus, Power, RefreshCw,
//   Search, ServerCog, ShieldCheck, SlidersHorizontal, Trash2, UserRound,
//   Users, X, XCircle, Zap,
// } from 'lucide-react';
// import { Badge, Button, Card, Input, Select } from '@/components/ui';

// type Status = 'running' | 'queued' | 'completed' | 'failed' | 'infeasible' | 'active' | 'inactive';

// const companies = [
//   { code: 'TEH-01', name: 'توزیع نیروی برق تهران بزرگ', province: 'تهران', feeders: 182, datasets: 24, users: 38, status: 'active', activity: 'همین حالا' },
//   { code: 'ESF-02', name: 'توزیع نیروی برق اصفهان', province: 'اصفهان', feeders: 146, datasets: 19, users: 27, status: 'active', activity: '۸ دقیقه پیش' },
//   { code: 'KHZ-03', name: 'توزیع نیروی برق خوزستان', province: 'خوزستان', feeders: 215, datasets: 31, users: 42, status: 'active', activity: '۲۳ دقیقه پیش' },
//   { code: 'FRS-04', name: 'توزیع نیروی برق فارس', province: 'فارس', feeders: 121, datasets: 16, users: 19, status: 'active', activity: '۱ ساعت پیش' },
//   { code: 'GIL-05', name: 'توزیع نیروی برق گیلان', province: 'گیلان', feeders: 88, datasets: 9, users: 13, status: 'inactive', activity: '۳ روز پیش' },
// ];

// const runs = [
//   { id: 'RUN-1405-0842', company: 'توزیع برق تهران', code: 'TEH-01', week: '۱۴۰۵/۰۷/۱۲', status: 'running', dataset: 'LOAD-v24', duration: '۰۴:۱۸', error: '', progress: 68 },
//   { id: 'RUN-1405-0841', company: 'توزیع برق خوزستان', code: 'KHZ-03', week: '۱۴۰۵/۰۷/۱۲', status: 'queued', dataset: 'LOAD-v31', duration: '—', error: '', progress: 0 },
//   { id: 'RUN-1405-0840', company: 'توزیع برق اصفهان', code: 'ESF-02', week: '۱۴۰۵/۰۷/۱۲', status: 'infeasible', dataset: 'LOAD-v19', duration: '۰۲:۴۱', error: 'تعارض محدودیت زمانی برای فیدر ۱۰۲۴', progress: 100 },
//   { id: 'RUN-1405-0839', company: 'توزیع برق فارس', code: 'FRS-04', week: '۱۴۰۵/۰۷/۰۵', status: 'completed', dataset: 'LOAD-v16', duration: '۰۶:۱۲', error: '', progress: 100 },
//   { id: 'RUN-1405-0838', company: 'توزیع برق گیلان', code: 'GIL-05', week: '۱۴۰۵/۰۷/۰۵', status: 'failed', dataset: 'LOAD-v9', duration: '۰۰:۴۷', error: 'فایل مجموعه داده بار در دسترس نیست', progress: 22 },
// ];

// const users = [
//   { name: 'مهدی محمدی', username: 'm.mohammadi', email: 'mohammadi@teh.ir', company: 'توزیع برق تهران', role: 'SUPER_ADMIN', date: '۱۴۰۴/۱۲/۱۸', active: true },
//   { name: 'سارا احمدی', username: 's.ahmadi', email: 'ahmadi@esf.ir', company: 'توزیع برق اصفهان', role: 'USER', date: '۱۴۰۵/۰۱/۲۴', active: true },
//   { name: 'علی رضایی', username: 'a.rezaei', email: 'rezaei@khz.ir', company: 'توزیع برق خوزستان', role: 'USER', date: '۱۴۰۵/۰۲/۰۸', active: true },
//   { name: 'نیلوفر کریمی', username: 'n.karimi', email: 'karimi@frs.ir', company: 'توزیع برق فارس', role: 'USER', date: '۱۴۰۵/۰۳/۱۵', active: false },
//   { name: 'حسین اکبری', username: 'h.akbari', email: 'akbari@gil.ir', company: 'توزیع برق گیلان', role: 'USER', date: '۱۴۰۵/۰۴/۰۲', active: true },
// ];

// const outages = [
//   { feeder: 'فیدر ابوذر', code: 'FD-1024', day: 'شنبه', date: '۱۴۰۵/۰۷/۱۲', time: '۱۰:۰۰ تا ۱۲:۰۰', substation: 'پست بعثت' },
//   { feeder: 'فیدر آجین', code: 'FD-0841', day: 'یکشنبه', date: '۱۴۰۵/۰۷/۱۳', time: '۱۴:۰۰ تا ۱۶:۰۰', substation: 'پست آزادی' },
//   { feeder: 'فیدر گلستان', code: 'FD-1340', day: 'دوشنبه', date: '۱۴۰۵/۰۷/۱۴', time: '۱۲:۰۰ تا ۱۴:۰۰', substation: 'پست شمال' },
// ];

// function StatusBadge({ status }: { status: string }) {
//   const config: Record<string, { label: string; color: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'orange' | 'purple'; dot: string }> = {
//     running: { label: 'در حال اجرا', color: 'blue', dot: 'bg-blue-500' },
//     queued: { label: 'در صف', color: 'yellow', dot: 'bg-amber-500' },
//     completed: { label: 'تکمیل‌شده', color: 'green', dot: 'bg-emerald-500' },
//     failed: { label: 'ناموفق', color: 'red', dot: 'bg-red-500' },
//     infeasible: { label: 'حل‌ناپذیر', color: 'orange', dot: 'bg-orange-500' },
//     active: { label: 'فعال', color: 'green', dot: 'bg-emerald-500' },
//     inactive: { label: 'غیرفعال', color: 'gray', dot: 'bg-slate-400' },
//   };
//   const item = config[status] ?? config.inactive;
//   return <Badge color={item.color}><span className={`ml-1.5 h-1.5 w-1.5 rounded-full ${item.dot}`} />{item.label}</Badge>;
// }

// function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
//   return (
//     <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-6 md:flex-row md:items-center md:justify-between md:px-7">
//       <div>
//         <div className="mb-1 flex items-center gap-2 text-xs font-medium text-blue-600"><Circle size={6} fill="currentColor" />{eyebrow}</div>
//         <h1 className="text-xl font-bold tracking-tight text-slate-950">{title}</h1>
//         <p className="mt-1 text-sm text-slate-500">{description}</p>
//       </div>
//       {action}
//     </div>
//   );
// }

// function MetricCard({ title, value, note, icon: Icon, tone, trend }: { title: string; value: string; note: string; icon: React.ElementType; tone: string; trend?: 'up' | 'down' }) {
//   return (
//     <Card className="overflow-hidden p-5">
//       <div className="flex items-start justify-between">
//         <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></div>
//         {trend && <span className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
//           {trend === 'up' ? <ArrowUpLeft size={14} /> : <ArrowDownLeft size={14} />} ۱۲٪
//         </span>}
//       </div>
//       <div className="mt-5 text-2xl font-bold text-slate-950">{value}</div>
//       <div className="mt-1 text-xs font-medium text-slate-600">{title}</div>
//       <div className="mt-2 text-[11px] text-slate-400">{note}</div>
//     </Card>
//   );
// }

// function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
//   return (
//     <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
//       <div><h2 className="text-sm font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-400">{description}</p>}</div>
//       {action}
//     </div>
//   );
// }

// function ProgressBar({ value, status }: { value: number; status: string }) {
//   const color = status === 'failed' ? 'bg-red-500' : status === 'infeasible' ? 'bg-orange-500' : 'bg-blue-600';
//   return <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></div>;
// }

// function Toggle({ active, onClick }: { active: boolean; onClick?: () => void }) {
//   return (
//     <Button
//       variant="ghost"
//       size="sm"
//       aria-label={active ? 'غیرفعال کردن' : 'فعال کردن'}
//       onClick={onClick}
//       className={`h-6 w-11 rounded-full p-0 ${active ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-200 hover:bg-slate-300'}`}
//     >
//       <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${active ? '-translate-x-2.5' : 'translate-x-2.5'}`} />
//     </Button>
//   );
// }

// function Pagination() {
//   return (
//     <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row">
//       <span>نمایش ۱ تا ۵ از ۲۴ نتیجه</span>
//       <div className="flex items-center gap-1">
//         <Button size="sm" variant="secondary">قبلی</Button>
//         <Button size="sm" className="h-8 w-8 px-0">۱</Button>
//         <Button size="sm" variant="ghost" className="h-8 w-8 px-0">۲</Button>
//         <Button size="sm" variant="ghost" className="h-8 w-8 px-0">۳</Button>
//         <Button size="sm" variant="secondary">بعدی</Button>
//       </div>
//     </div>
//   );
// }

// function Drawer({ title, subtitle, open, onClose, children }: { title: string; subtitle: string; open: boolean; onClose: () => void; children: React.ReactNode }) {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex">
//       <div className="flex-1 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />
//       <section className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
//         <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
//           <div><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>
//           <Button variant="ghost" size="sm" onClick={onClose}><X size={18} /></Button>
//         </div>
//         {children}
//       </section>
//     </div>
//   );
// }

// export function AdminOverview() {
//   const [selectedRun, setSelectedRun] = useState<(typeof runs)[number] | null>(null);
//   return (
//     <div>
//       <PageTitle eyebrow="مرکز فرماندهی" title="نمای کلی پلتفرم" description="پایش لحظه‌ای سلامت، ظرفیت و فعالیت تمام شرکت‌های عضو شبکه" action={
//         <div className="flex items-center gap-2 text-xs text-slate-500"><RefreshCw size={14} className="text-emerald-500" />آخرین بروزرسانی: همین حالا</div>
//       } />
//       <div className="space-y-6 p-5 md:p-7">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//           <MetricCard title="شرکت‌های عضو" value="۲۴" note="۲۳ شرکت فعال" icon={Building2} tone="bg-blue-50 text-blue-600" trend="up" />
//           <MetricCard title="کاربران فعال" value="۱٬۲۸۴" note="۸۹ کاربر آنلاین" icon={Users} tone="bg-violet-50 text-violet-600" trend="up" />
//           <MetricCard title="اجراهای امروز" value="۴۷" note="۳ در حال اجرا · ۲ حل‌ناپذیر" icon={Activity} tone="bg-amber-50 text-amber-600" />
//           <MetricCard title="بیشینه بار پایش‌شده" value="۹٬۸۴۲ MW" note="ساعت ۱۴:۳۰ · امروز" icon={Zap} tone="bg-emerald-50 text-emerald-600" trend="down" />
//         </div>

//         <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
//           <Card className="xl:col-span-3">
//             <SectionHeader title="صف پردازش زنده" description="اجرای محاسبات زمان‌بندی در تمام شرکت‌ها" action={<Button variant="ghost" size="sm">مشاهده همه <ChevronLeft size={14} /></Button>} />
//             <div className="divide-y divide-slate-100">
//               {runs.slice(0, 4).map(run => (
//                 <button key={run.id} onClick={() => setSelectedRun(run)} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-right transition hover:bg-slate-50 md:grid-cols-[1.2fr_.8fr_.7fr_auto]">
//                   <div className="min-w-0">
//                     <div className="flex items-center gap-2"><span className="ltr text-xs font-bold text-slate-800">{run.id}</span><StatusBadge status={run.status} /></div>
//                     <div className="mt-1 text-xs text-slate-500">{run.company} · هفته {run.week}</div>
//                   </div>
//                   <div className="hidden md:block"><ProgressBar value={run.progress} status={run.status} /><div className="mt-1 text-[10px] text-slate-400">{run.progress ? `${run.progress}٪ پیشرفت` : 'در انتظار پردازش'}</div></div>
//                   <div className="hidden text-xs text-slate-500 md:block"><Clock3 size={13} className="ml-1 inline" />{run.duration}</div>
//                   <ChevronLeft size={16} className="text-slate-300" />
//                 </button>
//               ))}
//             </div>
//           </Card>

//           <Card className="xl:col-span-2">
//             <SectionHeader title="فعالیت شرکت‌ها" description="آخرین اتصال به پلتفرم" action={<MapPin size={17} className="text-slate-400" />} />
//             <div className="p-4">
//               <div className="relative mb-4 h-32 overflow-hidden rounded-xl bg-slate-900">
//                 <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_center,_#60a5fa_1px,_transparent_1px)] [background-size:16px_16px]" />
//                 {[['top-7 right-24', 'bg-blue-400'], ['top-14 right-44', 'bg-emerald-400'], ['top-20 right-64', 'bg-amber-400'], ['top-8 left-20', 'bg-violet-400']].map(([pos, color]) => (
//                   <span key={pos} className={`absolute ${pos} h-3 w-3 rounded-full ${color} ring-4 ring-white/10`} />
//                 ))}
//                 <div className="absolute bottom-3 right-4 text-xs font-medium text-white">پوشش ۱۸ استان فعال</div>
//               </div>
//               <div className="space-y-1">
//                 {companies.slice(0, 4).map(company => (
//                   <div key={company.code} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50">
//                     <span className={`h-2 w-2 rounded-full ${company.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
//                     <div className="min-w-0 flex-1"><div className="truncate text-xs font-medium text-slate-700">{company.name}</div><div className="text-[10px] text-slate-400">{company.code} · {company.activity}</div></div>
//                     <Button variant="ghost" size="sm" className="text-[11px] text-blue-600">ورود</Button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Card>
//         </div>

//         <Card>
//           <SectionHeader title="روند بار تجمیعی شبکه" description="پروفایل ۲۴ ساعته بار تمام شرکت‌ها — مگاوات" action={<div className="flex gap-1"><Badge color="blue">امروز</Badge><Badge>روز گذشته</Badge></div>} />
//           <div className="flex h-48 items-end gap-2 px-6 pb-5 pt-8" dir="ltr">
//             {[35,30,27,25,24,28,38,52,64,72,78,82,86,91,88,80,75,71,76,84,72,59,48,40].map((height, index) => (
//               <div key={index} className="group flex h-full flex-1 items-end">
//                 <div className="w-full rounded-t-sm bg-blue-100 transition group-hover:bg-blue-500" style={{ height: `${height}%` }} />
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between border-t border-slate-100 px-6 py-3 text-[10px] text-slate-400" dir="ltr"><span>H1</span><span>H6</span><span>H12</span><span>H18</span><span>H24</span></div>
//         </Card>
//       </div>
//       <RunDrawer run={selectedRun} onClose={() => setSelectedRun(null)} />
//     </div>
//   );
// }

// export function CompaniesManagement() {
//   const [query, setQuery] = useState('');
//   const [selected, setSelected] = useState<(typeof companies)[number] | null>(null);
//   const [createOpen, setCreateOpen] = useState(false);
//   const filtered = companies.filter(c => `${c.code} ${c.name} ${c.province}`.includes(query));
//   return (
//     <div>
//       <PageTitle eyebrow="دایرکتوری مستأجرها" title="شرکت‌ها و مدیریت فضای کاری" description="ایجاد، پیکربندی و پایش شرکت‌های عضو پلتفرم" action={<Button onClick={() => setCreateOpen(true)}><Plus size={16} />ایجاد شرکت جدید</Button>} />
//       <div className="p-5 md:p-7">
//         <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
//           {[['کل شرکت‌ها','۲۴',Building2],['شرکت فعال','۲۳',CheckCircle2],['مجموع فیدرها','۲٬۸۴۲',Zap],['مجموع داده‌ها','۳۹۱',Database]].map(([label,value,Icon]) => (
//             <Card key={label as string} className="flex items-center gap-3 p-4"><div className="rounded-lg bg-slate-100 p-2 text-slate-500"><Icon size={17} /></div><div><div className="text-lg font-bold">{value as string}</div><div className="text-[11px] text-slate-500">{label as string}</div></div></Card>
//           ))}
//         </div>
//         <Card className="overflow-hidden">
//           <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">
//             <div className="relative flex-1 md:max-w-sm"><Search size={15} className="absolute right-3 top-2.5 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو بر اساس نام، کد یا استان..." className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-9 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div>
//             <Button variant="secondary" size="sm"><Filter size={14} />فیلتر پیشرفته</Button>
//             <Button variant="secondary" size="sm"><Download size={14} />خروجی</Button>
//             <div className="mr-auto text-xs text-slate-400">۲۴ شرکت</div>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[900px] text-right text-xs">
//               <thead className="bg-slate-50 text-slate-500"><tr>{['کد شرکت','نام شرکت','استان','فیدرها','مجموعه داده','کاربران فعال','وضعیت','عملیات'].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">{h}<ChevronsUpDown size={11} className="mr-1 inline text-slate-300" /></th>)}</tr></thead>
//               <tbody className="divide-y divide-slate-100">
//                 {filtered.map(company => <tr key={company.code} className="hover:bg-slate-50/70">
//                   <td className="px-4 py-4 font-mono font-bold text-blue-600">{company.code}</td>
//                   <td className="px-4 py-4 font-medium text-slate-800">{company.name}</td>
//                   <td className="px-4 py-4 text-slate-500">{company.province}</td>
//                   <td className="px-4 py-4">{company.feeders}</td><td className="px-4 py-4">{company.datasets}</td><td className="px-4 py-4">{company.users}</td>
//                   <td className="px-4 py-4"><div className="flex items-center gap-2"><Toggle active={company.status === 'active'} /><StatusBadge status={company.status} /></div></td>
//                   <td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => setSelected(company)}><Eye size={14} /></Button><Button variant="ghost" size="sm"><Edit3 size={14} /></Button><Button variant="ghost" size="sm"><MoreHorizontal size={14} /></Button></div></td>
//                 </tr>)}
//               </tbody>
//             </table>
//           </div>
//           <Pagination />
//         </Card>
//       </div>

//       <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} subtitle={`${selected?.code} · استان ${selected?.province}`}>
//         {selected && <div className="space-y-6 p-6">
//           <div className="grid grid-cols-3 gap-3">{[[selected.feeders,'فیدر'],[selected.datasets,'داده'],[selected.users,'کاربر']].map(([v,l]) => <div key={l} className="rounded-xl bg-slate-50 p-4 text-center"><div className="text-xl font-bold text-slate-900">{v}</div><div className="mt-1 text-[11px] text-slate-500">{l}</div></div>)}</div>
//           <div><h3 className="mb-3 text-sm font-bold">اطلاعات فضای کاری</h3><div className="space-y-3 rounded-xl border border-slate-200 p-4 text-xs">{[['وضعیت', <StatusBadge status={selected.status} />],['آخرین فعالیت', selected.activity],['شناسه فضای کاری', `tenant_${selected.code.toLowerCase()}`],['نسخه داده فعال', 'v24.3']].map(([l,v]) => <div key={l as string} className="flex justify-between"><span className="text-slate-500">{l}</span><span className="font-medium">{v}</span></div>)}</div></div>
//           <div><h3 className="mb-3 text-sm font-bold">اجراهای اخیر</h3>{runs.slice(0,3).map(run => <div key={run.id} className="mb-2 flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><div className="ltr text-xs font-bold">{run.id}</div><div className="mt-1 text-[10px] text-slate-400">هفته {run.week}</div></div><StatusBadge status={run.status} /></div>)}</div>
//           <div className="flex gap-2"><Button className="flex-1"><Eye size={15} />ورود به نمای شرکت</Button><Button variant="secondary"><Edit3 size={15} />ویرایش</Button><Button variant="danger"><Trash2 size={15} /></Button></div>
//         </div>}
//       </Drawer>

//       {createOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
//         <Card className="w-full max-w-lg p-0 shadow-2xl">
//           <div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h2 className="font-bold">ایجاد شرکت جدید</h2><p className="mt-1 text-xs text-slate-500">فضای کاری مستقل برای شرکت ایجاد می‌شود.</p></div><Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}><X size={18} /></Button></div>
//           <div className="grid gap-4 p-5 sm:grid-cols-2"><Input label="کد شرکت" placeholder="مثال: TEH-01" /><Input label="نام شرکت" placeholder="نام رسمی شرکت" /><Select label="استان"><option>انتخاب استان...</option><option>تهران</option><option>اصفهان</option><option>فارس</option></Select><Select label="وضعیت اولیه"><option>فعال</option><option>غیرفعال</option></Select></div>
//           <div className="flex justify-end gap-2 border-t border-slate-100 p-5"><Button variant="secondary" onClick={() => setCreateOpen(false)}>انصراف</Button><Button onClick={() => setCreateOpen(false)}><Plus size={15} />ایجاد فضای کاری</Button></div>
//         </Card>
//       </div>}
//     </div>
//   );
// }

// export function GlobalUsers({ settingsMode = false }: { settingsMode?: boolean }) {
//   const [role, setRole] = useState('all');
//   const [status, setStatus] = useState('all');
//   const [activeRows, setActiveRows] = useState(users.map(u => u.active));
//   if (settingsMode) return <SettingsLogs />;
//   const filtered = users.filter(u => (role === 'all' || u.role === role) && (status === 'all' || u.active === (status === 'active')));
//   return (
//     <div>
//       <PageTitle eyebrow="هویت و دسترسی" title="مدیریت سراسری کاربران" description="کنترل نقش‌ها، دسترسی‌ها و وضعیت حساب کاربران تمام شرکت‌ها" action={<Button><Plus size={16} />افزودن کاربر</Button>} />
//       <div className="space-y-4 p-5 md:p-7">
//         <Card className="p-4">
//           <div className="grid gap-3 md:grid-cols-4">
//             <div className="relative"><Search size={15} className="absolute right-3 top-2.5 text-slate-400" /><input placeholder="نام، نام کاربری یا ایمیل..." className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-9 text-xs outline-none focus:border-blue-400" /></div>
//             <Select value={role} onChange={e => setRole(e.target.value)}><option value="all">همه نقش‌ها</option><option value="USER">کاربر عادی</option><option value="SUPER_ADMIN">مدیر ارشد</option></Select>
//             <Select value={status} onChange={e => setStatus(e.target.value)}><option value="all">همه وضعیت‌ها</option><option value="active">فعال</option><option value="inactive">غیرفعال</option></Select>
//             <Select><option>همه شرکت‌ها</option>{companies.map(c => <option key={c.code}>{c.name}</option>)}</Select>
//           </div>
//         </Card>
//         <Card className="overflow-hidden">
//           <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-right text-xs">
//             <thead className="bg-slate-50 text-slate-500"><tr>{['کاربر','ایمیل','شرکت مرتبط','نقش','تاریخ ایجاد','وضعیت حساب','عملیات'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead>
//             <tbody className="divide-y divide-slate-100">{filtered.map((user, index) => <tr key={user.username} className="hover:bg-slate-50">
//               <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 font-bold text-blue-700">{user.name[0]}</div><div><div className="font-medium text-slate-800">{user.name}</div><div className="ltr mt-0.5 text-[10px] text-slate-400">@{user.username}</div></div></div></td>
//               <td className="ltr px-5 py-4 text-left text-slate-500">{user.email}</td><td className="px-5 py-4 text-slate-600">{user.company}</td>
//               <td className="px-5 py-4"><Badge color={user.role === 'SUPER_ADMIN' ? 'purple' : 'gray'}>{user.role === 'SUPER_ADMIN' ? <><ShieldCheck size={12} className="ml-1" />مدیر ارشد</> : 'کاربر'}</Badge></td>
//               <td className="px-5 py-4 text-slate-500">{user.date}</td>
//               <td className="px-5 py-4"><div className="flex items-center gap-2"><Toggle active={activeRows[index] ?? user.active} onClick={() => setActiveRows(rows => rows.map((v,i) => i === index ? !v : v))}/><span className="text-slate-500">{(activeRows[index] ?? user.active) ? 'فعال' : 'غیرفعال'}</span></div></td>
//               <td className="px-5 py-4"><div className="flex gap-1"><Button variant="ghost" size="sm" title="بازنشانی رمز عبور"><KeyRound size={14} /></Button><Button variant="ghost" size="sm"><Edit3 size={14} /></Button><Button variant="ghost" size="sm"><MoreHorizontal size={14} /></Button></div></td>
//             </tr>)}</tbody>
//           </table></div>
//           <Pagination />
//         </Card>
//       </div>
//     </div>
//   );
// }

// export function GlobalScheduleRuns({ explorerMode = false }: { explorerMode?: boolean }) {
//   const [selected, setSelected] = useState<(typeof runs)[number] | null>(null);
//   const [status, setStatus] = useState('all');
//   if (explorerMode) return <DataExplorer />;
//   const filtered = runs.filter(r => status === 'all' || r.status === status);
//   return (
//     <div>
//       <PageTitle eyebrow="موتور زمان‌بندی" title="اجراها و عیب‌یابی خاموشی" description="پایش صف پردازش، نتایج و خطاهای محاسبات تمام شرکت‌ها" action={<Button variant="secondary"><RefreshCw size={15} />بروزرسانی صف</Button>} />
//       <div className="space-y-4 p-5 md:p-7">
//         <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
//           {[
//             { label: 'در حال اجرا', value: '۳', icon: Activity, tone: 'bg-blue-50 text-blue-600' },
//             { label: 'در صف', value: '۷', icon: Clock3, tone: 'bg-amber-50 text-amber-600' },
//             { label: 'تکمیل امروز', value: '۳۸', icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
//             { label: 'حل‌ناپذیر', value: '۲', icon: AlertCircle, tone: 'bg-orange-50 text-orange-600' },
//             { label: 'ناموفق', value: '۱', icon: XCircle, tone: 'bg-red-50 text-red-600' },
//           ].map(({ label, value, icon: Icon, tone }) => <Card key={label} className="flex items-center gap-3 p-4"><div className={`rounded-lg p-2 ${tone}`}><Icon size={17} /></div><div><div className="text-lg font-bold">{value}</div><div className="text-[11px] text-slate-500">{label}</div></div></Card>)}
//         </div>
//         <Card className="overflow-hidden">
//           <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row">
//             <div className="relative flex-1 lg:max-w-xs"><Search size={15} className="absolute right-3 top-2.5 text-slate-400" /><input placeholder="جستجوی شناسه اجرا..." className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-9 text-xs outline-none" /></div>
//             <Select value={status} onChange={e => setStatus(e.target.value)} className="lg:w-40"><option value="all">همه وضعیت‌ها</option><option value="running">در حال اجرا</option><option value="queued">در صف</option><option value="completed">تکمیل‌شده</option><option value="infeasible">حل‌ناپذیر</option><option value="failed">ناموفق</option></Select>
//             <Select className="lg:w-48"><option>همه شرکت‌ها</option>{companies.map(c => <option key={c.code}>{c.name}</option>)}</Select>
//             <Button variant="secondary" size="sm"><CalendarDays size={14} />بازه زمانی</Button>
//           </div>
//           <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-right text-xs">
//             <thead className="bg-slate-50 text-slate-500"><tr>{['شناسه اجرا','شرکت','شروع هفته','وضعیت','نسخه داده بار','مدت اجرا','پیام سیستم','عملیات'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
//             <tbody className="divide-y divide-slate-100">{filtered.map(run => <tr key={run.id} className="hover:bg-slate-50">
//               <td className="ltr px-4 py-4 text-right font-mono font-bold text-blue-600">{run.id}</td><td className="px-4 py-4"><div className="font-medium">{run.company}</div><div className="mt-0.5 text-[10px] text-slate-400">{run.code}</div></td><td className="px-4 py-4">{run.week}</td><td className="px-4 py-4"><div className="space-y-2"><StatusBadge status={run.status} />{run.status === 'running' && <ProgressBar value={run.progress} status={run.status} />}</div></td><td className="px-4 py-4 font-mono text-slate-500">{run.dataset}</td><td className="px-4 py-4">{run.duration}</td>
//               <td className="max-w-56 truncate px-4 py-4 text-slate-500">{run.error || <span className="text-slate-300">بدون خطا</span>}</td>
//               <td className="px-4 py-4"><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => setSelected(run)}><Eye size={14} />جزئیات</Button><Button variant="ghost" size="sm"><Download size={14} /></Button></div></td>
//             </tr>)}</tbody>
//           </table></div><Pagination />
//         </Card>
//       </div>
//       <RunDrawer run={selected} onClose={() => setSelected(null)} />
//     </div>
//   );
// }

// function RunDrawer({ run, onClose }: { run: (typeof runs)[number] | null; onClose: () => void }) {
//   return <Drawer open={!!run} onClose={onClose} title={`جزئیات اجرا ${run?.id ?? ''}`} subtitle={`${run?.company ?? ''} · هفته ${run?.week ?? ''}`}>
//     {run && <div className="space-y-6 p-6">
//       <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><div className="text-xs text-slate-500">وضعیت نهایی</div><div className="mt-2"><StatusBadge status={run.status} /></div></div><div className="text-left"><div className="text-xs text-slate-500">مدت اجرا</div><div className="mt-1 font-bold">{run.duration}</div></div></div>
//       {run.error && <div className="rounded-xl border border-orange-200 bg-orange-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-orange-800"><FileWarning size={17} />خلاصه خطا</div><p className="mt-2 text-xs leading-6 text-orange-700">{run.error}. محدودیت «حتماً وصل» با بازه خاموشی اجباری هم‌پوشانی دارد.</p></div>}
//       <div><h3 className="mb-3 text-sm font-bold">رویدادهای خاموشی</h3><div className="space-y-2">{outages.map(event => <div key={event.code} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between"><div><div className="text-sm font-medium">{event.feeder}</div><div className="ltr mt-1 text-right text-[10px] text-slate-400">{event.code} · {event.substation}</div></div><Badge color="blue">{event.time}</Badge></div><div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><CalendarDays size={13} />{event.day}، {event.date}</div></div>)}</div></div>
//       <div className="rounded-xl bg-slate-950 p-5 text-white"><div className="mb-4 flex items-center justify-between"><span className="text-sm font-bold">خط زمانی خاموشی‌ها</span><span className="text-[10px] text-slate-400">۲۴ ساعت</span></div><div className="relative h-16 rounded-lg bg-slate-900"><div className="absolute right-[42%] top-3 h-10 w-[18%] rounded-md bg-blue-500/80" /><div className="absolute right-[63%] top-3 h-10 w-[10%] rounded-md bg-violet-500/80" /></div><div className="mt-2 flex justify-between text-[9px] text-slate-500" dir="ltr"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div></div>
//       <div className="flex gap-2"><Button className="flex-1"><Download size={15} />دریافت گزارش کامل</Button><Button variant="secondary">مشاهده برنامه</Button></div>
//     </div>}
//   </Drawer>;
// }

// function DataExplorer() {
//   return <div><PageTitle eyebrow="دارایی‌های شبکه" title="مرورگر سراسری فیدرها و داده‌ها" description="نمای یکپارچه دارایی‌ها، پوشش داده و کیفیت مجموعه‌داده‌های شرکت‌ها" action={<Button variant="secondary"><Download size={15} />خروجی فهرست</Button>} /><div className="space-y-6 p-5 md:p-7">
//     <div className="grid gap-4 md:grid-cols-3"><MetricCard title="فیدرهای ثبت‌شده" value="۲٬۸۴۲" note="در ۲۴ شرکت" icon={Zap} tone="bg-blue-50 text-blue-600" /><MetricCard title="مجموعه داده فعال" value="۳۹۱" note="۲۸ نسخه جدید این ماه" icon={Layers3} tone="bg-violet-50 text-violet-600" /><MetricCard title="پوشش داده معتبر" value="۹۴٫۸٪" note="۱٫۷٪ بهبود ماهانه" icon={Gauge} tone="bg-emerald-50 text-emerald-600" trend="up" /></div>
//     <Card><SectionHeader title="وضعیت داده شرکت‌ها" description="کیفیت، پوشش و آخرین بروزرسانی" /><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{['شرکت','فیدر','داده بار','محدودیت زمانی','کیفیت داده','آخرین بروزرسانی'].map(h => <th className="px-5 py-3 text-right font-medium" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{companies.map((c,i)=><tr key={c.code}><td className="px-5 py-4 font-medium">{c.name}</td><td className="px-5 py-4">{c.feeders}</td><td className="px-5 py-4"><Badge color="green">کامل</Badge></td><td className="px-5 py-4"><Badge color={i===4?'yellow':'green'}>{i===4?'نیازمند بروزرسانی':'معتبر'}</Badge></td><td className="px-5 py-4"><div className="flex items-center gap-2"><ProgressBar value={96-i*3} status="completed"/><span>{96-i*3}٪</span></div></td><td className="px-5 py-4 text-slate-500">{c.activity}</td></tr>)}</tbody></table></div></Card>
//   </div></div>;
// }

// function SettingsLogs() {
//   const logItems = [
//     ['ورود مدیر ارشد به سامانه','superadmin@grid.ir','همین حالا','success'],
//     ['تغییر نقش کاربر m.mohammadi','مدیریت هویت','۱۲ دقیقه پیش','info'],
//     ['ناموفق بودن اجرای RUN-1405-0838','موتور زمان‌بندی','۴۵ دقیقه پیش','error'],
//     ['ایجاد نسخه جدید داده LOAD-v24','TEH-01','۲ ساعت پیش','success'],
//   ];
//   return <div><PageTitle eyebrow="مدیریت سامانه" title="تنظیمات و رویدادهای سیستم" description="پیکربندی عمومی، سلامت سرویس‌ها و ردپای ممیزی پلتفرم" /><div className="grid gap-6 p-5 md:p-7 xl:grid-cols-3">
//     <Card className="xl:col-span-1"><SectionHeader title="سلامت سرویس‌ها" /><div className="space-y-4 p-5">{[['پایگاه داده','عملیاتی'],['موتور زمان‌بندی','عملیاتی'],['ذخیره‌سازی فایل','عملیاتی'],['سرویس اعلان','افت عملکرد']].map(([name,state],i)=><div className="flex items-center justify-between" key={name}><div className="flex items-center gap-2 text-xs"><ServerCog size={15} className="text-slate-400"/>{name}</div><Badge color={i===3?'yellow':'green'}>{state}</Badge></div>)}</div></Card>
//     <Card className="xl:col-span-2"><SectionHeader title="رویدادهای اخیر" description="ردپای ممیزی فعالیت‌های مدیریتی" action={<Button variant="secondary" size="sm"><SlidersHorizontal size={14}/>فیلتر</Button>} /><div className="divide-y divide-slate-100">{logItems.map(([title,source,time,type])=><div className="flex items-start gap-3 p-4" key={title}><div className={`mt-0.5 rounded-lg p-2 ${type==='error'?'bg-red-50 text-red-600':type==='info'?'bg-blue-50 text-blue-600':'bg-emerald-50 text-emerald-600'}`}>{type==='error'?<AlertCircle size={15}/>:<Check size={15}/>}</div><div className="flex-1"><div className="text-xs font-medium">{title}</div><div className="mt-1 text-[10px] text-slate-400">{source}</div></div><div className="text-[10px] text-slate-400">{time}</div></div>)}</div></Card>
//   </div></div>;
// }
