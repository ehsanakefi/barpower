import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("[Unhandled Error]:", err);

  // ۱. مدیریت خطاهای اختصاصی دیتابیس پریزما
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // خطای رکورد تکراری (Unique constraint failed)
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") || "فیلد یکتا";
      return res.status(409).json({
        success: false,
        message: `رکورد با این ${target} از قبل در سامانه ثبت شده است.`,
      });
    }

    // خطای پیدا نشدن رکورد برای عملیات آپدیت یا حذف
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "اطلاعات مورد نظر در پایگاه داده یافت نشد.",
      });
    }
  }

  // ۲. مدیریت خطای محدودیت حجم بادی اکسپرس (فایل اکسل سنگین)
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "حجم اطلاعات ارسال‌شده (فایل اکسل) بیش از حد مجاز سرور است.",
    });
  }

  // ۳. خطای عمومی سرور (Fallback)
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "خطای غیرمنتظره‌ای در سرور رخ داده است.",
  });
};
