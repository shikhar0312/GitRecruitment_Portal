# GIT Software Technologies - WorkTracker Dashboard

A professional, responsive, and robust employee work tracking dashboard designed for GIT Software Technologies. It includes clock-in/out attendance logging, task checklists, leave requests, weekly performance reporting, executive analytics, and email/dashboard notifications.

## Project Structure

- `frontend/`: React + Vite + TypeScript application (UI styled in light corporate mode).
- `backend/`: FastAPI + SQLAlchemy + SQLite/PostgreSQL + Alembic database migrations.
- `docker-compose.yml`: Local multi-container orchestration.

---

## 1. Quick Start (Local Run with Docker Compose)

To start the database, backend API, and frontend web server locally in Docker with a single command:

```bash
docker compose up --build
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **PostgreSQL Database**: Port `5433` on localhost

---

## 2. Production Deployment Guide

Follow these steps to deploy the application to production:

### Step 2.1: PostgreSQL on Neon

1. Create a free account on [Neon.tech](https://neon.tech/).
2. Create a new project and select **PostgreSQL 16**.
3. Under the Connection Details, copy the **Connection String** (choose the `pooled` or sync connection format). It will look like:
   `postgresql://[USER]:[PASSWORD]@[HOST]/[DB]?sslmode=require`
4. Save this connection string for use in the backend environment variables.

### Step 2.2: Backend API on Render or Railway

#### Option A: Deploying on Render

1. Create a new **Web Service** on [Render](https://render.com/).
2. Link your GitHub repository.
3. Configure the following service settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Build Command**: (Handled automatically by Render since we use the `Dockerfile`)
4. Add the following **Environment Variables** in Render:
   - `DATABASE_URL`: Your Neon Postgres connection string.
   - `SECRET_KEY`: A secure random secret key (e.g. `openssl rand -hex 32`).
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `60` (or your preferred token expiry duration).
5. Deploy the service and note down your production API URL (e.g. `https://git-worktracker-api.onrender.com`).

#### Option B: Deploying on Railway

1. Create a new project on [Railway](https://railway.app/).
2. Select **Deploy from GitHub repo** and point it to your repository.
3. In the Railway dashboard settings for the service, set the **Root Directory** to `backend`. Railway will automatically build the service using the `Dockerfile` inside the directory.
4. Go to **Variables** and add:
   - `DATABASE_URL`: Your Neon Postgres connection string.
   - `SECRET_KEY`: A secure random secret key.
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`.
5. Note the generated domain URL (e.g. `https://git-worktracker-api.up.railway.app`).

---

### Step 2.3: Frontend on Vercel

1. Create a free account on [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and import your GitHub repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite` (Vercel will auto-detect Vite).
   - **Root Directory**: `frontend`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: Your production backend API URL (e.g. `https://git-worktracker-api.onrender.com` or `https://git-worktracker-api.up.railway.app` without a trailing slash).
5. Click **Deploy**. Vercel will build the React application and inject the production API URL as a build argument.

---

## 3. Local Development (Without Docker)

### Backend Local Run

1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Set up virtual environment and install packages:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Set your environment variables in `.env` (copy from `.env.example` or create `.env` manually).
4. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Local Run

1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```
