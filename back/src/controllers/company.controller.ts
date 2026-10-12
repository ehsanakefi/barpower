// src/controllers/company.controller.ts
import { Request, Response, NextFunction } from "express";
import { CompanyService } from "../services/company.service";

export class CompanyController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await CompanyService.getAll();
      return res.status(200).json({ success: true, data: companies });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const company = await CompanyService.getById(id);
      return res.status(200).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await CompanyService.create(req.body);
      return res.status(201).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await CompanyService.update(id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CompanyService.delete(id);
      return res
        .status(200)
        .json({ success: true, message: "شرکت با موفقیت حذف شد." });
    } catch (error) {
      next(error);
    }
  }
}
