// src/controllers/feeder.controller.ts
import { Request, Response, NextFunction } from "express";
import { FeederService } from "../services/feeder.service";
import { Role } from "@prisma/client";

export class FeederController {
  // دریافت لیست فیدرها
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId =
        req.user?.role === Role.USER
          ? req.user.companyId
          : (req.query.companyId as string | undefined);

      const feeders = await FeederService.getAll(companyId);
      return res.status(200).json({ success: true, data: feeders });
    } catch (error) {
      next(error);
    }
  }

  // دریافت یک فیدر خاص
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : undefined;

      const feeder = await FeederService.getById(id, companyId);
      return res.status(200).json({ success: true, data: feeder });
    } catch (error) {
      next(error);
    }
  }

  // ایجاد فیدر جدید
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // اگر کاربر عادی است، companyId حتما مال خودش است؛
      // اگر سوپرادمین است، باید مشخص کند فیدر برای کدام شرکت ساخته می‌شود
      const targetCompanyId =
        req.user?.role === Role.USER ? req.user.companyId : req.body.companyId;

      if (!targetCompanyId) {
        return res.status(400).json({
          success: false,
          message: "شناسه شرکت (companyId) الزامی است.",
        });
      }

      const feeder = await FeederService.create({
        ...req.body,
        companyId: targetCompanyId,
      });

      return res.status(201).json({ success: true, data: feeder });
    } catch (error) {
      next(error);
    }
  }

  // حذف فیدر
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : undefined;

      await FeederService.delete(id, companyId);
      return res
        .status(200)
        .json({ success: true, message: "فیدر با موفقیت حذف شد." });
    } catch (error) {
      next(error);
    }
  }
}
