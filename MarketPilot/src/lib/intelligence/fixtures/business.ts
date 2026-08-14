import type {
  BusinessGroup,
  FunnelIntelligence,
  GrowthRecommendations,
  RevenueIntelligence,
  Swot,
  TargetInput,
} from '../types'

const isStoreListing = (kind: TargetInput['kind']) => kind === 'play_store' || kind === 'app_store'

function appFunnel(target: TargetInput): FunnelIntelligence {
  const apple = target.kind === 'app_store'
  const store = apple ? 'the App Store' : 'Google Play'

  return {
    summary: `${target.name} runs a paid-acquisition funnel that is cheap at the top and starved in the middle: install is frictionless and the paywall is correctly placed after the product has shown the user their own data, but the step between the two — connecting a bank account before anything has been demonstrated — is where the funnel actually breaks. It is the largest drop anywhere ahead of the commercial ask, and it is the one they have the most control over, since it is a trust problem rather than a product problem. Everything downstream is rationed by it: on the stage figures below, barely a third of installs ever reach the paywall at all, and no amount of paywall copy fixes an audience that small.`,
    stages: [
      {
        stage: 'Ad impression (App campaigns, Meta, TikTok)',
        description: `Paid creative doing the qualifying work. The assets in evidence lead with interface rather than with the moment of financial anxiety that makes someone install a budgeting app, so the click that arrives is browsing rather than in-pain.`,
        estimated_dropoff: `97-99% lost — a 1-3% CTR is the working band for finance install inventory, and UI-led creative sits at the bottom of it. Benchmark rather than an observed figure.`,
      },
      {
        stage: `Store listing view on ${store}`,
        description: `The listing has to convert both paid traffic and category-search traffic with the same assets. The first two screenshot frames are uncaptioned product UI, so the install decision is made on brand and rating alone.`,
        estimated_dropoff: `55-70% lost — category benchmark for finance listings is roughly 30-45% listing-to-install on search traffic, and the uncaptioned opening frames argue for the weak end of that band.`,
      },
      {
        stage: 'Install and first open',
        description: `Standard store install, then a signup wall. Social and email signup are both offered, which keeps this step light, but asking for an account before showing anything costs the users who installed on impulse.`,
        estimated_dropoff: `20-30% lost — install-to-registration in personal finance typically runs 70-80%; the pre-value signup wall is what keeps it from being higher.`,
      },
      {
        stage: 'Onboarding and bank connection',
        description: `The pivotal step. The user is asked to link a bank through an aggregator before the product has demonstrated anything, and the screen carries no security proof — no encryption statement, no read-only assurance, no named institution logos beyond the search field.`,
        estimated_dropoff: `40-55% lost — the largest drop anywhere ahead of the commercial ask, and the reason the paywall population is as small as it is. Aggregator link rates in consumer finance cluster in that band when the connect prompt precedes first value; nothing observed suggests ${target.name} is an exception.`,
      },
      {
        stage: 'First value: categorized spending and detected bills',
        description: `Once accounts are linked the product delivers quickly — 60 to 90 seconds to a populated dashboard and a first pass at recurring-charge detection, which is the strongest moment in the whole experience.`,
        estimated_dropoff: `8-12% lost — mostly connection failures and stale-credential errors at the aggregator, not disengagement. The product is genuinely good here.`,
      },
      {
        stage: 'Paywall view',
        description: `A hard paywall on the second or third session gating budgets, bill alerts and shared household budgets, with monthly and annual side by side and a 7-day trial on annual.`,
        estimated_dropoff: `80-85% lost at this step — 15-20% of paywall views start the trial, which is the working band for a hard paywall sitting behind a soft free tier. Compounded with the stages above and the trial step below, that lands install-to-paid at 3-6% over 30 days. Benchmark, not measured.`,
      },
      {
        stage: 'Trial to paid subscription',
        description: `Store-managed trial with an auto-renew conversion. No visible in-trial nudge sequence — no day-5 email or push showing what the user would lose — so conversion rides entirely on whether the habit formed on its own.`,
        estimated_dropoff: `40-50% of trial starts lapse — store trials without a lifecycle sequence convert around 50-60%, versus 65-75% when the last 48 hours are actively worked.`,
      },
    ],
    strengths: [
      'Time to first value is genuinely fast once accounts are connected — a populated dashboard inside 90 seconds, which is the hard part of this product and they have solved it.',
      'The paywall is placed after first value rather than in the onboarding flow, so the upgrade ask lands on a user who has already seen their own data.',
      'Monthly and annual are shown together with the annual saving stated as a percentage, which is the pricing presentation that reliably pushes mix toward annual.',
      'Signup accepts social auth alongside email, removing a password step at the point where impulse installs are most likely to bail.',
      `Recurring-charge detection gives ${target.name} an "aha" that is specific and surprising — users find a subscription they forgot about, which is a far stronger activation event than a chart.`,
    ],
    weaknesses: [
      'The bank-connection prompt carries no trust scaffolding: no read-only assurance, no encryption or regulatory statement, no recognizable institution logos above the fold on the screen that costs them half their funnel.',
      'Signup is demanded before any value is shown, so the funnel spends its first ask on the user rather than on the product.',
      'Nothing recovers a failed or abandoned bank connection — no manual-entry fallback, no "try a different bank", no email the next day.',
      'The paywall sells features (budgets, alerts, shared budgets) rather than the outcome the product has already produced for this specific user — the forgotten subscriptions it surfaced in their first session — wasting the strongest piece of context it holds.',
      'No in-trial lifecycle sequence, so half the trial starts expire on autopilot with no attempt to convert them.',
      'The free tier is complete enough for casual use — full transaction categorization with no cap — which quietly removes the reason to upgrade for the lightest and most numerous segment.',
    ],
    conversion_risks: [
      'Aggregator dependency: a single bank-connection provider sits between them and their activation event, and an outage or a repriced contract hits the funnel at its narrowest point.',
      apple
        ? 'ATT opt-out rates cap install-campaign optimization on iOS, so paid CPI drifts upward whenever SKAdNetwork signal thins — the funnel has no organic buffer to absorb that.'
        : 'Play policy on financial-data permissions and the sensitive-permissions declaration is a recurring review risk; a rejected update can freeze the funnel at the listing for a week.',
      'Open banking rule changes in any core market could force a re-consent flow, which means re-running the funnel step that already loses half the users.',
      'A single trust incident anywhere in consumer fintech depresses connection rates industry-wide for weeks, and they have no owned channel to reassure users through.',
      'The store trial is store-managed, so pricing, trial length and win-back are all constrained by platform rules and cannot be tested as freely as a web-billed equivalent.',
      'The platform takes 30% of first-year subscription revenue, so a rising CPI and a fixed commission compress the same margin from both ends and there is no billing route that avoids either.',
    ],
    optimization_opportunities: [
      {
        title: 'Rebuild the bank-connection screen as a trust screen',
        impact: 'high',
        effort: 'low',
        rationale:
          'The largest drop in the funnel is a trust decision, not a usability one. Read-only assurance, bank-grade encryption stated plainly, institution logos, and a one-line "we can never move your money" convert on reassurance rather than on interface work.',
        estimated_impact:
          'A 10-18% relative lift in connection completion is the normal result of adding explicit trust proof at this step, which flows straight through to paywall views.',
      },
      {
        title: 'Show one real insight before asking for the bank connection',
        impact: 'high',
        effort: 'medium',
        rationale:
          'Reversing the order — a demo dashboard or a manual first expense before the connect prompt — moves the ask to a user who has already seen the product work. It is the highest-leverage sequencing change available in this funnel.',
        estimated_impact:
          'Typically an 8-15% lift in install-to-activation, and it compounds with the trust-screen change rather than overlapping it.',
      },
      {
        title: 'Rewrite the paywall around the insight the user just saw',
        impact: 'medium',
        effort: 'low',
        rationale: `A paywall that says "you are paying $47 a month for three subscriptions you forgot about — keep tracking them" is a different offer from a feature list, and ${target.name} already has the data to render it live.`,
        estimated_impact: 'Contextual paywalls in this category run 15-25% ahead of static feature paywalls on view-to-trial.',
      },
      {
        title: 'Add a three-touch in-trial sequence and a failed-connection recovery flow',
        impact: 'medium',
        effort: 'medium',
        rationale:
          'Two lifecycle gaps sit next to each other: nobody follows up a broken bank link, and nobody works the last 48 hours of a trial. Both are email-and-push work with no product dependency.',
        estimated_impact:
          'Trial-to-paid typically moves from the 50-60% band into the 65-75% band, and connection recovery returns 3-6% of otherwise dead installs.',
      },
      {
        title: 'Cap the free tier at a number that bites',
        impact: 'medium',
        effort: 'medium',
        rationale:
          'Unlimited categorization on the free tier removes the upgrade trigger for the largest segment. A cap on connected accounts or on active budgets creates a natural moment to ask, without making the free product useless.',
        estimated_impact: 'A well-placed cap normally lifts free-to-paid by 1-2 points, which is 20-40% relative at this base rate.',
      },
    ],
  }
}

