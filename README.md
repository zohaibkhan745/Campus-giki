# 🎓 Campus GIKI

> **Centralized Platform for GIKI Students, Societies, Events, and Campus Activities.**

Campus GIKI is a modern, full-stack web application designed for the **Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI)**. It bridges the gap between students, student societies, faculty advisors, and the Directorate of Student Affairs (DSA). The platform streamlines event proposals, approval workflows, annual planning, media distribution, and campus announcements into a unified digital ecosystem.

---

## 🌟 Key Features

### 👥 Multi-Role Authorization & Workflows
* **🎓 Students**: Browse global campus announcements, search/filter student societies, explore the campus interactive calendar, view event details, and access registration links.
* **🏛️ Student Societies**: Manage society profile portfolios (logos, banners, social links, contacts), publish news/announcements with direct WebP compressed image uploads, submit annual event plans, and create event proposals.
* **👨‍🏫 Faculty Advisors**: Review, approve, or request changes on event proposals and annual plans submitted by their assigned societies.
* **🛡️ DSA Admin (Directorate of Student Affairs)**: Full administrative oversight over campus activities, approving/rejecting final event requests, managing advisor assignments, managing categories, and broadcasting global announcements.

### 🖼️ Media & Storage Engine
* **Sharp WebP Compression Engine**: Automatically converts and compresses uploaded JPEGs/PNGs into lightweight WebP format on upload, reducing file size by 60–70% for sub-50ms loading times across campus networks.
* **Storage Provider Strategy Pattern**: Abstracted `IStorageProvider` architecture allowing instant local disk storage during development (`STORAGE_DRIVER=local`) and zero-code-change deployment to **GIKI Server (Nginx)** or **MinIO / AWS S3** in production.

### 📅 Campus Event Calendar & Approval Pipeline
* **FullCalendar Integration**: Visual monthly, weekly, and daily interactive event schedules.
* **Multi-Stage Approval Pipeline**:
  $$\text{Society Event Creation} \longrightarrow \text{Faculty Advisor Review} \longrightarrow \text{DSA Admin Approval} \longrightarrow \text{Published to Campus Feed}$$

---

## 🛠️ Tech Stack

### **Frontend (Client)**
* **Core Framework**: React 19 + TypeScript + Vite 8
* **Styling**: TailwindCSS v4 with custom design tokens
* **State & Data Fetching**: TanStack React Query v5 (caching, background refetching, optimistic updates)
* **Routing**: React Router v7 (Role-protected route guards)
* **Forms & Validation**: React Hook Form + Zod schemas
* **Calendar UI**: FullCalendar v6 (DayGrid, TimeGrid, Interaction plugins)
* **Icons**: Lucide React

### **Backend (Server)**
* **Core Framework**: NestJS v11 (TypeScript, Modular Architecture)
* **Database & ORM**: Prisma ORM v6 (SQLite / PostgreSQL ready)
* **Authentication**: JWT (JSON Web Tokens) + Passport.js + Bcrypt password hashing
* **Image Processing**: Sharp (WebP conversion & image optimization)
* **Static Serving**: `@nestjs/serve-static` & Multer file interceptors
* **API Documentation**: Swagger / OpenAPI v11 (`/api/v1/docs`)
* **Environment Validation**: Joi schema validation

---

## 📂 Project Architecture

```
Campus GIKI/
├── client/                      # React 19 Single Page Application (SPA)
│   ├── src/
│   │   ├── components/          # Reusable UI components (Feed, Calendar, Navigation, Uploader)
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── hooks/               # Custom hooks (useAuth, useFeed, usePendingCounts)
│   │   ├── lib/                 # Axios API instance, Zod schemas
│   │   ├── pages/               # Route pages (Admin, Society, Student, Events, Auth)
│   │   ├── routes/              # Protected & Public routing guards
│   │   ├── services/            # API Service layer (auth, post, event, society, upload)
│   │   └── types/               # TypeScript interfaces & types
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # NestJS RESTful API Service
│   ├── prisma/                  # Database Schema, Migrations & Seed data
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── core/                # Global Config, Database, Filters, Interceptors, Decorators
│   │   ├── modules/
│   │   │   ├── admin/           # DSA Admin Management
│   │   │   ├── advisors/        # Faculty Advisor Module
│   │   │   ├── auth/            # JWT Auth & Passport Strategy
│   │   │   ├── categories/      # Society Categories
│   │   │   ├── events/          # Event Creation & Approval Pipeline
│   │   │   ├── feed/            # Public Feed Aggregator
│   │   │   ├── posts/           # Announcement Posts Module
│   │   │   ├── societies/       # Society Profiles & Dashboards
│   │   │   ├── uploads/         # Sharp WebP Upload Service & Storage Providers
│   │   │   └── yearly-plans/    # Society Annual Activity Planning
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── uploads/                 # Storage directory for uploaded images (.gitignore)
│   └── package.json
│
└── package.json                 # Root monorepo workspace scripts
```

---

## 🚀 Getting Started

You can run Campus GIKI either using **Docker Compose** (recommended for quick and isolated setup) or by running services **manually with Node.js**.

---

### Option A: Quickstart with Docker (Recommended)

Docker Compose provisions the complete ecosystem in isolated containers:
* **PostgreSQL 16** (`campus-giki-db`)
* **NestJS API Server** (`campus-giki-server`) with automated Prisma schema synchronization and optional seeding
* **React 19 + Nginx Reverse Proxy** (`campus-giki-client`) serving frontend and proxying `/api/v1`

