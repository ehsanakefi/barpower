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

export default function DataExplorer() {
  return (
    <div>
      <PageTitle
        eyebrow="دارایی‌های شبکه"
        title="مرورگر سراسری فیدرها و داده‌ها"
        description="نمای یکپارچه دارایی‌ها، پوشش داده و کیفیت مجموعه‌داده‌های شرکت‌ها"
        action={
          <Button variant="secondary">
            <Download size={15} />
            خروجی فهرست
          </Button>
        }
      />
      <div className="space-y-6 p-5 md:p-7">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="فیدرهای ثبت‌شده"
            value="۲٬۸۴۲"
            note="در ۲۴ شرکت"
            icon={Zap}
            tone="bg-blue-50 text-blue-600"
          />
          <MetricCard
            title="مجموعه داده فعال"
            value="۳۹۱"
            note="۲۸ نسخه جدید این ماه"
            icon={Layers3}
            tone="bg-violet-50 text-violet-600"
          />
          <MetricCard
            title="پوشش داده معتبر"
            value="۹۴٫۸٪"
            note="۱٫۷٪ بهبود ماهانه"
            icon={Gauge}
            tone="bg-emerald-50 text-emerald-600"
            trend="up"
          />
        </div>
        <Card>
          <SectionHeader
            title="وضعیت داده شرکت‌ها"
            description="کیفیت، پوشش و آخرین بروزرسانی"
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "شرکت",
                    "فیدر",
                    "داده بار",
                    "محدودیت زمانی",
                    "کیفیت داده",
                    "آخرین بروزرسانی",
                  ].map((h) => (
                    <th className="px-5 py-3 text-right font-medium" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c, i) => (
                  <tr key={c.code}>
                    <td className="px-5 py-4 font-medium">{c.name}</td>
                    <td className="px-5 py-4">{c.feeders}</td>
                    <td className="px-5 py-4">
                      <Badge color="green">کامل</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={i === 4 ? "yellow" : "green"}>
                        {i === 4 ? "نیازمند بروزرسانی" : "معتبر"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={96 - i * 3} status="completed" />
                        <span>{96 - i * 3}٪</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{c.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
