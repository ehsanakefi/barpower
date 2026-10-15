import { Badge } from "@/components/ui";

export function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    {
      label: string;
      color: "blue" | "green" | "yellow" | "red" | "gray" | "orange" | "purple";
      dot: string;
    }
  > = {
    running: { label: "در حال اجرا", color: "blue", dot: "bg-blue-500" },
    queued: { label: "در صف", color: "yellow", dot: "bg-amber-500" },
    completed: { label: "تکمیل‌شده", color: "green", dot: "bg-emerald-500" },
    failed: { label: "ناموفق", color: "red", dot: "bg-red-500" },
    infeasible: { label: "حل‌ناپذیر", color: "orange", dot: "bg-orange-500" },
    active: { label: "فعال", color: "green", dot: "bg-emerald-500" },
    inactive: { label: "غیرفعال", color: "gray", dot: "bg-slate-400" },
  };
  const item = config[status] ?? config.inactive;
  return (
    <Badge color={item.color}>
      <span className={`ml-1.5 h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </Badge>
  );
}
