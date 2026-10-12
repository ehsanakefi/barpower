import { Request, Response, NextFunction } from "express";
import { DatasetService } from "../services/dataset.service";
import { prisma } from "../database/prisma";
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

  // ➕ دریافت تکی دیتاست بر اساس ID
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : undefined;

      const where: any = { id };
      if (companyId) {
        where.companyId = companyId;
      }

      const dataset = await prisma.dataset.findFirst({ where });
      if (!dataset) {
        return res
          .status(404)
          .json({ success: false, message: "مجموعه داده یافت نشد." });
      }

      return res.status(200).json({ success: true, data: dataset });
    } catch (err) {
      next(err);
    }
  }

  // ➕ ساخت دیتاست
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : req.body.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "شناسه شرکت (companyId) الزامی است.",
        });
      }

      const dataset = await prisma.dataset.create({
        data: {
          name: req.body.name,
          type: req.body.type,
          companyId,
        },
      });

      return res.status(201).json({ success: true, data: dataset });
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
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : req.body.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "شناسه شرکت (companyId) الزامی است.",
        });
      }

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