function webFunnel(target: TargetInput): FunnelIntelligence {
  const single = target.kind === 'landing_page'

  return {
    summary: `${target.name} runs a search-led self-serve funnel that is strong at the top and thin in the middle. Comparison and problem-led content brings in buyers who already know what they want, and the landing pages convert well because the intent arrives pre-qualified. The break is between signup and activation: the product requires a data connection or an integration before it does anything, and nothing in the onboarding is built to get a first-time user across that step in one sitting. Paid conversion then depends on a self-serve upgrade prompt with no human in the loop, which caps the deal size long before pricing does.`,
    stages: [
      {
        stage: 'Search query or paid click',
        description: `High-intent entry: comparison queries, "<competitor> alternative", and problem-led long tail, plus brand-defense paid search on top of the same terms. Intent quality here is the best thing about ${target.name}'s funnel.`,
        estimated_dropoff: `Not a dropoff stage in the usual sense — organic positions 1-3 turn roughly 10-30% of impressions into sessions, so 70-90% of the addressable query volume never arrives at all. That is a ceiling on reach set by ranking, not a leak in the funnel. Benchmark band, not an observed figure.`,
      },
      {
        stage: single ? 'Landing page' : 'Landing or comparison page',
        description: single
          ? `A single-purpose page carrying the whole argument: headline promise, three proof blocks, a pricing anchor and one form. Everything rests on this page, so its weaknesses are the funnel's weaknesses.`
          : `Templated comparison and use-case pages that answer the query directly and hand off to a signup CTA. Social proof is present but generic — logo strips rather than named outcomes.`,
        estimated_dropoff: `88-94% lost — a 6-12% visit-to-signup rate is strong for B2B content traffic; the generic proof is what keeps this from the top of the band.`,
      },
      {
        stage: 'Signup / trial start',
        description: `Self-serve email signup into a free tier or a 14-day trial with no card. Low friction on the form itself, but the workspace that appears on the other side is empty.`,
        estimated_dropoff: `25-35% lost between CTA click and a completed account — mostly email verification and the work-email requirement. Benchmark for a no-card B2B signup.`,
      },
      {
        stage: 'Activation: first integration connected and first result seen',
        description: `The decisive step. Value requires connecting a data source or inviting a teammate, and the empty state offers a documentation link rather than a guided path or sample data.`,
        estimated_dropoff: `55-70% lost — self-serve B2B tools that gate first value behind an integration routinely activate only 30-45% of signups. This is where the funnel actually fails.`,
      },
      {
        stage: 'Paid conversion',
        description: `An in-app upgrade prompt at the plan limit, plus a trial-expiry email. No sales-assist path for accounts that show buying signals, so a team of forty converts through the same self-serve flow as a team of two.`,
        estimated_dropoff: `85-93% lost — 7-15% trial-to-paid is the normal band for no-card B2B trials, and the absence of any human follow-up on high-intent accounts holds it mid-band.`,
      },
    ],
    strengths: [
      'Intent quality at the top is unusually high: comparison and alternative-to pages catch buyers at the decision point rather than the awareness stage, so the funnel starts with people who are already shopping.',
      'The signup form asks for the minimum — work email and password, no company size, no phone — which is the right trade for a self-serve motion.',
      'A no-card trial removes the largest single objection to starting, and it keeps the trial population honest for measuring activation.',
      'Landing pages match the query they rank for, so the message the visitor arrives on is the message they searched for, which is why the top of this funnel converts above the category norm.',
      'Pricing is public and legible, which lets buyers self-qualify before signup and keeps sales overhead near zero.',
    ],
    weaknesses: [
      'The empty state is documentation, not a product. A new account sees an integration picker and a help link with no sample workspace to make the value obvious before the work begins.',
      'Activation depends on a step — connecting a data source — that often requires someone other than the person who signed up, and nothing in the flow helps them bring that person in.',
      'Social proof is a logo strip. No named customer outcomes, no quantified before-and-after, nothing that answers "did this work for a team like mine".',
      'No sales-assist path: accounts that invite five teammates in a week are treated exactly like a solo signup, so the largest deals convert at self-serve prices or not at all.',
      'The trial-expiry email is the entire lifecycle motion; there is no behavior-triggered nudge for the signup that stalled at the integration step on day one.',
      single
        ? 'The single page carries every objection at once, so the funnel has nowhere to handle a buyer who needs a second visit to decide.'
        : 'Comparison pages rank well but end in a generic CTA rather than an offer shaped to the competitor the visitor was researching.',
    ],
    conversion_risks: [
      'Roughly two thirds of funnel entry routes through Google in one form or another; a core-update ranking loss would hit the organic and paid halves at the same time.',
      'A competitor bidding aggressively on their brand and comparison terms could raise blended CAC by a third with no owned audience available as a counterweight.',
      'AI search summaries answer comparison queries directly in the results page, which is the exact query class this funnel depends on — click-through on informational terms is structurally eroding.',
      'The activation step depends on third-party integration APIs; a partner deprecation or a permission-scope change breaks first value for a whole segment at once.',
      'Self-serve-only pricing puts a ceiling on ACV that becomes a real problem the moment a competitor introduces a sales-led enterprise tier into the same accounts.',
      'Free-tier and trial infrastructure cost scales with signups rather than with revenue, so a top-of-funnel win without an activation fix makes unit economics worse, not better.',
    ],
    optimization_opportunities: [
      {
        title: 'Ship a pre-populated sample workspace at signup',
        impact: 'high',
        effort: 'medium',
        rationale:
          'Activation is where this funnel loses most of its value, and the cause is an empty state that asks for work before showing a result. Sample data lets the user see the product working in the first minute and reframes the integration as an upgrade rather than a prerequisite.',
        estimated_impact:
          'Sample-data onboarding typically moves signup-to-activation by 15-25% relative, which is the single largest available gain in this funnel.',
      },
      {
        title: 'Add behavior-triggered activation emails for stalled signups',
        impact: 'high',
        effort: 'low',
        rationale:
          'A user who signs up and never connects a source currently hears nothing until the trial expires. Two triggered messages — one at 24 hours naming the exact step they stopped at, one at day four with a two-minute setup video — cost a week of work.',
        estimated_impact: 'Recovers 5-10% of stalled signups into activation, at effectively zero marginal cost.',
      },
      {
        title: 'Route high-signal trials to a human',
        impact: 'high',
        effort: 'medium',
        rationale:
          'Team size, invite velocity and integration count are all visible before the trial ends, and the accounts scoring highest on them are worth several times the self-serve price. A single person working that queue changes the revenue mix without changing the product.',
        estimated_impact: 'Typically lifts blended ACV by 30-60% within two quarters while leaving the self-serve motion intact.',
      },
      {
        title: 'Replace the logo strip with three quantified customer outcomes',
        impact: 'medium',
        effort: 'low',
        rationale: `Logos prove existence, not results. Three specific outcomes with a number, a role and a company size attached answer the objection that ${target.name}'s current proof leaves standing.`,
        estimated_impact: 'Landing-page conversion in B2B typically moves 8-15% relative when generic proof is replaced with quantified proof.',
      },
      {
        title: 'End comparison pages with a competitor-shaped offer',
        impact: 'medium',
        effort: 'low',
        rationale:
          'Someone reading an alternative-to page has already named their incumbent. A migration path, an import tool, or a switch offer converts that context; a generic "Start free trial" throws it away.',
        estimated_impact: 'Comparison-page signup rate normally rises 20-35% relative when the CTA matches the page intent.',
      },
    ],
  }
}

