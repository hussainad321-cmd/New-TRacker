# 🏗️ Architecture Guide - Crash-Proof Backend

This guide explains how the new error-handling architecture works.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP CLIENT REQUEST                         │
│                    (Browser/API Tool/App)                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NODE.JS PROCESS                               │
│                 (The Server Application)                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MIDDLEWARE LAYER                                       │   │
│  │                                                          │   │
│  │  ├─ express.json() - Parse incoming JSON              │   │
│  │  ├─ Request Logger - Log all API calls                │   │
│  │  └─ Error Handler - Catch and format errors           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               │                                   │
│                               ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ROUTE HANDLERS                                         │   │
│  │                                                          │   │
│  │  ├─ GET /api/yarn                                      │   │
│  │  ├─ POST /api/yarn (wrapped in asyncHandler)          │   │
│  │  ├─ POST /api/knitting (wrapped in asyncHandler)      │   │
│  │  ├─ POST /api/factory-cost (wrapped in asyncHandler)  │   │
│  │  └─ ... (all 30+ routes protected)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               │                                   │
│                               ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  INPUT VALIDATION LAYER                                 │   │
│  │                                                          │   │
│  │  ├─ validateInput.isValidString()                       │   │
│  │  ├─ validateInput.isValidNumber()                       │   │
│  │  ├─ Zod schema parsing                                  │   │
│  │  └─ Throws AppError if validation fails               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               │                                   │
│                ┌──────────────┴──────────────┐                   │
│                │                             │                   │
│          ✅ Valid Data                  ❌ Invalid Data           │
│                │                             │                   │
│                ▼                             ▼                   │
│  ┌──────────────────────┐        ┌────────────────────┐         │
│  │ STORAGE LAYER        │        │ ERROR HANDLER      │         │
│  │                      │        │                    │         │
│  │ ├─ Try-Catch Block   │        │ ├─ AppError        │         │
│  │ ├─ Database Query    │        │ ├─ Send 400/500    │         │
│  │ ├─ Catch Errors      │        │ ├─ Log Error       │         │
│  │ └─ Return Data       │        │ └─ Friendly Message│         │
│  └──────┬───────────────┘        └────────┬───────────┘         │
│         │                                  │                     │
│         └──────────────┬───────────────────┘                     │
│                        │                                          │
│                        ▼                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  DATABASE LAYER (SQLite)                                │   │
│  │                                                          │   │
│  │  ├─ All 10 tables (yarn, knitting, dyeing, cutting)   │   │
│  │  ├─ Auto-save every 5 seconds                          │   │
│  │  ├─ Self-healing if corrupted                          │   │
│  │  └─ Full error handling                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              HTTP RESPONSE SENT BACK TO CLIENT                   │
│                   (Success or Error)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow with Error Handling

### Scenario 1: Valid Request

```
User sends:    POST /api/yarn with valid data
                         │
                         ▼
Middleware:    express.json() parses JSON ✅
                         │
                         ▼
Route Handler: asyncHandler wraps function
                         │
                         ▼
Validation:    Input is checked ✅
                         │
                         ▼
Storage:       Database operation succeeds ✅
                         │
                         ▼
Response:      200/201 with data
```

### Scenario 2: Invalid Input

```
User sends:    POST /api/yarn with empty batch code
                         │
                         ▼
Middleware:    express.json() parses JSON ✅
                         │
                         ▼
Route Handler: asyncHandler wraps function
                         │
                         ▼
Validation:    Input is checked ❌
               Throws AppError
                         │
                         ▼
asyncHandler:  Catches error
                         │
                         ▼
Error Handler: sendErrorResponse() called
                         │
                         ▼
Response:      400 with friendly message ❌
               Server NOT crashed ✅
```

### Scenario 3: Database Error

```
User sends:    Valid request
                         │
                         ▼
Validation:    Input checked ✅
                         │
                         ▼
Storage:       Try-catch wraps DB operation
               Database fails ❌
                         │
                         ▼
formatDatabaseError():  Converts technical error
                        to user-friendly message
                         │
                         ▼
Throws AppError with message
                         │
                         ▼
asyncHandler:  Catches error
                         │
                         ▼
Response:      500 with friendly message ❌
               Server continues running ✅
```

---

## 🛡️ Error Handling Layers

### Layer 1: Input Validation
```typescript
validateInput.isValidString(batchCode, "Batch Code", 1)
// If fails: Throws AppError immediately
// Prevents bad data from reaching database
```

