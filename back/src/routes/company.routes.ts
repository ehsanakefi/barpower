import { Router } from "express";
import { CompanyController } from "../controllers/company.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

// تمامی روت‌های این بخش نیازمند لاگین و فقط نقش SUPER_ADMIN هستند
router.use(authMiddleware);
router.use(requireRole(Role.SUPER_ADMIN));

router.get("/", CompanyController.getAll);
router.get("/:id", CompanyController.getById);
router.post("/", CompanyController.create);
router.put("/:id", CompanyController.update);
router.delete("/:id", CompanyController.delete);

export default router;