function appRevenue(target: TargetInput): RevenueIntelligence {
  const apple = target.kind === 'app_store'

  return {
    model: 'freemium',
    model_rationale: `Free to install with a complete-enough free tier and a hard paywall on budgets, bill alerts and shared household budgets, converting into a store-billed subscription at roughly $7-9 monthly or $50-60 annually — the standard band for a consumer finance app of this size. The plan structure is visible in the listing copy; the exact price points are the category benchmark rather than an observed figure, and the mix between monthly and annual is inferred from the annual-first paywall layout.`,
    revenue_drivers: [
      'Annual subscriptions almost certainly carry the majority of revenue — the paywall leads with annual and states the saving, which is the layout that pushes 60-70% of a finance app mix to the annual plan.',
      'The 7-day trial on annual is the actual conversion mechanic; monthly exists mostly as a price anchor that makes annual look correct.',
      `Shared household budgets are the strongest retention driver in the product and therefore an indirect revenue driver — a second person on the account roughly doubles the switching cost.`,
      'Recurring-charge detection creates a visible, quantified saving, which is the argument that justifies the subscription price at renewal time.',
      'Renewal revenue compounds on a base that costs nothing to serve, so every point of retention is worth more than a point of new conversion at this stage.',
      apple
        ? 'Apple takes 30% in year one and 15% thereafter, so the annual-heavy mix improves net margin as the cohort ages — a real driver that is invisible in gross revenue.'
        : 'Google takes 30% in year one and 15% thereafter, so the annual-heavy mix improves net margin as the cohort ages — a real driver that is invisible in gross revenue.',
    ],
    monetization_strategy: `A single premium tier sold against a free tier that is generous by design. The paywall sits after first value, which is the right placement, and it is presented as annual-first with monthly beside it and a 7-day trial attached to the annual plan. There is no family or household plan even though shared budgets are the differentiating feature, no lifetime option, and no evidence of promotional pricing beyond the standard store seasonal moments. Billing is entirely store-managed, which keeps the flow smooth and hands the platform 30% of gross in year one — 15% on the subscriptions that survive into year two — while removing most of the pricing and win-back levers a web-billed product would have.`,
    upsell_opportunities: [
      'A family or household plan at roughly 1.6x the individual price — shared budgets already exist as a feature, and pricing them as a plan is a packaging change rather than a build.',
      'A higher tier carrying investment and net-worth tracking, which is the natural next question for a user who has their spending under control.',
      'Credit-score monitoring or a debt-payoff planner as a second tier, both of which have obvious affiliate economics on top of the subscription.',
      'An in-trial upgrade to annual at a discount, offered on day 5 when the habit has visibly formed — the highest-intent moment in the whole lifecycle.',
      'Data export and multi-year history as a power-user add-on, monetizing the segment that already treats the app as a system of record.',
    ],
    retention_opportunities: [
      'A monthly financial recap notification tying the subscription price to a number the user recognizes — "you tracked $2,340 and caught two subscriptions worth $31" — which is the renewal argument delivered before the renewal.',
      'Win-back on lapsed connections: users churn silently when a bank link breaks, and a same-week reconnection prompt would save subscribers who never consciously decided to leave.',
      'A weekly streak or check-in habit loop; budgeting retention is habit retention, and there is currently no mechanic that brings a user back on a schedule.',
      'Household invites during onboarding rather than after — a second connected person is the strongest churn predictor available in this product.',
      'An annual renewal reminder with a summary of the year, which is unusual in this category and materially reduces the surprise-charge refund rate.',
    ],
    monetization_score: 57,
    score_rationale: `57 — a working model with more than one structural leak, which is what separates it from the 70s. The paywall is correctly placed after first value and the annual-first presentation is right, which keeps this out of the 40s. What holds it down: there is exactly one paid tier, so there is no expansion path at all — a user who loves ${target.name} in month one pays the same in month thirty, and the shared-budget feature that could support a household plan is given away inside the single tier. The free tier compounds the problem by offering uncapped categorization, which removes the upgrade trigger for the largest segment. Add store-managed billing taking roughly 30% of gross with no web-billing alternative, and no visible trial or win-back sequence, and this is a model that captures the enthusiastic minority and monetizes almost nothing else.`,
  }
}

