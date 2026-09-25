import { getDB } from './db';
import type {
  Feeder, LoadRecord, TemporalConstraint, FeederRelation,
  Dataset, ScheduleRun, OutageEvent, EquipmentFeederMapping,
  CalculationStatus, ConstraintCode
} from '@/models/types';
import { getPersianWeekday, getWeekDates } from '@/utils/jalali';
import { v4 as uuid } from './uuid';

// ── Feeders ──────────────────────────────────────────────────────────────────

export async function getFeeders(): Promise<Feeder[]> {
  const db = await getDB();
  return db.getAll('feeders');
}

export async function saveFeeders(feeders: Feeder[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('feeders', 'readwrite');
  for (const f of feeders) await tx.store.put(f);
  await tx.done;
}

export async function addFeeder(data: Omit<Feeder, 'id' | 'createdAt'>): Promise<Feeder> {
  const db = await getDB();
  const feeder: Feeder = { ...data, id: uuid(), createdAt: new Date().toISOString() };
  await db.put('feeders', feeder);
  return feeder;
}

export async function deleteFeeder(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('feeders', id);
}

// ── Datasets ─────────────────────────────────────────────────────────────────

export async function getDatasets(): Promise<Dataset[]> {
  const db = await getDB();
  return db.getAll('datasets');
}

export async function saveDataset(dataset: Dataset): Promise<void> {
  const db = await getDB();
  await db.put('datasets', dataset);
}

export async function deleteDataset(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('datasets', id);
}

// ── Load Records ──────────────────────────────────────────────────────────────

export async function getLoadRecords(datasetId?: string): Promise<LoadRecord[]> {
  const db = await getDB();
  if (datasetId) {
    return db.getAllFromIndex('loadRecords', 'by-dataset', datasetId);
  }
  return db.getAll('loadRecords');
}

export async function saveLoadRecords(records: LoadRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('loadRecords', 'readwrite');
  for (const r of records) await tx.store.put(r);
  await tx.done;
}

export async function deleteLoadRecord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('loadRecords', id);
}

// ── Temporal Constraints ──────────────────────────────────────────────────────

export async function getTemporalConstraints(datasetId?: string): Promise<TemporalConstraint[]> {
  const db = await getDB();
  if (datasetId) {
    return db.getAllFromIndex('temporalConstraints', 'by-dataset', datasetId);
  }
  return db.getAll('temporalConstraints');
}

