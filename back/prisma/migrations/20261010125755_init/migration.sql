-- CreateEnum
CREATE TYPE "DatasetType" AS ENUM ('LOAD', 'TEMPORAL_CONSTRAINTS', 'FEEDER_RELATIONS');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('SIMULTANEOUS', 'NON_SIMULTANEOUS');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('READY', 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'INFEASIBLE');

-- CreateTable
CREATE TABLE "feeders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "substationName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feeders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datasets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DatasetType" NOT NULL,
    "fileName" TEXT,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "load_records" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "operatorName" TEXT,
    "stationType" TEXT,
    "stationPgdsCode" TEXT NOT NULL,
    "equipmentType" TEXT,
    "equipment" TEXT,
    "equipmentPgdsCode" TEXT,
    "energyType" TEXT,
    "date" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "h1" DOUBLE PRECISION,
    "h2" DOUBLE PRECISION,
    "h3" DOUBLE PRECISION,
    "h4" DOUBLE PRECISION,
    "h5" DOUBLE PRECISION,
    "h6" DOUBLE PRECISION,
    "h7" DOUBLE PRECISION,
    "h8" DOUBLE PRECISION,
    "h9" DOUBLE PRECISION,
    "h10" DOUBLE PRECISION,
    "h11" DOUBLE PRECISION,
    "h12" DOUBLE PRECISION,
    "h13" DOUBLE PRECISION,
    "h14" DOUBLE PRECISION,
    "h15" DOUBLE PRECISION,
    "h16" DOUBLE PRECISION,
    "h17" DOUBLE PRECISION,
    "h18" DOUBLE PRECISION,
    "h19" DOUBLE PRECISION,
    "h20" DOUBLE PRECISION,
    "h21" DOUBLE PRECISION,
    "h22" DOUBLE PRECISION,
    "h23" DOUBLE PRECISION,
    "h24" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "load_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temporal_constraints" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT,
    "feederId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "constraintCode" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temporal_constraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feeder_relations" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT,
    "baseFeederId" TEXT NOT NULL,
    "relatedFeederId" TEXT NOT NULL,
    "relationType" "RelationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feeder_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_runs" (
    "id" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'READY',
    "weekStartDate" TEXT NOT NULL,
    "errorMessage" TEXT,
    "loadDatasetId" TEXT,
    "temporalDatasetId" TEXT,
    "relationsDatasetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outage_events" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "feederId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "weekday" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outage_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feeders_code_key" ON "feeders"("code");

-- CreateIndex
CREATE INDEX "load_records_datasetId_idx" ON "load_records"("datasetId");

-- CreateIndex
CREATE INDEX "load_records_date_idx" ON "load_records"("date");

-- CreateIndex
CREATE INDEX "load_records_stationPgdsCode_idx" ON "load_records"("stationPgdsCode");

-- CreateIndex
CREATE INDEX "temporal_constraints_feederId_date_idx" ON "temporal_constraints"("feederId", "date");

-- CreateIndex
CREATE INDEX "temporal_constraints_datasetId_idx" ON "temporal_constraints"("datasetId");

-- CreateIndex
CREATE UNIQUE INDEX "feeder_relations_baseFeederId_relatedFeederId_datasetId_key" ON "feeder_relations"("baseFeederId", "relatedFeederId", "datasetId");

-- CreateIndex
CREATE INDEX "outage_events_runId_idx" ON "outage_events"("runId");

-- CreateIndex
CREATE INDEX "outage_events_feederId_idx" ON "outage_events"("feederId");

-- AddForeignKey
ALTER TABLE "load_records" ADD CONSTRAINT "load_records_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temporal_constraints" ADD CONSTRAINT "temporal_constraints_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temporal_constraints" ADD CONSTRAINT "temporal_constraints_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeder_relations" ADD CONSTRAINT "feeder_relations_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeder_relations" ADD CONSTRAINT "feeder_relations_baseFeederId_fkey" FOREIGN KEY ("baseFeederId") REFERENCES "feeders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeder_relations" ADD CONSTRAINT "feeder_relations_relatedFeederId_fkey" FOREIGN KEY ("relatedFeederId") REFERENCES "feeders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_runs" ADD CONSTRAINT "schedule_runs_loadDatasetId_fkey" FOREIGN KEY ("loadDatasetId") REFERENCES "datasets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_runs" ADD CONSTRAINT "schedule_runs_temporalDatasetId_fkey" FOREIGN KEY ("temporalDatasetId") REFERENCES "datasets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_runs" ADD CONSTRAINT "schedule_runs_relationsDatasetId_fkey" FOREIGN KEY ("relationsDatasetId") REFERENCES "datasets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_events" ADD CONSTRAINT "outage_events_runId_fkey" FOREIGN KEY ("runId") REFERENCES "schedule_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_events" ADD CONSTRAINT "outage_events_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
