import { Request, Response } from "express";
import { FeederRelationService } from "../services/feederRelation.service";

export class FeederRelationController {
  static async getAll(req: Request, res: Response) {
    try {
      const datasetId = req.query.datasetId as string | undefined;
      const relations = await FeederRelationService.getAll(datasetId);
      return res.json({ success: true, data: relations });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createMany(req: Request, res: Response) {
    try {
      const { datasetName, relations } = req.body;
      const result = await FeederRelationService.createMany(
        datasetName,
        relations,
      );
      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
