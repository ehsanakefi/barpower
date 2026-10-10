import { Router } from "express";
import { FeederRelationController } from "../controllers/feederRelation.controller";
import { validate } from "../middleware/validate.middleware";
import { createFeederRelationsSchema } from "../validation/feederRelation.schema";

const router = Router();

// لیست روابط
router.get("/", FeederRelationController.getAll);

// ثبت روابط هم‌زمان یا غیرهم‌زمان فیدرها
router.post(
  "/batch",
  validate(createFeederRelationsSchema),
  FeederRelationController.createMany,
);

export default router;
