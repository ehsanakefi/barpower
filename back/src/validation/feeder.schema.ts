import { z } from "zod";

export const createFeederSchema = z.object({
  code: z.string({ required_error: "کد فیدر الزامی است" }).min(1),
  name: z.string({ required_error: "نام فیدر الزامی است" }).min(1),
  substationName: z.string().optional(),
  companyId: z.string().optional(),
});

export const updateFeederSchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  substationName: z.string().optional(),
  companyId: z.string().optional(),
});
