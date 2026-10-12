import { Router } from "express";
import { FeederRelationController } from "../controllers/feederRelation.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  FeederRelationController.getAll,
);
router.post(
  "/batch",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  FeederRelationController.createMany,
);

export default router;
