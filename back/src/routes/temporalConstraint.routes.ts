import { Router } from "express";
import { TemporalConstraintController } from "../controllers/temporalConstraint.controller";
import { validate } from "../middleware/validation.middleware";
import { createTemporalConstraintsSchema } from "../validation/temporalConstraint.schema";

const router = Router();

// لیست محدودیت‌ها
router.get("/", TemporalConstraintController.getAll);

// ثبت دسته‌ای محدودیت‌های زمانی فیدرها
router.post(
  "/batch",
  validate(createTemporalConstraintsSchema),
  TemporalConstraintController.createMany,
);

export default router;
