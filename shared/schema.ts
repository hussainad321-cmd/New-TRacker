import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 0. Users - Track who is using the system
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  role: text("role").default("user"), // admin, manager, user
  department: text("department"), // e.g., "Knitting", "Dyeing", "Stitching", "Management"
  status: text("status").default("active"), // active, inactive
  createdAt: text("created_at"),
  lastLogin: text("last_login"),
});

// 1. Yarn Coming In
export const yarnBatches = sqliteTable("yarn_batches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  batchCode: text("batch_code").notNull().unique(),
  color: text("color").notNull(),
  weightKg: real("weight_kg").notNull(),
  supplier: text("supplier"),
  receivedAt: text("received_at"),
});

// 2. Knitting (Yarn -> Fabric)
export const knittingJobs = sqliteTable("knitting_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  yarnBatchId: integer("yarn_batch_id").references(() => yarnBatches.id, { onDelete: 'cascade' }),
  fabricType: text("fabric_type").notNull(),
  size: text("size").notNull().default("Mixed"),
  weightUsed: real("weight_used").notNull(),
  fabricProduced: real("fabric_produced").notNull(),
  status: text("status").default("completed"),
  completedAt: text("completed_at"),
});

// 3. Dyeing (Fabric -> Dyed Fabric)
export const dyeingJobs = sqliteTable("dyeing_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  knittingJobId: integer("knitting_job_id").references(() => knittingJobs.id, { onDelete: 'cascade' }),
  weightKgDyed: real("weight_kg_dyed").notNull(),
  rollsPerBatch: integer("rolls_per_batch").notNull(),
  dyeColor: text("dye_color"),
  completedAt: text("completed_at"),
});

// 4. Cutting (Fabric -> Pieces)
export const cuttingJobs = sqliteTable("cutting_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dyeingJobId: integer("dyeing_job_id").references(() => dyeingJobs.id, { onDelete: 'cascade' }),
  styleCode: text("style_code").notNull(),
  size: text("size").notNull(),
  quantityPieces: integer("quantity_pieces").notNull(),
  wasteKg: real("waste_kg").default(0),
  completedAt: text("completed_at"),
});

// 4. Stitching
export const stitchingJobs = sqliteTable("stitching_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cuttingJobId: integer("cutting_job_id").references(() => cuttingJobs.id, { onDelete: 'cascade' }),
  size: text("size").notNull(),
  quantityStitched: integer("quantity_stitched").notNull(),
  rejectedCount: integer("rejected_count").default(0),
  completedAt: text("completed_at"),
});

// 5. Pressing
export const pressingJobs = sqliteTable("pressing_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stitchingJobId: integer("stitching_job_id").references(() => stitchingJobs.id, { onDelete: 'cascade' }),
  size: text("size").notNull(),
  quantityPressed: integer("quantity_pressed").notNull(),
  completedAt: text("completed_at"),
});

// 6. Packing
export const packingJobs = sqliteTable("packing_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pressingJobId: integer("pressing_job_id").references(() => pressingJobs.id, { onDelete: 'cascade' }),
  size: text("size").notNull(),
  boxCount: integer("box_count").notNull(),
  quantityPacked: integer("quantity_packed").notNull(),
  completedAt: text("completed_at"),
});

// 7. Container/Bales
export const containers = sqliteTable("containers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packingJobId: integer("packing_job_id").references(() => packingJobs.id, { onDelete: 'cascade' }),
  numberofBales: integer("number_of_bales").notNull(),
  quantityPerBale: real("quantity_per_bale").notNull(),
  containerType: text("container_type").notNull(),
  containerNumber: text("container_number"),
  completedAt: text("completed_at"),
});

// Schemas
export const insertYarnBatchSchema = createInsertSchema(yarnBatches).omit({ id: true, receivedAt: true });
export const insertKnittingJobSchema = createInsertSchema(knittingJobs).omit({ id: true, completedAt: true });
export const insertDyeingJobSchema = createInsertSchema(dyeingJobs).omit({ id: true, completedAt: true });
export const insertCuttingJobSchema = createInsertSchema(cuttingJobs).omit({ id: true, completedAt: true });
export const insertStitchingJobSchema = createInsertSchema(stitchingJobs).omit({ id: true, completedAt: true });
export const insertPressingJobSchema = createInsertSchema(pressingJobs).omit({ id: true, completedAt: true });
export const insertPackingJobSchema = createInsertSchema(packingJobs).omit({ id: true, completedAt: true });
export const insertContainerSchema = createInsertSchema(containers).omit({ id: true, completedAt: true });

// Types
export type YarnBatch = typeof yarnBatches.$inferSelect;
export type KnittingJob = typeof knittingJobs.$inferSelect;
export type DyeingJob = typeof dyeingJobs.$inferSelect;
export type CuttingJob = typeof cuttingJobs.$inferSelect;
export type StitchingJob = typeof stitchingJobs.$inferSelect;
export type PressingJob = typeof pressingJobs.$inferSelect;
export type PackingJob = typeof packingJobs.$inferSelect;
export type Container = typeof containers.$inferSelect;

export type InsertYarnBatch = z.infer<typeof insertYarnBatchSchema>;
export type InsertKnittingJob = z.infer<typeof insertKnittingJobSchema>;
export type InsertDyeingJob = z.infer<typeof insertDyeingJobSchema>;
export type InsertCuttingJob = z.infer<typeof insertCuttingJobSchema>;
export type InsertStitchingJob = z.infer<typeof insertStitchingJobSchema>;
export type InsertPressingJob = z.infer<typeof insertPressingJobSchema>;
export type InsertPackingJob = z.infer<typeof insertPackingJobSchema>;
export type InsertContainer = z.infer<typeof insertContainerSchema>;

// 8. Raw Material Purchases
export const rawMaterialPurchases = sqliteTable("raw_material_purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vendor: text("vendor").notNull(),
  materialType: text("material_type").notNull(), // e.g., "Dye", "Chemicals", "Packaging", "Accessories"
  description: text("description"),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(), // e.g., "kg", "liters", "boxes"
  costPerUnit: real("cost_per_unit").notNull(),
  totalCost: real("total_cost").notNull(),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, partial
  invoiceNumber: text("invoice_number"),
  purchaseDate: text("purchase_date"),
  paymentDate: text("payment_date"),
});

// 9. Factory Costs / Bills
export const factoryCosts = sqliteTable("factory_costs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(), // e.g., "Electricity", "Water", "Salary", "Maintenance", "Rent", "Transportation"
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  status: text("status").default("unpaid"), // unpaid, paid, overdue
  invoiceNumber: text("invoice_number"),
  dueDate: text("due_date"),
  paidDate: text("paid_date"),
  recordedAt: text("recorded_at"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLogin: true });
export const insertRawMaterialPurchaseSchema = createInsertSchema(rawMaterialPurchases).omit({ id: true, purchaseDate: true });
export const insertFactoryCostSchema = createInsertSchema(factoryCosts).omit({ id: true, recordedAt: true });

// Types for users
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Types for raw materials
export type RawMaterialPurchase = typeof rawMaterialPurchases.$inferSelect;
export type FactoryCost = typeof factoryCosts.$inferSelect;
export type InsertRawMaterialPurchase = z.infer<typeof insertRawMaterialPurchaseSchema>;
export type InsertFactoryCost = z.infer<typeof insertFactoryCostSchema>;
