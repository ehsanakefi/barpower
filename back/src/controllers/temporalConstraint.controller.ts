import { Request, Response, NextFunction } from "express";
import { TemporalConstraintService } from "../services/temporalConstraint.service";
import { Role } from "@prisma/client";

export class TemporalConstraintController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const datasetId = req.query.datasetId as string | undefined;

      // 🔐 استخراج شناسه شرکت بر اساس نقش
      const companyId =
        req.user?.role === Role.USER
          ? req.user.companyId
          : (req.query.companyId as string | undefined);

      const constraints = await TemporalConstraintService.getAll({
        datasetId,
        companyId,
      });

      return res.status(200).json({ success: true, data: constraints });
    } catch (err) {
      next(err);
    }
  }
  static async createMany(req: Request, res: Response, next: NextFunction) {
    try {
      const { datasetName } = req.body;
      const constraints = req.body.constraints || req.body.items;

      if (
        !constraints ||
        !Array.isArray(constraints) ||
        constraints.length === 0
      ) {
        return res.status(400).json({ error: "لیست محدودیت‌ها خالی است." });
      }

      const result = await TemporalConstraintService.createMany(
        datasetName,
        constraints,
        req.user?.companyId,
      );
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
