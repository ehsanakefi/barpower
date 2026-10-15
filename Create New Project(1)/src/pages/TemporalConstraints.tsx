import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, HelpCircle, X, Check } from 'lucide-react';
import { PageHeader, Button, Card, EmptyState, LoadingSpinner, Alert, Badge } from '@/components/ui';
import * as svc from '@/services/mockService';
import { v4 as uuid } from '@/services/uuid';
import type { TemporalConstraint, Dataset, ConstraintCode } from '@/models/types';

const CONSTRAINT_CODES: {
  code: ConstraintCode;
  label: string;
  meaning: string;
  color: string;
  bg: string;
  help: string;
}[] = [
  { code: 0, label: 'آزاد', meaning: 'فیدر می‌تواند وصل یا قطع باشد', color: 'text-slate-600', bg: 'bg-slate-100', help: 'فیدرهای انعطاف‌پذیر با حضور منظم و بدون الگوی ساعت محدودکننده' },
  { code: 1, label: 'حتماً وصل', meaning: 'خاموشی در این بازه ممنوع است', color: 'text-blue-700', bg: 'bg-blue-100', help: 'فیدر بدون خاموشی؛ یا ساعات خارج از پنجره مجاز فیدرهای خاص' },
  { code: 2, label: 'ساعت ثابت مشروط', meaning: 'در صورت خاموشی فقط در این بازه مجاز', color: 'text-violet-700', bg: 'bg-violet-100', help: 'حداقل ۲ مشاهده و همه خاموشی‌ها فقط در یک بازه ثابت' },
  { code: 3, label: 'حتماً قطع', meaning: 'فیدر باید در این بازه خاموش باشد', color: 'text-red-700', bg: 'bg-red-100', help: 'از USSD خودکار تولید نشده؛ داده تاریخی به‌تنهایی اجبار را ثابت نمی‌کند' },
  { code: 4, label: 'رزرو/کم‌تکرار', meaning: 'مجاز اما ترجیحاً کم‌استفاده', color: 'text-orange-700', bg: 'bg-orange-100', help: 'فیدرهایی که فقط ۱ تا ۳ روز در هفته دیده شده‌اند و ساعت ثابت قطعی ندارند' },
  { code: 5, label: 'بلوک پیوسته', meaning: 'بازه‌های پیوسته باید با هم قطع یا وصل باشند', color: 'text-amber-700', bg: 'bg-amber-100', help: 'خاموشی‌های چندبازه‌ای پشت‌سرهم مثل ۱۰ تا ۱۶' },
  { code: 6, label: 'چند ساعت مجاز مشروط', meaning: 'در صورت خاموشی فقط یکی از بازه‌های ۶ انتخاب می‌شود', color: 'text-emerald-700', bg: 'bg-emerald-100', help: 'حداقل ۴ روز خاموشی و تنوع بازه‌ها' },
];

const TIME_SLOTS = ['10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00', '18:00–20:00', '20:00–22:00', '22:00–24:00'];

