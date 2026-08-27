# GIT Recruitment Portal

A comprehensive web application for managing the recruitment process, candidate tracking, and internal workflows. This repository is structured as a monorepo, containing both the React frontend and the Node.js Fastify backend.

## 🏗 Project Architecture & Structure

The repository consists of two main components:

- **`frontend/`**: The client-side application built with **React, TypeScript, and Vite**. It utilizes **Zustand** for state management, **React Query** for data fetching, and **Tailwind CSS** for styling.
- **`backend/`**: The server-side API built with **Fastify, Node.js, and TypeScript**. It uses **Prisma ORM** for database interactions with a **PostgreSQL** database, and incorporates **OpenAI** for AI-assisted features.

### Directory Layout

```text
git-recruitment-portal/
├── backend/                  # Node.js Fastify Backend
│   ├── prisma/               # Prisma schema and seed scripts
│   ├── src/                  # Backend source code (routes, controllers, models)
│   ├── tests/                # Jest testing suite
│   ├── Dockerfile            # Dockerfile for building the backend image
│   └── package.json          # Backend dependencies & scripts
├── frontend/                 # React Vite Frontend
│   ├── src/                  # Frontend source code (features, components, hooks)
│   ├── UI/                   # Reusable UI component library
│   ├── public/               # Static frontend assets
│   ├── tailwind.config.js    # Tailwind styling configuration
│   └── package.json          # Frontend dependencies & scripts
├── WorkTracker-main/         # Legacy / Reference project materials
├── docker-compose.yml        # Docker orchestration for Backend and PostgreSQL
└── README.md                 # This documentation
```

## 🚀 Getting Started

You can run the project either fully locally or using Docker for the backend and database.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) & Docker Compose (optional, but recommended for DB setup)

### 1. Quick Start (Recommended)

The easiest way to start the entire development environment is using the provided `start.sh` script. This script automatically spins up the PostgreSQL database in Docker and starts both the Fastify backend and React frontend development servers.

```bash
# Make the script executable (only needed once)
chmod +x start.sh

# Start the environment
./start.sh
```

- **Backend API:** `http://localhost:3000`
- **Frontend UI:** `http://localhost:5173`

*Press `CTRL+C` in the terminal to stop all servers.*

### 2. Using Docker (Backend & DB Only)

A `docker-compose.yml` file is provided to quickly spin up the **PostgreSQL Database** and the **Fastify Backend**.

```bash
# Start the database and backend services
docker compose up --build -d
```

- **Backend API** will be accessible at: `http://localhost:3000`
- **PostgreSQL** will be accessible on port `5433` locally.

### 3. Manual Setup (Local Development)

#### Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the necessary environment variables (e.g., `DATABASE_URL`).
4. Generate Prisma client & apply database migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` (ensure `VITE_API_URL` points to your backend, e.g., `http://localhost:3000`).
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

- **Frontend** will be accessible at `http://localhost:5173` (default Vite port).

## 🛠 Tech Stack Highlights

**Frontend:**

- **Framework:** React 19, TypeScript, Vite
- **State & Data Fetching:** Zustand, React Query (@tanstack/react-query)
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Routing:** React Router DOM
- **Validation:** Zod

**Backend:**

- **Framework:** Fastify (Node.js), TypeScript
- **Database ORM:** Prisma (connected to PostgreSQL)
- **Security:** Fastify JWT, Helmet, Rate Limit
- **Testing:** Jest, Supertest
- **AI Integration:** OpenAI SDK

## 📝 Available Scripts

### Frontend Scripts

- `npm run dev`: Starts the Vite dev server.
- `npm run build`: Compiles TypeScript and builds the production bundle.
- `npm run lint`: Runs ESLint for code quality.

### Backend Scripts

- `npm run dev`: Starts the backend dev server with hot-reloading (ts-node-dev).
- `npm run build`: Compiles the TypeScript backend into standard JS.
- `npm run test`: Runs the Jest test suite.
- `npm run db:generate`: Generates the Prisma client.
- `npm run db:migrate`: Pushes schema changes to the database.
- `npm run db:seed`: Seeds the database with demo data (users, clients, requirements, tracker records).
- `npm run db:studio`: Opens Prisma Studio for visual database management.

## ✨ Features

### Bulk Import of Requirements (Excel / CSV)

Instead of entering requirements one at a time, HR can upload a spreadsheet and create many requirements in a single pass — useful when a client sends a sheet of open roles, or when demand is already tracked in Excel.

**How it works (upload → preview → confirm):**

1. On the **Requirements** page, click **Import from Excel**.
2. **Download the template** — a pre-labelled `.xlsx` with one example row, so the sheet always matches the expected columns.
3. Fill in one row per requirement and **upload** the file (`.xlsx` or `.csv`).
4. The backend parses the file, resolves clients/roles, validates every row, and returns a **preview**: how many rows are ready and, for any that aren't, the exact reason per row.
5. Click **Import** to create the valid rows. **Valid rows are always imported; rows with errors are skipped and reported** so they can be fixed and re-uploaded — one bad row never blocks the rest.

**Matching rules:**

- **Client** and **Role** are matched **by name** (case-insensitive) against existing records — no IDs required. A name that doesn't match an existing client or role is flagged as an error for that row (it is **not** auto-created).
- **Billing Entity** accepts friendly labels (e.g. `UK Ltd`, `India LLP`, `UAE FZE`).
- Multi-value fields (**Required Skills**, **Nice-to-have Skills**) are comma-separated within a single cell.
- Import validation reuses the **same Zod schema as the manual "Add Requirement" form**, so the two can never diverge.

**Template columns:** Client\*, Role\*, Billing Entity\*, Hiring Type\*, Status, Priority, Work Mode\*, Location\*, Min Exp (years)\*, Max Exp (years)\*, No. of Positions\*, Budget Min, Budget Max, Currency, Min Contract (months), Notice Period Buyback, Required Skills, Nice-to-have Skills, Visa Sponsorship Available, Clearance Required, Expected Start Date, Closing Date, Job Description. *(\* = required.)*

**API endpoints** (all under `/api/v1/requirements`, JWT-protected; import actions require the `recruiter`, `account_manager`, or `admin` role):

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET`  | `/import/template` | Download the `.xlsx` template |
| `POST` | `/import/preview`  | Upload a file (multipart); returns `{ valid, errors, totalRows }` — nothing is written |
| `POST` | `/import/commit`   | Create the previewed valid rows in one transaction; returns `{ created, skipped }` |

> Parsing is done server-side with [SheetJS (`xlsx`)](https://www.npmjs.com/package/xlsx) so that name resolution and validation run where the data lives.
