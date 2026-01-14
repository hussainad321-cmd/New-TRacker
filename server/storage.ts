import { 
  yarnBatches, knittingJobs, cuttingJobs, stitchingJobs, pressingJobs, packingJobs,
  type YarnBatch, type InsertYarnBatch,
  type KnittingJob, type InsertKnittingJob,
  type CuttingJob, type InsertCuttingJob,
  type StitchingJob, type InsertStitchingJob,
  type PressingJob, type InsertPressingJob,
  type PackingJob, type InsertPackingJob
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface DashboardStats {
  totalYarnKg: number;
  totalFabricKg: number;
  totalCutPieces: number;
  totalStitchedPieces: number;
  totalPackedPieces: number;
}

export interface IStorage {
  // Yarn
  getYarnBatches(): Promise<YarnBatch[]>;
  getYarnBatch(id: number): Promise<YarnBatch | undefined>;
  createYarnBatch(yarn: InsertYarnBatch): Promise<YarnBatch>;
  deleteYarnBatch(id: number): Promise<void>;

  // Knitting
  getKnittingJobs(): Promise<KnittingJob[]>;
  createKnittingJob(job: InsertKnittingJob): Promise<KnittingJob>;

  // Cutting
  getCuttingJobs(): Promise<CuttingJob[]>;
  createCuttingJob(job: InsertCuttingJob): Promise<CuttingJob>;

  // Stitching
  getStitchingJobs(): Promise<StitchingJob[]>;
  createStitchingJob(job: InsertStitchingJob): Promise<StitchingJob>;

  // Pressing
  getPressingJobs(): Promise<PressingJob[]>;
  createPressingJob(job: InsertPressingJob): Promise<PressingJob>;

  // Packing
  getPackingJobs(): Promise<PackingJob[]>;
  createPackingJob(job: InsertPackingJob): Promise<PackingJob>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  async getYarnBatches(): Promise<YarnBatch[]> {
    return await db.select().from(yarnBatches).orderBy(yarnBatches.receivedAt);
  }

  async getYarnBatch(id: number): Promise<YarnBatch | undefined> {
    const [batch] = await db.select().from(yarnBatches).where(eq(yarnBatches.id, id));
    return batch;
  }

  async createYarnBatch(insertYarn: InsertYarnBatch): Promise<YarnBatch> {
    const [yarn] = await db.insert(yarnBatches).values(insertYarn).returning();
    return yarn;
  }

  async deleteYarnBatch(id: number): Promise<void> {
    await db.delete(yarnBatches).where(eq(yarnBatches.id, id));
  }

  async getKnittingJobs(): Promise<KnittingJob[]> {
    return await db.select().from(knittingJobs).orderBy(knittingJobs.completedAt);
  }

  async createKnittingJob(insertJob: InsertKnittingJob): Promise<KnittingJob> {
    const [job] = await db.insert(knittingJobs).values(insertJob).returning();
    return job;
  }

  async getCuttingJobs(): Promise<CuttingJob[]> {
    return await db.select().from(cuttingJobs).orderBy(cuttingJobs.completedAt);
  }

  async createCuttingJob(insertJob: InsertCuttingJob): Promise<CuttingJob> {
    const [job] = await db.insert(cuttingJobs).values(insertJob).returning();
    return job;
  }

  async getStitchingJobs(): Promise<StitchingJob[]> {
    return await db.select().from(stitchingJobs).orderBy(stitchingJobs.completedAt);
  }

  async createStitchingJob(insertJob: InsertStitchingJob): Promise<StitchingJob> {
    const [job] = await db.insert(stitchingJobs).values(insertJob).returning();
    return job;
  }

  async getPressingJobs(): Promise<PressingJob[]> {
    return await db.select().from(pressingJobs).orderBy(pressingJobs.completedAt);
  }

  async createPressingJob(insertJob: InsertPressingJob): Promise<PressingJob> {
    const [job] = await db.insert(pressingJobs).values(insertJob).returning();
    return job;
  }

  async getPackingJobs(): Promise<PackingJob[]> {
    return await db.select().from(packingJobs).orderBy(packingJobs.completedAt);
  }

  async createPackingJob(insertJob: InsertPackingJob): Promise<PackingJob> {
    const [job] = await db.insert(packingJobs).values(insertJob).returning();
    return job;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    // Basic aggregation
    const [yarn] = await db.select({ total: sql<number>`sum(${yarnBatches.weightKg})` }).from(yarnBatches);
    const [fabric] = await db.select({ total: sql<number>`sum(${knittingJobs.fabricProduced})` }).from(knittingJobs);
    const [cut] = await db.select({ total: sql<number>`sum(${cuttingJobs.quantityPieces})` }).from(cuttingJobs);
    const [stitched] = await db.select({ total: sql<number>`sum(${stitchingJobs.quantityStitched})` }).from(stitchingJobs);
    const [packed] = await db.select({ total: sql<number>`sum(${packingJobs.quantityPacked})` }).from(packingJobs);

    return {
      totalYarnKg: Number(yarn?.total || 0),
      totalFabricKg: Number(fabric?.total || 0),
      totalCutPieces: Number(cut?.total || 0),
      totalStitchedPieces: Number(stitched?.total || 0),
      totalPackedPieces: Number(packed?.total || 0),
    };
  }
}

export const storage = new DatabaseStorage();
