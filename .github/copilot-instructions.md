# Copilot Instructions for JiraStack

## Project Overview

JiraStack is a minimalist SPA where users log in with Jira Cloud (OAuth 2.0 3LO), see assigned tickets without descriptions as a card stack, write descriptions in Markdown (converted to ADF), and clear cards as they submit.

## Tech Stack

- **SvelteKit** (Svelte 5 with runes) + **TypeScript**
- **Tailwind CSS v4+**
- **svelte-motion** for card stack animations
- **@sveltejs/adapter-node** for Docker deployment
- In-memory sessions (no database)

## Architecture

```
src/
  routes/           # SvelteKit pages and API endpoints
    auth/           # /auth/login, /auth/callback, /auth/logout
    api/tickets/    # GET /api/tickets, POST /api/tickets/[key]/description
  lib/
    server/         # Server-only: Jira API client, session store, auth logic
    components/     # Svelte UI components (CardStack, TicketCard, MarkdownEditor)
```

- **Auth flow is entirely server-side** — tokens never reach the client. OAuth exchange and refresh happen in SvelteKit hooks/endpoints.
- **Session store** is a simple in-memory Map keyed by session ID. Sessions are ephemeral — lost on restart.
- **Jira API calls** go through `lib/server/jira.ts`, which handles token refresh transparently on 401s.
- **Markdown → ADF conversion** happens server-side before POSTing to Jira.

## Key Conventions

- Use **Svelte 5 runes** (`$state`, `$derived`, `$effect`) — no legacy reactive statements.
- All server-only code lives under `lib/server/` to prevent accidental client bundling.
- OAuth secrets are provided via environment variables (`ATLASSIAN_CLIENT_ID`, `ATLASSIAN_CLIENT_SECRET`, `ATLASSIAN_REDIRECT_URI`).
- Card animations must respect `prefers-reduced-motion`.
- The app is intentionally minimal — resist adding features beyond the core loop: login → see cards → write description → clear card.

## Design Reference

See `DESIGN.md` at the project root for the full design system (colors, typography, spacing, component specs, animation guidelines).

## Svelte MCP Tools

When writing or editing `.svelte` or `.svelte.ts` files, use the Svelte MCP tools:
1. Call `list-sections` first to discover relevant Svelte 5/SvelteKit docs
2. Use `get-documentation` to fetch sections needed for the task
3. **Always** run `svelte-autofixer` on any Svelte code before finalizing

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
