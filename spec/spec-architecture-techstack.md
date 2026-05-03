---
title: JiraStack — Technology Stack & Architecture
version: 1.0
date_created: 2026-05-02
owner: tphan025
tags: architecture, infrastructure, design, app
---

# Introduction

JiraStack is an extremely minimalist web application that allows users to log in with their Atlassian (Jira Cloud) account, automatically fetch their Jira tickets (assigned to or created by them) that lack descriptions, and present them as a visually polished card stack. Users fill in descriptions using a plain text editor; the text is converted to Atlassian Document Format (ADF) server-side before submission. Completed cards clear away with fluid animations. This specification defines the technology stack, architectural decisions, and key considerations for the application.

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
- **STK-004**: The description editor SHALL accept **plain text** input and convert it to **Atlassian Document Format (ADF)** server-side before submitting to the Jira API. Each line of text is wrapped in an ADF paragraph node.
- **STK-005**: The application SHALL be deployed as a **Docker container** running a Node.js-based SvelteKit server (using `@sveltejs/adapter-node`).
- **STK-006**: The application SHALL use **TypeScript** throughout (both server and client code).

### Authentication & Authorization

- **SEC-001**: For the initial implementation, authentication SHALL use a **Jira API token** with basic auth (email + token), configured via environment variables (`JIRA_API_TOKEN`, `JIRA_USER_EMAIL`, `JIRA_BASE_URL`).
- **SEC-002**: API credentials SHALL be configured via **environment variables**, never committed to source code.
- **SEC-003**: All Jira API calls SHALL occur **server-side** in SvelteKit endpoints to prevent client-side exposure of credentials.
- **SEC-004**: All communication with Jira APIs SHALL occur over **HTTPS**.
- **SEC-005**: OAuth 2.0 (3LO) support SHALL be added in a future phase to enable multi-user login.

### Application Behavior

- **REQ-001**: On login, the application SHALL automatically fetch all Jira tickets assigned to or created by the authenticated user that have an empty or missing description and are not in a Done status category.
- **REQ-002**: Tickets SHALL be displayed as a **card stack** — one card visible at a time, with a peek of cards beneath.
- **REQ-003**: Each card SHALL display at minimum: issue key, summary (title), issue type, and priority.
- **REQ-003a**: Each card SHALL provide **Reject** and **Done** action buttons that transition the ticket's status in Jira and remove the card from the stack.
- **REQ-004**: The user SHALL fill in the description using a **plain text area**.
- **REQ-005**: On submission, the plain text SHALL be converted to ADF (each line becomes a paragraph node) and pushed to the Jira Cloud API to update the ticket's description.
- **REQ-006**: After successful submission, the card SHALL animate out of the stack (clear away) and the next card SHALL become active.
- **REQ-007**: When all tickets are cleared, the application SHALL display a "done" state.
- **REQ-008**: The application SHALL initially support a **single user** via API token. Multi-user support via OAuth 2.0 (3LO) SHALL be added in a future phase.

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

### Authentication (API Token — Initial)

Authentication uses Jira API tokens with HTTP Basic Auth. The `Authorization` header is constructed as `Basic base64(email:token)`.

| Environment Variable | Purpose |
| ---- | ------- |
| `JIRA_API_TOKEN` | Jira API token generated from https://id.atlassian.com/manage-profile/security/api-tokens |
| `JIRA_USER_EMAIL` | Email address of the Jira account |
| `JIRA_BASE_URL` | Jira Cloud instance URL (e.g., `https://yoursite.atlassian.net`) |

### Jira Cloud REST API

| Operation | Endpoint | Method | Purpose |
| --------- | -------- | ------ | ------- |
| Search issues | `{JIRA_BASE_URL}/rest/api/3/search/jql` | POST | Fetch tickets assigned to or created by the user with empty descriptions using JQL |
| Update issue | `{JIRA_BASE_URL}/rest/api/3/issue/{issueKey}` | PUT | Update ticket description with ADF content |
| Get transitions | `{JIRA_BASE_URL}/rest/api/3/issue/{issueKey}/transitions` | GET | Fetch available workflow transitions for a ticket |
| Transition issue | `{JIRA_BASE_URL}/rest/api/3/issue/{issueKey}/transitions` | POST | Execute a workflow transition (Done, Rejected) |
| Get myself | `{JIRA_BASE_URL}/rest/api/3/myself` | GET | Get current user profile |

### JQL Query for Fetching Tickets

