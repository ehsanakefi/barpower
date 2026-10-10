import { z } from "zod";

const singleLoadRecordSchema = z.object({
  operatorName: z.string().optional().nullable(),
  stationType: z.string().optional().nullable(),
  stationPgdsCode: z
    .string({ required_error: "کد دیسپاچینگ ایستگاه الزامی است" })
    .min(1),
  equipmentType: z.string().optional().nullable(),
  equipment: z.string().optional().nullable(),
  equipmentPgdsCode: z.string().optional().nullable(),
  energyType: z.string().optional().nullable(),

  date: z.string({ required_error: "تاریخ رکورد الزامی است" }).min(1),
  total: z.number().default(0),

  // مقادیر ۲۴ ساعت (H1 تا H24)
  h1: z.number().optional().nullable(),
  h2: z.number().optional().nullable(),
  h3: z.number().optional().nullable(),
  h4: z.number().optional().nullable(),
  h5: z.number().optional().nullable(),
  h6: z.number().optional().nullable(),
  h7: z.number().optional().nullable(),
  h8: z.number().optional().nullable(),
  h9: z.number().optional().nullable(),
  h10: z.number().optional().nullable(),
  h11: z.number().optional().nullable(),
  h12: z.number().optional().nullable(),
  h13: z.number().optional().nullable(),
  h14: z.number().optional().nullable(),
  h15: z.number().optional().nullable(),
  h16: z.number().optional().nullable(),
  h17: z.number().optional().nullable(),
  h18: z.number().optional().nullable(),
  h19: z.number().optional().nullable(),
  h20: z.number().optional().nullable(),
  h21: z.number().optional().nullable(),
  h22: z.number().optional().nullable(),
  h23: z.number().optional().nullable(),
  h24: z.number().optional().nullable(),
});

export const uploadLoadRecordsSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "نام مجموعه داده الزامی است" }).min(1),
    fileName: z.string().optional().nullable(),
    records: z
      .array(singleLoadRecordSchema)
      .min(1, "حداقل یک رکورد بار مصرفی باید ارسال شود"),
  }),
});
