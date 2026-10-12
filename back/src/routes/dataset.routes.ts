import { Router } from "express";
import { DatasetController } from "../controllers/dataset.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.getAll,
);

router.get(
  "/load-records",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.getRecords,
);

// اضافه شدن روت ثبت دسته‌ای رکوردهای بار
router.post(
  "/load-records/batch",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.batchCreateLoadRecords ||
    DatasetController.uploadLoadRecords,
);

router.post(
  "/upload",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.uploadLoadRecords,
);

// دریافت تکی دیتاست
router.get(
  "/:id",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.getById,
);

// ایجاد دیتاست متاداده
router.post(
  "/",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.create,
);

router.delete(
  "/:id",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  DatasetController.deleteDataset,
);

export default router;
