---
title: JiraStack — Technology Stack & Architecture
version: 1.0
date_created: 2026-05-02
owner: tphan025
tags: architecture, infrastructure, design, app
---

# Introduction

JiraStack is an extremely minimalist web application that allows users to log in with their Atlassian (Jira Cloud) account, automatically fetch their assigned Jira tickets that lack descriptions, and present them as a visually polished card stack. Users fill in descriptions using a Markdown editor; completed cards clear away with fluid animations. This specification defines the technology stack, architectural decisions, and key considerations for the application.

## 1. Purpose & Scope

This specification covers:

- The technology choices for frontend, backend, styling, animation, authentication, and deployment.
- Architectural constraints and guidelines that shape the implementation.
- Integration points with Atlassian Jira Cloud APIs.
- Security, session management, and deployment considerations.

**Intended audience**: Developers and AI agents building or extending JiraStack.

**Assumptions**:

- The application targets Jira Cloud only (no Jira Data Center support).
- The application supports multiple users, each logging in with their own Atlassian account.
- Sessions are stored in-memory (users re-authenticate after server restart).
- The application is self-hosted via Docker/Node.

## 2. Definitions

| Term | Definition |
| ---- | ---------- |
| **SPA** | Single Page Application — a web app that loads a single HTML page and dynamically updates content. |
| **SvelteKit** | A full-stack framework built on Svelte for building web applications with server-side capabilities. |
| **Tailwind CSS** | A utility-first CSS framework for rapidly building custom designs. |
| **OAuth 2.0 (3LO)** | Three-legged OAuth — Atlassian's authorization flow where a user grants an app access to their data. |
| **OIDC** | OpenID Connect — an identity layer on top of OAuth 2.0. Atlassian supports a subset via their OAuth 2.0 (3LO) flow. |
| **ADF** | Atlassian Document Format — Jira Cloud's native rich-text document format (JSON-based). |
| **JQL** | Jira Query Language — a query language for searching Jira issues. |
| **3LO** | Three-Legged OAuth — Atlassian's term for their OAuth 2.0 authorization code grant flow. |
| **Access Token** | A short-lived credential (1 hour) used to call Jira Cloud APIs on behalf of a user. |
| **Refresh Token** | A long-lived credential used to obtain new access tokens without re-authentication. |

## 3. Requirements, Constraints & Guidelines

### Technology Stack

- **STK-001**: The frontend framework SHALL be **SvelteKit** (latest stable, Svelte 5).
- **STK-002**: The CSS framework SHALL be **Tailwind CSS v4+**.
- **STK-003**: Card stack animations SHALL use **Motion One for Svelte** (`svelte-motion` or equivalent motion library) for polished swipe/clear transitions.
- **STK-004**: The Markdown editor SHALL convert user input to **Atlassian Document Format (ADF)** before submitting to the Jira API. A library such as `md-to-adf` or equivalent SHALL be used for this conversion.
- **STK-005**: The application SHALL be deployed as a **Docker container** running a Node.js-based SvelteKit server (using `@sveltejs/adapter-node`).
- **STK-006**: The application SHALL use **TypeScript** throughout (both server and client code).

### Authentication & Authorization

- **SEC-001**: Authentication SHALL use Atlassian's **OAuth 2.0 (3LO)** authorization code grant flow.
- **SEC-002**: The OAuth client credentials (client ID, client secret) SHALL be configured via **environment variables**, never committed to source code.
- **SEC-003**: Token exchange (authorization code → access token + refresh token) SHALL occur **server-side** in SvelteKit endpoints/hooks to prevent client-side exposure of secrets.
- **SEC-004**: Access tokens SHALL be refreshed automatically when expired (tokens expire after 1 hour). The refresh logic SHALL be transparent to the user.
- **SEC-005**: Sessions SHALL be stored **in-memory** on the server. Sessions are lost on server restart; users must re-authenticate.
- **SEC-006**: All communication with Atlassian APIs SHALL occur over **HTTPS**.
- **SEC-007**: The application SHALL request only the minimum required OAuth scopes: `read:jira-work`, `write:jira-work`, and `offline_access` (for refresh tokens).

### Application Behavior

- **REQ-001**: On login, the application SHALL automatically fetch all Jira tickets assigned to the authenticated user that have an empty or missing description.
- **REQ-002**: Tickets SHALL be displayed as a **card stack** — one card visible at a time, with a peek of cards beneath.
- **REQ-003**: Each card SHALL display at minimum: issue key, summary (title), issue type, and priority.
- **REQ-004**: The user SHALL fill in the description using a **Markdown text area**.
- **REQ-005**: On submission, the Markdown content SHALL be converted to ADF and pushed to the Jira Cloud API to update the ticket's description.
- **REQ-006**: After successful submission, the card SHALL animate out of the stack (clear away) and the next card SHALL become active.
- **REQ-007**: When all tickets are cleared, the application SHALL display a "done" state.
- **REQ-008**: The application SHALL support **multiple concurrent users**, each with their own session and Jira context.

