"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { Download, Search, X } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Select,
  EmptyState,
  Badge,
} from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import type { OutageEvent } from "@/models/types";

type ViewMode = "feeder" | "day" | "time";

function timeOverlaps(
  evStart: string,
  evEnd: string,
  filterStart: string,
  filterEnd: string,
): boolean {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const evS = toMinutes(evStart);
  const evE = toMinutes(evEnd === "24:00" ? "24:00" : evEnd);
  const fS = toMinutes(filterStart);
  const fE = toMinutes(filterEnd);
  return evS < fE && evE > fS;
}

const TIME_SLOTS = [
  { label: "۱۰:۰۰–۱۲:۰۰", start: "10:00", end: "12:00" },
  { label: "۱۲:۰۰–۱۴:۰۰", start: "12:00", end: "14:00" },
  { label: "۱۴:۰۰–۱۶:۰۰", start: "14:00", end: "16:00" },
  { label: "۱۶:۰۰–۱۸:۰۰", start: "16:00", end: "18:00" },
  { label: "۱۸:۰۰–۲۰:۰۰", start: "18:00", end: "20:00" },
  { label: "۲۰:۰۰–۲۲:۰۰", start: "20:00", end: "22:00" },
  { label: "۲۲:۰۰–۲۴:۰۰", start: "22:00", end: "24:00" },
];

function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

