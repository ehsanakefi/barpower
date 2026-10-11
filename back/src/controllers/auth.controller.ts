import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { Role } from "@prisma/client";

export class AuthController {
  /**
   * POST /api/auth/register
   * ثبت‌نام کاربر عادی (نقش به‌صورت پیش‌فرض USER قرار می‌گیرد)
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, email, fullName } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "نام کاربری و کلمه عبور الزامی هستند.",
        });
      }

      // اجبار نقش به USER جهت جلوگیری از تزریق ADMIN توسط کاربر عادی
      const result = await AuthService.register({
        username,
        password,
        email,
        fullName,
        role: Role.USER,
      });

      return res.status(201).json({
        success: true,
        message: "ثبت‌نام با موفقیت انجام شد.",
        data: result,
      });
    } catch (error: any) {
      return res.status(error?.status || 500).json({
        success: false,
        message: error?.message || "خطای سرور در ثبت‌نام",
      });
    }
  }

  /**
   * POST /api/auth/login
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

      return res.json({
        success: true,
        message: "ورود موفقیت‌آمیز بود.",
        data: result,
      });
    } catch (error: any) {
      return res.status(error?.status || 401).json({
        success: false,
        message: error?.message || "نام کاربری یا رمز عبور اشتباه است.",
      });
    }
  }

  /**
   * GET /api/auth/me
   */
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);

      return res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(error?.status || 404).json({
        success: false,
        message: error?.message || "کاربر یافت نشد.",
      });
    }
  }
}
