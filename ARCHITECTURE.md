# Architecture Defaults

This document captures default architectural decisions for projects using this template.

## Web architecture (Vercel-first)

- **Next.js App Router** with React Server Components.
- **Edge runtime** for latency-sensitive routes.
- **API layer** via tRPC or OpenAPI-backed REST.
- **Data**: Postgres + Prisma/Drizzle, Redis for caching.
- **Observability**: OpenTelemetry + structured logs.

## Backend services

- **Python** as default (FastAPI/Litestar).
- Async workers with Celery + Redis or Temporal for workflows.
- Prefer **domain-driven structure** for complex systems.

## CLI

- Python + Typer for UX and maintainability.
- Provide `--help`, examples, and rich error output.

## Desktop / iOS

- macOS: SwiftUI or Tauri (Rust).
- iOS: SwiftUI with async/await.

## Non-negotiables

- Accessibility (WCAG AA) and keyboard support.
- Performance budgets and real-world monitoring.
- Security baseline: auth, rate limits, input validation.
