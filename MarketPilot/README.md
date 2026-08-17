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

### Providers

AI access goes through a provider chain in `src/lib/ai/`. `AI_CHAIN` lists
providers in order; the first with working credentials answers, and if none do,
every module falls back to sample content.

```
AI_CHAIN=openai,anthropic     # prefer OpenAI, keep Anthropic as backup
```

Adding a provider is one file in `src/lib/ai/providers/` implementing the
`Provider` interface, plus one line in the registry. The nine callers import
`generate()`/`chatStream()` and never learn a provider exists.

**OpenAI needs both `OPENAI_API_KEY` and `OPENAI_MODEL`.** There is no default
model on purpose — ids change often, and guessing one turns into a confusing 404
at request time. Without both set the provider reports itself unconfigured and is
skipped rather than failing the request.

Two things are worth knowing before switching the chain away from Anthropic:

- **Structured output guarantees differ.** Anthropic enforces the JSON schema;
  OpenAI's strict mode enforces the same shape but caps nesting depth and
  property count, which the larger intelligence schemas can exceed. That case
  degrades to plain JSON mode with the schema inlined and the result parse-checked
  — the guarantee is weaker, so malformed output surfaces as an error instead of
  reaching the UI half-formed.
- **The intelligence research stage is Anthropic-only.** It uses the
  `web_fetch`/`web_search` server tools, which have no cross-provider equivalent.
  Without Anthropic credentials that stage is skipped and reports are written
  without live page data, whatever `AI_CHAIN` says.

## What's built

| Module | Route | What it does |
|---|---|---|
| AI Marketing Chat | `/chat` | Streaming CMO-level chat with per-workspace context memory and saved conversations |
| Competitor Intelligence | `/competitors` | Business, marketing, and growth analysis of a website or app listing, plus ranked openings |
| Ad Creative Generator | `/ads` | Meta, Google Search, Display/PMax, TikTok, YouTube — variants across distinct angles + a testing plan |
| Social Media AI Studio | `/social` | 7/30/90-day calendars for LinkedIn, Instagram, X, Facebook, YouTube with hooks, bodies, hashtags, timing |
| ASO Optimizer | `/aso` | Title/subtitle rewrites inside real store limits, ranked keywords, screenshot direction |
| Analytics Command Center | `/analytics` | Metric dashboard plus an AI briefing that explains movements in plain language |
| Marketing Intelligence Engine | `/intelligence` | Full 13-section audit of any competitor URL, multi-competitor comparison, and CEO reports exportable to PDF/PPTX/XLSX |
| Settings | `/settings` | Brand profile, role capabilities, plans, and the workspace asset library |

### Marketing Intelligence Engine (Module 10)

Paste any Play Store, App Store, website, landing page, or SaaS URL. The engine
detects the target type, researches it, and returns all thirteen spec sections:
executive summary, persona, positioning, ASO, acquisition channels, Google Ads,
Meta Ads, ad creative, funnel, revenue, ad library, SWOT, and growth
recommendations — plus seven 0–100 scores and a ranked action plan.

Two design decisions are worth knowing:

- **Research first, then four parallel passes.** One structured call for all
  thirteen sections is unreliable at that size, so a single research stage
  (using the `web_fetch` and `web_search` server tools) produces a digest that
  four independent section-group calls share. They run concurrently, and one
  group failing degrades that section to its fixture instead of losing the whole
  report.
- **Scores are computed, not asked for.** Each group returns its own rubric-bound
  score; the headline marketing score is a weighted blend in code. When the
  target is not an app, ASO is `null` and its weight is redistributed rather than
  counted as zero — a website is not a bad app listing.

Comparison takes 2–10 finished reports and produces the market landscape,
positioning, messaging, feature, and growth-opportunity matrices plus a CEO
growth report. Any report or comparison exports to PDF, PowerPoint, or Excel;
the Excel export puts every table on its own filterable sheet.

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
- **Module 2 (Competitor Intelligence) does not browse.** The older, lighter
  competitor module reasons from the URL and category conventions rather than
  fetching the page. Module 10 supersedes it and does fetch — Module 2 is kept
  because it is a faster, cheaper single call when a full audit is overkill.
- **Screenshot and feature-graphic analysis is textual.** Module 10's ASO section
  reasons about creative from listing text and category conventions; it does not
  download and look at the images. Passing the screenshots in as image blocks
  would make that section genuinely visual.
- **Modules 7–8 from the spec** (Growth Consultant, Marketing Automation) are not
  separate modules. Growth consulting is folded into the chat system prompt;
  automation workflows are not built. Module 9 (Reporting Engine) exists only as
  Module 10's PDF/PPTX/XLSX export — there is no scheduled or white-labelled
  reporting.
- **Team invitations.** The membership table supports multiple users per
  workspace, but there is no invite flow — each account creates its own workspace.
