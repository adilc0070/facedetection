# Lumina — AI Video Creator Marketplace

Local Next.js project for an AI video freelancer marketplace.
Clients pay **Lumina** (escrow); Lumina pays creators after delivery approval.

## Stack

- Next.js (App Router) + JavaScript  
- MongoDB + Mongoose  
- Tailwind CSS  

## Run locally (your machine)

```bash
# from this project folder
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### What the setup script does

1. `npm install`  
2. Creates `.env.local` from `.env.example` if missing  
3. Starts MongoDB with Docker when available  
4. Falls back to **in-memory MongoDB** if Docker is not available (demo still works)

### Manual setup (no script)

```bash
npm install
cp .env.example .env.local

# Option A — Docker MongoDB
docker compose up -d
# keep MONGODB_URI=mongodb://127.0.0.1:27017/lumina in .env.local

# Option B — no Docker (in-memory demo DB)
# set MONGODB_URI= (empty) in .env.local

npm run dev
```

### Demo accounts

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Creator | ava@lumina.studio   | password123 |
| Client  | elena@brandco.com   | password123 |
| Admin   | admin@lumina.studio | password123 |

## Escrow flow

1. Client posts a job or hires a creator  
2. Client pays **Lumina** → funds held in escrow  
3. Creator delivers work  
4. Client approves → platform fee kept, creator payout released  

Platform fee: `NEXT_PUBLIC_PLATFORM_FEE_PERCENT` (default `15`)

## Environment

Copy `.env.example` → `.env.local`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/lumina
JWT_SECRET=change-me-to-a-long-random-string
NEXT_PUBLIC_APP_NAME=Lumina
NEXT_PUBLIC_PLATFORM_FEE_PERCENT=15
ADMIN_EMAIL=admin@lumina.studio
```

Leave `MONGODB_URI` empty to auto-start an in-memory MongoDB for local demos.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run setup` | Install deps + local Mongo helpers |
| `docker compose up -d` | Start MongoDB only |

## Project structure

```
src/
  app/           # pages + API routes
  components/    # UI
  lib/           # db, auth, models, seed
docker-compose.yml
scripts/setup-local.sh
```
