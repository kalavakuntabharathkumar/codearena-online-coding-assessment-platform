# CodeArena — Online Coding Assessment Platform

A runnable starter implementation demonstrating the architecture described in the project brief: React + TypeScript frontend, Express API, PostgreSQL persistence, Redis-backed submission queue, Docker runner integration points, Jest tests, and GitHub Actions CI.

> This is a portfolio-ready **starter/demo**, not a production online judge. The included runner uses a deliberately restricted demo execution path and does not safely execute arbitrary untrusted code. A real judge requires hardened isolated workers, strict CPU/memory/time limits, network isolation, and security review.

## Architecture
- `apps/web`: React + TypeScript submission dashboard.
- `apps/api`: Express + TypeScript REST API.
- PostgreSQL: stores submissions and results.
- Redis/BullMQ: queues asynchronous judging jobs.
- `apps/worker`: processes queued jobs and calls a pluggable runner.
- `infra/docker`: local PostgreSQL and Redis services.
- `.github/workflows/ci.yml`: typecheck, test, and build pipeline.

## Requirements
Node.js 20+, Docker Desktop / Docker Engine.

## Quick start
1. Copy environment template: `cp .env.example .env` (Windows: copy the file manually).
2. Start services: `docker compose up -d postgres redis`.
3. Install dependencies: `npm install`.
4. Initialize schema: `npm run db:migrate`.
5. Start API and worker: `npm run dev:services`.
6. In another terminal, start frontend: `npm run dev:web`.
7. Open the Vite URL printed in the terminal.

## API
- `GET /health`
- `POST /api/submissions` — accepts `{ "candidateId": "candidate-1", "language": "python", "sourceCode": "print(1 + 1)" }`
- `GET /api/submissions/:id`

## Important security note
Never run arbitrary candidate code inside the API process or a general-purpose container. For real deployment, use disposable, locked-down worker sandboxes (non-root, read-only filesystem, no network, seccomp/AppArmor, cgroups, resource limits, image allowlists, and output caps).
