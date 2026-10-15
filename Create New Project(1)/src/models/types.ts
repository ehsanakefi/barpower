export interface Feeder {
  id: string;
  code: string;
  name: string;
  substationName: string;
  createdAt: string;
}

export interface LoadRecord {
  id: string;
  operatorName: string;
  stationType: string;
  stationPgdsCode: string;
  equipmentType: string;
  equipment: string;
  equipmentPgdsCode: string;
  energyType: string;
  date: string; // Jalali YYYY/MM/DD
  h1: number | null;
  h2: number | null;
  h3: number | null;
  h4: number | null;
  h5: number | null;
  h6: number | null;
  h7: number | null;
  h8: number | null;
  h9: number | null;
  h10: number | null;
  h11: number | null;
  h12: number | null;
  h13: number | null;
  h14: number | null;
  h15: number | null;
  h16: number | null;
  h17: number | null;
  h18: number | null;
  h19: number | null;
  h20: number | null;
  h21: number | null;
  h22: number | null;
  h23: number | null;
  h24: number | null;
  total: number | null;
  importedTotal: number | null;
  datasetId: string;
}

export type ConstraintCode = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TemporalConstraint {
  id: string;
  feederId: string;
  feederCode: string;
  feederName: string;
  substationName: string;
  date: string; // Jalali YYYY/MM/DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM or 24:00
  constraintCode: ConstraintCode;
  datasetId: string;
}

export interface FeederRelation {
  id: string;
  baseFeederId: string;
  relatedFeederId: string;
  relationType: 'simultaneous' | 'non-simultaneous';
  datasetId: string;
}

export interface EquipmentFeederMapping {
  id: string;
  equipmentName: string;
  equipmentPgdsCode: string;
  feederId: string | null;
  confidence: 'confirmed' | 'suggested' | 'unknown';
}

export type DatasetType = 'load' | 'temporal-constraints' | 'feeder-relations';

export interface Dataset {
  id: string;
  name: string;
  type: DatasetType;
  uploadedAt: string;
  fileName: string;
  recordCount: number;
  version: number;
}

export interface ImportReport {
  datasetId: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  column: string;
  message: string;
}

export interface ImportWarning {
  row: number;
  column: string;
  message: string;
}

export type CalculationStatus = 'ready' | 'queued' | 'running' | 'completed' | 'failed' | 'infeasible';

export interface ScheduleRun {
  id: string;
  loadDatasetId: string;
  temporalDatasetId: string;
  relationsDatasetId: string;
  weekStartDate: string;
  weekDates: string[];
  status: CalculationStatus;
  progress?: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  infeasibilityDetails?: InfeasibilityDetail[];
}

export interface InfeasibilityDetail {
  feederId: string;
  feederName: string;
  date: string;
  interval: string;
  constraint: string;
  message: string;
}

export interface OutageEvent {
  id: string;
  feederId: string;
  feederName: string;
  feederCode: string;
  substationName: string;
  date: string; // Jalali
  weekday: string; // Persian weekday
  startTime: string;
  endTime: string;
  runId: string;
}
