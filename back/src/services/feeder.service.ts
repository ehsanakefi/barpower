import { Role } from "@prisma/client";
import { prisma } from "../database/prisma";

export class FeederService {
  static async getAll(user: { role: Role; companyId: string | null }) {
    const where: any = {};
    if (user.role !== Role.SUPER_ADMIN) {
      where.companyId = user.companyId;
    }
    return prisma.feeder.findMany({ where });
  }

  static async getById(
    id: string,
    user: { role: Role; companyId: string | null },
  ) {
    const where: any = { id };
    if (user.role !== Role.SUPER_ADMIN) {
      where.companyId = user.companyId;
    }

    const feeder = await prisma.feeder.findFirst({ where });
    if (!feeder) {
      const error: any = new Error(
        "فیدر مورد نظر یافت نشد یا دسترسی مجاز نیست.",
      );
      error.status = 404;
      throw error;
    }
    return feeder;
  }

  static async create(data: {
    code: string;
    name: string;
    substationName?: string;
    companyId: string;
  }) {
    return prisma.feeder.create({ data });
  }

  static async update(
    id: string,
    user: { role: Role; companyId: string | null },
    data: any,
  ) {
    const where: any = { id };
    if (user.role !== Role.SUPER_ADMIN) {
      where.companyId = user.companyId;
    }

    const existingFeeder = await prisma.feeder.findFirst({ where });
    if (!existingFeeder) {
      const error: any = new Error(
        "فیدر مورد نظر یافت نشد یا دسترسی مجاز نیست.",
      );
      error.status = 404;
      throw error;
    }

    return prisma.feeder.update({
      where: { id },
      data,
    });
  }

  static async delete(
    id: string,
    user: { role: Role; companyId: string | null },
  ) {
    const where: any = { id };
    if (user.role !== Role.SUPER_ADMIN) {
      where.companyId = user.companyId;
    }

    const existingFeeder = await prisma.feeder.findFirst({ where });
    if (!existingFeeder) {
      const error: any = new Error(
        "فیدر مورد نظر یافت نشد یا دسترسی مجاز نیست.",
      );
      error.status = 404;
      throw error;
    }

    return prisma.feeder.delete({
      where: { id },
    });
  }
}
