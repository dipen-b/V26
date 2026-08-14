# MarketPilot AI

An AI Marketing Operating System — ChatGPT for marketing teams. Tell it a goal
("increase app installs by 20%") and it analyzes, plans, generates, and tells you
what to do next.

This build covers the six MVP modules from the product spec, on real auth and real
persistence.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3100 and create a workspace. Nothing else is required — with
no API key the app runs on built-in sample content and labels it **Demo content**
in the UI.

For live AI, add a `.env` (see `.env.example`):

```
ANTHROPIC_API_KEY=sk-ant-...
AUTH_SECRET=<random string>
```

The app calls **`claude-opus-5`** with adaptive thinking: streaming for chat, and
structured outputs (JSON Schema) for the module generators so every report has a
guaranteed shape.

## What's built

| Module | Route | What it does |
|---|---|---|
| AI Marketing Chat | `/chat` | Streaming CMO-level chat with per-workspace context memory and saved conversations |
| Competitor Intelligence | `/competitors` | Business, marketing, and growth analysis of a website or app listing, plus ranked openings |
| Ad Creative Generator | `/ads` | Meta, Google Search, Display/PMax, TikTok, YouTube — variants across distinct angles + a testing plan |
| Social Media AI Studio | `/social` | 7/30/90-day calendars for LinkedIn, Instagram, X, Facebook, YouTube with hooks, bodies, hashtags, timing |
| ASO Optimizer | `/aso` | Title/subtitle rewrites inside real store limits, ranked keywords, screenshot direction |
| Analytics Command Center | `/analytics` | Metric dashboard plus an AI briefing that explains movements in plain language |
| Settings | `/settings` | Brand profile, role capabilities, plans, and the workspace asset library |

Everything a generator produces is saved to the workspace asset library.

## Architecture

Single Next.js 15 app — App Router pages plus route handlers — rather than a
separate API service, so there is one dev server and one deploy target.

```
src/
  app/
    (app)/            authenticated shell + the six modules
    api/              route handlers (auth, chats, competitors, generate/*, analytics, assets)
    login, register   auth pages
  components/         UI primitives, app shell, chat markdown
  lib/
    db.ts             better-sqlite3 schema + migrations
    auth.ts           bcrypt + JWT session cookie, workspace membership checks
    types.ts          roles and the capability matrix
    ai.ts             Claude client, streaming, structured outputs, fallback
    prompts.ts        per-module system prompts, JSON schemas, sample fixtures
```

**Auth** is bcrypt password hashing with a signed JWT in an httpOnly cookie.
**Persistence** is SQLite (`better-sqlite3`) at `.data/marketpilot.db`, created and
migrated on first run.

**Roles** are enforced in every route handler, not just hidden in the sidebar:

| Role | Modules |
|---|---|
| Founder | All six + workspace creation + billing |
| Marketing Manager | All six |
| Marketing Executive | Chat, ads, social |
| Agency Owner | All six + client workspaces + white-label |

A blocked module returns 403; a workspace you are not a member of returns 404.

## AI layer

`lib/ai.ts` always attempts a live call — the Anthropic SDK resolves credentials
from `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, or an `ant auth login` profile,
so an unset env var does not mean "no credentials."

If the call fails on **credentials** specifically, the module falls back to a
built-in fixture and the UI badges it **Demo content**. Other errors surface as
real errors rather than being masked by sample data. `MARKETPILOT_MOCK=1` forces
fixtures for demos.

## Known gaps

These are deliberately out of scope for this build:

- **Analytics connectors.** GA4, Firebase, Meta Ads, Google Ads, and LinkedIn Ads
  are not integrated. Each workspace is seeded with 90 days of synthetic metrics
  in the shape a real connector would write, and the AI briefing runs on whatever
  is in the `metrics` table.
- **Billing.** Plans are displayed for reference; no payment provider is wired up
  and every module is unlocked regardless of plan.
- **Competitor analysis does not browse.** The model reasons from the URL, brand,
  and category conventions rather than fetching the page, and phrases inferences
  as inferences. Adding the `web_fetch` server tool would make it live.
- **Modules 7–9 from the spec** (Growth Consultant, Marketing Automation,
  Reporting Engine) are not separate modules. Growth consulting is folded into the
  chat system prompt; automation and PDF/Excel/PowerPoint export are not built.
- **Team invitations.** The membership table supports multiple users per
  workspace, but there is no invite flow — each account creates its own workspace.
