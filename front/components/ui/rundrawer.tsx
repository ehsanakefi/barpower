import { CalendarDays, Download, FileWarning } from "lucide-react";
import { Drawer } from "./drawersuper";
import { StatusBadge } from "./statusbadge";
import { Badge, Button } from "../ui";
import { runs } from "@/app/mocks/runs";

const outages = [
  {
    feeder: "فیدر ابوذر",
    code: "FD-1024",
    day: "شنبه",
    date: "۱۴۰۵/۰۷/۱۲",
    time: "۱۰:۰۰ تا ۱۲:۰۰",
    substation: "پست بعثت",
  },
  {
    feeder: "فیدر آجین",
    code: "FD-0841",
    day: "یکشنبه",
    date: "۱۴۰۵/۰۷/۱۳",
    time: "۱۴:۰۰ تا ۱۶:۰۰",
    substation: "پست آزادی",
  },
  {
    feeder: "فیدر گلستان",
    code: "FD-1340",
    day: "دوشنبه",
    date: "۱۴۰۵/۰۷/۱۴",
    time: "۱۲:۰۰ تا ۱۴:۰۰",
    substation: "پست شمال",
  },
];

export function RunDrawer({
  run,
  onClose,
}: {
  run: (typeof runs)[number] | null;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={!!run}
      onClose={onClose}
      title={`جزئیات اجرا ${run?.id ?? ""}`}
      subtitle={`${run?.company ?? ""} · هفته ${run?.week ?? ""}`}
    >
      {run && (
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div>
              <div className="text-xs text-slate-500">وضعیت نهایی</div>
              <div className="mt-2">
                <StatusBadge status={run.status} />
              </div>
            </div>
            <div className="text-left">
              <div className="text-xs text-slate-500">مدت اجرا</div>
              <div className="mt-1 font-bold">{run.duration}</div>
            </div>
          </div>
          {run.error && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-orange-800">
                <FileWarning size={17} />
                خلاصه خطا
              </div>
              <p className="mt-2 text-xs leading-6 text-orange-700">
                {run.error}. محدودیت «حتماً وصل» با بازه خاموشی اجباری هم‌پوشانی
                دارد.
              </p>
            </div>
          )}
          <div>
            <h3 className="mb-3 text-sm font-bold">رویدادهای خاموشی</h3>
            <div className="space-y-2">
              {outages.map((event) => (
                <div
                  key={event.code}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{event.feeder}</div>
                      <div className="ltr mt-1 text-right text-[10px] text-slate-400">
                        {event.code} · {event.substation}
                      </div>
                    </div>
                    <Badge color="blue">{event.time}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <CalendarDays size={13} />
                    {event.day}، {event.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-slate-950 p-5 text-white">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold">خط زمانی خاموشی‌ها</span>
              <span className="text-[10px] text-slate-400">۲۴ ساعت</span>
            </div>
            <div className="relative h-16 rounded-lg bg-slate-900">
              <div className="absolute right-[42%] top-3 h-10 w-[18%] rounded-md bg-blue-500/80" />
              <div className="absolute right-[63%] top-3 h-10 w-[10%] rounded-md bg-violet-500/80" />
            </div>
            <div
              className="mt-2 flex justify-between text-[9px] text-slate-500"
              dir="ltr"
            >
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>24</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">
              <Download size={15} />
              دریافت گزارش کامل
            </Button>
            <Button variant="secondary">مشاهده برنامه</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
