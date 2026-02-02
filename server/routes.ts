import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { logger, AppError, sendErrorResponse, asyncHandler } from "./error-handler";
import { authMiddleware } from "./auth";

/**
 * REGISTER ALL API ROUTES
 * This function sets up all the HTTP endpoints for the API.
 * Each endpoint has error handling wrapped around it to catch failures gracefully.
 */
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  logger.info("Registering API routes...");

  // Protect all /api routes except /api/auth
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/auth")) return next();
    if (req.path.startsWith("/api")) return authMiddleware(req, res, next);
    return next();
  });

  // ============================================================
  // USER MANAGEMENT ROUTES
  // ============================================================

  /**
   * GET /api/users - List all users
   * Returns all team members registered in the system
   */
  app.get(
    "/api/users",
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/users - Fetching all users");
      const data = await storage.getUsers();
      res.json(data);
    })
  );

  /**
   * POST /api/users - Create new user
   * Registers a new team member in the system
   */
  app.post(
    "/api/users",
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/users - Creating new user", { body: req.body });
        // Validate required fields
        const { username, email, role, department } = req.body;
        if (!username || username.trim() === "") {
          return res.status(400).json({ message: "Username is required", success: false });
        }
        const result = await storage.createUser({ username, email, role, department });
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof AppError) {
          return res.status(err.statusCode).json({ message: err.message, success: false });
        }
        throw err;
      }
    })
  );

  /**
   * GET /api/users/:id - Get specific user
   * Returns details for one user by ID
   */
  app.get(
    "/api/users/:id",
    asyncHandler(async (req: any, res: any) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new AppError("User ID must be a positive integer", 400);
      }
      logger.debug(`GET /api/users/:id - Fetching user ${id}`);
      const result = await storage.getUser(id);
      if (!result) {
        return res.status(404).json({ message: "User not found", success: false });
      }
      res.json(result);
    })
  );

  /**
   * PUT /api/users/:id - Update user
   * Modifies user information
   */
  app.put(
    "/api/users/:id",
    asyncHandler(async (req: any, res: any) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
          throw new AppError("User ID must be a positive integer", 400);
        }
        logger.debug(`PUT /api/users/:id - Updating user ${id}`, { body: req.body });
        const result = await storage.updateUser(id, req.body);
        res.json(result);
      } catch (err) {
        if (err instanceof AppError) {
          return res.status(err.statusCode).json({ message: err.message, success: false });
        }
        throw err;
      }
    })
  );

  /**
   * DELETE /api/users/:id - Delete user
   * Removes a user from the system
   */
  app.delete(
    "/api/users/:id",
    asyncHandler(async (req: any, res: any) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new AppError("User ID must be a positive integer", 400);
      }
      logger.info(`DELETE /api/users/:id - Deleting user ${id}`);
      await storage.deleteUser(id);
      res.sendStatus(204);
    })
  );

  // ============================================================
  // YARN BATCH ROUTES
  // ============================================================

  /**
   * GET /api/yarn - List all yarn batches
   * Returns all yarn that has arrived at the factory
   */
  app.get(
    api.yarn.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/yarn - Fetching all yarn batches");
      const data = await storage.getYarnBatches();
      res.json(data);
    })
  );

  /**
   * POST /api/yarn - Create new yarn batch
   * Records when yarn arrives from a supplier
   */
  app.post(
    api.yarn.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/yarn - Creating new yarn batch", { body: req.body });
        // Validate request data against schema
        const input = api.yarn.create.input.parse(req.body);
        const result = await storage.createYarnBatch(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  /**
   * GET /api/yarn/:id - Get specific yarn batch
   * Returns details for one yarn batch by ID
   */
  app.get(
    api.yarn.get.path,
    asyncHandler(async (req: any, res: any) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new AppError("Yarn batch ID must be a positive integer", 400);
      }
      logger.debug(`GET /api/yarn/:id - Fetching yarn batch ${id}`);
      const result = await storage.getYarnBatch(id);
      if (!result) {
        return res.status(404).json({ message: "Yarn batch not found", success: false });
      }
      res.json(result);
    })
  );

  /**
   * DELETE /api/yarn/:id - Delete yarn batch
   * Removes a yarn batch from the system
   */
  app.delete(
    "/api/yarn/:id",
    asyncHandler(async (req: any, res: any) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new AppError("Yarn batch ID must be a positive integer", 400);
      }
      logger.info(`DELETE /api/yarn/:id - Deleting yarn batch ${id}`);
      await storage.deleteYarnBatch(id);
      res.sendStatus(204);
    })
  );

  // ============================================================
  // KNITTING ROUTES
  // ============================================================

  /**
   * GET /api/knitting - List all knitting jobs
   */
  app.get(
    api.knitting.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/knitting - Fetching all knitting jobs");
      const data = await storage.getKnittingJobs();
      res.json(data);
    })
  );

  /**
   * POST /api/knitting - Create new knitting job
   */
  app.post(
    api.knitting.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/knitting - Creating new knitting job", { body: req.body });
        const input = api.knitting.create.input.parse(req.body);
        const result = await storage.createKnittingJob(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  // ============================================================
  // DYEING ROUTES
  // ============================================================

  /**
   * GET /api/dyeing - List all dyeing jobs
   */
  app.get(
    api.dyeing.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/dyeing - Fetching all dyeing jobs");
      const data = await storage.getDyeingJobs();
      res.json(data);
    })
  );

  /**
   * POST /api/dyeing - Create new dyeing job
   */
  app.post(
    api.dyeing.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/dyeing - Creating new dyeing job", { body: req.body });
        const input = api.dyeing.create.input.parse(req.body);
        const result = await storage.createDyeingJob(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  // ============================================================
  // CUTTING ROUTES
  // ============================================================

  /**
   * GET /api/cutting - List all cutting jobs
   */
  app.get(
    api.cutting.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/cutting - Fetching all cutting jobs");
      const data = await storage.getCuttingJobs();
      res.json(data);
    })
  );

  /**
   * POST /api/cutting - Create new cutting job
   */
  app.post(
    api.cutting.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/cutting - Creating new cutting job", { body: req.body });
        const input = api.cutting.create.input.parse(req.body);
        const result = await storage.createCuttingJob(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  // ============================================================
  // STITCHING ROUTES
  // ============================================================

  /**
   * GET /api/stitching - List all stitching jobs
   */
  app.get(
    api.stitching.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/stitching - Fetching all stitching jobs");
      const data = await storage.getStitchingJobs();
      res.json(data);
    })
  );

  /**
   * POST /api/stitching - Create new stitching job
   */
  app.post(
    api.stitching.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/stitching - Creating new stitching job", { body: req.body });
        const input = api.stitching.create.input.parse(req.body);
        const result = await storage.createStitchingJob(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  // ============================================================
  // PRESSING ROUTES
  // ============================================================

  /**
   * GET /api/pressing - List all pressing jobs
   */
  app.get(
    api.pressing.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/pressing - Fetching all pressing jobs");
      const data = await storage.getPressingJobs();
      res.json(data);
    })
  );

  /**
   * POST /api/pressing - Create new pressing job
   */
  app.post(
    api.pressing.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/pressing - Creating new pressing job", { body: req.body });
        const input = api.pressing.create.input.parse(req.body);
        const result = await storage.createPressingJob(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  // ============================================================
  // PACKING ROUTES
  // ============================================================

  /**
   * GET /api/packing - List all packing jobs
   */
  app.get(
    api.packing.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/packing - Fetching all packing jobs");
      const data = await storage.getPackingJobs();
      res.json(data);
    })
  );

  /**
   * POST /api/packing - Create new packing job
   */
  app.post(
    api.packing.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/packing - Creating new packing job", { body: req.body });
        const input = api.packing.create.input.parse(req.body);
        const result = await storage.createPackingJob(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  // ============================================================
  // CONTAINER ROUTES
  // ============================================================

  /**
   * GET /api/container - List all containers
   */
  app.get(
    api.container.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/container - Fetching all containers");
      const data = await storage.getContainers();
      res.json(data);
    })
  );

  /**
   * POST /api/container - Create new container
   */
  app.post(
    api.container.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/container - Creating new container", { body: req.body });
        const input = api.container.create.input.parse(req.body);
        const result = await storage.createContainer(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  // ============================================================
  // RAW MATERIAL PURCHASE ROUTES
  // ============================================================

  /**
   * GET /api/raw-material - List all raw material purchases
   */
  app.get(
    api.rawMaterialPurchase.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/raw-material - Fetching all raw material purchases");
      const data = await storage.getRawMaterialPurchases();
      res.json(data);
    })
  );

  /**
   * POST /api/raw-material - Create new raw material purchase
   */
  app.post(
    api.rawMaterialPurchase.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/raw-material - Creating new raw material purchase", { body: req.body });
        const input = api.rawMaterialPurchase.create.input.parse(req.body);
        const result = await storage.createRawMaterialPurchase(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  // ============================================================
  // FACTORY COST ROUTES
  // ============================================================

  /**
   * GET /api/factory-cost - List all factory costs
   */
  app.get(
    api.factoryCost.list.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/factory-cost - Fetching all factory costs");
      const data = await storage.getFactoryCosts();
      res.json(data);
    })
  );

  /**
   * POST /api/factory-cost - Create new factory cost
   */
  app.post(
    api.factoryCost.create.path,
    asyncHandler(async (req: any, res: any) => {
      try {
        logger.debug("POST /api/factory-cost - Creating new factory cost", { body: req.body });
        const input = api.factoryCost.create.input.parse(req.body);
        const result = await storage.createFactoryCost(input);
        res.status(201).json(result);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.errors[0];
          const message = `Invalid ${fieldError.path.join(".")}: ${fieldError.message}`;
          logger.warn(message);
          return res.status(400).json({ message, success: false });
        }
        throw err;
      }
    })
  );

  // ============================================================
  // DASHBOARD ROUTES
  // ============================================================

  /**
   * GET /api/dashboard/stats - Get dashboard statistics
   * Returns summary statistics for all manufacturing stages
   */
  app.get(
    api.dashboard.stats.path,
    asyncHandler(async (req: any, res: any) => {
      logger.debug("GET /api/dashboard/stats - Fetching dashboard stats");
      const stats = await storage.getDashboardStats();
      res.json(stats);
    })
  );

  // ============================================================
  // SEED DATA
  // ============================================================
  // This section creates sample data the first time the app runs
  // so there's something to look at on the dashboard

  try {
    logger.info("Checking if seed data needs to be created...");
    const existingYarn = await storage.getYarnBatches();

    if (existingYarn.length === 0) {
      logger.info("Creating seed data...");

      // Create sample yarn batches
      const yarn1 = await storage.createYarnBatch({
        batchCode: "YRN-001",
        color: "Blue",
        weightKg: 500,
        supplier: "Textile Co",
      });

      await storage.createYarnBatch({
        batchCode: "YRN-002",
        color: "Red",
        weightKg: 300,
        supplier: "Yarn Masters",
      });

      // Create sample knitting job
      await storage.createKnittingJob({
        yarnBatchId: yarn1.id,
        fabricType: "Jersey",
        size: "Mixed",
        weightUsed: 100,
        fabricProduced: 95,
        status: "completed",
      });

      logger.info("✅ Seed data created successfully");
    }
  } catch (seedError) {
      logger.warn("Could not create seed data", seedError as any);
    // Don't crash the app if seed data creation fails
    // The app will still work, just without sample data
  }

  logger.info("✅ All API routes registered successfully");
  return httpServer;
}
