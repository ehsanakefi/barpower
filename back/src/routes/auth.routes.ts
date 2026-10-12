import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validation.middleware";
import { loginSchema, registerSchema } from "../validation/auth.schema";
import { Role } from "@prisma/client";

const router = Router();

// ورود برای همه آزاد است
router.post("/login", validate(loginSchema), AuthController.login);

// پروفایل کاربر لاگین کرده
router.get("/me", authMiddleware, AuthController.getMe);

// ثبت کاربر جدید برای یک اداره برق (فقط توسط SUPER_ADMIN مجاز است)
router.post(
  "/register",
  authMiddleware,
  requireRole(Role.SUPER_ADMIN),
  validate(registerSchema),
  AuthController.register,
);

export default router;
