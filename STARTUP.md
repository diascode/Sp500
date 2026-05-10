# MOMENTUM

**Technical analysis screen across global markets. Filters to high-scoring signals.**

*Startup Strategy & Operating Document — v1.0*
*Prepared: May 2026*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Market Research](#3-market-research)
4. [Business Model](#4-business-model)
5. [Go-to-Market Strategy](#5-go-to-market-strategy)
6. [Competitive Analysis](#6-competitive-analysis)
7. [Technology & Architecture](#7-technology--architecture)
8. [Product Roadmap](#8-product-roadmap)
9. [Team & Founder Context](#9-team--founder-context)
10. [Risk Analysis](#10-risk-analysis)
11. [Traction & Metrics to Track](#11-traction--metrics-to-track)
12. [Investment & Funding Needs](#12-investment--funding-needs)
13. [Opus Recommendations](#13-opus-recommendations)

---

## 1. Executive Summary

**MOMENTUM** is a web-based technical analysis scanner and paper trading simulator built for self-directed retail investors who want institutional-grade signal filtering without institutional pricing. We compute ten classical indicators (RSI, MACD, ADX, SMA 9/20/50/200, Bollinger Bands, ATR, volume ratio, support/resistance, candlestick patterns) across 124 hand-curated stocks spanning the US, Europe, and emerging markets — including 24 Brazilian B3 names that almost no Western competitor covers cleanly.

The product is live, bilingual (English / Portuguese), and ships a composite BUY/HOLD/SELL verdict on every card alongside take-profit and stop-loss bands, a tracked-picks watchlist, and a full trading journal with monthly P&L and tax estimation.

**Why now.** Three forces converge: (1) global retail trading volume is structurally elevated post-2020 and has not reverted; (2) Brazil's B3 retail base has crossed 5 million individual investors and is the fastest-growing equity participation story in the Americas; (3) incumbent tools (TradingView, Finviz, Stock Rover, Yahoo Premium) charge USD-denominated subscriptions of $14.95–$59.95/month, do not localize meaningfully into Portuguese, and bury B3 coverage behind enterprise tiers.

**The opportunity.** A clean, focused, affordable scanner — €9/month, paper-trading-first, EM-aware, multilingual — can capture a defensible wedge in Brazilian and Iberian retail before pivoting upmarket. We estimate the SOM at roughly **€2.7M ARR** over 36 months, requiring ~25,000 paying users — a 0.5% capture of the addressable Portuguese-speaking retail trader pool.

**The ask.** This document outlines the path to **€1M ARR by Q4 2027** on a bootstrapped or pre-seed (€150–250k) trajectory. Sprint 1 (security hardening, GDPR, Docker non-root, trading journal) is complete. Sprints 2–3 (email/auth recovery, mobile, Pix, soft launch) are scheduled through Q3 2026.

---

## 2. Product Overview

### What MOMENTUM Does

MOMENTUM ingests live OHLCV data via a server-side proxy, computes a battery of technical indicators per symbol, and renders a one-glance card per stock with:

- A composite **BUY / HOLD / SELL verdict** derived from indicator agreement
- **Entry zone, take-profit, and stop-loss bands** computed from ATR and recent S/R
- An interactive price chart with overlaid SMAs and Bollinger Bands
- News sentiment digest, correlation matrix (Pro), and a market-level scan summary

The user flow is deliberately narrow: scan → filter → track → journal. Everything else is education or settings.

### Core Modules

| Module | Description | Tier |
|---|---|---|
| Live Scan | Real Yahoo Finance data via server-side proxy with 60s cache | Free (5/market) / Pro (full) |
| Stock Cards | Charts, indicators, verdict, TP/SL, news, S/R | All |
| Tracked Picks | Persistent watchlist with TP/SL hit alerts | 5 (Free) / Unlimited (Pro) |
| All Stocks Browser | Inline track + add-to-portfolio buttons | All |
| Portfolio / Trading Journal | Positions, partial sells, monthly P&L, tax estimate, CSV/MD export, print-to-PDF | Pro |
| Education | Deep-dives on RSI, MACD, ADX, SMA, Bollinger | All |
| Paper Trading Simulator | Risk-free practice with the full scanner | All |
| Economic Calendar | Macro events relevant to held positions | All |
| Themes / Accessibility | 7 themes, font size controls, EN/PT | All |
| GDPR / LGPD | Data export, account deletion, cookie consent | All |

### Key Differentiators

1. **Brazilian B3 coverage as a first-class citizen** — 24 B3 tickers in the default universe, not a paywalled add-on.
2. **Paper-trading-first onboarding** — new users practice before risking capital, dramatically lowering activation friction vs. broker-tied platforms.
3. **Composite verdict** — instead of forcing the user to read five indicators, MOMENTUM ships an opinion. Users disagreeing with the opinion still benefit from the explainability.
4. **Bilingual EN/PT product surface** — currently admin-gated, scheduled for public toggle in Sprint 2.
5. **€9 flat-rate Pro tier** — cheaper than TradingView Essential, cheaper than Stock Rover Premium, cheaper than Finviz Elite. EU-VAT-compliant pricing in EUR removes USD FX friction for European customers.

---

## 3. Market Research

### Global Retail Investor Growth

The 2020–2022 cohort of new retail investors materially enlarged the addressable market. Global retail participation in equities now sits at the highest sustained level since the late 1990s. Smartphone-native onboarding (Robinhood, Revolut, XP, Nubank Invest, Trade Republic) has driven activation costs down by an order of magnitude, and the secondary market for tooling — scanners, journals, education — has scaled in lockstep.

### Brazil — The Anchor Market

- **Retail investors on B3:** ~5.0 million individuals (vs. ~600k in 2018), a ~8x expansion in seven years.
- **Smartphone penetration:** ~88% of adults; mobile-first investing is the default, not an option.
- **Fintech adoption:** Brazil leads LatAm — Nubank alone has 100M+ customers, XP and BTG Digital have normalized self-directed investing.
- **Pix:** Instant, free, ubiquitous. Subscription billing in BRL via Pix recurring (Pix Automático, rolled out 2025) removes card-decline churn that plagues Stripe-only flows in Brazil.
- **Language:** Portuguese-first. English-only tools have a measurable activation cliff.
- **Underserved gap:** No major global tool localizes well, and domestic tools (TradeMap, Status Invest, Investidor10) compete on data depth but lag on UX, paper trading, and signal scoring.

### Europe — The Margin Market

- **Retail trading boom centers:** Germany (Trade Republic, Scalable), France, Iberia, Netherlands, Italy.
- **Iberian opportunity:** ~600k active retail investors in Portugal + Spain combined. Portuguese-speaking Brazilian-Portuguese product surface partially serves Portugal natively.
- **EU regulatory tailwind:** PSD2 + open banking enables subscription-friendly billing; MiFID II disclosures normalize "this is not financial advice" framing.

### Market Sizing

| Layer | Definition | Estimate | Reasoning |
|---|---|---|---|
| **TAM** | All self-directed retail investors globally willing to pay for tooling | ~30M users / ~€3.6B/yr | 30M users × €120 ARPU |
| **SAM** | Portuguese + Spanish + English-speaking retail investors using a scanner today | ~6M / ~€720M/yr | B3 5M + Iberia 0.6M + bilingual EN slice |
| **SOM (3-yr)** | Realistic capture: BR + PT + EN early adopters via content + community | 25–30k paying / €2.7–3.2M ARR | 0.5% SAM penetration; PT-BR YouTube + Pix unlock |

### Where Existing Tools Fall Short

- **TradingView**: World-class charting but overwhelming for new users; PT translation is partial; €13–€55/month USD-equivalent.
- **Finviz**: US-only, English-only, dated UX, $39.50/month Elite.
- **Stock Rover**: Fundamentals depth but weak EM coverage and no paper trading.
- **Yahoo Premium**: Strong universe, weak signal layer, no journaling, $34.99/month.
- **Domestic BR tools**: Strong on data, weak on UX, signals, and paper trading.

The wedge is real: **affordable + multilingual + EM-coverage + opinionated signal + paper-trading-first**. Nobody owns that quadrant today.

---

## 4. Business Model

### Pricing Tiers

| Tier | Price | Limits |
|---|---|---|
| **Free** | €0 | 5 stocks per market, 5 tracked picks, no portfolio, no tax report |
| **Pro** | **€9/month** | Unlimited stocks, unlimited picks, full portfolio + trading journal, correlation matrix, exports |
| **Admin** | n/a | Full access + admin panel; manual 1-year Pro grants for partners/influencers |

Pix integration (Sprint 3) will introduce a BRL-equivalent monthly price (~R$ 49) and an annual prepay (R$ 490, 17% discount) that performs strongly in BR consumer SaaS.

### Unit Economics (Working Assumptions)

| Metric | Assumption | Rationale |
|---|---|---|
| **ARPU** | €9/mo = €108/yr | Single Pro tier |
| **Gross Margin** | 78% | Stripe ~3%, data feed (post-Polygon migration) ~€199/mo + per-call, hosting <€100/mo at <10k users |
| **CAC** | €4–€8 (content) / €18–€25 (paid) | Blended €10 target; PT-BR YouTube + SEO is the cost lever |
| **Monthly Churn** | 6% (early) → 4% (steady) | Consumer SaaS retail-trader benchmark |
| **LTV** | €108 × (1 / 0.05) × 0.78 ≈ **€1,685** at 5% blended monthly churn | Standard cohort model |
| **LTV / CAC** | 16x (content) / 6x (paid) | Both above 3x healthy threshold |
| **Payback** | <2 months | Strong; permits aggressive reinvestment |

### Revenue Projection (Base Case)

| Period | Paying Users | MRR | ARR | Notes |
|---|---|---|---|---|
| End of Y1 (Q2 2027) | 1,200 | €10.8k | €130k | PT-BR content + soft launch |
| End of Y2 (Q2 2028) | 7,500 | €67.5k | €810k | Pix live, mobile shipped, paid acquisition on |
| End of Y3 (Q2 2029) | 22,000 | €198k | **€2.4M** | Localization to ES, partnership channel, mobile app |

A bull case (BR influencer breakout + Iberian B2B2C) reaches €1M ARR by mid-Y2; a bear case (Yahoo data block, slow content compounding) lands at €300k ARR by Y3.

---

## 5. Go-to-Market Strategy

The GTM is sequenced **content → community → paid → partnerships**, in that order, because retail-investor SaaS rewards trust over reach.

### Phase 1 — Content & SEO (Months 0–6)

- **PT-BR YouTube channel**: 2 videos/week. Format: "MOMENTUM scan + market readout." Cost: founder time. Target: 10k subs by month 9.
- **SEO**: 60 evergreen posts in PT and EN — "Como usar RSI para day trade", "Best stocks under €10 by Bollinger squeeze", indicator deep-dives mirroring the in-app Education module.
- **Twitter/X + Threads**: Daily scan screenshots, weekly winners/losers from tracked picks.
- **Reddit**: r/investimentos, r/BrasilBolsa, r/eupersonalfinance — value-first posts, no hard pitches.

### Phase 2 — Community & Beta (Months 3–9)

- **Closed beta cohort**: 100 hand-picked B3 traders, recruited via Telegram + Discord groups. 1-year free Pro for feedback.
- **Discord server**: Tracked-picks discussion, weekly call, scan challenges.
- **Newsletter**: Weekly "Momentum Friday" — top 10 BUY signals across all markets. Free, builds list.

### Phase 3 — Paid + Partnerships (Months 9–18)

- **Influencer seeding**: 1-year Pro grants to 20 mid-tier BR finance YouTubers (10–100k subs). Track via UTM.
- **Affiliate program**: 30% rev share for 12 months. Aligns with the BR creator economy norms.
- **Paid search**: PT-BR Google Ads on long-tail "scanner ações B3", "RSI ferramenta gratis".
- **B2B2C with brokers**: Mid-tier BR brokers (modalmais, Genial, Toro) need a tooling layer — co-brand Pro tier.

### Phase 4 — Localization Expansion (Months 18+)

- Spanish (Mexico, Argentina, Spain), then French (Quebec + France).
- Mobile app on iOS + Android (PWA-first, native-second).

---

## 6. Competitive Analysis

| Feature | **MOMENTUM** | TradingView | Stock Rover | Finviz | Yahoo Premium | Status Invest (BR) |
|---|---|---|---|---|---|---|
| **Price (USD/mo equiv)** | **~$10** | $14.95–$59.95 | $7.99–$27.99 | $0–$39.50 | $34.99 | $5–$15 |
| **EM / B3 coverage** | **First-class** | Available, paywalled | Weak | None | Partial | Strong (BR-only) |
| **Portuguese support** | **Full (EN/PT)** | Partial | None | None | None | Native |
| **Paper trading** | **Yes, native** | Yes | No | No | No | No |
| **Composite signal verdict** | **Yes (BUY/HOLD/SELL)** | No (manual) | Partial (ratings) | Partial | No | No |
| **Trading journal w/ tax** | **Yes (Pro)** | Limited | No | No | No | No |
| **Mobile UX** | Roadmap (Sprint 2) | Strong | Weak | Weak | Strong | Strong |
| **Onboarding friction** | **Low** | High (overwhelm) | Medium | Medium | Low | Low |
| **Free tier useful?** | **Yes** | Yes | No | Yes (limited) | No | Yes |

Defensibility lives in three places: (1) the PT-BR content moat compounds slowly and is expensive to replicate; (2) the curated 124-stock universe is opinionated and editorial — not a feature competitors can clone in a sprint; (3) the paper-trading-first onboarding flow lowers activation cost in ways data-only tools can't match.

---

## 7. Technology & Architecture

### Current Stack

- **Backend**: Node.js, no framework. Single server file. JWT auth, scrypt hashing, rate limiting (10 attempts / 15min / IP), atomic file writes.
- **Frontend**: Single HTML file (~3,400 lines), Vanilla JS, no build step.
- **Data**: Yahoo Finance unofficial API via server-side proxy, 60s cache.
- **Storage**: JSON file for users; localStorage for portfolios.
- **Deployment**: Docker, non-root user, Stripe for payments.
- **Version**: v5.1.

### Known Risks & Migration Plan

| Risk | Severity | Mitigation |
|---|---|---|
| **Yahoo unofficial API ToS** | **High / Existential at scale** | Migrate to **Polygon.io** (~$199/mo) for US + EU; **Alpaca free tier** as failover; B3 via **brapi.dev** or licensed feed |
| **Single JSON user DB** | **High** | Migrate to **SQLite** (single-binary, zero-ops) before 1k users; Postgres at 10k+ |
| **localStorage portfolio** | High data-loss risk | Move portfolio to server with optional client encryption; sync on login |
| **No email pipeline** | Blocks recovery + verification | **Resend** or **Postmark** in Sprint 2 |
| **Single-file frontend** | Dev velocity ceiling | Split into modules with esbuild; defer SPA framework migration until €500k ARR |
| **No real-time** | Acceptable for scan-on-demand product | Add SSE/WebSocket for tracked-pick alerts only — not full chart streaming |

### Scaling Considerations

The architecture is deliberately boring and cheap to operate up to ~10k paying users. The data feed cost dominates from Pro user 500 onwards; pricing has been set to absorb this. CDN-fronting the static SPA cuts origin load by >90%.

---

## 8. Product Roadmap (12-Month View)

### Q2 2026 — Sprint 1: Foundations (COMPLETE)

- Security hardening (rate limiting, scrypt, JWT)
- GDPR + LGPD (export, delete, consent banner)
- Trading Journal rename, PDF export fix
- Non-root Docker, env var cleanup

### Q3 2026 — Sprint 2: Recovery + Mobile

- Email verification + password reset (Resend)
- Mobile responsive pass (CSS-only, no rewrite)
- Brazilian onboarding: BRL display, B3 auto-suggest on signup
- Closed beta recruitment (target: 100 B3 traders)
- Public EN/PT language toggle

### Q4 2026 — Sprint 3: Soft Launch

- PT-BR YouTube launch (target: 20 videos by EOY)
- Stripe + Pix integration (BRL pricing)
- Plausible/PostHog analytics
- Polygon.io migration begins
- Soft launch to waitlist

### Q1 2027 — Scale Foundations

- SQLite migration off JSON DB
- Server-side portfolio storage
- Tracked-pick price alerts (email + push)
- Affiliate program launch
- 60-post SEO content sprint complete

### Q2 2027 — Public Launch + Distribution

- Full public launch
- Influencer seeding wave (20 creators)
- First broker partnership conversation
- Mobile PWA polish
- ES localization scoping

---

## 9. Team & Founder Context

### Current Team

**Solo founder.** Full-stack engineering, product, design, and content are all under one hat. This is sustainable through Sprint 3 and the soft launch but becomes the primary bottleneck above ~500 paying users.

### About the Founder

> [Name] is the founder of MOMENTUM. With a background spanning [engineering / finance / product], [Name] built MOMENTUM after personally hitting the wall that every self-directed retail investor hits: existing tools are either too expensive, too overwhelming, or invisible to the markets [he/she/they] actually trade. MOMENTUM is the tool [Name] wished existed — opinionated, affordable, multilingual, and respectful of the user's time. Based in [city], [Name] writes [PT-BR / EN] content on technical analysis and ships product daily.

### Hiring Sequence (Trigger-Based, Not Calendar-Based)

| Trigger | Hire | Profile |
|---|---|---|
| 200 paying users | **Part-time content lead (PT-BR)** | YouTube + SEO operator, BR-native, equity + retainer |
| 500 paying users | **Founding engineer** | Node + frontend, EU/BR timezone, equity-heavy |
| 1,000 paying users | **Customer success + community** | Bilingual PT/EN, Discord-native |
| €500k ARR | **Senior engineer + designer** | Move beyond solo+1 |
| €1M ARR | **Head of growth** | Full-funnel paid + partnerships |

---

## 10. Risk Analysis

| # | Risk | Severity | Probability | Mitigation |
|---|---|---|---|---|
| 1 | **Yahoo Finance ToS / data block** | **High** | High (12-mo) | Polygon.io migration in Q4 2026; Alpaca + brapi.dev failover; cache layer reduces calls 90% |
| 2 | **Single JSON user DB corrupts/loses data** | High | Medium | SQLite migration Q1 2027; daily atomic backups now |
| 3 | **Regulatory: framed as financial advice** | High | Low–Medium | Prominent "not financial advice" disclaimer per page; ToS with arbitration; CVM (BR) + ESMA (EU) self-review; consider tier-specific disclosures |
| 4 | **Incumbent (TradingView) ships a cheap PT-BR EM tier** | High | Medium | Ship faster; build content moat now; lock in BR creator partnerships before they pivot |
| 5 | **FX exposure (EUR pricing, BRL/USD costs)** | Medium | High (always) | Multi-currency pricing by Q3 2026; data-feed costs USD-denominated, hedge via annual prepay revenue |
| 6 | **LGPD/GDPR breach** | High | Low | Already shipped: export, delete, consent. Add: encrypted portfolio storage, breach notification process, DPA template |
| 7 | **Founder burnout (solo)** | High | Medium | Calendar-protected build/marketing split; first hire at 200 users non-negotiable; document everything in this file and CLAUDE.md |

---

## 11. Traction & Metrics to Track

### Pre-Launch (Now)

- Closed beta signups (target: 100)
- Beta NPS (target: ≥40)
- Weekly active beta users (target: ≥40% of cohort)
- Bugs / crashes per session (target: <0.1)

### 0–100 Paying Users

- Free → Pro conversion rate (target: ≥4%)
- D1 / D7 / D30 retention (target: 60% / 35% / 20%)
- Time-to-first-tracked-pick (target: <5 min)
- Organic vs. referral split (target: 60/40 organic)

### 100–1,000 Paying Users

- Monthly churn (target: <6%)
- CAC (target: <€10 blended)
- LTV/CAC (target: ≥6x)
- NPS (target: ≥50)
- PT vs. EN user split (signal of localization ROI)

### 1,000+ Paying Users

- Net revenue retention (target: ≥100%)
- Annual prepay attach rate (target: ≥25%)
- Referral coefficient (target: ≥0.4)
- Cohort gross margin (target: ≥75%)

### What Product-Market Fit Looks Like Here

- **40%+ of users say they would be "very disappointed" if MOMENTUM disappeared** (Sean Ellis test).
- Organic word-of-mouth drives ≥40% of new signups.
- Monthly churn <5% sustained over 3 months.
- Tracked-picks-per-Pro-user median ≥10 (engagement floor, not vanity).
- Unprompted user-generated content (YouTube reaction videos, X screenshots).

---

## 12. Investment & Funding Needs

### Bootstrapped Path (Default)

The product is shipped, gross margins are high, and the founder is solo. **Bootstrapping to €30k MRR is feasible** on:
- Founder living expenses covered for 18 months (~€60k personal runway)
- Operating costs <€500/mo until 500 paying users (~€18k cumulative)
- Reinvest 100% of revenue into content + first hire

### Optional Pre-Seed (€150–250k)

If a €150–250k pre-seed is raised at €1.5–2.5M post:

| Allocation | € | Purpose |
|---|---|---|
| Founder salary 18 mo | 90k | Full-time focus |
| Part-time PT-BR content lead (12 mo) | 36k | YouTube + SEO velocity |
| Polygon.io + infra (18 mo) | 6k | Data feed migration |
| Paid acquisition test | 30k | CAC discovery in BR + Iberia |
| Legal (LGPD/GDPR/ToS) | 10k | Defensibility |
| Reserve | 28k | Buffer |

The pre-seed accelerates the timeline to €1M ARR by ~9 months and de-risks Sprint 3 if Pix integration takes longer than budgeted.

---

## 13. Opus Recommendations

This section is honest, opinionated, and meant to be argued with.

### Top 3 Things to Prioritize in the Next 90 Days

1. **Migrate off Yahoo Finance.** This is the only existential risk on the board. Every day on the unofficial API is a day the entire product can be killed by a TOS-enforcement decision outside your control. Polygon.io for US/EU + brapi.dev for B3, behind the existing 60s cache, is a 1–2 week project. Do it before the soft launch.
2. **Ship the public EN/PT toggle and start the YouTube channel.** Content compounds slowly and the clock is ticking. Two videos per week starting now beats ten videos per week starting in October. Your distribution moat is built one upload at a time.
3. **Move portfolio data off localStorage.** This is a silent churn machine — every user who clears their browser loses their journal and silently leaves. SQLite + server-side portfolio is a weekend.

### What to Stop Doing

- **Stop adding indicators.** You have ten. The marginal user does not want an eleventh; they want the existing ten explained better. The Education module is higher leverage than any new indicator.
- **Stop polishing themes.** Seven themes is already over-indexed for a pre-PMF product. Lock the set, move on.
- **Stop expanding the stock universe before launch.** 124 names is enough to demonstrate the wedge. Add coverage *after* paying users tell you what's missing — that signal is worth more than your guess.

### Biggest Leverage Points

- **PT-BR YouTube.** This is the asymmetric bet. BR retail is starved for high-quality, opinionated, daily-output technical analysis content in Portuguese. The product is the call-to-action; the channel is the funnel. One breakout video can deliver 6 months of paid acquisition spend.
- **Pix recurring billing.** Stripe-card-only is leaving 30–40% of BR willing-to-pay users on the table. Pix Automático is the unlock.
- **Curation as a product.** The 124-stock universe is editorially valuable. Lean into it: "MOMENTUM Universe" as a brand, weekly admissions/exits, public methodology. This is moat-building disguised as marketing.

### What Makes This €1M ARR vs. a Side Project

A side project ships features the founder finds interesting. A €1M ARR business does the boring, compounding work:

- **Distribution discipline.** Two PT-BR videos per week for 24 months, no exceptions, no shortcuts. €1M ARR is downstream of ~50k YouTube subscribers and ~200 indexed posts.
- **Pricing courage.** €9 is right for now; an annual prepay (€90) is right for Q4. A €19 "Pro+" tier with broker integrations + alerts is right for Y2. Do not underprice the upgrade path.
- **One ruthless metric.** Pick **paying-user weekly active rate** as the north star and instrument everything against it. Not signups, not MAUs, not scan volume. PUWA is the only metric that correlates with churn, NPS, and word-of-mouth simultaneously.
- **Hire one person before you think you should.** A part-time PT-BR content lead at user 200 buys back the founder's most valuable hours and is the difference between a 3-year and a 6-year path to €1M ARR.

### Final Word

MOMENTUM has the rarest combination in early-stage SaaS: a shipped product, real users in sight, a defensible wedge (PT-BR + EM + paper-trading-first), low operating costs, and a founder with the technical depth to execute the roadmap solo. The constraints are distribution velocity and the Yahoo data dependency. Solve those two, and the rest is patient compounding.

Build the channel. Migrate the data feed. Ship Pix. Hire the content lead at 200 users. Everything else is noise.

---

*End of document. Version 1.0 — May 2026.*
