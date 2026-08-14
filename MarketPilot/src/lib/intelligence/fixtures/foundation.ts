import type { ExecutiveSummary, FoundationGroup, Persona, Positioning, TargetInput } from '../types'

const isStoreListing = (kind: TargetInput['kind']) => kind === 'play_store' || kind === 'app_store'

function appSummary(target: TargetInput): ExecutiveSummary {
  const apple = target.kind === 'app_store'
  const store = apple ? 'the App Store' : 'Google Play'

  return {
    headline: `${target.name} is a well-built consumer budgeting app with a bought audience and a trust problem it has never named. The product converts the people who finish onboarding at a rate most of the category would envy — and roughly half of every install never gets that far, because the bank-connection screen asks for the most sensitive permission in consumer software before it has shown the user anything at all.`,
    business_overview: {
      product_category: `Consumer personal finance — automated budgeting and expense tracking built on bank-account aggregation, with recurring-charge detection and shared household budgets as the differentiating layer. A mature category: two funded incumbents hold the head terms on ${store}, a long tail of near-identical trackers fights over the mid-tail, and the floor is rising because every major bank now ships a free spending breakdown inside its own app.`,
      core_value_proposition: `Connect your accounts once and ${target.name} tells you where the money actually went — including the recurring charges you forgot you were paying. The promise is relief from not knowing, delivered inside two minutes, rather than a budgeting system the user has to maintain. That distinction matters commercially: it is why the paywall converts on a feeling the product has already produced instead of on a feature list.`,
      revenue_model: `Freemium with a store-billed subscription. A generous free tier carries uncapped transaction categorization; budgets, bill alerts and shared household budgets sit behind a single premium tier at roughly $7-9 monthly or $50-60 annually, with a 7-day trial attached to the annual plan. ${
        apple ? 'Apple' : 'Google'
      } takes 30% of gross in year one and 15% on subscriptions that survive into year two. Plan structure is visible in the listing; the exact price points are the category benchmark rather than an observed figure.`,
      target_audience: `Mobile-first adults aged 25-44 who manage a household budget under real pressure — variable income, several cards, a partner or roommate sharing bills, and at least one financial surprise in the last quarter. Not the spreadsheet cohort: these are people who tried a spreadsheet, abandoned it, and want the tracking to happen without them.`,
      geographic_focus: `English-speaking open-banking markets, US first and heaviest, then the UK, Canada and Australia. The map is set by aggregator coverage rather than by demand — ${target.name} can only launch where its bank-connection provider has institution coverage deep enough that the average user finds their bank on the first search, which is the practical constraint on international expansion.`,
    },
    market_position: {
      tier: 'challenger',
      rationale: `A challenger, not a leader and not a niche player. ${target.name} holds genuine category-term presence on ${store} — roughly a third of installs arrive through store search rather than brand queries, which is not something a niche app achieves — and it runs a competent multi-platform paid engine with enough creative variety to feed both Google App campaigns and Meta. What keeps it out of the leader tier is that none of its position is owned: there is no ranking content footprint, no email list, no community, so the top of the funnel is re-purchased every month. Its two real assets, recurring-charge detection and shared household budgets, are feature advantages rather than distribution or brand advantages, and feature advantages in personal finance have a shelf life of about four quarters.`,
    },
    growth_potential: {
      level: 'high',
      rationale: `High, and specifically because the constraints are self-inflicted rather than structural. The category keeps expanding — open banking widens the connectable surface every year and financial anxiety is not a cyclical demand driver — while ${target.name} currently loses 40-55% of installs at a single screen that fails on trust rather than usability. Fixing the sequencing there roughly doubles the population that ever reaches a paywall, and it costs a week of design work. On top of that sit three untouched channels: an uncontested content cluster, a household segment with higher willingness to pay and no plan priced for it, and a two-sided invite already built into shared budgets but never turned into a referral program. The ceiling is real but distant; the binding constraint today is execution, not market size.`,
    },
  }
}

