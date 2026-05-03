# Copilot Instructions for JiraStack

## Project Overview

JiraStack is a minimalist SPA that connects to Jira Cloud via API token, fetches tickets assigned to or created by the user without descriptions as a card stack, lets users write descriptions in plain text (converted to ADF server-side), and clears cards as they submit.

## Tech Stack

- **SvelteKit** (Svelte 5 with runes) + **TypeScript**
- **Tailwind CSS v4+**
- **svelte-motion** for card stack animations
- **@sveltejs/adapter-node** for Docker deployment
- In-memory sessions (no database) — OAuth planned for future phase

## Architecture

```
src/
  routes/           # SvelteKit pages and API endpoints
    api/tickets/    # GET /api/tickets, POST /api/tickets/[key]/description, POST /api/tickets/[key]/transition
  lib/
    server/         # Server-only: Jira API client, config
    components/     # Svelte UI components (CardStack, TicketCard, DescriptionEditor)
```

- **Auth uses Jira API token** (Basic auth) configured via env vars (`JIRA_API_TOKEN`, `JIRA_USER_EMAIL`, `JIRA_BASE_URL`). OAuth 2.0 (3LO) is planned for a future phase.
- **Jira API calls** go through `lib/server/jira.ts`, which uses Basic auth headers.
- **Plain text → ADF conversion** happens server-side via `textToAdf()` before POSTing to Jira.

## Key Conventions

- Use **Svelte 5 runes** (`$state`, `$derived`, `$effect`) — no legacy reactive statements.
- All server-only code lives under `lib/server/` to prevent accidental client bundling.
- Jira credentials are provided via environment variables (`JIRA_API_TOKEN`, `JIRA_USER_EMAIL`, `JIRA_BASE_URL`).
- Card animations must respect `prefers-reduced-motion`.
- The app is intentionally minimal — resist adding features beyond the core loop: login → see cards → write description → clear card.

## Design Reference

See `DESIGN.md` at the project root for the full design system (colors, typography, spacing, component specs, animation guidelines).

## Svelte MCP Tools

When writing or editing `.svelte` or `.svelte.ts` files, use the Svelte MCP tools:
1. Call `list-sections` first to discover relevant Svelte 5/SvelteKit docs
2. Use `get-documentation` to fetch sections needed for the task
3. **Always** run `svelte-autofixer` on any Svelte code before finalizing

## Development Workflow

1. **Write code** — implement the feature or fix
2. **Run unit tests** — `npm run test:unit` (Vitest)
3. **Redeploy with Docker** — `docker compose up --build -d` to rebuild and restart the app
4. **E2E test with Chrome** — use the Chrome MCP server (`chrome-dev-tools-*` tools) to navigate the running app, take screenshots, and verify behavior end-to-end

## Git Workflow

- Create a **feature branch** for each TODO item (e.g., `feat/oauth-login`, `feat/card-stack-ui`).
- Branch from `main`, keep commits atomic and well-scoped.
- When the work is complete, **create a Pull Request** against `main`.
- When asked to address PR review comments, push fixes to the same feature branch.

## Specification

The full technical spec is at `spec/spec-architecture-techstack.md`. Consult it for:
- Atlassian API endpoints and data contracts
- OAuth scopes and token lifecycle
- JQL query for fetching tickets
- ADF document structure
- Acceptance criteria
