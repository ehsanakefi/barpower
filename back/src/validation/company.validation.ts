import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug نامعتبر است"),
  isActive: z.boolean().optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug نامعتبر است")
    .optional(),
  isActive: z.boolean().optional(),
});
