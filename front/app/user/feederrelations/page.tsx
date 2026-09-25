"use client";

import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { Upload, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  EmptyState,
  Alert,
  Badge,
  ConfirmDialog,
} from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { v4 as uuid } from "@/services/uuid";
import type { FeederRelation, Feeder } from "@/models/types";

export default function FeederRelationsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"list" | "add">("list");
  const [filterType, setFilterType] = useState<
    "all" | "simultaneous" | "non-simultaneous"
  >("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // واکشی داده‌ها و اکشن‌ها از Zustand Store
  const relations = useAppStore((state) => state.feederRelations);
  const feeders = useAppStore((state) => state.feeders);
  const addFeederRelations = useAppStore((state) => state.addFeederRelations);
  const deleteFeederRelation = useAppStore(
    (state) => state.deleteFeederRelation,
  );
  const addDataset = useAppStore((state) => state.addDataset);

  const feederMap = useMemo(
    () => new Map<string, Feeder>(feeders.map((f) => [f.id, f])),
    [feeders],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{
    baseFeederId: string;
    relatedFeederId: string;
    relationType: "simultaneous" | "non-simultaneous";
  }>();

  const watchBase = watch("baseFeederId");

  function validateRelation(
    baseFeederId: string,
    relatedFeederId: string,
    relationType: string,
  ): string[] {
    const errs: string[] = [];
    if (baseFeederId === relatedFeederId)
      errs.push("فیدر پایه و فیدر مرتبط نمی‌توانند یکسان باشند");

    const isDuplicate = relations.some(
      (r) =>
        (r.baseFeederId === baseFeederId &&
          r.relatedFeederId === relatedFeederId) ||
        (r.baseFeederId === relatedFeederId &&
          r.relatedFeederId === baseFeederId),
    );
    if (isDuplicate) errs.push("این رابطه قبلاً ثبت شده است");

    const conflict = relations.some(
      (r) =>
        ((r.baseFeederId === baseFeederId &&
          r.relatedFeederId === relatedFeederId) ||
          (r.baseFeederId === relatedFeederId &&
            r.relatedFeederId === baseFeederId)) &&
        r.relationType !== relationType,
    );
    if (conflict) errs.push("این جفت فیدر در نوع دیگری از رابطه ثبت شده‌اند");

    return errs;
  }

  async function onSubmit(data: {
    baseFeederId: string;
    relatedFeederId: string;
    relationType: "simultaneous" | "non-simultaneous";
  }) {
    const errs = validateRelation(
      data.baseFeederId,
      data.relatedFeederId,
      data.relationType,
    );
    if (errs.length > 0) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors([]);
    setIsSubmitting(true);

    try {
      const dsId = uuid();
      addDataset({
        id: dsId,
        name: `رابطه دستی ${new Date().toLocaleDateString("fa-IR")}`,
        type: "feeder-relations",
        uploadedAt: new Date().toISOString(),
        fileName: "manual",
        recordCount: 1,
        version: 1,
      });

      addFeederRelations([
        {
          id: uuid(),
          ...data,
          datasetId: dsId,
        },
      ]);

      reset();
      setTab("list");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<
          string,
          string
        >[];

        const nameToId = new Map<string, string>(
          feeders.map((f) => [f.name, f.id]),
        );
        const dsId = uuid();
        const newRelations: FeederRelation[] = [];

        for (const row of rows) {
          const baseName = String(
            row["Feeder Name"] ?? row["نام فیدر"] ?? "",
          ).trim();
          const baseId = nameToId.get(baseName);
          if (!baseId) continue;

          const simNames = String(
            row["At the Same Time"] ?? row["هم‌زمان"] ?? "",
          ).split(/[,،;\n]/);
          const nonSimNames = String(
            row["Not the Same Time"] ?? row["غیرهم‌زمان"] ?? "",
          ).split(/[,،;\n]/);

          for (const name of simNames) {
            const trimmed = name.trim();
            if (!trimmed) continue;
            const relatedId = nameToId.get(trimmed);
            if (!relatedId || relatedId === baseId) continue;
            const errs = validateRelation(baseId, relatedId, "simultaneous");
            if (errs.length === 0) {
              newRelations.push({
                id: uuid(),
                baseFeederId: baseId,
                relatedFeederId: relatedId,
                relationType: "simultaneous",
                datasetId: dsId,
              });
            }
          }

          for (const name of nonSimNames) {
            const trimmed = name.trim();
            if (!trimmed) continue;
            const relatedId = nameToId.get(trimmed);
            if (!relatedId || relatedId === baseId) continue;
            const errs = validateRelation(
              baseId,
              relatedId,
              "non-simultaneous",
            );
            if (errs.length === 0) {
              newRelations.push({
                id: uuid(),
                baseFeederId: baseId,
                relatedFeederId: relatedId,
                relationType: "non-simultaneous",
                datasetId: dsId,
              });
            }
          }
        }

        if (newRelations.length === 0) {
          setImportMsg("خطا: هیچ رابطه معتبری در فایل یافت نشد");
          return;
        }

        addDataset({
          id: dsId,
          name: `روابط فیدر ${new Date().toLocaleDateString("fa-IR")}`,
          type: "feeder-relations",
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          recordCount: newRelations.length,
          version: 1,
        });

        addFeederRelations(newRelations);
        setImportMsg(`${newRelations.length} رابطه با موفقیت بارگذاری شد`);
        setTab("list");
      } catch {
        setImportMsg("خطا در تجزیه فایل Excel");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  }

  const filtered = relations.filter(
    (r) => filterType === "all" || r.relationType === filterType,
  );

  return (
    <div>
      <PageHeader
        title="محدودیت‌های هم‌زمانی فیدرها"
        subtitle={`${relations.length} رابطه ثبت شده`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={14} /> بارگذاری Excel
            </Button>
            <Button size="sm" onClick={() => setTab("add")}>
              <Plus size={14} /> افزودن رابطه
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
        }
      />

      <div className="flex border-b border-slate-200 bg-white px-6">
        {[
          { key: "list", label: "لیست روابط" },
          { key: "add", label: "افزودن رابطه" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {importMsg && (
          <Alert type={importMsg.includes("خطا") ? "error" : "success"}>
            <div className="flex justify-between items-center w-full">
              <span>{importMsg}</span>
              <button
                onClick={() => setImportMsg(null)}
                className="mr-2 text-slate-500 hover:text-slate-800"
              >
                <X size={14} />
              </button>
            </div>
          </Alert>
        )}

        {tab === "list" && (
          <>
            <div className="flex gap-2">
              {[
                { v: "all", l: "همه" },
                { v: "simultaneous", l: "هم‌زمان" },
                { v: "non-simultaneous", l: "غیرهم‌زمان" },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setFilterType(v as typeof filterType)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filterType === v
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-right px-4 py-3 font-medium">
                        فیدر پایه
                      </th>
                      <th className="text-right px-4 py-3 font-medium">
                        فیدر مرتبط
                      </th>
                      <th className="text-right px-4 py-3 font-medium">
                        نوع رابطه
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8">
                          <EmptyState message="هیچ رابطه‌ای ثبت نشده است" />
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => {
                        const base = feederMap.get(r.baseFeederId);
                        const related = feederMap.get(r.relatedFeederId);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-800">
                                {base?.name ?? r.baseFeederId}
                              </div>
                              <div className="text-xs text-slate-400 font-mono text-left">
                                {base?.code}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-800">
                                {related?.name ?? r.relatedFeederId}
                              </div>
                              <div className="text-xs text-slate-400 font-mono text-left">
                                {related?.code}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {r.relationType === "simultaneous" ? (
                                <Badge color="orange">قطع هم‌زمان</Badge>
                              ) : (
                                <Badge color="red">عدم قطع هم‌زمان</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-left">
                              <button
                                onClick={() => setDeleteTarget(r.id)}
                                className="text-red-400 hover:text-red-600 p-1"
                                title="حذف"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {tab === "add" && (
          <Card className="max-w-lg p-6">
            <h3 className="text-sm font-bold mb-5">افزودن رابطه جدید</h3>
            {validationErrors.length > 0 && (
              <Alert type="error">
                <ul className="space-y-1">
                  {validationErrors.map((e, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  فیدر پایه
                </label>
                <select
                  {...register("baseFeederId", { required: true })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">انتخاب فیدر...</option>
                  {feeders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  نوع رابطه
                </label>
                <div className="flex gap-4">
                  {[
                    { v: "simultaneous", l: "قطع هم‌زمان" },
                    { v: "non-simultaneous", l: "عدم قطع هم‌زمان" },
                  ].map(({ v, l }) => (
                    <label
                      key={v}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={v}
                        defaultChecked={v === "simultaneous"}
                        {...register("relationType", { required: true })}
                      />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  فیدر مرتبط
                </label>
                <select
                  {...register("relatedFeederId", { required: true })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">انتخاب فیدر...</option>
                  {feeders
                    .filter((f) => f.id !== watchBase)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} — {f.code}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    reset();
                    setTab("list");
                    setValidationErrors([]);
                  }}
                >
                  انصراف
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  ذخیره رابطه
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف رابطه"
        message="آیا از حذف این رابطه مطمئن هستید؟"
        onConfirm={() => {
          if (deleteTarget) {
            deleteFeederRelation(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
