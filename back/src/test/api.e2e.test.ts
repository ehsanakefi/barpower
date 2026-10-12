import request from "supertest";
import app from "../app";
import { prisma } from "../database/prisma";
import { AuthService } from "../services/auth.service";
import { Role, DatasetType, RelationType, RunStatus } from "@prisma/client";

// هلپر استخراج داده از ساختار پروژه
const extractData = (res: any) => {
  if (res.body && res.body.data !== undefined) {
    return res.body.data;
  }
  return res.body;
};

describe("API E2E Tests - Complete Suite", () => {
  let companyAId: string;
  let companyBId: string;

  let feeder1Id: string;
  let feeder2Id: string;
  let datasetLoadId: string;
  let scheduleRunId: string;

  let superAdminToken: string;
  let userToken: string;
  let user2Token: string;

  const authSuperAdmin = () => ({
    Authorization: `Bearer ${superAdminToken}`,
  });

  const authUser = () => ({
    Authorization: `Bearer ${userToken}`,
  });

  const authUser2 = () => ({
    Authorization: `Bearer ${user2Token}`,
  });

  beforeAll(async () => {
    // ۱. پاکسازی عمیق دیتابیس با رعایت قیود کلید خارجی
    await prisma.outageEvent.deleteMany({});
    await prisma.scheduleRun.deleteMany({});
    await prisma.feederRelation.deleteMany({});
    await prisma.temporalConstraint.deleteMany({});
    await prisma.loadRecord.deleteMany({});
    await prisma.dataset.deleteMany({});
    await prisma.feeder.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});

    // ۲. ایجاد شرکت‌های نمونه
    const companyA = await prisma.company.create({
      data: {
        code: "EPDC_HAMEDAN",
        name: "توزیع برق استان همدان",
        province: "همدان",
        isActive: true,
      },
    });
    companyAId = companyA.id;

    const companyB = await prisma.company.create({
      data: {
        code: "EPDC_MARKAZI",
        name: "توزیع برق استان مرکزی",
        province: "مرکزی",
        isActive: true,
      },
    });
    companyBId = companyB.id;

    // ۳. ایجاد کاربر SUPER_ADMIN
    const adminRes = await AuthService.register({
      username: "admin_root",
      password: "Password123!",
      fullName: "Super Admin",
      role: Role.SUPER_ADMIN,
      companyId: null,
    });
    superAdminToken = adminRes.token;

    // ۴. ایجاد کاربر عادی شرکت الف
    const user1Res = await AuthService.register({
      username: "hamedan_op",
      password: "Password123!",
      fullName: "Hamedan Operator",
      role: Role.USER,
      companyId: companyAId,
    });
    userToken = user1Res.token;

    // ۵. ایجاد کاربر عادی شرکت ب (برای تست ایزولاسیون و عدم نشت داده)
    const user2Res = await AuthService.register({
      username: "markazi_op",
      password: "Password123!",
      fullName: "Markazi Operator",
      role: Role.USER,
      companyId: companyBId,
    });
    user2Token = user2Res.token;

    // ۶. فیدرهای پیش‌فرض شرکت الف
    const f1 = await prisma.feeder.create({
      data: {
        code: "F-101",
        name: "فیدر بوعلی",
        substationName: "پست مرکز",
        companyId: companyAId,
      },
    });
    feeder1Id = f1.id;

    const f2 = await prisma.feeder.create({
      data: {
        code: "F-102",
        name: "فیدر مهدیه",
        substationName: "پست مرکز",
        companyId: companyAId,
      },
    });
    feeder2Id = f2.id;

    // فیدر هم‌کد در شرکت دوم (بررسی @@unique([companyId, code]))
    await prisma.feeder.create({
      data: {
        code: "F-101",
        name: "فیدر بوعلی اراک",
        substationName: "پست اراک",
        companyId: companyBId,
      },
    });

    // ۷. دیتاست پیش‌فرض برای شرکت الف
    const ds = await prisma.dataset.create({
      data: {
        name: "دیتاست اولیه بار",
        type: DatasetType.LOAD,
        companyId: companyAId,
      },
    });
    datasetLoadId = ds.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ===================================================
  // 1. شرکت‌ها (Companies - فقط SUPER_ADMIN)
  // ===================================================
  describe("1. Company Endpoints", () => {
    let createdCompId: string;

    it("GET /api/companies - رد دسترسی برای کاربر عادی (403)", async () => {
      const res = await request(app).get("/api/companies").set(authUser());
      expect([401, 403]).toContain(res.status);
    });

    it("GET /api/companies - دریافت لیست همه شرکت‌ها توسط SUPER_ADMIN", async () => {
      const res = await request(app)
        .get("/api/companies")
        .set(authSuperAdmin());
      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(2);
    });

    it("POST /api/companies - ایجاد شرکت جدید", async () => {
      const res = await request(app)
        .post("/api/companies")
        .set(authSuperAdmin())
        .send({
          code: "EPDC_TEHRAN",
          name: "شرکت توزیع نیروی برق تهران بزرگ",
          province: "تهران",
        });

      expect([200, 201]).toContain(res.status);
      const item = extractData(res);
      createdCompId = item.id;
      expect(item.code).toBe("EPDC_TEHRAN");
    });

    it("GET /api/companies/:id - دریافت اطلاعات شرکت با ID", async () => {
      const res = await request(app)
        .get(`/api/companies/${createdCompId}`)
        .set(authSuperAdmin());
      expect(res.status).toBe(200);
      const item = extractData(res);
      expect(item.id).toBe(createdCompId);
    });

    it("PUT /api/companies/:id - بروزرسانی نام شرکت", async () => {
      const res = await request(app)
        .put(`/api/companies/${createdCompId}`)
        .set(authSuperAdmin())
        .send({
          name: "شرکت توزیع تهران - ویرایش شده",
        });
      expect(res.status).toBe(200);
      const item = extractData(res);
      expect(item.name).toBe("شرکت توزیع تهران - ویرایش شده");
    });

    it("PATCH /api/companies/:id/disable - غیرفعال‌سازی نرم شرکت", async () => {
      const res = await request(app)
        .patch(`/api/companies/${createdCompId}/disable`)
        .set(authSuperAdmin());
      expect([200, 204]).toContain(res.status);
    });

    it("PATCH /api/companies/:id/enable - فعال‌سازی مجدد شرکت", async () => {
      const res = await request(app)
        .patch(`/api/companies/${createdCompId}/enable`)
        .set(authSuperAdmin());
      expect([200, 204]).toContain(res.status);
    });
  });

  // ===================================================
  // 2. احراز هویت (Auth)
  // ===================================================
  describe("2. Authentication Endpoints", () => {
    it("POST /api/auth/login - ورود با نام کاربری و کلمه عبور صحیح", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "hamedan_op",
        password: "Password123!",
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it("POST /api/auth/login - ورود با کلمه عبور اشتباه (400 یا 401)", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "hamedan_op",
        password: "wrong_password",
      });
      expect([400, 401]).toContain(res.status);
    });

    it("GET /api/auth/me - دریافت مشخصات پروفایل توکن فعال", async () => {
      const res = await request(app).get("/api/auth/me").set(authUser());
      expect(res.status).toBe(200);
      const user = extractData(res);
      expect(user.username).toBe("hamedan_op");
      expect(user.companyId).toBe(companyAId);
    });

    it("GET /api/auth/me - خطای 401 در صورت عدم ارسال Header توکن", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("POST /api/auth/register - ثبت نام کاربر با شرکت توسط SUPER_ADMIN", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .set(authSuperAdmin())
        .send({
          username: "dispatcher_1",
          password: "Password123!",
          fullName: "دیسپاچر همدان",
          role: Role.USER,
          companyId: companyAId,
        });
      expect(res.status).toBe(201);
    });
  });

  // ===================================================
  // 3. فیدرها (Feeders & RBAC & Multi-tenancy)
  // ===================================================
  describe("3. Feeder Endpoints", () => {
    let createdFeederId: string;

    it("GET /api/feeders - دریافت لیست فیدرهای اختصاصی شرکت کاربر", async () => {
      const res = await request(app).get("/api/feeders").set(authUser());
      expect(res.status).toBe(200);
      const list = extractData(res);
      expect(Array.isArray(list)).toBe(true);
      // نباید فیدر شرکت دیگر را نشان دهد
      list.forEach((f: any) => {
        expect(f.companyId).toBe(companyAId);
      });
    });

    it("POST /api/feeders - رد ایجاد فیدر توسط USER عادی (403)", async () => {
      const res = await request(app).post("/api/feeders").set(authUser()).send({
        code: "F-FAIL",
        name: "تست غیرمجاز",
      });
      expect(res.status).toBe(403);
    });

    it("POST /api/feeders - ایجاد فیدر جدید توسط SUPER_ADMIN", async () => {
      const res = await request(app)
        .post("/api/feeders")
        .set(authSuperAdmin())
        .send({
          code: "F-103",
          name: "فیدر شیرسنگی",
          substationName: "پست مرکز",
          companyId: companyAId,
        });

      if (res.status >= 400) {
        console.error("Create feeder error:", res.status, res.body);
      }

      expect([200, 201]).toContain(res.status);

      const data = extractData(res);
      createdFeederId = data.id;
      expect(data.code).toBe("F-103");
    });

    it("GET /api/feeders/:id - دریافت تکی فیدر", async () => {
      const res = await request(app)
        .get(`/api/feeders/${feeder1Id}`)
        .set(authUser());
      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(data.code).toBe("F-101");
    });

    it("PUT /api/feeders/:id - ویرایش مشخصات فیدر توسط SUPER_ADMIN", async () => {
      const res = await request(app)
        .put(`/api/feeders/${createdFeederId}`)
        .set(authSuperAdmin())
        .send({
          name: "فیدر شیرسنگی جدید",
          substationName: "پست جدید",
        });
      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(data.name).toBe("فیدر شیرسنگی جدید");
    });

    it("DELETE /api/feeders/:id - حذف فیدر توسط SUPER_ADMIN", async () => {
      const res = await request(app)
        .delete(`/api/feeders/${createdFeederId}`)
        .set(authSuperAdmin());
      expect([200, 204]).toContain(res.status);
    });
  });
  // ===================================================
  // 4. دیتاست‌ها و رکوردهای بار (Datasets & Load Records)
  // ===================================================
  describe("4. Dataset Endpoints", () => {
    let newDatasetId: string;

    it("GET /api/datasets - لیست دیتاست‌های شرکت جاری", async () => {
      const res = await request(app).get("/api/datasets").set(authUser());
      expect(res.status).toBe(200);
      const list = extractData(res);
      expect(Array.isArray(list)).toBe(true);
      list.forEach((d: any) => {
        expect(d.companyId).toBe(companyAId);
      });
    });

    it("POST /api/datasets - ایجاد دیتاست متاداده", async () => {
      const res = await request(app)
        .post("/api/datasets")
        .set(authUser())
        .send({
          name: "مجموعه داده بار تیرماه",
          type: DatasetType.LOAD,
        });

      expect([200, 201]).toContain(res.status);
      const data = extractData(res);
      newDatasetId = data.id;
      expect(data.name).toBe("مجموعه داده بار تیرماه");
    });

    it("GET /api/datasets/:id - دریافت اطلاعات یک دیتاست", async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetLoadId}`)
        .set(authUser());
      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(data.id).toBe(datasetLoadId);
    });

    it("POST /api/datasets/load-records/batch - ثبت دسته‌ای رکوردهای بار ساعتی", async () => {
      const res = await request(app)
        .post("/api/datasets/load-records/batch")
        .set(authUser())
        .send({
          datasetId: datasetLoadId,
          records: [
            {
              stationPgdsCode: "ST_01",
              date: "1403-05-01",
              total: 240.5,
              h1: 10.0,
              h2: 10.5,
              h3: 11.0,
            },
          ],
        });
      expect([200, 201]).toContain(res.status);
    });

    it("GET /api/datasets/load-records - دریافت رکوردهای بار بر اساس فیلتر تاریخ یا دیتاست", async () => {
      const res = await request(app)
        .get(`/api/datasets/load-records?datasetId=${datasetLoadId}`)
        .set(authUser());
      expect(res.status).toBe(200);
      const list = extractData(res);
      expect(Array.isArray(list)).toBe(true);
    });
  });

  // ===================================================
  // 5. محدودیت‌های زمانی (Temporal Constraints)
  // ===================================================
  describe("5. Temporal Constraint Endpoints", () => {
    it("POST /api/temporal-constraints/batch - ایجاد دسته‌ای قیود زمانی با نام فیدر", async () => {
      const res = await request(app)
        .post("/api/temporal-constraints/batch")
        .set(authUser())
        .send({
          datasetName: "قیود زمانی هفته اول",
          constraints: [
            {
              feederCode: "F-101",
              date: "1403-05-01",
              constraintCode: 1,
            },
            {
              feederCode: "F-102",
              date: "1403-05-02",
              constraintCode: 2,
            },
          ],
        });

      expect([200, 201]).toContain(res.status);
      const data = extractData(res);
      expect(data.name).toBe("قیود زمانی هفته اول");
    });

    it("GET /api/temporal-constraints - دریافت لیست قیود زمانی شرکت کاربر", async () => {
      const res = await request(app)
        .get("/api/temporal-constraints")
        .set(authUser());
      expect(res.status).toBe(200);
      const list = extractData(res);
      expect(Array.isArray(list)).toBe(true);
    });

    it("عدم نشت: کاربر شرکت دوم نباید قیود زمانی شرکت اول را ببیند", async () => {
      const res = await request(app)
        .get("/api/temporal-constraints")
        .set(authUser2());
      expect(res.status).toBe(200);
      const list = extractData(res);
      expect(list.length).toBe(0);
    });
  });

  // ===================================================
  // 6. روابط فیدرها (Feeder Relations)
  // ===================================================
  describe("6. Feeder Relation Endpoints", () => {
    it("POST /api/feeder-relations/batch - ایجاد دسته‌ای روابط بین فیدرهای شرکت", async () => {
      const res = await request(app)
        .post("/api/feeder-relations/batch")
        .set(authUser())
        .send({
          datasetName: "مجموعه روابط همزمانی فیدرها",
          relations: [
            {
              baseFeederCode: "F-101",
              relatedFeederCode: "F-102",
              relationType: RelationType.SIMULTANEOUS,
            },
          ],
        });

      expect([200, 201]).toContain(res.status);
      const data = extractData(res);
      expect(data.name).toBe("مجموعه روابط همزمانی فیدرها");
    });

    it("GET /api/feeder-relations - دریافت لیست روابط فیدرها", async () => {
      const res = await request(app)
        .get("/api/feeder-relations")
        .set(authUser());
      expect(res.status).toBe(200);
      const list = extractData(res);
      expect(Array.isArray(list)).toBe(true);
    });
  });

  // ===================================================
  // 7. زمان‌بندی و رویدادهای خاموشی (Schedules & Outages)
  // ===================================================
  describe("7. Schedule & Outage Endpoints", () => {
    it("POST /api/schedules/run - ثبت درخواست و اجرای الگوریتم زمان‌بندی", async () => {
      const res = await request(app)
        .post("/api/schedules/run")
        .set(authUser())
        .send({
          weekStartDate: "1403-05-01",
          loadDatasetId: datasetLoadId,
        });

      expect([200, 201, 202]).toContain(res.status);
      const run = extractData(res);
      scheduleRunId = run.id;
      expect(run.weekStartDate).toBe("1403-05-01");
    });

    it("GET /api/schedules/runs - دریافت لیست اجراهای زمان‌بندی", async () => {
      const res = await request(app).get("/api/schedules/runs").set(authUser());
      expect(res.status).toBe(200);
      const list = extractData(res);
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });

    it("GET /api/schedules/runs/:id - دریافت اطلاعات یک اجرای مشخص", async () => {
      const res = await request(app)
        .get(`/api/schedules/runs/${scheduleRunId}`)
        .set(authUser());
      expect(res.status).toBe(200);
      const data = extractData(res);
      expect(data.id).toBe(scheduleRunId);
    });

    it("IDOR Guard: کاربر شرکت دیگر نباید بتواند اجرای زمان‌بندی را مشاهده کند", async () => {
      const res = await request(app)
        .get(`/api/schedules/runs/${scheduleRunId}`)
        .set(authUser2());
      // بر اساس پیاده‌سازی پروژه ۴۰۳ یا ۴۰۴ برای محافظت از داده
      expect([403, 404]).toContain(res.status);
    });

    it("GET /api/schedules/runs/:id/outages - دریافت رویدادهای خاموشی حاصل از یک اجرا", async () => {
      // ایجاد یک رویداد خاموشی نمونه در پایگاه برای تست روت
      await prisma.outageEvent.create({
        data: {
          runId: scheduleRunId,
          feederId: feeder1Id,
          date: "1403-05-01",
          weekday: "شنبه",
          startTime: "11:00",
          endTime: "13:00",
        },
      });

      const res = await request(app)
        .get(`/api/schedules/runs/${scheduleRunId}/outages`)
        .set(authUser());

      expect(res.status).toBe(200);
      const outages = extractData(res);
      expect(Array.isArray(outages)).toBe(true);
      expect(outages.length).toBeGreaterThan(0);
    });
  });
});
