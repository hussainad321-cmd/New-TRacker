# ⚡ Quick Start - Visual Guide

**Simple, visual guide to the most common tasks**

---

## 🚀 Start the App (30 Seconds)

```
Step 1: Open PowerShell
        └─ Right-click desktop
           └─ Select "Open PowerShell here"

Step 2: Navigate to app folder
        └─ cd "C:\Users\786\Desktop\Garment-Flow-Tracker\Garment-Flow-Tracker"

Step 3: Run the app
        └─ npm run dev

Step 4: Wait for message
        └─ ✅ Server is listening on http://127.0.0.1:5000
           ✅ Ready to accept requests!

Step 5: Open browser
        └─ Go to: http://localhost:5000

✅ Done! App is running!
```

---

## 📱 Access on Mobile Phone (2 Minutes)

```
Step 1: Find your computer's IP
        ├─ Open PowerShell
        ├─ Type: ipconfig
        └─ Look for: "IPv4 Address: 192.168.1.100"

Step 2: Make sure phone is on same WiFi
        └─ Check WiFi name matches computer

Step 3: On phone, open any browser
        ├─ Chrome, Safari, Firefox, etc.
        └─ Go to: http://192.168.1.100:5000
           (Replace 192.168.1.100 with YOUR IP)

Step 4: See the app!
        └─ Full app works on phone
           All features available
           Data syncs automatically

✅ Done! Phone can access the app!
```

---

## 👤 Create Your First User (1 Minute)

**Using PowerShell:**

```powershell
# Copy and paste this entire block:

$user = @{
    username = "john_smith"
    email = "john@factory.com"
    role = "user"
    department = "Knitting"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:5000/api/users" `
    -Method POST `
    -Body $user `
    -ContentType "application/json"

