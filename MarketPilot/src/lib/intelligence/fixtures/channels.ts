import type { AsoIntelligence, ChannelsGroup, TargetInput } from '../types'

const isStoreListing = (kind: TargetInput['kind']) =>
  kind === 'play_store' || kind === 'app_store'

/** Keeps the sample title candidates inside the 30-character store limit. */
const shortBrand = (name: string) => (name.length > 12 ? name.slice(0, 12).trim() : name)

function storeAso(target: TargetInput): AsoIntelligence {
  const apple = target.kind === 'app_store'
  const store = apple ? 'App Store' : 'Google Play'
  const brand = shortBrand(target.name)
  const titleMain = `${brand}: Budget Planner`
  const titleAlt = `${brand}: Expense Tracker`

  return {
    applicable: true,
    not_applicable_reason: `Applicable — ${target.name} is a ${store} listing, so metadata, creative and store-side conversion are all in scope and are governed by ${store} rules.`,
    app_title: {
      observed: `"${target.name} — Budget Planner, Expense Tracker & Savings Goals". The full string only renders on the product page; ${store} truncates around 30 characters in search results and browse rows, so everything after the brand disappears at the moment of choice.`,
      keyword_strength: `Moderate. The one high-volume term ("budget planner") sits second, behind the brand and an em dash, which pushes it past the 30-character truncation point for any brand name longer than about twelve characters, and "expense tracker" and "savings goals" are competing for the same trailing space rather than being split across ${
        apple ? 'the subtitle and the 100-character keyword field' : 'the short description'
      }. The brand token is doing work it does not need — brand queries already rank first regardless.`,
      ranking_opportunities: [
        '"budget planner" — the category head term. High volume, high difficulty, and worth holding in the title even while install velocity catches up.',
        '"expense tracker" — near-identical volume with a slightly thinner field; the realistic near-term ranking win if it moves into a visible position.',
        '"bill reminder" — feature-level term with clear intent and almost no competition from the major finance apps.',
        '"money manager" — steady evergreen volume; loses to the head terms in a title fight but is cheap to hold elsewhere in the metadata.',
        '"savings goals app" — long-tail use-case query that converts well because the searcher has already decided what they want.',
        apple
          ? '"spending tracker" — a strong candidate for the 100-character keyword field, where it costs nothing and is never duplicated in the title.'
          : '"budgeting app free" — a term worth repeating naturally in the long description, which Google Play indexes and Apple does not.',
      ],
      recommended: apple
        ? [
            `Title (30 max): "${titleMain}" (${titleMain.length}) — brand plus the head term, both inside the truncation window.`,
            `Subtitle (30 max): "Track spending, save monthly" (28) — adds two new terms instead of echoing the title.`,
            `Subtitle alternative (30 max): "Budget planner & bill alerts" (28) — trades reach for the undefended bill-reminder cluster.`,
            `Keyword field (100 max): "expense,money,manager,finance,bill,reminder,subscription,income,receipt,debt,cash,goal" (86) — nothing in it repeats a term from the title or the lead subtitle, everything is singular because Apple matches plurals on its own, and there are no spaces after the commas.`,
          ]
        : [
            `Title (30 max): "${titleMain}" (${titleMain.length}) — brand plus the head term, both visible before truncation.`,
            `Title alternative (30 max): "${titleAlt}" (${titleAlt.length}) — pick this one if install velocity on "budget planner" stays flat for two release cycles.`,
            `Short description (80 max): "Track spending, set budgets, and hit savings goals — all in one free app." (73)`,
            `Short description alternative (80 max): "Budget planner and expense tracker. See where your money goes." (62)`,
          ],
    },
    short_description: {
      observed: apple
        ? `Subtitle reads "Personal finance made simple" (28 characters) — inside the limit, but it spends all 28 on a category cliché and introduces no term the title does not already carry.`
        : `Short description reads "The simple way to manage your personal finances every day" (57 of 80 characters) — 23 characters of indexed real estate left unused, and no primary keyword in it.`,
      conversion_effectiveness: `Weak. It describes a category, not an outcome, and it makes no promise a competing listing could not make. ${
        apple
          ? 'On the App Store this line sits directly under the title in search results and is one of the strongest indexed fields — spending it on "made simple" is the single cheapest thing to fix here.'
          : 'On Google Play this is indexed text and it is also the only copy most users read before deciding, so it should carry the primary keyword and the outcome in the same sentence.'
      }`,
      recommended: apple
        ? [
            `"Track spending, save monthly" (28) — outcome-led and adds "spending" as a new indexed term.`,
            `"Budget planner & bill alerts" (28) — leads with the head term and names the undefended feature.`,
            `"Smart budgets, real savings" (27) — the softer brand-forward option; test it against the two above.`,
          ]
        : [
            `"Track spending, set budgets, and hit savings goals — all in one free app." (73)`,
            `"Budget planner and expense tracker. See where your money goes." (62)`,
            `"Free budget app with automatic expense tracking and bill reminders." (67)`,
          ],
    },
    long_description: {
      keyword_optimization: apple
        ? `Largely irrelevant to ranking — Apple does not index the description, so the current keyword repetition in paragraph two is wasted effort that also makes the copy read like SEO filler. The 100-character keyword field is where that work belongs.`
        : `Under-optimized for a field Google Play indexes directly. "Budget" appears twice across the whole 2,900-character body and "expense tracker" not at all outside the feature list, while the opening 170 characters — the highest-weighted text on the page — carry no primary term at all.`,
      feature_presentation: `Features are listed as a flat 11-item bullet block with no grouping, so the two genuinely differentiated ones (automatic bill detection and shared household budgets) sit at positions seven and nine, below generic entries any competitor also ships.`,
      user_benefits: `Benefits are stated as capabilities rather than results — "categorize your transactions" instead of "see where the money actually went last month". Nothing in the copy quantifies an outcome, so there is no reason for a comparison shopper to prefer this listing over the two above it.`,
      recommended_outline: [
        'Open with a two-line outcome hook naming the primary keyword — this is what shows above the "more" fold and, on Play, what carries the most indexing weight.',
        'Follow with three benefit-led blocks, each headed by a result and backed by the specific feature that delivers it.',
        'Promote automatic bill detection and shared household budgets into positions one and two of the feature block; they are the only entries a competitor cannot copy this quarter.',
        'Insert a short social-proof line with the real rating and review count, plus any press or award mention.',
        apple
          ? 'Close with plan pricing and a support link — write this section for a hesitant human, since none of it affects ranking on the App Store.'
          : 'Close with a natural-language paragraph repeating the two primary terms once each, then plan pricing and a support link — Play indexes this text, so density matters within reason.',
        'Keep the whole thing under the 4,000-character limit with room to spare; anything past roughly 2,500 characters is read by almost nobody.',
      ],
    },
    screenshots: {
      messaging_hierarchy: `Inverted. Frames one and two are uncaptioned product UI, and the first benefit caption does not appear until frame four — well past the point where most ${store} visitors stop swiping. The set assumes the user will explore; in practice they decide on frame one.`,
      feature_communication: `Frames three through six each show a different screen but make the same implicit claim ("we have a nice dashboard"). Bill detection, the strongest differentiator, is shown as a notification thumbnail with no explanation of what it does.`,
      emotional_triggers: `Almost none. The set sells control and tidiness through interface polish, but never touches the anxiety that drives someone to install a budgeting app at 11pm — the overdraft, the surprise subscription, the month that did not add up. Relief is the emotion to sell and it is absent.`,
      visual_quality: `High. Consistent type scale, a coherent palette, real data in every mock rather than lorem values, and correct device frames for current hardware. Craft is not the problem here; message selection is.`,
      recommendations: [
        'Caption frame one with the outcome, not the feature: "Know exactly where your money went" over a real dashboard, legible at thumbnail size.',
        'Make frame two the differentiator — automatic bill detection — with a caption that states the benefit ("Catch the subscriptions you forgot about").',
        'Put social proof in frame three: rating, review count, and one short verbatim quote from an actual review.',
        'Test every caption at 25% scale before shipping; if it is unreadable in the browse row it does not exist.',
        apple
          ? 'Add a 15-second portrait app preview video; autoplay previews measurably lift App Store conversion for apps whose value is in the interaction loop.'
          : 'Add a short promo video and localize the first three frames for the top two non-English markets — Play surfaces localized creative in browse.',
      ],
    },
    feature_graphic: {
      conversion_optimization: apple
        ? `Not applicable in this form — the App Store has no feature graphic. The equivalent surface is the app preview video plus the icon, and ${target.name} currently ships no preview video, which leaves the strongest conversion asset on the store unused.`
        : `Underused. The graphic repeats the app icon and wordmark on a gradient, which duplicates information already shown beside it and adds nothing to the install decision. It is the largest single visual on the listing and it is carrying zero message.`,
      branding: `Consistent with the product: same palette, same wordmark, same type. Recognition is fine — the issue is that recognition is all it does, and brand recall only matters to users who already know ${target.name}.`,
      visual_appeal: `Clean and professionally produced, but low contrast at browse-row size, and the gradient flattens against ${store}'s own background in dark mode.`,
      recommendations: apple
        ? [
            'Ship a 15-second portrait app preview: overdraft anxiety in the first two seconds, bill detection at five, the calmer dashboard at the close.',
            'Test two icon variants — the wordmark against a single strong symbol; icon A/B tests routinely move App Store conversion by low single digits.',
            'Use the promotional text field for offers and seasonal hooks, since it updates without a release.',
          ]
        : [
            'Replace the wordmark with a benefit line plus one product visual — the graphic should make a claim, not repeat the icon.',
            'Raise contrast so the graphic holds up in dark mode and at browse-row size.',
            'Run it as a Play Store Listing Experiment against the current version; a feature graphic test is free traffic and takes one week to read.',
          ],
    },
    aso_score: 58,
    score_rationale: `58 — a competent listing losing most of its discovery and conversion upside. Metadata is the drag: the head keyword sits past the 30-character truncation point, the ${
      apple ? 'subtitle' : 'short description'
    } spends its limit on a category cliché and adds no new indexed term, and the ${
      apple ? 'keyword field duplicates title terms' : 'long description opens with no primary keyword despite Play indexing it'
    }. Creative craft is genuinely high, which keeps this out of the 40s, but the first two screenshots are uncaptioned UI and there is no ${
      apple ? 'app preview video' : 'promo video or localized creative'
    }, so the polish is not converting. Nothing here is broken; it is a listing built for people who already know the brand.`,
    improvements: [
      {
        title: 'Move the head keyword inside the 30-character title',
        impact: 'high',
        effort: 'low',
        rationale: `"${brand}: Budget Planner" puts the highest-volume category term where ${store} both indexes it and shows it, and drops brand characters that brand queries do not need.`,
        estimated_impact: 'Typically a 15-30% lift in category-search impressions within two to four weeks of the metadata taking effect.',
      },
      {
        title: 'Rewrite the first three screenshot captions around outcomes',
        impact: 'high',
        effort: 'low',
        rationale:
          'The install decision is made on frames one to three, and all three currently show interface rather than making a claim. Captions ship without an app update.',
        estimated_impact: 'A 5-12% relative lift in store conversion rate, the cheapest available win on this listing.',
      },
      {
        title: apple ? 'Ship a 15-second app preview video' : 'Ship a promo video and a message-carrying feature graphic',
        impact: 'medium',
        effort: 'high',
        rationale: `The value of a budgeting app is in the loop — connect, categorize, notice, adjust — which a static frame cannot show. ${
          apple ? 'Apple autoplays the preview in search results.' : 'Play surfaces the video above the screenshot carousel.'
        }`,
        estimated_impact: 'Video-equipped listings in personal finance typically convert 8-15% better than static-only sets.',
      },
      {
        title: apple
          ? 'Rebuild the keyword field with no title or subtitle duplicates'
          : 'Rewrite the first 170 characters of the long description',
        impact: 'medium',
        effort: 'low',
        rationale: apple
          ? 'Apple indexes title, subtitle and keyword field as one pool; every duplicated term is wasted budget out of 100 characters.'
          : 'Play weights the opening of the long description heavily and it currently contains no primary keyword.',
        estimated_impact: 'Adds coverage on 8-12 mid-tail terms the listing does not currently rank for at all.',
      },
    ],
  }
}

