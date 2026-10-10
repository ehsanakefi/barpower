import { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `مسیر ${req.method} ${req.originalUrl} در سرور وجود ندارد.`,
  });
};
