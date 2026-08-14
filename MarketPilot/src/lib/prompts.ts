import type { Workspace } from './types'

/** Shared context block so every module knows which brand it is working for. */
export function brandContext(w: Workspace) {
  return [
    `Brand: ${w.name}`,
    w.industry && `Industry: ${w.industry}`,
    w.website && `Website: ${w.website}`,
    w.audience && `Target audience: ${w.audience}`,
  ]
    .filter(Boolean)
    .join('\n')
}

const VOICE = `Write like a senior growth marketer briefing a founder: specific, decisive, and free of filler. Name real tactics, channels, and numbers rather than generic advice. Never pad a deliverable with boilerplate sections.`

export const CHAT_SYSTEM = `You are MarketPilot AI, the marketing operating system for founders, startups, app companies, and agencies. You act as a senior CMO and growth consultant.

${VOICE}

When a user states a goal (for example "increase app installs by 20%" or "get 10,000 users"), respond with a plan rather than a lecture:
- Open with the single highest-leverage move and why it fits this brand.
- Give a sequenced action plan with owners, channels, and rough timelines.
- Estimate expected impact and name the metric that proves it worked.
- Close with the next concrete step the user should take today.

Use Markdown headings and tight bullets. Keep responses focused — cover the substance without padding. If a request is better served by a dedicated module (competitor reports, ad creative, social calendars, ASO, analytics), say so in one line and still answer the question.`

// --- JSON schemas for structured module output -----------------------------
// Structured outputs require additionalProperties:false and explicit `required`.

const str = { type: 'string' } as const
const strArray = { type: 'array', items: { type: 'string' } } as const

function object<T extends Record<string, unknown>>(properties: T) {
  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  } as const
}

const opportunity = object({
  title: str,
  impact: { type: 'string', enum: ['high', 'medium', 'low'] },
  effort: { type: 'string', enum: ['high', 'medium', 'low'] },
  rationale: str,
})

export const COMPETITOR_SCHEMA = object({
  competitor_name: str,
  summary: str,
  business: object({
    model: str,
    pricing_strategy: str,
    target_audience: str,
    positioning: str,
  }),
  marketing: object({
    ad_angles: strArray,
    headlines: strArray,
    landing_page_notes: strArray,
    content_strategy: strArray,
  }),
  growth: object({
    seo_opportunities: strArray,
    traffic_sources: strArray,
    funnel_recommendations: strArray,
  }),
  opportunities: { type: 'array', items: opportunity },
})

export const AD_SCHEMA = object({
  platform: str,
  objective: str,
  summary: str,
  variants: {
    type: 'array',
    items: object({
      angle: str,
      headline: str,
      body: str,
      cta: str,
      creative_direction: str,
    }),
  },
  testing_plan: strArray,
})

export const SOCIAL_SCHEMA = object({
  platform: str,
  horizon_days: { type: 'integer' },
  summary: str,
  posts: {
    type: 'array',
    items: object({
      day: { type: 'integer' },
      format: str,
      hook: str,
      body: str,
      hashtags: strArray,
      best_time: str,
    }),
  },
  cadence_notes: strArray,
})

export const ASO_SCHEMA = object({
  store: str,
  summary: str,
  title_suggestions: strArray,
  subtitle_suggestions: strArray,
  description_outline: strArray,
  keywords: {
    type: 'array',
    items: object({
      keyword: str,
      demand: { type: 'string', enum: ['high', 'medium', 'low'] },
      difficulty: { type: 'string', enum: ['high', 'medium', 'low'] },
      rationale: str,
    }),
  },
  screenshot_recommendations: strArray,
  conversion_opportunities: { type: 'array', items: opportunity },
})

export const ANALYTICS_SCHEMA = object({
  headline: str,
  narrative: str,
  findings: {
    type: 'array',
    items: object({
      metric: str,
      change: str,
      direction: { type: 'string', enum: ['up', 'down', 'flat'] },
      plain_english: str,
      likely_cause: str,
    }),
  },
  actions: { type: 'array', items: opportunity },
})

// --- Per-module system prompts ---------------------------------------------