function nonStoreAso(target: TargetInput): AsoIntelligence {
  const kindLabel =
    target.kind === 'landing_page' ? 'standalone landing page' : target.kind === 'saas_product' ? 'SaaS product' : 'website'
  const none = `Not applicable — ${target.name} is a ${kindLabel} with no app store listing, so there is no store metadata to assess.`

  return {
    applicable: false,
    not_applicable_reason: `${target.name} is distributed on the web, not through the App Store or Google Play, so store optimization does not apply. The nearest equivalents are marketplace and review-directory listings, covered under improvements below.`,
    app_title: {
      observed: none,
      keyword_strength: `Not applicable to a store listing. The equivalent surface is the HTML title tag and it is assessed in the positioning and SEO sections rather than here.`,
      ranking_opportunities: [],
      recommended: [],
    },
    short_description: {
      observed: none,
      conversion_effectiveness: `Not applicable — the equivalent asset is the meta description and hero subhead, which belong to the on-site funnel analysis.`,
      recommended: [],
    },
    long_description: {
      keyword_optimization: none,
      feature_presentation: `Not applicable — feature presentation for ${target.name} happens on product pages, not in a store description.`,
      user_benefits: `Not applicable — benefit copy lives on the site and is covered in the positioning section.`,
      recommended_outline: [],
    },
    screenshots: {
      messaging_hierarchy: none,
      feature_communication: `Not applicable — product imagery on the site is assessed as landing-page creative, not store screenshots.`,
      emotional_triggers: `Not applicable to a store listing.`,
      visual_quality: `Not applicable to a store listing.`,
      recommendations: [],
    },
    feature_graphic: {
      conversion_optimization: `Not applicable — the feature graphic is a Google Play asset and ${target.name} has no Play listing.`,
      branding: `Not applicable to a store listing.`,
      visual_appeal: `Not applicable to a store listing.`,
      recommendations: [],
    },
    aso_score: 0,
    score_rationale: `Score unused. ${target.name} has no app store presence, so an ASO score would be meaningless — the merge layer nulls this out and redistributes its weight across the remaining sections rather than counting a zero against the target.`,
    improvements: [
      {
        title: 'Claim and optimize the integration marketplace listings',
        impact: 'medium',
        effort: 'low',
        rationale: `The closest ASO analog for ${target.name}. Marketplace directories (Slack, HubSpot, Shopify, Zapier, Chrome Web Store) rank in Google for "<partner> integration" queries and send pre-qualified traffic that converts well above cold search.`,
        estimated_impact: 'Typically 3-6% of new signups within a quarter, at effectively zero media cost.',
      },
      {
        title: 'Build out the G2 and Capterra profiles with a review push',
        impact: 'medium',
        effort: 'medium',
        rationale:
          'Review directories are the store shelf for B2B software and they outrank most vendor pages for "best <category>" and "<competitor> alternative". A thin profile with fewer than 30 reviews loses the grid placement to whoever asked their customers.',
        estimated_impact: 'Moves category-grid placement within one review cycle and lifts bottom-of-funnel referral volume by 10-20%.',
      },
      {
        title: 'Decide the mobile question deliberately rather than by default',
        impact: 'low',
        effort: 'high',
        rationale: `If any meaningful share of ${target.name}'s usage is on mobile web, a thin native wrapper mainly buys store-search discovery and push notifications. That is a real but narrow benefit — worth naming as a decision rather than leaving unmade.`,
        estimated_impact: 'Opens store search as a channel; not worth pursuing below roughly 25% mobile-web session share.',
      },
    ],
  }
}