function webRevenue(target: TargetInput): RevenueIntelligence {
  return {
    model: 'subscription',
    model_rationale: `Seat-based SaaS subscription with a public price grid and a no-card trial. Pricing is almost certainly per-user per-month with an annual discount in the 15-20% band — that is the near-universal structure for a self-serve B2B tool with a team-collaboration surface, and the presence of a free tier alongside named paid plans points to subscription rather than true freemium: the free tier reads as a trial extension, not as a product with its own population. Exact price points are inferred from category convention rather than read off an observed grid.`,
    revenue_drivers: [
      'Seat expansion inside existing accounts — for a collaboration-shaped product, net revenue retention comes from teams growing rather than from new logos, and this is likely the largest single driver.',
      'Annual prepay, which both discounts churn and pulls cash forward; the annual toggle on the pricing page is doing more work here than the discount percentage suggests.',
      'The mid tier almost certainly carries the revenue mix — the entry plan exists to be outgrown and the top tier exists to make the mid tier look reasonable.',
      'Integration depth as a lock-in driver: every connected data source raises the switching cost, which shows up as retention rather than as a line item.',
      'Comparison and alternative-to content converting incumbent-shopping buyers at near-zero marginal acquisition cost, which is what keeps gross margin defensible.',
      'Usage limits on the free tier acting as the upgrade trigger, though the trigger fires late relative to when the value is actually delivered.',
    ],
    monetization_strategy: `Classic self-serve subscription architecture: a free tier, two or three paid tiers with feature and seat gates, a monthly-versus-annual toggle, and a no-card trial on the paid plans. Pricing is public, which supports the search-led motion by letting buyers qualify themselves before signup. The value metric is seats rather than usage, which is simple to understand and disconnected from how much value the customer actually extracts — a team of ten heavy users pays the same as ten light ones. There is no enterprise motion visible beyond a contact link, no usage-based component, and no evidence of a partner or reseller channel adding revenue outside the direct funnel.`,
    upsell_opportunities: [
      'A usage or volume component alongside seats, so accounts extracting more value pay more without needing to add headcount — the fastest route to net revenue retention above 110%.',
      'An enterprise tier carrying SSO, SCIM, audit logs, a DPA and a security review packet; those five items are what unlock five-figure ACVs and none of them are product-defining work.',
      'Priority support and an onboarding or migration package sold as a one-time add-on at the moment of switching, which is when buyers are least price-sensitive.',
      'Departmental land-and-expand: a second team inside an existing account is the cheapest sale available and currently depends on word of mouth rather than on any in-product prompt.',
      'Premium integrations or an API tier for the accounts already hitting rate limits, priced separately from seats.',
    ],
    retention_opportunities: [
      'Annual-plan migration campaigns targeted at monthly accounts past month four; monthly plans in this category churn at roughly twice the annual rate, and the migration offer is a conversation, not a build.',
      'A usage-decline alert routed to a human — a workspace whose weekly active seats have halved is a churn event that has already happened and is still recoverable for another six weeks.',
      'Multi-player activation: accounts with three or more active seats retain far better than single-seat accounts, so an in-product invite prompt during the first week is retention work disguised as onboarding.',
      'Dunning and card-recovery on involuntary churn, which typically accounts for 20-40% of gross SaaS churn and is pure recovered revenue.',
      'A quarterly value report showing what the workspace produced, sent to the billing owner ahead of renewal rather than after it.',
    ],
    monetization_score: 69,
    score_rationale: `69 — a well-built standard model that still leaves money on the table. The fundamentals are right: public pricing that supports self-serve, an annual option with a real discount, tiers with a legible reason to move up, and seat expansion that grows revenue as accounts grow. That combination earns the top of the band. It does not clear 70 because the leaks are structural rather than singular: seats are only loosely coupled to value, so heavy and light users pay identically and ${target.name} captures none of the upside from its most engaged accounts; there is no enterprise tier at all, which caps ACV below the point where the largest accounts in this category actually buy; and there is no visible dunning or win-back machinery on involuntary churn. Those three gaps are what a competitor should expect to out-monetize them on.`,
  }
}

