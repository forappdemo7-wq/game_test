# Next.js 15 & Prisma Migration Blueprint

This guide details the complete blueprint to transition the **Snake Legends** full-stack workspace to **Next.js 15** with App Router, TypeScript, and Server Component hydration.

---

## 1. Migration Directory Mapping

The current single-page-app structure maps directly into App Router groups and route handlers:

```text
/
├── prisma/
│   └── schema.prisma              --> Remains unchanged.
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx         --> Next.js Client Component in /app/(admin)/admin/AdminPanel.tsx
│   │   ├── MainMenu.tsx           --> Next.js Client Component in /app/(lobby)/MainMenu.tsx
│   │   ├── GameUI.tsx             --> Next.js Client Component in /app/(game)/play/[mode]/GameUI.tsx
│   │   └── ThreeGameCanvas.tsx    --> Next.js Client Component for WebGL/HUD rendering
│   ├── server/
│   │   ├── game.ts                --> Extracted to a dedicated Socket.io microservice or API container
│   │   └── store.ts               --> Migrated to /src/lib/db.ts utilizing global Prisma instances
│   ├── App.tsx                    --> Replaced by /app/(lobby)/page.tsx
│   └── main.tsx                   --> Replaced by Next.js bootstrap layer
```

---

## 2. Updated `package.json` with Next.js 15

To run on Next.js 15 (supporting React 19), update your `package.json` to the following:

```json
{
  "name": "snake-legends-next15",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "socket.io": "^4.8.3",
    "socket.io-client": "^4.8.3",
    "@prisma/client": "^6.0.0",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "dotenv": "^17.2.3"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "typescript": "~5.8.2",
    "prisma": "^6.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

---

## 3. Server Components vs. Client Components

### A. Server Components (For fetching profile summary, Battle Pass, and achievements)
Use Next.js Server Components for secure direct database execution with Prisma:

```typescript
// /app/(lobby)/page.tsx
import { PrismaClient } from '@prisma/client';
import { MainMenu } from './MainMenu'; // client components for tab switching & matchmaking

const prisma = new PrismaClient();

export default async function LobbyPage({ searchParams }: { searchParams: { userId?: string } }) {
  const userId = searchParams.userId || "guest";
  
  // Fast server-side hydration
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    include: { ownedCosmetics: true }
  });

  const globalLeaderboard = await prisma.leaderboard.findMany({
    orderBy: { score: 'desc' },
    take: 10
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <MainMenu 
        initialProfile={userProfile} 
        initialLeaderboard={globalLeaderboard} 
      />
    </main>
  );
}
```

### B. Client Components (Match canvas and joystick inputs)
Mark WebGL canvas elements first-line with `"use client";` to delegate canvas, loop loops, hook inputs, and spatial audio to the client thread.

---

## 4. Socket.io Live Game Loop Integration

Nextjs 15 API routes operate on edge or serverless runtimes that prevent persistent HTTP Socket.IO connections. 
To preserve Snake Legends' zero-friction lag-free 20Hz physics loops:

1. **Standalone Microservice**: Deploy `server.ts` or `src/server/game.ts` as a small, performant, standalone Node/Docker container configured on `Socket.IO` port 3001.
2. **Next.js Custom Server**: Initialize custom server runtime with dynamic next middleware routing:

```typescript
// server-next.js
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { GameController } from "./src/server/game";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, { cors: { origin: "*" } });

  // Bind snake mechanics intervals
  setInterval(() => {
    // broadcast tick
  }, 50);

  server.listen(3000, () => {
    console.log("Next App running on port 3000 alongside Socket.IO game host");
  });
});
```

---

## 5. Loading States & Routing Boundaries

Next.js Route groups (`(lobby)`, `(game)`, `(admin)`) isolate and load assets separately using custom boundary configurations:

- `/app/layout.tsx` (Global styles, Lucide setups)
- `/app/(lobby)/loading.tsx` (Retro space grid cockpit terminal animation)
- `/app/(lobby)/error.tsx` (Graceful lobby fallback UI in case of database disconnection)
