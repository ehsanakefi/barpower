import { prisma } from "../database/prisma";

type TemporalConstraintInput = {
  feederCode: string;
  date: string;
  constraintCode: number;
};

export class TemporalConstraintService {
  static async getAll(datasetId?: string) {
    return prisma.temporalConstraint.findMany({
      where: datasetId ? { datasetId } : undefined,
      include: {
        feeder: true,
        dataset: true,
      },
      orderBy: [{ feederId: "asc" }, { date: "asc" }],
    });
  }

  static async createMany(
    datasetName: string,
    constraints: TemporalConstraintInput[],
  ) {
    if (!constraints?.length) {
      throw Object.assign(new Error("لیست محدودیت‌ها خالی است."), {
        status: 400,
      });
    }

    return prisma.$transaction(async (tx) => {
      const dataset = await tx.dataset.create({
        data: {
          name: datasetName,
          type: "TEMPORAL_CONSTRAINTS",
        },
      });

      const feederCodes = Array.from(
        new Set(constraints.map((constraint) => constraint.feederCode)),
      );

      const feeders = await tx.feeder.findMany({
        where: {
          code: {
            in: feederCodes,
          },
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
            `این فیدرها در دیتابیس ثبت نشده‌اند: ${missingFeederCodes.join(", ")}`,
          ),
          { status: 400 },
        );
      }

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