function webSummary(target: TargetInput): ExecutiveSummary {
  const single = target.kind === 'landing_page'
  const kindLabel = single ? 'single-page product site' : target.kind === 'saas_product' ? 'SaaS product' : 'web product'

  return {
    headline: `${target.name} has built the hard asset and neglected the cheap one. A multi-year content and comparison footprint delivers buyers who have already decided what they want, and then the funnel hands them an empty workspace and a documentation link — so a business that converts visitors better than its category activates them worse, and prices every account as though the largest one were the smallest.`,
    business_overview: {
      product_category: `B2B software sold self-serve through a ${kindLabel} — a collaboration-shaped tool with an integration surface, bought by a team lead rather than by a procurement committee. The category is crowded with three or four functionally comparable products, and it is bounded above by the incumbent suite that can bundle a good-enough version at zero marginal price to the buyer.`,
      core_value_proposition: `${target.name} promises that the work a team currently coordinates across three tools and a spreadsheet happens in one place, connected to the systems the data already lives in. The value is legible and the demo is short — which is exactly why the empty first-run state is so costly: the proposition depends on seeing the thing populated, and nothing in onboarding populates it.`,
      revenue_model: `Seat-based subscription with a public price grid, a free tier, two or three paid plans and a no-card trial, almost certainly per-user per-month with an annual discount in the 15-20% band. The value metric is seats rather than usage, which is simple to explain and disconnected from delivered value — ten heavy users and ten light ones pay identically. No enterprise tier beyond a contact link, and no usage component. Structure inferred from category convention rather than read off an observed grid.`,
      target_audience: `Operations, marketing and program leads at 20-500 person companies who own a process, have a budget in the low hundreds per month, and can buy without a procurement cycle. They arrive already shopping — they searched a competitor name or a problem statement — and they are evaluating two or three tools in the same week.`,
      geographic_focus: `English-language, North America first with meaningful UK, EU and ANZ share arriving through organic search rather than through any deliberate international motion. There is no localization and no regional pricing, so the geography is a byproduct of where the content ranks.`,
    },
    market_position: {
      tier: 'niche_player',
      rationale: `A niche player that reads bigger than it is because its search footprint is disproportionate to its revenue. ${target.name} owns the decision-stage queries in its category — comparison, alternative-to and problem-led terms — which is a genuine moat and the reason it is worth analysing at all. But it competes in one lane only: self-serve teams buying at published prices. It has no enterprise motion, no sales-assist path, no outbound, and no owned audience, so it cannot follow its own customers upmarket when they grow, and it cannot defend the segment if the incumbent suite decides to bundle. Leading a well-defined slice of a category is a real position; it is not a challenger position, because there is no route from here to the top of the market with the current go-to-market.`,
    },
    growth_potential: {
      level: 'medium',
      rationale: `Medium. The upside is concrete and mostly unclaimed — over half of all signups never activate, there is no enterprise tier despite obvious demand above the price ceiling, and the integration surface sends referral traffic with no program attached — and each of those is a quarter of work rather than a strategic bet. What caps this at medium rather than high is that the growth would come from converting demand they already have, not from opening new demand. The primary channel is intermediated by Google and structurally exposed: AI search summaries answer exactly the informational and comparison queries this funnel depends on, and that erosion is not cyclical. Fixing activation and adding an enterprise tier could plausibly double revenue on flat traffic; growing traffic itself is the harder problem and nothing in the current motion addresses it.`,
    },
  }
}

