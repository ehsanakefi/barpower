import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";
import { CreateCompanyDTO, UpdateCompanyDTO } from "../types/company";

export class CompanyService {
  static async getAll() {
    return prisma.company.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
  }

  static async getById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw Object.assign(new Error("شرکت یافت نشد."), { status: 404 });
    }

    return company;
  }

  static async create(input: CreateCompanyDTO) {
    try {
      return await prisma.company.create({
        data: {
          code: input.code,
          name: input.name,
          province: input.province,
          isActive: input.isActive ?? true,
        },
      });
    } catch (err: any) {
      // هندل خطای یکتایی (Unique Constraint) برای کد شرکت
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw Object.assign(
          new Error("کد شرکت (code) تکراری است و قبلاً ثبت شده است."),
          { status: 409 },
        );
      }
      throw err;
    }
  }

  static async update(id: string, input: UpdateCompanyDTO) {
    // اطمینان از وجود شرکت پیش از بروزرسانی
    await this.getById(id);

    try {
      return await prisma.company.update({
        where: { id },
        data: {
          ...(input.code !== undefined ? { code: input.code } : {}),
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.province !== undefined ? { province: input.province } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw Object.assign(
          new Error("کد شرکت (code) تکراری است و قبلاً ثبت شده است."),
          { status: 409 },
        );
      }
      throw err;
    }
  }

  /**
   * به دلیل روابط Cascade و جلوگیری از حذف تصادفی حجم بالای داده‌ها (کاربران، فیدرها، نتایج زمان‌بندی)،
   * غیرفعال‌سازی منطقی (Soft Disable) انجام می‌شود.
   */
  static async disable(id: string) {
    await this.getById(id);
    return prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async enable(id: string) {
    await this.getById(id);
    return prisma.company.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
