# JiraStack — Development TODO

## Phase 1: Project Scaffolding

- [ ] Initialize SvelteKit project with TypeScript
- [ ] Configure Tailwind CSS v4
- [ ] Set up adapter-node for self-hosted deployment
- [ ] Configure environment variables schema (client ID, secret, redirect URI, port)
- [ ] Create project directory structure (`lib/server/`, `lib/components/`, `routes/`)
- [ ] Create Dockerfile (multi-stage build: install → build → production with Node.js)
- [ ] Create docker-compose.yml with environment variable template
- [ ] Add `.env.example` with all required variables documented
- [ ] Set up Vitest and Playwright configs

## Phase 2: Authentication (OAuth 2.0 3LO)

- [ ] Register OAuth 2.0 app in Atlassian Developer Console (manual step, document in README)
- [ ] Implement `/auth/login` route — redirect to Atlassian authorize URL with required scopes
- [ ] Implement `/auth/callback` route — exchange authorization code for tokens server-side
- [ ] Create in-memory session store (Map keyed by session ID)
- [ ] Set secure HTTP-only session cookie on successful auth
- [ ] Implement token refresh logic (auto-refresh on expiry)
- [ ] Implement `/auth/logout` route — clear session and cookie
- [ ] Add SvelteKit hooks for session validation on protected routes
- [ ] Fetch accessible resources (cloud ID) after token exchange

## Phase 3: Jira API Integration

- [ ] Create Jira API client module (`lib/server/jira.ts`)
- [ ] Implement `fetchTicketsWithoutDescription()` — JQL search for assigned tickets with empty descriptions
- [ ] Implement `updateTicketDescription(issueKey, adfContent)` — PUT description to Jira API
- [ ] Add error handling for 401 (trigger token refresh), 429 (rate limit with retry), 5xx
- [ ] Create server endpoint `GET /api/tickets` — returns tickets for authenticated user
- [ ] Create server endpoint `POST /api/tickets/[key]/description` — submits description update

## Phase 4: Markdown to ADF Conversion

- [ ] Integrate markdown-to-ADF conversion library
- [ ] Handle core Markdown constructs: headings, bold, italic, code, lists, links
- [ ] Handle code blocks with language annotation
- [ ] Add unit tests for conversion edge cases (nested lists, inline formatting, empty input)

## Phase 5: Card Stack UI

- [ ] Create `CardStack` component — layered card display with offset/opacity
- [ ] Create `TicketCard` component — issue key, title, type pill, priority pill
- [ ] Integrate svelte-motion for card animations (spring-based exit, promote)
- [ ] Implement card clear animation on successful submission
- [ ] Implement card promote animation (next card slides to top)
- [ ] Respect `prefers-reduced-motion` media query

## Phase 6: Description Editor

- [ ] Create `MarkdownEditor` component — textarea with placeholder styling
- [ ] Wire submit button to POST endpoint with Markdown → ADF conversion
- [ ] Add loading state on submit (disable button, show spinner)
- [ ] Add success feedback (card clears) and error feedback (toast/inline message)
- [ ] Handle empty submission validation (prevent submitting blank descriptions)

## Phase 7: Page Layout & Navigation

- [ ] Create top bar component (wordmark + user avatar/name)
- [ ] Create main page layout (centered 640px column)
- [ ] Implement login page with "Login with Jira" button
- [ ] Implement main view (card stack + editor + progress)
- [ ] Implement empty/done state ("All caught up!")
- [ ] Add progress indicator (X of Y tickets remaining)

## Phase 8: Error Handling & Edge Cases

- [ ] Handle no tickets state (empty on first load)
- [ ] Handle API rate limiting (429) with user-facing message and retry
- [ ] Handle expired refresh token — redirect to re-auth with message
- [ ] Handle network errors gracefully (offline/timeout)
- [ ] Handle concurrent tab usage (same session cookie)

## Phase 9: Testing

- [ ] Unit tests: session store, token refresh logic
- [ ] Unit tests: Markdown → ADF conversion
- [ ] Unit tests: JQL query builder, API response parsing
- [ ] Integration tests: OAuth flow with mocked Atlassian endpoints (MSW)
- [ ] Integration tests: Jira API calls with mocked responses
- [ ] E2E tests: Login → view cards → submit description → card clears (Playwright)
- [ ] E2E test: Empty state when no tickets

## Phase 10: Documentation

- [ ] Write README: setup instructions, Atlassian app registration, env vars, running locally
