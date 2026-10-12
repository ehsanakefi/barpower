import request from "supertest";
import app from "../app";
import { prisma } from "../database/prisma";
import { AuthService } from "../services/auth.service";
import { Role } from "@prisma/client";

// هلپر استخراج داده از ساختار پروژه
const extractData = (res: any) => {
  if (res.body && res.body.data !== undefined) {
    return res.body.data;
  }
  return res.body;
};

describe("API E2E Tests with Auth & RBAC", () => {
  let adminToken: string;
  let userToken: string;

  const authAdmin = () => ({
    Authorization: `Bearer ${adminToken}`,
  });

  const authUser = () => ({
    Authorization: `Bearer ${userToken}`,
  });

  beforeAll(async () => {
    // ۱. پاکسازی امن بر اساس روابط Prisma
    // پاکسازی وابسته‌ها ابتدا، سپس والدها
    await prisma.scheduleRun.deleteMany({});
    await prisma.feederRelation.deleteMany({});
    await prisma.temporalConstraint.deleteMany({});
    await prisma.loadRecord.deleteMany({});
    await prisma.dataset.deleteMany({});
    await prisma.feeder.deleteMany({});
    await prisma.user.deleteMany({});

    // ۲. ایجاد یوزر ادمین و دریافت توکن
    const adminRes = await AuthService.register({
      username: "test_admin",
      password: "Password123!",
      fullName: "Test Admin",
      role: Role.ADMIN,
    });
    adminToken = adminRes.token;

    // ۳. ایجاد یوزر عادی و دریافت توکن
    const userRes = await AuthService.register({
      username: "test_user",
      password: "Password123!",
      fullName: "Test User",
      role: Role.USER,
    });
    userToken = userRes.token;

    // ۴. ایجاد فیدرهای پایه
    await prisma.feeder.createMany({
      data: [
        { code: "F-001", name: "Feeder 1", substationName: "Sub 1" },
        { code: "F-002", name: "Feeder 2", substationName: "Sub 1" },
      ],
    });

    // ۵. ایجاد دیتاست پایه
    await prisma.dataset.create({
      data: {
        name: "Initial Load Dataset",
        type: "LOAD",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ==========================================
  // ۱. تست‌های احراز هویت (Auth)
  // ==========================================
  describe("Authentication", () => {
    it("POST /api/auth/register - ثبت‌نام کاربر جدید با نقش USER", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "new_operator",
        password: "password123",
        fullName: "Operator User",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("USER");
      expect(res.body.data.token).toBeDefined();
    });

    it("POST /api/auth/login - ورود با مشخصات معتبر", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "test_admin",
        password: "Password123!",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it("GET /api/auth/me - دریافت مشخصات با توکن", async () => {
      const res = await request(app).get("/api/auth/me").set(authAdmin());

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe("test_admin");
      expect(res.body.data.role).toBe("ADMIN");
    });

    it("GET /api/auth/me - خطای 401 بدون توکن", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });

  // ==========================================
  // ۲. تست فیدرها و کنترل سطح دسترسی (RBAC)
  // ==========================================
  describe("Feeders & RBAC", () => {
    it("POST /api/feeders - رد دسترسی برای کاربر عادی (403 Forbidden)", async () => {
      const res = await request(app).post("/api/feeders").set(authUser()).send({
        code: "F-DENIED",
        name: "Denied Feeder",
        substationName: "S1",
      });

      expect(res.status).toBe(403);
    });

    it("GET /api/feeders - دریافت لیست توسط ادمین یا کاربر عادی", async () => {
      const res = await request(app).get("/api/feeders").set(authUser());

      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(Array.isArray(data)).toBe(true);
      expect(data.some((x: any) => x.code === "F-001")).toBe(true);
    });

    it("GET /api/feeders/:id - دریافت فیدر با شناسه", async () => {
      const listRes = await request(app).get("/api/feeders").set(authAdmin());
      const list = extractData(listRes);
      const f1 = list.find((x: any) => x.code === "F-001");
      expect(f1).toBeDefined();

      const res = await request(app)
        .get(`/api/feeders/${f1.id}`)
        .set(authAdmin());

      expect(res.status).toBe(200);
      const item = extractData(res);
      expect(item.code).toBe("F-001");
    });

    it("POST /api/feeders - ایجاد فیدر توسط ADMIN", async () => {
      const uniqueCode = `F-${Date.now().toString().slice(-4)}`;
      const res = await request(app)
        .post("/api/feeders")
        .set(authAdmin())
        .send({
          code: uniqueCode,
          name: "Feeder Dynamic",
          substationName: "S2",
        });

      expect([200, 201]).toContain(res.status);
      const item = extractData(res);
      expect(item.code).toBe(uniqueCode);
    });
  });

  // ==========================================
  // ۳. تست Datasets
  // ==========================================
  describe("Datasets", () => {
    it("GET /api/datasets - دریافت لیست دیتاست‌ها", async () => {
      const res = await request(app).get("/api/datasets").set(authAdmin());

      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(Array.isArray(data)).toBe(true);
      expect(data.some((d: any) => d.type === "LOAD")).toBe(true);
    });

    it("GET /api/datasets/load-records - دریافت رکوردهای بار", async () => {
      const res = await request(app)
        .get("/api/datasets/load-records")
        .set(authAdmin());

      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  // ==========================================
  // ۴. محدودیت‌های زمانی (Temporal Constraints)
  // ==========================================
  describe("Temporal Constraints", () => {
    it("GET /api/temporal-constraints - دریافت لیست محدودیت‌ها", async () => {
      const res = await request(app)
        .get("/api/temporal-constraints")
        .set(authAdmin());

      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(Array.isArray(data)).toBe(true);
    });

    it("POST /api/temporal-constraints/batch - ایجاد دسته‌ای محدودیت‌ها", async () => {
      const payload = {
        datasetName: "tc-2",
        description: "Batch constraints test",
        constraints: [
          {
            feederCode: "F-001",
            date: new Date().toISOString(),
            constraintCode: 1,
            description: "Planned maintenance",
          },
        ],
      };

      const res = await request(app)
        .post("/api/temporal-constraints/batch")
        .set(authAdmin())
        .send(payload);

      expect([200, 201]).toContain(res.status);
      const item = extractData(res);
      expect(item.name).toBe("tc-2");
    });
  });

  // ==========================================
  // ۵. روابط فیدرها (Feeder Relations)
  // ==========================================
  describe("Feeder Relations", () => {
    it("GET /api/feeder-relations - دریافت لیست روابط", async () => {
      const res = await request(app)
        .get("/api/feeder-relations")
        .set(authAdmin());

      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(Array.isArray(data)).toBe(true);
    });

    it("POST /api/feeder-relations/batch - ایجاد دسته‌ای روابط", async () => {
      const payload = {
        datasetName: "rel-test-dataset",
        description: "Relations test dataset",
        relations: [
          {
            baseFeederCode: "F-001",
            relatedFeederCode: "F-002",
            relationType: "SIMULTANEOUS",
          },
        ],
      };

      const res = await request(app)
        .post("/api/feeder-relations/batch")
        .set(authAdmin())
        .send(payload);

      expect([200, 201]).toContain(res.status);
      const item = extractData(res);
      expect(item.name).toBe("rel-test-dataset");
    });
  });

  // ==========================================
  // ۶. زمان‌بندی (Schedules)
  // ==========================================
  describe("Schedules", () => {
    it("GET /api/schedules/runs - دریافت لیست اجراها", async () => {
      const res = await request(app)
        .get("/api/schedules/runs")
        .set(authAdmin());

      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(Array.isArray(data)).toBe(true);
    });

    it("POST /api/schedules/run - اجرای الگوریتم زمان‌بندی", async () => {
      const res = await request(app)
        .post("/api/schedules/run")
        .set(authAdmin())
        .send({
          weekStartDate: new Date().toISOString(),
        });

      expect([200, 201, 202]).toContain(res.status);
    });
  });
});
