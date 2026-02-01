import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { logger, AppError, sendErrorResponse } from "./error-handler";

const app = express();
const httpServer = createServer(app);

/**
 * TYPESCRIPT MODULE DECLARATION
 * This tells TypeScript that Request objects have a rawBody property
 * We use this to capture the original request body for logging
 */
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

/**
 * MIDDLEWARE: Parse JSON Requests
 * Converts incoming JSON strings into JavaScript objects
 * Also captures the raw body for security logging if needed
 */
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // Store the raw body for security/debugging purposes
      req.rawBody = buf;
    },
  }),
);

/**
 * MIDDLEWARE: Parse URL-Encoded Requests
 * Handles form submissions (application/x-www-form-urlencoded)
 */
app.use(express.urlencoded({ extended: false }));

/**
 * MIDDLEWARE: Request Logging
 * Logs all API requests with timing and response information
 * Helps track what's happening during operation
 */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Intercept the res.json() method to capture what we're sending back
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // When response is finished, log the request details
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      logger.info(logLine);
    }
  });

  next();
});

/**
 * MIDDLEWARE: Global Error Handler
 * Catches any errors that occur during request processing
 * Sends a safe error response back to the client
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Express error handler caught error", err);
  sendErrorResponse(res, err);
  // Don't re-throw - we want to keep the server running
});

/**
 * STARTUP FUNCTION
 * Wraps all initialization code in a try-catch so the server
 * starts up safely and reports any issues clearly
 */
(async () => {
  try {
    logger.info("=================================================");
    logger.info("Starting Garment Flow Tracker Application");
    logger.info("=================================================");

    // Initialize the database with self-healing
    logger.info("Initializing database...");
    const { initializeDb } = await import("./db");
    await initializeDb();
    logger.info("✅ Database initialized successfully");

    // Register all API routes
    logger.info("Registering API routes...");
    await registerRoutes(httpServer, app);
    logger.info("✅ API routes registered successfully");

    // Setup static file serving and Vite (development only)
    if (process.env.NODE_ENV === "production") {
      logger.info("Running in PRODUCTION mode - serving static files");
      serveStatic(app);
    } else {
      logger.info("Running in DEVELOPMENT mode - setting up Vite");
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // Start listening for HTTP requests
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(port, "127.0.0.1", () => {
      logger.info(`✅ Server is listening on http://127.0.0.1:${port}`);
      logger.info("Ready to accept requests!");
    });
  } catch (startupError) {
    // If anything goes wrong during startup, log it and exit
    logger.error("FATAL: Failed to start application", startupError);
    logger.error("The application will now exit");
    process.exit(1);
  }
})();

/**
 * PROCESS ERROR HANDLERS
 * These catch errors that occur outside of the normal request/response cycle.
 * Without these, the entire process would crash unexpectedly.
 */

/**
 * Handle Uncaught Exceptions
 * These are unexpected errors that weren't caught by try-catch blocks
 * We log them and continue running (don't crash the server)
 */
process.on("uncaughtException", (error: Error) => {
  logger.error(
    "⚠️  UNCAUGHT EXCEPTION - This is a serious issue that should be investigated:",
    error,
    { stack: error.stack }
  );

  // In production, you might want to:
  // - Send an alert to your monitoring system
  // - Log to a file for later analysis
  // - Gracefully restart after a delay

  // For now, we continue running instead of crashing
  logger.warn("Application will continue running despite uncaught exception");
});

/**
 * Handle Unhandled Promise Rejections
 * When a Promise fails without a .catch() handler, this catches it
 * Prevents silent failures that are hard to debug
 */
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  const reasonStr = reason instanceof Error ? reason.message : String(reason);
  logger.error(
    "⚠️  UNHANDLED PROMISE REJECTION - A Promise failed without a catch handler:",
    reasonStr,
    { reason }
  );

  // Log which promise was rejected for debugging
  logger.debug("Rejected promise:", promise);

  // Continue running instead of crashing
  logger.warn("Application will continue running despite unhandled rejection");
});

/**
 * Handle SIGTERM Signals
 * When the system tells the app to shut down gracefully (SIGTERM),
 * we close connections cleanly before exiting
 */
process.on("SIGTERM", () => {
  logger.warn("📤 SIGTERM received - gracefully shutting down");

  // Stop accepting new connections
  httpServer.close(() => {
    logger.info("✅ HTTP server closed");
    process.exit(0);
  });

  // Force close if it takes too long
  setTimeout(() => {
    logger.error("Force closing due to timeout");
    process.exit(1);
  }, 30000); // 30 second timeout
});

/**
 * Handle SIGINT Signals
 * When user presses Ctrl+C, we shut down gracefully
 */
process.on("SIGINT", () => {
  logger.warn("⌨️  SIGINT received (Ctrl+C) - gracefully shutting down");

  // Stop accepting new connections
  httpServer.close(() => {
    logger.info("✅ HTTP server closed");
    process.exit(0);
  });

  // Force close if it takes too long
  setTimeout(() => {
    logger.error("Force closing due to timeout");
    process.exit(1);
  }, 30000); // 30 second timeout
});

/**
 * Handle Memory Warnings
 * Node.js will warn us if memory usage is getting high
 */
process.on("warning", (warning: any) => {
  logger.warn("⚠️  Node.js Warning:", warning.message);
  if (warning.stack) {
    logger.warn("Stack trace:", warning.stack);
  }
});

// Export the logger so other modules can use it if needed
export { logger };
