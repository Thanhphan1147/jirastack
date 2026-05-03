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

## Phase 2: API Token Authentication

- [ ] Configure environment variables (JIRA_API_TOKEN, JIRA_USER_EMAIL, JIRA_BASE_URL)
- [ ] Create Jira auth helper — builds Basic auth header from email + token
- [ ] Remove OAuth routes, session store, and hooks
- [ ] Add simple server-side validation that env vars are set on startup

## Phase 3: Jira API Integration

- [ ] Create Jira API client module (`lib/server/jira.ts`)
- [ ] Implement `fetchTicketsWithoutDescription()` — JQL search for assigned tickets with empty descriptions
- [ ] Implement `updateTicketDescription(issueKey, adfContent)` — PUT description to Jira API
- [ ] Add error handling for 401 (invalid token), 429 (rate limit with retry), 5xx
- [ ] Create server endpoint `GET /api/tickets` — returns tickets for the configured user
- [ ] Create server endpoint `POST /api/tickets/[key]/description` — submits description update

## Phase 4: Plain Text to ADF Conversion

- [ ] Create `textToAdf()` — wraps plain text lines into ADF paragraph nodes
- [ ] Wire POST endpoint to accept plain text and convert server-side
- [ ] Add unit tests for conversion (empty input, multiline, whitespace trimming)

## Phase 5: Card Stack UI

- [ ] Create `CardStack` component — layered card display with offset/opacity
- [ ] Create `TicketCard` component — issue key, title, type pill, priority pill
- [ ] Integrate svelte-motion for card animations (spring-based exit, promote)
- [ ] Implement card clear animation on successful submission
- [ ] Implement card promote animation (next card slides to top)
- [ ] Respect `prefers-reduced-motion` media query

## Phase 6: Description Editor

- [ ] Create `DescriptionEditor` component — textarea with placeholder styling
- [ ] Wire submit button to POST endpoint (sends plain text, converted to ADF server-side)
- [ ] Add loading state on submit (disable button, show spinner)
- [ ] Add success feedback (card clears) and error feedback (toast/inline message)
- [ ] Handle empty submission validation (prevent submitting blank descriptions)

## Phase 6.5: Card Actions (Reject / Done)

- [ ] Add `transitionTicket()` to Jira client — fetches available transitions and executes matching one
- [ ] Create `POST /api/tickets/[key]/transition` endpoint — accepts `{ status: "Done" | "Rejected" }`
- [ ] Add Reject and Done buttons to top card in CardStack
- [ ] Wire buttons to transition API, remove card from stack on success
- [ ] Add loading spinner on action buttons during API call

## Phase 7: Page Layout & Navigation

- [ ] Create top bar component (wordmark + user info)
- [ ] Create main page layout (centered 640px column)
- [ ] Implement main view (card stack + editor + progress)
- [ ] Implement empty/done state ("All caught up!")
- [ ] Add progress indicator (X of Y tickets remaining)

## Phase 8: Error Handling & Edge Cases

- [ ] Handle no tickets state (empty on first load)
- [ ] Handle API rate limiting (429) with user-facing message and retry
- [ ] Handle invalid API token — show clear error message
- [ ] Handle network errors gracefully (offline/timeout)

## Phase 9: Testing

- [ ] Unit tests: Jira API client, config validation
- [ ] Unit tests: Text → ADF conversion
- [ ] Integration tests: Jira API calls with mocked responses
- [ ] E2E tests: View cards → submit description → card clears (Playwright)
- [ ] E2E test: Empty state when no tickets

## Phase 10: Documentation

- [ ] Write README: setup instructions, API token generation, env vars, running locally

## Phase 11: OAuth 2.0 (3LO) — Multi-User Login (Future)

- [ ] Register OAuth 2.0 app in Atlassian Developer Console
- [ ] Implement `/auth/login` route — redirect to Atlassian authorize URL
- [ ] Implement `/auth/callback` route — exchange authorization code for tokens
- [ ] Create in-memory session store (Map keyed by session ID)
- [ ] Set secure HTTP-only session cookie on successful auth
- [ ] Implement token refresh logic (auto-refresh on expiry)
- [ ] Implement `/auth/logout` route — clear session and cookie
- [ ] Add SvelteKit hooks for session validation on protected routes
- [ ] Fetch accessible resources (cloud ID) after token exchange