export const COMPETITOR_SYSTEM = `You are the Competitor Intelligence agent inside MarketPilot AI.

${VOICE}

You are given a competitor's website, App Store, or Play Store URL plus context about the user's own brand. Produce a comprehensive competitor report covering business model and pricing, positioning and audience, the ad angles and headlines they are likely running, their landing page and content strategy, and their SEO and funnel weak points.

You do not have live browsing. Reason from the URL, brand name, category conventions, and well-known patterns in this market, and write findings as informed analysis. Where a claim is an inference rather than an observation, phrase it as one ("pricing is almost certainly seat-based, given..."). Every opportunity you list must be something the user's brand can act on this quarter.`

export const AD_SYSTEM = `You are the Ad Creative Generator inside MarketPilot AI.

${VOICE}

Produce platform-native ad creative. Match the medium:
- Meta: scroll-stopping hook, primary text that earns the click, one clear CTA, and a described creative concept.
- Google Search: headlines within roughly 30 characters, descriptions within roughly 90, keyword-aligned.
- Google Display / Performance Max: short punchy assets plus an image direction.
- TikTok: spoken hooks for the first two seconds, then a shot-by-shot script.
- YouTube: an opening hook, then a scripted arc with a storyboard note per beat.

Each variant must test a genuinely different angle (pain, outcome, social proof, contrarian, urgency) — not a reworded version of the same idea. The testing plan states what to run first and what result would kill each variant.`

export const SOCIAL_SYSTEM = `You are the Social Media AI Studio inside MarketPilot AI.

${VOICE}

Build a content calendar for a single platform, written in that platform's native voice — LinkedIn thought leadership, Instagram captions and carousel concepts, X threads and standalone posts, Facebook engagement posts, YouTube Shorts and long-form scripts.

Vary the format across the calendar rather than repeating one post shape. Each post needs a hook that works on its own, a body that delivers on it, and a realistic posting time. Spread the posts evenly across the requested horizon and set the "day" field to the day number within it. Keep the calendar to at most 14 posts even for long horizons — cover the horizon with a representative cadence and explain the repeating pattern in the cadence notes.`

export const ASO_SYSTEM = `You are the ASO Optimization agent inside MarketPilot AI.

${VOICE}

Analyze the app listing you are given and return concrete rewrites, not critique. Respect real store limits: Apple title 30 characters, subtitle 30, keyword field 100; Google Play title 30, short description 80, long description 4000. Apple indexes the keyword field and title; Google Play indexes the descriptions — tailor the advice to the store you were given.

Keyword picks must balance demand against how hard the term is for an app of this size, and each needs a one-line reason it is winnable. Screenshot advice should say what the first three frames must communicate, since most conversion is decided there.`

export const ANALYTICS_SYSTEM = `You are the Analytics Agent inside MarketPilot AI.

${VOICE}

You receive a workspace's product metrics. Explain what happened in plain language a non-analyst founder can act on — "retention dropped 15% because new users are falling out during onboarding", not "retention exhibits a negative trend".

Ground every finding in the numbers you were given: cite the actual movement and the window it happened over. Separate what the data shows from what you infer as the likely cause. The actions must be the specific things to change, ranked so the first one is the one to do this week.`

// --- Fallback fixtures ------------------------------------------------------
// Used when no Anthropic credentials are configured, so the product stays
// fully demoable offline. Deliberately specific rather than lorem ipsum.

export function mockChat(prompt: string, w: Workspace) {
  return `_(Demo response — no Anthropic API credentials are configured, so MarketPilot is answering from built-in sample content. Set \`ANTHROPIC_API_KEY\` to get live AI.)_

## The highest-leverage move for ${w.name}

You asked: **${prompt.slice(0, 180)}**

Based on the workspace profile${w.industry ? ` (${w.industry})` : ''}, the fastest path is to fix conversion before buying more traffic. Acquisition spend multiplies whatever your funnel already does — if activation is leaking, paid just makes the leak more expensive.

### 30-day action plan

1. **Instrument the funnel properly** (days 1–3) — event tracking on every step from landing to activation. Owner: growth engineer. Without this, everything below is guesswork.
2. **Fix the largest single drop-off** (days 4–14) — typically onboarding step two. Ship one change, measure, repeat. Owner: product.
3. **Rebuild the top-of-funnel message** (days 7–21) — test three distinct angles (outcome, pain, contrarian) rather than three rewrites of one. Owner: marketing.
4. **Scale only what proves out** (days 21–30) — raise budget on the one channel with a payback period under 60 days. Owner: founder.

### Expected impact

A 3-point improvement in activation typically moves blended CAC more than a 20% increase in ad spend. The metric that proves it worked is **week-1 retention**, not signups.

### Do this today

Pull the last 30 days of funnel data and identify the step with the steepest drop. Bring that number back here and I'll build the fix plan around it.`
}

