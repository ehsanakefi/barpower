import { Request, Response, NextFunction } from "express";
import { DatasetService } from "../services/dataset.service";
import { DatasetType, Role } from "@prisma/client";

export class DatasetController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as DatasetType | undefined;

      // 🔐 تفکیک دسترسی بر اساس نقش
      const companyId =
        req.user?.role === Role.USER
          ? req.user.companyId
          : (req.query.companyId as string | undefined);

      const datasets = await DatasetService.getAll({ type, companyId });
      return res.json({ success: true, data: datasets });
    } catch (err) {
      next(err);
    }
  }

  static async uploadLoadRecords(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // 🔐 تعیین شرکت: کاربر عادی شرکت خودش، سوپرادمین از بادی
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : req.body.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "شناسه شرکت (companyId) الزامی است.",
        });
      }

      // ارسال companyId به سرویس همراه با داده‌ها
      const dataset = await DatasetService.saveLoadDataset({
        ...req.body,
        companyId,
      });

      return res.status(201).json({
        success: true,
        message: "مجموعه داده بار با موفقیت ذخیره شد",
        data: dataset,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const datasetId = req.query.datasetId as string | undefined;
      const date = req.query.date as string | undefined;

      // 🔐 فیلتر رکوردها فقط در محدوده همان شرکت
      const companyId =
        req.user?.role === Role.USER
          ? req.user.companyId
          : (req.query.companyId as string | undefined);

      const records = await DatasetService.getLoadRecords({
        datasetId,
        date,
        companyId,
      });
      return res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  }

  static async deleteDataset(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // 🔐 برای USER شناسه شرکت اجباری پاس داده می‌شود تا مطمئن شویم مال خودش را پاک می‌کند
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : undefined;

      await DatasetService.deleteDataset(id, companyId);
      return res.json({
        success: true,
        message: "مجموعه داده و رکوردهای مرتبط حذف شدند",
      });
    } catch (err) {
      next(err);
    }
  }
}
