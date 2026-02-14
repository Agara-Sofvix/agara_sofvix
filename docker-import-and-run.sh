#!/usr/bin/env bash
# Load saved Docker images and run the stack. Use after transferring
# the project and the *.tar files from docker-export.sh to another device.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
IMG_DIR="${1:-./docker-images}"

if [ ! -d "$IMG_DIR" ]; then
  echo "Image directory not found: $IMG_DIR"
  echo "Usage: $0 [path-to-docker-images]"
  exit 1
fi

echo "Loading Docker images from $IMG_DIR ..."
for f in "$IMG_DIR"/ezhuthidu-backend.tar "$IMG_DIR"/ezhuthidu-frontend.tar "$IMG_DIR"/ezhuthidu-admin.tar "$IMG_DIR"/mongo-7.tar "$IMG_DIR"/nginx-alpine.tar; do
  [ -f "$f" ] && docker load -i "$f" || true
done

echo "Starting containers..."
[ -f .env ] || cp -n env.docker.example .env 2>/dev/null || true
docker compose up -d

echo "App is running. Open http://localhost (frontend) or http://localhost/admin (admin)."