### Constraints

- **CON-001**: The application SHALL target **Jira Cloud only**. Jira Data Center is out of scope.
- **CON-002**: No persistent database is required. All state is ephemeral (in-memory sessions, API-fetched data).
- **CON-003**: The application SHALL be a single-page application — all interactions occur without full page reloads after initial load.
- **CON-004**: The application MUST remain minimalist — avoid feature creep. The core loop is: login → see cards → write description → clear card → repeat.

### Guidelines

- **GUD-001**: Prefer built-in SvelteKit features (hooks, server endpoints, stores) over external libraries where possible.
- **GUD-002**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`) for reactive state management.
- **GUD-003**: Keep the UI minimal and focused — favor whitespace, clean typography, and subtle animations.
- **GUD-004**: Use Tailwind's design tokens for consistent spacing, color, and typography.
- **GUD-005**: Structure the project with clear separation: `routes/` for pages, `lib/server/` for server-only code (auth, Jira API), `lib/components/` for UI components.

## 4. Interfaces & Data Contracts

### Atlassian OAuth 2.0 (3LO) Flow

| Step | Endpoint | Method | Purpose |
| ---- | -------- | ------ | ------- |
| 1. Authorize | `https://auth.atlassian.com/authorize` | GET (redirect) | Redirect user to Atlassian login/consent screen |
| 2. Callback | `/auth/callback` (app route) | GET | Receive authorization code from Atlassian |
| 3. Token Exchange | `https://auth.atlassian.com/oauth/token` | POST | Exchange authorization code for access + refresh tokens |
| 4. Token Refresh | `https://auth.atlassian.com/oauth/token` | POST | Exchange refresh token for new access token |
| 5. Accessible Resources | `https://api.atlassian.com/oauth/token/accessible-resources` | GET | Retrieve the cloud ID of the user's Jira site |

### Jira Cloud REST API

| Operation | Endpoint | Method | Purpose |
| --------- | -------- | ------ | ------- |
| Search issues | `https://api.atlassian.com/ex/jira/{cloudId}/rest/api/3/search` | POST | Fetch assigned tickets with empty descriptions using JQL |
| Update issue | `https://api.atlassian.com/ex/jira/{cloudId}/rest/api/3/issue/{issueKey}` | PUT | Update ticket description with ADF content |
| Get myself | `https://api.atlassian.com/me` | GET | Get current user profile |

### JQL Query for Fetching Tickets

```
assignee = currentUser() AND description is EMPTY ORDER BY priority DESC, created ASC
```

