import { Request, Response } from "express";
import { TemporalConstraintService } from "../services/temporalConstraint.service";

export class TemporalConstraintController {
  static async getAll(req: Request, res: Response) {
    try {
      const datasetId = req.query.datasetId as string | undefined;
      const constraints = await TemporalConstraintService.getAll(datasetId);
      return res.json({ success: true, data: constraints });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createMany(req: Request, res: Response) {
    try {
      const { datasetName, constraints } = req.body;
      const result = await TemporalConstraintService.createMany(
        datasetName,
        constraints,
      );
      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