function appSwot(target: TargetInput): Swot {
  return {
    strengths: [
      'Store creative craft is genuinely high — consistent type, real data in every mock, correct device frames — which buys credibility in a category where trust is the purchase decision.',
      'A differentiated feature with an obvious marketing hook: automatic recurring-charge detection produces a surprising, personal, quantified result that is ideal ad material.',
      'A paid install engine that is running competently across Google App campaigns and Meta, with enough asset variety to feed both algorithms.',
      'Store search already delivers roughly a third of installs, which means real category-term presence rather than pure brand traffic.',
      'The paywall sits after first value, so the commercial ask lands in the right place in the experience — a marketing decision more teams get wrong than right.',
    ],
    weaknesses: [
      'No owned demand of any kind: no ranking content footprint, no email list, no community, so every month of growth is bought again from scratch.',
      'Creative sells the interface rather than the anxiety that drives installs, which caps CTR and hands the cheaper impressions to any competitor willing to lead with the pain.',
      `The head keyword sits past the 30-character truncation point in the store title, so ${target.name} spends brand characters on queries that already resolve to them.`,
      'Shared household budgets — the most defensible feature — is invisible in the ad creative and unpriced in the plan structure, which wastes it twice.',
      'No lifecycle marketing: no in-trial sequence, no reconnection prompt, no win-back, so retention is left entirely to the product.',
      'Roughly 80% of paid spend concentrates on two platforms, so a CPI move on either one is a plan-level event rather than a channel-level one.',
    ],
    opportunities: [
      'The "how to budget" and "best budgeting app" content clusters are effectively uncontested by app-first competitors and would compound into durable non-paid installs.',
      'Short-form finance content is one of the few organic surfaces that still moves installs at scale, and the category audience is already there in volume.',
      'Household and couples budgeting is an underserved segment with a higher willingness to pay and a natural two-sided invite built into the use case.',
      'Credit unions, payroll providers and personal-finance newsletters all reach this exact audience through embedded distribution with no CPI attached.',
      'Open banking expansion in secondary markets opens categories of connectable accounts that were previously manual-entry only, which turns a product constraint into a launch story.',
    ],
    threats: [
      'Every major bank now ships an in-app spending breakdown for free, which erodes the basic value proposition for the least engaged half of the market.',
      'Install costs in personal finance climb every Q4 as tax and new-year budget intent peaks, and a paid-dependent engine has no way to hedge that seasonality.',
      target.kind === 'app_store'
        ? 'ATT and SKAdNetwork signal loss keeps degrading install-campaign optimization, which raises effective CPI without any change in bid strategy.'
        : 'Play policy on sensitive financial permissions tightens periodically, and a single rejected update can freeze acquisition mid-quarter.',
      'A well-funded neobank bundling budgeting into a free account can subsidize acquisition indefinitely and price the standalone subscription out of the market.',
      'Aggregator pricing moves flow straight through to unit economics, and there is no leverage in the relationship at this scale.',
    ],
  }
}

function webSwot(target: TargetInput): Swot {
  return {
    strengths: [
      'A compounding content and comparison footprint that keeps producing qualified signups after spend stops — the most durable marketing asset in this category and the hardest for a challenger to copy quickly.',
      'Message-to-query match is tight: pages answer the search that brought the visitor, which is why the top of the funnel converts above the category norm.',
      'Public pricing and a no-card trial together remove the two objections that most often stall a self-serve B2B evaluation.',
      'Integration marketplace listings rank independently for partner-integration queries and send pre-qualified traffic at zero media cost.',
      'Paid search is used the way it should be for a content-led business — defending and extending terms the organic footprint already owns, so the two channels reinforce rather than duplicate.',
    ],
    weaknesses: [
      'Proof is a logo strip. Nothing quantifies an outcome, which leaves the strongest objection in a B2B evaluation completely unanswered.',
      'No owned audience — no newsletter of consequence, no community, no event motion — so a ranking change has nothing to fall back on.',
      'Activation is the weakest step in the funnel and there is no marketing motion attached to it: no triggered emails, no onboarding content, no lifecycle sequence.',
      'The referral surface is happening to them rather than being run — integrations send traffic with no partner program, no co-marketing and no affiliate structure behind it.',
      'Review-directory presence is thin relative to the content investment, which cedes "best <category>" placement to competitors who simply asked their customers.',
      'No video program, which leaves both YouTube and the demo-watching half of the buying journey to whoever does invest there.',
    ],
    opportunities: [
      'The competitor-comparison keyword cluster is expanding as the category consolidates, and each new entrant creates a fresh alternative-to page worth ranking for.',
      'AI-assisted workflows are the message shift in this category right now, and the first credible position on it takes the category conversation for a year.',
      'Vertical landing pages and vertical review placements are unclaimed — the same product framed for three specific industries outranks the generic page for every one of those searches.',
      'A partner and agency channel is available and unbuilt: the integration surface already proves the demand exists without any commercial structure behind it.',
      'Bottom-of-funnel review directories reward a concentrated 90-day review push disproportionately, and a category-grid placement is worth more inbound than a quarter of content.',
    ],
    threats: [
      'AI search summaries answer exactly the informational and comparison queries this funnel depends on, and click-through on that query class is eroding structurally rather than cyclically.',
      'Google core updates can reset a content-led acquisition engine in a single week, and roughly two thirds of entry routes through Google in some form.',
      'A funded competitor bidding up brand and comparison terms could raise blended CAC by a third, and there is no owned channel available as a counterweight.',
      'Platform consolidation: the incumbent suite this category sits beside can bundle a good-enough version at zero marginal price to the buyer.',
      'Buying committees are lengthening procurement and security review, which favours vendors with an enterprise motion — exactly what is missing here.',
      'Rising content production costs across the category mean the SEO advantage narrows every quarter unless the investment keeps pace.',
    ],
  }
}

