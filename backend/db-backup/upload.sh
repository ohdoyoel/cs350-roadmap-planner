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
MONGODB_AUTH_SOURCE="${MONGODB_AUTH_SOURCE:-admin}"

: "${MONGODB_USERNAME:?Missing required environment variable: MONGODB_USERNAME}"
: "${MONGODB_PASSWORD:?Missing required environment variable: MONGODB_PASSWORD}"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

docker compose -f "$BACKEND_DIR/docker-compose.yml" exec -T mongodb \
  mongorestore \
  --port "$MONGODB_PORT" \
  --username "$MONGODB_USERNAME" \
  --password "$MONGODB_PASSWORD" \
  --authenticationDatabase "$MONGODB_AUTH_SOURCE" \
  --drop \
  --archive \
  --gzip \
  < "$BACKUP_FILE"

echo "Restored MongoDB backup from $BACKUP_FILE"
