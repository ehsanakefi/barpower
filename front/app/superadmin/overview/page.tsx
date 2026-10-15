"use client";

import { companies } from "@/app/mocks/companies";
import { runs } from "@/app/mocks/runs";
import { Badge, Button, Card } from "@/components/ui";
import { MetricCard } from "@/components/ui/metriccard";
import { PageTitle } from "@/components/ui/pagetitle";
import { ProgressBar } from "@/components/ui/progressbar";
import { RunDrawer } from "@/components/ui/rundrawer";
import { SectionHeader } from "@/components/ui/sectionheader";
import { StatusBadge } from "@/components/ui/statusbadge";
import {
  Building2,
  ChevronLeft,
  Clock3,
  MapPin,
  RefreshCw,
  Users,
  Zap,
} from "lucide-react";
import { Activity, useState } from "react";
export default function AdminOverview() {
  const [selectedRun, setSelectedRun] = useState<(typeof runs)[number] | null>(
    null,
  );
  return (
    <div>
      <PageTitle
        eyebrow="مرکز فرماندهی"
        title="نمای کلی پلتفرم"
        description="پایش لحظه‌ای سلامت، ظرفیت و فعالیت تمام شرکت‌های عضو شبکه"
        action={
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw size={14} className="text-emerald-500" />
            آخرین بروزرسانی: همین حالا
          </div>
        }
      />
      <div className="space-y-6 p-5 md:p-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="شرکت‌های عضو"
            value="۲۴"
            note="۲۳ شرکت فعال"
            icon={Building2}
            tone="bg-blue-50 text-blue-600"
            trend="up"
          />
          <MetricCard
            title="کاربران فعال"
            value="۱٬۲۸۴"
            note="۸۹ کاربر آنلاین"
            icon={Users}
            tone="bg-violet-50 text-violet-600"
            trend="up"
          />
          <MetricCard
            title="اجراهای امروز"
            value="۴۷"
            note="۳ در حال اجرا · ۲ حل‌ناپذیر"
            icon={Activity}
            tone="bg-amber-50 text-amber-600"
          />
          <MetricCard
            title="بیشینه بار پایش‌شده"
            value="۹٬۸۴۲ MW"
            note="ساعت ۱۴:۳۰ · امروز"
            icon={Zap}
            tone="bg-emerald-50 text-emerald-600"
            trend="down"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-3">
            <SectionHeader
              title="صف پردازش زنده"
              description="اجرای محاسبات زمان‌بندی در تمام شرکت‌ها"
              action={
                <Button variant="ghost" size="sm">
                  مشاهده همه <ChevronLeft size={14} />
                </Button>
              }
            />
            <div className="divide-y divide-slate-100">
              {runs.slice(0, 4).map((run) => (
                <button
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-right transition hover:bg-slate-50 md:grid-cols-[1.2fr_.8fr_.7fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="ltr text-xs font-bold text-slate-800">
                        {run.id}
                      </span>
                      <StatusBadge status={run.status} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {run.company} · هفته {run.week}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <ProgressBar value={run.progress} status={run.status} />
                    <div className="mt-1 text-[10px] text-slate-400">
                      {run.progress
                        ? `${run.progress}٪ پیشرفت`
                        : "در انتظار پردازش"}
                    </div>
                  </div>
                  <div className="hidden text-xs text-slate-500 md:block">
                    <Clock3 size={13} className="ml-1 inline" />
                    {run.duration}
                  </div>
                  <ChevronLeft size={16} className="text-slate-300" />
                </button>
              ))}
            </div>
          </Card>

          <Card className="xl:col-span-2">
            <SectionHeader
              title="فعالیت شرکت‌ها"
              description="آخرین اتصال به پلتفرم"
              action={<MapPin size={17} className="text-slate-400" />}
            />
            <div className="p-4">
              <div className="relative mb-4 h-32 overflow-hidden rounded-xl bg-slate-900">
                <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_center,_#60a5fa_1px,_transparent_1px)] [background-size:16px_16px]" />
                {[
                  ["top-7 right-24", "bg-blue-400"],
                  ["top-14 right-44", "bg-emerald-400"],
                  ["top-20 right-64", "bg-amber-400"],
                  ["top-8 left-20", "bg-violet-400"],
                ].map(([pos, color]) => (
                  <span
                    key={pos}
                    className={`absolute ${pos} h-3 w-3 rounded-full ${color} ring-4 ring-white/10`}
                  />
                ))}
                <div className="absolute bottom-3 right-4 text-xs font-medium text-white">
                  پوشش ۱۸ استان فعال
                </div>
              </div>
              <div className="space-y-1">
                {companies.slice(0, 4).map((company) => (
                  <div
                    key={company.code}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${company.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-slate-700">
                        {company.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {company.code} · {company.activity}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[11px] text-blue-600"
                    >
                      ورود
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <SectionHeader
            title="روند بار تجمیعی شبکه"
            description="پروفایل ۲۴ ساعته بار تمام شرکت‌ها — مگاوات"
            action={
              <div className="flex gap-1">
                <Badge color="blue">امروز</Badge>
                <Badge>روز گذشته</Badge>
              </div>
            }
          />
          <div className="flex h-48 items-end gap-2 px-6 pb-5 pt-8" dir="ltr">
            {[
              35, 30, 27, 25, 24, 28, 38, 52, 64, 72, 78, 82, 86, 91, 88, 80,
              75, 71, 76, 84, 72, 59, 48, 40,
            ].map((height, index) => (
              <div key={index} className="group flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-sm bg-blue-100 transition group-hover:bg-blue-500"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <div
            className="flex justify-between border-t border-slate-100 px-6 py-3 text-[10px] text-slate-400"
            dir="ltr"
          >
            <span>H1</span>
            <span>H6</span>
            <span>H12</span>
            <span>H18</span>
            <span>H24</span>
          </div>
        </Card>
      </div>
      <RunDrawer run={selectedRun} onClose={() => setSelectedRun(null)} />
    </div>
  );
}
