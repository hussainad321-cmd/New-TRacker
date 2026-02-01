import {
  yarnBatches, knittingJobs, dyeingJobs, cuttingJobs, stitchingJobs, pressingJobs, packingJobs, containers, rawMaterialPurchases, factoryCosts, users,
  type YarnBatch, type InsertYarnBatch,
  type KnittingJob, type InsertKnittingJob,
  type DyeingJob, type InsertDyeingJob,
  type CuttingJob, type InsertCuttingJob,
  type StitchingJob, type InsertStitchingJob,
  type PressingJob, type InsertPressingJob,
  type PackingJob, type InsertPackingJob,
  type Container, type InsertContainer,
  type RawMaterialPurchase, type InsertRawMaterialPurchase,
  type FactoryCost, type InsertFactoryCost,
  type User, type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { logger, AppError, validateInput, formatDatabaseError } from "./error-handler";

/**
 * DASHBOARD STATS INTERFACE
 * This defines what statistics we show on the dashboard
 */
export interface DashboardStats {
  totalYarnKg: number;
  totalFabricKg: number;
  totalDyedKg: number;
  totalCutPieces: number;
  totalStitchedPieces: number;
  totalPackedPieces: number;
  totalBalesShipped: number;
}

/**
 * STORAGE INTERFACE
 * This defines all the methods that our data storage layer must provide.
 * It's like a contract - anything that implements IStorage must have these methods.
 */
export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Yarn
  getYarnBatches(): Promise<YarnBatch[]>;
  getYarnBatch(id: number): Promise<YarnBatch | undefined>;
  createYarnBatch(yarn: InsertYarnBatch): Promise<YarnBatch>;
  deleteYarnBatch(id: number): Promise<void>;

  // Knitting
  getKnittingJobs(): Promise<KnittingJob[]>;
  createKnittingJob(job: InsertKnittingJob): Promise<KnittingJob>;

  // Dyeing
  getDyeingJobs(): Promise<DyeingJob[]>;
  createDyeingJob(job: InsertDyeingJob): Promise<DyeingJob>;

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

  // Container
  getContainers(): Promise<Container[]>;
  createContainer(job: InsertContainer): Promise<Container>;

  // Raw Material Purchases
  getRawMaterialPurchases(): Promise<RawMaterialPurchase[]>;
  createRawMaterialPurchase(purchase: InsertRawMaterialPurchase): Promise<RawMaterialPurchase>;

  // Factory Costs
  getFactoryCosts(): Promise<FactoryCost[]>;
  createFactoryCost(cost: InsertFactoryCost): Promise<FactoryCost>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

/**
 * DATABASE STORAGE CLASS
 * This class implements all CRUD operations (Create, Read, Update, Delete)
 * for every table in our database. It includes comprehensive error handling
 * and input validation to prevent crashes and bad data.
 */
export class DatabaseStorage implements IStorage {
  // ============================================================
  // USER OPERATIONS
  // ============================================================

  /**
   * GET ALL USERS
   * Returns all registered users in the system
   */
  async getUsers(): Promise<User[]> {
    try {
      logger.debug("Fetching all users");
      const result = await db.select().from(users).orderBy(users.createdAt);
      return result;
    } catch (error) {
      const message = formatDatabaseError(error, "fetching users");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * GET USER BY ID
   * Retrieves one specific user by ID
   */
  async getUser(id: number): Promise<User | undefined> {
    try {
      validateInput(id, "number", "User ID");
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      const message = formatDatabaseError(error, "fetching user");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * GET USER BY USERNAME
   * Retrieves user by username (unique identifier)
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      validateInput(username, "string", "Username");
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      const message = formatDatabaseError(error, "fetching user by username");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE NEW USER
   * Adds a new user to the system
   * Username must be unique
   */
  async createUser(userData: InsertUser): Promise<User> {
    try {
      // Validate required fields
      validateInput(userData.username, "string", "Username");
      if (!userData.username || userData.username.trim().length === 0) {
        throw new AppError("Username cannot be empty", 400);
      }

      // Check if username already exists
      const existingUser = await this.getUserByUsername(userData.username);
      if (existingUser) {
        throw new AppError(`Username '${userData.username}' is already taken`, 400);
      }

      logger.info(`Creating new user: ${userData.username}`);
      const newUser = {
        ...userData,
        createdAt: new Date().toISOString()
      };

      const result = await db.insert(users).values(newUser).returning();
      logger.info(`User created successfully: ${userData.username} (ID: ${result[0]?.id})`);
      return result[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating user");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * UPDATE USER
   * Modifies user information
   */
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    try {
      validateInput(id, "number", "User ID");
      
      // If updating username, check it's not taken
      if (data.username) {
        const existingUser = await this.getUserByUsername(data.username);
        if (existingUser && existingUser.id !== id) {
          throw new AppError(`Username '${data.username}' is already taken`, 400);
        }
      }

      logger.info(`Updating user ${id}`);
      const result = await db
        .update(users)
        .set({ ...data, lastLogin: new Date().toISOString() })
        .where(eq(users.id, id))
        .returning();

      if (!result[0]) {
        throw new AppError(`User with ID ${id} not found`, 404);
      }
      return result[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "updating user");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * DELETE USER
   * Removes a user from the system
   */
  async deleteUser(id: number): Promise<void> {
    try {
      validateInput(id, "number", "User ID");
      logger.info(`Deleting user ${id}`);
      await db.delete(users).where(eq(users.id, id));
    } catch (error) {
      const message = formatDatabaseError(error, "deleting user");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // YARN OPERATIONS
  // ============================================================

  /**
   * GET ALL YARN BATCHES
   * Returns all yarn batches that have arrived at the factory.
   * Handles errors gracefully if database query fails.
   */
  async getYarnBatches(): Promise<YarnBatch[]> {
    try {
      logger.debug("Fetching all yarn batches");
      const result = await db.select().from(yarnBatches).orderBy(yarnBatches.receivedAt);
      return result;
    } catch (error) {
      const message = formatDatabaseError(error, "fetching yarn batches");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * GET SINGLE YARN BATCH BY ID
   * Retrieves one specific yarn batch by its ID number.
   * Validates the ID is a valid number before querying.
   */
  async getYarnBatch(id: number): Promise<YarnBatch | undefined> {
    try {
      // Validate input
      if (typeof id !== 'number' || id <= 0) {
        throw new AppError("Yarn batch ID must be a positive number", 400);
      }

      logger.debug(`Fetching yarn batch with ID: ${id}`);
      const [batch] = await db.select().from(yarnBatches).where(eq(yarnBatches.id, id));
      return batch;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "fetching yarn batch");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE NEW YARN BATCH
   * Adds a new yarn batch to the system when it arrives from a supplier.
   * Validates all required fields and checks for duplicates.
   */
  async createYarnBatch(insertYarn: InsertYarnBatch): Promise<YarnBatch> {
    try {
      // Validate all required fields
      validateInput.isValidString(insertYarn.batchCode, "Batch Code", 1);
      validateInput.isValidString(insertYarn.color, "Color", 1);
      validateInput.isValidNumber(insertYarn.weightKg, "Weight (kg)");

      logger.info(`Creating yarn batch: ${insertYarn.batchCode}`);

      const [yarn] = await db.insert(yarnBatches).values(insertYarn).returning();
      return yarn;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating yarn batch");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * DELETE YARN BATCH
   * Removes a yarn batch from the system.
   * Validates the ID is valid before deleting.
   */
  async deleteYarnBatch(id: number): Promise<void> {
    try {
      // Validate input
      if (typeof id !== 'number' || id <= 0) {
        throw new AppError("Yarn batch ID must be a positive number", 400);
      }

      logger.info(`Deleting yarn batch with ID: ${id}`);
      await db.delete(yarnBatches).where(eq(yarnBatches.id, id));
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "deleting yarn batch");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // KNITTING OPERATIONS
  // ============================================================

  /**
   * GET ALL KNITTING JOBS
   * Returns all knitting jobs (converting yarn to fabric).
   */
  async getKnittingJobs(): Promise<KnittingJob[]> {
    try {
      logger.debug("Fetching all knitting jobs");
      return await db.select().from(knittingJobs).orderBy(knittingJobs.completedAt);
    } catch (error) {
      const message = formatDatabaseError(error, "fetching knitting jobs");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE KNITTING JOB
   * Starts a new knitting job to convert yarn into fabric.
   * Validates all measurements and references.
   */
  async createKnittingJob(insertJob: InsertKnittingJob): Promise<KnittingJob> {
    try {
      // Validate required fields
      validateInput.isValidNumber(insertJob.weightUsed, "Weight Used (kg)");
      validateInput.isValidNumber(insertJob.fabricProduced, "Fabric Produced (kg)");
      validateInput.isValidString(insertJob.fabricType, "Fabric Type", 1);

      logger.info(`Creating knitting job for ${insertJob.fabricType}`);

      const [job] = await db.insert(knittingJobs).values(insertJob).returning();
      return job;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating knitting job");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // DYEING OPERATIONS
  // ============================================================

  /**
   * GET ALL DYEING JOBS
   * Returns all dyeing jobs (coloring fabric).
   */
  async getDyeingJobs(): Promise<DyeingJob[]> {
    try {
      logger.debug("Fetching all dyeing jobs");
      return await db.select().from(dyeingJobs).orderBy(dyeingJobs.completedAt);
    } catch (error) {
      const message = formatDatabaseError(error, "fetching dyeing jobs");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE DYEING JOB
   * Starts a new dyeing job to color fabric.
   * Validates weights and quantities.
   */
  async createDyeingJob(insertJob: InsertDyeingJob): Promise<DyeingJob> {
    try {
      // Validate required fields
      validateInput.isValidNumber(insertJob.weightKgDyed, "Weight Dyed (kg)");
      validateInput.isValidInteger(insertJob.rollsPerBatch, "Rolls Per Batch");

      logger.info(`Creating dyeing job: ${insertJob.dyeColor || "No color specified"}`);

      const [job] = await db.insert(dyeingJobs).values(insertJob).returning();
      return job;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating dyeing job");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // CUTTING OPERATIONS
  // ============================================================

  /**
   * GET ALL CUTTING JOBS
   * Returns all cutting jobs (cutting fabric into pieces).
   */
  async getCuttingJobs(): Promise<CuttingJob[]> {
    try {
      logger.debug("Fetching all cutting jobs");
      return await db.select().from(cuttingJobs).orderBy(cuttingJobs.completedAt);
    } catch (error) {
      const message = formatDatabaseError(error, "fetching cutting jobs");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE CUTTING JOB
   * Starts a new cutting job to cut fabric into pieces.
   * Validates style codes and quantities.
   */
  async createCuttingJob(insertJob: InsertCuttingJob): Promise<CuttingJob> {
    try {
      // Validate required fields
      validateInput.isValidString(insertJob.styleCode, "Style Code", 1);
      validateInput.isValidString(insertJob.size, "Size", 1);
      validateInput.isValidInteger(insertJob.quantityPieces, "Quantity Pieces");

      logger.info(`Creating cutting job: Style ${insertJob.styleCode}, Qty ${insertJob.quantityPieces}`);

      const [job] = await db.insert(cuttingJobs).values(insertJob).returning();
      return job;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating cutting job");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // STITCHING OPERATIONS
  // ============================================================

  /**
   * GET ALL STITCHING JOBS
   * Returns all stitching jobs (sewing pieces into garments).
   */
  async getStitchingJobs(): Promise<StitchingJob[]> {
    try {
      logger.debug("Fetching all stitching jobs");
      return await db.select().from(stitchingJobs).orderBy(stitchingJobs.completedAt);
    } catch (error) {
      const message = formatDatabaseError(error, "fetching stitching jobs");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE STITCHING JOB
   * Starts a new stitching job to sew pieces into garments.
   * Validates quantities and rejection counts.
   */
  async createStitchingJob(insertJob: InsertStitchingJob): Promise<StitchingJob> {
    try {
      // Validate required fields
      validateInput.isValidString(insertJob.size, "Size", 1);
      validateInput.isValidInteger(insertJob.quantityStitched, "Quantity Stitched");

      logger.info(`Creating stitching job: Qty ${insertJob.quantityStitched}`);

      const [job] = await db.insert(stitchingJobs).values(insertJob).returning();
      return job;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating stitching job");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // PRESSING OPERATIONS
  // ============================================================

  /**
   * GET ALL PRESSING JOBS
   * Returns all pressing jobs (ironing garments).
   */
  async getPressingJobs(): Promise<PressingJob[]> {
    try {
      logger.debug("Fetching all pressing jobs");
      return await db.select().from(pressingJobs).orderBy(pressingJobs.completedAt);
    } catch (error) {
      const message = formatDatabaseError(error, "fetching pressing jobs");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE PRESSING JOB
   * Starts a new pressing job to iron garments.
   * Validates quantities.
   */
  async createPressingJob(insertJob: InsertPressingJob): Promise<PressingJob> {
    try {
      // Validate required fields
      validateInput.isValidString(insertJob.size, "Size", 1);
      validateInput.isValidInteger(insertJob.quantityPressed, "Quantity Pressed");

      logger.info(`Creating pressing job: Qty ${insertJob.quantityPressed}`);

      const [job] = await db.insert(pressingJobs).values(insertJob).returning();
      return job;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating pressing job");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // PACKING OPERATIONS
  // ============================================================

  /**
   * GET ALL PACKING JOBS
   * Returns all packing jobs (packing garments into boxes).
   */
  async getPackingJobs(): Promise<PackingJob[]> {
    try {
      logger.debug("Fetching all packing jobs");
      return await db.select().from(packingJobs).orderBy(packingJobs.completedAt);
    } catch (error) {
      const message = formatDatabaseError(error, "fetching packing jobs");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE PACKING JOB
   * Starts a new packing job to pack garments into boxes.
   * Validates box counts and quantities.
   */
  async createPackingJob(insertJob: InsertPackingJob): Promise<PackingJob> {
    try {
      // Validate required fields
      validateInput.isValidString(insertJob.size, "Size", 1);
      validateInput.isValidInteger(insertJob.boxCount, "Box Count");
      validateInput.isValidInteger(insertJob.quantityPacked, "Quantity Packed");

      logger.info(`Creating packing job: ${insertJob.boxCount} boxes, Qty ${insertJob.quantityPacked}`);

      const [job] = await db.insert(packingJobs).values(insertJob).returning();
      return job;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating packing job");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // CONTAINER OPERATIONS
  // ============================================================

  /**
   * GET ALL CONTAINERS
   * Returns all containers/bales for shipping.
   */
  async getContainers(): Promise<Container[]> {
    try {
      logger.debug("Fetching all containers");
      return await db.select().from(containers).orderBy(containers.completedAt);
    } catch (error) {
      const message = formatDatabaseError(error, "fetching containers");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE CONTAINER
   * Starts a new container record for shipping.
   * Validates container details.
   */
  async createContainer(insertJob: InsertContainer): Promise<Container> {
    try {
      // Validate required fields
      validateInput.isValidInteger(insertJob.numberofBales, "Number of Bales");
      validateInput.isValidNumber(insertJob.quantityPerBale, "Quantity Per Bale");
      validateInput.isValidString(insertJob.containerType, "Container Type", 1);

      logger.info(`Creating container: ${insertJob.numberofBales} bales`);

      const [job] = await db.insert(containers).values(insertJob).returning();
      return job;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating container");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // RAW MATERIAL PURCHASE OPERATIONS
  // ============================================================

  /**
   * GET ALL RAW MATERIAL PURCHASES
   * Returns all raw materials (dyes, chemicals, packaging) that were purchased.
   */
  async getRawMaterialPurchases(): Promise<RawMaterialPurchase[]> {
    try {
      logger.debug("Fetching all raw material purchases");
      return await db.select().from(rawMaterialPurchases).orderBy(rawMaterialPurchases.purchaseDate);
    } catch (error) {
      const message = formatDatabaseError(error, "fetching raw material purchases");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE RAW MATERIAL PURCHASE
   * Records when raw materials are purchased from a vendor.
   * Validates vendor info, quantities, and costs.
   */
  async createRawMaterialPurchase(insertPurchase: InsertRawMaterialPurchase): Promise<RawMaterialPurchase> {
    try {
      // Validate all required fields
      validateInput.isValidString(insertPurchase.vendor, "Vendor", 1);
      validateInput.isValidString(insertPurchase.materialType, "Material Type", 1);
      validateInput.isValidNumber(insertPurchase.quantity, "Quantity");
      validateInput.isValidString(insertPurchase.unit, "Unit", 1);
      validateInput.isValidNumber(insertPurchase.costPerUnit, "Cost Per Unit");
      validateInput.isValidNumber(insertPurchase.totalCost, "Total Cost");

      logger.info(`Creating raw material purchase: ${insertPurchase.materialType} from ${insertPurchase.vendor}`);

      const [purchase] = await db.insert(rawMaterialPurchases).values(insertPurchase).returning();
      return purchase;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating raw material purchase");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // FACTORY COST OPERATIONS
  // ============================================================

  /**
   * GET ALL FACTORY COSTS
   * Returns all factory expenses (electricity, salaries, rent, etc).
   */
  async getFactoryCosts(): Promise<FactoryCost[]> {
    try {
      logger.debug("Fetching all factory costs");
      return await db.select().from(factoryCosts).orderBy(factoryCosts.recordedAt);
    } catch (error) {
      const message = formatDatabaseError(error, "fetching factory costs");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  /**
   * CREATE FACTORY COST
   * Records a factory expense.
   * Validates category, description, and amount.
   */
  async createFactoryCost(insertCost: InsertFactoryCost): Promise<FactoryCost> {
    try {
      // Validate all required fields
      validateInput.isValidString(insertCost.category, "Category", 1);
      validateInput.isValidString(insertCost.description, "Description", 1);
      validateInput.isValidNumber(insertCost.amount, "Amount");

      logger.info(`Creating factory cost: ${insertCost.category} - ${insertCost.description}`);

      const [cost] = await db.insert(factoryCosts).values(insertCost).returning();
      return cost;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = formatDatabaseError(error, "creating factory cost");
      logger.error(message, error);
      throw new AppError(message, 500);
    }
  }

  // ============================================================
  // DASHBOARD STATISTICS
  // ============================================================

  /**
   * GET DASHBOARD STATS
   * Calculates total statistics shown on the dashboard.
   * Uses SQL aggregate functions to sum values from all tables.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      logger.debug("Calculating dashboard statistics");

      // Sum yarn weights from all batches
      const [yarn] = await db.select({ total: sql<number>`sum(${yarnBatches.weightKg})` }).from(yarnBatches);

      // Sum fabric produced from all knitting jobs
      const [fabric] = await db.select({ total: sql<number>`sum(${knittingJobs.fabricProduced})` }).from(knittingJobs);

      // Sum fabric dyed from all dyeing jobs
      const [dyed] = await db.select({ total: sql<number>`sum(${dyeingJobs.weightKgDyed})` }).from(dyeingJobs);

      // Sum all cut pieces
      const [cut] = await db.select({ total: sql<number>`sum(${cuttingJobs.quantityPieces})` }).from(cuttingJobs);

      // Sum all stitched pieces
      const [stitched] = await db.select({ total: sql<number>`sum(${stitchingJobs.quantityStitched})` }).from(stitchingJobs);

      // Sum all packed pieces
      const [packed] = await db.select({ total: sql<number>`sum(${packingJobs.quantityPacked})` }).from(packingJobs);

      // Sum all bales shipped
      const [bales] = await db.select({ total: sql<number>`sum(${containers.numberofBales})` }).from(containers);

      logger.debug("Dashboard stats calculated successfully");

      // Return stats object with all totals (default to 0 if no data)
      return {
        totalYarnKg: Number(yarn?.total || 0),
        totalFabricKg: Number(fabric?.total || 0),
        totalDyedKg: Number(dyed?.total || 0),
        totalCutPieces: Number(cut?.total || 0),
        totalStitchedPieces: Number(stitched?.total || 0),
        totalPackedPieces: Number(packed?.total || 0),
        totalBalesShipped: Number(bales?.total || 0),
      };
    } catch (error) {
      logger.error("Error calculating dashboard stats", error);
      // Return safe defaults if stats calculation fails
      return {
        totalYarnKg: 0,
        totalFabricKg: 0,
        totalDyedKg: 0,
        totalCutPieces: 0,
        totalStitchedPieces: 0,
        totalPackedPieces: 0,
        totalBalesShipped: 0,
      };
    }
  }
}

/**
 * SINGLETON STORAGE INSTANCE
 * We create one instance of DatabaseStorage and export it.
 * Every part of the application uses this same instance to access data.
 */
export const storage = new DatabaseStorage();
