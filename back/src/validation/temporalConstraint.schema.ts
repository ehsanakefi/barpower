import { z } from "zod";

export const createTemporalConstraintsSchema = z.object({
  body: z.object({
    datasetName: z.string({ required_error: "نام مجموعه الزامی است" }).min(1),
    constraints: z
      .array(
        z.object({
          feederCode: z.string({ required_error: "کد فیدر الزامی است" }),
          date: z.string({ required_error: "تاریخ الزامی است" }),
          constraintCode: z.number().int().min(0).max(6),
        }),
      )
      .min(1, "حداقل یک محدودیت باید ارسال شود"),
  }),
});
