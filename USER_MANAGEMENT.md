# 👥 User Management Guide - Garment Flow Tracker

**Complete guide for creating, managing, and tracking team members**

---

## 📱 User Management Features

Your app now includes a complete user management system that lets you:

✅ Create user accounts for each team member  
✅ Assign roles (Admin, Manager, User)  
✅ Track departments (Knitting, Dyeing, Stitching, etc.)  
✅ View all team members  
✅ Edit user information  
✅ Deactivate users without deleting data  
✅ Monitor last login times  

---

## 🚀 Quick Start - Create Your First User

### Method 1: Through the Web Interface (Easy - Coming Soon)
We're adding a UI for user creation. Until then, use Method 2 or 3.

### Method 2: Using API (PowerShell)

```powershell
# Create a new user
$UserData = @{
    username = "john_knitter"
    email = "john@factory.com"
    role = "user"
    department = "Knitting"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:5000/api/users" `
    -Method POST `
    -Body $UserData `
    -ContentType "application/json"
```

**Expected Response:**
```json
{
  "id": 1,
  "username": "john_knitter",
  "email": "john@factory.com",
  "role": "user",
  "department": "Knitting",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": null
}
```

### Method 3: Using Curl (Linux/Mac/PowerShell)

```bash
# Create a user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria_stitcher",
    "email": "maria@factory.com",
    "role": "user",
    "department": "Stitching"
  }'
