import { Button } from "../ui";

export function Toggle({
  active,
  onClick,
}: {
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={active ? "غیرفعال کردن" : "فعال کردن"}
      onClick={onClick}
      className={`h-6 w-11 rounded-full p-0 ${active ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-200 hover:bg-slate-300"}`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${active ? "-translate-x-2.5" : "translate-x-2.5"}`}
      />
    </Button>
  );
}
