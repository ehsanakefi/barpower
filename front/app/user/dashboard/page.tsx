"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Database,
  Clock,
  GitBranch,
  Calculator,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/ui";
import { todayJalali } from "@/utils/jalali";
import { useAppStore } from "@/store/useAppStore";

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; color: "green" | "yellow" | "blue" | "red" | "gray" }
  > = {
    completed: { label: "تکمیل شده", color: "green" },
    running: { label: "در حال اجرا", color: "blue" },
    queued: { label: "در صف", color: "yellow" },
    failed: { label: "ناموفق", color: "red" },
    infeasible: { label: "ناممکن", color: "red" },
    ready: { label: "آماده", color: "gray" },
  };
  const m = map[status] ?? { label: status, color: "gray" as const };
  return <Badge color={m.color}>{m.label}</Badge>;
}

export default function DashboardPage() {
  const router = useRouter();
  const today = todayJalali();

  // دریافت داده‌ها از Zustand با نام‌گذاری‌های صحیح و سازگار با استور
  const rawFeeders = useAppStore((state) => state.feeders);
  const rawDatasets = useAppStore((state) => state.datasets);
  // پشتیبانی همزمان از feederRelations یا relations در صورت تفاوت در استور شما
  const rawRelations = useAppStore(
    (state) => (state as any).feederRelations ?? (state as any).relations,
  );
  // پشتیبانی همزمان از scheduleRuns یا runs
  const rawRuns = useAppStore(
    (state) => (state as any).scheduleRuns ?? (state as any).runs,
  );

  // ایمن‌سازی آرایه‌ها در برابر undefined
  const feeders = useMemo(() => rawFeeders ?? [], [rawFeeders]);
  const datasets = useMemo(() => rawDatasets ?? [], [rawDatasets]);
  const relations = useMemo(() => rawRelations ?? [], [rawRelations]);
  const runs = useMemo(() => rawRuns ?? [], [rawRuns]);

  // محاسبات مشتقه به صورت ایمن
  const loadDatasets = useMemo(
    () => datasets.filter((d) => d.type === "load"),
    [datasets],
  );
  const tcDatasets = useMemo(
    () => datasets.filter((d) => d.type === "temporal-constraints"),
    [datasets],
  );
  const simultaneous = useMemo(
    () =>
      relations.filter((r: any) => r.relationType === "simultaneous").length,
    [relations],
  );
  const nonSimultaneous = useMemo(
    () =>
      relations.filter((r: any) => r.relationType === "non-simultaneous")
        .length,
    [relations],
  );
  const latestRun = runs[0];

  const stats = [
    {
      label: "فیدرهای ثبت شده",
      value: feeders.length,
      icon: Users,
      color: "bg-blue-500",
      action: "/load-data",
    },
    {
      label: "مجموعه‌های بار",
      value: loadDatasets.length,
      icon: Database,
      color: "bg-emerald-500",
      action: "/load-data",
    },
    {
      label: "مجموعه‌های محدودیت زمانی",
      value: tcDatasets.length,
      icon: Clock,
      color: "bg-violet-500",
      action: "/temporal-constraints",
    },
    {
      label: "روابط هم‌زمانی",
      value: simultaneous,
      icon: GitBranch,
      color: "bg-orange-500",
      action: "/feeder-relations",
    },
  ];

  return (
    <div>
      <PageHeader title="داشبورد" subtitle={`تاریخ امروز: ${today}`} />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, action }) => (
            <button
              key={label}
              onClick={() => router.push(action)}
              className="bg-white border border-slate-300 rounded-xl p-5 text-right hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{label}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest calculation */}
          <Card>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">آخرین محاسبه</h2>
              <button
                onClick={() => router.push("/calculation")}
                className="text-xs text-blue-600 hover:underline"
              >
                مشاهده همه
              </button>
            </div>
            <div className="p-5">
              {latestRun ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">وضعیت</span>
                    <StatusBadge status={latestRun.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">هفته</span>
                    <span className="text-sm font-medium ltr">
                      {latestRun.weekStartDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">زمان ارسال</span>
                    <span className="text-sm text-slate-500">
                      {latestRun.createdAt
                        ? new Date(latestRun.createdAt).toLocaleTimeString(
                            "fa-IR",
                          )
                        : "---"}
                    </span>
                  </div>
                  {latestRun.status === "running" && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                      <Loader2 size={14} className="animate-spin" />
                      در حال محاسبه...
                    </div>
                  )}
                  {latestRun.status === "completed" && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle size={14} />
                      محاسبه با موفقیت انجام شد
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Calculator
                    size={32}
                    className="mx-auto mb-2 text-slate-200"
                  />
                  <p className="text-sm">هیچ محاسبه‌ای انجام نشده</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">دسترسی سریع</h2>
            </div>
            <div className="p-5 space-y-2">
              {[
                {
                  label: "وارد کردن داده‌های بار",
                  to: "/load-data",
                  icon: Database,
                },
                {
                  label: "مدیریت محدودیت‌های زمانی",
                  to: "/temporal-constraints",
                  icon: Clock,
                },
                {
                  label: "مدیریت روابط فیدرها",
                  to: "/feeder-relations",
                  icon: GitBranch,
                },
                {
                  label: "درخواست محاسبه هفتگی",
                  to: "/calculation",
                  icon: Calculator,
                },
              ].map(({ label, to, icon: Icon }) => (
                <button
                  key={to}
                  onClick={() => router.push(to)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-300 transition-colors text-right"
                >
                  <Icon size={15} className="text-slate-400 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Relations summary */}
        <Card>
          <div className="p-5 border-b border-slate-300">
            <h2 className="text-sm font-bold text-slate-800">
              خلاصه روابط فیدرها
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {simultaneous}
              </div>
              <div className="text-sm text-slate-500 mt-1">رابطه هم‌زمانی</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {nonSimultaneous}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                رابطه غیرهم‌زمانی
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