function storeAcquisition(target: TargetInput): ChannelsGroup['acquisition'] {
  const apple = target.kind === 'app_store'
  const store = apple ? 'the App Store' : 'Google Play'

  return {
    summary: `${target.name} runs a paid-led install engine with a healthy store-search base underneath it. Roughly three in five installs are organic, but most of that is store search the listing itself is only half-optimized for, and the paid side leans hard on two platforms. There is no compounding owned channel — no content footprint, no email-driven reactivation, no community — so growth is bought each month rather than accumulated. That is the structural weakness, and it is the opening: a competitor that builds owned demand can outlast them on the same budget.`,
    primary_channel: `${store} search (ASO) — the largest single source of installs, and the one most exposed to the metadata gaps in the ASO section above.`,
    organic: [
      {
        channel: `Store search / ASO (${store})`,
        confidence: 90,
        evidence: `A polished, actively maintained listing with staged screenshot updates and a keyword-bearing title indicates deliberate store investment, and category head terms are where an app of this size realistically gets found. This is inference from the listing itself rather than measured install data.`,
        estimated_share: '30-35% of new installs',
      },
      {
        channel: 'Organic search / SEO (web)',
        confidence: 46,
        evidence: `No meaningful content footprint surfaced in the digest — the web presence reads as a marketing site with a download button, not a ranking asset. The traffic that does arrive is almost certainly branded, which is retained demand rather than newly acquired.`,
        estimated_share: '6-8% of new installs',
      },
      {
        channel: 'Social and community (TikTok, Instagram, creator-led)',
        confidence: 68,
        evidence: `Personal finance is one of the few categories where organic short-form reliably drives installs, and the creative style of the store assets suggests the same team is producing social. Consistent with the category; not directly observed.`,
        estimated_share: '10-13% of new installs',
      },
      {
        channel: 'Referral and word of mouth',
        confidence: 52,
        evidence: `Shared household budgets create a natural two-sided invite, which is the strongest referral mechanic available in this category. Nothing in the digest shows an incentivized referral program, so this is likely organic sharing rather than an engineered loop.`,
        estimated_share: '6-9% of new installs',
      },
    ],
    paid: [
      {
        channel: 'Google Ads — App campaigns (UAC), tCPA on subscribe',
        confidence: 84,
        evidence: `App campaigns are the default install engine at this scale on ${
          apple ? 'both stores' : 'Google Play'
        }, and the listing's asset variety — multiple screenshot sets, several caption treatments — is what a team feeds a UAC asset group. Strong circumstantial evidence rather than an observed campaign, which is what keeps it below the direct-evidence band.`,
        estimated_share: '18-22% of new installs',
      },
      {
        channel: 'Meta Ads — Advantage+ App campaigns, UGC-style video',
        confidence: 78,
        evidence: `Finance apps at this size run Meta as the second install channel almost without exception, and the demographic skew of budgeting apps (25-44, mobile-first) maps directly onto Meta's cheapest inventory. Category economics, not a creative sighted in the ad library.`,
        estimated_share: '12-15% of new installs',
      },
      {
        channel: 'TikTok Ads — Spark Ads amplifying creator posts',
        confidence: 71,
        evidence: `#budgeting and #moneytok are among the highest-volume finance verticals on the platform, and Spark Ads on existing creator posts is the standard play. Likely running, though probably as a secondary budget rather than a core channel.`,
        estimated_share: '5-7% of new installs',
      },
      {
        channel: apple
          ? 'Apple Search Ads — brand defense plus category Search tab'
          : 'Apple Search Ads — only relevant to the iOS twin, if one exists',
        confidence: apple ? 83 : 28,
        evidence: apple
          ? 'Brand defense on the App Store is close to mandatory for a funded finance app — competitors bid on the brand term and the defensive CPA is low enough that skipping it is rare.'
          : `The target here is a Google Play listing, so Apple Search Ads only applies to a separate iOS build. Nothing in the digest confirms one, which caps confidence well below the Android channels.`,
        estimated_share: apple ? '3-5% of new installs' : 'Under 2% of new installs',
      },
      {
        channel: 'YouTube Ads — in-feed video, largely inherited from App campaigns',
        confidence: 38,
        evidence: `YouTube placements almost certainly receive spend as part of the App campaign inventory mix, but there is no sign of a standalone YouTube buy: that requires long-form creative, and the asset set in evidence is all short vertical video.`,
        estimated_share: '2-3% of new installs',
      },
    ],
    acquisition_score: 71,
    score_rationale: `71 — two channels carry the engine and neither compounds. Store search and Google App campaigns together account for roughly half of all installs, and the paid side concentrates about 80% of spend on Google and Meta, so a CPI increase on either platform hits the whole plan at once. Meta and TikTok are run well enough to count as real channels rather than token efforts, which is what lifts this out of the 60s at all. What holds it at the floor of the band is the absence of owned demand: no ranking content, no visible lifecycle or email motion, and a referral mechanic that exists in the product but has never been turned into a program. Every month starts from zero.`,
    gaps: [
      'No content or SEO footprint — the entire "how to budget" and "best budgeting app" keyword cluster is uncontested and is the cheapest durable demand available in this category.',
      'The shared-budget feature is a two-sided invite that has never been turned into an incentivized referral program with a reward on both sides.',
      'No lifecycle motion visible: no email or push sequence aimed at the users who install, connect one account, and never return.',
      'Web-to-app is unbuilt — no smart banner, no deferred deep linking from the marketing site, so the organic web traffic that does arrive is largely wasted.',
      'No partnership or embedded distribution: credit unions, payroll providers and personal finance newsletters all reach this exact audience with no CPI attached.',
      apple
        ? 'Android is either unlaunched or unmarketed, which cedes the larger global install base at a materially lower CPI.'
        : 'iOS monetizes better in this category and there is no evidence of a matched Apple Search Ads or App Store creative strategy.',
    ],
  }
}

