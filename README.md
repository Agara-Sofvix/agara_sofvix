# Ezhuthidu - Project

Full-stack application (Backend, Frontend, Admin) — **fully Dockerized**; runs on any device with Docker.

## Running with Docker (Recommended)

1. **Docker and Docker Compose** must be installed.
2. **Build and start:**
   ```bash
   docker compose up --build -d
   ```
3. **Access (single entry on port 80):**
   - **Frontend:** http://localhost
   - **Admin:** http://localhost/admin
   - **API:** http://localhost/api

To run the same stack on another device without building there, see [DEPLOYMENT.md](DEPLOYMENT.md) (export images with `./docker-export.sh`, copy project + `docker-images/*.tar`, then on the device run `./docker-import-and-run.sh`).

## Manual Setup (without Docker)

1. **Install dependencies in all apps** (required after clone):
   ```bash
   npm run install-all
   ```
2. **Start backend, frontend, and admin:**
   ```bash
   npm run dev
   ```
3. Open frontend at http://localhost:3000, admin at http://localhost:3001. Ensure backend runs on port 5000 or 5001 and set frontend/admin API URL if needed.
