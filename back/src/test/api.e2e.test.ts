import request from "supertest";
import app from "../app";
import { prisma } from "../database/prisma";

// هلپر برای استخراج دیتای واقعی چه در wrapper باشد چه مستقیم
const extractData = (res: any) => {
  if (res.body && res.body.data !== undefined) {
    return res.body.data;
  }
  return res.body;
};

describe("API E2E", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ---------------- Feeders ----------------
  it("GET /api/feeders returns list", async () => {
    const res = await request(app).get("/api/feeders");
    expect(res.status).toBe(200);
    const data = extractData(res);
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((x: any) => x.code === "F-001")).toBe(true);
  });

  it("GET /api/feeders/:id returns feeder", async () => {
    const listRes = await request(app).get("/api/feeders");
    const list = extractData(listRes);
    const f1 = list.find((x: any) => x.code === "F-001");
    expect(f1).toBeDefined();

    const res = await request(app).get(`/api/feeders/${f1.id}`);
    expect(res.status).toBe(200);
    const item = extractData(res);
    expect(item.code).toBe("F-001");
  });

  it("POST /api/feeders creates feeder", async () => {
    const uniqueCode = `F-${Date.now().toString().slice(-4)}`;
    const res = await request(app)
      .post("/api/feeders")
      .send({ code: uniqueCode, name: "Feeder Dynamic", substationName: "S2" })
      .set("Content-Type", "application/json");

    expect([200, 201]).toContain(res.status);
    const item = extractData(res);
    expect(item.code).toBe(uniqueCode);
  });

  // ---------------- Datasets ----------------
  it("GET /api/datasets returns datasets", async () => {
    const res = await request(app).get("/api/datasets");
    expect(res.status).toBe(200);
    const data = extractData(res);
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((d: any) => d.type === "LOAD")).toBe(true);
  });

  it("GET /api/datasets/load-records returns records", async () => {
    const res = await request(app).get("/api/datasets/load-records");
    expect(res.status).toBe(200);
    const data = extractData(res);
    expect(Array.isArray(data)).toBe(true);
  });

  // ---------------- Temporal Constraints ----------------
  it("GET /api/temporal-constraints returns list", async () => {
    const res = await request(app).get("/api/temporal-constraints");
    expect(res.status).toBe(200);
    const data = extractData(res);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST /api/temporal-constraints/batch creates constraints dataset", async () => {
    const payload = {
      datasetName: "tc-2", // اصلاح نام فیلد به جای name
      description: "Batch constraints test",
      constraints: [
        {
          feederCode: "F-001",
          date: new Date().toISOString(),
          constraintCode: 1, // تغییر به عدد
          description: "Planned maintenance",
        },
      ],
    };

    const res = await request(app)
      .post("/api/temporal-constraints/batch")
      .send(payload)
      .set("Content-Type", "application/json");

    // if (res.status === 400) console.log("CONSTRAINT BATCH 400:", res.body);
    // console.error(">>> TEMPORAL ERROR:", JSON.stringify(res.body, null, 2));
    expect([200, 201]).toContain(res.status);
    const item = extractData(res);
    expect(item.name).toBe("tc-2");
  });
  // ---------------- Feeder Relations ----------------
  it("GET /api/feeder-relations returns list", async () => {
    const res = await request(app).get("/api/feeder-relations");
    expect(res.status).toBe(200);
    const data = extractData(res);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST /api/feeder-relations/batch creates relations dataset", async () => {
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
      .send(payload)
      .set("Content-Type", "application/json");
    // console.error(">>> RELATIONS ERROR:", JSON.stringify(res.body, null, 2));
    expect([200, 201]).toContain(res.status);
    const item = extractData(res);
    expect(item.name).toBe("rel-test-dataset");
  });

  // ---------------- Schedules ----------------
  it("GET /api/schedules/runs returns list", async () => {
    const res = await request(app).get("/api/schedules/runs");
    expect(res.status).toBe(200);
    const data = extractData(res);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST /api/schedules/run triggers run", async () => {
    const res = await request(app)
      .post("/api/schedules/run")
      .send({
        weekStartDate: new Date().toISOString(), // افزودن تاریخ شروع هفته
      })
      .set("Content-Type", "application/json");
    // console.error(">>> SCHEDULE RUN ERROR:", JSON.stringify(res.body, null, 2));
    expect([200, 201, 202]).toContain(res.status);
  });
});
