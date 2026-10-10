import { prisma } from "../database/prisma";

export class FeederService {
  static async getAll() {
    return prisma.feeder.findMany({
      orderBy: { name: "asc" },
    });
  }

  static async getById(id: string) {
    return prisma.feeder.findUnique({ where: { id } });
  }

  static async create(data: {
    code: string;
    name: string;
    stationCode?: string | null;
  }) {
    return prisma.feeder.create({
      data: {
        code: data.code,
        name: data.name,
        stationCode: data.stationCode ?? null,
      },
    });
  }

  static async delete(id: string) {
    // اگر در schema روابط onDelete: Cascade گذاشته باشید، خیلی ساده می‌شود
    // در غیر اینصورت باید قبلش رکوردهای وابسته را پاک کنید.
    return prisma.feeder.delete({ where: { id } });
  }
}
