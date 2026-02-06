# General-Purpose Project Template (Web, CLI, Desktop, Mobile)

This repository is a **polished, production-first template** for building modern products. It prioritizes **high-quality UX, long-term maintainability, and shipping confidence** over MVP shortcuts. It is designed for web apps (optimized for Vercel), but also supports **CLI tools, desktop (macOS), and mobile (iOS)** with a consistent engineering approach.

## What this template optimizes for

- **Polished product > MVP**: invest in design systems, performance budgets, accessibility, and reliability from day one.
- **Modern defaults**: Bun, TypeScript, Vite/Next.js, Tailwind/Vanilla Extract, and Python for backends.
- **Vercel-first** deployments for web apps.
- **Fast iteration** without sacrificing code quality: typed APIs, robust linting, and CI.
- **Scalable structure**: works for single apps and monorepos.

## Recommended stack (early-adopter friendly)

### Web
- **Framework**: Next.js App Router (preferred) or Remix
- **Runtime**: **Bun** (preferred) or Node 20+
- **Package manager**: **Bun** or **pnpm** (avoid npm)
- **Styling**: Tailwind CSS or Vanilla Extract
- **State/data**: TanStack Query, tRPC or REST + OpenAPI
- **DB**: Postgres + Prisma or Drizzle
- **Auth**: NextAuth, Clerk, or custom OIDC
- **Testing**: Playwright + Vitest + React Testing Library
- **Analytics**: PostHog, Vercel Analytics

### Backend (APIs, services, jobs)
- **Language**: **Python** (FastAPI / Litestar), TypeScript, or Go for high-perf needs
- **Tasks**: Celery + Redis (Python) or Temporal for workflows
- **Observability**: OpenTelemetry + structured logging

### CLI / Desktop / Mobile
- **CLI**: Python (Typer) or TypeScript (oclif) with Bun runtime
- **macOS**: SwiftUI + Xcode (or Tauri + Rust for cross-platform)
- **iOS**: SwiftUI + async/await

## Suggested repo structure

```
.
├── apps/               # web/mobile/desktop apps
├── packages/           # shared UI, utils, API clients
├── services/           # backend services, workers
├── infra/              # deployment configs
├── docs/               # product + engineering docs
└── README.md
```

## Vercel-first deployment guidelines

- Use **Next.js App Router** and prefer **Edge Runtime** for latency-critical routes.
- Store secrets in **Vercel Environment Variables**.
- Use **Vercel Cron** for scheduled jobs.
- Prefer **Vercel Postgres** or managed Postgres (Neon/Supabase).

## Quality bar checklist (non-negotiable)

- ✅ Accessibility (WCAG AA) and keyboard navigation
- ✅ Performance budgets + Lighthouse CI
- ✅ Typed APIs and validated inputs
- ✅ Observability (logs, tracing, metrics)
- ✅ Security basics (rate limiting, CSRF, secrets management)

## See also

- [agent.md](agent.md) – contributor & coding guidelines
- [Claude.md](Claude.md) – Claude-specific instructions
- [codex.md](codex.md) – Codex-specific instructions
- [ARCHITECTURE.md](ARCHITECTURE.md) – system design defaults
- [CONTRIBUTING.md](CONTRIBUTING.md) – workflows & standards
- [PROJECT_CHECKLIST.md](PROJECT_CHECKLIST.md) – launch readiness
