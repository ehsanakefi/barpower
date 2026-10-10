import { prisma } from "../database/prisma";
import { DatasetType, Prisma } from "@prisma/client";

export class DatasetService {
  static async getAll(type?: DatasetType) {
    return prisma.dataset.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  static async saveLoadDataset(input: {
    name: string;
    fileName?: string | null;
    records: any[];
  }) {
    const { name, fileName, records } = input;

    return prisma.$transaction(async (tx) => {
      // ۱. ساخت مجموعه داده
      const dataset = await tx.dataset.create({
        data: {
          name,
          type: "LOAD",
          fileName: fileName ?? null,
          recordCount: records.length,
        },
      });

      // ۲. آماده‌سازی رکوردهای بار مصرفی
      const loadRecordsData: Prisma.LoadRecordCreateManyInput[] = records.map(
        (r) => ({
          datasetId: dataset.id,
          operatorName: r.operatorName ?? null,
          stationType: r.stationType ?? null,
          stationPgdsCode: r.stationPgdsCode,
          equipmentType: r.equipmentType ?? null,
          equipment: r.equipment ?? null,
          equipmentPgdsCode: r.equipmentPgdsCode ?? null,
          energyType: r.energyType ?? null,
          date: r.date,
          total: Number(r.total) || 0,
          h1: r.h1 != null ? Number(r.h1) : null,
          h2: r.h2 != null ? Number(r.h2) : null,
          h3: r.h3 != null ? Number(r.h3) : null,
          h4: r.h4 != null ? Number(r.h4) : null,
          h5: r.h5 != null ? Number(r.h5) : null,
          h6: r.h6 != null ? Number(r.h6) : null,
          h7: r.h7 != null ? Number(r.h7) : null,
          h8: r.h8 != null ? Number(r.h8) : null,
          h9: r.h9 != null ? Number(r.h9) : null,
          h10: r.h10 != null ? Number(r.h10) : null,
          h11: r.h11 != null ? Number(r.h11) : null,
          h12: r.h12 != null ? Number(r.h12) : null,
          h13: r.h13 != null ? Number(r.h13) : null,
          h14: r.h14 != null ? Number(r.h14) : null,
          h15: r.h15 != null ? Number(r.h15) : null,
          h16: r.h16 != null ? Number(r.h16) : null,
          h17: r.h17 != null ? Number(r.h17) : null,
          h18: r.h18 != null ? Number(r.h18) : null,
          h19: r.h19 != null ? Number(r.h19) : null,
          h20: r.h20 != null ? Number(r.h20) : null,
          h21: r.h21 != null ? Number(r.h21) : null,
          h22: r.h22 != null ? Number(r.h22) : null,
          h23: r.h23 != null ? Number(r.h23) : null,
          h24: r.h24 != null ? Number(r.h24) : null,
        }),
      );

      // درج دسته‌ای (Bulk Insert) در پستگرس
      await tx.loadRecord.createMany({
        data: loadRecordsData,
      });

      return dataset;
    });
  }

  static async getLoadRecords(filters: { datasetId?: string; date?: string }) {
    return prisma.loadRecord.findMany({
      where: {
        datasetId: filters.datasetId,
        date: filters.date,
      },
      orderBy: [{ date: "asc" }, { stationPgdsCode: "asc" }],
    });
  }

  static async deleteDataset(id: string) {
    // به دلیل وجود onDelete: Cascade در Schema، با حذف دیتاست تمام رکوردهای وابسته پاک می‌شوند
    return prisma.dataset.delete({
      where: { id },
    });
  }
}
