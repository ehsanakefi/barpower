"use client";

import { companies } from "@/app/mocks/companies";
import { runs } from "@/app/mocks/runs";
import { Button, Card, Input, Select } from "@/components/ui";
import { Drawer } from "@/components/ui/drawer";
import { PageTitle } from "@/components/ui/pagetitle";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/statusbadge";
import { Toggle } from "@/components/ui/toggleadmin";
import {
  Building2,
  CheckCircle2,
  Download,
  Filter,
  Search,
  Zap,
  Database,
  ChevronsUpDown,
  Plus,
  Edit3,
  Eye,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

export default function CompaniesManagement() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof companies)[number] | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const filtered = companies.filter((c) =>
    `${c.code} ${c.name} ${c.province}`.includes(query),
  );
  return (
    <div>
      <PageTitle
        eyebrow="دایرکتوری مستأجرها"
        title="شرکت‌ها و مدیریت فضای کاری"
        description="ایجاد، پیکربندی و پایش شرکت‌های عضو پلتفرم"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            ایجاد شرکت جدید
          </Button>
        }
      />
      <div className="p-5 md:p-7">
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["کل شرکت‌ها", "۲۴", Building2],
            ["شرکت فعال", "۲۳", CheckCircle2],
            ["مجموع فیدرها", "۲٬۸۴۲", Zap],
            ["مجموع داده‌ها", "۳۹۱", Database],
          ].map(([label, value, Icon]) => (
            <Card key={label as string} className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                <Icon size={17} />
              </div>
              <div>
                <div className="text-lg font-bold">{value as string}</div>
                <div className="text-[11px] text-slate-500">
                  {label as string}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">
            <div className="relative flex-1 md:max-w-sm">
              <Search
                size={15}
                className="absolute right-3 top-2.5 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو بر اساس نام، کد یا استان..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-9 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <Button variant="secondary" size="sm">
              <Filter size={14} />
              فیلتر پیشرفته
            </Button>
            <Button variant="secondary" size="sm">
              <Download size={14} />
              خروجی
            </Button>
            <div className="mr-auto text-xs text-slate-400">۲۴ شرکت</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "کد شرکت",
                    "نام شرکت",
                    "استان",
                    "فیدرها",
                    "مجموعه داده",
                    "کاربران فعال",
                    "وضعیت",
                    "عملیات",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 font-medium"
                    >
                      {h}
                      <ChevronsUpDown
                        size={11}
                        className="mr-1 inline text-slate-300"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((company) => (
                  <tr key={company.code} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4 font-mono font-bold text-blue-600">
                      {company.code}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {company.name}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {company.province}
                    </td>
                    <td className="px-4 py-4">{company.feeders}</td>
                    <td className="px-4 py-4">{company.datasets}</td>
                    <td className="px-4 py-4">{company.users}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Toggle active={company.status === "active"} />
                        <StatusBadge status={company.status} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelected(company)}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={14} />
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

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={`${selected?.code} · استان ${selected?.province}`}
      >
        {selected && (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                [selected.feeders, "فیدر"],
                [selected.datasets, "داده"],
                [selected.users, "کاربر"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-slate-50 p-4 text-center">
                  <div className="text-xl font-bold text-slate-900">{v}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{l}</div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold">اطلاعات فضای کاری</h3>
              <div className="space-y-3 rounded-xl border border-slate-200 p-4 text-xs">
                {[
                  ["وضعیت", <StatusBadge status={selected.status} />],
                  ["آخرین فعالیت", selected.activity],
                  ["شناسه فضای کاری", `tenant_${selected.code.toLowerCase()}`],
                  ["نسخه داده فعال", "v24.3"],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold">اجراهای اخیر</h3>
              {runs.slice(0, 3).map((run) => (
                <div
                  key={run.id}
                  className="mb-2 flex items-center justify-between rounded-xl border border-slate-100 p-3"
                >
                  <div>
                    <div className="ltr text-xs font-bold">{run.id}</div>
                    <div className="mt-1 text-[10px] text-slate-400">
                      هفته {run.week}
                    </div>
                  </div>
                  <StatusBadge status={run.status} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Eye size={15} />
                ورود به نمای شرکت
              </Button>
              <Button variant="secondary">
                <Edit3 size={15} />
                ویرایش
              </Button>
              <Button variant="danger">
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-0 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="font-bold">ایجاد شرکت جدید</h2>
                <p className="mt-1 text-xs text-slate-500">
                  فضای کاری مستقل برای شرکت ایجاد می‌شود.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreateOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Input label="کد شرکت" placeholder="مثال: TEH-01" />
              <Input label="نام شرکت" placeholder="نام رسمی شرکت" />
              <Select label="استان">
                <option>انتخاب استان...</option>
                <option>تهران</option>
                <option>اصفهان</option>
                <option>فارس</option>
              </Select>
              <Select label="وضعیت اولیه">
                <option>فعال</option>
                <option>غیرفعال</option>
              </Select>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                انصراف
              </Button>
              <Button onClick={() => setCreateOpen(false)}>
                <Plus size={15} />
                ایجاد فضای کاری
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
