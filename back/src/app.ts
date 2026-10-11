import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRoutes from "./routes";

export const app = express();

// ۱. تنظیمات CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);

// ۲. پارس کردن داده‌های ورودی
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ۳. لاگر در محیط توسعه
if (process.env.NODE_ENV !== "production") {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(
      `[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`,
    );
    next();
  });
}

// ۴. بررسی سلامت سرور
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ۵. مسیرهای اصلی API
app.use("/api", apiRoutes);

// ۶. مدیریت مسیرهای یافت‌نشده (404 Not Found)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `مسیر ${req.method} ${req.originalUrl} در سرور تعریف نشده است.`,
  });
});

// ۷. میان‌افزار مدیریت خطای مرکزی
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server Error:", err);

  // خطاهای اعتبارسنجی Zod
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "داده‌های ارسالی نامعتبر هستند.",
      errors: err.errors,
    });
  }

  // خطای نقض یکتایی دیتابیس (Prisma Unique Constraint)
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "یک رکورد با این مشخصات یکتا از قبل در دیتابیس وجود دارد.",
    });
  }

  // خطای عبور حجم داده از سقف مجاز
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "حجم داده‌های ارسالی فایل اکسل بیشتر از حد مجاز سرور است.",
    });
  }

  // سایر خطاهای سرور
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "خطای داخلی سرور رخ داده است.",
  });
});

export default app;