### Layer 2: Zod Schema Validation
```typescript
const input = api.yarn.create.input.parse(req.body)
// If fails: Throws ZodError
// Caught by asyncHandler
```

### Layer 3: Try-Catch in Storage
```typescript
try {
  const result = await storage.createYarnBatch(input);
  return result;
} catch (error) {
  // Database errors caught here
  // Formatted into friendly messages
  throw new AppError(message, 500);
}
```

### Layer 4: asyncHandler Wrapper
```typescript
app.post(
  api.yarn.create.path,
  asyncHandler(async (req, res) => {
    // Any error thrown here is caught
    // and handled automatically
  })
)
```

### Layer 5: Global Error Handler Middleware
```typescript
app.use((err, _req, res, _next) => {
  // Any error not caught above comes here
  sendErrorResponse(res, err);
});
```

### Layer 6: Process-Level Error Listeners
```typescript
process.on("uncaughtException", (error) => {
  // Errors that escape everything else caught here
  logger.error("UNCAUGHT EXCEPTION", error);
  // Application keeps running
});
```

---

## 🗄️ Database Architecture

### Initialization Flow

```
App Starts
    │
    ├─ Load database file from disk
    │
    ├─ Validate file is not corrupted
    │  └─ If corrupted:
    │     ├─ Backup the bad file
    │     ├─ Delete the bad file
    │     └─ Create new empty database
    │
    ├─ Create all 10 tables
    │  └─ Each table: CREATE TABLE IF NOT EXISTS
    │
    ├─ Start auto-save timer
    │  └─ Save to disk every 5 seconds
    │
    └─ Server ready
```

### Data Flow

```
┌──────────────────┐
│  User Action     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│  Storage Method Called        │
│  (createYarnBatch, etc)       │
└────────┬─────────────────────┘
         │
         ├─ Validate all inputs
         │
         ├─ Try database operation
         │  └─ INSERT/SELECT/DELETE
         │
         ├─ Catch any errors
         │  └─ Format to friendly message
         │
         └─ Return result or throw error
              │
              ▼
         ┌──────────────────────────────┐
         │  In-Memory Database (SQLite) │
         └────────┬─────────────────────┘
                  │
                  ├─ Every 5 seconds
                  │  └─ Save to: data/garment-flow.db
                  │
                  └─ Backup on corrupted load
```

### Table Relationships

```
raw_material_purchases  factory_costs
         │                    │
         │                    │ (Financial)
         └────────┬───────────┘
                  │
              (Financial Data)
                  │
                  ▼
         ┌────────────────────┐
         │  DASHBOARD STATS   │
         └────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
yarn_batches→knitting→dyeing
                      │
                      ▼
                cutting→stitching→pressing→packing→containers
                  │        │         │         │        │
                  └────────┴─────────┴─────────┴────────┘
                     (Production Pipeline)
```

---

## 📊 Logging Architecture

### Log Collection

```
┌─────────────────────────────────────────┐
│  logger.info()   ℹ️  Normal information │
│  logger.warn()   ⚠️  Unusual situation │
│  logger.error()  ❌ Something failed    │
│  logger.debug()  🐛 Detailed info      │
└────────────┬────────────────────────────┘
             │
             ▼
    ┌──────────────────────┐
    │  Timestamp: YYYY-MM-DDTHH:mm:ss.SSSZ
    │  Level: INFO/WARN/ERROR
    │  Message: Clear text explanation
    │  Context: Optional data
    └────────────┬─────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Console Output │
        │  (Terminal)     │
        └─────────────────┘
```

### Example Log Sequence

```
[13:28:06.734Z] ℹ️  INFO: Registering API routes...
[13:28:06.741Z] ℹ️  INFO: Creating seed data...
[13:28:06.741Z] ℹ️  INFO: Creating yarn batch: YRN-001
[13:28:06.744Z] ℹ️  INFO: ✅ Seed data created successfully
[13:28:07.317Z] ℹ️  INFO: ✅ Server is listening on http://127.0.0.1:5000
[13:28:12.817Z] ℹ️  INFO: GET /api/dashboard/stats 200 in 6ms
```

---

## 🔒 Security/Safety Features

### Input Validation

```
Request Data
    │
    ├─ Check not null ✅
    ├─ Check not empty ✅
    ├─ Check correct type ✅
    ├─ Check numeric range ✅
    └─ Check string length ✅
         │
         ▼
    Store in Database ✅
```

### Database Safety