function appGrowth(target: TargetInput): GrowthRecommendations {
  return {
    how_they_acquire_users: `Paid installs with a store-search base underneath. Roughly a third of installs come from ${
      target.kind === 'app_store' ? 'App Store' : 'Google Play'
    } search on category head terms, and most of the rest is bought — Google App campaigns optimizing to a subscribe event, Meta Advantage+ App running UGC-style vertical video, and a smaller TikTok Spark Ads line amplifying creator posts. There is no meaningful web, content or community contribution, and no referral program despite a product feature that is a natural two-sided invite. In practice ${target.name} rents its growth monthly rather than accumulating it.`,
    why_users_convert: `Because the product produces a specific, personal, surprising number in the first two minutes — the forgotten subscriptions it finds. Installs are driven by an acute anxiety (an overdraft, a month that did not add up), and the users who get through the bank connection get relief fast enough that the paywall lands on someone who has already felt the benefit. Conversion is not price-driven; the annual plan clears at a price users would not accept before seeing their own data and accept readily after.`,
    what_makes_them_competitive: `Two things, and only two. Automatic recurring-charge detection is a genuinely differentiated capability that turns into an easy marketing story, and shared household budgets create a switching cost that no single-user competitor can match once a second person is on the account. Everything else — the dashboard, the categorization, the visual craft — is table stakes executed well. Their competitive position is a feature position, not a distribution or brand position.`,
    their_weaknesses: `They lose roughly half of every acquired install at the bank-connection screen because it is a trust problem they have never treated as one, and they have no owned demand to fall back on when install costs rise. Their creative sells interface instead of anxiety, their store title spends its visible characters on the brand, their strongest feature is absent from both the ad creative and the pricing, and there is no lifecycle marketing anywhere — no trial sequence, no reconnection prompt, no win-back. Their single paid tier means an enthusiastic customer and a marginal one are worth exactly the same.`,
    how_to_outperform: `Win the trust step and own the demand they rent. Your onboarding should show a real insight before asking for a bank connection, and your connect screen should carry the read-only assurance, encryption statement and institution logos that ${target.name}'s does not — that single sequence difference is worth more than any creative advantage, because it roughly doubles the number of users who ever reach a paywall. In parallel, build the content and community footprint they have ignored: the "how to budget" and "best budgeting app" clusters are uncontested by app-first competitors and compound into installs that cost nothing next quarter. Price for households from day one, since that is where the willingness to pay and the retention both live, and run the two-sided invite as a real referral program rather than leaving it to chance. Do not try to beat them on install volume in Q4 — that is the one fight where their existing spend and creative library give them the advantage.`,
    strategies_to_copy: [
      'Place the paywall after first value, not in onboarding. They get this right and most competitors do not, and it is the difference between an upgrade ask that lands on a believer and one that lands on a stranger.',
      'Lead the paywall with annual and state the saving as a percentage next to monthly — the layout, not the discount, is what pushes the mix toward annual.',
      'Build the surprise into activation: find the forgotten subscription and show it as a number in the first session. It is the strongest activation event in this category and it doubles as ad creative.',
      'Feed the install algorithms asset variety. Their multiple screenshot sets and caption treatments are what make App campaigns and Advantage+ work, and it is the cheapest lever in paid app marketing.',
      'Keep a genuinely useful free tier for the top of the funnel — just cap it somewhere that creates an upgrade moment, which is the one adjustment they failed to make.',
      'Maintain the creative craft standard. In consumer finance, visual polish reads as institutional credibility, and cheap-looking creative loses before the copy is read.',
    ],
    strategies_to_avoid: [
      'Do not fight them on Q4 install volume. They have the creative library and the incumbent spend, and January budget-intent CPIs are the worst possible time to learn a channel.',
      'Do not copy the uncapped free tier. It works as a moat for an incumbent with scale; for a challenger it is a promise to serve users who will never pay.',
      'Do not lead creative with interface. It is what they do and it is why their CTR sits at the bottom of the band — the anxiety is the hook, the dashboard is the payoff.',
      'Do not build a single premium tier. Their one-tier structure means their best customers are capped at the same price as their worst; design the expansion path before launch, not after.',
      'Do not rely on store-managed billing alone. It costs 30% of first-year revenue and removes the pricing, trial and win-back levers you will need to out-monetize them.',
      'Do not bid on their brand term as a primary strategy. Defensive bidding is cheap for them and expensive for you, and it buys traffic that has already chosen.',
    ],
    growth_opportunity_score: 74,
    score_rationale: `74 — a large, growing category with a competitor whose gaps are concrete and mostly self-inflicted, but with a real budget advantage defending the channel they lead on. The openings are specific: half of every install lost at a fixable trust screen, an uncontested content cluster, an unpriced household segment, and no lifecycle marketing at all. None of those are moats — they are things ${target.name} has simply not done. What keeps this below 85 is that their store-search position and their paid creative library are genuinely defended assets, so a challenger needs either a funded install budget or twelve months of content patience to reach the same top of funnel. The product-side wedge is wide open; the distribution-side wedge costs money.`,
    action_plan: [
      {
        step: `Build your bank-connection step as a trust screen from day one — read-only assurance, encryption stated plainly, institution logos, and one real insight shown before the ask. This is the funnel step ${target.name} loses half its installs at.`,
        owner: 'Founder with Product',
        timeline: 'Weeks 1-3',
        estimated_impact:
          'Roughly a 10-20% relative lift in install-to-activation versus their sequencing, which multiplies through every downstream step.',
        priority: 1,
      },
      {
        step: 'Rebuild ad creative around the anxiety rather than the interface: the overdraft, the forgotten subscription, the month that did not add up, with the product as the relief in the last two seconds.',
        owner: 'Performance marketer',
        timeline: 'Weeks 2-5',
        estimated_impact:
          'CTR moving from the 1-2% band toward 2-3% on the same inventory, which translates to a 20-35% CPI reduction before any bidding change.',
        priority: 2,
      },
      {
        step: 'Price households from launch: an individual plan and a household plan at roughly 1.6x, with the shared-budget invite in onboarding rather than buried in settings.',
        owner: 'Growth lead',
        timeline: 'Weeks 3-6',
        estimated_impact:
          'Blended ARPU up 15-25% and a materially lower churn rate on multi-person accounts, which are the two numbers that decide whether you can outbid them.',
        priority: 3,
      },
      {
        step: 'Start the content engine on the clusters they have ignored — "how to budget", "best budgeting app", "budgeting for couples" — at two publish-quality pieces a week with a store link on every one.',
        owner: 'Content lead',
        timeline: 'Weeks 4-16, ongoing',
        estimated_impact:
          'Meaningful organic install volume from month five onward, compounding to 10-20% of new installs within a year at zero marginal cost.',
        priority: 4,
      },
      {
        step: 'Ship the lifecycle layer they lack: a failed-connection recovery email within 24 hours, a three-touch in-trial sequence, and a monthly recap notification that quantifies what the user saved.',
        owner: 'Lifecycle and CRM',
        timeline: 'Weeks 5-8',
        estimated_impact:
          'Trial-to-paid from the 50-60% band into 65-75%, plus 3-6% of otherwise dead installs recovered into activation.',
        priority: 5,
      },
      {
        step: 'Turn the household invite into an incentivized two-sided referral program with a reward on both ends, instrumented with deferred deep links so the invite survives the store visit.',
        owner: 'Growth lead',
        timeline: 'Weeks 8-12',
        estimated_impact:
          'A referral channel contributing 8-15% of new installs at a CPI near zero — the channel they left entirely on the table.',
        priority: 6,
      },
      {
        step: 'Enter paid deliberately and narrowly: one platform, one optimization event (subscribe, not install), and a creative testing cadence of four new concepts a week before scaling budget.',
        owner: 'Performance marketer',
        timeline: 'Weeks 10-16',
        estimated_impact:
          'A defensible CAC baseline before Q4 CPI inflation, rather than learning the channel during the most expensive quarter of the year.',
        priority: 7,
      },
    ],
    priority_recommendations: [
      {
        title: 'Win the bank-connection step',
        impact: 'high',
        effort: 'low',
        rationale: `${target.name} loses 40-55% of installs at a screen that fails on trust, not usability. Fixing sequencing and proof is a week of design work and it roughly doubles the population that ever sees your paywall.`,
        estimated_impact: 'The largest single funnel gain available, and it compounds with every acquisition improvement downstream.',
      },
      {
        title: 'Own the content demand they rent',
        impact: 'high',
        effort: 'high',
        rationale:
          'Their entire growth engine is bought monthly. A ranking content footprint in an uncontested cluster is the one asset that lets a smaller company outlast a larger one on the same budget.',
        estimated_impact: 'Compounds to 10-20% of new installs within twelve months, and permanently lowers blended CAC.',
      },
      {
        title: 'Sell the household, not the individual',
        impact: 'high',
        effort: 'medium',
        rationale:
          'Shared budgets are their most defensible feature and they neither price it nor advertise it. Taking the couples-and-families segment gives you higher ARPU and better retention in the same acquisition motion.',
        estimated_impact: 'Blended ARPU up 15-25% with lower churn on multi-person accounts — the combination that funds a competitive bid.',
      },
      {
        title: 'Ship the lifecycle layer before scaling spend',
        impact: 'medium',
        effort: 'low',
        rationale:
          'Recovery, trial and recap sequences are a few weeks of work with no product dependency, and they raise the value of every install you subsequently buy. Doing them after scaling spend wastes the first cohorts.',
        estimated_impact: 'Trial-to-paid up 10-15 points and a measurable reduction in silent churn from broken connections.',
      },
      {
        title: 'Stay out of the Q4 install auction in year one',
        impact: 'medium',
        effort: 'low',
        rationale:
          'A deliberate non-action. Their creative library and incumbent spend make January the worst possible entry point; building the funnel and the content base first means entering paid with better unit economics than theirs.',
        estimated_impact: 'Avoids a 30-50% CPI premium and protects the runway that funds the compounding channels.',
      },
    ],
  }
}

