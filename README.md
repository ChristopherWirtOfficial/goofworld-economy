# Goof World

A collaborative economy stabilization game inspired by r/place.

## Getting Started

### Install Dependencies

```bash
yarn
```

### Run the Development Server

```bash
yarn dev
```

This will start both the Next.js frontend (http://localhost:3000) and the WebSocket backend server (http://localhost:3001).

### Verify CI Checks Locally

Before pushing, run:

```bash
yarn verify-ci
```

This runs all the same checks that GitHub Actions will run (lint, type check, build).

## Project Structure

- `/app` - Next.js frontend (App Router)
- `/components` - React components
- `/store` - Zustand state management
- `/server` - Express + Socket.io backend
- `/shared` - Shared TypeScript types between frontend and backend
- `/.github/workflows` - GitHub Actions CI/CD

## Game Mechanics

- **Duration**: 2 months (60 days)
- **Turn Cooldown**: 5 minutes per player
- **Actions**:
  - Move orders between entities
  - Reveal hidden orders (benefits all players)

## Stack

- **Frontend**: Next.js 14 + React + TypeScript + Zustand
- **Backend**: Node.js + Express + Socket.io
- **Real-time**: WebSockets for live collaboration

## Deployment

### Frontend (Vercel)

The frontend is configured to deploy automatically via Vercel:

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

2. **Set Environment Variables** in Vercel:
   ```
   NEXT_PUBLIC_SOCKET_URL=<your-railway-backend-url>
   ```

3. **Auto-deploy**:
   - Push to `main` → Production deployment
   - Open PR → Preview deployment automatically created

### Backend (Railway)

The backend WebSocket server can be deployed to Railway:

1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Railway will detect `railway.json` configuration

2. **Set Environment Variables** in Railway:
   ```
   PORT=3001
   NODE_ENV=production
   ```

3. **Get your Railway URL**:
   - Copy the public URL (e.g., `https://your-app.railway.app`)
   - Add this as `NEXT_PUBLIC_SOCKET_URL` in Vercel

### Alternative: Deploy Both on Railway

You can deploy both frontend and backend on Railway:

1. Create two services in Railway:
   - **Frontend**: Start command: `yarn start:next`
   - **Backend**: Start command: `yarn start:server`

2. Set environment variables appropriately in each service

## CI/CD

GitHub Actions automatically run on every PR and push to `main`:

- ✅ Lint checks
- ✅ TypeScript type checking
- ✅ Build verification (both frontend and backend)

See `.github/workflows/ci.yml` for configuration.
