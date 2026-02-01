import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";
import * as schema from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import { logger, AppError, formatFileError, formatDatabaseError } from "./error-handler";

let db: any = null;

/**
 * INITIALIZE DATABASE WITH SELF-HEALING
 * This function sets up the SQLite database with automatic recovery.
 * If the database file is corrupted, it automatically creates a fresh one.
 * All tables are created automatically if they don't exist.
 */
export async function initializeDb() {
  try {
    logger.info("Starting database initialization...");

    // Set up file paths - where we save the database
    const dataDir = path.join(process.cwd(), "data");
    const dbPath = path.join(dataDir, "garment-flow.db");
    const backupPath = path.join(dataDir, "garment-flow.db.backup");

    // Create the data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      logger.info(`Creating data directory at ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize sql.js library - this is the SQLite engine
    logger.debug("Initializing sql.js library...");
    const SQL = await initSqlJs();

    // Try to load existing database file
    let fileBuffer = Buffer.alloc(0);
    let dbLoaded = false;

    if (fs.existsSync(dbPath)) {
      try {
        logger.debug(`Loading existing database from ${dbPath}`);
        fileBuffer = fs.readFileSync(dbPath);

        // Try to validate by creating a temporary database instance
        // If the file is corrupted, this will throw an error
        const tempDb = new SQL.Database(fileBuffer);
        tempDb.close();

        logger.info("✅ Existing database file loaded successfully");
        dbLoaded = true;
      } catch (loadError) {
        // Database file is corrupted - this is self-healing in action
        logger.warn(`Database file is corrupted, creating backup and starting fresh`, {
          error: String(loadError),
        });

        // Backup the corrupted file so user can investigate if needed
        try {
          if (fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath); // Remove old backup
          }
          fs.copyFileSync(dbPath, backupPath);
          logger.info(`Corrupted database backed up to ${backupPath}`);
        } catch (backupError) {
          logger.warn(`Could not backup corrupted database`, { error: String(backupError) });
        }

        // Delete the corrupted file
        try {
          fs.unlinkSync(dbPath);
          logger.info("Corrupted database file removed");
        } catch (deleteError) {
          logger.error(`Could not delete corrupted database file`, deleteError);
        }

        // Start fresh with empty buffer
        fileBuffer = Buffer.alloc(0);
        dbLoaded = false;
      }
    } else {
      logger.info("No existing database file found. Creating new database.");
      dbLoaded = false;
    }

    // Load the database into memory
    // If fileBuffer is empty, this creates a fresh in-memory database
    const sqlDb = new SQL.Database(fileBuffer);
    logger.debug("Database loaded into memory");

    // Initialize Drizzle ORM on top of our database
    db = drizzle(sqlDb, { schema });

    // CREATE ALL TABLES
    // These create tables only if they don't already exist (IF NOT EXISTS)
    createAllTables(sqlDb);

    // AUTO-SAVE every 5 seconds
    // This writes the in-memory database to disk regularly
    // so data persists even if the app crashes
    setInterval(() => {
      try {
        const data = sqlDb.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
        logger.debug("Database auto-saved to disk");
      } catch (saveError) {
        logger.error(`Error saving database to disk`, saveError, { dbPath });
      }
    }, 5000);

    logger.info(`✅ Database ready at: ${dbPath}`);
    return db;
  } catch (error) {
    logger.error("Failed to initialize database", error);
    throw new AppError("Database initialization failed. Please restart the application.", 500, false);
  }
}

/**
 * CREATE ALL REQUIRED TABLES
 * This helper function creates all the tables our app needs.
 * Each table represents a step in the garment manufacturing process.
 */
