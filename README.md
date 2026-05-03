# JiraStack

A minimalist web app that surfaces your Jira tickets missing descriptions, presented as a card stack. Write a description, submit, and the card clears — move on to the next one.

## Features

- **Card stack UI** — tickets displayed as stacked cards with smooth fly/fade transitions
- **Plain text editor** — write descriptions in plain text; converted to Atlassian Document Format (ADF) server-side
- **Reject / Done actions** — mark tickets as done or reject them directly from the card
- **Expandable titles** — click a card title to reveal the full summary
- **Progress tracking** — progress bar showing how many tickets you've cleared
- **Reduced motion** — respects `prefers-reduced-motion` for all animations

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) (for containerized deployment)
- A Jira Cloud instance with an API token

## Generating a Jira API Token

1. Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Give it a label (e.g. "JiraStack") and click **Create**
4. Copy the token — you won't be able to see it again

## Configuration

Copy the example env file and fill in your values:

```sh
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `JIRA_API_TOKEN` | Your Jira API token | `ABCdef123...` |
| `JIRA_USER_EMAIL` | Email associated with the token | `you@example.com` |
| `JIRA_BASE_URL` | Your Jira Cloud instance URL | `https://yoursite.atlassian.net` |
| `PORT` | Server port (optional, default `3000`) | `3000` |
| `ORIGIN` | Public origin URL (optional) | `http://localhost:3000` |

## Running with Docker (recommended)

```sh
# Build and start
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The app will be available at `http://localhost:3000`.

## Running Locally

```sh
# Install dependencies
npm install

# Start dev server
npm run dev
```

## How It Works

JiraStack fetches tickets from Jira using this JQL query:

```
(assignee = currentUser() OR creator = currentUser())
  AND description is EMPTY
  AND statusCategory != Done
ORDER BY priority DESC, created ASC
```

This returns tickets that:
- Are **assigned to you** or **created by you**
- Have **no description**
- Are **not marked as Done**

When you submit a description, the plain text is converted to ADF on the server and pushed to Jira via the REST API. The card clears and the next ticket appears.

## Project Structure

```
src/
  lib/
    server/           # Server-only: Jira client, ADF conversion, config
    components/       # UI: CardStack, TicketCard, DescriptionEditor
  routes/
    +page.svelte      # Main page
    api/tickets/      # GET tickets, POST description, POST transition
```

## Tech Stack

- **SvelteKit** (Svelte 5) + TypeScript
- **Tailwind CSS** v4
- **adapter-node** for Docker deployment
- **Vitest** for unit tests

## Running Tests

```sh
npm run test:unit
```

## License

MIT
