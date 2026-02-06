# Codex Workflow — Earthquake Constellations

We operate as a small multi-agent team shipping in one evening. The workflow below mirrors that structure so any contributor can jump in quickly.

## Multi-agent roles & flow

1. **Architect** — Defines system boundaries, API contracts, caching policy, and data normalization.
2. **Backend Engineer** — Implements `api/quakes.py` and Vercel configuration.
3. **Frontend Engineer** — Builds Next.js App Router UI, hooks, and Canvas renderer.
4. **Designer** — Tunes visual language (ambient gradients, typography, motion, legend).
5. **QA / Perf** — Runs lint/typecheck, validates hover interactions, and checks canvas FPS.

## Daily commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
```

## Release checklist

- [ ] API returns normalized JSON for hour/day/week and handles downtime gracefully.
- [ ] Canvas renders clusters, twinkle, blur, and hover tooltip.
- [ ] Accessibility: controls are keyboard navigable and labels are readable.
- [ ] Vercel deploy works with Node 22 + Python 3.12.
