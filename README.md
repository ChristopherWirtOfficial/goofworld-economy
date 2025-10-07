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

## Project Structure

- `/app` - Next.js frontend (App Router)
- `/components` - React components
- `/store` - Zustand state management
- `/server` - Express + Socket.io backend
- `/shared` - Shared TypeScript types between frontend and backend

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
