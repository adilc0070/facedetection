# Lumina — AI Video Creator Marketplace

A Next.js marketplace where brands hire AI video creators from your AI Creation & Creative Course community. **Clients pay Lumina**; funds sit in escrow until delivery is approved, then **Lumina pays the creator** (minus platform fee).

## Stack

- **Next.js** (App Router) + **JavaScript**
- **MongoDB** via Mongoose (in-memory MongoDB auto-starts if `MONGODB_URI` is empty)
- **Tailwind CSS**
- JWT cookie auth (creator / client / admin)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role    | Email                 | Password     |
|---------|-----------------------|--------------|
| Creator | ava@lumina.studio     | password123  |
| Client  | elena@brandco.com     | password123  |
| Admin   | admin@lumina.studio   | password123  |

## Escrow flow

1. Client posts a job or hires a creator directly  
2. Client pays **Lumina** → order moves to escrow (`funded` / `in_progress`)  
3. Creator delivers work  
4. Client approves → platform fee retained, creator payout credited  

Default platform fee: `NEXT_PUBLIC_PLATFORM_FEE_PERCENT=15`

## Production MongoDB

Set in `.env.local`:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=long-random-secret
```

## Scripts

- `npm run dev` — development server  
- `npm run build` — production build  
- `npm run start` — start production server  
- `npm run lint` — ESLint  
