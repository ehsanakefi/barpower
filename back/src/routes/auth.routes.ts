import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// مسیرهای عمومی (بدون نیاز به توکن)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// مسیر محافظت‌شده (نیاز به توکن)
router.get("/me", authMiddleware, AuthController.me);

export default router;
