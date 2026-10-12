import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { Role } from "@prisma/client";

export class AuthController {
  /**
   * POST /api/auth/register
   * ایجاد کاربر جدید توسط SUPER_ADMIN
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, email, fullName, role, companyId } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "نام کاربری و کلمه عبور الزامی هستند.",
        });
      }

      const assignedRole =
        role === Role.SUPER_ADMIN ? Role.SUPER_ADMIN : Role.USER;

      // 🔐 برای نقش USER، مشخص بودن اداره برق (شرکت) الزامی است
      if (assignedRole === Role.USER && !companyId) {
        return res.status(400).json({
          success: false,
          message: "برای کاربران عملیاتی، شناسه شرکت (companyId) الزامی است.",
        });
      }

      const result = await AuthService.register({
        username,
        password,
        email,
        fullName,
        role: assignedRole,
        companyId: assignedRole === Role.USER ? companyId : null,
      });

      return res.status(201).json({
        success: true,
        message: "کاربر با موفقیت ثبت شد.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * خروجی شامل توکن حاوی companyId و role خواهد بود
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "نام کاربری و کلمه عبور الزامی است.",
        });
      }

      const result = await AuthService.login({ username, password });

      return res.status(200).json({
        success: true,
        message: "ورود موفقیت‌آمیز بود.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      // استفاده از شناسه کاربر موجود در req.user (بر اساس تعریفی که در توکن و میدلور دارید)
      const currentUserId = req.user?.id || req.user?.userId;

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message: "کاربر احراز هویت نشده است.",
        });
      }

      const user = await AuthService.getMe(currentUserId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
