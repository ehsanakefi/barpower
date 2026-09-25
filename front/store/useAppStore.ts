import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "@/services/uuid";
import type { TemporalConstraint, ConstraintCode } from "@/models/types";
import { getWeekDates, getPersianWeekday } from "@/utils/jalali";
import {
  Dataset,
  Feeder,
  FeederRelation,
  LoadRecord,
  OutageEvent,
  ScheduleRun,
} from "@/app/models/types";

export type RunStatus =
  | "ready"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "infeasible";

export interface SubmitCalculationParams {
  loadDatasetId: string;
  temporalDatasetId: string;
  relationsDatasetId: string;
  weekStartDate: string;
}

// ========================
// 2. ساختار وضعیت استور
// ========================

interface AppState {
  feeders: Feeder[];
  datasets: Dataset[];
  loadRecords: LoadRecord[];
  temporalConstraints: TemporalConstraint[];
  feederRelations: FeederRelation[];
  scheduleRuns: ScheduleRun[];
  outageEvents: OutageEvent[];

  setFeeders: (feeders: Feeder[]) => void;
  addDataset: (dataset: Dataset) => void;
  deleteDataset: (id: string) => void;

  addLoadRecords: (records: LoadRecord[]) => void;
  deleteLoadRecord: (id: string) => void;

  addTemporalConstraints: (constraints: TemporalConstraint[]) => void;
  clearTemporalConstraintsByDataset: (datasetId: string) => void;

  setFeederRelations: (relations: FeederRelation[]) => void;
  addFeederRelations: (relations: FeederRelation[]) => void;
  deleteFeederRelation: (id: string) => void;

  addOutageEvents: (events: OutageEvent[]) => void;

  submitCalculation: (params: SubmitCalculationParams) => Promise<void>;
  updateRunStatus: (
    id: string,
    status: RunStatus,
    errorMessage?: string,
  ) => void;
}

// ========================
// 3. پیاده‌سازی Store
// ========================

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      feeders: [
        {
          id: "1",
          name: "فیدر شهری ۱",
          code: "F-101",
          substationName: "پست بعثت",
          createdAt: "1405/05/03",
        },
        {
          id: "2",
          name: "فیدر صنعتی ۲",
          code: "F-102",
          substationName: "پست شهید رجایی",
          createdAt: "1405/05/03",
        },
        {
          id: "3",
          name: "فیدر کشاورزی ۳",
          code: "F-103",
          substationName: "پست مرکزی",
          createdAt: "1405/05/03",
        },
      ],
      datasets: [],
      loadRecords: [],
      temporalConstraints: [],
      feederRelations: [],
      scheduleRuns: [],
      outageEvents: [],
      setFeeders: (feeders) => set({ feeders }),

      addDataset: (dataset) =>
        set((state) => ({ datasets: [dataset, ...(state.datasets ?? [])] })),

      deleteDataset: (id) =>
        set((state) => ({
          datasets: (state.datasets ?? []).filter((d) => d.id !== id),
          loadRecords: (state.loadRecords ?? []).filter(
            (r) => r.datasetId !== id,
          ),
          temporalConstraints: (state.temporalConstraints ?? []).filter(
            (c) => c.datasetId !== id,
          ),
          feederRelations: (state.feederRelations ?? []).filter(
            (r) => r.datasetId !== id,
          ),
        })),

      addLoadRecords: (records) =>
        set((state) => ({
          loadRecords: [...records, ...(state.loadRecords ?? [])],
        })),

      deleteLoadRecord: (id) =>
        set((state) => ({
          loadRecords: (state.loadRecords ?? []).filter((r) => r.id !== id),
        })),

      addTemporalConstraints: (constraints) =>
        set((state) => ({
          temporalConstraints: [
            ...constraints,
            ...(state.temporalConstraints ?? []),
          ],
        })),

      clearTemporalConstraintsByDataset: (datasetId) =>
        set((state) => ({
          temporalConstraints: (state.temporalConstraints ?? []).filter(
            (c) => c.datasetId !== datasetId,
          ),
        })),

      setFeederRelations: (relations) => set({ feederRelations: relations }),

      addFeederRelations: (newRelations) =>
        set((state) => ({
          feederRelations: [...newRelations, ...(state.feederRelations ?? [])],
        })),

      deleteFeederRelation: (id) =>
        set((state) => ({
          feederRelations: (state.feederRelations ?? []).filter(
            (rel) => rel.id !== id,
          ),
        })),

      addOutageEvents: (events) =>
        set((state) => ({
          outageEvents: [...events, ...(state.outageEvents ?? [])],
        })),

      submitCalculation: async (params) => {
        const runId = uuid();
        const newRun: ScheduleRun = {
          id: runId,
          status: "running",
          weekStartDate: params.weekStartDate,
          createdAt: new Date().toISOString(),
          loadDatasetId: params.loadDatasetId,
          temporalDatasetId: params.temporalDatasetId,
          relationsDatasetId: params.relationsDatasetId,
          weekDates: [params.weekStartDate],
        };

        set((state) => ({
          scheduleRuns: [newRun, ...(state.scheduleRuns ?? [])],
        }));

        // شبیه‌سازی تولید برنامه خاموشی هفتگی
        setTimeout(() => {
          const dates = getWeekDates(params.weekStartDate);
          const currentFeeders =
            get().feeders.length > 0
              ? get().feeders
              : [
                  {
                    id: "1",
                    name: "فیدر ۱",
                    code: "F-101",
                    substationName: "پست اصلی",
                  },
                  {
                    id: "2",
                    name: "فیدر ۲",
                    code: "F-102",
                    substationName: "پست شهید رجایی",
                  },
                ];

          const generatedEvents: OutageEvent[] = [];
          dates.forEach((date) => {
            const weekday = getPersianWeekday(date);
            currentFeeders.forEach((feeder, fIdx) => {
              generatedEvents.push({
                id: uuid(),
                runId: runId,
                feederId: feeder.id,
                feederName: feeder.name,
                feederCode: feeder.code || `F-${fIdx + 100}`,
                substationName: feeder.substationName || "پست فوق توزیع",
                date: date,
                weekday: weekday,
                startTime: fIdx % 2 === 0 ? "12:00" : "14:00",
                endTime: fIdx % 2 === 0 ? "14:00" : "16:00",
              });
            });
          });

          get().addOutageEvents(generatedEvents);
          get().updateRunStatus(runId, "completed");
        }, 1500);
      },

      updateRunStatus: (id, status, errorMessage) =>
        set((state) => ({
          scheduleRuns: (state.scheduleRuns ?? []).map((r) =>
            r.id === id ? { ...r, status, errorMessage } : r,
          ),
        })),
    }),
    {
      name: "power-app-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
