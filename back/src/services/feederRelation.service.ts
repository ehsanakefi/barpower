import { prisma } from "../database/prisma";

type RelationInput = {
  aFeederCode: string;
  bFeederCode: string;
  relationType: "SIMULTANEOUS" | "NON_SIMULTANEOUS";
};

export class FeederRelationService {
  static async getAll(datasetId?: string) {
    return prisma.feederRelation.findMany({
      where: datasetId ? { datasetId } : undefined,
      include: { aFeeder: true, bFeeder: true, dataset: true },
      orderBy: [{ relationType: "asc" }],
    });
  }

  static async createMany(datasetName: string, relations: RelationInput[]) {
    if (!relations?.length) {
      throw Object.assign(new Error("لیست روابط خالی است."), { status: 400 });
    }

    return prisma.$transaction(async (tx) => {
      const dataset = await tx.dataset.create({
        data: { name: datasetName, type: "FEEDER_RELATIONS" },
      });

      const feederCodes = Array.from(
        new Set(relations.flatMap((r) => [r.aFeederCode, r.bFeederCode])),
      );

      const feeders = await tx.feeder.findMany({
        where: { code: { in: feederCodes } },
        select: { id: true, code: true },
      });
      const map = new Map(feeders.map((f) => [f.code, f.id]));

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

      await tx.feederRelation.createMany({
        data: relations.map((r) => ({
          datasetId: dataset.id,
          aFeederId: map.get(r.aFeederCode)!,
          bFeederId: map.get(r.bFeederCode)!,
          relationType: r.relationType,
        })),
        skipDuplicates: true, // اگر در schema unique گذاشته باشید
      });

      return dataset;
    });
  }
}
