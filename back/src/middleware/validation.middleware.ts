import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // بررسی بادی، پارامترهای آدرس و کوئری استرینگ
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // جایگزینی با داده‌های پاکسازی و اعتبارسنجی شده
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "داده‌های ارسالی با استاندارد سامانه همخوانی ندارند.",
          errors: error.errors.map((err) => ({
            field: err.path.slice(1).join("."), // حذف کلمه body از مسیر فیلد
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
};
