import { Request, Response } from "express";
import { FeederService } from "../services/feeder.service";
import {
  createFeederSchema,
  updateFeederSchema,
} from "../validation/feeder.schema";

export class FeederController {
  static async getAll(req: Request, res: Response) {
    try {
      const feeders = await FeederService.getAll();
      return res.json({ success: true, data: feeders });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const feeder = await FeederService.getById(id);
      if (!feeder) {
        return res
          .status(404)
          .json({ success: false, message: "فیدر مورد نظر یافت نشد" });
      }
      return res.json({ success: true, data: feeder });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const validated = createFeederSchema.parse(req.body);
      const feeder = await FeederService.create(validated);
      return res.status(201).json({ success: true, data: feeder });
    } catch (err: any) {
      return res
        .status(400)
        .json({ success: false, message: err.message, errors: err.errors });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await FeederService.delete(id);
      return res.json({ success: true, message: "فیدر با موفقیت حذف شد" });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
