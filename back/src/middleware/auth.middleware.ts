import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.header("Authorization");

  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: "توکن احراز هویت ارسال نشده است.",
    });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "فرمت توکن نامعتبر است.",
    });
  }

  try {
    const payload = AuthService.verifyToken(token);

    req.user = payload;

    return next();
  } catch (error: any) {
    return res.status(error?.status || 401).json({
      success: false,
      message: error?.message || "توکن نامعتبر یا منقضی شده است.",
    });
  }
}
