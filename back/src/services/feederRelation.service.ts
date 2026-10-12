import { prisma } from "../database/prisma";

type RelationInput = {
  aFeederCode?: string;
  baseFeederCode?: string;
  bFeederCode?: string;
  relatedFeederCode?: string;
  relationType: "SIMULTANEOUS" | "NON_SIMULTANEOUS";
};

export class FeederRelationService {
  /**
   * دریافت لیست روابط فیدرها با فیلتر شرکت و دیتاست
   */
  static async getAll(options?: { datasetId?: string; companyId?: string }) {
    const { datasetId, companyId } = options || {};

    return prisma.feederRelation.findMany({
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
        baseFeeder: true,
        relatedFeeder: true,
        dataset: true,
      },
      orderBy: [{ relationType: "asc" }],
    });
  }

  /**
   * ثبت گروهی روابط فیدرها با تفکیک دقیق شرکت
   */
  static async createMany(options: {
    datasetName: string;
    relations: RelationInput[];
    companyId: string;
  }) {
    const { datasetName, relations, companyId } = options;

    if (!relations?.length) {
      throw Object.assign(new Error("لیست روابط خالی است."), { status: 400 });
    }

    if (!companyId) {
      throw Object.assign(new Error("شناسه شرکت (companyId) الزامی است."), {
        status: 400,
      });
    }

    return prisma.$transaction(async (tx) => {
      // ۱. ساخت مجموعه داده منتسب به همان شرکت
      const dataset = await tx.dataset.create({
        data: {
          name: datasetName,
          type: "FEEDER_RELATIONS",
          companyId,
        },
      });

      // استخراج کدهای منحصر‌به‌فرد فیدرها
      const feederCodes = Array.from(
        new Set(
          relations
            .flatMap((r) => [
              r.baseFeederCode || r.aFeederCode,
              r.relatedFeederCode || r.bFeederCode,
            ])
            .filter(Boolean) as string[],
        ),
      );

      // ۲. 🔐 جستجوی فیدرها دقیقاً در محدوده همان شرکت
      const feeders = await tx.feeder.findMany({
        where: {
          companyId,
          code: { in: feederCodes },
        },
        select: { id: true, code: true },
      });

      const map = new Map(feeders.map((f) => [f.code, f.id]));

      // بررسی فیدرهایی که در این شرکت وجود ندارند
      const missing = feederCodes.filter((c) => !map.has(c));
      if (missing.length) {
        throw Object.assign(
          new Error(
            `این فیدرها در شرکت جاری ثبت نشده‌اند: ${missing.join(", ")}`,
          ),
          { status: 400 },
        );
      }

      // ۳. ثبت روابط
      await tx.feederRelation.createMany({
        data: relations.map((r) => {
          const baseCode = (r.baseFeederCode || r.aFeederCode)!;
          const relatedCode = (r.relatedFeederCode || r.bFeederCode)!;
          return {
            datasetId: dataset.id,
            baseFeederId: map.get(baseCode)!,
            relatedFeederId: map.get(relatedCode)!,
            relationType: r.relationType,
          };
        }),
        skipDuplicates: true,
      });

      return dataset;
    });
  }
}
