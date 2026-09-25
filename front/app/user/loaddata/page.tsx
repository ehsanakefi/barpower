"use client";

import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Upload,
  Plus,
  Trash2,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  PageHeader,
  Button,
  Card,
  Input,
  Select,
  EmptyState,
  Alert,
  ConfirmDialog,
  Badge,
} from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { v4 as uuid } from "@/services/uuid";
import type { LoadRecord } from "@/models/types";
import { normalizePersianDigits } from "@/utils/jalali";

const PERSIAN_COLS = [
  "نام بهره بردار",
  "نوعگاه",
  "کد PGDS ایستگاه",
  "نوع تجهیز",
  "تجهیز",
  "کد PGDS تجهیز",
  "نوع انرژی",
  "تاریخ",
];
const HOUR_COLS = Array.from({ length: 24 }, (_, i) => `H${i + 1}`);

interface ImportPreviewRecord {
  raw: Record<string, string | number | null>;
  parsed: Partial<LoadRecord>;
  errors: string[];
  warnings: string[];
}

export default function LoadData() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"list" | "import" | "add">("list");
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [preview, setPreview] = useState<ImportPreviewRecord[] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // دسترسی ایمن به Zustand
  const rawRecords = useAppStore((state) => state.loadRecords);
  const records = useMemo(() => rawRecords ?? [], [rawRecords]);

  const rawDatasets = useAppStore((state) => state.datasets);
  const datasets = useMemo(() => rawDatasets ?? [], [rawDatasets]);

  const addLoadRecords = useAppStore((state) => state.addLoadRecords);
  const deleteLoadRecord = useAppStore((state) => state.deleteLoadRecord);
  const addDataset = useAppStore((state) => state.addDataset);

  const loadDatasets = useMemo(
    () => datasets.filter((d) => d.type === "load"),
    [datasets],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<Partial<LoadRecord>>();

  // فیلترینگ رکوردها
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedDataset !== "all" && r.datasetId !== selectedDataset)
        return false;
      if (filterDate && !r.date.includes(filterDate)) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          r.operatorName?.toLowerCase().includes(s) ||
          r.equipment?.toLowerCase().includes(s) ||
          r.stationPgdsCode?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [records, selectedDataset, filterDate, search]);

  function parseHour(val: unknown): number | null {
    if (val === null || val === undefined || val === "") return null;
    const n = Number(normalizePersianDigits(String(val)));
    return isNaN(n) ? null : n;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, {
        defval: null,
      }) as Record<string, unknown>[];

      const parsed: ImportPreviewRecord[] = rows.map((row) => {
        const errs: string[] = [];
        const warns: string[] = [];
        const hours: Record<string, number | null> = {};
        let calcTotal = 0;

        HOUR_COLS.forEach((h) => {
          const v = parseHour(row[h]);
          hours[h.toLowerCase()] = v;
          if (v !== null) calcTotal += v;
        });

        const importedTotal =
          row["مجموع"] !== null ? Number(row["مجموع"]) : null;
        if (
          importedTotal !== null &&
          Math.abs(importedTotal - calcTotal) > 0.01
        ) {
          warns.push(
            `مجموع غیردقیق (${importedTotal} vs ${calcTotal.toFixed(1)})`,
          );
        }

        const stationCode = String(row["کد PGDS ایستگاه"] ?? "");
        if (!stationCode) errs.push("کد ایستگاه الزامی است");

        return {
          raw: row as Record<string, string | number | null>,
          parsed: {
            operatorName: String(row["نام بهره بردار"] ?? ""),
            stationType: String(row["نوعگاه"] ?? ""),
            stationPgdsCode: stationCode,
            equipmentType: String(row["نوع تجهیز"] ?? ""),
            equipment: String(row["تجهیز"] ?? ""),
            equipmentPgdsCode: String(row["کد PGDS تجهیز"] ?? ""),
            energyType: String(row["نوع انرژی"] ?? ""),
            date: String(row["تاریخ"] ?? ""),
            ...Object.fromEntries(
              HOUR_COLS.map((h) => [h.toLowerCase(), hours[h.toLowerCase()]]),
            ),
            total: calcTotal,
          },
          errors: errs,
          warnings: warns,
        };
      });
      setPreview(parsed);
    };
    reader.readAsArrayBuffer(file);
  }

  async function commitImport() {
    if (!preview) return;
    setIsSubmitting(true);

    const dsId = uuid();
    const validRecords = preview
      .filter((p) => p.errors.length === 0)
      .map((p) => ({
        ...(p.parsed as LoadRecord),
        id: uuid(),
        datasetId: dsId,
      }));

    addDataset({
      id: dsId,
      name: `بارگذاری ${new Date().toLocaleDateString("fa-IR")}`,
      type: "load",
      uploadedAt: new Date().toISOString(),
      fileName: fileRef.current?.files?.[0]?.name ?? "excel_import",
      recordCount: validRecords.length,
      version: 1,
    });

    addLoadRecords(validRecords);
    setPreview(null);
    setTab("list");
    setIsSubmitting(false);
  }

  async function onManualSubmit(data: Partial<LoadRecord>) {
    const dsId = uuid();
    addDataset({
      id: dsId,
      name: `ورود دستی ${new Date().toLocaleDateString("fa-IR")}`,
      type: "load",
      uploadedAt: new Date().toISOString(),
      fileName: "manual",
      recordCount: 1,
      version: 1,
    });

    addLoadRecords([
      {
        id: uuid(),
        datasetId: dsId,
        operatorName: data.operatorName ?? "",
        stationType: data.stationType ?? "",
        stationPgdsCode: data.stationPgdsCode ?? "",
        equipmentType: data.equipmentType ?? "",
        equipment: data.equipment ?? "",
        equipmentPgdsCode: data.equipmentPgdsCode ?? "",
        energyType: data.energyType ?? "",
        date: data.date ?? "",
        total: 0,
        ...Object.fromEntries(
          Array.from({ length: 24 }, (_, i) => [`h${i + 1}`, 0]),
        ),
      },
    ]);

    reset();
    setTab("list");
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteLoadRecord(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="داده‌های بار شبکه"
        subtitle="مدیریت، بارگذاری اکسل و بررسی پروفایل بار مصرفی فیدرها"
        action={
          <div className="flex gap-2">
            <Button
              variant={tab === "list" ? "primary" : "secondary"}
              onClick={() => setTab("list")}
            >
              لیست داده‌ها
            </Button>
            <Button
              variant={tab === "import" ? "primary" : "secondary"}
              onClick={() => setTab("import")}
            >
              <Upload size={16} />
              بارگذاری اکسل
            </Button>
            <Button
              variant={tab === "add" ? "primary" : "secondary"}
              onClick={() => setTab("add")}
            >
              <Plus size={16} />
              ثبت دستی
            </Button>
          </div>
        }
      />

      {/* تب لیست و جدول داده‌ها */}
      {tab === "list" && (
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                فیلتر مجموعه داده
              </label>
              <Select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
              >
                <option value="all">
                  همه مجموعه‌ها ({records.length} رکورد)
                </option>
                {loadDatasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.recordCount ?? 0} رکورد)
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                جستجو در نام تجهیز/ایستگاه
              </label>
              <div className="relative">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو..."
                  className="pl-8"
                />
                <Search
                  size={16}
                  className="absolute left-2.5 top-3 text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                فیلتر بر اساس تاریخ
              </label>
              <Input
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="مثلاً: 1403/06/15"
                className="ltr"
              />
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <EmptyState
              title="رکوردی یافت نشد"
              description="داده‌ای متناسب با فیلترهای انتخابی پیدا نشد یا هنوز رکوردی بارگذاری نکرده‌اید."
              action={
                <Button onClick={() => setTab("import")}>
                  <Upload size={16} />
                  بارگذاری اولین فایل
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-right border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-3">تاریخ</th>
                    <th className="p-3">نام ایستگاه / کد</th>
                    <th className="p-3">تجهیز / فیدر</th>
                    <th className="p-3">کد تجهیز</th>
                    <th className="p-3">نوع انرژی</th>
                    <th className="p-3">مجموع روزانه (MWh)</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="p-3 ltr font-mono">{r.date}</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">
                          {r.operatorName || "---"}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {r.stationPgdsCode}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-700">
                          {r.equipment}
                        </span>
                        <span className="mr-1 text-[11px] text-slate-400">
                          ({r.equipmentType})
                        </span>
                      </td>
                      <td className="p-3 font-mono ltr text-slate-500">
                        {r.equipmentPgdsCode}
                      </td>
                      <td className="p-3">
                        <Badge color="blue">{r.energyType || "اکتیو"}</Badge>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">
                        {r.total?.toFixed?.(2) ?? r.total}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setDeleteTarget(r.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="حذف رکورد"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* تب ایمپورت اکسل */}
      {tab === "import" && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              بارگذاری اکسل نمایه بار ساعتی
            </h3>
            <p className="text-xs text-slate-500">
              فایل حاوی ستون‌های کد PGDS، تجهیز و مقادیر ساعتی H1 الی H24 را
              انتخاب نمایید.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <FileSpreadsheet size={42} className="text-slate-400 mb-3" />
            <input
              type="file"
              ref={fileRef}
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload">
              <Button
                variant="secondary"
                onClick={() => fileRef.current?.click()}
              >
                انتخاب فایل اکسل
              </Button>
            </label>
            <span className="text-xs text-slate-400 mt-2">
              فرمت‌های مجاز: xlsx, xls
            </span>
          </div>

          {preview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700">
                  پیش‌نمایش داده‌های خوانده‌شده ({preview.length} ردیف)
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPreview(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    انصراف
                  </Button>
                  <Button loading={isSubmitting} onClick={commitImport}>
                    <CheckCircle size={15} />
                    تأیید و ذخیره در سیستم
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-96">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2">وضعیت</th>
                      <th className="p-2">تاریخ</th>
                      <th className="p-2">کد ایستگاه</th>
                      <th className="p-2">تجهیز</th>
                      <th className="p-2">مجموع محاسبه‌شده</th>
                      <th className="p-2">توضیحات / هشدار</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.map((p, idx) => (
                      <tr
                        key={idx}
                        className={
                          p.errors.length > 0
                            ? "bg-red-50/50"
                            : p.warnings.length > 0
                              ? "bg-yellow-50/30"
                              : ""
                        }
                      >
                        <td className="p-2">
                          {p.errors.length > 0 ? (
                            <Badge color="red">خطا</Badge>
                          ) : p.warnings.length > 0 ? (
                            <Badge color="yellow">هشدار</Badge>
                          ) : (
                            <Badge color="green">صحیح</Badge>
                          )}
                        </td>
                        <td className="p-2 ltr font-mono">{p.parsed.date}</td>
                        <td className="p-2 font-mono">
                          {p.parsed.stationPgdsCode}
                        </td>
                        <td className="p-2">{p.parsed.equipment}</td>
                        <td className="p-2 font-mono font-bold">
                          {p.parsed.total?.toFixed(2)}
                        </td>
                        <td className="p-2 text-xs">
                          {p.errors.map((e, i) => (
                            <span key={i} className="text-red-500 block">
                              • {e}
                            </span>
                          ))}
                          {p.warnings.map((w, i) => (
                            <span key={i} className="text-yellow-600 block">
                              • {w}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* تب ورود دستی رکورد */}
      {tab === "add" && (
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            ورود دستی مشخصات بار
          </h3>
          <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  نام بهره‌بردار
                </label>
                <Input
                  {...register("operatorName", { required: true })}
                  placeholder="مثال: شرکت توزیع برق"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  کد PGDS ایستگاه
                </label>
                <Input
                  {...register("stationPgdsCode", { required: true })}
                  placeholder="مثال: ST-102"
                  className="ltr"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  نوع ایستگاه
                </label>
                <Input
                  {...register("stationType")}
                  placeholder="فوق توزیع / انتقال"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  نام تجهیز / فیدر
                </label>
                <Input
                  {...register("equipment", { required: true })}
                  placeholder="مثال: فیدر دانشگاه"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  کد PGDS تجهیز
                </label>
                <Input
                  {...register("equipmentPgdsCode")}
                  placeholder="مثال: EQ-998"
                  className="ltr"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  تاریخ (جلالی)
                </label>
                <Input
                  {...register("date", { required: true })}
                  placeholder="۱۴۰۳/۰۶/۲۱"
                  className="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setTab("list")}
              >
                انصراف
              </Button>
              <Button type="submit">ثبت اطلاعات</Button>
            </div>
          </form>
        </Card>
      )}

      {/* دیالوگ تأیید حذف */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="حذف رکورد بار"
        message="آیا از حذف این رکورد بار اطمینان دارید؟ این عملیات قابل بازگشت نیست."
        confirmText="حذف رکورد"
        cancelText="انصراف"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