export function mockCompetitor(name: string, url: string) {
  return {
    competitor_name: name,
    summary: `${name} competes on breadth of integrations and a self-serve motion, winning mid-market teams who want to consolidate tools. Their weak point is onboarding depth — they acquire well but leave activation to the customer, which is the wedge to attack.`,
    business: {
      model: 'Product-led SaaS with a free tier that converts to seat-based subscriptions, plus an annual enterprise contract for larger accounts.',
      pricing_strategy:
        'Three public tiers with a deliberate gap before enterprise pricing, which is quote-only. The middle tier is anchored to look like the obvious choice.',
      target_audience:
        'Mid-market marketing and growth teams of 5–50 people who have outgrown spreadsheets but cannot justify enterprise suites.',
      positioning:
        '"Everything in one place" — positioned against tool sprawl rather than against any single competitor.',
    },
    marketing: {
      ad_angles: [
        'Tool consolidation — "replace five subscriptions with one"',
        'Time saved per week, quantified as a specific number of hours',
        'Social proof through named mid-market logos',
        'Migration ease — "import your data in one click"',
      ],
      headlines: [
        'Stop paying for five tools that do one job',
        'Your whole marketing stack, one login',
        'From spreadsheet chaos to a single dashboard',
        'The marketing platform your team will actually use',
      ],
      landing_page_notes: [
        'Above the fold leads with a product screenshot, not an illustration — it sells the interface itself.',
        'Social proof appears before the feature list, which is the right order for a considered purchase.',
        'The pricing page hides enterprise numbers, creating a sales-qualified funnel behind a self-serve front door.',
        'No comparison page against direct competitors — an SEO gap worth taking.',
      ],
      content_strategy: [
        'High-volume comparison and alternative-to content targeting competitor brand terms',
        'Template and calculator giveaways used as email capture',
        'A weekly newsletter that is the real distribution engine behind their blog',
      ],
    },
    growth: {
      seo_opportunities: [
        `"${name} alternative" and "${name} pricing" are underdefended — they rank for their own brand but have no page owning the objection.`,
        'Long-tail integration queries ("X integration with Y") convert well and have almost no competition.',
        'Their help documentation outranks their marketing pages for several commercial terms — a sign of thin bottom-of-funnel content.',
      ],
      traffic_sources: [
        'Organic search dominates, concentrated in comparison keywords',
        'Paid search on competitor brand terms',
        'Referral traffic from integration marketplace listings',
        'A modest but loyal newsletter audience driving repeat visits',
      ],
      funnel_recommendations: [
        'Attack the activation gap: their trial drops users into an empty state with no guided setup.',
        'Publish a direct comparison page — they have not defended their brand + "vs" terms.',
        'Undercut on time-to-value rather than price; price competition against a funded incumbent is a losing game.',
      ],
    },
    opportunities: [
      {
        title: 'Own the comparison keyword cluster',
        impact: 'high' as const,
        effort: 'medium' as const,
        rationale: `${name} has left brand-adjacent commercial terms undefended. A comparison page plus three alternative-to posts can capture buyers already in-market.`,
      },
      {
        title: 'Ship guided onboarding as a competitive claim',
        impact: 'high' as const,
        effort: 'high' as const,
        rationale:
          'Their empty-state trial is the clearest product weakness. Making time-to-first-value a headline claim converts their own trial abandoners.',
      },
      {
        title: 'Build the integration long-tail',
        impact: 'medium' as const,
        effort: 'low' as const,
        rationale:
          'Programmatic integration pages are cheap to produce and rank fast in a category where nobody is targeting them.',
      },
    ],
    _source: url,
  }
}