function createAllTables(sqlDb: any) {
  try {
    logger.debug("Creating database tables...");

    // TABLE 0: Users
    // Track all team members who use this system
    // Allows multiple people to access and modify data
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        role TEXT DEFAULT 'user',
        department TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);
    logger.debug("users table created");

    // TABLE 1: Yarn Batches
    // When yarn arrives at the factory, we record it here
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS yarn_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_code TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        supplier TEXT,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.debug("yarn_batches table created");

    // TABLE 2: Knitting Jobs
    // Yarn gets knitted into fabric here
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS knitting_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        yarn_batch_id INTEGER REFERENCES yarn_batches(id) ON DELETE CASCADE,
        fabric_type TEXT NOT NULL,
        size TEXT NOT NULL DEFAULT 'Mixed',
        weight_used REAL NOT NULL,
        fabric_produced REAL NOT NULL,
        status TEXT DEFAULT 'completed',
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.debug("knitting_jobs table created");

    // TABLE 3: Dyeing Jobs
    // Fabric gets dyed/colored here
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS dyeing_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        knitting_job_id INTEGER REFERENCES knitting_jobs(id) ON DELETE CASCADE,
        weight_kg_dyed REAL NOT NULL,
        rolls_per_batch INTEGER NOT NULL,
        dye_color TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.debug("dyeing_jobs table created");

    // TABLE 4: Cutting Jobs
    // Fabric gets cut into pieces here
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS cutting_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dyeing_job_id INTEGER REFERENCES dyeing_jobs(id) ON DELETE CASCADE,
        style_code TEXT NOT NULL,
        size TEXT NOT NULL,
        quantity_pieces INTEGER NOT NULL,
        waste_kg REAL DEFAULT 0,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.debug("cutting_jobs table created");

    // TABLE 5: Stitching Jobs
    // Cut pieces get stitched together into garments here
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS stitching_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cutting_job_id INTEGER REFERENCES cutting_jobs(id) ON DELETE CASCADE,
        size TEXT NOT NULL,
        quantity_stitched INTEGER NOT NULL,
        rejected_count INTEGER DEFAULT 0,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.debug("stitching_jobs table created");

    // TABLE 6: Pressing Jobs
    // Finished garments get pressed/ironed here
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS pressing_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stitching_job_id INTEGER REFERENCES stitching_jobs(id) ON DELETE CASCADE,
        size TEXT NOT NULL,
        quantity_pressed INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.debug("pressing_jobs table created");

    // TABLE 7: Packing Jobs
    // Garments get packed into boxes here
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS packing_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pressing_job_id INTEGER REFERENCES pressing_jobs(id) ON DELETE CASCADE,
        size TEXT NOT NULL,
        box_count INTEGER NOT NULL,
        quantity_packed INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.debug("packing_jobs table created");

    // TABLE 8: Containers
    // Packed boxes get loaded into shipping containers here
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS containers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        packing_job_id INTEGER REFERENCES packing_jobs(id) ON DELETE CASCADE,
        number_of_bales INTEGER NOT NULL,
        quantity_per_bale REAL NOT NULL,
        container_type TEXT NOT NULL,
        container_number TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.debug("containers table created");

    // TABLE 9: Raw Material Purchases
    // Track all raw materials (dyes, chemicals, packaging) purchased
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS raw_material_purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor TEXT NOT NULL,
        material_type TEXT NOT NULL,
        description TEXT,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        cost_per_unit REAL NOT NULL,
        total_cost REAL NOT NULL,
        payment_status TEXT DEFAULT 'pending',
        invoice_number TEXT,
        purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_date DATETIME
      )
    `);
    logger.debug("raw_material_purchases table created");

    // TABLE 10: Factory Costs
    // Track all factory expenses (electricity, salaries, rent, maintenance)
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS factory_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'unpaid',
        invoice_number TEXT,
        due_date DATETIME,
        paid_date DATETIME,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.debug("factory_costs table created");

    logger.info("✅ All database tables created successfully");
  } catch (error) {
    logger.error("Error creating database tables", error);
    throw new AppError("Failed to create database tables", 500, false);
  }
}

export { db };
