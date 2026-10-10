import { z } from "zod";

export const createFeederRelationsSchema = z.object({
  body: z.object({
    datasetName: z.string({ required_error: "نام مجموعه الزامی است" }).min(1),
    relations: z
      .array(
        z.object({
          baseFeederCode: z.string({
            required_error: "کد فیدر مبدا الزامی است",
          }),
          relatedFeederCode: z.string({
            required_error: "کد فیدر مقصد الزامی است",
          }),
          relationType: z.enum(["SIMULTANEOUS", "NON_SIMULTANEOUS"], {
            errorMap: () => ({
              message: "نوع رابطه باید SIMULTANEOUS یا NON_SIMULTANEOUS باشد",
            }),
          }),
        }),
      )
      .min(1, "حداقل یک رابطه باید ارسال شود"),
  }),
});
