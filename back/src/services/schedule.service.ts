import { prisma } from "../database/prisma";

export class ScheduleService {
  static async getAllRuns() {
    return prisma.scheduleRun.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        loadDataset: true,
        temporalDataset: true,
        relationsDataset: true,
      },
    });
  }

  static async getLatestRun() {
    return prisma.scheduleRun.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        loadDataset: true,
        temporalDataset: true,
        relationsDataset: true,
      },
    });
  }

  // کلیدی برای رفع خطای undefined در ScheduleViewerPage فرانت‌اند
  static async getOutageEvents(runId: string) {
    return prisma.outageEvent.findMany({
      where: { runId },
      include: { feeder: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  static async createAndRunSchedule(input: {
    weekStartDate: string;
    loadDatasetId?: string;
    temporalDatasetId?: string;
    relationsDatasetId?: string;
  }) {
    // ۱. ایجاد Run جدید با وضعیت READY
    const run = await prisma.scheduleRun.create({
      data: {
        weekStartDate: input.weekStartDate,
        status: "READY",
        loadDatasetId: input.loadDatasetId ?? null,
        temporalDatasetId: input.temporalDatasetId ?? null,
        relationsDatasetId: input.relationsDatasetId ?? null,
      },
    });

    try {
      // تغییر وضعیت به RUNNING
      await prisma.scheduleRun.update({
        where: { id: run.id },
        data: { status: "RUNNING" },
      });

      // TODO: در این بخش الگوریتم بهینه‌سازی خاموشی اجرا خواهد شد
      // و رویدادهای خروجی در جدول OutageEvent ذخیره می‌شوند.

      // تغییر وضعیت به COMPLETED
      return await prisma.scheduleRun.update({
        where: { id: run.id },
        data: { status: "COMPLETED" },
        include: { outageEvents: true },
      });
    } catch (error: any) {
      await prisma.scheduleRun.update({
        where: { id: run.id },
        data: { status: "FAILED", errorMessage: error.message },
      });
      throw error;
    }
  }
}
