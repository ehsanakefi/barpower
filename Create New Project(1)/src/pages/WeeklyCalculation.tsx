import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle, XCircle, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { PageHeader, Button, Card, Select, Alert, Badge, LoadingSpinner } from '@/components/ui';
import * as svc from '@/services/mockService';
import { getWeekDates, getPersianWeekday, isValidJalali } from '@/utils/jalali';
import type { ScheduleRun } from '@/models/types';

const STATUS_CONFIG: Record<string, { label: string; color: 'green' | 'blue' | 'yellow' | 'red' | 'gray'; icon: React.FC<{ size?: number; className?: string }> }> = {
  ready: { label: 'آماده ارسال', color: 'gray', icon: CheckCircle },
  queued: { label: 'در صف انتظار', color: 'yellow', icon: Clock },
  running: { label: 'در حال محاسبه', color: 'blue', icon: Loader2 },
  completed: { label: 'تکمیل شده', color: 'green', icon: CheckCircle },
  failed: { label: 'ناموفق', color: 'red', icon: XCircle },
  infeasible: { label: 'ناممکن - تناقض در محدودیت‌ها', color: 'red', icon: AlertTriangle },
};

export default function WeeklyCalculation() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState('1405/06/21');
  const [loadDatasetId, setLoadDatasetId] = useState('');
  const [temporalDatasetId, setTemporalDatasetId] = useState('');
  const [relationsDatasetId, setRelationsDatasetId] = useState('');
  const [weekDates, setWeekDates] = useState<string[]>([]);

  const { data: datasets = [] } = useQuery({ queryKey: ['datasets'], queryFn: svc.getDatasets });
  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ['scheduleRuns'],
    queryFn: svc.getScheduleRuns,
    refetchInterval: 2000,
  });

  const loadDatasets = datasets.filter(d => d.type === 'load');
  const tcDatasets = datasets.filter(d => d.type === 'temporal-constraints');
  const relDatasets = datasets.filter(d => d.type === 'feeder-relations');

  useEffect(() => {
    if (isValidJalali(weekStart)) {
      setWeekDates(getWeekDates(weekStart));
    }
  }, [weekStart]);

  const submitMutation = useMutation({
    mutationFn: () => svc.submitCalculation({
      loadDatasetId,
      temporalDatasetId,
      relationsDatasetId,
      weekStartDate: weekStart,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scheduleRuns'] }),
  });

  const canSubmit = isValidJalali(weekStart) && loadDatasetId && temporalDatasetId && relationsDatasetId;

  function StatusIcon({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return <Icon size={14} className={status === 'running' ? 'animate-spin' : ''} />;
  }

  return (
    <div>
      <PageHeader title="محاسبه برنامه هفتگی" subtitle="ارسال درخواست محاسبه به سرویس پشتیبان" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">پارامترهای محاسبه</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">تاریخ شروع هفته (جلالی)</label>
                <input
                  value={weekStart}
                  onChange={e => setWeekStart(e.target.value)}
                  placeholder="۱۴۰۵/۰۶/۲۱"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ltr ${isValidJalali(weekStart) ? 'border-slate-300' : 'border-red-400'}`}
                />
                {!isValidJalali(weekStart) && weekStart && (
                  <p className="text-xs text-red-500 mt-1">تاریخ جلالی معتبر نیست</p>
                )}
              </div>

              {weekDates.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-2">روزهای هفته انتخابی:</p>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDates.map(d => (
                      <div key={d} className="text-center">
                        <div className="text-xs text-slate-500">{getPersianWeekday(d)}</div>
                        <div className="text-xs font-medium ltr">{d.split('/').slice(1).join('/')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Select
                label="مجموعه داده بار شبکه"
                value={loadDatasetId}
                onChange={e => setLoadDatasetId(e.target.value)}
              >
                <option value="">انتخاب مجموعه...</option>
                {loadDatasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.recordCount} رکورد)</option>)}
              </Select>

              <Select
                label="مجموعه محدودیت‌های زمانی"
                value={temporalDatasetId}
                onChange={e => setTemporalDatasetId(e.target.value)}
              >
                <option value="">انتخاب مجموعه...</option>
                {tcDatasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.recordCount} رکورد)</option>)}
              </Select>

              <Select
                label="مجموعه روابط فیدرها"
                value={relationsDatasetId}
                onChange={e => setRelationsDatasetId(e.target.value)}
              >
                <option value="">انتخاب مجموعه...</option>
                {relDatasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.recordCount} رکورد)</option>)}
              </Select>
            </div>

            <Alert type="warning">
              این سیستم در حالت آزمایشی است. نتایج محاسبه نمونه بوده و برنامه بهینه واقعی نیستند.
            </Alert>

            <div className="flex gap-3 mt-5">
              <Button
                variant="secondary"
                disabled={!canSubmit}
              >
                بررسی داده‌ها
              </Button>
              <Button
                disabled={!canSubmit}
                loading={submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                <Calculator size={14} />
                محاسبه برنامه هفتگی
              </Button>
            </div>
          </Card>
        </div>

        {/* Run history */}
        <div>
          <Card>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">سابقه محاسبات</h2>
              {runsLoading && <Loader2 size={14} className="animate-spin text-slate-400" />}
            </div>

            {runs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Calculator size={36} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm">هیچ محاسبه‌ای انجام نشده</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {runs.map(run => {
                  const cfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.ready;
                  return (
                    <div key={run.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge color={cfg.color}>{cfg.label}</Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(run.createdAt).toLocaleString('fa-IR')}
                          </span>
                        </div>
                        {run.status === 'completed' && (
                          <button
                            onClick={() => navigate('/tenant/schedule', { state: { runId: run.id } })}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            مشاهده نتایج
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-slate-600">
                        هفته: <span className="ltr font-medium">{run.weekStartDate}</span>
                      </div>
                      {run.status === 'running' && (
                        <div className="mt-2 flex items-center gap-2 text-blue-600 text-xs">
                          <Loader2 size={11} className="animate-spin" />
                          در حال محاسبه...
                        </div>
                      )}
                      {run.errorMessage && (
                        <div className="mt-2 text-xs text-red-600">{run.errorMessage}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
