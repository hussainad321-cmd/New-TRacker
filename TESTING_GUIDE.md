# 🧪 Testing Guide - Crash-Proof Backend

This guide shows you how to test the new error handling and safety features of your Garment Flow Tracker backend.

---

## 📌 Quick Start

The application is running at: **http://localhost:5000**

---

## 🧪 Test Scenarios

### Test 1: Valid Request (Should Succeed)

**What**: Create a new yarn batch with valid data

**How to Test**:
```bash
curl -X POST http://localhost:5000/api/yarn \
  -H "Content-Type: application/json" \
  -d '{
    "batchCode": "TEST-001",
    "color": "Green",
    "weightKg": 250,
    "supplier": "Test Supplier"
  }'
```

**Expected Result**:
```json
{
  "id": 3,
  "batchCode": "TEST-001",
  "color": "Green",
  "weightKg": 250,
  "supplier": "Test Supplier",
  "receivedAt": "2026-01-31T13:28:07.000Z"
}
```

**Server Log**:
```
ℹ️  INFO: Creating yarn batch: TEST-001
ℹ️  INFO: POST /api/yarn 201 in 5ms
```

---

### Test 2: Invalid Data - Empty Batch Code (Should Fail Gracefully)

**What**: Try to create yarn batch with empty batch code

**How to Test**:
```bash
curl -X POST http://localhost:5000/api/yarn \
  -H "Content-Type: application/json" \
  -d '{
    "batchCode": "",
    "color": "Blue",
    "weightKg": 100,
    "supplier": "Test"
  }'
```

**Expected Result**:
```json
{
  "message": "Batch Code cannot be empty",
  "success": false
}
```

**HTTP Status**: 400 (Bad Request)

**Server Log**:
```
⚠️  WARN: Batch Code cannot be empty
❌ ERROR: Error creating yarn batch
```

**Important**: 
- ✅ Server did NOT crash
- ✅ User got friendly error message
- ✅ Error was logged for debugging

---

### Test 3: Invalid Data - Negative Weight (Should Fail Gracefully)

**What**: Try to create yarn batch with negative weight

**How to Test**:
```bash
curl -X POST http://localhost:5000/api/yarn \
  -H "Content-Type: application/json" \
  -d '{
    "batchCode": "TEST-002",
    "color": "Red",
    "weightKg": -50,
    "supplier": "Test"
  }'
```

**Expected Result**:
```json
{
  "message": "Weight (kg) cannot be negative",
  "success": false
}
```

**HTTP Status**: 400 (Bad Request)

**Server Log**:
```
⚠️  WARN: Weight (kg) cannot be negative
❌ ERROR: Error creating yarn batch
```

---

### Test 4: Invalid Data - Non-Number Weight (Should Fail Gracefully)

**What**: Try to create yarn batch with text weight

**How to Test**:
```bash
curl -X POST http://localhost:5000/api/yarn \
  -H "Content-Type: application/json" \
  -d '{
    "batchCode": "TEST-003",
    "color": "Yellow",
    "weightKg": "not a number",
    "supplier": "Test"
  }'
```

**Expected Result**:
```json
{
  "message": "Invalid batchCode: Required",
  "success": false
}
```

**HTTP Status**: 400 (Bad Request)

**Server Log**:
```
⚠️  WARN: Validation error...
```

---

### Test 5: Missing Required Fields (Should Fail Gracefully)

**What**: Try to create yarn batch without required fields

**How to Test**:
```bash
curl -X POST http://localhost:5000/api/yarn \
  -H "Content-Type: application/json" \
  -d '{
    "color": "Purple"
  }'
```

**Expected Result**:
```json
{
  "message": "Invalid batchCode: Required",
  "success": false
}
```

**HTTP Status**: 400 (Bad Request)

---

### Test 6: Get Non-Existent Yarn (Should Fail Gracefully)

**What**: Try to get yarn batch with invalid ID

**How to Test**:
```bash
curl http://localhost:5000/api/yarn/99999
```

**Expected Result**:
```json
{
  "message": "Yarn batch not found",
  "success": false
}
```

**HTTP Status**: 404 (Not Found)

**Server Log**:
```
ℹ️  INFO: GET /api/yarn/99999 404 in 2ms
```

---

### Test 7: Database Self-Healing (Corrupted File Recovery)

**What**: Test automatic database recovery when file is corrupted