function webGrowth(target: TargetInput): GrowthRecommendations {
  return {
    how_they_acquire_users: `Search, primarily. A comparison, alternative-to and problem-led content footprint carries the largest share of new signups, with paid search layered on top defending the same terms and brand queries. Integration marketplace listings and partner pages contribute a meaningful second stream of pre-qualified traffic, and social is founder- and LinkedIn-driven rather than paid. There is no outbound motion, no video program and no owned audience, so ${target.name}'s acquisition is durable but almost entirely intermediated by Google.`,
    why_users_convert: `Because the buyer arrives already shopping. The pages rank for queries that name the problem or the incumbent, pricing is public so buyers self-qualify before signup, and the no-card trial removes the last reason to postpone. Conversion is driven by intent and low friction rather than by persuasion — which also explains why the funnel stalls immediately after signup, where intent stops carrying the user and the product has to.`,
    what_makes_them_competitive: `The content moat. Hundreds of pages ranking for decision-stage queries is an asset that took years and keeps producing signups with no marginal spend, and it makes their paid search cheaper because the landing pages already exist and already convert. Beyond that, the integration surface creates real switching cost per connected account. Their advantage is distribution and lock-in, not product differentiation — the product itself is comparable to three other tools in the category.`,
    their_weaknesses: `They convert well and activate badly. Only 30-45% of signups ever connect a data source, because the empty state is documentation instead of a working example, and there is no lifecycle motion to rescue the ones who stall. Their proof is a logo strip with no quantified outcome, their referral traffic runs without a partner program behind it, their review-directory presence is thin relative to the content spend, and they have no enterprise tier — so their largest possible accounts either buy at self-serve prices or do not buy at all.`,
    how_to_outperform: `Beat them on activation and on the buying motion above their price ceiling, not on content volume — you will not out-publish a multi-year footprint this year. Ship a pre-populated sample workspace so a new user sees the product working before doing any setup, and attach triggered emails to the exact step where they stall; that combination alone puts your signup-to-paid roughly 15-25% ahead of theirs on identical traffic. Then take the accounts they cannot serve: build SSO, SCIM, audit logs and a security packet, put a person on trials showing team-level buying signals, and sell into the deals their self-serve-only motion leaves on the table. For demand, go where their footprint is thin rather than where it is strong — vertical pages, review directories, a partner program on the integration surface they already earn traffic from, and a video program for the demo-watching half of the journey. Answer the objection their logo strip leaves standing with three quantified customer outcomes, and lead with them everywhere.`,
    strategies_to_copy: [
      'Build comparison and alternative-to pages for every competitor including them. Decision-stage queries convert several times better than awareness content and the pages take days, not quarters.',
      'Publish pricing. It removes an objection, filters out bad-fit traffic before it costs you support time, and is a prerequisite for a self-serve motion that scales without headcount.',
      'Match each landing page to the query that brought the visitor rather than routing everything to a generic homepage — this is the specific reason the top of their funnel outperforms.',
      'Use paid search to defend and extend terms your content already ranks for. The landing pages exist, the intent is proven, and it is the cheapest incremental channel available to a content-led business.',
      'Claim every integration marketplace listing you qualify for. They rank independently for partner-integration queries and send buyers who have already decided on the ecosystem.',
      'Keep the no-card trial. It is the right trade for a self-serve product and it keeps your activation numbers honest instead of flattered by card-gated intent.',
    ],
    strategies_to_avoid: [
      'Do not try to out-publish their content footprint head-on. A multi-year library with accumulated domain authority is not a fight a challenger wins with volume — go around it through verticals, review directories and partners.',
      'Do not copy their self-serve-only motion. It is the reason their ACV is capped, and a challenger with a sales-assist path can take the largest accounts in the category out from under them.',
      'Do not bid on their brand term as a growth strategy. Defensive bidding is cheap for the brand owner and expensive for the challenger, and the traffic has already made its choice.',
      'Do not ship the documentation-link empty state. It is the single largest leak in their funnel, and copying their onboarding pattern means inheriting the leak that makes them beatable.',
      'Do not treat integrations as a referral strategy without a program behind it. Their marketplace traffic is unmanaged and unattributed — take the same surface and actually run it.',
    ],
    growth_opportunity_score: 61,
    score_rationale: `61 — real openings, but the primary channel is genuinely defended. The exploitable gaps are concrete and unaddressed: an activation step that loses over half of all signups, no enterprise tier despite obvious demand above their price ceiling, unmanaged referral traffic, and thin review-directory presence. Those are worth taking and none require permission. What holds this out of the 70s is that ${target.name}'s content footprint is an actual moat — years of accumulated authority on decision-stage queries that a challenger cannot replicate inside a year at any budget — and the category is crowded with comparable products, so wins come from executing better on activation and on enterprise rather than from occupying an empty space.`,
    action_plan: [
      {
        step: 'Ship a pre-populated sample workspace as the default post-signup experience, with the integration reframed as an upgrade from sample data rather than a prerequisite for seeing anything.',
        owner: 'Product with Growth',
        timeline: 'Weeks 1-4',
        estimated_impact:
          'Signup-to-activation 15-25% relative above theirs on the same traffic, which is the largest single gain available in this funnel.',
        priority: 1,
      },
      {
        step: 'Replace generic proof with three quantified customer outcomes — a number, a role, a company size — and lead with them on the homepage, the pricing page and every comparison page.',
        owner: 'Product marketing',
        timeline: 'Weeks 1-3',
        estimated_impact: 'Landing-page conversion up 8-15% relative, and it answers the objection their logo strip leaves standing.',
        priority: 2,
      },
      {
        step: 'Build behavior-triggered lifecycle emails: a 24-hour message naming the exact step the user stopped at, a day-four setup video, and a value recap before trial expiry.',
        owner: 'Lifecycle and CRM',
        timeline: 'Weeks 2-5',
        estimated_impact: 'Recovers 5-10% of stalled signups into activation at effectively zero marginal cost.',
        priority: 3,
      },
      {
        step: `Stand up the enterprise tier ${target.name} does not have: SSO, SCIM, audit logs, a DPA and a security review packet, priced on a contact-sales path with a published starting point.`,
        owner: 'Founder with Product',
        timeline: 'Weeks 4-12',
        estimated_impact: 'Opens five-figure ACVs and lifts blended ACV 30-60% within two quarters without changing the self-serve motion.',
        priority: 4,
      },
      {
        step: 'Run a concentrated 90-day review push on G2 and Capterra targeting category-grid placement, with an in-product ask timed to a positive usage moment.',
        owner: 'Growth lead',
        timeline: 'Weeks 4-16',
        estimated_impact:
          'Category-grid placement within one review cycle and a 10-20% lift in bottom-of-funnel referral volume — the cheapest demand available.',
        priority: 5,
      },
      {
        step: 'Publish vertical landing pages and vertical proof for the three industries with the strongest existing usage, rather than competing on the generic category term.',
        owner: 'Content lead',
        timeline: 'Weeks 6-16',
        estimated_impact:
          'Ranking on lower-competition, higher-converting queries within a quarter, going around their authority rather than through it.',
        priority: 6,
      },
      {
        step: 'Launch a real partner and affiliate program on the integration surface: revenue share, co-marketing pages, and attribution so the channel can be managed rather than observed.',
        owner: 'Partnerships',
        timeline: 'Weeks 10-20',
        estimated_impact: 'A managed channel contributing 8-15% of new signups, taken directly from traffic they currently leave unattributed.',
        priority: 7,
      },
    ],
    priority_recommendations: [
      {
        title: 'Fix activation before spending anything on demand',
        impact: 'high',
        effort: 'medium',
        rationale: `Over half of ${target.name}'s signups never reach value, and any competitor copying their onboarding inherits the same leak. Sample data plus triggered emails is four to five weeks of work that raises the value of every signup you subsequently acquire.`,
        estimated_impact: 'Signup-to-paid 15-25% ahead of theirs on identical traffic — the compounding multiplier on all other work.',
      },
      {
        title: 'Take the accounts above their price ceiling',
        impact: 'high',
        effort: 'high',
        rationale:
          'Self-serve-only pricing with no enterprise tier means the largest buyers in the category are either underserved or unserved. SSO, SCIM, audit logs and a security packet are the entry fee, and a single person working high-signal trials is the whole go-to-market.',
        estimated_impact: 'Blended ACV up 30-60% within two quarters, in a segment they are structurally not competing for.',
      },
      {
        title: 'Go around the content moat, not through it',
        impact: 'high',
        effort: 'medium',
        rationale:
          'Their domain authority on decision-stage queries is not beatable this year. Vertical pages, review directories and partner listings reach the same buyers on queries where accumulated authority matters far less.',
        estimated_impact: 'Meaningful qualified signup volume within a quarter, versus twelve-plus months for a head-on content fight.',
      },
      {
        title: 'Lead with quantified proof everywhere',
        impact: 'medium',
        effort: 'low',
        rationale:
          'Three customer outcomes with real numbers is a week of work and it differentiates against every competitor in the category, all of whom are still shipping logo strips.',
        estimated_impact: 'An 8-15% relative lift in landing-page conversion, applied across the whole site rather than to one page.',
      },
    ],
  }
}

export function businessFixture(target: TargetInput): BusinessGroup {
  const app = isStoreListing(target.kind)

  return {
    funnel: app ? appFunnel(target) : webFunnel(target),
    revenue: app ? appRevenue(target) : webRevenue(target),
    swot: app ? appSwot(target) : webSwot(target),
    growth: app ? appGrowth(target) : webGrowth(target),
  }
}
