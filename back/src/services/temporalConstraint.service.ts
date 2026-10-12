import { prisma } from "../database/prisma";

export type TemporalConstraintInput = {
  feederCode: string;
  date: string;
  constraintCode: number;
};

export class TemporalConstraintService {
  /**
   * دریافت محدودیت‌های زمانی با پشتیبانی از فیلتر companyId و datasetId
   * (پشتیبانی هم از ارسال آبجکت { companyId, datasetId } و هم از آرگومان‌های تکی)
   */
  static async getAll(
    filterOrDatasetId?: string | { datasetId?: string; companyId?: string },
    possibleCompanyId?: string,
  ) {
    let datasetId: string | undefined;
    let companyId: string | undefined;

    if (typeof filterOrDatasetId === "object" && filterOrDatasetId !== null) {
      datasetId = filterOrDatasetId.datasetId;
      companyId = filterOrDatasetId.companyId;
    } else {
      datasetId = filterOrDatasetId;
      companyId = possibleCompanyId;
    }

    return prisma.temporalConstraint.findMany({
      where: {
        ...(datasetId ? { datasetId } : {}),
        ...(companyId
          ? {
              dataset: {
                companyId,
              },
            }
          : {}),
      },
      include: {
        feeder: true,
        dataset: true,
      },
      orderBy: [{ feederId: "asc" }, { date: "asc" }],
    });
  }

  /**
   * ثبت دسته‌ای محدودیت‌های زمانی برای شرکت جاری
   */
  static async createMany(
    datasetName: string,
    constraints: TemporalConstraintInput[],
    companyId?: string,
  ) {
    if (
      !constraints ||
      !Array.isArray(constraints) ||
      constraints.length === 0
    ) {
      throw Object.assign(new Error("لیست محدودیت‌ها خالی است."), {
        status: 400,
      });
    }

    return prisma.$transaction(async (tx) => {
      // ۱. ساخت دیتاست محدودیت‌ها مرتبط با شرکت کاربر
      const dataset = await tx.dataset.create({
        data: {
          name: datasetName,
          type: "TEMPORAL_CONSTRAINTS",
          ...(companyId ? { companyId } : {}),
        },
      });

      const feederCodes = Array.from(
        new Set(constraints.map((constraint) => constraint.feederCode)),
      );

      // ۲. استخراج فیدرهای مختص همین شرکت
      const feeders = await tx.feeder.findMany({
        where: {
          code: {
            in: feederCodes,
          },
          ...(companyId ? { companyId } : {}),
        },
        select: {
          id: true,
          code: true,
        },
      });

      const feederIdByCode = new Map(
        feeders.map((feeder) => [feeder.code, feeder.id]),
      );

      const missingFeederCodes = feederCodes.filter(
        (code) => !feederIdByCode.has(code),
      );

      if (missingFeederCodes.length > 0) {
        throw Object.assign(
          new Error(
            `این فیدرها در دیتابیس شرکت شما ثبت نشده‌اند: ${missingFeederCodes.join(", ")}`,
          ),
          { status: 400 },
        );
      }

      // ۳. ثبت رکوردهای محدودیت زمانی
      await tx.temporalConstraint.createMany({
        data: constraints.map((constraint) => ({
          datasetId: dataset.id,
          feederId: feederIdByCode.get(constraint.feederCode)!,
          date: constraint.date,
          constraintCode: constraint.constraintCode,
        })),
      });

      return dataset;
    });
  }
}
