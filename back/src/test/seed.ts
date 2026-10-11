import { prisma } from "../database/prisma";

export async function seedDefaults() {
  // ۱. ایجاد فیدرهای پایه
  const f1 = await prisma.feeder.create({
    data: {
      code: "F-001",
      name: "فیدر شماره یک",
      substationName: "پست شهید بهشتی",
    },
  });

  const f2 = await prisma.feeder.create({
    data: { code: "F-002", name: "فیدر شماره دو", substationName: "پست بعثت" },
  });

  // ۲. ایجاد دیتاست پیش‌فرض بار ساعتی
  const loadDataset = await prisma.dataset.create({
    data: {
      name: "داده بار پیش‌فرض",
      type: "LOAD",
      recordCount: 1,
      loadRecords: {
        create: [
          {
            stationPgdsCode: "ST-101",
            date: "1403/07/01",
            total: 240,
            h1: 10,
            h2: 10,
            h3: 10,
            h4: 10,
            h5: 10,
            h6: 10,
            h7: 10,
            h8: 10,
            h9: 10,
            h10: 10,
            h11: 10,
            h12: 10,
            h13: 10,
            h14: 10,
            h15: 10,
            h16: 10,
            h17: 10,
            h18: 10,
            h19: 10,
            h20: 10,
            h21: 10,
            h22: 10,
            h23: 10,
            h24: 10,
          },
        ],
      },
    },
  });

  // ۳. ایجاد دیتاست قیود زمانی
  const temporalDataset = await prisma.dataset.create({
    data: {
      name: "قیود زمانی پیش‌فرض",
      type: "TEMPORAL_CONSTRAINTS",
      temporalConstraints: {
        create: [
          {
            feederId: f1.id,
            date: "1403/07/01",
            constraintCode: 1,
          },
        ],
      },
    },
  });

  return { f1, f2, loadDataset, temporalDataset };
}
