// @ts-nocheck

import type { Response } from "express";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

/**
 * CUSTOM ERROR CLASS FOR APPLICATION
 * This class represents controlled errors that we throw intentionally.
 * We can distinguish between these expected errors and unexpected system crashes.
 */
export class AppError extends Error {
  // HTTP status code to send back to client
  public statusCode: number;
  // Whether this error was expected (we controlled it) or unexpected
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // This is needed for proper error stack trace in TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * LOGGER UTILITY
 * Creates consistent log messages with timestamps and context.
 * Helps track what's happening in the application for debugging.
 */
export const logger = {
  // Log informational messages (app started, data received, etc)
  info: (message: string, context?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    const line = `[${timestamp}] ℹ️  INFO: ${message}${contextStr}\n`;
    try {
      writeLogFile("server.log", line);
    } catch (_) {}
    console.log(line.trimEnd());
  },

  // Log warning messages (unusual but recoverable situations)
  warn: (message: string, context?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    const line = `[${timestamp}] ⚠️  WARN: ${message}${contextStr}\n`;
    try {
      writeLogFile("server.log", line);
    } catch (_) {}
    console.warn(line.trimEnd());
  },

  // Log error messages (something went wrong)
  error: (message: string, error?: Error | unknown, context?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    const errorStr = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    const line = `[${timestamp}] ❌ ERROR: ${message} | Error: ${errorStr}${contextStr}\n`;
    try {
      writeLogFile("server.log", line);
    } catch (_) {}
    console.error(line.trimEnd());
  },

  // Log debug messages (detailed info for development)
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.DEBUG === "true") {
      const timestamp = new Date().toISOString();
      const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
      const line = `[${timestamp}] 🐛 DEBUG: ${message}${contextStr}\n`;
      try {
        writeLogFile("server.log", line);
      } catch (_) {}
      console.log(line.trimEnd());
    }
  },
};

// --- Simple file-based logger with rotation ---
const LOG_DIR = path.resolve(process.cwd(), "logs");
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_BACKUPS = 5;

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function rotateLogs(fileName: string) {
  try {
    const filePath = path.join(LOG_DIR, fileName);
    if (!fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    if (stat.size < MAX_LOG_SIZE) return;

    // rotate: file -> file.1, file.1 -> file.2, ... drop the oldest
    for (let i = MAX_BACKUPS - 1; i >= 0; i--) {
      const src = i === 0 ? filePath : `${filePath}.${i}`;
      const dest = `${filePath}.${i + 1}`;
      if (fs.existsSync(src)) {
        try {
          fs.renameSync(src, dest);
        } catch (e) {
          // ignore rotation errors
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

function writeLogFile(fileName: string, content: string) {
  ensureLogDir();
  const filePath = path.join(LOG_DIR, fileName);
  try {
    rotateLogs(fileName);
    fs.appendFileSync(filePath, content, { encoding: "utf8" });
  } catch (e) {
    // best-effort only
  }
}

/**
 * INPUT VALIDATION HELPER
 * Checks if a value looks valid before using it.
 * Prevents bad data from entering the system.
 */
export const validateInput = {
  // Check if a number is valid and reasonable
  isValidNumber: (value: any, fieldName: string): boolean => {
    if (value === null || value === undefined || value === "") {
      throw new AppError(`${fieldName} is required`, 400);
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new AppError(`${fieldName} must be a valid number`, 400);
    }
    if (num < 0) {
      throw new AppError(`${fieldName} cannot be negative`, 400);
    }
    return true;
  },

  // Check if text is valid and not empty
  isValidString: (value: any, fieldName: string, minLength = 1): boolean => {
    if (value === null || value === undefined) {
      throw new AppError(`${fieldName} is required`, 400);
    }
    const str = String(value).trim();
    if (str.length === 0) {
      throw new AppError(`${fieldName} cannot be empty`, 400);
    }
    if (str.length < minLength) {
      throw new AppError(`${fieldName} must be at least ${minLength} characters`, 400);
    }
    return true;
  },

  // Check if an integer (whole number) is valid
  isValidInteger: (value: any, fieldName: string): boolean => {
    validateInput.isValidNumber(value, fieldName);
    const num = Number(value);
    if (!Number.isInteger(num)) {
      throw new AppError(`${fieldName} must be a whole number`, 400);
    }
    return true;
  },

  // Check if object has required fields
  hasRequiredFields: (obj: any, fields: string[]): boolean => {
    for (const field of fields) {
      if (obj[field] === null || obj[field] === undefined) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }
    return true;
  },
};

/**
 * ERROR RESPONSE FORMATTER
 * Sends error messages to the client in a consistent format.
 * Never exposes sensitive technical details to frontend.
 */
export const sendErrorResponse = (res: Response, error: unknown) => {
  // If it's our controlled AppError, use the status code it specifies
  if (error instanceof AppError) {
    logger.warn(`Controlled error: ${error.message}`, { statusCode: error.statusCode });
    return res.status(error.statusCode).json({
      message: error.message,
      success: false,
    });
  }

  // If it's a Zod validation error from the API request parsing
  if (error instanceof z.ZodError) {
    const firstError = error.errors[0];
    const fieldPath = firstError.path.join(".");
    const message = `Validation error in ${fieldPath}: ${firstError.message}`;
    logger.warn(`Validation error: ${message}`);
    return res.status(400).json({
      message: message,
      success: false,
    });
  }

  // If it's a regular JavaScript Error, log it but don't expose details
  if (error instanceof Error) {
    logger.error(`Unexpected error: ${error.message}`, error);
    return res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
      success: false,
    });
  }

  // Fallback for anything else
  logger.error(`Unknown error type:`, error);
  return res.status(500).json({
    message: "An unexpected error occurred. Please try again later.",
    success: false,
  });
};

/**
 * SAFE ASYNC WRAPPER
 * Wraps async route handlers to catch errors automatically
 * instead of requiring try-catch in every route.
 */
export const asyncHandler = (fn: any) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
      sendErrorResponse(res, error);
    });
  };
};

/**
 * DATABASE ERROR FORMATTER
 * Takes technical database errors and turns them into user-friendly messages.
 */
export const formatDatabaseError = (error: any, context: string = "database operation"): string => {
  const errorMessage = String(error);

  // If the database is locked (multiple writes at once)
  if (errorMessage.includes("SQLITE_BUSY") || errorMessage.includes("database is locked")) {
    return `Database is busy. Please try again in a moment.`;
  }

  // If there's a constraint violation (like duplicate ID)
  if (errorMessage.includes("UNIQUE constraint failed")) {
    return `That record already exists. Please use a different value.`;
  }

  // If there's a foreign key violation (referencing non-existent record)
  if (errorMessage.includes("FOREIGN KEY constraint failed")) {
    return `Cannot save this record because it references a non-existent record.`;
  }

  // For any other database error, log the real error but show generic message
  logger.error(`Database error during ${context}:`, error);
  return `Unable to complete ${context}. Please try again.`;
};

/**
 * FILE ERROR FORMATTER
 * Takes file system errors and turns them into user-friendly messages.
 */
export const formatFileError = (error: any, context: string = "file operation"): string => {
  const errorMessage = String(error);

  // If file doesn't exist
  if (errorMessage.includes("ENOENT") || errorMessage.includes("no such file")) {
    return `Required file not found. System will create it automatically.`;
  }

  // If permission denied
  if (errorMessage.includes("EACCES") || errorMessage.includes("permission denied")) {
    return `Permission denied for ${context}. Check file permissions.`;
  }

  // For any other file error
  logger.error(`File error during ${context}:`, error);
  return `Unable to complete ${context}. Please try again.`;
};
