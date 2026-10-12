import { Request } from "express";
import { Role } from "@prisma/client";

export function resolveCompanyId(req: Request): string | undefined {
  if (req.user?.role === Role.SUPER_ADMIN) {
    // سوپرادمین می‌تواند از کوئری یا بادی ارسال کند، یا هیچی نفرستد
    return (req.query.companyId as string) || req.body.companyId || undefined;
  }
  // برای کاربر عادی همیشه و الزاماً شرکت خودش
  return req.user?.companyId;
}
