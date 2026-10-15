export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