```
Write Operation
    │
    ├─ Validate input ✅
    ├─ Try database write
    ├─ Catch any errors
    ├─ Log what happened
    ├─ Return status
    └─ Continue running ✅
```

### Process Safety

```
Node.js Process
    │
    ├─ Catch uncaughtException ✅
    ├─ Catch unhandledRejection ✅
    ├─ Handle SIGTERM ✅
    ├─ Handle SIGINT ✅
    └─ Keep running ✅
```

---

## 📈 Performance Considerations

### Database Optimization

- **Auto-save every 5 seconds**: Balances between data safety and performance
- **IF NOT EXISTS**: Tables only created once
- **Indexes**: Queries ordered by date for performance
- **In-memory database**: Fast queries with periodic disk sync

### Request Optimization

- **asyncHandler**: Prevents blocking on errors
- **Try-catch**: Prevents cascading failures
- **Early validation**: Fails fast before database
- **Logging**: Minimal overhead with conditional debug

---

## 🚀 Deployment Considerations

### Development vs Production

```
DEVELOPMENT MODE:
├─ Vite hot reload enabled
├─ Detailed debug logging
├─ More verbose error messages
└─ Easier to develop

PRODUCTION MODE:
├─ Static file serving
├─ Optimized build
├─ Same error handling
└─ Ready for users
```

### Data Persistence

```
Development:
└─ data/garment-flow.db (auto-created)

Production:
├─ Backup old database before start
├─ Auto-create if missing
└─ Restore if corrupted
```

---

## 🔄 Error Recovery Strategy

### Database Corruption

```
Problem: garment-flow.db is corrupt
    │
    ▼
Detection: Try to load file
    │
    ▼ Fails
Backup: Copy to garment-flow.db.backup
    │
    ▼
Recovery: Create fresh database
    │
    ▼
Result: App starts with clean data ✅
```

### Process Crash (Now Prevented!)

```
Before: Uncaught error → Process dies ❌
After:  Uncaught error → Logged + App keeps running ✅
```

### Invalid Request

```
Problem: User sends invalid data
    │
    ▼
Validation Layer: Catches immediately
    │
    ▼
Friendly Error: Sent to user
    │
    ▼
Database: Never reached ✅
```

---

## 📚 Code Organization

### File Responsibilities

| File | Responsibility |
|------|-----------------|
| `index.ts` | Express setup, middleware, process listeners |
| `error-handler.ts` | Error classes, logging, validation helpers |
| `db.ts` | Database initialization, self-healing |
| `storage.ts` | All CRUD operations with error handling |
| `routes.ts` | API endpoints with asyncHandler |

### Dependency Flow

```
routes.ts
    │
    ├─ Imports: storage, error-handler, asyncHandler
    │
    ▼
storage.ts
    │
    ├─ Imports: db, error-handler, validation
    │
    ▼
db.ts
    │
    ├─ Imports: error-handler, logger
    │
    ▼
error-handler.ts
    │
    └─ No dependencies (utility module)
```

---

## ✅ Verification Checklist

- ✅ All errors caught (6 layers of handling)
- ✅ Database auto-recovers if corrupted
- ✅ Input validated before database access
- ✅ Process doesn't crash on unhandled errors
- ✅ Detailed logging for debugging
- ✅ Friendly error messages for users
- ✅ Graceful shutdown on signals
- ✅ Auto-save every 5 seconds

---

## 🎯 Design Principles

The new architecture follows these principles:

1. **Fail Gracefully**: Always respond with an error, never crash
2. **Log Everything**: Track what's happening for debugging
3. **Validate Early**: Check input before touching database
4. **Recover Automatically**: Database self-heals if corrupted
5. **Communicate Clearly**: Users get friendly error messages
6. **Keep Running**: Process continues despite errors
7. **Be Observable**: Detailed logs show what's happening

---

## 🎓 Learning Path

### Beginner
1. Understand request/response flow
2. See how errors are caught
3. Read the comments in code

### Intermediate
1. Understand validation layers
2. See how database errors are handled
3. Learn about try-catch patterns

### Advanced
1. Study process-level error handling
2. Understand database recovery strategies
3. See optimization techniques

---

## 🔗 Resources

- See `error-handler.ts` for utility functions
- See `storage.ts` for database operation patterns
- See `routes.ts` for endpoint implementation
- See `TESTING_GUIDE.md` for testing scenarios
- See `BACKEND_REWRITE_SUMMARY.md` for complete summary

---

**This architecture ensures your application is robust, observable, and maintainable! 🚀**