function appPersona(target: TargetInput): Persona {
  const apple = target.kind === 'app_store'

  return {
    summary: `The person who installs ${target.name} is not researching budgeting apps. They are reacting to something: an overdraft fee, a card declined at a checkout, a month where the money went and they cannot account for it. The install happens late — evening and weekend traffic dominates this category — on a phone, usually within an hour of the triggering event, and it is one of two or three apps they will try that week. They have failed at this before. They built a spreadsheet in January and stopped updating it in March, they tried a competitor and abandoned it at the bank-connection screen, and they carry a low-grade shame about money admin that shapes how they read every screen. They are not looking for control, discipline or optimization, whatever the category copy says. They are looking for someone to tell them it is not as bad as they think, and to make the tracking happen without their participation. That is the entire product-market fit statement, and it is also why the bank-connection prompt is such a dangerous moment: it asks a person in a fragile state to hand over the most sensitive permission in consumer software before anything has been given back.`,
    demographics: {
      age_range: `25-44, with the real mass between 28 and 38 — old enough to carry multiple accounts, a card balance and a shared household bill, young enough to install a financial app on impulse rather than call a bank. Under-25 installs skew heavily toward the free tier and rarely convert; over-45 users convert well but arrive in much lower volume from ${apple ? 'App Store' : 'Play'} search.`,
      gender_distribution: `Roughly 60/40 female-skewing, consistent with the category — household financial administration falls disproportionately to women in mixed-gender households, and the shared-budget feature is most often initiated by the woman on the account. The skew is more pronounced on the shared-household use case than on solo tracking, which is a targeting fact ${target.name} does not appear to be using in creative.`,
      location: `Concentrated in US metro and inner-suburban areas with high fixed costs — rent, childcare, commuting — where the gap between income and disposable income is widest and therefore most anxiety-producing. Secondary volume from the UK, Canada and Australia. Rural and low-cost-of-living users install at a lower rate and churn faster, because tracking matters less when the budget is not tight against the income.`,
      income_level: `$45,000-$95,000 household income: the band where money is neither abundant enough to ignore nor scarce enough that tracking changes nothing. Below roughly $35,000 the subscription itself becomes the objection and the free tier is the whole relationship. Above roughly $120,000 the pain fades and retention drops — high earners install, look once, and stop opening the app, which is why targeting up-market in this category buys expensive installs that never renew.`,
    },
    user_intent: {
      why_they_convert: [
        `Because the product found something. The single strongest conversion event is ${target.name} surfacing a recurring charge the user had forgotten — a $14 streaming tier, a lapsed gym, a trial that renewed — and putting a number on it. A paywall that follows a discovered $31 a month is a different offer from a paywall that follows a dashboard tour.`,
        'Because the tracking is automatic. Every previous attempt failed on maintenance, so the thing being bought is the absence of work, not the presence of features.',
        'Because a second person joined the account. Shared household budgets convert the payer at a much higher rate once a partner is on it — the subscription is no longer a personal indulgence, it is household infrastructure.',
        'Because the annual price reframes as trivial against the number the product just showed them. $59 a year is expensive in the abstract and obviously correct next to $372 of forgotten subscriptions.',
        'Because the trial ends and nothing has broken. Conversion at the end of a store trial is largely a test of whether the habit formed, and the users who opened the app three times in week one convert at multiples of those who opened it once.',
      ],
      pain_points: [
        'Not knowing where the money goes — stated by users as a knowledge problem, felt as a control problem, and experienced as a low-level dread every time they check a balance.',
        'Manual tracking that always collapses. Spreadsheets, envelope apps and paper all fail at the same place: the user stops entering transactions in week three and the record becomes worse than useless.',
        'Subscription creep. Recurring charges accumulate invisibly across app stores, streaming services and annual renewals, and no bank statement presents them as a coherent list.',
        'Bank connection anxiety, which is the pain point most competitor copy ignores. Handing account credentials to an app is a genuine fear, not an objection to be overcome, and it is sharpened by every fintech breach that makes the news.',
        'Shared-money friction. Two people, separate accounts and joint bills produce the most persistent version of this problem, and almost nothing in the category is designed for two users on one budget.',
        'The gap between advice and action — they know they should budget, they have read the articles, and none of it survives contact with an actual month.',
      ],
      motivations: [
        'Relief, first and above everything. The emotional job is to convert an unbounded worry into a bounded number, even if the number is bad.',
        'Feeling competent with money rather than being lectured about it. The category is full of scolding copy, and it converts worse than it should.',
        'Saving toward something nameable — a deposit, a trip, a buffer — which is why savings-goal framing outperforms generic budgeting framing in both ad creative and paywall copy.',
        'Avoiding a repeat of the specific event that triggered the install. Retention rises sharply when onboarding names that event back to the user.',
        `Getting a partner to see the same picture. For the shared-budget segment, the motivation is as much about ending an argument as about tracking, and ${target.name} sells none of this.`,
      ],
      desired_outcomes: [
        'A single screen that answers "am I okay this month" in under five seconds, without interpretation.',
        'Subscriptions and recurring charges listed, dated and cancellable-adjacent — the outcome users describe as "finding money".',
        'A bill that never surprises them again, which is the emotional definition of the alerts feature and a far better selling line than "bill reminders".',
        'A savings number that moves in the right direction without them thinking about it every week.',
        'A shared, agreed view of household money that both people trust, replacing the running negotiation about who spent what.',
        'To stop opening the banking app to check a balance out of anxiety — the behavioural signal that the product has actually worked.',
      ],
    },
    emotional_drivers: [
      {
        driver: 'fear',
        strength: 'primary',
        evidence: `The install trigger is almost always an aversive financial event, and category search volume for "budget app" spikes in January and after major spending holidays — the pattern of remorse, not planning. Every element of the funnel that works in ${target.name} works because it reduces dread quickly, and the creative that leads with interface instead of anxiety is the clearest sign the team has not recognized which driver is carrying the category.`,
      },
      {
        driver: 'security',
        strength: 'secondary',
        evidence: `Secondary in the install decision and decisive in the funnel. The product is bought to build a financial safety buffer, and the funnel is lost at the bank-connection screen where the user weighs the safety of their own credentials. That screen currently carries no read-only assurance, no encryption statement and no institution logos, which means the largest drop in the funnel is a security decision the listing never argues.`,
      },
      {
        driver: 'convenience',
        strength: 'secondary',
        evidence: `Every user in this segment has already failed at manual tracking, so "automatic" is the operative word in the value proposition rather than "accurate" or "powerful". Time to first value of 60-90 seconds after connection is genuinely strong, and it is the reason the users who get through onboarding stay.`,
      },
      {
        driver: 'status',
        strength: 'minor',
        evidence: `Weak but non-zero. Personal finance carries a visible-competence element — the shared-budget user wants to be seen as the person who has it handled, and short-form finance content on social is partly aspirational performance. It supports referral and community mechanics; it should never lead the ad creative or the ${apple ? 'App Store subtitle' : 'Play short description'}.`,
      },
    ],
  }
}

