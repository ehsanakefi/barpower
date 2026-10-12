import { Request, Response, NextFunction } from "express";
import { FeederRelationService } from "../services/feederRelation.service";
import { Role } from "@prisma/client";

export class FeederRelationController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const datasetId = req.query.datasetId as string | undefined;

      // 🔐 استخراج شناسه شرکت بر اساس نقش
      const companyId =
        req.user?.role === Role.USER
          ? req.user.companyId
          : (req.query.companyId as string | undefined);

      const relations = await FeederRelationService.getAll({
        datasetId,
        companyId,
      });

      return res.status(200).json({ success: true, data: relations });
    } catch (err) {
      next(err);
    }
  }

  static async createMany(req: Request, res: Response, next: NextFunction) {
    try {
      const { datasetName, relations } = req.body;

      // 🔐 تعیین شرکت: کاربر عادی شرکت خودش، سوپرادمین از بادی
      const companyId =
        req.user?.role === Role.USER ? req.user.companyId : req.body.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "شناسه شرکت (companyId) الزامی است.",
        });
      }

      const result = await FeederRelationService.createMany({
        datasetName,
        relations,
        companyId,
      });

      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
