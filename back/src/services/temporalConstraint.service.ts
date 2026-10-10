import { prisma } from "../database/prisma";

type TemporalConstraintInput = {
  feederCode: string;
  dayOfWeek: number; // 0..6
  hour: number; // 1..24
  state: number; // کد محدودیت (مثلاً 0..6)
};

export class TemporalConstraintService {
  static async getAll(datasetId?: string) {
    return prisma.temporalConstraint.findMany({
      where: datasetId ? { datasetId } : undefined,
      include: { feeder: true, dataset: true },
      orderBy: [{ feederId: "asc" }, { dayOfWeek: "asc" }, { hour: "asc" }],
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
        data: { name: datasetName, type: "TEMPORAL_CONSTRAINTS" },
      });

      const feederCodes = Array.from(
        new Set(constraints.map((c) => c.feederCode)),
      );
      const feeders = await tx.feeder.findMany({
        where: { code: { in: feederCodes } },
        select: { id: true, code: true },
      });
      const map = new Map(feeders.map((f) => [f.code, f.id]));

      // اطمینان: همه feederCode ها وجود داشته باشند
      const missing = feederCodes.filter((c) => !map.has(c));
      if (missing.length) {
        throw Object.assign(
          new Error(
            `این فیدرها در دیتابیس ثبت نشده‌اند: ${missing.join(", ")}`,
          ),
          {
            status: 400,
          },
        );
      }

      await tx.temporalConstraint.createMany({
        data: constraints.map((c) => ({
          datasetId: dataset.id,
          feederId: map.get(c.feederCode)!,
          dayOfWeek: c.dayOfWeek,
          hour: c.hour,
          state: c.state,
        })),
      });

      return dataset;
    });
  }
}
