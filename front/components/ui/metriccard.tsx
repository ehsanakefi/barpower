import { ArrowDownLeft, ArrowUpLeft } from "lucide-react";
import { Card } from "../ui";

export function MetricCard({
  title,
  value,
  note,
  icon: Icon,
  tone,
  trend,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ElementType;
  tone: string;
  trend?: "up" | "down";
}) {
  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon size={19} />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-600" : "text-red-600"}`}
          >
            {trend === "up" ? (
              <ArrowUpLeft size={14} />
            ) : (
              <ArrowDownLeft size={14} />
            )}{" "}
            ۱۲٪
          </span>
        )}
      </div>
      <div className="mt-5 text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-600">{title}</div>
      <div className="mt-2 text-[11px] text-slate-400">{note}</div>
    </Card>
  );
}
