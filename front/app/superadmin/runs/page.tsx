"use client";

import { companies } from "@/app/mocks/companies";
import { runs } from "@/app/mocks/runs";
import { Badge, Button, Card, Select } from "@/components/ui";
import { MetricCard } from "@/components/ui/metriccard";
import { PageTitle } from "@/components/ui/pagetitle";
import { Pagination } from "@/components/ui/pagination";
import { ProgressBar } from "@/components/ui/progressbar";
import { RunDrawer } from "@/components/ui/rundrawer";
import { SectionHeader } from "@/components/ui/sectionheader";
import { StatusBadge } from "@/components/ui/statusbadge";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Gauge,
  Layers3,
  RefreshCw,
  Search,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function GlobalScheduleRuns() {
  const [selected, setSelected] = useState<(typeof runs)[number] | null>(null);
  const [status, setStatus] = useState("all");
  const filtered = runs.filter((r) => status === "all" || r.status === status);
  return (
    <div>
      <PageTitle
        eyebrow="موتور زمان‌بندی"
        title="اجراها و عیب‌یابی خاموشی"
        description="پایش صف پردازش، نتایج و خطاهای محاسبات تمام شرکت‌ها"
        action={
          <Button variant="secondary">
            <RefreshCw size={15} />
            بروزرسانی صف
          </Button>
        }
      />
      <div className="space-y-4 p-5 md:p-7">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            {
              label: "در حال اجرا",
              value: "۳",
              icon: Activity,
              tone: "bg-blue-50 text-blue-600",
            },
            {
              label: "در صف",
              value: "۷",
              icon: Clock3,
              tone: "bg-amber-50 text-amber-600",
            },
            {
              label: "تکمیل امروز",
              value: "۳۸",
              icon: CheckCircle2,
              tone: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "حل‌ناپذیر",
              value: "۲",
              icon: AlertCircle,
              tone: "bg-orange-50 text-orange-600",
            },
            {
              label: "ناموفق",
              value: "۱",
              icon: XCircle,
              tone: "bg-red-50 text-red-600",
            },
          ].map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} className="flex items-center gap-3 p-4">
              <div className={`rounded-lg p-2 ${tone}`}>
                <Icon size={17} />
              </div>
              <div>
                <div className="text-lg font-bold">{value}</div>
                <div className="text-[11px] text-slate-500">{label}</div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row">
            <div className="relative flex-1 lg:max-w-xs">
              <Search
                size={15}
                className="absolute right-3 top-2.5 text-slate-400"
              />
              <input
                placeholder="جستجوی شناسه اجرا..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-9 text-xs outline-none"
              />
            </div>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="lg:w-40"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="running">در حال اجرا</option>
              <option value="queued">در صف</option>
              <option value="completed">تکمیل‌شده</option>
              <option value="infeasible">حل‌ناپذیر</option>
              <option value="failed">ناموفق</option>
            </Select>
            <Select className="lg:w-48">
              <option>همه شرکت‌ها</option>
              {companies.map((c) => (
                <option key={c.code}>{c.name}</option>
              ))}
            </Select>
            <Button variant="secondary" size="sm">
              <CalendarDays size={14} />
              بازه زمانی
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-right text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "شناسه اجرا",
                    "شرکت",
                    "شروع هفته",
                    "وضعیت",
                    "نسخه داده بار",
                    "مدت اجرا",
                    "پیام سیستم",
                    "عملیات",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50">
                    <td className="ltr px-4 py-4 text-right font-mono font-bold text-blue-600">
                      {run.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">{run.company}</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {run.code}
                      </div>
                    </td>
                    <td className="px-4 py-4">{run.week}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <StatusBadge status={run.status} />
                        {run.status === "running" && (
                          <ProgressBar
                            value={run.progress}
                            status={run.status}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-500">
                      {run.dataset}
                    </td>
                    <td className="px-4 py-4">{run.duration}</td>
                    <td className="max-w-56 truncate px-4 py-4 text-slate-500">
                      {run.error || (
                        <span className="text-slate-300">بدون خطا</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelected(run)}
                        >
                          <Eye size={14} />
                          جزئیات
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination />
        </Card>
      </div>
      <RunDrawer run={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