export default function TemporalConstraints() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<'week' | 'day'>('week');
  const [showHelp, setShowHelp] = useState(false);
  const [selectedDate, setSelectedDate] = useState('1405/06/21');
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [importAlert, setImportAlert] = useState<string | null>(null);

  const { data: constraints = [], isLoading } = useQuery({
    queryKey: ['temporalConstraints'],
    queryFn: () => svc.getTemporalConstraints(),
  });
  const { data: feeders = [] } = useQuery({ queryKey: ['feeders'], queryFn: svc.getFeeders });
  const { data: datasets = [] } = useQuery({ queryKey: ['datasets'], queryFn: svc.getDatasets });
  const tcDatasets = datasets.filter(d => d.type === 'temporal-constraints');

  const saveMutation = useMutation({
    mutationFn: async (cs: TemporalConstraint[]) => {
      await svc.saveTemporalConstraints(cs);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['temporalConstraints'] }),
  });

  const displayConstraints = selectedDataset === 'all'
    ? constraints
    : constraints.filter(c => c.datasetId === selectedDataset);

  // Build week dates from constraints
  const allDates = [...new Set(displayConstraints.map(c => c.date))].sort();
  const weekDates = allDates.slice(0, 7);

  function getCode(feederId: string, date: string, slot: string): ConstraintCode | null {
    const [start, end] = slot.split('–');
    const c = displayConstraints.find(c => c.feederId === feederId && c.date === date && c.startTime === start && c.endTime === end);
    return c?.constraintCode ?? null;
  }

  function codeInfo(code: ConstraintCode | null) {
    if (code === null) return { label: '—', bg: 'bg-white', color: 'text-slate-300' };
    return CONSTRAINT_CODES[code];
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: null, header: 1 }) as unknown[][];

        // Parse multi-level headers
        const headerRow0 = rows[0] as (string | null)[];
        const headerRow1 = rows[1] as (string | null)[];
        const slotCols: { col: number; date: string; start: string; end: string }[] = [];

        let currentDate = '';
        for (let i = 4; i < headerRow0.length; i++) {
          if (headerRow0[i]) currentDate = String(headerRow0[i]);
          const slot = String(headerRow1[i] ?? '').replace('_', ':');
          const [startH, endH] = slot.split(':');
          if (startH && endH) {
            slotCols.push({
              col: i,
              date: currentDate,
              start: `${startH}:00`,
              end: `${endH}:00`,
            });
          }
        }

        const dsId = uuid();
        const newConstraints: TemporalConstraint[] = [];
        const feedersMap = new Map(feeders.map(f => [f.code, f]));

        for (let ri = 2; ri < rows.length; ri++) {
          const row = rows[ri] as unknown[];
          if (!row[2]) continue;
          const feederCode = String(row[3] ?? '');
          const feederName = String(row[2] ?? '');
          const substationName = String(row[1] ?? '');
          const feeder = feedersMap.get(feederCode);

          for (const slot of slotCols) {
            const raw = row[slot.col];
            if (raw === null || raw === undefined || raw === '') continue;
            const code = Number(raw);
            if (code < 0 || code > 6 || !Number.isInteger(code)) continue;

            newConstraints.push({
              id: uuid(),
              feederId: feeder?.id ?? `unknown-${feederCode}`,
              feederCode,
              feederName,
              substationName,
              date: slot.date,
              startTime: slot.start,
              endTime: slot.end,
              constraintCode: code as ConstraintCode,
              datasetId: dsId,
            });
          }
        }

        const dataset: Dataset = {
          id: dsId, name: `محدودیت زمانی ${new Date().toLocaleDateString('fa-IR')}`,
          type: 'temporal-constraints', uploadedAt: new Date().toISOString(),
          fileName: file.name, recordCount: newConstraints.length, version: 1,
        };
        await svc.saveDataset(dataset);
        await saveMutation.mutateAsync(newConstraints);
        setImportAlert(`${newConstraints.length} محدودیت با موفقیت بارگذاری شد`);
        qc.invalidateQueries({ queryKey: ['datasets'] });
      } catch (err) {
        setImportAlert('خطا در تجزیه فایل. لطفاً فرمت را بررسی کنید.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  const uniqueFeeders = [...new Map(displayConstraints.map(c => [c.feederId, c])).values()];

  return (
    <div>
      <PageHeader
        title="محدودیت‌های زمانی خاموشی"
        subtitle={`${displayConstraints.length} محدودیت ثبت شده`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHelp(!showHelp)} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
              <HelpCircle size={16} />
            </button>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> بارگذاری Excel
            </Button>
            <input ref={fileRef} type="file" accept=".xlsx" onChange={handleFileImport} className="hidden" />
          </div>
        }
      />

      {importAlert && (
        <div className="mx-6 mt-4">
          <Alert type={importAlert.includes('خطا') ? 'error' : 'success'}>
            {importAlert}
            <button onClick={() => setImportAlert(null)} className="mr-2"><X size={12} /></button>
          </Alert>
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedDataset}
            onChange={e => setSelectedDataset(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">همه مجموعه‌ها</option>
            {tcDatasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(['week', 'day'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm ${view === v ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {v === 'week' ? 'نمای هفتگی' : 'نمای روزانه'}
              </button>
            ))}
          </div>

          {view === 'day' && (
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ltr"
            >
              {allDates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>

        {/* Help panel */}
        {showHelp && (
          <Card className="p-4">
            <h3 className="text-sm font-bold mb-3">راهنمای کدهای محدودیت</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CONSTRAINT_CODES.map(c => (
                <div key={c.code} className="flex items-start gap-3 p-2 rounded-lg bg-slate-50">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold shrink-0 ${c.bg} ${c.color}`}>
                    {c.code}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{c.label}</div>
                    <div className="text-xs text-slate-500">{c.help}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Legend bar */}
        <div className="flex flex-wrap gap-2">
          {CONSTRAINT_CODES.map(c => (
            <span key={c.code} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.color}`}>
              <span className="font-bold">{c.code}</span> {c.label}
            </span>
          ))}
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <>
            {/* Week view */}
            {view === 'week' && (
              <Card>
                {uniqueFeeders.length === 0 ? (
                  <EmptyState message="هیچ داده‌ای موجود نیست. لطفاً یک فایل Excel بارگذاری کنید." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="sticky right-0 bg-slate-50 border border-slate-200 px-3 py-2 text-right font-medium min-w-[160px]">
                            فیدر
                          </th>
                          {weekDates.map(date => (
                            <th key={date} colSpan={TIME_SLOTS.length} className="border border-slate-200 px-2 py-2 text-center font-medium ltr">
                              {date}
                            </th>
                          ))}
                        </tr>
                        <tr className="bg-slate-50">
                          <th className="sticky right-0 bg-slate-50 border border-slate-200 px-3 py-2"></th>
                          {weekDates.flatMap(date =>
                            TIME_SLOTS.map(slot => (
                              <th key={`${date}-${slot}`} className="border border-slate-200 px-1 py-1 text-center font-normal text-slate-500 ltr whitespace-nowrap">
                                {slot.split('–')[0]}
                              </th>
                            ))
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {uniqueFeeders.map(f => (
                          <tr key={f.feederId} className="hover:bg-slate-50/50">
                            <td className="sticky right-0 bg-white border border-slate-200 px-3 py-2 font-medium whitespace-nowrap">
                              <div>{f.feederName}</div>
                              <div className="text-slate-400 ltr font-normal">{f.feederCode}</div>
                            </td>
                            {weekDates.flatMap(date =>
                              TIME_SLOTS.map(slot => {
                                const code = getCode(f.feederId, date, slot);
                                const info = codeInfo(code);
                                return (
                                  <td
                                    key={`${date}-${slot}`}
                                    className={`border border-slate-200 px-2 py-2 text-center ${info.bg} ${info.color} font-bold`}
                                    title={code !== null ? `${info.label}: ${CONSTRAINT_CODES[code]?.meaning}` : ''}
                                  >
                                    {code ?? ''}
                                  </td>
                                );
                              })
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            {/* Day view */}
            {view === 'day' && (
              <Card>
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold">محدودیت‌های تاریخ <span className="ltr">{selectedDate}</span></h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-right px-4 py-3 font-medium">فیدر</th>
                        <th className="text-right px-4 py-3 font-medium">کد فیدر</th>
                        {TIME_SLOTS.map(s => (
                          <th key={s} className="text-center px-2 py-3 font-medium ltr text-xs">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {uniqueFeeders.length === 0 ? (
                        <tr><td colSpan={9}><EmptyState message="هیچ داده‌ای موجود نیست" /></td></tr>
                      ) : uniqueFeeders.map(f => (
                        <tr key={f.feederId} className="hover:bg-slate-50">
                          <td className="px-4 py-3">{f.feederName}</td>
                          <td className="px-4 py-3 ltr">{f.feederCode}</td>
                          {TIME_SLOTS.map(slot => {
                            const code = getCode(f.feederId, selectedDate, slot);
                            const info = codeInfo(code);
                            return (
                              <td key={slot} className={`text-center px-2 py-3 ${info.bg}`}>
                                <span className={`font-bold text-sm ${info.color}`}>{code ?? '—'}</span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
