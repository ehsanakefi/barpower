import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.use(authMiddleware);

router.get(
  "/runs",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  ScheduleController.getRuns,
);

// دریافت مشخصات یک اجرا با ID
router.get(
  "/runs/:id",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  ScheduleController.getRunById,
);

router.post(
  "/run",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  ScheduleController.triggerRun,
);

// هم /events و هم /outages ساپورت شود
router.get(
  ["/runs/:id/events", "/runs/:id/outages"],
  requireRole(Role.SUPER_ADMIN, Role.USER),
  ScheduleController.getEventsByRunId,
);

export default router;
