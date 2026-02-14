#!/usr/bin/env bash
# Build all images and save them to tar files so the project can be
# transferred and run on any device (e.g. without internet).
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
OUT_DIR="${1:-./docker-images}"
mkdir -p "$OUT_DIR"

echo "Building Docker images..."
docker compose build

echo "Saving images to $OUT_DIR ..."
docker save ezhuthidu-backend:latest -o "$OUT_DIR/ezhuthidu-backend.tar"
docker save ezhuthidu-frontend:latest -o "$OUT_DIR/ezhuthidu-frontend.tar"
docker save ezhuthidu-admin:latest -o "$OUT_DIR/ezhuthidu-admin.tar"
docker save mongo:7 -o "$OUT_DIR/mongo-7.tar"
docker save nginx:alpine -o "$OUT_DIR/nginx-alpine.tar"

echo "Done. To run on another device:"
echo "  1. Copy the project folder and the $OUT_DIR/*.tar files to the device."
echo "  2. Run: ./docker-import-and-run.sh"
echo "  3. Open http://localhost (frontend) or http://localhost/admin (admin)."
