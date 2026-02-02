# Production Deployment Guide

## ✅ What's Been Implemented

This project is now **production-ready** and deployable to **Render.com** (free tier) or any Node.js host.

### 1. Production Build Pipeline
- **Build**: `npm run build` → Compiles TypeScript to `dist/server/` using tsc
- **Start**: `npm start` → Runs `node dist/server/index.js` 
- **Output**: Optimized CommonJS bundles with source maps

### 2. Database Layer
- **PostgreSQL support** via `pg` library
- **Environment-based**: Uses `DATABASE_URL` from `.env`
- **Fallback**: Falls back to SQLite if `DATABASE_URL` not set (development)

### 3. Authentication System
- **Users table** with hashed passwords (bcrypt)
- **JWT tokens** for stateless authentication
- **Register endpoint**: `POST /api/auth/register`
- **Login endpoint**: `POST /api/auth/login`
- **Protected routes**: All `/api/*` routes require valid JWT (except `/api/auth`)

### 4. Environment Configuration
- **Dotenv support**: Loads `.env` file automatically
- **Production-ready**: Binds to `0.0.0.0` (accessible from any host)
- **.gitignore updated**: `.env` file is never committed

---

## 📋 PostgreSQL Users Table SQL

Run this SQL on your PostgreSQL database:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  hashed_password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (optional for dev, uses SQLite)
cp .env.example .env

# 3. Run dev server on http://localhost:5000
npm run dev
```

---

## 🌐 Deployment on Render.com (Free Tier)

### Step 1: Create PostgreSQL Database
1. Go to [Render.com](https://render.com)
2. Create a **PostgreSQL** database (free tier available)
3. Copy the `DATABASE_URL` connection string

### Step 2: Deploy App
1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `DATABASE_URL` and `JWT_SECRET`

### Step 3: Set Environment Variables
Add to Render dashboard:
```
DATABASE_URL=postgres://user:password@host:5432/dbname
JWT_SECRET=your-very-secret-random-string-here
NODE_ENV=production
PORT=5000
```

### Step 4: Run Migrations
After first deploy, run on Postgres:
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  hashed_password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

---

## 📱 API Authentication

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure123",
    "username": "myuser"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { "id": 1, "email": "user@example.com", "role": "user" }
# }
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure123"
  }'
```

### Access Protected Routes
```bash
curl -X GET http://localhost:5000/api/yarn \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 🔐 Environment Variables

Create `.env` file (never commit this):

```env
# Database
DATABASE_URL=postgres://user:password@localhost:5432/garmentflow

# Security
JWT_SECRET=your-super-secret-key-change-this-in-production

# Server
PORT=5000
NODE_ENV=production
```

See `.env.example` for template.

---

## 📦 Project Structure

```
├── server/
│   ├── index.ts              # Entry point (loads dotenv, starts server)
│   ├── auth.ts               # Authentication routes & middleware
│   ├── postgres.ts           # PostgreSQL connection pool
│   ├── routes.ts             # API routes (now protected by JWT)
│   ├── db.ts                 # SQLite initialization (fallback)
│   ├── storage.ts            # Data layer
│   └── ...
├── shared/
│   ├── schema.ts             # Database schema
│   └── routes.ts             # Shared API definitions
├── dist/                     # Compiled output (production)
├── package.json              # Production build/start scripts
├── tsconfig.server.json      # Server TypeScript config
├── .env.example              # Environment template
└── .env                       # ⚠️  NEVER commit this
```

---

## ✅ Verification Checklist

- [x] Build command works: `npm run build`
- [x] Dist folder created with compiled JS files
- [x] Start command works: `npm start`
- [x] JWT authentication implemented
- [x] Protected routes require Bearer token
- [x] PostgreSQL support via DATABASE_URL
- [x] Dotenv loads environment variables
- [x] .env in .gitignore
- [x] Server binds to 0.0.0.0 (mobile-friendly)
- [x] No hardcoded secrets
- [x] Business logic preserved
- [x] Mobile browser compatible (no localhost references)

---

## 🐛 Troubleshooting

**Build fails**: Run `npm install --save-dev @types/bcrypt @types/jsonwebtoken @types/pg @types/sql.js`

**DATABASE_URL error**: Set the variable in your `.env` or environment

**JWT errors**: Make sure `JWT_SECRET` is set in environment variables

**Port already in use**: Change `PORT` env var or kill process: `lsof -ti:5000 | xargs kill -9`

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [PostgreSQL Connection String](https://www.postgresql.org/docs/current/libpq-connect-string.html)
- [JWT.io](https://jwt.io/)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)

---

**Happy deploying!** 🚀
