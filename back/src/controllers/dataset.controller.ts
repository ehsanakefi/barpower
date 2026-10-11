import { Request, Response, NextFunction } from "express";
import { DatasetService } from "../services/dataset.service";
import { DatasetType } from "@prisma/client";

export class DatasetController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as DatasetType | undefined;
      const datasets = await DatasetService.getAll(type);
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
      // ✅ داده‌ها قبلاً در میدلور validate پالایش و تایید شده‌اند، نیازی به parse مجدد نیست
      const dataset = await DatasetService.saveLoadDataset(req.body);
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
      const records = await DatasetService.getLoadRecords({ datasetId, date });
      return res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  }

  static async deleteDataset(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DatasetService.deleteDataset(id);
      return res.json({
        success: true,
        message: "مجموعه داده و رکوردهای مرتبط حذف شدند",
      });
    } catch (err) {
      next(err);
    }
  }
}