#### 1. Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

#### 2. Configure Environment
Copy the Docker environment template to `.env` in the project root:

```bash
# On Linux / macOS / Git Bash:
cp .env.docker.example .env

# On Windows PowerShell:
Copy-Item .env.docker.example .env
```

> **Tip**: The default `.env` is preconfigured to run out-of-the-box. Ensure `AUTO_SEED=true` if you want initial categories, societies, events, and sample users automatically seeded on first launch.

#### 3. Build & Run Containers
Run the following command from the root directory:

```bash
docker compose up -d --build
```

#### 4. Access the Application
* 🌐 **Web Application (SPA)**: [http://localhost](http://localhost)
* 🔌 **Backend REST API**: [http://localhost/api/v1](http://localhost/api/v1)
* 📚 **Interactive Swagger Docs**: [http://localhost:5000/api/v1/docs](http://localhost:5000/api/v1/docs)

#### Useful Docker Management Commands
```bash
# View live container logs
docker compose logs -f

# View server backend logs only
docker compose logs -f server

# Run database seed manually inside the container (if AUTO_SEED was false)
docker exec campus-giki-server npm run seed

# Stop all containers
docker compose down

# Stop and wipe all persistent data (database & uploads volume) for a fresh start
docker compose down -v
```

---

### Option B: Manual Local Setup (Node.js)

#### 1. Prerequisites
* **Node.js**: `v18.14.0` or higher (Recommended: `v20.x` or `v22.x`)
* **npm**: `v9.x` or higher
* **PostgreSQL** installed locally or running via Docker

#### 2. Clone & Install Dependencies
Clone the repository and install dependencies for both `server` and `client`:

```bash
# Clone the repository
git clone https://github.com/zohaibkhan745/Campus-giki.git
cd Campus-giki

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

#### 3. Configure Environment Variables

**Backend (`server/.env`)**:
Create a `.env` file inside the `server/` directory:

```env
NODE_ENV=development
PORT=5000
API_PREFIX=api/v1
CORS_ORIGIN=*
SWAGGER_ENABLED=true

# PostgreSQL Database
DATABASE_URL="postgresql://postgres:admin@localhost:5432/campus_giki?schema=public"

# Security
JWT_SECRET=super_secret_jwt_key_campus_giki_2026
JWT_EXPIRES_IN=1d

# Uploads & Storage Strategy
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads
UPLOAD_MAX_SIZE_MB=25
APP_URL=http://localhost:5000
SEED_DEFAULT_PASSWORD=AdminPassword@123
```

**Frontend (`client/.env`)**:
Create a `.env` file inside the `client/` directory:

```env
VITE_API_BASE_URL=/api/v1
```

---

#### 4. Database Schema Sync & Seeding

Sync the Prisma database schema and populate seed data:

```bash
cd server

# Generate Prisma Client
npm run prisma:generate

# Sync schema to PostgreSQL
npx prisma db push

# Seed database with predefined categories, societies, and accounts
npm run seed
```

---

#### 5. Running the Application

##### **Single Command (Recommended):**
Run both backend and frontend concurrently in a single terminal:
```bash
npm run dev
```

##### **Separate Terminals (Optional):**
```bash
# Terminal 1: Run NestJS Server (http://localhost:5000)
npm run dev:server

# Terminal 2: Run React Client (http://localhost:5173)
npm run dev:client
```

> **Universal Command**: You can run `npm run dev` from the **root directory**, from inside **`server/`**, or from inside **`client/`** — it will always start both the backend and frontend together!
> 
> *To run only a single service:*
> * Server only: `npm run dev:server`
> * Client only: `npm run dev:client`

---

## 📚 API Documentation (Swagger)

When the backend server is running, interactive Swagger API documentation is available at:

👉 **[http://localhost:5000/api/v1/docs](http://localhost:5000/api/v1/docs)**

You can explore endpoints, test authentication requests, inspect DTO schemas, and test file upload endpoints.

---

## 🔑 Default Seed Credentials

When using the seed data (`AUTO_SEED=true` or `npm run seed`), the following accounts are available:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **DSA Admin** | `admin.dsa@giki.edu.pk` | `AdminPassword@123` | Full administrative access to approve events, manage societies & advisors |
| **Student** | `student.test@giki.edu.pk` | `AdminPassword@123` | Student account to browse events, feed, and society profiles |
| **Society (ACM)** | `acm@giki.edu.pk` | `AdminPassword@123` | Society account to submit event proposals and publish posts |
| **Faculty Advisor** | Linked to Advisor profile | `AdminPassword@123` | Review and endorse society proposals |

> **Note**: Default password can be configured using `SEED_DEFAULT_PASSWORD` in your `.env` file.

---

## 🏢 Production Deployment (GIKI Campus Server)

When deploying to the GIKI on-premise server:
1. Build production bundles:
   ```bash
   npm run build:server
   npm run build:client
   ```
2. Set environment variables on GIKI server:
   ```env
   NODE_ENV=production
   APP_URL=https://campus.giki.edu.pk
   STORAGE_DRIVER=local  # Or 'minio' / 's3'
   ```
3. Configure **Nginx** reverse proxy to serve frontend static assets (`client/dist`), proxy API calls to NestJS Node process (`localhost:5000`), and serve `/uploads/` directly with high-performance edge caching.

---

## 📄 License

This project is developed for the **Ghulam Ishaq Khan Institute (GIKI)** development ecosystem under the **MIT License**.
