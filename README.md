# Earthquake Constellations

A Next.js + Canvas visualization that turns recent USGS earthquakes into a living night-sky constellation. Magnitude drives star brightness, depth controls softness, and age fades each event into the dark.

## Stack

- **Next.js App Router (canary)** + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Vercel Python Serverless Function** (`api/quakes.py`)
- **Node.js 22.x** + **pnpm**

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

### API

The serverless function normalizes USGS GeoJSON feeds:

```
GET /api/quakes?window=hour|day|week&minMag=1.2
```

Caching is configured per-window. Errors from USGS return a friendly JSON message with a 503 status.

## Quality checks

```bash
pnpm lint
pnpm typecheck
```

## Deployment (Vercel)

1. Install the Vercel CLI: `pnpm dlx vercel@latest`.
2. Run `vercel` from the repo root.

The Python function is wired via `vercel.json` and will deploy automatically.

## Notes

- Canvas caps rendering at 2,000 stars for performance.
- Hover to see detailed quake info + USGS event link.
- Polling intervals: 30s (hour), 2m (day), 5m (week).