```
(assignee = currentUser() OR creator = currentUser()) AND description is EMPTY AND statusCategory != Done ORDER BY priority DESC, created ASC
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

### Server-Side Config Shape (TypeScript)

```typescript
const config = {
  jira: {
    apiToken: string;   // JIRA_API_TOKEN
    userEmail: string;  // JIRA_USER_EMAIL
    baseUrl: string;    // JIRA_BASE_URL
  }
};
```

## 5. Acceptance Criteria

- **AC-001**: Given the app starts with valid `JIRA_API_TOKEN`, `JIRA_USER_EMAIL`, and `JIRA_BASE_URL` env vars, When a user visits the app, Then tickets assigned to or created by the user with empty descriptions are fetched and displayed.
- **AC-002**: Given the app is running, When the main view loads, Then all matching tickets (not Done) with empty descriptions are fetched and displayed as a card stack.
- **AC-003**: Given an authenticated user, When the main view loads, Then tickets they are assigned to or created are fetched and displayed as a card stack.
- **AC-004**: Given a card is displayed, When the user writes a plain text description and submits, Then the text is converted to ADF paragraphs and the Jira ticket is updated via the API.
- **AC-005**: Given a ticket is successfully updated, When the API responds with success, Then the card animates out and the next card becomes active.
- **AC-006**: Given all cards are cleared, When no tickets remain, Then a "done" / empty state is displayed.
- **AC-007**: Given invalid or missing API token env vars, When the app starts, Then it SHALL fail with a clear error message.

## 6. Test Automation Strategy

- **Test Levels**: Unit tests for text-to-ADF conversion, server-side config logic; integration tests for API interactions (mocked); end-to-end tests for the card → submit flow.
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
| **Markdown → ADF** | Replaced with plain text → ADF. Markdown adds complexity without clear value for the minimalist use case. Plain text wrapped in ADF paragraphs is sufficient for ticket descriptions and avoids the need for a Markdown parsing library. |
| **In-memory sessions** | Not needed for API token auth. Will be re-introduced with OAuth. |
| **Docker + adapter-node** | Self-hosted requirement. Docker provides reproducible builds. adapter-node is SvelteKit's official adapter for Node.js servers. |
| **No database** | The app is stateless by design. Tickets are fetched from Jira on demand. Sessions are ephemeral. Adding a database would contradict the minimalist philosophy. |

## 8. Dependencies & External Integrations

### External Systems

- **EXT-001**: **Atlassian Jira Cloud** — Primary data source. All ticket data is read from and written to Jira via REST API v3. Authenticated with API token (basic auth).

### Third-Party Services

- **SVC-001**: **Jira API Token** — Generated from [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens). No OAuth app registration required for initial implementation.

### Infrastructure Dependencies

- **INF-001**: **Node.js runtime** (v20 LTS or later) — Required for SvelteKit's server-side rendering and API routes.
- **INF-002**: **Docker** — Container runtime for deployment.

### Technology Platform Dependencies

- **PLT-001**: **SvelteKit** with `@sveltejs/adapter-node` — Full-stack framework and server adapter.
- **PLT-002**: **Tailwind CSS v4+** — Utility-first CSS framework.
- **PLT-003**: **Svelte motion library** — Animation library for card stack transitions.
- **PLT-004**: **Text-to-ADF conversion** — Custom `textToAdf()` function wraps plain text lines into ADF paragraph nodes. No external library required.
- **PLT-005**: **TypeScript** — Type-safe development across server and client code.

## 9. Examples & Edge Cases

### Edge Case: No Tickets Without Descriptions

```
Given: The user logs in and all their tickets already have descriptions.
Expected: The app shows the "done" / empty state immediately with a message like
          "All your tickets have descriptions. Nice work!"
```

### Edge Case: Jira API Rate Limiting

```
Given: The Jira API returns HTTP 429 (rate limited).
Expected: The app displays a user-friendly error and retries after the
          Retry-After period. The user is not logged out.
```

### Edge Case: Invalid API Token

```
Given: The JIRA_API_TOKEN or JIRA_USER_EMAIL is invalid or revoked.
Expected: The app displays a clear error: "Failed to connect to Jira. Check your API token and email."
```

### Edge Case: Plain Text Conversion

```
Input: "Line one\n\nLine two\nLine three"
Expected: ADF doc with 4 nodes — paragraph("Line one"), empty paragraph,
          paragraph("Line two"), paragraph("Line three"). Trailing blank
          lines are trimmed. Empty/whitespace-only input produces a single
          empty paragraph.
```

## 10. Validation Criteria

- [ ] SvelteKit project initializes and builds successfully with `adapter-node`.
- [ ] Tailwind CSS is integrated and utility classes render correctly.
- [ ] OAuth 2.0 (3LO) flow completes end-to-end (future phase).
- [ ] JQL query returns only tickets assigned to or created by the user with empty descriptions, excluding Done.
- [ ] Plain text input is correctly converted to valid ADF paragraphs.
- [ ] Jira API accepts the ADF payload and updates the ticket description.
- [ ] Card stack renders with correct layering and animations.
- [ ] Card clears with animation after successful submission.
- [ ] Empty state displays when no tickets remain.
- [ ] Docker image builds and runs the app on port configurable via environment variable.
- [ ] Multiple users can log in concurrently with independent sessions (future phase, with OAuth).

## 11. Related Specifications / Further Reading

- [Atlassian OAuth 2.0 (3LO) Documentation](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/)
- [Jira Cloud REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Atlassian Document Format (ADF)](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
