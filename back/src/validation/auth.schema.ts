import { z } from "zod";
import { Role } from "@prisma/client";

export const loginSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "نام کاربری الزامی است." })
      .trim()
      .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد."),
    password: z
      .string({ required_error: "رمز عبور الزامی است." })
      .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
  }),
});

export const registerSchema = z.object({
  body: z
    .object({
      username: z
        .string({ required_error: "نام کاربری الزامی است." })
        .trim()
        .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد."),
      password: z
        .string({ required_error: "رمز عبور الزامی است." })
        .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
      fullName: z.string().trim().optional(),
      email: z.string().email("ایمیل معتبر نیست.").optional(),
      role: z.nativeEnum(Role).default(Role.USER),
      companyId: z.string().cuid("شناسه شرکت نامعتبر است.").optional(),
    })
    .refine(
      (data) => {
        // کاربر عادی حتماً باید متعلق به یک شرکت باشد
        if (data.role === Role.USER && !data.companyId) {
          return false;
        }
        return true;
      },
      {
        message: "برای کاربران با نقش USER، مشخص کردن شرکت الزامی است.",
        path: ["companyId"],
      },
    ),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RegisterInput = z.infer<typeof registerSchema>["body"];
