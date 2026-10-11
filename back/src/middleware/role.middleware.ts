import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "ابتدا باید وارد حساب کاربری شوید.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "شما مجوز دسترسی به این بخش را ندارید.",
      });
    }

    return next();
  };
}
