import { Router } from "express";
import { TemporalConstraintController } from "../controllers/temporal-constraint.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  TemporalConstraintController.getAll,
);
router.post(
  "/batch",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  TemporalConstraintController.createBatch,
);

export default router;
