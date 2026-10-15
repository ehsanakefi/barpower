import { AlertCircle, Check, ServerCog, SlidersHorizontal } from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui";
import { PageTitle } from "../../../components/ui/pagetitle";
import { SectionHeader } from "../../../components/ui/sectionheader";
import { logItems } from "@/app/mocks/logs";

export default function SettingsLogs() {
  return (
    <div>
      <PageTitle
        eyebrow="مدیریت سامانه"
        title="تنظیمات و رویدادهای سیستم"
        description="پیکربندی عمومی، سلامت سرویس‌ها و ردپای ممیزی پلتفرم"
      />
      <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <SectionHeader title="سلامت سرویس‌ها" />
          <div className="space-y-4 p-5">
            {[
              ["پایگاه داده", "عملیاتی"],
              ["موتور زمان‌بندی", "عملیاتی"],
              ["ذخیره‌سازی فایل", "عملیاتی"],
              ["سرویس اعلان", "افت عملکرد"],
            ].map(([name, state], i) => (
              <div className="flex items-center justify-between" key={name}>
                <div className="flex items-center gap-2 text-xs">
                  <ServerCog size={15} className="text-slate-400" />
                  {name}
                </div>
                <Badge color={i === 3 ? "yellow" : "green"}>{state}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <SectionHeader
            title="رویدادهای اخیر"
            description="ردپای ممیزی فعالیت‌های مدیریتی"
            action={
              <Button variant="secondary" size="sm">
                <SlidersHorizontal size={14} />
                فیلتر
              </Button>
            }
          />
          <div className="divide-y divide-slate-100">
            {logItems.map(([title, source, time, type]) => (
              <div className="flex items-start gap-3 p-4" key={title}>
                <div
                  className={`mt-0.5 rounded-lg p-2 ${type === "error" ? "bg-red-50 text-red-600" : type === "info" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}
                >
                  {type === "error" ? (
                    <AlertCircle size={15} />
                  ) : (
                    <Check size={15} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium">{title}</div>
                  <div className="mt-1 text-[10px] text-slate-400">
                    {source}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">{time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
