#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing npm dependencies"
npm install

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
  echo "==> Created .env.local from .env.example"
else
  echo "==> .env.local already exists (leaving it unchanged)"
fi

if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    echo "==> Starting local MongoDB with Docker"
    docker compose up -d
    # Point env at local Docker Mongo if still empty / memory mode
    if grep -q '^MONGODB_URI=$' .env.local || grep -q '^MONGODB_URI=mongodb://127.0.0.1:27017/lumina$' .env.local; then
      :
    fi
    echo "==> MongoDB available at mongodb://127.0.0.1:27017/lumina"
  else
    echo "==> Docker is installed but not running — using in-memory MongoDB instead"
    # Empty URI triggers in-memory Mongo for local demo
    if grep -q '^MONGODB_URI=' .env.local; then
      sed -i.bak 's|^MONGODB_URI=.*|MONGODB_URI=|' .env.local && rm -f .env.local.bak
    fi
  fi
else
  echo "==> Docker not found — using in-memory MongoDB (no install needed)"
  if grep -q '^MONGODB_URI=' .env.local; then
    sed -i.bak 's|^MONGODB_URI=.*|MONGODB_URI=|' .env.local && rm -f .env.local.bak
  fi
fi

echo ""
echo "Ready. Start the app with:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
echo "Demo client: elena@brandco.com / password123"
echo "Demo creator: ava@lumina.studio / password123"
