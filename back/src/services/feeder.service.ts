import { prisma } from "../database/prisma";

export class FeederService {
  /**
   * دریافت لیست فیدرها (فیلتر بر اساس شرکت در صورت ارسال)
   */
  static async getAll(companyId?: string) {
    return prisma.feeder.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { code: "asc" },
    });
  }

  /**
   * دریافت اطلاعات یک فیدر با اعتبارسنجی شرکت
   */
  static async getById(id: string, companyId?: string) {
    const feeder = await prisma.feeder.findFirst({
      where: {
        id,
        ...(companyId ? { companyId } : {}),
      },
    });

    if (!feeder) {
      throw Object.assign(
        new Error("فیدر مورد نظر یافت نشد یا دسترسی مجاز نیست."),
        { status: 404 },
      );
    }

    return feeder;
  }

  /**
   * ایجاد فیدر جدید در محدوده شرکت مربوطه
   */
  static async create(data: {
    companyId: string;
    code: string;
    name: string;
    substationName?: string | null;
  }) {
    const { companyId, code, name, substationName } = data;

    // بررسی تکراری نبودن کد فیدر در همان شرکت
    const existing = await prisma.feeder.findUnique({
      where: {
        companyId_code: {
          companyId,
          code,
        },
      },
    });

    if (existing) {
      throw Object.assign(
        new Error(`فیدری با کد ${code} در این شرکت قبلاً ثبت شده است.`),
        { status: 400 },
      );
    }

    return prisma.feeder.create({
      data: {
        companyId,
        code,
        name,
        substationName: substationName ?? null,
      },
    });
  }

  /**
   * ویرایش فیدر با تضمین تعلق به شرکت کاربر
   */
  static async update(
    id: string,
    data: {
      name?: string;
      substationName?: string | null;
    },
    companyId?: string,
  ) {
    // ابتدا اطمینان از وجود و مالکیت فیدر
    await this.getById(id, companyId);

    return prisma.feeder.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.substationName !== undefined && {
          substationName: data.substationName,
        }),
      },
    });
  }

  /**
   * حذف فیدر با تضمین تعلق به شرکت کاربر
   */
  static async delete(id: string, companyId?: string) {
    // ابتدا اطمینان از وجود و مالکیت فیدر
    await this.getById(id, companyId);

    return prisma.feeder.delete({
      where: { id },
    });
  }
}