export function mockAds(platform: string, product: string) {
  return {
    platform,
    objective: 'Drive qualified trial starts from cold traffic',
    summary: `Four angles for ${product} on ${platform}, each testing a different buying motivation so the winner tells you something about the market rather than just which sentence read better.`,
    variants: [
      {
        angle: 'Pain — the cost of the status quo',
        headline: 'Your marketing stack is eating your margin',
        body: `Five subscriptions. Five logins. One team that still works in spreadsheets. ${product} replaces the sprawl with a single workspace — and most teams see the difference in the first week.`,
        cta: 'Start free',
        creative_direction:
          'Split screen: cluttered tab bar on the left, one clean dashboard on the right. No stock photography.',
      },
      {
        angle: 'Outcome — the specific result',
        headline: 'Ship a campaign in an afternoon',
        body: `From brief to live campaign without waiting on three approvals and a designer. ${product} generates the assets, you approve them, it goes out.`,
        cta: 'See how it works',
        creative_direction:
          'Screen recording at 2x speed showing brief in, finished campaign out. Timestamp overlay to make the speed claim concrete.',
      },
      {
        angle: 'Social proof — peers already moved',
        headline: 'Why growth teams are consolidating',
        body: `Teams switching to ${product} cite one reason more than any other: they stopped losing hours to tool-switching. The work got faster because the context stopped disappearing.`,
        cta: 'Read the case study',
        creative_direction:
          'Customer quote card with a real logo, on brand-dark background. Text-forward, minimal imagery.',
      },
      {
        angle: 'Contrarian — challenge the category',
        headline: 'You do not need more marketing tools',
        body: `The problem was never a missing feature. It is that nothing talks to anything else. ${product} is one system instead of seven integrations pretending to be one.`,
        cta: 'Try it free',
        creative_direction:
          'Bold typographic ad, no product shot. The line does the work — good for testing message strength in isolation.',
      },
    ],
    testing_plan: [
      'Run all four at equal budget for 5 days minimum — do not judge before 50 conversions per variant.',
      'Kill any variant with a click-through rate under half the set average; that is a message problem, not a budget problem.',
      'Take the winning angle and produce three new creatives inside it rather than starting over.',
      'If the contrarian angle wins, the category is saturated and your positioning should shift accordingly.',
    ],
  }
}

