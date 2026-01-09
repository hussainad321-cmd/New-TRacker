import { pgTable, text, serial, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Yarn Coming In
export const yarnBatches = pgTable("yarn_batches", {
  id: serial("id").primaryKey(),
  batchCode: text("batch_code").notNull().unique(), // e.g., YRN-001
  color: text("color").notNull(),
  weightKg: real("weight_kg").notNull(),
  supplier: text("supplier"),
  receivedAt: timestamp("received_at").defaultNow(),
});

// 2. Knitting (Yarn -> Fabric)
export const knittingJobs = pgTable("knitting_jobs", {
  id: serial("id").primaryKey(),
  yarnBatchId: integer("yarn_batch_id").references(() => yarnBatches.id),
  fabricType: text("fabric_type").notNull(), // e.g., Jersey, Fleece
  size: text("size").notNull().default("Mixed"), // Added size
  weightUsed: real("weight_used").notNull(),
  fabricProduced: real("fabric_produced").notNull(), // output weight
  status: text("status").default("completed"),
  completedAt: timestamp("completed_at").defaultNow(),
});

// 3. Cutting (Fabric -> Pieces)
export const cuttingJobs = pgTable("cutting_jobs", {
  id: serial("id").primaryKey(),
  knittingJobId: integer("knitting_job_id").references(() => knittingJobs.id),
  styleCode: text("style_code").notNull(), // e.g., SHIRT-V-NECK
  size: text("size").notNull(), // Added size
  quantityPieces: integer("quantity_pieces").notNull(),
  wasteKg: real("waste_kg").default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});

// 4. Stitching
export const stitchingJobs = pgTable("stitching_jobs", {
  id: serial("id").primaryKey(),
  cuttingJobId: integer("cutting_job_id").references(() => cuttingJobs.id),
  size: text("size").notNull(), // Added size
  quantityStitched: integer("quantity_stitched").notNull(),
  rejectedCount: integer("rejected_count").default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});

// 5. Pressing
export const pressingJobs = pgTable("pressing_jobs", {
  id: serial("id").primaryKey(),
  stitchingJobId: integer("stitching_job_id").references(() => stitchingJobs.id),
  size: text("size").notNull(), // Added size
  quantityPressed: integer("quantity_pressed").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// 6. Packing
export const packingJobs = pgTable("packing_jobs", {
  id: serial("id").primaryKey(),
  pressingJobId: integer("pressing_job_id").references(() => pressingJobs.id),
  size: text("size").notNull(), // Added size
  boxCount: integer("box_count").notNull(),
  quantityPacked: integer("quantity_packed").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Schemas
export const insertYarnBatchSchema = createInsertSchema(yarnBatches).omit({ id: true, receivedAt: true });
export const insertKnittingJobSchema = createInsertSchema(knittingJobs).omit({ id: true, completedAt: true });
export const insertCuttingJobSchema = createInsertSchema(cuttingJobs).omit({ id: true, completedAt: true });
export const insertStitchingJobSchema = createInsertSchema(stitchingJobs).omit({ id: true, completedAt: true });
export const insertPressingJobSchema = createInsertSchema(pressingJobs).omit({ id: true, completedAt: true });
export const insertPackingJobSchema = createInsertSchema(packingJobs).omit({ id: true, completedAt: true });

// Types
export type YarnBatch = typeof yarnBatches.$inferSelect;
export type KnittingJob = typeof knittingJobs.$inferSelect;
export type CuttingJob = typeof cuttingJobs.$inferSelect;
export type StitchingJob = typeof stitchingJobs.$inferSelect;
export type PressingJob = typeof pressingJobs.$inferSelect;
export type PackingJob = typeof packingJobs.$inferSelect;

export type InsertYarnBatch = z.infer<typeof insertYarnBatchSchema>;
export type InsertKnittingJob = z.infer<typeof insertKnittingJobSchema>;
export type InsertCuttingJob = z.infer<typeof insertCuttingJobSchema>;
export type InsertStitchingJob = z.infer<typeof insertStitchingJobSchema>;
export type InsertPressingJob = z.infer<typeof insertPressingJobSchema>;
export type InsertPackingJob = z.infer<typeof insertPackingJobSchema>;
