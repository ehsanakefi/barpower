import { Request, Response } from "express";
import { ScheduleService } from "../services/schedule.service";

export class ScheduleController {
  // گرفتن تمام اجراهای زمان‌بندی
  static async getRuns(req: Request, res: Response) {
    try {
      const runs = await ScheduleService.getAllRuns();
      return res.json({ success: true, data: runs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // گرفتن آخرین اجرا برای نمایش سریع در داشبورد
  static async getLatestRun(req: Request, res: Response) {
    try {
      const latestRun = await ScheduleService.getLatestRun();
      return res.json({ success: true, data: latestRun });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // شروع اجرای محاسبه هفتگی
  static async triggerRun(req: Request, res: Response) {
    try {
      const {
        weekStartDate,
        loadDatasetId,
        temporalDatasetId,
        relationsDatasetId,
      } = req.body;
      const run = await ScheduleService.createAndRunSchedule({
        weekStartDate,
        loadDatasetId,
        temporalDatasetId,
        relationsDatasetId,
      });
      return res.status(201).json({ success: true, data: run });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // گرفتن رویدادهای خاموشی (outageEvents) بر اساس runId جهت رفع خطای undefined در ScheduleViewerPage
  static async getEventsByRunId(req: Request, res: Response) {
    try {
      const { runId } = req.params;
      const events = await ScheduleService.getOutageEvents(runId);
      return res.json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
