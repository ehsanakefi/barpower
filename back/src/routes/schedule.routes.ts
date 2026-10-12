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
router.post(
  "/run",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  ScheduleController.triggerRun,
);
router.get(
  "/runs/:id/events",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  ScheduleController.getRunEvents,
);

export default router;