function webPersona(target: TargetInput): Persona {
  const single = target.kind === 'landing_page'

  return {
    summary: `The buyer for ${target.name} is a mid-level owner of a process that has outgrown its tooling. They are an operations lead, a marketing manager or a program manager at a company between 20 and 500 people, and they arrived through a search that named either a competitor or the problem — which means they are not being educated, they are being compared. They have a budget in the low hundreds per month that they can spend without a purchase order, and a boss who will ask why this instead of the thing they already pay for. They will evaluate two or three tools in the same week, mostly after hours, and the deciding factor is rarely the feature grid: it is which product they got working before they ran out of patience. That is where ${target.name} loses them. They sign up, land in an empty workspace, hit an integration step that needs someone from another team, and the tab stays open for four days before it closes. They are not price-sensitive in any meaningful sense — the difference between $29 and $49 a seat is noise against the cost of the process being broken. They are risk-sensitive: about being the person who championed a tool that got abandoned, about security review, and about signing up for work they will have to do themselves.`,
    demographics: {
      age_range: `28-45, weighted to the low-to-mid thirties. Old enough to own a process and a budget, junior enough that the tool is theirs to choose rather than to sign off. Buyers over 45 in this category are usually approving rather than evaluating, and they enter the funnel late${single ? ' — which the single-page structure handles badly, since it has nowhere to send a second, more senior visitor' : ' through an internal share rather than through search'}.`,
      gender_distribution: `Close to balanced, with a modest female skew in the operations and marketing functions that make up the core segment and a male skew in the technically-led accounts that arrive through the integration and API surface. Not a meaningful targeting variable here — role and company size predict conversion; gender does not.`,
      location: `North America first — roughly two thirds of signups — with the UK, Western Europe and ANZ arriving as a byproduct of English-language search rankings rather than any deliberate international motion. There is no localization and no regional pricing, so non-US buyers self-select into the same funnel and convert slightly worse on it.`,
      income_level: `Not the useful variable for a B2B target. The equivalent is budget authority and company size: 20-500 employees, a departmental software budget in the $500-$5,000 per month range, and personal discretion up to roughly $500 per month without escalation. Above that threshold the buyer needs security review, SSO and an invoice — which is exactly the point at which ${target.name} has nothing to sell them.`,
    },
    user_intent: {
      why_they_convert: [
        'Because the page answered the exact query. Message-to-query match is the strongest thing in this funnel — a visitor who searched an alternative-to term lands on a page about that competitor, and the argument is already framed the way they were thinking about it.',
        'Because pricing is public. Self-qualification before signup removes the single most common stall in a self-serve B2B evaluation, and it filters out the buyers who would have consumed support time and never bought.',
        'Because the trial takes no card. It converts the decision from a purchase into a look, which is the correct trade at this ACV.',
        'Because they got one real result during the trial. Activation is causal here, not correlated: the accounts that connect a data source in the first session convert at multiples of those that do not, and nothing else in the trial predicts revenue as well.',
        'Because a second and third teammate joined the workspace. Multi-seat trials convert far better than single-seat ones, since a tool that other people are already using is no longer a personal bet.',
      ],
      pain_points: [
        'A process currently held together by a spreadsheet, a shared inbox and a recurring meeting, where the coordination cost has quietly become larger than the work.',
        'Data that lives in three systems and has to be reconciled by hand before anyone can answer a simple question about it.',
        'No single source of truth, so every status update is a negotiation about whose version is current.',
        `Evaluation fatigue: they are being asked to pick between products that describe themselves in nearly identical language, and ${target.name}'s logo strip does nothing to break the tie.`,
        'Setup effort they cannot personally complete — the integration needs an admin credential from a team that owes them nothing, and no vendor helps them navigate that.',
        'The internal risk of championing a tool that gets abandoned in six weeks, which is the real objection behind most stalled B2B trials and is almost never addressed in the funnel.',
      ],
      motivations: [
        'To stop doing the manual reconciliation personally — the motivation is usually recovering their own hours before it is anything about team efficiency.',
        'To look competent to their manager by showing a visible improvement in a process everyone knows is broken.',
        'To be able to answer a question in the meeting instead of promising to follow up after it.',
        'To make the tool decision once and not revisit it, which is why switching cost and integration depth are features to this buyer rather than bugs.',
        'To bring the rest of the team along without running a training programme — adoption is their problem after purchase, and they are quietly evaluating for it during the trial.',
      ],
      desired_outcomes: [
        'The process running in one place, visible to everyone who needs it, without a weekly meeting to reconcile it.',
        'A first useful result inside the first session — the outcome the current empty-state onboarding actively prevents.',
        'Their existing systems connected, so the tool reflects reality rather than becoming another thing to keep updated.',
        'A number they can show upward: hours saved, cycle time down, errors caught — the proof that justifies the renewal before anyone asks.',
        'Confidence that the vendor will still be a sensible choice at twice the team size, which is precisely what a missing enterprise tier fails to signal.',
        'A security and access story that survives contact with IT the first time someone senior asks about it.',
      ],
    },
    emotional_drivers: [
      {
        driver: 'productivity',
        strength: 'primary',
        evidence: `The entire acquisition footprint is built on problem-led and comparison queries about doing a process faster and with fewer hands, and the conversion pattern confirms it — accounts that see a real output early convert at multiples of those that do not. Every high-performing page on the site is arguing time and effort, not capability.`,
      },
      {
        driver: 'convenience',
        strength: 'secondary',
        evidence: `Distinct from productivity and nearly as decisive: the no-card trial, the minimal signup form and the public pricing all lower the cost of trying, and they are the reason the top of this funnel outperforms its category. The same driver explains the failure downstream — an empty workspace with a documentation link is an inconvenience the buyer is free to decline, and 55-70% of them do.`,
      },
      {
        driver: 'security',
        strength: 'secondary',
        evidence: `Present as career risk before it is present as data risk. This buyer fears championing a tool that gets abandoned, and once the account grows past a handful of seats the question becomes literal — SSO, audit logs, a DPA and a security packet, none of which ${target.name} currently offers. It is the driver that quietly decides every deal above the self-serve ceiling.`,
      },
      {
        driver: 'status',
        strength: 'minor',
        evidence: `Real but secondary: the buyer wants internal credit for fixing a visible problem, which is why quantified customer outcomes outperform feature copy with this segment. It argues for named, numbered proof on the landing pages and against the current logo strip, but it is not a driver a campaign should lead with.`,
      },
    ],
  }
}

