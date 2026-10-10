import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import { validate } from "../middleware/validate.middleware";
import { triggerScheduleSchema } from "../validation/schedule.schema";

const router = Router();

// لیست تمام اجراها
router.get("/runs", ScheduleController.getRuns);

// آخرین اجرا برای داشبورد
router.get("/latest", ScheduleController.getLatestRun);

// اجرای محاسبه با اعتبارسنجی پارامترهای شروع
router.post(
  "/run",
  validate(triggerScheduleSchema),
  ScheduleController.triggerRun,
);

// واکشی رویدادهای خاموشی یک اجرا (Outage Events) برای صفحه تقویم
router.get("/runs/:runId/events", ScheduleController.getEventsByRunId);

export default router;
