#!/bin/bash

echo "======================================"
echo "Starting GIT Recruitment Portal (Dev Mode)"
echo "======================================"

# 1. Start Database using Docker
echo ">>> Starting PostgreSQL Database..."
docker compose up postgres -d

# 2. Trap CTRL+C to properly close the servers when you exit
trap 'kill %1; kill %2; echo "Servers stopped."; exit' SIGINT

# 3. Start Backend in background
echo ">>> Starting Backend (Hot Reload)..."
cd backend
npm run dev &
cd ..

# 4. Start Frontend in background
echo ">>> Starting Frontend (Hot Reload)..."
cd frontend
npm run dev &
cd ..

echo "======================================"
echo "✅ Both servers are starting up!"
echo "👉 Backend API: http://localhost:3000"
echo "👉 Frontend UI: http://localhost:5173"
echo "Press CTRL+C to stop everything."
echo "======================================"

# Keep script running to view logs and wait for CTRL+C
wait