function appPositioning(target: TargetInput): Positioning {
  const apple = target.kind === 'app_store'
  const store = apple ? 'the App Store' : 'Google Play'

  return {
    messaging: {
      main_headline: `Observed: "${target.name} — Budget Planner, Expense Tracker & Savings Goals", carried through into a store hero that reads "Personal finance made simple". It is a category description wearing the costume of a headline: it names three features, promises nothing specific, and could sit on any of the six listings ranked around it without changing a word.`,
      core_promise: `Implied rather than stated — that using ${target.name} will make personal finance feel manageable. The product actually delivers something much sharper than that (it finds money the user did not know they were spending, within two minutes of connecting an account), but no surface in the funnel says so. The strongest promise in the product is absent from the messaging that sells it.`,
      unique_selling_proposition: `Two genuine differentiators, both under-claimed. Automatic recurring-charge detection produces a surprising, personal, quantified result that no competitor's screenshot can match, and shared household budgets create a switching cost that single-user competitors structurally cannot copy. Neither appears in the ${
        apple ? 'subtitle or the app preview' : 'short description or the feature graphic'
      }, and shared budgets is not even priced as a plan. The USP exists in the product and has never made it into the positioning.`,
    },
    brand_voice: {
      tone: 'friendly',
      notes: `Warm, plain-spoken, non-judgemental — the right register for a category where most competitors either scold ("take control of your spending") or intimidate with financial-institution seriousness. The voice never talks down, avoids jargon and reads as though written by someone who has also been overdrawn, which is a real asset in a market where trust is the purchase decision. The weakness is that friendliness has been allowed to substitute for specificity: the copy is pleasant everywhere and precise nowhere, and pleasantness does not survive a side-by-side comparison on ${store}. The fix is not a tonal change but an injection of concrete claims into the tone that already exists.`,
    },
    positioning_strategy: {
      claim: 'easiest',
      explanation: `${target.name} positions on effortlessness — "simple", "automatic", "in one app" — which is the correct strategic choice for this audience, since every one of them has already failed at manual tracking and the product genuinely delivers a populated dashboard inside 90 seconds. The problem is that "easiest" is the most crowded claim in the category: it is what every competing listing also says, in nearly the same words, and it is unfalsifiable at the moment of the install decision. Ease is a claim that has to be demonstrated rather than asserted — a captioned before-and-after, a 15-second preview of the connect-to-insight loop, a stated number of seconds — and none of that demonstration exists. Meanwhile the claim that would differentiate, most_secure, sits unmade in the exact place the funnel is bleeding.`,
    },
    positioning_score: 54,
    score_rationale: `54 — a strong product with a positioning that refuses to say anything a competitor could not. The evidence is specific. The store title spends its visible characters before the 30-character truncation point on the brand and an em dash, so the category term is invisible at the moment of choice. The ${
      apple ? 'subtitle' : 'short description'
    } spends its entire limit on "Personal finance made simple", a phrase that adds no indexed term and makes no claim. The first two screenshot frames are uncaptioned product UI, which means the install decision is made on brand and rating alone. The two features that are actually defensible — recurring-charge detection and shared household budgets — appear at positions seven and nine of a flat eleven-item feature list, below entries any competitor also ships. And the single most valuable claim available to a consumer fintech, an explicit read-only, bank-grade-encryption security position, is made nowhere at all, including on the connection screen that loses 40-55% of installs. What keeps this above the 40s is real: the tone is well-judged and credible, the visual craft is high enough to read as institutional trustworthiness, and the underlying value proposition is coherent. This is a scoring of the articulation, not the product.`,
    differentiation_opportunities: [
      {
        title: 'Claim the security position outright, in the metadata and on the connect screen',
        impact: 'high',
        effort: 'low',
        rationale: `The largest drop in ${target.name}'s funnel is a trust decision, and the positioning never argues it. Read-only access stated plainly, bank-grade encryption named, recognizable institution logos, and one line committing that the app can never move money — this is copy and layout work, not engineering, and it converts the exact hesitation that is costing half of every install.`,
        estimated_impact: 'A 10-18% relative lift in connection completion, which flows through every downstream stage including paywall views and trial starts.',
      },
      {
        title: 'Lead with the forgotten-subscription outcome instead of the category description',
        impact: 'high',
        effort: 'low',
        rationale: `"Find the subscriptions you forgot you were paying for" is specific, falsifiable and surprising, and it is the one claim in this category that a competitor cannot make casually. It works identically as a ${
          apple ? 'subtitle' : 'short description'
        }, a screenshot caption, an ad hook and a paywall headline, so a single message decision propagates across the whole funnel.`,
        estimated_impact: 'Store conversion up 5-12% relative and a materially better CTR band on paid creative, at the cost of one copy cycle.',
      },
      {
        title: 'Position for households rather than individuals, and price accordingly',
        impact: 'high',
        effort: 'medium',
        rationale: `Shared household budgets are the most defensible thing ${target.name} ships and they are given away inside a single individual tier, invisible in the creative and unnamed in the positioning. Couples and families have higher willingness to pay, better retention and a two-sided invite built into the use case — and no incumbent in this category is speaking to them directly.`,
        estimated_impact: 'Blended ARPU up 15-25% with lower churn on multi-person accounts, and it opens a segment with a natural referral loop attached.',
      },
      {
        title: 'Demonstrate the ease claim rather than asserting it',
        impact: 'medium',
        effort: 'medium',
        rationale: `Every competitor says "simple", so the word carries no information. A ${
          apple ? '15-second app preview' : 'short promo video'
        } showing connect-to-insight in real time, with the elapsed seconds on screen, converts the claim from an adjective into evidence — and it uses the one part of the product that is genuinely best in category.`,
        estimated_impact: 'Video-equipped finance listings typically convert 8-15% better than static-only sets, and the same asset re-cuts directly into paid creative.',
      },
    ],
  }
}

