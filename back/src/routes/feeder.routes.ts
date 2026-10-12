import { Router } from "express";
import { FeederController } from "../controllers/feeder.controller";
import { validate } from "../middleware/validation.middleware";
import { createFeederSchema } from "../validation/feeder.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

// همه عملیات فیدرها نیازمند لاگین هستند
router.use(authMiddleware);

// هم سوپرادمین و هم کاربر اداره برق می‌توانند ببینند و بسازند
// (کاربر در محدوده شرکت خودش، سوپرادمین در کل سیستم)
router.get(
  "/",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  FeederController.getAll,
);
router.get(
  "/:id",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  FeederController.getById,
);

router.post(
  "/",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  validate(createFeederSchema),
  FeederController.create,
);

router.delete(
  "/:id",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  FeederController.delete,
);

export default router;
