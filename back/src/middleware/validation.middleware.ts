import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => {
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
        // در Zod، آرایه اصلی خطاها issues نام دارد
        const issues = error.issues || (error as any).errors || [];

        return res.status(400).json({
          success: false,
          message: "داده‌های ارسالی با استاندارد سامانه همخوانی ندارند.",
          errors: issues.map((err) => ({
            // اگر خطای فیلد داخلی بدنه بود 'body' را حذف می‌کند، در غیر این صورت کل مسیر را نشان می‌دهد
            field:
              err.path.length > 1
                ? err.path.slice(1).join(".")
                : (err.path[0] ?? "body"),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
};