```

---

## 📋 User Fields Explained

| Field | Required | Example | Notes |
|-------|----------|---------|-------|
| **username** | ✅ Yes | `john_knitter` | Must be unique, no spaces |
| **email** | ❌ No | `john@factory.com` | Optional but recommended |
| **role** | ❌ No | `user` | `admin`, `manager`, or `user` |
| **department** | ❌ No | `Knitting` | e.g., "Dyeing", "Cutting", "Stitching", "Pressing", "Packing", "Management" |
| **status** | ❌ No | `active` | `active` or `inactive` |

---

## 👨‍💼 User Roles

### 1. Admin (Full Access)
- Create/edit/delete other users
- View all data
- Change system settings
- **Good for:** Factory owner, IT manager

### 2. Manager (Supervisor Access)
- View all production data
- Create/edit records
- Cannot delete users
- **Good for:** Supervisors, production leads

### 3. User (Standard Access)
- View data in their department
- Create/edit records in their department
- Cannot manage other users
- **Good for:** Workers, department staff

---

## 🔄 Common Tasks

### List All Users

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/users" | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Curl:**
```bash
curl http://localhost:5000/api/users | jq
```

**Expected Output:**
```json
[
  {
    "id": 1,
    "username": "john_knitter",
    "email": "john@factory.com",
    "role": "user",
    "department": "Knitting",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLogin": "2024-01-15T14:22:00Z"
  },
  {
    "id": 2,
    "username": "maria_stitcher",
    "email": "maria@factory.com",
    "role": "user",
    "department": "Stitching",
    "status": "active",
    "createdAt": "2024-01-15T10:35:00Z",
    "lastLogin": null
  }
]
```

### Get Specific User

```powershell
# Get user with ID 1
Invoke-WebRequest -Uri "http://localhost:5000/api/users/1"
```

### Update User Information

```powershell
# Promote user to manager
$UpdateData = @{
    role = "manager"
    department = "Management"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:5000/api/users/1" `
    -Method PUT `
    -Body $UpdateData `
    -ContentType "application/json"
```

### Deactivate User

```powershell
# Deactivate without deleting (preserves their historical data)
$UpdateData = @{
    status = "inactive"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:5000/api/users/1" `
    -Method PUT `
    -Body $UpdateData `
    -ContentType "application/json"
```

### Delete User

```powershell
# Completely remove user from system
Invoke-WebRequest `
    -Uri "http://localhost:5000/api/users/1" `
    -Method DELETE
```

**⚠️ Warning:** Deleting a user removes them and all their associated data. To preserve data, use "Deactivate" instead.

---

## 📊 Example: Complete User Setup for Small Factory

### Scenario
Small garment factory with 10 workers:
- 1 Owner (Admin)
- 1 Supervisor (Manager)
- 2 Knitting operators
- 2 Dyeing operators
- 2 Stitching operators
- 1 Packing operator
- 1 Accountant

### Setup Script

```powershell
# Admin - Owner
$admin = @{username="admin"; email="owner@factory.com"; role="admin"; department="Management"}

# Manager - Supervisor
$mgr = @{username="supervisor"; email="supervisor@factory.com"; role="manager"; department="Management"}

# Workers
$users = @(
    @{username="ali_knitting1"; email="ali@factory.com"; role="user"; department="Knitting"},
    @{username="ahmed_knitting2"; email="ahmed@factory.com"; role="user"; department="Knitting"},
    @{username="fatima_dyeing1"; email="fatima@factory.com"; role="user"; department="Dyeing"},
    @{username="leila_dyeing2"; email="leila@factory.com"; role="user"; department="Dyeing"},
    @{username="maria_stitching1"; email="maria@factory.com"; role="user"; department="Stitching"},
    @{username="sara_stitching2"; email="sara@factory.com"; role="user"; department="Stitching"},
    @{username="khalid_packing"; email="khalid@factory.com"; role="user"; department="Packing"},
    @{username="accountant"; email="accounts@factory.com"; role="manager"; department="Finance"}
)

# Create all users
$admin | ConvertTo-Json | % {
    Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method POST -Body $_ -ContentType "application/json"
}

$mgr | ConvertTo-Json | % {
    Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method POST -Body $_ -ContentType "application/json"
}

foreach ($user in $users) {
    $user | ConvertTo-Json | % {
        Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method POST -Body $_ -ContentType "application/json"
    }
}

Write-Host "✅ All users created!"
```

---

## 🔐 Multi-User Data Access

### Important: Current Data Sharing Model

**Right now:** All users see and can modify the same shared data.

This is perfect for small teams because:
- ✅ Real-time collaboration
- ✅ Everyone sees live updates
- ✅ No delays waiting for approvals
- ✅ Simple to understand and use

### Future: Role-Based Data Access

When you're ready, we can add:
- Each role sees different data
- Admins can see everything
- Users only see their department
- Audit trail of who changed what
- Approval workflows

---

## 📱 Mobile Phone Multi-User Access

### Scenario: Multiple people on same phone

1. **Person A** logs in on iPhone at 9:00 AM
   ```
   http://192.168.1.100:5000
   ```
   - Uses data as user_a
   - Creates yarn batch

2. **Person B** takes the iPhone at 10:00 AM
   ```
   http://192.168.1.100:5000
   (reload page)
   ```
   - Same app, same data
   - Sees yarn batch created by person_a
   - Can continue work

**Current:** Users are tracked but data is shared. Everyone sees everything.

---

## 🔧 API Reference

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create new user |
| GET | `/api/users/:id` | Get specific user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Request/Response Examples

#### Create User
**Request:**
```
POST /api/users
Content-Type: application/json

{
  "username": "john_smith",
  "email": "john@example.com",
  "role": "user",
  "department": "Knitting"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "john_smith",
  "email": "john@example.com",
  "role": "user",
  "department": "Knitting",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": null
}
```

#### Update User Role
**Request:**
```
PUT /api/users/1
Content-Type: application/json

{
  "role": "manager",
  "department": "Management"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_smith",
  "email": "john@example.com",
  "role": "manager",
  "department": "Management",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-01-15T14:22:00Z"
}
```

---

## ⚠️ Error Handling

### Common Errors and Solutions

#### Error: "Username is already taken"
```
Message: Username 'john_knitter' is already taken
Solution: Use a different username or update existing user
```

#### Error: "User not found"
```
Message: User with ID 999 not found
Solution: Check the ID number, list all users with GET /api/users
```

#### Error: "Username cannot be empty"
```
Message: Username cannot be empty
Solution: Provide a non-empty username
```

---

## 📊 Data Persistence with Users

### User Data Storage

All user information is automatically saved to:
```
C:\Users\786\Desktop\Garment-Flow-Tracker\Garment-Flow-Tracker\data\garment-flow.db
```

### User Changes Are Permanent

- Creating a user → Saved immediately
- Updating a user → Saved immediately
- Deleting a user → Cannot be undone
- Last login → Updated automatically

### Backup User Data

```powershell
# Backup users table
$users = Invoke-WebRequest -Uri "http://localhost:5000/api/users" | Select-Object -ExpandProperty Content
$users | Out-File "users_backup_$(Get-Date -Format 'yyyy-MM-dd').json"

Write-Host "✅ Users backed up!"
```

---

## 🎯 Best Practices

### 1. Username Convention
Use easy-to-remember format:
- ✅ `john_knitting` (department + name)
- ✅ `ali_dyeing_1` (for multiple people in same role)
- ❌ `user1` (unclear who this is)

### 2. Email Convention
Use real factory emails:
- ✅ `john@garment-factory.com`
- ✅ `ali@company.com`
- ❌ `user123@gmail.com` (too generic)

### 3. Role Assignment
Start simple:
- New staff → `user` role
- Experienced staff → `manager` role
- Owner/IT → `admin` role

### 4. Deactivate Instead of Delete
```
When someone leaves:
- Set status to "inactive"
- Keeps all their historical data
- Can be reactivated later
- Better for auditing
```

### 5. Regular Backups
```powershell
# Weekly backup script
$date = Get-Date -Format "yyyy-MM-dd"
Copy-Item "data/garment-flow.db" "backups/garment-flow.db.$date.backup"
```

---

## 🚀 Advanced Features (Future)

### Coming Soon:

1. **User Authentication**
   - Password login
   - Session management
   - Auto-logout after inactivity

2. **Role-Based Access Control (RBAC)**
   - Admins can see everything
   - Users only see their department
   - Managers see their team

3. **Activity Logs**
   - Track who created/edited what
   - When changes were made
   - Undo capability

4. **Permissions**
   - Can users delete data?
   - Can users export data?
   - Can users see costs/financial data?

5. **User Groups**
   - Assign multiple users to departments
   - Bulk operations
   - Department-wide notifications

---

## ✅ Verification Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Can access app (http://localhost:5000)
- [ ] Created first user via API
- [ ] Listed all users
- [ ] Updated user information
- [ ] All data persists after refresh
- [ ] Multiple users created successfully

---

## 📞 Support

### Check these if something isn't working:

1. **Server running?**
   ```bash
   npm run dev
   ```

2. **Can reach app?**
   ```
   http://localhost:5000
   ```

3. **Database exists?**
   ```bash
   Test-Path "data/garment-flow.db"
   ```

4. **View recent errors?**
   ```
   Check PowerShell terminal for error messages
   ```

---

## 🎓 Learning Resources

- [REST API Basics](https://restfulapi.net/)
- [PowerShell WebRequest](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest)
- [JSON Format](https://www.json.org/)
- [API Testing with Postman](https://www.postman.com/)

---

## 🎉 You're Ready!

Your user management system is ready to use:

1. ✅ Create users
2. ✅ Assign roles and departments
3. ✅ Track team members
4. ✅ Monitor usage

**Start creating users now!** 🚀

```bash
# Make sure server is running
npm run dev

# Then open in browser
http://localhost:5000
```

---

## 📝 Notes

- Users are optional - app works without user accounts
- All users currently see the same data
- No passwords required yet (coming soon)
- User information is never sent outside your computer
- Complete privacy - no cloud, no tracking, no analytics

**Everything stays on your computer. Your data is yours.** 🔒

