import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { FeederService } from "../services/feeder.service";
import {
  createFeederSchema,
  updateFeederSchema,
} from "../validation/feeder.schema";

// هلپر برای استخراج امن داده‌های اعتبارسنجی شده صرف‌نظر از ساختار اسکیما
function parsePayload(schema: any, req: Request) {
  // اگر اسکیما شامل فیلد body باشد، کل req یا { body: req.body } را ارزیابی می‌کنیم
  try {
    const parsed = schema.parse(req.body);
    return parsed.body !== undefined ? parsed.body : parsed;
  } catch (err) {
    // اگر شکست خورد، چک کنیم آیا اسکیما کل req یا { body } را انتظار دارد:
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    return parsed.body !== undefined ? parsed.body : parsed;
  }
}

export class FeederController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const feeders = await FeederService.getAll(user);
      return res.status(200).json({ success: true, data: feeders });
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const feeder = await FeederService.getById(id, user);
      return res.status(200).json({ success: true, data: feeder });
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const data = parsePayload(createFeederSchema, req);

      const targetCompanyId =
        user.role === Role.SUPER_ADMIN
          ? data.companyId || req.body?.companyId || user.companyId
          : user.companyId;

      if (!targetCompanyId) {
        return res.status(400).json({
          success: false,
          message: "شناسه شرکت (companyId) الزامی است.",
        });
      }

      const feeder = await FeederService.create({
        code: data.code,
        name: data.name,
        substationName: data.substationName,
        companyId: targetCompanyId,
      });

      return res.status(201).json({ success: true, data: feeder });
    } catch (error) {
      return next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const data = parsePayload(updateFeederSchema, req);

      const updatedFeeder = await FeederService.update(id, user, data);

      return res.status(200).json({ success: true, data: updatedFeeder });
    } catch (error) {
      return next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      await FeederService.delete(id, user);

      return res.status(200).json({
        success: true,
        message: "فیدر با موفقیت حذف شد.",
      });
    } catch (error) {
      return next(error);
    }
  }
}
