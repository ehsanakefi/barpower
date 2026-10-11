import { z } from "zod";

const temporalConstraintItemSchema = z.object({
  feederCode: z.string().min(1),
  date: z.string().min(1),
  constraintCode: z.number().int().min(0).max(6),
});

export const createTemporalConstraintsSchema = z.object({
  body: z.object({
    datasetName: z.string().min(1),
    constraints: z.array(temporalConstraintItemSchema).min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
