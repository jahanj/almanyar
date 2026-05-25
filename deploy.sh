#!/usr/bin/env bash
# AlmanYar deploy/update script — run this ON the VPS, from the project root.
#   First deploy:   ./deploy.sh
#   Later updates:  git pull && ./deploy.sh   (or just ./deploy.sh after copying new code)
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "✗ .env not found. Run: cp .env.production.example .env && nano .env"
  exit 1
fi

# Pick the available compose command.
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo "✗ Docker Compose not found. Install Docker first (see DEPLOY.md)."
  exit 1
fi

echo "▶ Building and starting containers..."
$DC up -d --build

echo "▶ Waiting for the app to come up..."
sleep 5

# Seed once (idempotent: admin/settings upsert, sample reviews only on empty DB).
echo "▶ Seeding database (safe to run repeatedly)..."
$DC exec -T app sh -c "npx --yes tsx prisma/seed.ts" || {
  echo "⚠ Seed step failed (often just no internet for npx, or app still booting)."
  echo "  You can retry later:  $DC exec app sh -c 'npx --yes tsx prisma/seed.ts'"
}

echo "✓ Done. Containers:"
$DC ps
