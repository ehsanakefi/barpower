export function ProgressBar({
  value,
  status,
}: {
  value: number;
  status: string;
}) {
  const color =
    status === "failed"
      ? "bg-red-500"
      : status === "infeasible"
        ? "bg-orange-500"
        : "bg-blue-600";
  return (
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
