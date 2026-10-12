import { Router } from "express";
import authRoutes from "./auth.routes";
import companyRoutes from "./company.routes";
import feederRoutes from "./feeder.routes";
import datasetRoutes from "./dataset.routes";
import temporalConstraintRoutes from "./temporalConstraint.routes";
import feederRelationRoutes from "./feederRelation.routes";
import scheduleRoutes from "./schedule.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/companies", companyRoutes);
apiRouter.use("/feeders", feederRoutes);
apiRouter.use("/datasets", datasetRoutes);
apiRouter.use("/temporal-constraints", temporalConstraintRoutes);
apiRouter.use("/feeder-relations", feederRelationRoutes);
apiRouter.use("/schedules", scheduleRoutes);

export default apiRouter;