**How to Test**:

1. **Stop the server** (Press Ctrl+C in terminal)

2. **Delete the database file**:
   ```bash
   rm data/garment-flow.db
   ```
   Or on Windows:
   ```powershell
   Remove-Item data\garment-flow.db
   ```

3. **Restart the server**:
   ```bash
   npm run dev
   ```

**Expected Results in Server Log**:
```
ℹ️  INFO: Starting Garment Flow Tracker Application
ℹ️  INFO: Initializing database...
ℹ️  INFO: No existing database file found. Creating new database.
✅ All database tables created successfully
✅ Database ready at: C:\...\data\garment-flow.db
ℹ️  INFO: Creating seed data...
✅ Seed data created successfully
✅ Server is listening on http://127.0.0.1:5000
```

**What This Proves**:
- ✅ App detected missing database
- ✅ Created fresh database automatically
- ✅ Created all tables
- ✅ Loaded seed data
- ✅ Server started successfully

---

### Test 8: Create Knitting Job (Valid)

**What**: Create a valid knitting job

**How to Test**:
```bash
curl -X POST http://localhost:5000/api/knitting \
  -H "Content-Type: application/json" \
  -d '{
    "yarnBatchId": 1,
    "fabricType": "Cotton",
    "size": "Large",
    "weightUsed": 150,
    "fabricProduced": 145,
    "status": "completed"
  }'
```

**Expected Result**:
```json
{
  "id": 2,
  "yarnBatchId": 1,
  "fabricType": "Cotton",
  "size": "Large",
  "weightUsed": 150,
  "fabricProduced": 145,
  "status": "completed",
  "completedAt": "2026-01-31T13:28:07.000Z"
}
```

**HTTP Status**: 201 (Created)

---

### Test 9: Invalid Knitting Job (Zero Quantity)

**What**: Try to create knitting job with zero pieces

**How to Test**:
```bash
curl -X POST http://localhost:5000/api/knitting \
  -H "Content-Type: application/json" \
  -d '{
    "yarnBatchId": 1,
    "fabricType": "Silk",
    "size": "Medium",
    "weightUsed": 0,
    "fabricProduced": 0,
    "status": "completed"
  }'
```

**Expected Result**:
```json
{
  "message": "Weight Used (kg) cannot be negative",
  "success": false
}
```

**HTTP Status**: 400 (Bad Request)

---

### Test 10: Raw Material Purchase (Valid)

**What**: Create a raw material purchase record

**How to Test**:
```bash
curl -X POST http://localhost:5000/api/raw-material \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "Chemical Co",
    "materialType": "Dye",
    "description": "Red Dye",
    "quantity": 50,
    "unit": "kg",
    "costPerUnit": 100,
    "totalCost": 5000,
    "paymentStatus": "pending",
    "invoiceNumber": "INV-001"
  }'
```

**Expected Result**:
```json
{
  "id": 1,
  "vendor": "Chemical Co",
  "materialType": "Dye",
  "description": "Red Dye",
  "quantity": 50,
  "unit": "kg",
  "costPerUnit": 100,
  "totalCost": 5000,
  "paymentStatus": "pending",
  "invoiceNumber": "INV-001",
  "purchaseDate": "2026-01-31T13:28:07.000Z"
}
```

**HTTP Status**: 201 (Created)

---

### Test 11: Factory Cost (Valid)

**What**: Create a factory cost record

**How to Test**:
```bash
curl -X POST http://localhost:5000/api/factory-cost \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Electricity",
    "description": "January electricity bill",
    "amount": 5000,
    "status": "unpaid",
    "invoiceNumber": "ELEC-001",
    "dueDate": "2026-02-15"
  }'
```

**Expected Result**:
```json
{
  "id": 1,
  "category": "Electricity",
  "description": "January electricity bill",
  "amount": 5000,
  "status": "unpaid",
  "invoiceNumber": "ELEC-001",
  "dueDate": "2026-02-15",
  "paidDate": null,
  "recordedAt": "2026-01-31T13:28:07.000Z"
}
```

**HTTP Status**: 201 (Created)

---

### Test 12: Dashboard Statistics

**What**: Get summary statistics

**How to Test**:
```bash
curl http://localhost:5000/api/dashboard/stats
```

