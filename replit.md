# FabricFlow - Garment Production Management System

## Overview

FabricFlow is a full-stack garment manufacturing workflow tracker that monitors the complete production pipeline from raw yarn intake through final packing. The application tracks 6 sequential production stages: Yarn Inventory → Knitting → Cutting → Stitching → Pressing → Packing. Each stage records job data, quantities, and links to previous stages for full traceability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Build Tool**: Vite with hot module replacement
- **Form Handling**: React Hook Form with Zod validation

The frontend follows a page-per-stage pattern where each manufacturing stage (Yarn, Knitting, Cutting, etc.) has its own page component with consistent layout: fixed sidebar navigation, header, and data table with dialog-based forms for creating new records.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints organized by manufacturing stage
- **Validation**: Zod schemas shared between client and server via the `shared/` directory

The API routes are defined in `shared/routes.ts` with type-safe input/output schemas. This shared contract approach ensures frontend and backend stay synchronized on data shapes.

### Data Storage
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` defines all 6 production tables with foreign key relationships
- **Migrations**: Managed via Drizzle Kit (`db:push` command)

Each production stage table references the previous stage via foreign key, creating a linear workflow chain: yarnBatches → knittingJobs → cuttingJobs → stitchingJobs → pressingJobs → packingJobs.

### Build System
- **Development**: Vite dev server with Express backend (concurrent via tsx)
- **Production**: Custom build script using esbuild for server bundling and Vite for client
- **Output**: `dist/` directory with `index.cjs` (server) and `public/` (static client assets)

## External Dependencies

### Database
- **PostgreSQL**: Required. Connection via `DATABASE_URL` environment variable.
- **Drizzle ORM**: Schema-first approach with push-based migrations.

### UI Component Library
- **shadcn/ui**: Pre-built accessible components based on Radix UI primitives
- **Radix UI**: Headless UI primitives for dialogs, dropdowns, tooltips, etc.

### Charting
- **Recharts**: Used on Dashboard page for production analytics visualization

### Animation
- **Framer Motion**: Page transitions and UI animations on Dashboard

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `drizzle-orm` / `drizzle-zod`: Database ORM and schema validation
- `zod`: Runtime type validation shared across stack
- `date-fns`: Date formatting in tables
- `wouter`: Client-side routing
- `class-variance-authority` / `clsx` / `tailwind-merge`: Utility classes for component variants