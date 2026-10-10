import { Request, Response } from "express";
import { DatasetService } from "../services/dataset.service";
import { uploadLoadRecordsSchema } from "../validation/loadRecord.schema";

export class DatasetController {
  static async getAll(req: Request, res: Response) {
    try {
      const type = req.query.type as string | undefined;
      const datasets = await DatasetService.getAll(type);
      return res.json({ success: true, data: datasets });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async uploadLoadRecords(req: Request, res: Response) {
    try {
      const validated = uploadLoadRecordsSchema.parse(req.body);
      const dataset = await DatasetService.saveLoadDataset(validated);
      return res.status(201).json({
        success: true,
        message: "مجموعه داده بار با موفقیت ذخیره شد",
        data: dataset,
      });
    } catch (err: any) {
      return res
        .status(400)
        .json({ success: false, message: err.message, errors: err.errors });
    }
  }

  static async getRecords(req: Request, res: Response) {
    try {
      const datasetId = req.query.datasetId as string | undefined;
      const date = req.query.date as string | undefined;
      const records = await DatasetService.getLoadRecords({ datasetId, date });
      return res.json({ success: true, data: records });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteDataset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DatasetService.deleteDataset(id);
      return res.json({
        success: true,
        message: "مجموعه داده و رکوردهای مرتبط حذف شدند",
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
