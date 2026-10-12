import { Router } from "express";
import { TemporalConstraintController } from "../controllers/temporalConstraint.controller";
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
  TemporalConstraintController.createMany,
);

export default router;
