import { Router } from "express";
import { DatasetController } from "../controllers/dataset.controller";
import { validate } from "../middleware/validation.middleware";
import { uploadLoadRecordsSchema } from "../validation/loadRecord.schema";

const router = Router();

// دریافت لیست مجموعه‌ها
router.get("/", DatasetController.getAll);

// ثبت رکوردهای بار مصرفی (H1 تا H24) اکسل با اعتبارسنجی خودکار
router.post(
  "/load-records",
  validate(uploadLoadRecordsSchema),
  DatasetController.uploadLoadRecords,
);

// مشاهده رکوردهای بار
router.get("/load-records", DatasetController.getRecords);

// حذف مجموعه
router.delete("/:id", DatasetController.deleteDataset);

export default router;
