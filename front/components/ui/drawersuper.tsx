import { X } from "lucide-react";
import { Button } from "../ui";

export function Drawer({
  title,
  subtitle,
  open,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <section className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-950">{title}</h2>
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