export function mockSocial(platform: string, horizon: number, brand: string) {
  const posts = [
    {
      format: 'Thought leadership',
      hook: 'Most growth problems are not traffic problems.',
      body: `Teams ask us how to get more visitors when their real issue is that 70% of the ones they have already leave in the first session. Fix the second problem and the first one gets much cheaper. Here is how we diagnose it at ${brand}.`,
      hashtags: ['growth', 'marketing', 'saas'],
      best_time: 'Tue 08:30',
    },
    {
      format: 'Contrarian take',
      hook: 'Stop A/B testing button colours.',
      body: 'Micro-tests on low-traffic pages produce noise dressed up as insight. Test the offer, the audience, and the channel first — the things that move results by multiples rather than percentages.',
      hashtags: ['cro', 'experimentation'],
      best_time: 'Wed 09:00',
    },
    {
      format: 'Teardown',
      hook: 'We rewrote a landing page and conversion went up 40%. Here is the diff.',
      body: 'The old headline described the product. The new one described the outcome the buyer wanted. Nothing else on the page changed. Most copy problems are perspective problems.',
      hashtags: ['copywriting', 'conversion'],
      best_time: 'Thu 08:00',
    },
    {
      format: 'Data point',
      hook: 'The average marketing team runs 12 tools. They use 4.',
      body: 'Every unused subscription is a decision nobody wants to revisit. Audit quarterly, cancel ruthlessly, and put the budget into the two tools your team actually opens every day.',
      hashtags: ['martech', 'productivity'],
      best_time: 'Mon 12:00',
    },
    {
      format: 'Behind the scenes',
      hook: 'What our first 90 days of content actually produced.',
      body: 'Not a viral post. A compounding one: a single comparison page that still drives a third of our qualified signups. Consistency beats reach when the intent is right.',
      hashtags: ['contentmarketing', 'seo'],
      best_time: 'Fri 10:00',
    },
    {
      format: 'Practical framework',
      hook: 'The 3-question test before you spend a dollar on ads.',
      body: '1. Does the page convert warm traffic already? 2. Do you know your payback period? 3. Can you name the single metric this campaign should move? Three yeses, or do not launch.',
      hashtags: ['paidads', 'growth'],
      best_time: 'Tue 15:00',
    },
    {
      format: 'Customer story',
      hook: 'They cut CAC by 30% without touching ad spend.',
      body: 'The whole change was onboarding: one guided setup flow replaced an empty dashboard. Activation went up, payback got shorter, and the same ad budget suddenly worked.',
      hashtags: ['casestudy', 'retention'],
      best_time: 'Wed 11:00',
    },
  ]

  const count = horizon <= 7 ? 7 : horizon <= 30 ? 10 : 14
  const step = Math.max(1, Math.floor(horizon / count))

  return {
    platform,
    horizon_days: horizon,
    summary: `A ${horizon}-day ${platform} calendar for ${brand} built around one idea: earn attention with a specific claim, then prove it. Formats rotate so the feed never looks templated.`,
    posts: Array.from({ length: count }, (_, i) => ({
      day: i * step + 1,
      ...posts[i % posts.length],
    })),
    cadence_notes: [
      `Publish every ${step} day(s); the pattern repeats across the full ${horizon}-day horizon.`,
      'Keep a 4:1 ratio of value posts to promotional posts — the fifth post can sell because the first four earned it.',
      'Reply to every comment within the first hour; early engagement decides distribution on most platforms.',
      'Recycle the top performer after 6 weeks with a fresh hook rather than writing something new from scratch.',
    ],
  }
}

export function mockAso(store: string, appName: string) {
  const apple = store.toLowerCase().includes('app store')
  return {
    store,
    summary: `${appName}'s listing is currently optimised for brand recall rather than discovery. The title spends its limited characters on the brand alone, and the ${
      apple ? 'keyword field duplicates terms already in the title' : 'long description reads as marketing copy rather than indexed content'
    }. Fixing both is a same-week change with compounding effect.`,
    title_suggestions: [
      `${appName}: Habit Tracker`,
      `${appName} — Daily Habits`,
      `${appName}: Routine Builder`,
    ],
    subtitle_suggestions: [
      'Build habits that stick',
      'Daily routines & streaks',
      'Track habits, build streaks',
    ],
    description_outline: [
      'Open with the outcome in the first two lines — this is all most users see before tapping "more".',
      'Follow with three benefit-led bullets, each naming a concrete feature that delivers it.',
      'Add a short social proof line with a review count or named award.',
      apple
        ? 'Close with a short feature list; remember Apple does not index the description, so write it for humans.'
        : 'Close by repeating your two primary keywords naturally — Google Play indexes this text, so density matters within reason.',
      'End with support and privacy links to signal legitimacy to cautious installers.',
    ],
    keywords: [
      {
        keyword: 'habit tracker',
        demand: 'high' as const,
        difficulty: 'high' as const,
        rationale: 'The category head term. Worth targeting in the title even though ranking takes sustained install velocity.',
      },
      {
        keyword: 'daily routine planner',
        demand: 'medium' as const,
        difficulty: 'medium' as const,
        rationale: 'Strong intent with a much thinner competitive field than the head term — the realistic near-term win.',
      },
      {
        keyword: 'streak tracker',
        demand: 'medium' as const,
        difficulty: 'low' as const,
        rationale: 'Feature-specific and largely undefended. Fast to rank and it attracts users who already understand the mechanic.',
      },
      {
        keyword: 'morning routine app',
        demand: 'medium' as const,
        difficulty: 'low' as const,
        rationale: 'Use-case query with clear purchase intent and low competition from major apps.',
      },
      {
        keyword: 'habit reminder',
        demand: 'low' as const,
        difficulty: 'low' as const,
        rationale: 'Low volume individually, but the cluster of reminder variants adds up and costs nothing extra to target.',
      },
    ],
    screenshot_recommendations: [
      'Frame 1 must state the outcome in a caption, not show a bare UI — most users never swipe past it.',
      'Frame 2 should show the single most distinctive feature; if it looks like every other app here, you lose the comparison.',
      'Frame 3 carries social proof — a rating, a review quote, or a user count.',
      'Use a portrait video preview if you have one; autoplay previews measurably lift conversion on both stores.',
      'Caption text should be legible at thumbnail size — test every frame at 25% scale before shipping.',
    ],
    conversion_opportunities: [
      {
        title: 'Rewrite the first two screenshot captions',
        impact: 'high' as const,
        effort: 'low' as const,
        rationale:
          'These decide the install for most visitors and can ship without an app update. The cheapest conversion win available.',
      },
      {
        title: 'Move a demand keyword into the title',
        impact: 'high' as const,
        effort: 'low' as const,
        rationale:
          'The title is the strongest ranking signal on both stores and it is currently spent entirely on brand.',
      },
      {
        title: 'Add a 15-second app preview video',
        impact: 'medium' as const,
        effort: 'high' as const,
        rationale:
          'Preview videos lift conversion for habit and routine apps where the value is in the interaction loop, not a static screen.',
      },
    ],
  }
}

