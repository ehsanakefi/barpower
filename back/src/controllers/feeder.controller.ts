import { Request, Response, NextFunction } from "express";
import { FeederService } from "../services/feeder.service";

export class FeederController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const feeders = await FeederService.getAll();
      return res.json({ success: true, data: feeders });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feeder = await FeederService.getById(id);
      if (!feeder) {
        return res
          .status(404)
          .json({ success: false, message: "فیدر مورد نظر یافت نشد" });
      }
      return res.json({ success: true, data: feeder });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // داده‌ها قبلاً در میدلور validate پالایش و تایید شده‌اند
      const feeder = await FeederService.create(req.body);
      return res.status(201).json({
        success: true,
        message: "فیدر با موفقیت ثبت شد",
        data: feeder,
      });
    } catch (err) {
      next(err); // ارسال مستقیم خطا به میدلور مرکزی در app.ts
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await FeederService.delete(id);
      return res.json({ success: true, message: "فیدر با موفقیت حذف شد" });
    } catch (err) {
      next(err);
    }
  }
}