function webAcquisition(target: TargetInput): ChannelsGroup['acquisition'] {
  return {
    summary: `${target.name} acquires through a search-led motion: a content and comparison footprint that captures in-market buyers, with paid search bolted on top to defend the terms the content already ranks for. Social is founder- and LinkedIn-driven rather than paid, and referral runs through integration marketplaces and partner listings. It is a durable mix and a narrow one — nearly everything depends on Google, so an algorithm update or a competitor outbidding them on brand terms would hit both the organic and the paid side at once.`,
    primary_channel:
      'Organic search — comparison, alternative-to and problem-led content carries the largest share of new signups by a wide margin.',
    organic: [
      {
        channel: 'Organic search / content SEO',
        confidence: 89,
        evidence: `A resource library, comparison pages and templated integration pages are the signature of a deliberate SEO program, and the site structure in the digest is built for it. The dominant channel by inference from footprint size rather than from measured traffic.`,
        estimated_share: '35-45% of new signups',
      },
      {
        channel: 'App store search (ASO)',
        confidence: 4,
        evidence: `${target.name} is web-distributed with no app store listing, so store search contributes nothing. Included for completeness rather than as a real channel.`,
        estimated_share: 'Effectively 0%',
      },
      {
        channel: 'Social and community (LinkedIn, founder-led, newsletter)',
        confidence: 74,
        evidence: `B2B buyers in this category discover tools through practitioner communities and LinkedIn far more than through paid social, and the content cadence suggests distribution beyond the blog itself. Consistent with the category; the specific mix is inferred.`,
        estimated_share: '10-14% of new signups',
      },
      {
        channel: 'Referral, integrations and partner marketplaces',
        confidence: 66,
        evidence: `Marketplace listings send pre-qualified traffic and rank independently for "<partner> integration" queries, and any product with a public API accumulates this traffic whether or not it is managed. Likely material, likely under-instrumented.`,
        estimated_share: '12-16% of new signups',
      },
    ],
    paid: [
      {
        channel: 'Google Ads — branded defense plus high-intent category and competitor terms',
        confidence: 84,
        evidence: `Brand defense is near-universal for a funded B2B product, and a business whose organic strength is comparison content will always find paid search the cheapest incremental channel because the landing pages already exist. The strongest call on the paid side, though it rests on category economics rather than an ad or a tracked landing variant anyone has seen.`,
        estimated_share: '15-20% of new signups',
      },
      {
        channel: 'Meta Ads — mostly retargeting, limited cold prospecting',
        confidence: 47,
        evidence: `Meta works for retargeting site visitors at almost any ACV, but cold B2B prospecting there is expensive and hard to target for a considered purchase. Plausible as a small retargeting line, unlikely as a growth channel.`,
        estimated_share: '4-6% of new signups',
      },
      {
        channel: 'TikTok Ads',
        confidence: 16,
        evidence: `The buying committee for this product is not making software decisions on TikTok, and the ad formats do not suit a demo-and-trial motion. No evidence of a presence, and the economics do not support one.`,
        estimated_share: 'Under 1% of new signups',
      },
      {
        channel: 'Apple Search Ads',
        confidence: 3,
        evidence: `Structurally unavailable — Apple Search Ads promotes App Store listings and ${target.name} has no app. Scored near zero rather than left blank.`,
        estimated_share: '0%',
      },
      {
        channel: 'YouTube Ads — in-feed against competitor and how-to searches',
        confidence: 34,
        evidence: `A category where buyers watch demos before trialing supports YouTube, but a real buy needs long-form creative and there is no sign of a video program. More likely a small inherited Performance Max placement than a deliberate channel.`,
        estimated_share: '2-4% of new signups',
      },
    ],
    acquisition_score: 74,
    score_rationale: `74 — a genuinely compounding primary channel with real concentration risk behind it. The content and comparison footprint is the kind of asset that keeps producing signups after spend stops, and the marketplace referral surface adds a second durable source that most competitors in this category never build. It does not reach the high 80s because roughly two thirds of acquisition ultimately routes through Google in one form or another, paid is effectively a single-platform program, and there is no owned audience — no meaningful newsletter, no community, no event motion — that would survive a ranking loss.`,
    gaps: [
      'Paid is effectively Google-only; a competitor bidding up brand and category terms could raise their CAC by a third with no counter available.',
      'No owned audience: a newsletter or community would insulate them from a ranking change, and neither exists at any scale.',
      'No partner or affiliate program despite an integration surface that is already sending traffic for free — the referral channel is happening to them rather than being run.',
      'No video program, which leaves both YouTube and the demo-heavy part of the buying journey to competitors.',
      'Bottom-of-funnel review directories (G2, Capterra) look thin relative to the content investment, which is where "best <category>" searchers actually land.',
      'No outbound or sales-assist motion visible, so any deal above the self-serve price point depends on the buyer finding their way through unaided.',
    ],
  }
}

export function channelsFixture(target: TargetInput): ChannelsGroup {
  const store = isStoreListing(target.kind)
  return {
    aso: store ? storeAso(target) : nonStoreAso(target),
    acquisition: store ? storeAcquisition(target) : webAcquisition(target),
  }
}
