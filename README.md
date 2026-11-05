# Rose Puzzle 🌹

A black, animated background where a single rose assembles itself piece by piece,
from the stem up to the bloom, like solving a puzzle. Built with TypeScript, the
Canvas API and Vite. No runtime dependencies.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
```

## Deploy

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com) click **Add New → Project** and import the repo.
3. Vercel detects Vite automatically (build: `npm run build`, output: `dist`). Click **Deploy**.

## Structure

- `src/rose.ts` – the puzzle pieces, their schedule (bottom → top) and drawing
- `src/background.ts` – floating ember particles
- `src/main.ts` – canvas setup, glow, animation loop, replay
