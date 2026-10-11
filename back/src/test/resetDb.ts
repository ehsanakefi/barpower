import { prisma } from "../database/prisma";

export async function resetDb() {
  // پاکسازی تمامی جداول با حفظ ساختار و رعایت کلیدهای خارجی
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "outage_events",
      "schedule_runs",
      "feeder_relations",
      "temporal_constraints",
      "load_records",
      "datasets",
      "feeders"
    RESTART IDENTITY CASCADE;
  `);
}
