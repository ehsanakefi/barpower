"use client";

import { companies } from "@/app/mocks/companies";
import { users } from "@/app/mocks/users";
import { Pagination } from "@/components/Pagination";
import { Badge, Button, Card, Select } from "@/components/ui";
import { PageTitle } from "@/components/ui/pagetitle";
import { PaginationContent } from "@/components/ui/pagination";
import { Toggle } from "@/components/ui/toggleadmin";
import {
  Edit3,
  KeyRound,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export default function Users({
  settingsMode = false,
}: {
  settingsMode?: boolean;
}) {
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [activeRows, setActiveRows] = useState(users.map((u) => u.active));
  const filtered = users.filter(
    (u) =>
      (role === "all" || u.role === role) &&
      (status === "all" || u.active === (status === "active")),
  );
  return (
    <div>
      <PageTitle
        eyebrow="هویت و دسترسی"
        title="مدیریت سراسری کاربران"
        description="کنترل نقش‌ها، دسترسی‌ها و وضعیت حساب کاربران تمام شرکت‌ها"
        action={
          <Button>
            <Plus size={16} />
            افزودن کاربر
          </Button>
        }
      />
      <div className="space-y-4 p-5 md:p-7">
        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative">
              <Search
                size={15}
                className="absolute right-3 top-2.5 text-slate-400"
              />
              <input
                placeholder="نام، نام کاربری یا ایمیل..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-9 text-xs outline-none focus:border-blue-400"
              />
            </div>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">همه نقش‌ها</option>
              <option value="USER">کاربر عادی</option>
              <option value="SUPER_ADMIN">مدیر ارشد</option>
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </Select>
            <Select>
              <option>همه شرکت‌ها</option>
              {companies.map((c) => (
                <option key={c.code}>{c.name}</option>
              ))}
            </Select>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-right text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "کاربر",
                    "ایمیل",
                    "شرکت مرتبط",
                    "نقش",
                    "تاریخ ایجاد",
                    "وضعیت حساب",
                    "عملیات",
                  ].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user, index) => (
                  <tr key={user.username} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 font-bold text-blue-700">
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {user.name}
                          </div>
                          <div className="ltr mt-0.5 text-[10px] text-slate-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="ltr px-5 py-4 text-left text-slate-500">
                      {user.email}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user.company}</td>
                    <td className="px-5 py-4">
                      <Badge
                        color={user.role === "SUPER_ADMIN" ? "purple" : "gray"}
                      >
                        {user.role === "SUPER_ADMIN" ? (
                          <>
                            <ShieldCheck size={12} className="ml-1" />
                            مدیر ارشد
                          </>
                        ) : (
                          "کاربر"
                        )}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{user.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Toggle
                          active={activeRows[index] ?? user.active}
                          onClick={() =>
                            setActiveRows((rows) =>
                              rows.map((v, i) => (i === index ? !v : v)),
                            )
                          }
                        />
                        <span className="text-slate-500">
                          {(activeRows[index] ?? user.active)
                            ? "فعال"
                            : "غیرفعال"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="بازنشانی رمز عبور"
                        >
                          <KeyRound size={14} />
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
          <PaginationContent />
        </Card>
      </div>
    </div>
  );
}