export async function saveTemporalConstraints(records: TemporalConstraint[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('temporalConstraints', 'readwrite');
  for (const r of records) await tx.store.put(r);
  await tx.done;
}

export async function deleteTemporalConstraint(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('temporalConstraints', id);
}

// ── Feeder Relations ──────────────────────────────────────────────────────────

export async function getFeederRelations(datasetId?: string): Promise<FeederRelation[]> {
  const db = await getDB();
  if (datasetId) {
    return db.getAllFromIndex('feederRelations', 'by-dataset', datasetId);
  }
  return db.getAll('feederRelations');
}

export async function saveFeederRelations(records: FeederRelation[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('feederRelations', 'readwrite');
  for (const r of records) await tx.store.put(r);
  await tx.done;
}

export async function deleteFeederRelation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('feederRelations', id);
}

// ── Schedule Runs ─────────────────────────────────────────────────────────────

export async function getScheduleRuns(): Promise<ScheduleRun[]> {
  const db = await getDB();
  const all = await db.getAll('scheduleRuns');
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getScheduleRun(id: string): Promise<ScheduleRun | undefined> {
  const db = await getDB();
  return db.get('scheduleRuns', id);
}

export async function submitCalculation(params: {
  loadDatasetId: string;
  temporalDatasetId: string;
  relationsDatasetId: string;
  weekStartDate: string;
}): Promise<ScheduleRun> {
  const db = await getDB();
  const run: ScheduleRun = {
    id: uuid(),
    ...params,
    weekDates: getWeekDates(params.weekStartDate),
    status: 'queued',
    createdAt: new Date().toISOString(),
  };
  await db.put('scheduleRuns', run);

  // Simulate async calculation
  setTimeout(async () => {
    const db2 = await getDB();
    const r = await db2.get('scheduleRuns', run.id);
    if (!r) return;
    r.status = 'running';
    await db2.put('scheduleRuns', r);

    setTimeout(async () => {
      const db3 = await getDB();
      const r2 = await db3.get('scheduleRuns', run.id);
      if (!r2) return;
      r2.status = 'completed';
      r2.completedAt = new Date().toISOString();
      await db3.put('scheduleRuns', r2);

      // Generate mock outage events
      const events = generateMockOutageEvents(run.id, run.weekDates);
      const tx = db3.transaction('outageEvents', 'readwrite');
      for (const e of events) await tx.store.put(e);
      await tx.done;
    }, 3000);
  }, 1500);

  return run;
}

function generateMockOutageEvents(runId: string, dates: string[]): OutageEvent[] {
  const feeders = [
    { id: 'f1', name: 'ابوذر', code: 'AB001', substationName: 'پست شمال' },
    { id: 'f2', name: 'آجین', code: 'AJ002', substationName: 'پست غرب' },
    { id: 'f3', name: 'شریعتی', code: 'SH003', substationName: 'پست مرکز' },
  ];
  const slots = [
    { start: '10:00', end: '12:00' },
    { start: '14:00', end: '16:00' },
    { start: '18:00', end: '20:00' },
  ];
  const events: OutageEvent[] = [];
  for (let i = 0; i < feeders.length; i++) {
    const feeder = feeders[i];
    const date = dates[i % dates.length];
    const slot = slots[i % slots.length];
    events.push({
      id: uuid(),
      feederId: feeder.id,
      feederName: feeder.name,
      feederCode: feeder.code,
      substationName: feeder.substationName,
      date,
      weekday: getPersianWeekday(date),
      startTime: slot.start,
      endTime: slot.end,
      runId,
    });
  }
  return events;
}

// ── Outage Events ─────────────────────────────────────────────────────────────

export async function getOutageEvents(runId?: string): Promise<OutageEvent[]> {
  const db = await getDB();
  if (runId) {
    return db.getAllFromIndex('outageEvents', 'by-run', runId);
  }
  return db.getAll('outageEvents');
}

// ── Equipment Mappings ────────────────────────────────────────────────────────

export async function getEquipmentMappings(): Promise<EquipmentFeederMapping[]> {
  const db = await getDB();
  return db.getAll('equipmentMappings');
}

export async function saveEquipmentMapping(mapping: EquipmentFeederMapping): Promise<void> {
  const db = await getDB();
  await db.put('equipmentMappings', mapping);
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

export async function seedDemoData(): Promise<void> {
  const db = await getDB();
  const existing = await db.getAll('feeders');
  if (existing.length > 0) return;

  const feeders: Feeder[] = [
    { id: 'f1', code: 'AB001', name: 'ابوذر', substationName: 'پست شمال', createdAt: new Date().toISOString() },
    { id: 'f2', code: 'AJ002', name: 'آجین', substationName: 'پست غرب', createdAt: new Date().toISOString() },
    { id: 'f3', code: 'SH003', name: 'شریعتی', substationName: 'پست مرکز', createdAt: new Date().toISOString() },
    { id: 'f4', code: 'VL004', name: 'ولیعصر', substationName: 'پست جنوب', createdAt: new Date().toISOString() },
    { id: 'f5', code: 'AZ005', name: 'آزادی', substationName: 'پست شرق', createdAt: new Date().toISOString() },
  ];

  const tx = db.transaction('feeders', 'readwrite');
  for (const f of feeders) await tx.store.put(f);
  await tx.done;

  // Sample dataset
  const dsId = uuid();
  const dataset: Dataset = {
    id: dsId,
    name: 'داده نمونه ۱۴۰۵/۰۶/۲۱',
    type: 'temporal-constraints',
    uploadedAt: new Date().toISOString(),
    fileName: 'sample.xlsx',
    recordCount: 35,
    version: 1,
  };
  await db.put('datasets', dataset);

  const week = ['1405/06/21', '1405/06/22', '1405/06/23', '1405/06/24', '1405/06/25', '1405/06/26', '1405/06/27'];
  const slots: { start: string; end: string }[] = [
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
    { start: '18:00', end: '20:00' },
    { start: '20:00', end: '22:00' },
    { start: '22:00', end: '24:00' },
  ];

  const constraints: TemporalConstraint[] = [];
  const codes: ConstraintCode[] = [0, 1, 2, 3, 4, 5, 6];

  for (const feeder of feeders.slice(0, 3)) {
    for (const date of week) {
      for (let si = 0; si < slots.length; si++) {
        const code = codes[(feeders.indexOf(feeder) + si) % 7];
        constraints.push({
          id: uuid(),
          feederId: feeder.id,
          feederCode: feeder.code,
          feederName: feeder.name,
          substationName: feeder.substationName,
          date,
          startTime: slots[si].start,
          endTime: slots[si].end,
          constraintCode: code,
          datasetId: dsId,
        });
      }
    }
  }

  const ctx = db.transaction('temporalConstraints', 'readwrite');
  for (const c of constraints) await ctx.store.put(c);
  await ctx.done;

  // Sample feeder relations
  const relDsId = uuid();
  await db.put('datasets', {
    id: relDsId, name: 'روابط فیدرها - نمونه', type: 'feeder-relations',
    uploadedAt: new Date().toISOString(), fileName: 'relations.xlsx', recordCount: 2, version: 1,
  });

  const relations: FeederRelation[] = [
    { id: uuid(), baseFeederId: 'f1', relatedFeederId: 'f2', relationType: 'simultaneous', datasetId: relDsId },
    { id: uuid(), baseFeederId: 'f3', relatedFeederId: 'f4', relationType: 'non-simultaneous', datasetId: relDsId },
  ];
  const rtx = db.transaction('feederRelations', 'readwrite');
  for (const r of relations) await rtx.store.put(r);
  await rtx.done;
}
