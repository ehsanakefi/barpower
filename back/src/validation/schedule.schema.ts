// validation/schedule.schema.ts
import { z } from "zod";

export const triggerScheduleSchema = z.object({
  body: z.object({
    weekStartDate: z
      .string({ required_error: "تاریخ شروع هفته الزامی است" })
      .min(1),
    loadDatasetId: z.string().optional().nullable(),
    temporalDatasetId: z.string().optional().nullable(),
    relationsDatasetId: z.string().optional().nullable(),
  }),
});
