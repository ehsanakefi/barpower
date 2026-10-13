import { Router } from "express";
import { FeederController } from "../controllers/feeder.controller";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();
router.use(authMiddleware);
// ۱. دریافت همه فیدرها (هر دو نقش)
router.get(
  "/",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  FeederController.getAll,
);

// ۲. دریافت تکی فیدر (هر دو نقش)
router.get(
  "/:id",
  requireRole(Role.SUPER_ADMIN, Role.USER),
  FeederController.getById,
);

// ۳. ایجاد فیدر (فقط SUPER_ADMIN - برای کاربر عادی ۴۰۳ می‌دهد)
router.post("/create", requireRole(Role.SUPER_ADMIN), FeederController.create);

// ۴. ویرایش فیدر (فقط SUPER_ADMIN)
router.put("/:id", requireRole(Role.SUPER_ADMIN), FeederController.update);

// ۵. حذف فیدر (فقط SUPER_ADMIN)
router.delete("/:id", requireRole(Role.SUPER_ADMIN), FeederController.delete);

export default router;
