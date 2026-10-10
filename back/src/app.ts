import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { errorHandler } from "./middleware/error.middleware";
// ایمپورت مسیرها (Routes)
import feederRoutes from "./routes/feeder.routes";
import datasetRoutes from "./routes/dataset.routes";
import temporalConstraintRoutes from "./routes/temporalConstraint.routes";
import feederRelationRoutes from "./routes/feederRelation.routes";
import scheduleRoutes from "./routes/schedule.routes";
import apiRoutes from "./routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(
      `[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`,
    );
    next();
  });
}

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `مسیر ${req.method} ${req.originalUrl} در سرور تعریف نشده است.`,
  });
});

app.use(notFoundHandler);

app.use(errorHandler);
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server Error:", err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "داده‌های ارسالی نامعتبر هستند.",
      errors: err.errors,
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "یک رکورد با این مشخصات یکتا از قبل در دیتابیس وجود دارد.",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "حجم داده‌های ارسالی فایل اکسل بیشتر از حد مجاز سرور است.",
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "خطای داخلی سرور رخ داده است.",
  });
});

export default app;