# You should see:
# StatusCode        : 201
# StatusDescription : Created
```

**Result:** User "john_smith" created and saved! ✅

---

## 👥 Create Multiple Users (5 Minutes)

**Copy-paste this:**

```powershell
# Create Admin
$admin = @{username="admin"; role="admin"; department="Management"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method POST -Body $admin -ContentType "application/json"

# Create Manager
$mgr = @{username="supervisor"; role="manager"; department="Management"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method POST -Body $mgr -ContentType "application/json"

# Create Workers
$worker1 = @{username="ali_knitting"; role="user"; department="Knitting"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method POST -Body $worker1 -ContentType "application/json"

$worker2 = @{username="fatima_dyeing"; role="user"; department="Dyeing"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method POST -Body $worker2 -ContentType "application/json"

# Done! 4 users created
```

✅ **4 users created!**

---

## 📊 List All Users (30 Seconds)

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/users" | Select-Object -ExpandProperty Content | ConvertFrom-Json | Format-Table
```

**Result:**
```
id username         email                 role   department     status created_at
-- --------         -----                 ----   ----------     ------ ----------
 1 john_smith       john@factory.com      user   Knitting       active
 2 admin            (null)                admin  Management     active
 3 supervisor       (null)                manager Management     active
```

✅ **All users listed!**

---

## ✏️ Update a User (1 Minute)

**Promote user to manager:**

```powershell
$update = @{
    role = "manager"
    department = "Management"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:5000/api/users/1" `
    -Method PUT `
    -Body $update `
    -ContentType "application/json"
```

**Result:** User 1 is now a manager! ✅

---

## 💾 Backup Your Data (30 Seconds)

**PowerShell:**
```powershell
# Create a backup
Copy-Item `
    "data\garment-flow.db" `
    "data\garment-flow.db.backup.$(Get-Date -f 'yyyy-MM-dd')"

Write-Host "✅ Backup created!"
```

**Result:**
```
data/
├─ garment-flow.db              (Current database)
└─ garment-flow.db.backup.2026-01-31   (Backup file)
```

✅ **Data backed up!**

---

## 🔄 Restore from Backup (30 Seconds)

**If data corrupted:**

```powershell
# Restore from backup
Copy-Item `
    "data\garment-flow.db.backup.2026-01-31" `
    "data\garment-flow.db" `
    -Force

Write-Host "✅ Data restored!"

# Restart app
npm run dev
```

✅ **Data restored!**

---

## 🔍 Search for Data

**In browser:**
1. Open app: http://localhost:5000
2. Look for search box (top right)
3. Type: "batch code" or "color name"
4. See results in real-time

✅ **Instant search!**

---

## 📊 View Statistics

**In browser:**
1. Open app: http://localhost:5000
2. See Dashboard with:
   - Total yarn (kg)
   - Total fabric produced (kg)
   - Total dyed (kg)
   - Total pieces cut
   - Total stitched
   - Total packed
   - Total bales shipped

✅ **Live statistics!**

---

## ➕ Create a Yarn Batch

**In browser:**
1. Click "Yarn Inventory" (top left)
2. Click "Add Batch" (blue button)
3. Enter:
   - Batch Code: YRN-001
   - Color: Blue
   - Weight (kg): 500
   - Supplier: Textile Co
4. Click "Create"
5. ✅ Data saved immediately!

---

## ✂️ Create a Cutting Job

**In browser:**
1. Click "Cutting" (left sidebar)
2. Click "Add Cutting Job"
3. Select dyeing job
4. Enter:
   - Style Code: STY-001
   - Size: M
   - Quantity: 100
5. Click "Create"
6. ✅ Data saved!

---

## 💰 Track Factory Costs

**In browser:**
1. Click "Factory Costs" (left sidebar)
2. Click "Add Cost"
3. Enter:
   - Category: Electricity
   - Description: January electricity bill
   - Amount: $500
   - Status: Unpaid
4. Click "Create"
5. ✅ Cost tracked!

---

## 🌍 Deploy Online (5 Minutes)

### Option 1: Ngrok (Remote Access)

```powershell
# 1. Download ngrok: https://ngrok.com
# 2. Extract to folder
# 3. Run:

cd "C:\path\to\ngrok"
./ngrok.exe http 5000

# You'll see:
# Forwarding https://abc123.ngrok.io -> http://localhost:5000

# Share this URL: https://abc123.ngrok.io
```

### Option 2: Replit (Cloud)

```
1. Go to https://replit.com
2. Create new Node.js Repl
3. Upload your project folder
4. Run: npm install && npm run dev
5. Get public URL
6. Share the URL!
```

✅ **Now accessible from anywhere!**

---

## 🆘 Common Issues

### "Can't connect to phone"
```
1. Check IP is correct: ipconfig
2. Check phone on same WiFi
3. Try: http://192.168.1.100:5000
4. Refresh page (swipe down)
5. Try different browser
```

### "App won't start"
```
1. Check Node.js installed: node --version
2. Run: npm install
3. Run: npm run dev
4. Check if port 5000 is free
```

### "Data disappeared"
```
1. Check backup exists: ls data/
2. Restore: Copy-Item data/garment-flow.db.backup data/garment-flow.db -Force
3. Restart app: npm run dev
```

### "Can't create user"
```
1. Check username is unique
2. Check server is running
3. Try different username
4. Check PowerShell syntax
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Stop app |
| `Ctrl+L` | Clear terminal |
| `F5` | Refresh browser |
| `Ctrl+F` | Search on page |
| `Tab` | Next form field |

---

## 🎯 Daily Workflow

```
Morning:
├─ Start app: npm run dev
├─ Open: http://localhost:5000
└─ Check dashboard stats

Throughout Day:
├─ Create/edit production records
├─ Track yarn to finished goods
└─ Multiple users working simultaneously

Evening:
├─ Review statistics
├─ Create backup (weekly)
└─ Everything auto-saved

Next Day:
├─ Start app again
└─ All previous data still there ✅
```

---

## 📱 Mobile Workflow

```
Worker on Factory Floor:
├─ Open phone browser: http://COMPUTER_IP:5000
├─ See real-time dashboard
├─ Scan yarn batch code
├─ Create cutting job
├─ See updated stats instantly
└─ All workers see same data

Manager in Office:
├─ Open desktop: http://localhost:5000
├─ See what workers entered
├─ Add factory costs
├─ View total production
└─ Export reports
```

---

## 🔒 Security Checklist

- [ ] Database file exists: `data/garment-flow.db`
- [ ] Database is backed up daily
- [ ] Backups stored in safe location
- [ ] Only trusted people have access
- [ ] Computer on secure WiFi
- [ ] Firewall allows port 5000
- [ ] No passwords sent unencrypted

---

## ✅ Verification Steps

### Server Running?
```powershell
# You should see in terminal:
# ✅ Server is listening on http://127.0.0.1:5000
# ✅ Ready to accept requests!
```

### App Accessible?
```
Open: http://localhost:5000
Should see: Dashboard with statistics
```

### Database Working?
```powershell
# Check file exists:
Test-Path "data\garment-flow.db"
# Should show: True
```

### Mobile Working?
```
Phone opens: http://192.168.1.100:5000
Should see: Same app as desktop
```

### Users Created?
```powershell
Invoke-WebRequest http://localhost:5000/api/users
# Should list users you created
```

✅ **All working!**

---

## 📚 Next Steps

1. **Right Now:**
   - Run: `npm run dev`
   - Open: `http://localhost:5000`

2. **Next 5 Minutes:**
   - Test on mobile phone

3. **This Hour:**
   - Create first user

4. **Today:**
   - Create test data
   - Test all features

5. **Tomorrow:**
   - Invite team member
   - Set up backups

6. **This Week:**
   - Go live with real data!

---

## 🎉 You're Ready!

Everything is set up. Everything works. Start using it!

```bash
npm run dev
```

Then:
```
http://localhost:5000
```

**That's all you need to know to get started!** 🚀

---

## 📖 For More Details

- **Full setup:** [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **User management:** [USER_MANAGEMENT.md](USER_MANAGEMENT.md)
- **Mobile/deployment:** [MOBILE_DEPLOYMENT.md](MOBILE_DEPLOYMENT.md)
- **All commands:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

**Good luck! You've got this! 💪**

