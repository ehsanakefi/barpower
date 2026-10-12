import { Request, Response, NextFunction } from "express";
import { ScheduleService } from "../services/schedule.service";
import { Role } from "@prisma/client";

export class ScheduleController {
  // گرفتن تمام اجراهای زمان‌بندی (فیلتر شده بر اساس شرکت)
  static async getRuns(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId =
        req.user?.role === Role.USER
          ? req.user.companyId
          : (req.query.companyId as string | undefined);

      const runs = await ScheduleService.getAllRuns(companyId);
      return res.status(200).json({ success: true, data: runs });
    } catch (err) {
      next(err);
    }
  }

  // گرفتن آخرین اجرا برای نمایش سریع در داشبورد
  static async getLatestRun(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId =
        req.user?.role === Role.USER
          ? req.user.companyId
          : (req.query.companyId as string | undefined);

      const latestRun = await ScheduleService.getLatestRun(companyId);
      return res.status(200).json({ success: true, data: latestRun });
    } catch (err) {
      next(err);
    }
  }

  // شروع اجرای محاسبه هفتگی
  static async triggerRun(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        weekStartDate,
        loadDatasetId,
        temporalDatasetId,
        relationsDatasetId,
      } = req.body;

      // 🔐 تعیین شرکت مجری زمان‌بندی
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : req.body.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "شناسه شرکت (companyId) الزامی است.",
        });
      }

      const run = await ScheduleService.createAndRunSchedule({
        weekStartDate,
        loadDatasetId,
        temporalDatasetId,
        relationsDatasetId,
        companyId,
      });

      return res.status(201).json({ success: true, data: run });
    } catch (err) {
      next(err);
    }
  }

  // گرفتن رویدادهای خاموشی با اعتبارسنجی مالکیت اجرا
  static async getEventsByRunId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { runId } = req.params;

      // 🔐 برای USER شناسه شرکت ارسال می‌شود تا مالکیت بررسی گردد
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : undefined;

      const events = await ScheduleService.getOutageEvents(runId, companyId);
      return res.status(200).json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  }
}
