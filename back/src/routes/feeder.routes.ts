import { Router } from "express";
import { FeederController } from "../controllers/feeder.controller";
import { validate } from "../middleware/validate.middleware";
import { createFeederSchema } from "../validation/feeder.schema";

const router = Router();

// لیست کامل فیدرها
router.get("/", FeederController.getAll);

// اطلاعات یک فیدر
router.get("/:id", FeederController.getById);

// ایجاد فیدر (همراه با میدلور اعتبارسنجی)
router.post("/", validate(createFeederSchema), FeederController.create);

// حذف فیدر
router.delete("/:id", FeederController.delete);

export default router;