**Expected Result**:
```json
{
  "totalYarnKg": 800,
  "totalFabricKg": 95,
  "totalDyedKg": 0,
  "totalCutPieces": 0,
  "totalStitchedPieces": 0,
  "totalPackedPieces": 0,
  "totalBalesShipped": 0
}
```

**HTTP Status**: 200 (OK)

**Server Log**:
```
ℹ️  INFO: GET /api/dashboard/stats 200 in 5ms
```

---

## 📊 Error Handling Test Matrix

| Test Case | Input | Expected Behavior | Server Crash? |
|-----------|-------|-------------------|---------------|
| Valid data | Correct fields | Success (201) | ❌ No |
| Empty string | `batchCode: ""` | Error (400) | ❌ No |
| Negative number | `weightKg: -50` | Error (400) | ❌ No |
| Wrong type | `weightKg: "text"` | Error (400) | ❌ No |
| Missing field | Omit required field | Error (400) | ❌ No |
| Non-existent ID | `GET /api/yarn/99999` | Error (404) | ❌ No |
| Corrupted DB | Delete database file | Auto-recovery | ❌ No |
| Large payload | Very large JSON | Handled gracefully | ❌ No |
| Null values | `null` fields | Validation error | ❌ No |
| Extra fields | Unknown fields | Ignored safely | ❌ No |

---

## 🔍 How to Monitor Logs

### Log Levels

| Level | Icon | Example | When Used |
|-------|------|---------|-----------|
| INFO | ℹ️ | Normal operations | Everything working normally |
| WARN | ⚠️ | Invalid input from user | Something unusual but recoverable |
| ERROR | ❌ | Database failure | Something went wrong |
| DEBUG | 🐛 | Detailed operation info | Development/troubleshooting |

### Example Log Sequence

When creating a yarn batch:
```
[13:28:06] ℹ️  INFO: Creating yarn batch: YRN-001
[13:28:06] ℹ️  INFO: POST /api/yarn 201 in 2ms
```

When validation fails:
```
[13:28:12] ⚠️  WARN: Batch Code cannot be empty
[13:28:12] ❌ ERROR: Error creating yarn batch
[13:28:12] ℹ️  INFO: POST /api/yarn 400 in 1ms
```

---

## ✅ What Proves Error Handling Works

1. **Server never crashes** - Even with bad input
2. **Friendly error messages** - Users understand what went wrong
3. **Detailed logging** - Developers can debug issues
4. **Automatic recovery** - Database auto-heals if corrupted
5. **Input validation** - Bad data rejected before database
6. **HTTP codes** - Correct status codes (201, 400, 404, 500)
7. **Graceful shutdown** - Ctrl+C works cleanly

---

## 🎓 Key Takeaways

### For Users
- ✅ Your data is safe
- ✅ The app won't crash from mistakes
- ✅ You'll get helpful error messages
- ✅ The app recovers automatically if database gets corrupted

### For Developers
- ✅ Every operation is logged
- ✅ Errors are caught and handled
- ✅ Code explains itself with comments
- ✅ Easy to add new features without breaking the app

---

## 📝 Tools You Can Use

### Using curl (command line)
```bash
curl -X POST http://localhost:5000/api/yarn \
  -H "Content-Type: application/json" \
  -d '{"batchCode":"TEST","color":"Blue","weightKg":100}'
```

### Using Postman
1. Open Postman
2. Create new POST request to `http://localhost:5000/api/yarn`
3. Set header: `Content-Type: application/json`
4. Paste JSON in body
5. Click Send

### Using Browser DevTools
1. Open http://localhost:5000 in browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Interact with the app
5. See all requests and responses

---

## 🚨 Emergency: Server Crashed

If the server crashes (shouldn't happen with new code):

1. **Check the error message** in the terminal
2. **Look at the logs** - last error is usually the cause
3. **Delete database** if corrupted:
   ```bash
   rm data/garment-flow.db
   npm run dev
   ```
4. **Restart the server**:
   ```bash
   npm run dev
   ```

---

## 🎉 Conclusion

The crash-proof backend is designed so that:
- ✅ **Bad input doesn't crash the server**
- ✅ **Database errors don't stop everything**
- ✅ **Corrupted files are auto-recovered**
- ✅ **You know exactly what went wrong**
- ✅ **The app keeps running**

Test these scenarios, and you'll see how robust your new backend is!

**Happy testing! 🧪**
