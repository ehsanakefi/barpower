import { z } from "zod";

export const createFeederSchema = z.object({
  body: z.object({
    code: z.string({ required_error: "کد فیدر الزامی است" }).min(1),
    name: z.string({ required_error: "نام فیدر الزامی است" }).min(1),
    substationName: z.string().optional().nullable(),
  }),
});

export const updateFeederSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    substationName: z.string().optional().nullable(),
  }),
});
