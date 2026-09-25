import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type {
  Feeder, LoadRecord, TemporalConstraint, FeederRelation,
  Dataset, ScheduleRun, OutageEvent, EquipmentFeederMapping
} from '@/models/types';

interface AppDB extends DBSchema {
  feeders: { key: string; value: Feeder };
  loadRecords: { key: string; value: LoadRecord; indexes: { 'by-dataset': string; 'by-date': string } };
  temporalConstraints: { key: string; value: TemporalConstraint; indexes: { 'by-dataset': string; 'by-feeder': string } };
  feederRelations: { key: string; value: FeederRelation; indexes: { 'by-dataset': string; 'by-feeder': string } };
  datasets: { key: string; value: Dataset };
  scheduleRuns: { key: string; value: ScheduleRun };
  outageEvents: { key: string; value: OutageEvent; indexes: { 'by-run': string; 'by-feeder': string } };
  equipmentMappings: { key: string; value: EquipmentFeederMapping };
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>('electricity-mgmt', 1, {
      upgrade(db) {
        db.createObjectStore('feeders', { keyPath: 'id' });
        const loadStore = db.createObjectStore('loadRecords', { keyPath: 'id' });
        loadStore.createIndex('by-dataset', 'datasetId');
        loadStore.createIndex('by-date', 'date');
        const tcStore = db.createObjectStore('temporalConstraints', { keyPath: 'id' });
        tcStore.createIndex('by-dataset', 'datasetId');
        tcStore.createIndex('by-feeder', 'feederId');
        const frStore = db.createObjectStore('feederRelations', { keyPath: 'id' });
        frStore.createIndex('by-dataset', 'datasetId');
        frStore.createIndex('by-feeder', 'baseFeederId');
        db.createObjectStore('datasets', { keyPath: 'id' });
        db.createObjectStore('scheduleRuns', { keyPath: 'id' });
        const oeStore = db.createObjectStore('outageEvents', { keyPath: 'id' });
        oeStore.createIndex('by-run', 'runId');
        oeStore.createIndex('by-feeder', 'feederId');
        db.createObjectStore('equipmentMappings', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}
