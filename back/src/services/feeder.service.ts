import { prisma } from "../database/prisma";

export class FeederService {
  static async getAll() {
    return prisma.feeder.findMany({
      orderBy: { code: "asc" },
    });
  }

  static async getById(id: string) {
    return prisma.feeder.findUnique({
      where: { id },
    });
  }

  static async create(data: {
    code: string;
    name: string;
    substationName?: string | null;
  }) {
    return prisma.feeder.create({
      data: {
        code: data.code,
        name: data.name,
        substationName: data.substationName ?? null,
      },
    });
  }

  static async update(
    id: string,
    data: {
      name?: string;
      substationName?: string | null;
    },
  ) {
    return prisma.feeder.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.substationName !== undefined && {
          substationName: data.substationName,
        }),
      },
    });
  }

  static async delete(id: string) {
    return prisma.feeder.delete({
      where: { id },
    });
  }
}