export function mockAnalytics(summary: {
  retentionChange: number
  userChange: number
  revenueChange: number
}) {
  const dir = (n: number) => (n > 1 ? 'up' : n < -1 ? 'down' : 'flat') as 'up' | 'down' | 'flat'
  const pct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`

  return {
    headline: `Retention is the constraint right now — acquisition is holding, but users are leaving faster than they arrive.`,
    narrative: `Over the last 30 days, new users moved ${pct(
      summary.userChange,
    )} and revenue moved ${pct(
      summary.revenueChange,
    )}, but retention moved ${pct(
      summary.retentionChange,
    )}. That combination has a specific meaning: the top of the funnel is working and the product is not holding the people it brings in. Spending more on acquisition right now would make the leak more expensive, not smaller. The drop is concentrated in the first session, which points at onboarding rather than long-term product value.`,
    findings: [
      {
        metric: 'Retention',
        change: pct(summary.retentionChange),
        direction: dir(summary.retentionChange),
        plain_english:
          'Fewer of the people who sign up come back. The decline is steady rather than a single bad day, which rules out an outage.',
        likely_cause:
          'Users are dropping out during onboarding before reaching the first useful moment in the product.',
      },
      {
        metric: 'New users',
        change: pct(summary.userChange),
        direction: dir(summary.userChange),
        plain_english:
          'Acquisition is roughly steady — the channels bringing people in are still working.',
        likely_cause: 'No meaningful change in campaign mix or spend over the window.',
      },
      {
        metric: 'Revenue',
        change: pct(summary.revenueChange),
        direction: dir(summary.revenueChange),
        plain_english:
          'Revenue is tracking behind user growth, which is what falling retention looks like before it shows up in the top line.',
        likely_cause:
          'Shorter average lifetime means each acquired user is worth less than they were a month ago.',
      },
    ],
    actions: [
      {
        title: 'Instrument every onboarding step this week',
        impact: 'high' as const,
        effort: 'low' as const,
        rationale:
          'You cannot fix the drop-off without knowing which step it happens on. This is a day of work and it unblocks everything else.',
      },
      {
        title: 'Cut the onboarding flow to the shortest path to first value',
        impact: 'high' as const,
        effort: 'medium' as const,
        rationale:
          'Every screen before the first useful moment is a place to lose someone. Remove steps rather than optimising them.',
      },
      {
        title: 'Hold acquisition spend flat until retention recovers',
        impact: 'medium' as const,
        effort: 'low' as const,
        rationale:
          'Scaling into a leaking funnel raises blended CAC without raising revenue. Redirect the budget once week-1 retention stabilises.',
      },
    ],
  }
}
