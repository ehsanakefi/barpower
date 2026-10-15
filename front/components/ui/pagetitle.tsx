import { Circle } from "lucide-react";

export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-6 md:flex-row md:items-center md:justify-between md:px-7">
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-blue-600">
          <Circle size={6} fill="currentColor" />
          {eyebrow}
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
