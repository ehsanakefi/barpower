import { Router } from "express";
import { FeederController } from "../controllers/feeder.controller";
import { validate } from "../middleware/validation.middleware";
import { createFeederSchema } from "../validation/feeder.schema";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

// لیست کامل فیدرها
router.get("/", requireRole(Role.ADMIN, Role.USER), FeederController.getAll);

// اطلاعات یک فیدر
router.get(
  "/:id",
  requireRole(Role.ADMIN, Role.USER),
  FeederController.getById,
);

// ایجاد فیدر (همراه با میدلور اعتبارسنجی)
router.post(
  "/",
  requireRole(Role.ADMIN, Role.USER),
  validate(createFeederSchema),
  FeederController.create,
);
// router.put("/:id", requireRole(Role.ADMIN, Role.USER), FeederController.update);
// حذف فیدر
router.delete(
  "/:id",
  requireRole(Role.ADMIN, Role.USER),
  FeederController.delete,
);

export default router;
