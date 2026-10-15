import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Upload, Plus, Trash2, Search, X, AlertTriangle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PageHeader, Button, Card, Input, Select, EmptyState, LoadingSpinner, Alert, ConfirmDialog } from '@/components/ui';
import * as svc from '@/services/mockService';
import { v4 as uuid } from '@/services/uuid';
import type { LoadRecord, Dataset } from '@/models/types';
import { normalizePersianDigits } from '@/utils/jalali';

const PERSIAN_COLS = ['نام بهره بردار','نوعگاه','کد PGDS ایستگاه','نوع تجهیز','تجهیز','کد PGDS تجهیز','نوع انرژی','تاریخ'];
const HOUR_COLS = Array.from({ length: 24 }, (_, i) => `H${i + 1}`);
const ALL_COLS = [...PERSIAN_COLS, ...HOUR_COLS, 'مجموع'];

interface ImportPreviewRecord {
  raw: Record<string, string | number | null>;
  parsed: Partial<LoadRecord>;
  errors: string[];
  warnings: string[];
  isDuplicate?: boolean;
}

export default function LoadData() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'list' | 'import' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [preview, setPreview] = useState<ImportPreviewRecord[] | null>(null);
  const [importWarning, setImportWarning] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<string>('all');

  const { data: records = [], isLoading } = useQuery({ queryKey: ['loadRecords'], queryFn: () => svc.getLoadRecords() });
  const { data: datasets = [] } = useQuery({ queryKey: ['datasets'], queryFn: svc.getDatasets });
  const loadDatasets = datasets.filter(d => d.type === 'load');

  const addMutation = useMutation({
    mutationFn: async (records: LoadRecord[]) => {
      await svc.saveLoadRecords(records);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loadRecords'] }); qc.invalidateQueries({ queryKey: ['datasets'] }); }
  });

  const deleteMutation = useMutation({
    mutationFn: svc.deleteLoadRecord,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loadRecords'] }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<LoadRecord>>();

  const filteredRecords = records.filter(r => {
    if (selectedDataset !== 'all' && r.datasetId !== selectedDataset) return false;
    if (filterDate && !r.date.includes(filterDate)) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.operatorName?.toLowerCase().includes(s) ||
        r.equipment?.toLowerCase().includes(s) ||
        r.stationPgdsCode?.toLowerCase().includes(s);
    }
    return true;
  });

  function parseHour(val: unknown): number | null {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(normalizePersianDigits(String(val)));
    return isNaN(n) ? null : n;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];

      const warnings: string[] = [];
      const parsed: ImportPreviewRecord[] = rows.slice(0, 200).map((row, i) => {
        const errs: string[] = [];
        const warns: string[] = [];
        const hours: Record<string, number | null> = {};
        let calcTotal = 0;

        HOUR_COLS.forEach(h => {
          const v = parseHour(row[h]);
          hours[h.toLowerCase()] = v;
          if (v !== null) calcTotal += v;
        });

        const importedTotal = row['مجموع'] !== null ? Number(row['مجموع']) : null;
        if (importedTotal !== null && Math.abs(importedTotal - calcTotal) > 0.01) {
          warns.push(`مجموع وارد شده (${importedTotal}) با مجموع محاسبه‌شده (${calcTotal.toFixed(2)}) مطابقت ندارد`);
        }

        const stationCode = String(row['کد PGDS ایستگاه'] ?? '');
        if (!stationCode) errs.push('کد PGDS ایستگاه خالی است');

        return {
          raw: row as Record<string, string | number | null>,
          parsed: {
            id: uuid(),
            operatorName: String(row['نام بهره بردار'] ?? ''),
            stationType: String(row['نوعگاه'] ?? ''),
            stationPgdsCode: stationCode,
            equipmentType: String(row['نوع تجهیز'] ?? ''),
            equipment: String(row['تجهیز'] ?? ''),
            equipmentPgdsCode: String(row['کد PGDS تجهیز'] ?? ''),
            energyType: String(row['نوع انرژی'] ?? ''),
            date: String(row['تاریخ'] ?? ''),
            ...Object.fromEntries(HOUR_COLS.map(h => [h.toLowerCase(), hours[h.toLowerCase()]])),
            total: calcTotal,
            importedTotal,
            datasetId: '',
          },
          errors: errs,
          warnings: warns,
        };
      });

      setPreview(parsed);
      setImportWarning(warnings);
    };
    reader.readAsArrayBuffer(file);
  }

  async function commitImport() {
    if (!preview) return;
    const dsId = uuid();
    const validRecords = preview.filter(p => p.errors.length === 0).map(p => ({
      ...p.parsed as LoadRecord,
      id: uuid(),
      datasetId: dsId,
    }));
    const dataset: Dataset = {
      id: dsId, name: `بارگذاری ${new Date().toLocaleDateString('fa-IR')}`,
      type: 'load', uploadedAt: new Date().toISOString(),
      fileName: fileRef.current?.files?.[0]?.name ?? 'unknown',
      recordCount: validRecords.length, version: 1,
    };
    await svc.saveDataset(dataset);
    await addMutation.mutateAsync(validRecords);
    setPreview(null);
    setTab('list');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onManualSubmit(data: Partial<LoadRecord>) {
    const dsId = uuid();
    const dataset: Dataset = {
      id: dsId, name: `ورود دستی ${new Date().toLocaleDateString('fa-IR')}`,
      type: 'load', uploadedAt: new Date().toISOString(),
      fileName: 'manual', recordCount: 1, version: 1,
    };
    await svc.saveDataset(dataset);
    const record: LoadRecord = {
      id: uuid(), datasetId: dsId,
      operatorName: data.operatorName ?? '',
      stationType: data.stationType ?? '',
      stationPgdsCode: data.stationPgdsCode ?? '',
      equipmentType: data.equipmentType ?? '',
      equipment: data.equipment ?? '',
      equipmentPgdsCode: data.equipmentPgdsCode ?? '',
      energyType: data.energyType ?? '',
      date: data.date ?? '',
      ...Object.fromEntries(Array.from({ length: 24 }, (_, i) => [`h${i + 1}`, null])),
      total: null, importedTotal: null,
    };
    await addMutation.mutateAsync([record]);
    reset();
    setTab('list');
  }

  return (
    <div>
      <PageHeader
        title="داده‌های بار شبکه"
        subtitle={`${filteredRecords.length} رکورد`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setTab('import')}>
              <Upload size={14} /> بارگذاری Excel
            </Button>
            <Button size="sm" onClick={() => setTab('add')}>
              <Plus size={14} /> افزودن دستی
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6">
        {[
          { key: 'list', label: 'لیست رکوردها' },
          { key: 'import', label: 'بارگذاری Excel' },
          { key: 'add', label: 'ورود دستی' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* List tab */}
        {tab === 'list' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute top-2.5 right-3 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="جستجو..."
                  className="w-full border border-slate-300 rounded-lg pr-8 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                placeholder="فیلتر تاریخ (مثلاً ۱۴۰۵/۰۶)"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ltr"
              />
              <Select value={selectedDataset} onChange={e => setSelectedDataset(e.target.value)} className="w-48">
                <option value="all">همه مجموعه‌ها</option>
                {loadDatasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>

            <Card>
              {isLoading ? <LoadingSpinner /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['تاریخ', 'بهره‌بردار', 'تجهیز', 'کد PGDS', 'نوع انرژی', 'مجموع', ''].map(h => (
                          <th key={h} className="text-right px-4 py-3 text-xs text-slate-600 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.length === 0 ? (
                        <tr><td colSpan={7}><EmptyState message="هیچ رکوردی یافت نشد" /></td></tr>
                      ) : filteredRecords.slice(0, 100).map(r => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 ltr">{r.date}</td>
                          <td className="px-4 py-2.5">{r.operatorName}</td>
                          <td className="px-4 py-2.5">{r.equipment}</td>
                          <td className="px-4 py-2.5 ltr">{r.equipmentPgdsCode}</td>
                          <td className="px-4 py-2.5">{r.energyType}</td>
                          <td className="px-4 py-2.5 ltr">{r.total?.toFixed(1) ?? '—'}</td>
                          <td className="px-4 py-2.5">
                            <button onClick={() => setDeleteTarget(r.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Import tab */}
        {tab === 'import' && (
          <div className="max-w-3xl space-y-4">
            <Card className="p-6">
              <h3 className="text-sm font-bold mb-4">بارگذاری فایل Excel</h3>
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500">برای انتخاب فایل کلیک کنید یا فایل را اینجا رها کنید</p>
                <p className="text-xs text-slate-400 mt-1">فرمت .xlsx پشتیبانی می‌شود</p>
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
            </Card>

            {importWarning.length > 0 && (
              <Alert type="warning">
                <ul className="space-y-1">
                  {importWarning.map((w, i) => <li key={i}>⚠️ {w}</li>)}
                </ul>
              </Alert>
            )}

            {preview && (
              <Card>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold">پیش‌نمایش ({preview.length} ردیف)</span>
                    <span className="text-xs text-slate-500 mr-2">
                      {preview.filter(p => p.errors.length > 0).length} خطا،&nbsp;
                      {preview.filter(p => p.warnings.length > 0).length} هشدار
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setPreview(null)}>
                      <X size={12} /> لغو
                    </Button>
                    <Button size="sm" onClick={commitImport} loading={addMutation.isPending}>
                      <CheckCircle size={12} /> ذخیره
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="text-right px-3 py-2 text-slate-500">ردیف</th>
                        <th className="text-right px-3 py-2 text-slate-500">تاریخ</th>
                        <th className="text-right px-3 py-2 text-slate-500">تجهیز</th>
                        <th className="text-right px-3 py-2 text-slate-500">کد PGDS</th>
                        <th className="text-right px-3 py-2 text-slate-500">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {preview.slice(0, 50).map((p, i) => (
                        <tr key={i} className={p.errors.length > 0 ? 'bg-red-50' : p.warnings.length > 0 ? 'bg-yellow-50' : ''}>
                          <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2 ltr">{String(p.raw['تاریخ'] ?? '')}</td>
                          <td className="px-3 py-2">{String(p.raw['تجهیز'] ?? '')}</td>
                          <td className="px-3 py-2 ltr">{String(p.raw['کد PGDS تجهیز'] ?? '')}</td>
                          <td className="px-3 py-2">
                            {p.errors.length > 0
                              ? <span className="text-red-600 flex items-center gap-1"><X size={10} /> {p.errors[0]}</span>
                              : p.warnings.length > 0
                              ? <span className="text-yellow-600 flex items-center gap-1"><AlertTriangle size={10} /> {p.warnings[0]}</span>
                              : <span className="text-green-600">✓ معتبر</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Manual add tab */}
        {tab === 'add' && (
          <Card className="max-w-2xl p-6">
            <h3 className="text-sm font-bold mb-5">افزودن رکورد جدید</h3>
            <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="نام بهره‌بردار" {...register('operatorName', { required: true })} />
                <Input label="نوعگاه" {...register('stationType')} />
                <Input label="کد PGDS ایستگاه" className="ltr" {...register('stationPgdsCode')} />
                <Input label="نوع تجهیز" {...register('equipmentType')} />
                <Input label="تجهیز" {...register('equipment')} />
                <Input label="کد PGDS تجهیز" className="ltr" {...register('equipmentPgdsCode')} />
                <Input label="نوع انرژی" {...register('energyType')} />
                <Input label="تاریخ (۱۴۰۵/۰۶/۲۱)" className="ltr" {...register('date', { required: true })} />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="secondary" type="button" onClick={() => { reset(); setTab('list'); }}>انصراف</Button>
                <Button type="submit" loading={addMutation.isPending}>ذخیره</Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف رکورد"
        message="آیا از حذف این رکورد مطمئن هستید؟ این عملیات قابل بازگشت نیست."
        onConfirm={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