### ADF Document Structure (simplified example)

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "This is a ticket description written in JiraStack."
        }
      ]
    }
  ]
}
```

### Internal Session Shape (TypeScript)

```typescript
interface UserSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp (ms)
  cloudId: string;
  userDisplayName: string;
  userAccountId: string;
}
```

## 5. Acceptance Criteria

- **AC-001**: Given a user visits the app unauthenticated, When they click "Login with Jira", Then they are redirected to Atlassian's OAuth consent screen.
- **AC-002**: Given a user completes Atlassian login, When the callback is received, Then an in-memory session is created and the user is redirected to the main view.
- **AC-003**: Given an authenticated user, When the main view loads, Then all assigned tickets with empty descriptions are fetched and displayed as a card stack.
- **AC-004**: Given a card is displayed, When the user writes a Markdown description and submits, Then the Markdown is converted to ADF and the Jira ticket is updated via the API.
- **AC-005**: Given a ticket is successfully updated, When the API responds with success, Then the card animates out and the next card becomes active.
- **AC-006**: Given all cards are cleared, When no tickets remain, Then a "done" / empty state is displayed.
- **AC-007**: Given a user's access token has expired, When an API call is made, Then the token is silently refreshed using the refresh token before retrying.
- **AC-008**: Given the server restarts, When a user visits the app, Then they must re-authenticate (no persisted sessions).

## 6. Test Automation Strategy

- **Test Levels**: Unit tests for Markdown-to-ADF conversion, server-side auth logic; integration tests for API interactions (mocked); end-to-end tests for the login → card → submit flow.
- **Frameworks**: Vitest (unit/integration), Playwright (E2E), Svelte Testing Library (component tests).
- **Test Data Management**: Mock Jira API responses using MSW (Mock Service Worker) or Vitest mocks. No real Jira credentials in CI.
- **CI/CD Integration**: GitHub Actions pipeline running lint, type-check, unit tests, and E2E tests on every push.
- **Coverage Requirements**: Minimum 80% coverage for server-side logic (`lib/server/`). Component tests are encouraged but not gated.
- **Performance Testing**: Not in initial scope — the app is inherently lightweight.

## 7. Rationale & Context

| Decision | Rationale |
| -------- | --------- |
| **SvelteKit** | Minimal boilerplate, built-in server-side capabilities for OAuth, small bundle size aligned with the "minimalist" philosophy. Svelte 5's runes provide clean reactivity without external state management. |
| **Tailwind CSS** | Utility-first approach enables rapid UI development with consistent design tokens. No need for a component library — the app has very few UI elements. |
| **Motion library** | Card stack animations are a core UX element. A dedicated motion library ensures smooth, polished transitions that feel native. |
| **Markdown → ADF** | Markdown is universally understood by developers (the target audience). Converting to ADF on submission ensures compatibility with Jira's editor. This avoids the complexity of embedding a full ADF/rich-text editor. |
| **In-memory sessions** | Eliminates database dependency. Acceptable trade-off for a lightweight tool — re-login after restart is a minor inconvenience. |
| **Docker + adapter-node** | Self-hosted requirement. Docker provides reproducible builds. adapter-node is SvelteKit's official adapter for Node.js servers. |
| **No database** | The app is stateless by design. Tickets are fetched from Jira on demand. Sessions are ephemeral. Adding a database would contradict the minimalist philosophy. |

## 8. Dependencies & External Integrations

### External Systems

- **EXT-001**: **Atlassian Jira Cloud** — Primary data source. All ticket data is read from and written to Jira via REST API v3.
- **EXT-002**: **Atlassian Identity (auth.atlassian.com)** — OAuth 2.0 provider for user authentication and token management.

### Third-Party Services

- **SVC-001**: **Atlassian OAuth 2.0 (3LO)** — Authorization and token exchange. Requires a registered OAuth 2.0 app in the [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/).

### Infrastructure Dependencies

- **INF-001**: **Node.js runtime** (v20 LTS or later) — Required for SvelteKit's server-side rendering and API routes.
- **INF-002**: **Docker** — Container runtime for deployment.

### Technology Platform Dependencies

- **PLT-001**: **SvelteKit** with `@sveltejs/adapter-node` — Full-stack framework and server adapter.
- **PLT-002**: **Tailwind CSS v4+** — Utility-first CSS framework.
- **PLT-003**: **Svelte motion library** — Animation library for card stack transitions.
- **PLT-004**: **Markdown-to-ADF conversion library** — Converts user-written Markdown to Atlassian Document Format.
- **PLT-005**: **TypeScript** — Type-safe development across server and client code.

## 9. Examples & Edge Cases

### Edge Case: No Tickets Without Descriptions

```
Given: The user logs in and all assigned tickets already have descriptions.
Expected: The app shows the "done" / empty state immediately with a message like
          "All your tickets have descriptions. Nice work!"
```

### Edge Case: Jira API Rate Limiting

```
Given: The Jira API returns HTTP 429 (rate limited).
Expected: The app displays a user-friendly error and retries after the
          Retry-After period. The user is not logged out.
```

### Edge Case: OAuth Refresh Token Expired or Revoked

```
Given: The refresh token is no longer valid (revoked or expired after 90 days of inactivity).
Expected: The app redirects the user to re-authenticate. A clear message is shown:
          "Your session has expired. Please log in again."
```

### Edge Case: Concurrent Sessions (Same User, Multiple Tabs)

```
Given: A user has the app open in two browser tabs.
Expected: Both tabs share the same server session (keyed by session cookie).
          Submitting a description in one tab should be reflected if the other tab
          refreshes its ticket list.
```

### Edge Case: Markdown with Complex Formatting

```markdown
## Acceptance Criteria
- [ ] User can log in
- [ ] Tickets are displayed
- **Bold** and _italic_ and `inline code`

​```python
def hello():
    print("world")
​```
```

```
Expected: The above Markdown is converted to valid ADF with heading, bullet list,
          text formatting marks, and a code block node. The conversion library
          must handle these common Markdown constructs.
```

## 10. Validation Criteria

- [ ] SvelteKit project initializes and builds successfully with `adapter-node`.
- [ ] Tailwind CSS is integrated and utility classes render correctly.
- [ ] OAuth 2.0 (3LO) flow completes end-to-end: login → consent → callback → session created.
- [ ] Token refresh works transparently when access token expires.
- [ ] JQL query returns only assigned tickets with empty descriptions.
- [ ] Markdown input is correctly converted to valid ADF.
- [ ] Jira API accepts the ADF payload and updates the ticket description.
- [ ] Card stack renders with correct layering and animations.
- [ ] Card clears with animation after successful submission.
- [ ] Empty state displays when no tickets remain.
- [ ] Docker image builds and runs the app on port configurable via environment variable.
- [ ] Multiple users can log in concurrently with independent sessions.

## 11. Related Specifications / Further Reading

- [Atlassian OAuth 2.0 (3LO) Documentation](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/)
- [Jira Cloud REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Atlassian Document Format (ADF)](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
