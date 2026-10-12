import { prisma } from "../database/prisma";
import { RunStatus } from "@prisma/client";

export class ScheduleService {
  /**
   * دریافت تمام اجراهای زمان‌بندی شرکت
   */
  static async getAllRuns(companyId?: string) {
    return prisma.scheduleRun.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        loadDataset: true,
        temporalDataset: true,
        relationsDataset: true,
      },
    });
  }

  /**
   * دریافت آخرین اجرای زمان‌بندی شرکت
   */
  static async getLatestRun(companyId?: string) {
    return prisma.scheduleRun.findFirst({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        loadDataset: true,
        temporalDataset: true,
        relationsDataset: true,
      },
    });
  }

  /**
   * دریافت یک اجرای مشخص با شناسه و اعتبارسنجی شرکت (جلوگیری از IDOR)
   */
  static async getRunById(id: string, companyId?: string) {
    const run = await prisma.scheduleRun.findUnique({
      where: { id },
      include: {
        loadDataset: true,
        temporalDataset: true,
        relationsDataset: true,
      },
    });

    if (!run) {
      throw Object.assign(new Error("اجرای زمان‌بندی یافت نشد."), {
        status: 404,
      });
    }

    if (companyId && run.companyId !== companyId) {
      throw Object.assign(new Error("شما به این داده دسترسی ندارید."), {
        status: 403,
      });
    }

    return run;
  }

  /**
   * دریافت رویدادهای خاموشی یک اجرا با بررسی امنیت شرکت
   */
  static async getOutageEvents(runId: string, companyId?: string) {
    if (companyId) {
      const run = await prisma.scheduleRun.findUnique({
        where: { id: runId },
        select: { companyId: true },
      });

      if (!run) {
        throw Object.assign(new Error("اجرای زمان‌بندی یافت نشد."), {
          status: 404,
        });
      }

      if (run.companyId !== companyId) {
        throw Object.assign(new Error("شما به این داده دسترسی ندارید."), {
          status: 403,
        });
      }
    }

    return prisma.outageEvent.findMany({
      where: { runId },
      include: { feeder: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  /**
   * ایجاد و اجرای الگوریتم زمان‌بندی با انتساب اجباری به companyId
   */
  static async createAndRunSchedule(input: {
    weekStartDate: string;
    loadDatasetId?: string;
    temporalDatasetId?: string;
    relationsDatasetId?: string;
    companyId: string;
  }) {
    if (!input.companyId) {
      throw Object.assign(
        new Error("شناسه شرکت (companyId) برای ثبت زمان‌بندی الزامی است."),
        {
          status: 400,
        },
      );
    }

    // ۱. ایجاد Run جدید با وضعیت READY و ذخیره companyId
    const run = await prisma.scheduleRun.create({
      data: {
        weekStartDate: input.weekStartDate,
        status: RunStatus.READY,
        loadDatasetId: input.loadDatasetId ?? null,
        temporalDatasetId: input.temporalDatasetId ?? null,
        relationsDatasetId: input.relationsDatasetId ?? null,
        companyId: input.companyId,
      },
    });

    try {
      // تغییر وضعیت به RUNNING
      await prisma.scheduleRun.update({
        where: { id: run.id },
        data: { status: RunStatus.RUNNING },
      });

      // TODO: اجرای الگوریتم بهینه‌سازی و تولید رکوردهای OutageEvent

      // تغییر وضعیت نهایی به COMPLETED
      return await prisma.scheduleRun.update({
        where: { id: run.id },
        data: { status: RunStatus.COMPLETED },
        include: { outageEvents: true },
      });
    } catch (error: any) {
      await prisma.scheduleRun.update({
        where: { id: run.id },
        data: { status: RunStatus.FAILED, errorMessage: error.message },
      });
      throw error;
    }
  }
}
