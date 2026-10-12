import { Router } from "express";
import { DatasetController } from "../controllers/dataset.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.use(authMiddleware);

// مشاهده و بارگذاری برای هر دو نقش مجاز است
router.get(
  "/",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.getAll,
);
router.get(
  "/load-records",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.getLoadRecords,
);
router.post(
  "/upload",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.upload,
);
router.delete(
  "/:id",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.delete,
);

export default router;