function webPositioning(target: TargetInput): Positioning {
  const single = target.kind === 'landing_page'

  return {
    messaging: {
      main_headline: `Observed: a capability-led hero in the standard category construction — a verb, a noun and the word "platform" — supported by a subhead listing three feature areas. It is competent, it is on-brand, and it is interchangeable with the three products ${target.name} is most often compared against. The pages that actually convert on this site are not the homepage; they are the comparison pages, where the headline is forced to be specific by the query it answers.`,
      core_promise: `That the process a team currently runs across several tools and a spreadsheet will run in one connected place. The promise is legible and correct, and it is stated as a capability rather than as a result — "manage X in one place" instead of "cut the weekly reconciliation from four hours to twenty minutes". Nothing on the site attaches a number to the outcome, which leaves the strongest objection in a B2B evaluation ("did this actually work for a team like mine") completely unanswered.`,
      unique_selling_proposition: `The honest answer is that the product-level USP is thin — this category contains three functionally comparable tools — and the real differentiator is distribution: ${target.name} is the product a buyer finds at the moment they start comparing, because it ranks for the query they typed. That is a genuine advantage and it is entirely uncommunicated, because it is not the kind of thing a company can put on its own homepage. The consequence is that the messaging has nothing distinctive to fall back on when the buyer sees all three tools side by side.`,
    },
    brand_voice: {
      tone: 'professional',
      notes: `Clear, measured, low-jargon B2B prose that respects the reader and never oversells — appropriate for a buyer who is comparing rather than being persuaded, and a genuine advantage against competitors who write in benefit-free abstraction. It is also entirely undifferentiated. The voice has no point of view about how this work should be done, no named opinion, no willingness to say what the product is deliberately bad at. In a category where every vendor sounds professional, professionalism is table stakes and opinion is the differentiator${
        single ? ', and a single page has exactly one chance to express one' : ', and the resource library is the obvious place to develop one'
      }.`,
    },
    positioning_strategy: {
      claim: 'most_powerful',
      explanation: `${target.name} positions on depth — more integrations, more configurability, more surface than the lighter tools in the category — which is a defensible claim and a poorly targeted one. The buyer they actually acquire is a mid-level process owner who wants a result in the first session; depth reads to that person as setup cost, and the funnel data agrees, since over half of signups never complete the configuration that the positioning promises. Meanwhile the accounts for whom power genuinely matters — the ones with real scale, security review and an admin team — cannot buy, because there is no enterprise tier. The claim is aimed at a segment the go-to-market does not serve, while the segment it does serve would respond better to "easiest" or to a sharply narrowed vertical claim.`,
    },
    positioning_score: 61,
    score_rationale: `61 — coherent and credible, but generic in exactly the places where the decision gets made. The specifics: the homepage headline is a category construction that three named competitors could run unchanged; proof is a logo strip with no quantified outcome, no role, no company size, which is the single most common reason a B2B evaluation stalls; the pages that convert best are the comparison pages, where the query forces specificity that the brand-level messaging never supplies on its own; the "most powerful" claim is aimed at accounts that cannot buy for lack of an enterprise tier while the actual buyer experiences depth as setup burden; and there is no vertical framing anywhere, so the same generic page competes for every industry-qualified search instead of winning any of them. What holds the score in the 60s rather than lower is substantial: message-to-query match on the comparison and alternative-to pages is genuinely well executed and converts above the category norm, pricing is public and legible, and the voice is clear enough to be trusted. This is a business with excellent positioning at the query level and almost none at the brand level.`,
    differentiation_opportunities: [
      {
        title: 'Replace the logo strip with three quantified customer outcomes',
        impact: 'high',
        effort: 'low',
        rationale: `Logos prove existence, not results. Three outcomes with a number, a role and a company size attached — "cut weekly reporting from six hours to forty minutes, ops lead, 80-person agency" — answer the objection ${target.name}'s current proof leaves standing, and every competitor in the category is still shipping logo strips.`,
        estimated_impact: 'Landing-page conversion up 8-15% relative, applied across the whole site rather than to a single page.',
      },
      {
        title: 'Take a vertical position instead of a generic category one',
        impact: 'high',
        effort: 'medium',
        rationale: `The same product framed for three specific industries outranks and out-converts the generic page for every industry-qualified search, and vertical proof compounds — one named customer in a vertical makes the next one easier. It also routes around a competitor content moat rather than attacking it head-on, which is the only viable content strategy against accumulated domain authority.`,
        estimated_impact: 'Ranking on lower-competition, higher-converting queries within a quarter, at a fraction of the cost of contesting the head term.',
      },
      {
        title: 'Move the claim from "most powerful" to a demonstrated first-session result',
        impact: 'high',
        effort: 'medium',
        rationale: `The positioning promises depth to a buyer who is measuring time-to-value, and over half of signups never get through the configuration that the depth implies. A sample workspace at signup plus messaging built around what the product produces in the first ten minutes aligns the claim with both the buyer and the funnel.`,
        estimated_impact: 'Signup-to-activation up 15-25% relative — the largest single gain available, and it makes every acquisition improvement downstream worth more.',
      },
      {
        title: 'Build an enterprise story so the "powerful" claim has somewhere to land',
        impact: 'medium',
        effort: 'high',
        rationale: `SSO, SCIM, audit logs, a DPA and a security review packet are the entry fee for accounts that would actually value depth, and none of them are product-defining work. Without them the strongest positioning claim points at a segment that structurally cannot buy, and the largest accounts in the category convert at self-serve prices or not at all.`,
        estimated_impact: 'Opens five-figure ACVs and lifts blended ACV 30-60% within two quarters, without disturbing the self-serve motion.',
      },
    ],
  }
}

export function foundationFixture(target: TargetInput): FoundationGroup {
  const app = isStoreListing(target.kind)

  return {
    executive_summary: app ? appSummary(target) : webSummary(target),
    persona: app ? appPersona(target) : webPersona(target),
    positioning: app ? appPositioning(target) : webPositioning(target),
  }
}
