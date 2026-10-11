import { Router } from "express";
import feederRoutes from "./feeder.routes";
import datasetRoutes from "./dataset.routes";
import temporalConstraintRoutes from "./temporalConstraint.routes";
import feederRelationRoutes from "./feederRelation.routes";
import scheduleRoutes from "./schedule.routes";
import authRoutes from "./auth.routes";

const router = Router();
router.use("/auth", authRoutes);
router.use("/feeders", feederRoutes);
router.use("/datasets", datasetRoutes);
router.use("/temporal-constraints", temporalConstraintRoutes);
router.use("/feeder-relations", feederRelationRoutes);
router.use("/schedules", scheduleRoutes);

export default router;