export default function ScheduleViewerPage() {
  const searchParams = useSearchParams();
  const initialRunId = searchParams.get("runId") ?? "";

  const [viewMode, setViewMode] = useState<ViewMode>("feeder");
  const [selectedRunId, setSelectedRunId] = useState(initialRunId);
  const [filterFeeder, setFilterFeeder] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTimeSlot, setFilterTimeSlot] = useState("");
  const [filterSubstation, setFilterSubstation] = useState("");

  // اتصال به استور Zustand
  const runs = useAppStore((state) => state.scheduleRuns);
  const allEvents = useAppStore((state) => state.outageEvents);

  const completedRuns = useMemo(
    () => runs.filter((r) => r.status === "completed"),
    [runs],
  );
  const activeRunId = selectedRunId || completedRuns[0]?.id || "";

  // فیلتر رویدادهای مربوط به محاسبه انتخابی
  const events = useMemo(() => {
    return allEvents.filter((e) => e.runId === activeRunId);
  }, [allEvents, activeRunId]);

  const latestRun = completedRuns[0];
  const isStale = latestRun && activeRunId !== latestRun.id;

  // فیلتر کردن رویدادها
  const filtered = useMemo(() => {
    let list = events;
    if (filterFeeder) {
      list = list.filter(
        (e) =>
          e.feederName.toLowerCase().includes(filterFeeder.toLowerCase()) ||
          e.feederCode.toLowerCase().includes(filterFeeder.toLowerCase()),
      );
    }
    if (filterDate) {
      list = list.filter((e) => e.date === filterDate);
    }
    if (filterTimeSlot) {
      const slot = TIME_SLOTS.find((s) => s.label === filterTimeSlot);
      if (slot) {
        list = list.filter((e) =>
          timeOverlaps(e.startTime, e.endTime, slot.start, slot.end),
        );
      }
    }
    if (filterSubstation) {
      list = list.filter((e) => e.substationName.includes(filterSubstation));
    }
    return list;
  }, [events, filterFeeder, filterDate, filterTimeSlot, filterSubstation]);

  const uniqueDates = useMemo(
    () => [...new Set(events.map((e) => e.date))].sort(),
    [events],
  );
  const hasFilters = Boolean(
    filterFeeder || filterDate || filterTimeSlot || filterSubstation,
  );

  function clearFilters() {
    setFilterFeeder("");
    setFilterDate("");
    setFilterTimeSlot("");
    setFilterSubstation("");
  }

  function exportToExcel() {
    const rows = filtered.map((e) => ({
      "نام فیدر": e.feederName,
      "کد فیدر": e.feederCode,
      پست: e.substationName,
      تاریخ: e.date,
      "روز هفته": e.weekday,
      "ساعت شروع": e.startTime,
      "ساعت پایان": e.endTime,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "برنامه خاموشی");
    XLSX.writeFile(wb, `outage-schedule-${activeRunId.slice(0, 8)}.xlsx`);
  }

  const byFeeder = useMemo(
    () => groupBy(filtered, (e) => e.feederId),
    [filtered],
  );
  const byDate = useMemo(() => groupBy(filtered, (e) => e.date), [filtered]);

  return (
    <div>
      <PageHeader
        title="مشاهده برنامه خاموشی"
        subtitle={`${filtered.length} رویداد`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={exportToExcel}
            disabled={filtered.length === 0}
          >
            <Download size={14} /> خروجی Excel
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Run selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={activeRunId}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="w-72"
          >
            <option value="">انتخاب محاسبه...</option>
            {completedRuns.map((r) => (
              <option key={r.id} value={r.id}>
                هفته {r.weekStartDate} —{" "}
                {new Date(r.createdAt).toLocaleDateString("fa-IR")}
              </option>
            ))}
          </Select>

          {isStale && <Badge color="yellow">مربوط به نسخه قبلی داده‌ها</Badge>}
        </div>

        {completedRuns.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <p className="text-sm">هیچ برنامه‌ای هنوز محاسبه نشده است</p>
            <p className="text-xs mt-1">
              ابتدا از صفحه «محاسبه برنامه هفتگی» یک محاسبه ارسال کنید
            </p>
          </Card>
        ) : (
          <>
            {/* View mode + filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
                {(
                  [
                    { v: "feeder", l: "بر اساس فیدر" },
                    { v: "day", l: "بر اساس روز" },
                    { v: "time", l: "بر اساس ساعت" },
                  ] as const
                ).map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={`px-4 py-2 text-sm transition-colors ${
                      viewMode === v
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search
                  size={14}
                  className="absolute top-3 right-3 text-slate-400"
                />
                <input
                  value={filterFeeder}
                  onChange={(e) => setFilterFeeder(e.target.value)}
                  placeholder="جستجو فیدر..."
                  className="border border-slate-300 rounded-lg pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                />
              </div>

              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">همه تاریخ‌ها</option>
                {uniqueDates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={filterTimeSlot}
                onChange={(e) => setFilterTimeSlot(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">همه ساعات</option>
                {TIME_SLOTS.map((s) => (
                  <option key={s.label} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                >
                  <X size={14} /> حذف فیلترها
                </button>
              )}
            </div>

            {/* View by feeder */}
            {viewMode === "feeder" && (
              <div className="space-y-3">
                {byFeeder.size === 0 ? (
                  <Card>
                    <EmptyState
                      message={
                        hasFilters
                          ? "هیچ رویدادی با فیلترهای انتخابی یافت نشد"
                          : "هیچ رویدادی موجود نیست"
                      }
                    />
                  </Card>
                ) : (
                  [...byFeeder.entries()].map(([feederId, evs]) => {
                    const first = evs[0];
                    return (
                      <Card key={feederId}>
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                          <div>
                            <span className="font-medium text-sm">
                              {first.feederName}
                            </span>
                            <span className="text-xs text-slate-400 mr-2 font-mono text-left">
                              {first.feederCode}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {first.substationName}
                          </span>
                          <Badge color="blue">{evs.length} رویداد</Badge>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">
                                روز هفته
                              </th>
                              <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">
                                تاریخ
                              </th>
                              <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">
                                ساعت شروع
                              </th>
                              <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">
                                ساعت پایان
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {evs.map((e) => (
                              <tr key={e.id} className="hover:bg-slate-50">
                                <td className="px-4 py-2">{e.weekday}</td>
                                <td className="px-4 py-2 font-mono">
                                  {e.date}
                                </td>
                                <td className="px-4 py-2 font-mono">
                                  {e.startTime}
                                </td>
                                <td className="px-4 py-2 font-mono">
                                  {e.endTime}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* View by day */}
            {viewMode === "day" && (
              <div className="space-y-3">
                {byDate.size === 0 ? (
                  <Card>
                    <EmptyState message="هیچ رویدادی یافت نشد" />
                  </Card>
                ) : (
                  [...byDate.entries()].map(([date, evs]) => (
                    <Card key={date}>
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <span className="font-medium text-sm font-mono">
                          {date}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {evs[0]?.weekday}
                        </span>
                        <Badge color="green">{evs.length} فیدر</Badge>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">
                              نام فیدر
                            </th>
                            <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">
                              کد فیدر
                            </th>
                            <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">
                              پست فوق توزیع
                            </th>
                            <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">
                              ساعت شروع
                            </th>
                            <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">
                              ساعت پایان
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {evs.map((e) => (
                            <tr key={e.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2">{e.feederName}</td>
                              <td className="px-4 py-2 font-mono">
                                {e.feederCode}
                              </td>
                              <td className="px-4 py-2">{e.substationName}</td>
                              <td className="px-4 py-2 font-mono">
                                {e.startTime}
                              </td>
                              <td className="px-4 py-2 font-mono">
                                {e.endTime}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* View by time */}
            {viewMode === "time" && (
              <Card>
                {filtered.length === 0 ? (
                  <EmptyState message="هیچ رویدادی یافت نشد" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-right px-4 py-3 font-medium">
                            نام فیدر
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            کد فیدر
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            روز هفته
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            تاریخ
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            ساعت شروع
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            ساعت پایان
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">{e.feederName}</td>
                            <td className="px-4 py-3 font-mono">
                              {e.feederCode}
                            </td>
                            <td className="px-4 py-3">{e.weekday}</td>
                            <td className="px-4 py-3 font-mono">{e.date}</td>
                            <td className="px-4 py-3 font-mono">
                              {e.startTime}
                            </td>
                            <td className="px-4 py-3 font-mono">{e.endTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
