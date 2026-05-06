#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
BACKUP_FILE="${1:-"$SCRIPT_DIR/roadmap_planner.archive.gz"}"

set -a
if [[ -f "$BACKEND_DIR/.env" ]]; then
  source "$BACKEND_DIR/.env"
fi
set +a

MONGODB_PORT="27018"
MONGODB_DATABASE="${MONGODB_DATABASE:-roadmap_planner}"
MONGODB_AUTH_SOURCE="${MONGODB_AUTH_SOURCE:-admin}"

: "${MONGODB_USERNAME:?Missing required environment variable: MONGODB_USERNAME}"
: "${MONGODB_PASSWORD:?Missing required environment variable: MONGODB_PASSWORD}"

mkdir -p "$(dirname -- "$BACKUP_FILE")"

docker compose -f "$BACKEND_DIR/docker-compose.yml" exec -T mongodb \
  mongodump \
  --port "$MONGODB_PORT" \
  --username "$MONGODB_USERNAME" \
  --password "$MONGODB_PASSWORD" \
  --authenticationDatabase "$MONGODB_AUTH_SOURCE" \
  --db "$MONGODB_DATABASE" \
  --archive \
  --gzip \
  > "$BACKUP_FILE"

echo "Saved MongoDB backup to $BACKUP_FILE"
