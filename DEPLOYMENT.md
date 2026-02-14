# Docker deployment – run on any device

The app runs as five containers behind a single gateway on port **80**.

## Quick start (this machine)

```bash
# Optional: set JWT_SECRET
cp env.docker.example .env
# Edit .env and set JWT_SECRET

docker compose up --build -d
```

- **Frontend:** http://localhost  
- **Admin:** http://localhost/admin  
- **API:** http://localhost/api  

## Portable export (build once, run anywhere)

On a machine with Docker and internet:

1. Build and save images:
   ```bash
   chmod +x docker-export.sh docker-import-and-run.sh
   ./docker-export.sh
   ```
   This creates a `docker-images/` folder with `*.tar` image files.

2. Copy to the target device:
   - The whole project directory (including `docker-compose.yml`, `nginx/`, Dockerfiles, and scripts), **and**
   - The `docker-images/*.tar` files (or the whole `docker-images/` folder).

On the target device (only Docker is required; no node/npm):

1. Load images and start:
   ```bash
   chmod +x docker-import-and-run.sh
   ./docker-import-and-run.sh
   ```
   If the tar files are in another path:
   ```bash
   ./docker-import-and-run.sh /path/to/docker-images
   ```

2. Open in a browser:
   - Frontend: http://localhost (or http://\<device-ip\>)  
   - Admin: http://localhost/admin (or http://\<device-ip\>/admin)  

## Optional: single archive

To ship one compressed file, create a tarball that includes both the project and the image tars:

```bash
./docker-export.sh
tar -czvf ezhuthidu-full.tar.gz -C .. 2
# Or zip the project + docker-images folder and transfer.
```

On the target device, extract the archive, then run `./docker-import-and-run.sh` from the project root.

## Environment

- Copy `env.docker.example` to `.env` and set `JWT_SECRET` for production.
- **MongoDB** data: Docker volume `mongo_data` (persists across restarts).
- **Uploaded files** (logos, etc.): Docker volume `backend_uploads` (persists across restarts).
