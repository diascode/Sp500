# MOMENTUM — User Stories

*Version 1.6 — May 2026*

---

## ⚡ Priority: Sprint D — Design Foundation

**Sprint D (Design) runs before all remaining sprints and defines the standard UI going forward.**
All future feature work must be implemented within the new design system established here.

See [Epic 30 — Design Foundation](#epic-30--design-foundation-sprint-d) for the full story list.

**Conflicts with existing stories:**
| Affected Story | Conflict | Resolution |
|---|---|---|
| US-45 (Epic 11 — Theme Switcher) | Lists 7 dev-aesthetic themes (Dracula, Monokai, Nord, Solarized, One Dark, Dark, Light) | **Superseded by US-128.** Replace with 4 Brazilian fintech themes: `brasil` (default), `day`, `pop`, `calmo`. |
| US-71 (Epic 19 — Mobile scroll) | Described piecemeal fixes to old layout | **Subsumed by US-126.** New mobile design covers all mobile ACs from scratch. |
| US-72 (Epic 19 — Touch targets) | Targeted 44px on existing buttons | **Subsumed by US-126.** New design's bottom nav + cards meet this by construction. |
| US-89 (Sprint 6 — Extract CSS) | Extracts the existing `<style>` block | **Ordering dependency.** Sprint D must be fully merged before US-89 runs — the extracted file must be the new design CSS. |

---

## Table of Contents

1. [Roles & Personas](#roles--personas)
2. [Epic 1 — Authentication & Account](#epic-1--authentication--account)
3. [Epic 2 — Market Scanning](#epic-2--market-scanning)
4. [Epic 3 — Stock Cards & Analysis](#epic-3--stock-cards--analysis)
5. [Epic 4 — Tracked Picks](#epic-4--tracked-picks)
6. [Epic 5 — All Stocks Browser](#epic-5--all-stocks-browser)
7. [Epic 6 — Portfolio & Trading Journal](#epic-6--portfolio--trading-journal)
8. [Epic 7 — Education Module](#epic-7--education-module)
9. [Epic 8 — Economic Calendar](#epic-8--economic-calendar)
10. [Epic 9 — Correlation Matrix](#epic-9--correlation-matrix)
11. [Epic 10 — Admin Panel](#epic-10--admin-panel)
12. [Epic 11 — Accessibility & Personalisation](#epic-11--accessibility--personalisation)
13. [Epic 12 — GDPR / LGPD Compliance](#epic-12--gdpr--lgpd-compliance)
14. [Epic 13 — Subscriptions & Billing](#epic-13--subscriptions--billing)
15. [Epic 14 — Internationalisation (Sprint 2)](#epic-14--internationalisation-sprint-2)
16. [Epic 15 — Currency Display (Sprint 2)](#epic-15--currency-display-sprint-2)
17. [Epic 16 — Email & Auth Recovery (Sprint 2)](#epic-16--email--auth-recovery-sprint-2)
18. [Epic 17 — Brazilian Onboarding (Sprint 2)](#epic-17--brazilian-onboarding-sprint-2)
19. [Epic 18 — DARF Tax Calculator (Sprint 2 Phase 1)](#epic-18--darf-tax-calculator-sprint-2-phase-1)
20. [Epic 19 — Mobile Responsiveness (Sprint 2)](#epic-19--mobile-responsiveness-sprint-2)
21. [Epic 20 — Closed Beta (Sprint 2)](#epic-20--closed-beta-sprint-2)
22. [Epic 30 — Design Foundation (Sprint D)](#epic-30--design-foundation-sprint-d)
23. [Epic 32 — Design System Migration (Sprint 12)](#epic-32--design-system-migration-sprint-12)

---

## Roles & Personas

| Role | Description |
|---|---|
| **Visitor** | Unauthenticated user; can browse landing page and limited scan results |
| **Free User** | Registered and signed in; limited to 5 stocks per market and 5 tracked picks |
| **Pro User** | Paying subscriber (€9/month); unlimited access to all features except admin |
| **Admin** | Single superuser (founder); full access plus user management panel |

---

## Epic 1 — Authentication & Account

### US-01 — Sign Up
**As a** visitor,
**I want to** create an account with my email and password,
**so that** I can save my tracked picks and access personalised features.

**Acceptance criteria:**
- Email must be unique; duplicate registration returns a clear error.
- Password must be at least 6 characters; shorter passwords are rejected with a message.
- On success the user is immediately signed in and sees their account badge in the header.
- Passwords are stored as a scrypt hash — never in plain text.

---

### US-02 — Sign In
**As a** registered user,
**I want to** sign in with my email and password,
**so that** I can access my saved picks, portfolio, and subscription features.

**Acceptance criteria:**
- Invalid credentials return "Invalid email or password" (same message for both cases — no enumeration).
- After 10 failed attempts from the same IP within 15 minutes the endpoint returns a 429 with a clear wait message.
- A valid login issues a 30-day JWT stored in localStorage.
- The header immediately reflects the user's email, tier badge, and avatar icon.

---

### US-03 — Sign Out
**As a** signed-in user,
**I want to** sign out,
**so that** my session is cleared from this device.

**Acceptance criteria:**
- Clicking "Sign Out" clears the JWT from localStorage.
- The UI reverts to the logged-out state immediately without a page reload error.
- The portfolio and tracked picks remain in localStorage (not wiped) so they are available if the user signs back in.

---

### US-04 — Change Password
**As a** signed-in user,
**I want to** change my password,
**so that** I can update my credentials if I suspect a compromise.

**Acceptance criteria:**
- Current password is required and validated before the new password is accepted.
- New password must be at least 6 characters.
- On success, the modal closes and a toast confirms the change.
- The existing JWT remains valid after a password change (no forced re-login).

---

### US-05 — Auth Form Autofill
**As a** signed-in user returning to the app,
**I want** the browser to autofill my email and password,
**so that** I don't have to type credentials every time.

**Acceptance criteria:**
- The auth form is wrapped in a `<form id="authForm">` element.
- The email input has `autocomplete="email"`.
- The password input has `autocomplete="current-password"` in sign-in mode and `autocomplete="new-password"` in sign-up mode.
- No browser "password field not in a form" console warning appears.

---

### US-06 — Session Persistence
**As a** returning user,
**I want** my session to be remembered across browser refreshes,
**so that** I don't have to sign in on every visit.

**Acceptance criteria:**
- A valid JWT in localStorage auto-authenticates the user on page load via `/api/auth/me`.
- An expired or tampered token silently clears the session and shows the signed-out state.
- Session lasts 30 days from last sign-in.

---

## Epic 2 — Market Scanning

### US-07 — Scan a Market
**As a** signed-in user,
**I want to** click SCAN to fetch live technical data for the selected market,
**so that** I can see current BUY/HOLD/SELL signals for each stock.

**Acceptance criteria:**
- Pressing SCAN triggers real-time data fetch from Yahoo Finance via the server-side proxy.
- A loading indicator is shown during the scan.
- Each card appears as its data resolves; the user does not wait for all 50 before seeing results.
- The header updates with "LAST SCAN — HH:MM:SS UTC" on completion.

---

### US-08 — Switch Market
**As a** user,
**I want to** switch between US, Europe, and Emerging Markets tabs,
**so that** I can compare opportunities across geographies.

**Acceptance criteria:**
- Switching market clears the current scan results and shows a "HIT SCAN TO BEGIN" prompt.
- The active market tab is highlighted.
- The signal filter resets to BUY on market switch.
- The stock universe count in the tab label reflects the user's tier.

---

### US-09 — Free Tier Universe Limit
**As a** free user,
**I want to** scan a sample of each market,
**so that** I can evaluate the product before subscribing.

**Acceptance criteria:**
- Free users see exactly 5 stocks per market (first 5 in the curated list).
- A Pro upsell banner is visible below the sample results.
- The upsell clearly shows what additional stocks and features are available on Pro.

---

### US-10 — Pro Signal Filter
**As a** Pro or Admin user,
**I want to** filter scan results by BUY, HOLD, SELL, or ALL,
**so that** I can focus on the signal type relevant to my current strategy.

**Acceptance criteria:**
- A filter bar appears at the top of results for Pro/Admin users only.
- Selecting a filter re-renders only matching cards without re-fetching data.
- The filter defaults to BUY on page load and resets to BUY on market switch.
- Free users do not see the filter bar; they always see only BUY signals.

---

### US-11 — Scan Results Summary
**As a** user,
**I want to** see a summary of BUY / HOLD / SELL counts after a scan,
**so that** I can quickly gauge overall market sentiment.

**Acceptance criteria:**
- The stats bar under the description card shows: UNIVERSE: N stocks, BUY SIGNALS: N, HOLD: N, SELL: N.
- Counts update immediately after the scan completes.

---

## Epic 3 — Stock Cards & Analysis

### US-12 — View Stock Card
**As a** user,
**I want to** see a detailed card for each scanned stock,
**so that** I can understand its technical condition at a glance.

**Acceptance criteria:**
- Each card shows: ticker, company name, sector, current price, 1-day price change (%), BUY/HOLD/SELL badge.
- Technical pills are shown: RSI, MACD, ADX, SMA status (bull/bear/neutral).
- Entry zone, take-profit (TP), and stop-loss (SL) bands are displayed.
- A verdict bar at the bottom summarises the composite signal.

---

### US-13 — Interactive Price Chart
**As a** user,
**I want to** view an interactive price chart with SMA overlays and Bollinger Bands,
**so that** I can visually confirm the technical setup.

**Acceptance criteria:**
- Chart renders using Canvas (no external charting library dependency).
- Period buttons (1D, 1M, 3M, 6M, 1Y, 5Y) allow zoom.
- SMA 20, 50, 200 and Bollinger Bands are toggled via buttons on the card.
- Chart updates instantly on period/overlay change without re-fetching.

---

### US-14 — News Sentiment
**As a** user,
**I want to** see recent news headlines for each stock,
**so that** I can factor in qualitative events when assessing the signal.

**Acceptance criteria:**
- Up to 5 headlines are shown per card, sourced from Yahoo Finance news.
- Each headline links to the original article (opens in a new tab).
- Publisher and time-ago labels are displayed.
- News section is collapsible to save vertical space.

---

### US-15 — Support & Resistance Levels
**As a** user,
**I want to** see computed support and resistance levels on the card,
**so that** I can identify key price zones for entry and exit.

**Acceptance criteria:**
- Support 1, Resistance 1, and Resistance 2 levels are displayed on each card.
- Values are computed server-side from OHLCV history.
- Entry zone is derived from Support 1 and ATR.

---

## Epic 4 — Tracked Picks

### US-16 — Track a Pick
**As a** signed-in user,
**I want to** add a stock to my Tracked Picks from a scan card,
**so that** I can monitor it over time with its TP/SL levels.

**Acceptance criteria:**
- Clicking "TRACK PICK" on a card adds the stock to the tracked list with the current TP and SL from the scan.
- Duplicate tracking is prevented; clicking again shows an "already tracked" message.
- Free users are limited to 5 tracked picks; attempting to add more shows an upgrade prompt.

---

### US-17 — View Tracked Picks
**As a** user,
**I want to** see all my tracked picks in a dedicated tab,
**so that** I can monitor their status at a glance.

**Acceptance criteria:**
- The TRACKED tab shows a table with: ticker, entry price, current price, TP, SL, % P&L, status badge (ACTIVE / HIT TP / HIT SL).
- An empty state with a helpful prompt is shown when no picks are tracked.
- The count of tracked picks is shown in the tab label.

---

### US-18 — Refresh Tracked Prices
**As a** user,
**I want to** refresh the current prices of all tracked picks,
**so that** I can see up-to-date P&L without running a full market scan.

**Acceptance criteria:**
- Clicking "REFRESH PRICES" re-fetches prices only for the tracked tickers.
- TP/SL hit status updates based on the refreshed price.
- A loading state is shown during the refresh.

---

### US-19 — Clear All Tracked Picks
**As a** user,
**I want to** clear all my tracked picks at once,
**so that** I can start fresh after a strategy change.

**Acceptance criteria:**
- A confirmation prompt appears before clearing.
- After confirmation, the tracked list is empty and the count resets to 0.
- Clearing does not affect portfolio positions.

---

### US-20 — Navigate Back from Tracked View
**As a** user,
**I want to** return to the scan from the Tracked Picks view,
**so that** I can quickly switch between monitoring and scanning.

**Acceptance criteria:**
- A "BACK TO SCAN" button is visible in the Tracked tab.
- Clicking it returns to the last active scan result without re-fetching.

---

## Epic 5 — All Stocks Browser

### US-21 — Browse Full Universe
**As a** user,
**I want to** see a table of all available stocks in the selected market,
**so that** I can find a specific company without running a scan.

**Acceptance criteria:**
- The ALL STOCKS tab shows a table with: ticker, company name, sector, and action buttons.
- Each row has a TRACK button and a "+ MY STOCKS" button.
- Stocks already tracked show a "✓ TRACKED" indicator.
- Stocks already in the portfolio show a "✅" badge instead of the add button.

---

### US-22 — Quick-Add to Portfolio from Browser
**As a** Pro user,
**I want to** add a stock directly to my portfolio from the All Stocks browser,
**so that** I can log a position without running a scan first.

**Acceptance criteria:**
- Clicking "+ MY STOCKS" on a row adds the stock to the portfolio at the last known scanned price.
- If no scan price is available, the user is prompted to scan the market first.
- Free users see the "+ MY STOCKS" button but are redirected to the upgrade flow on click.

---

## Epic 6 — Portfolio & Trading Journal

### US-23 — Add Portfolio Position
**As a** Pro user,
**I want to** manually log a stock position with quantity, buy price, and date,
**so that** I can track the performance of positions I've entered in my real broker.

**Acceptance criteria:**
- The "Add Position" modal has fields: ticker, quantity, buy price, buy date.
- Ticker is validated against the known universe; unknown tickers are accepted with a warning.
- Free users are limited to 3 positions; attempting to add more shows an upgrade prompt.
- Duplicate holding positions (same ticker, status = holding) are prevented.

---

### US-24 — View Portfolio Summary
**As a** Pro user,
**I want to** see a summary of my portfolio with total cost, current value, and overall P&L,
**so that** I can track my performance at a glance.

**Acceptance criteria:**
- Summary cards show: total cost basis, current value, total unrealized P&L (€ and %), total realized P&L.
- Positions are listed in a table with: ticker, qty, buy price, current price, P&L (€ and %).
- HOLDING positions are highlighted in blue; SOLD positions are greyed out.
- Current prices are sourced from the last scan; a "last updated" timestamp is shown.

---

### US-25 — Full Sell a Position
**As a** Pro user,
**I want to** record a full sale of a holding position,
**so that** the position moves to SOLD status with a realised P&L.

**Acceptance criteria:**
- Clicking SELL on a holding row opens a sell modal pre-filled with the full quantity.
- The modal has fields: shares to sell (max = current quantity), sell price, sell date.
- Preview shows: "Selling: N of N shares", realised P&L (€ and %), no "remaining holding" line.
- On confirm, the position status changes to SOLD and the row shows the sell price and sell date.

---

### US-26 — Partial Sell a Position
**As a** Pro user,
**I want to** sell only part of my holding,
**so that** I can realise some profit while keeping a remaining position.

**Acceptance criteria:**
- Entering a quantity less than the full holding in the sell modal shows a preview with: "Selling: N of M shares", "Remaining holding: (M−N) shares @ buy price", and the P&L on the sold portion.
- On confirm, the original row is updated to the remaining quantity (HOLDING), and a new SOLD row is appended for the sold portion.
- Both rows are independently visible in the portfolio table.

---

### US-27 — Sell Validation
**As a** Pro user,
**I want to** be prevented from entering an invalid sell,
**so that** data integrity is maintained.

**Acceptance criteria:**
- Quantity > current holding → error: "Cannot sell more than you hold."
- Quantity = 0 or negative → error: "Quantity must be at least 1."
- Sell price = 0 or negative → error: "Enter a valid sell price."
- None of these validation errors crash the app.

---

### US-28 — Edit a Portfolio Position
**As a** Pro user,
**I want to** edit the details of an existing position,
**so that** I can correct entry mistakes.

**Acceptance criteria:**
- Clicking EDIT opens the add-position modal pre-filled with the current values.
- Saving updates the position in place.
- Editing does not create a duplicate row.

---

### US-29 — Remove a Portfolio Position
**As a** Pro user,
**I want to** delete a position from my portfolio,
**so that** I can remove erroneous entries.

**Acceptance criteria:**
- Clicking REMOVE shows a confirmation prompt.
- After confirmation, the row is removed from the table and P&L summaries recalculate.

---

### US-30 — Monthly P&L Breakdown
**As a** Pro user,
**I want to** see my realised and unrealised P&L grouped by month,
**so that** I can understand my performance over time.

**Acceptance criteria:**
- The portfolio view shows a monthly P&L table below the position list.
- Realised gains/losses are bucketed by sell date.
- Unrealised positions are bucketed by buy date.
- A grand total row is shown for each section.

---

### US-31 — Tax Estimate
**As a** Pro user,
**I want to** see an estimated tax liability based on my realised gains and a configurable tax rate,
**so that** I can plan cash reserves for tax season.

**Acceptance criteria:**
- A tax rate input (defaulting to 30%) is shown in the Trading Journal section.
- Changing the rate recalculates the estimate immediately.
- Displayed values: realised gain/loss, tax rate, estimated tax due, net after tax.
- A prominent disclaimer states this is NOT a tax filing document.

---

### US-32 — Export Portfolio as CSV
**As a** Pro user,
**I want to** download my portfolio data as a CSV file,
**so that** I can import it into a spreadsheet for further analysis.

**Acceptance criteria:**
- Clicking CSV downloads a file with columns: Ticker, Qty, Buy Price, Sell Price, Buy Date, Sell Date, Status, P&L.
- The file is named with the current date (e.g. `portfolio-2026-05-11.csv`).

---

### US-33 — Export Portfolio as Markdown
**As a** Pro user,
**I want to** download my portfolio as a Markdown file,
**so that** I can embed it in notes, obsidian, or a personal blog.

**Acceptance criteria:**
- Clicking MD downloads a properly formatted Markdown table.
- The file includes a header with export date and total P&L summary.

---

### US-34 — Print / Save Portfolio as PDF
**As a** Pro user,
**I want to** print or save my Trading Journal as a PDF,
**so that** I can keep a physical or archived record.

**Acceptance criteria:**
- Clicking "PRINT / SAVE PDF" triggers the browser's native print dialog.
- The printed view is clean — no header controls, nav tabs, or scan UI visible.
- The disclaimer "NOT a tax filing document" is clearly visible on the printed page.

---

## Epic 7 — Education Module

### US-35 — Access Education Content
**As a** any signed-in user,
**I want to** read explanations of the technical indicators MOMENTUM uses,
**so that** I can understand why a BUY or SELL signal is generated.

**Acceptance criteria:**
- The EDUCATION tab is accessible from the navigation bar (visible for Pro/Admin by default).
- Each topic (RSI, MACD, ADX, SMA, Bollinger) has a title and a detailed body with examples.
- Content is available in both EN and PT.

---

### US-36 — Understand Scoring Logic
**As a** user reading education content,
**I want to** see exactly how MOMENTUM scores each indicator,
**so that** I can trust and interpret the composite verdict.

**Acceptance criteria:**
- Each indicator section explicitly describes its scoring contribution (e.g., "RSI 45–65 → +1 point").
- The "How MOMENTUM scores it" sub-section is present for every indicator.

---

## Epic 8 — Economic Calendar

### US-37 — View Upcoming Macro Events
**As a** user,
**I want to** see a calendar of upcoming economic events,
**so that** I can avoid holding volatile positions into major releases.

**Acceptance criteria:**
- The Economic Calendar widget on the main page shows the next 8 events.
- Each event has: date, title, and impact level (HIGH / MEDIUM badge).
- Events are sorted by date ascending.
- The calendar is generated server-side and requires no API key.

---

## Epic 9 — Correlation Matrix

### US-38 — View Correlation Between Tracked Stocks
**As a** Pro user,
**I want to** see a correlation matrix for my tracked picks,
**so that** I can understand diversification and avoid over-concentrating in correlated names.

**Acceptance criteria:**
- The Correlation section is visible only to Pro and Admin users.
- It appears after scanning at least 2 tickers from the same market.
- Positive correlations are colour-coded green; negative correlations are red.
- A legend explains "Move Together" and "Move Opposite."

---

### US-39 — Correlation Requires Scan
**As a** free user attempting to view the correlation matrix,
**I want to** see a clear locked/upgrade state,
**so that** I understand this is a Pro feature.

**Acceptance criteria:**
- Free users see a locked placeholder with a "Pro Feature" label and upgrade CTA.
- The section does not crash or show partial data for free users.

---

## Epic 10 — Admin Panel

### US-40 — View All Registered Users
**As an** admin,
**I want to** see a table of all registered users with their tier and subscription status,
**so that** I can monitor growth and manage accounts.

**Acceptance criteria:**
- The Admin Panel tab is visible only when logged in as admin.
- The table shows: ID, email, tier badge, subscription expiry, account creation date.
- Summary stats are shown: total users, free, pro, active subscriptions.

---

### US-41 — Upgrade a User to Pro
**As an** admin,
**I want to** manually upgrade a free user to Pro tier,
**so that** I can reward beta testers, influencers, and partners.

**Acceptance criteria:**
- Each free user row has a "⭐ Make Pro" button.
- Clicking it shows a confirmation dialog: "Upgrade [email] to PRO? (grants 1 year subscription)."
- On confirm, the user's tier is set to `pro` with a 1-year `subscriptionEnd`.
- The table refreshes showing the updated tier immediately.

---

### US-42 — Revoke Pro from a User
**As an** admin,
**I want to** downgrade a Pro user back to Free,
**so that** I can revoke access when a partner agreement ends.

**Acceptance criteria:**
- Each Pro user row has a "↓ Revoke Pro" button.
- Clicking it shows a confirmation: "Revoke PRO from [email] and downgrade to FREE?"
- On confirm, the user's tier is set to `free` and `subscriptionEnd` is cleared.
- The admin's own account cannot be downgraded.

---

### US-43 — Language Selector (Admin Only)
**As an** admin,
**I want to** switch the app language between EN and PT,
**so that** I can test localisation and demo the app in both languages.

**Acceptance criteria:**
- The language selector (EN/PT dropdown) is visible only when logged in as admin.
- Logged-out users and Free/Pro users do not see the selector.
- Switching language applies immediately to all visible UI strings without a page reload.

---

## Epic 11 — Accessibility & Personalisation

### US-44 — Increase Font Size
**As a** user with visual accessibility needs,
**I want to** increase the font size of the entire app,
**so that** I can read content comfortably.

**Acceptance criteria:**
- Clicking A+ increases the page zoom by a fixed step.
- Clicking A− decreases it.
- The zoom level persists across sessions via localStorage.
- The default zoom is 1.0 (100%).

---

### US-45 — Switch Theme
**As a** user,
**I want to** switch between visual themes (Dark, Light, Dracula, Monokai, Nord, Solarized, One Dark),
**so that** I can personalise the appearance of the app.

**Acceptance criteria:**
- Clicking the theme toggle button cycles through all available themes.
- The theme label in the button updates to reflect the active theme.
- The selected theme is persisted in localStorage and restored on next visit.

---

## Epic 12 — GDPR / LGPD Compliance

### US-46 — Cookie & Storage Consent Banner
**As a** first-time visitor,
**I want to** see a consent notice about how MOMENTUM uses cookies and local storage,
**so that** I understand how my data is handled before using the app.

**Acceptance criteria:**
- A banner appears at the bottom of the page on first visit.
- The banner explains that localStorage is used for session and preferences.
- A "Learn more" link shows a detailed privacy note.
- Clicking "Accept & Continue" dismisses the banner and records consent in localStorage.
- On subsequent visits, the banner is not shown.

---

### US-47 — Export My Account Data
**As a** signed-in user,
**I want to** download a copy of all data MOMENTUM holds about my account,
**so that** I can exercise my rights under GDPR and LGPD.

**Acceptance criteria:**
- "Export My Data" appears in the user dropdown menu.
- Clicking it downloads a JSON file containing: user ID, email, tier, subscription dates, export timestamp.
- The export includes a note clarifying that portfolio data is stored locally in the browser.
- The endpoint requires a valid JWT; unauthenticated requests are rejected.

---

### US-48 — Delete My Account
**As a** signed-in user,
**I want to** permanently delete my account,
**so that** all my server-side personal data is erased.

**Acceptance criteria:**
- "Delete Account" appears in the user dropdown, styled in red.
- Two confirmation dialogs appear in sequence before deletion proceeds.
- On confirmation, the server removes the user record from the database.
- The user is immediately signed out and returned to the logged-out state.
- The admin account cannot be deleted.

---

## Epic 13 — Subscriptions & Billing

### US-49 — Upgrade to Pro via Stripe
**As a** free user,
**I want to** subscribe to the Pro tier using my card,
**so that** I can unlock unlimited scanning and the full trading journal.

**Acceptance criteria:**
- Clicking "Go Pro" or "⬆ GO PRO — €9/MO" redirects to a Stripe Checkout session.
- On successful payment, the user is redirected to `/?subscription=success`.
- The user's tier is updated to `pro` via the Stripe webhook within seconds.
- The Pro upsell banner is hidden immediately after upgrade.

---

### US-50 — Manage Subscription
**As a** Pro user,
**I want to** manage or cancel my subscription,
**so that** I have full control over my billing.

**Acceptance criteria:**
- The "Go Pro" button changes to "⚙ Manage Subscription" for Pro users.
- Clicking it opens the Stripe Customer Portal.
- Cancellation via the portal triggers the `customer.subscription.deleted` webhook, which downgrades the user to Free at period end.

---

### US-51 — Subscription Expiry Enforcement
**As a** Pro user whose subscription has lapsed,
**I want** the app to gracefully downgrade my access,
**so that** I understand my tier has changed and can renew if I choose.

**Acceptance criteria:**
- On every authenticated request, the server checks whether `subscriptionEnd` is in the past.
- If expired, the user's tier is set back to `free` automatically.
- Pro-only features (portfolio, signal filter, correlation) show the upgrade prompt rather than blank or broken states.

---

### US-52 — Stripe Not Configured State
**As a** user on a self-hosted instance without Stripe keys,
**I want** the app to behave gracefully without payment functionality,
**so that** non-commercial deployments are still fully usable.

**Acceptance criteria:**
- If `STRIPE_SECRET_KEY` is not set, the checkout and portal endpoints return a 503 with "Stripe not configured."
- The rest of the app (scanning, tracking, education) functions normally.
- No uncaught errors related to Stripe appear in the server logs.

---

---

## Epic 14 — Internationalisation (Sprint 2)

### US-53 — Browser Language Auto-Detection
**As a** Brazilian user,
**I want** the app to detect my browser language and load in PT automatically,
**so that** I don't have to manually switch.

**Acceptance criteria:**
- On first load, `init()` reads `navigator.language` (e.g. `pt-BR`, `pt`).
- If the detected language starts with `pt`, `_lang` is set to `'pt'` before any UI renders.
- If no `jerry_lang` preference is stored, auto-detection applies; a stored preference always takes precedence.
- Auto-detected language is saved to localStorage so subsequent visits honour the choice.

---

### US-54 — Full UI Translation Coverage
**As a** any user,
**I want** all UI text — stock cards, portfolio table, tax report, education — to appear in my chosen language,
**so that** the experience feels native.

**Acceptance criteria:**
- `LANGS` object contains ~180 keys per language, covering all render functions.
- No visible English string appears in PT mode, and no visible PT string appears in EN mode.
- All dynamically rendered views (cards, portfolio, tracked picks, tax report, education) call `t()` for every user-facing string.
- Switching language re-renders all currently visible views without a page reload.

---

### US-55 — Auth Form Browser Autofill (PT)
**As a** PT user,
**I want** the auth form to support browser autofill for email and password,
**so that** I can sign in faster.

**Acceptance criteria:**
- The auth modal HTML wraps inputs inside a `<form id="authForm">` element.
- Email input has `autocomplete="email"`.
- Password input has `autocomplete="current-password"` in sign-in mode and `autocomplete="new-password"` in sign-up mode.
- No "password field not in a form" warning appears in the browser console.

---

## Epic 15 — Currency Display (Sprint 2)

### US-56 — R$ Symbol for B3 Stocks
**As a** Brazilian user scanning B3 stocks,
**I want** prices displayed as R$ (not $),
**so that** I can read values at a glance without confusion.

**Acceptance criteria:**
- `getCurrencySymbol(ticker)` returns `'R$'` for any ticker ending in `.SA`.
- All price strings on B3 stock cards (current price, TP, SL, entry zone) display `R$` as the prefix.
- Portfolio positions for `.SA` tickers display `R$` in the table, summary cards, and exports (CSV, MD).
- Hardcoded `$` symbols are removed from `card_tp` and `card_sl` LANGS keys.

---

### US-57 — € and £ for European Stocks
**As a** European user scanning EU stocks,
**I want** prices in € for Eurozone stocks and £ for UK stocks,
**so that** I see values in the correct currency.

**Acceptance criteria:**
- `getCurrencySymbol(ticker)` returns `'€'` for tickers ending in `.DE`, `.PA`, `.AS`, `.MC`, `.MI`, or `.BR`.
- `getCurrencySymbol(ticker)` returns `'£'` for tickers ending in `.L`.
- All ~25 price strings across the app use the result of `getCurrencySymbol()` rather than a hardcoded symbol.
- Tracked picks table shows the correct symbol per ticker in the current price and P&L columns.

---

### US-58 — Per-Position Currency Symbol in Mixed Portfolio
**As a** user with a mixed portfolio (US + BR stocks),
**I want** each position to show the correct currency symbol for that stock,
**so that** values are unambiguous across a multi-market portfolio.

**Acceptance criteria:**
- `getCurrencySymbol(ticker)` returns `'$'` for tickers with no recognised suffix.
- Portfolio table renders the correct symbol in buy price, current price, and P&L columns for every row regardless of market.
- Tax report rows show the per-ticker symbol for realised gain/loss figures.
- CSV and Markdown exports include the correct symbol in all price columns.

---

## Epic 16 — Email & Auth Recovery (Sprint 2)

### US-59 — Email Verification on Signup
**As a** new user,
**I want** to verify my email address after signup,
**so that** the platform knows I own the account.

**Acceptance criteria:**
- On signup, the server sends a verification email via Resend containing a unique time-limited link.
- The link calls `GET /api/auth/verify-email?token=<token>` and marks the account as verified.
- Unverified users see a banner prompting verification; core features (scan, track) remain accessible.
- Resending verification is available from the banner; re-send is rate-limited to once per 60 seconds.

---

### US-60 — Forgot Password Flow
**As a** user who forgot my password,
**I want** to receive a reset link by email,
**so that** I can recover access without contacting support.

**Acceptance criteria:**
- A "Forgot password?" link is visible on the sign-in form.
- Clicking it shows an email input; submitting calls `POST /api/auth/forgot-password`.
- The endpoint always responds with a neutral "If that email exists, a reset link has been sent" message — no user enumeration.
- A reset email is dispatched via Resend containing a one-time link.

---

### US-61 — Password Reset Link Expiry
**As a** user receiving a reset link,
**I want** the link to expire after 1 hour,
**so that** stale links can't be exploited.

**Acceptance criteria:**
- Reset tokens are stored server-side with a 1-hour expiry timestamp.
- `POST /api/auth/reset-password` rejects tokens older than 1 hour with a clear error message.
- A used token is immediately invalidated so it cannot be replayed.
- After a successful reset the user is redirected to sign-in with a confirmation toast.

---

## Epic 17 — Brazilian Onboarding (Sprint 2)

### US-62 — B3 Ticker Auto-Suggest
**As a** Brazilian user,
**I want** to see B3 tickers suggested (PETR4, VALE3, etc.) when I search for stocks,
**so that** I don't have to remember exact `.SA` suffixes.

**Acceptance criteria:**
- Typing a stock name or partial ticker in the scan/add field shows a dropdown of matching B3 tickers.
- Suggestions are filtered from the existing `.SA` universe and display the full company name alongside the ticker.
- Selecting a suggestion auto-fills the input with the correct Yahoo Finance ticker (e.g. `PETR4.SA`).
- The feature works without any additional API call — it filters the client-side universe list.

---

### US-63 — CPF Field in User Profile
**As a** Brazilian Pro user,
**I want** to enter my CPF in my profile,
**so that** the app can pre-fill tax documents.

**Acceptance criteria:**
- A CPF field is available in the account/profile section for Pro users.
- CPF is validated against the Brazilian 11-digit format (with check-digit verification).
- CPF is stored server-side on the user record (not in localStorage).
- CPF is included in the GDPR/LGPD data export.

---

### US-64 — BRL Display Throughout App
**As a** Brazilian user,
**I want** B3 stock prices displayed in R$ throughout the app (cards, portfolio, tracked picks),
**so that** I see prices in my native currency.

**Acceptance criteria:**
- All views that display a price for a `.SA` ticker show `R$` as the prefix.
- No `$` symbol appears next to a B3 price anywhere in the UI.
- The currency symbol updates immediately when a new scan result is rendered.
- Exported files (CSV, MD) use `R$` for B3 positions.

---

## Epic 18 — DARF Tax Calculator (Sprint 2 Phase 1)

### US-65 — Trade Type Classification
**As a** Brazilian swing trader,
**I want** the app to classify my trades as swing or day-trade so tax rates (17.5% vs 20%) are applied correctly,
**so that** my DARF calculation is accurate.

**Acceptance criteria:**
- Each portfolio position has a `tradeType` field accepting `'swing'` or `'daytrade'`.
- The add/edit position modal includes a Trade Type selector (defaulting to `'swing'`).
- Tax rate applied in `computeDARF()` is 17.5% for swing and 20% for day-trade.
- Existing positions without a `tradeType` default to `'swing'` without data migration errors.

---

### US-66 — Monthly DARF Liability Panel
**As a** Brazilian trader,
**I want** to see my monthly DARF liability (swing code 6015, day-trade code 6010) calculated automatically from my closed positions,
**so that** I know what I owe each month.

**Acceptance criteria:**
- A DARF Summary panel is visible in the Tax Report section for users with at least one `.SA` sold position.
- `computeDARF(month, year)` calculates net gain per trade type, applies the correct tax rate, and returns the amount due per DARF code.
- Loss carryforward is deducted from the current month's gain before applying the tax rate.
- If DARF due is zero or negative, the panel states "No DARF due for this period."

---

### US-67 — Loss Carryforward by Trade Type
**As a** Brazilian trader,
**I want** loss carryforward tracked separately for swing and day-trade buckets,
**so that** future profits are offset correctly.

**Acceptance criteria:**
- `darf_carry_swing` and `darf_carry_daytrade` keys are persisted in localStorage.
- A net loss in swing for month M increases `darf_carry_swing`; a net gain reduces it (not below zero).
- The same logic applies independently to `darf_carry_daytrade`.
- Carryforward balances are displayed in the DARF summary panel.

---

### US-68 — Dedo-Duro (Withholding) Display
**As a** Brazilian trader,
**I want** the DARF summary to show my dedo-duro (withholding) so I can deduct it from the DARF amount due,
**so that** I don't overpay.

**Acceptance criteria:**
- The DARF panel shows a "Dedo-duro retido" field per trade type for each month.
- Dedo-duro is entered manually by the user (0.005% of gross sale proceeds) in the position sell modal.
- The DARF amount due displayed is `(tax_rate × net_gain) − dedo_duro`, not below zero.
- The panel shows both gross DARF and net DARF after dedo-duro deduction.

---

### US-69 — R$20k Swing Exemption Flag
**As a** Brazilian trader whose monthly swing sales are under R$20k,
**I want** the app to flag that I'm exempt from swing DARF for that month,
**so that** I don't file unnecessarily.

**Acceptance criteria:**
- `computeDARF()` sums total `.SA` swing sale proceeds for the selected month.
- If total swing sales < R$ 20,000, the DARF panel shows a green "Isento — vendas abaixo de R$20.000" badge.
- The exemption applies only to swing trades; day-trade proceeds have no equivalent threshold.
- The R$20k threshold is defined as a named constant `BR_TAX.SWING_EXEMPT_THRESHOLD` for easy maintenance.

---

### US-70 — SicalcWeb Link
**As a** Brazilian trader,
**I want** a direct link to SicalcWeb pre-filled with my DARF data,
**so that** I can generate the official payment slip without leaving the workflow entirely.

**Acceptance criteria:**
- The DARF panel includes a "Gerar DARF no SicalcWeb" button per DARF code when an amount is due.
- The button opens SicalcWeb (`https://sicalc.receita.fazenda.gov.br/`) in a new tab.
- The CPF (if stored in profile) and the calculated DARF values are displayed adjacent to the link so the user can copy-paste them into the Sicalc form.
- If CPF is not set, the button is still visible but a tooltip instructs the user to add CPF to their profile.

---

## Epic 19 — Mobile Responsiveness (Sprint 2)

### US-71 — Usable Scan & Portfolio on 375px Viewport
**As a** mobile user (iPhone SE / 375px),
**I want** the scan and portfolio views to be usable on a small screen without horizontal scrolling,
**so that** I can use the app on my phone.

**Acceptance criteria:**
- No horizontal overflow occurs on a 375px viewport in the scan, portfolio, tracked picks, or education views.
- Stock cards stack vertically and fill the viewport width with comfortable padding.
- The portfolio table scrolls horizontally within a constrained container rather than causing full-page overflow.
- All changes are CSS-only — no JavaScript responsive logic or layout rewrites.

---

### US-72 — Touch-Friendly Tap Targets
**As a** mobile user,
**I want** touch-friendly tap targets (min 44px) on all primary actions (SCAN, TRACK, ADD TO PORTFOLIO),
**so that** I can interact accurately on a touchscreen.

**Acceptance criteria:**
- SCAN, TRACK PICK, and ADD TO PORTFOLIO buttons have a minimum height of 44px on mobile viewports.
- Tab navigation buttons meet the 44px minimum touch target size at 375px.
- No two primary tap targets are closer than 8px apart to prevent mis-taps.
- Tap target sizing is implemented via CSS media queries targeting `max-width: 480px`.

---

## Epic 20 — Closed Beta (Sprint 2)

### US-73 — Public EN/PT Language Toggle
**As a** visitor,
**I want** to switch between EN and PT without needing an admin account,
**so that** the language toggle is publicly accessible.

**Acceptance criteria:**
- The language selector (`<select id="langSelect">`) is visible to all users regardless of tier or auth state.
- The admin gate on `langSelect` visibility is removed from `updateAuthUI()`.
- The toggle is visible in the header on both mobile and desktop viewports.
- Switching language applies immediately to all visible UI strings without a page reload.

---

### US-74 — Language Preference Persisted Across Sessions
**As a** beta user,
**I want** the app to remember my language preference across sessions,
**so that** I don't have to re-select my language on every visit.

**Acceptance criteria:**
- Selecting a language writes `jerry_lang` to localStorage immediately.
- On page load, `init()` reads `jerry_lang` and applies the stored preference before any UI renders.
- If no preference is stored, `navigator.language` auto-detection applies (per US-53).
- Clearing localStorage resets to auto-detection behaviour, not a hardcoded default.

---

## Epic 21 — Data Source Migration (Sprint 3)

### US-75 — B3 Data via brapi.dev (Hybrid Data Source)

**As a** Brazilian Pro user scanning B3 stocks,
**I want** B3 stock data to come from an official, SLA-backed API (brapi.dev) instead of Yahoo Finance's unofficial endpoint,
**so that** the app remains stable and compliant even if Yahoo blocks the proxy.

**Background:**
Yahoo Finance's chart API is undocumented and explicitly prohibited by their Terms of Service. The server impersonates a browser User-Agent to access it, which Yahoo can block at any time — instantly breaking all B3 scans. brapi.dev provides an official REST API for all B3 tickers at approximately R$49.99/month (Startup plan). The hybrid approach keeps Yahoo Finance for US/Europe/Emerging (where no affordable alternative covers all tickers) while migrating only B3 to a compliant, reliable source.

**Acceptance criteria:**
- `server.js` routes requests for `.SA` tickers to brapi.dev (`GET /api/quote/{ticker}?range=5y&interval=1d`).
- `server.js` routes US, Europe, and Emerging tickers to Yahoo Finance (no change to those paths).
- The `.SA` suffix is stripped before calling brapi.dev (brapi uses `PETR4`, not `PETR4.SA`); the suffix is re-appended on the normalized response.
- brapi.dev `historicalDataPrice[]` is normalized to the same candle format used internally so the entire frontend is unchanged.
- `BRAPI_TOKEN` is added to `.env.example` and `docker-compose.yml` as an optional variable.
- News for B3 tickers routes to brapi.dev if `BRAPI_TOKEN` is set; falls back to Yahoo Finance search otherwise.
- The existing 60-second in-memory cache layer wraps brapi.dev calls identically to Yahoo Finance calls.
- If `BRAPI_TOKEN` is absent, the server logs a startup warning and continues using Yahoo Finance for B3 (graceful degradation).
- No frontend (stock-dashboard.html) changes are required.

**Sprint:** 3
**Estimated effort:** 1 day (server.js only)
**Monthly cost:** R$49.99 (brapi.dev Startup plan — 150,000 requests/month; current usage ~12,000/month at 10 scans/day)
**Dependencies:** brapi.dev account + `BRAPI_TOKEN`

---

## Epic 22 — Compliance & Identity (Sprint 3)

### US-76 — CPF Required at Signup

**As a** new user registering for a Momentum account,
**I want** to provide my CPF during signup,
**so that** the app can pre-fill SicalcWeb automatically and ensure LGPD compliance from the start.

**Background:**
Brazil's LGPD requires collecting only data with a stated purpose. CPF is needed for the DARF/SicalcWeb flow (US-70) and for future tax report export. Collecting it at signup avoids a secondary prompt later and ensures every account has a valid CPF on record.

**Acceptance criteria:**
- The signup form includes a CPF field with auto-mask (000.000.000-00) between the email and password fields.
- The CPF field is only visible when the form is in signup mode; it is hidden in login mode.
- Client-side validation rejects the submission if CPF is empty or fails the check-digit algorithm.
- Server-side: `POST /api/auth/signup` requires a valid CPF; returns `400` with a descriptive error if missing or invalid.
- CPF is stored on the user record at creation (same as US-63 profile update).
- The "Forgot password?" link is hidden while in signup mode.
- Existing users without a CPF are unaffected and can add it via My Profile (US-63).

**Sprint:** 3
**Estimated effort:** 2 hours (server.js + stock-dashboard.html)
**Dependencies:** US-63 (CPF validation helpers already implemented)

---

### US-77 — One Account per CPF

**As a** platform operator,
**I want** each CPF to be linked to at most one account,
**so that** users cannot create multiple accounts to bypass free-tier limits or abuse the system.

**Acceptance criteria:**
- `POST /api/auth/signup` checks whether any existing user already has the same CPF (digit-only comparison).
- If the CPF is already registered, the server returns `409` with the message `"CPF já cadastrado"`.
- The error is surfaced in the auth modal error area (same as duplicate email).
- `POST /api/auth/profile` (US-63 CPF update) also enforces uniqueness: if another account already holds that CPF, it returns `409`.
- Existing users who update their CPF via My Profile cannot steal a CPF that is already assigned to another account.

**Sprint:** 3
**Estimated effort:** 30 minutes (server.js only)
**Dependencies:** US-76

---

### US-78 — Custom Domain for Transactional Emails

**As a** user receiving password reset and verification emails,
**I want** emails to come from a verified custom domain (e.g. `noreply@momentum.app`),
**so that** messages are delivered reliably and don't land in spam.

**Background:**
Resend's `onboarding@resend.dev` test address can only guarantee delivery to the Resend account owner's inbox. All other recipients may see spam filtering or outright rejection. A verified domain unlocks full deliverability for all users.

**Acceptance criteria:**
- A custom domain is verified in the Resend dashboard.
- `RESEND_FROM_EMAIL` in `.env` / `docker-compose.yml` is updated to `Momentum <noreply@yourdomain.com>`.
- Password reset, email verification, and resend-verification emails all arrive in inbox (not spam) for external recipients.
- No code changes required — purely an ops/config task once the domain is verified.

**Sprint:** 4 (blocked on domain setup)
**Estimated effort:** 30 minutes (DNS + Resend dashboard config, zero code)
**Dependencies:** Resend account with a verified domain

---

## Epic 23 — Monetisation (Sprint 4)

### US-79 — Stripe Checkout for Pro Subscription

**As a** free-tier user,
**I want** to upgrade to Pro via Stripe Checkout,
**so that** I can access portfolio tracking, DARF calculator, and correlation features without limits.

**Acceptance criteria:**
- "Go Pro" button opens Stripe Checkout (monthly subscription).
- On success, user tier is upgraded to `pro` server-side; JWT is refreshed.
- On cancel, user lands back on the app with no change.
- Stripe webhook (`customer.subscription.deleted`) downgrades tier back to `free` when subscription lapses.
- Works for both BRL (Pix) and international cards.

**Sprint:** 4
**Estimated effort:** 1 day
**Dependencies:** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_WEBHOOK_SECRET` in env

---

## Epic 24 — Primeiros Passos: Interactive Course (Sprint 5)

### US-80 — Rename & Reposition Education Tab

**Status: ✅ Complete**
**As a** new Pro user, **I want** "Primeiros Passos" to be the first tab I see and the default landing on first login, **so that** I start learning immediately instead of facing an empty scanner.
- Button renamed to "📘 PRIMEIROS PASSOS" / "📘 FIRST STEPS" (EN/PT).
- Moved to first position in secondary nav (before TRACKED).
- First-time Pro login auto-lands on the course; `jerry_course_started` flag prevents repeat redirect on subsequent logins.
**Sprint:** 5 · **Effort:** 1h

### US-81 — Module Structure & Course Sidebar

**Status: ✅ Complete**
**As a** Pro user in Primeiros Passos, **I want** topics grouped into logical modules with a visible sidebar, **so that** I can see my learning path at a glance.
- Constant `COURSE_MODULES`: 🌱 Fundamentos (strategy, why, diversify) · 🌎 O Mercado (brazilstats, sectors, realcases) · 📊 Análise Técnica (rsi, macd, adx, sma, bb, patterns) · 🇧🇷 Impostos (darf).
- Two-column layout desktop (200px sidebar + content); mobile collapses to horizontal pill row.
- Sidebar shows module headers and topic items (○ incomplete · ✅ complete).
**Sprint:** 5 · **Effort:** 3h

### US-82 — Mark Topic as Complete / Undo

**Status: ✅ Complete**
**As a** Pro user, **I want** to mark each topic as complete, **so that** my progress is tracked and I feel a sense of accomplishment.
- "Marcar como concluído" button at bottom of each topic content panel.
- Toggle: marked → button reads "✅ Concluído — Desfazer"; click again → unmarked.
- Progress persisted in `jerry_course_progress` localStorage (JSON array of completed IDs).
**Sprint:** 5 · **Effort:** 2h

### US-83 — Progress Bar in Course Header

**Status: ✅ Complete**
**As a** Pro user, **I want** to see a progress bar showing how much of the course I've completed, **so that** I'm motivated to finish.
- Header shows `████████░░ 62% · 8/13 tópicos concluídos`.
- Updates immediately on each toggle (re-render); 0% state shows empty bar cleanly.
**Sprint:** 5 · **Effort:** 1h

### US-84 — Progress Pill on Nav Button

**Status: ✅ Complete**
**As a** Pro user, **I want** the nav button to show my progress count, **so that** I can see how far I am without opening the course.
- After first completion: button shows `📘 PRIMEIROS PASSOS 1/13` green pill.
- Pill hidden at 0 (clean first impression); `updateCourseNavBtn()` called on every toggle.
**Sprint:** 5 · **Effort:** 1h

### US-85 — "Próximo Tópico" Button

**Status: ✅ Complete**
**As a** Pro user, **I want** a "next topic" button at the bottom of each topic, **so that** I can flow through the course without clicking the sidebar.
- Shows next incomplete topic: `→ Próximo: 🌱 Estratégia`.
- Calls `switchEduTopic(nextId)` and scrolls content to top.
- Hides when all 13 topics are complete.
**Sprint:** 5 · **Effort:** 1h

### US-86 — 100% Completion Celebration

**Status: ✅ Complete**
**As a** Pro user who finishes all 13 topics, **I want** a celebration moment, **so that** the completion feels meaningful.
- `showToast(t('course_complete'), true, 6000)` when progress reaches 13.
- Progress bar replaced by `🎉 Curso concluído!` banner.
- "Recomeçar curso" link appears in header.
**Sprint:** 5 · **Effort:** 1h

### US-87 — Reset Course Progress

**Status: ✅ Complete**
**As a** Pro user, **I want** to reset my course progress, **so that** I can go through the material again.
- "Recomeçar curso" small link in header (visible only when progress > 0).
- `confirm()` dialog → clears `jerry_course_progress` and `jerry_course_started`.
**Sprint:** 5 · **Effort:** 30min

---

## Epic 25 — Code Structure: File Decomposition (Sprint 6)

**Context:** `stock-dashboard.html` is 4,424 lines (89.8% JS). Logic, markup, i18n, indicators, and styles are entangled in a single file. Phase 1 splits static assets into separate files served by the existing Node server — no build step, no new npm dependencies, native ES modules (`<script type="module">`).

### US-88 — Static File Serving in server.js
**Status: ✅ Complete**
**As a** developer, **I want** `server.js` to serve a `/static/` directory, **so that** extracted JS/CSS modules can be loaded by the browser.
- `server.js` serves `GET /static/*` from `./static/` directory with correct MIME types.
- Path traversal protection: `fpath.startsWith(DIR + path.sep)` (fixes existing vulnerability).
- Blocks direct access to `.env`, `users.json`, `.git/`, `Dockerfile` (allowlist by extension or blocklist by path prefix).
**Sprint:** 6 · **Effort:** 2h

### US-89 — Extract CSS to static/app.css
**Status: ✅ Complete**
**As a** developer, **I want** the 226-line `<style>` block in its own file, **so that** styling is separately editable and browser-cacheable.
- Move `<style>` block to `static/app.css`; replace with `<link rel="stylesheet" href="/static/app.css">`.
- Verify all 7 themes still work; no visual regression.
**Sprint:** 6 · **Effort:** 1h

### US-90 — Extract i18n to static/i18n.js
**Status: ✅ Complete**
**As a** developer, **I want** the 558-key `LANGS` object in its own file, **so that** translations can be edited without touching application logic.
- Move `LANGS` object to `static/i18n.js`; export as `window.LANGS` for backward compat.
- Load via `<script src="/static/i18n.js">` before main script.
- Verify all 279 EN + 279 PT keys load correctly; `t()` returns correct strings.
**Sprint:** 6 · **Effort:** 1h

### US-91 — Extract Indicator Math to static/indicators.js
**Status: ✅ Complete**
**As a** developer, **I want** the pure technical-indicator functions in their own file, **so that** they can be read, tested, and changed without navigating 4,000 lines.
- Move `calcSMA`, `calcRSI`, `calcMACD`, `calcADX`, `calcBB`, `calcATR`, `analyze`, `pickSignal`, `scorePatternMatch`, `buildPatternOverlay` (~500 lines, zero DOM coupling) to `static/indicators.js`.
- All functions remain on `window` (no module system change required).
- Run a full scan after extraction — all scores identical to pre-extraction.
**Sprint:** 6 · **Effort:** 2h

### US-92 — Extract FX Helpers to static/fx.js
**Status: ✅ Complete**
**As a** developer, **I want** the FX rate fetching and conversion helpers isolated, **so that** currency logic is centrally owned.
- Move `fetchFxRates`, `getFxRates`, `getCurrencySymbol`, `convertToUSD`, `renderFxBar` and related constants (`FX_CACHE_KEY`, `FX_CACHE_TTL`) to `static/fx.js`.
- Verify FX bar still updates and portfolio currency conversion still works.
**Sprint:** 6 · **Effort:** 1h

### US-93 — Extract Patterns Data to static/patterns.js
**Status: ✅ Complete**
**As a** developer, **I want** the `PATTERNS` definition array in its own file, **so that** adding or editing patterns doesn't require touching the main script.
- Move `PATTERNS` array (~200 lines) to `static/patterns.js`.
- Pattern simulator and pattern detection still work after extraction.
**Sprint:** 6 · **Effort:** 1h

---

## Epic 26 — Security Hardening (Sprint 7)

**Context:** Opus audit identified four critical security issues: (1) `.env`/`users.json`/`.git` are reachable via the static file route, leaking `JWT_SECRET`, `RESEND_API_KEY`, and all user PII; (2) path traversal protection uses `startsWith(DIR)` instead of `startsWith(DIR + sep)`; (3) JWT tokens remain valid after password change; (4) unauthenticated endpoints have no rate limiting.

### US-94 — Block Sensitive Files from Static Route
**Status: ✅ Complete**
**As an** operator, **I want** `.env`, `users.json`, `.git/`, and `Dockerfile` to be unreachable via HTTP, **so that** secrets and PII are never exposed.
- Static file handler rejects requests whose resolved path matches a blocklist: `['.env', 'users.json', '.git', 'Dockerfile', 'package.json']` or any path outside of `/static/` and known HTML files.
- `GET /.env` returns 403. `GET /data/users.json` returns 403. `GET /.git/config` returns 403.
- Existing `GET /`, `GET /legend.html`, `GET /docs.html` still work.
**Sprint:** 7 · **Effort:** 1h · **Priority:** CRITICAL

### US-95 — Fix Path Traversal in Static File Serving
**Status: ✅ Complete**
**As an** operator, **I want** the path traversal check to use `path.sep`, **so that** sibling-directory collision attacks are prevented.
- Change `fpath.startsWith(DIR)` → `fpath === DIR || fpath.startsWith(DIR + path.sep)`.
**Sprint:** 7 · **Effort:** 15min · **Priority:** CRITICAL

### US-96 — Rate Limit Unauthenticated API Endpoints
**Status: ✅ Complete**
**As an** operator, **I want** `/api/news`, `/api/calendar`, and `/api/tickers/b3` to have IP-based rate limiting, **so that** they can't be used to DoS the server or proxy-spam third parties.
- `/api/news` and `/api/calendar`: 60 requests/min per IP.
- `/api/tickers/b3`: 120 requests/min per IP (autocomplete — higher tolerance).
- Exceeding limit returns `429 Too Many Requests`.
**Sprint:** 7 · **Effort:** 2h

### US-97 — Invalidate JWT on Password Change
**Status: ✅ Complete**
**As a** user who changes their password after a suspected compromise, **I want** all existing sessions to be invalidated, **so that** an attacker with a stolen token is locked out immediately.
- Add `passwordChangedAt: ISO-string` to user record on every password change (change-password + reset-password endpoints).
- `verifyToken` rejects tokens issued before `passwordChangedAt`.
- Existing sessions (including the user's own) are invalidated; user must log in again.
**Sprint:** 7 · **Effort:** 2h

### US-98 — Add Content-Security-Policy Header
**Status: ✅ Complete**
**As an** operator, **I want** a CSP header, **so that** injected scripts from a stored XSS cannot execute.
- Add `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.resend.com https://query1.finance.yahoo.com https://brapi.dev` (once US-91 removes indicators from inline, `'unsafe-inline'` can be dropped from `script-src`).
- No visual or functional regression.
**Sprint:** 7 · **Effort:** 1h

---

## Epic 27 — Server Reliability (Sprint 8)

**Context:** Opus audit identified silent data loss paths: `loadUsers` returns `[]` on corrupt JSON (wiping the user DB on next save); `saveUsers` failure returns HTTP 200 to client; Yahoo fetch calls have no timeout (hung upstream stalls Node). No health check endpoint, no graceful shutdown, no structured logging.

### US-99 — Request Timeouts on External Fetch Calls
**Status: ✅ Complete**
**As an** operator, **I want** all Yahoo Finance and brapi.dev fetch calls to time out after 8 seconds, **so that** a hung upstream never stalls the Node event loop.
- Wrap `yahooFetch` and brapi fetch calls with `AbortController` + `setTimeout(abort, 8000)`.
- On timeout, return `null` (same as current network error path) and log `[fetch] timeout: <url>`.
**Sprint:** 8 · **Effort:** 2h

### US-100 — Health Check Endpoint
**Status: ✅ Complete**
**As an** operator, **I want** `GET /api/health` to return a structured status, **so that** Docker/load balancers can probe liveness without loading the full app.
- Returns `{ status: 'ok', uptime: seconds, users: count, version: '5.1' }`.
- No auth required. Responds in < 5ms.
**Sprint:** 8 · **Effort:** 30min

### US-101 — Graceful Shutdown on SIGTERM
**Status: ✅ Complete**
**As an** operator, **I want** the server to finish in-flight requests before exiting, **so that** Docker restarts don't drop active scans or corrupt mid-write data.
- Register `process.on('SIGTERM', ...)` to stop accepting new connections and wait up to 10s for active requests to finish before exiting.
**Sprint:** 8 · **Effort:** 1h

### US-102 — Fix loadUsers Silent Data Loss on Corrupt JSON
**Status: ✅ Complete**
**As an** operator, **I want** `loadUsers` to refuse to start rather than silently overwrite the user DB with an empty array, **so that** a corrupted `users.json` doesn't result in all users being deleted.
- If `JSON.parse` throws, log `[FATAL] users.json is corrupt — refusing to start. Restore from backup.` and call `process.exit(1)`.
- If file is missing (first run), continue with empty array as before.
**Sprint:** 8 · **Effort:** 30min · **Priority:** HIGH

### US-103 — Surface saveUsers Failures to API Callers
**Status: ✅ Complete**
**As a** user, **I want** the server to return an error when it can't persist my changes (e.g. disk full), **so that** I'm not misled into thinking my password change succeeded when it didn't.
- Wrap `saveUsers` in try/catch; if write fails, throw so the calling route handler can return `500`.
- All callers (`change-password`, `profile`, `reset-password`, `signup`, etc.) return `500` instead of `200` on save failure.
**Sprint:** 8 · **Effort:** 1h

---

## Epic 28 — Server-Side Portfolio Storage (Sprint 9)

**Context:** Portfolio data (positions, tracked picks, loss carryforward, tax rate) is 100% localStorage-only. Users lose all data on browser clear, can't use the app on a second device, and account deletion cannot honor "Right to Erasure" for portfolio data. The consent dialog at line 828 incorrectly states data is stored server-side — a LGPD/GDPR inconsistency.

### US-104 — Server-Side Portfolio Storage
**Status: ✅ Complete**
**As a** Pro user, **I want** my portfolio positions saved to the server, **so that** I don't lose them when I clear my browser or switch devices.
- `PUT /api/portfolio` — auth required; saves full portfolio JSON blob to user record.
- `GET /api/portfolio` — auth required; returns saved blob or `[]`.
- Frontend writes to both localStorage (immediate) and server (debounced 2s).
- On login, server data is authoritative; merged with local if server returns empty.
**Sprint:** 9 · **Effort:** 1 day

### US-105 — Server-Side Tracked Picks Storage
**Status: ✅ Complete**
**As a** Pro user, **I want** my tracked picks saved to the server, **so that** my watchlist persists across browsers and devices.
- `PUT /api/tracked` / `GET /api/tracked` — same pattern as US-104.
**Sprint:** 9 · **Effort:** 3h

### US-106 — Fix Consent Dialog Data Storage Claim
**Status: ✅ Complete**
**As a** user, **I want** the consent dialog to accurately describe where my data is stored, **so that** I can make an informed consent decision.
- Update consent text (line 828) to reflect actual storage (localStorage for portfolio, server for account). After US-104/105 land, update again to reflect server-side storage.
**Sprint:** 9 · **Effort:** 30min · **Priority:** HIGH (LGPD)

### US-107 — Account Deletion Removes All Portfolio Data
**Status: ✅ Complete**
**As a** user who deletes their account, **I want** all my server-side data removed, **so that** my Right to Erasure (LGPD Art. 18) is fully honored.
- `DELETE /api/auth/account` removes user row, portfolio blob, and tracked picks blob.
**Sprint:** 9 · **Effort:** 30min

---

## Epic 29 — Frontend State & Reliability (Sprint 10)

**Context:** 45 ad-hoc re-render call sites with inconsistent pairing; scan requests have no abort mechanism (stale results land on new state); scan errors are silently swallowed (`catch(() => {})`); portfolio data has no schema version (migrations are fragile one-shot code).

### US-108 — AbortController for In-Flight Scans
**Status: ✅ Complete**
**As a** user, **I want** switching markets to cancel the previous scan immediately, **so that** I don't see results from the wrong market or waste server quota.
- Store `_scanAbort = new AbortController()` before each scan; pass `signal` to each `fetchHistory` call.
- `switchMarket()` calls `_scanAbort.abort()` before starting new scan.
- Aborted fetches are silently ignored (not surfaced as errors).
**Sprint:** 10 · **Effort:** 2h

### US-109 — Surface Scan Errors to User
**Status: ✅ Complete**
**As a** user, **I want** to see a message when a scan fails, **so that** I know why I'm seeing zero results instead of assuming the market has no signals.
- Replace `catch(() => {})` in `scanMarket` with `catch(e => { if (!aborted) showToast(...) }`.
- Network error → `"Erro de rede — tente novamente"` toast.
- 429 rate limit → `"Limite de varredura atingido — aguarde"` toast with remaining time.
**Sprint:** 10 · **Effort:** 2h

### US-110 — Portfolio Schema Versioning
**Status: ✅ Complete**
**As a** developer, **I want** localStorage portfolio data to carry a schema version, **so that** future migrations are safe and detectable.
- Add `_schemaVersion: 2` to the root of saved portfolio JSON.
- `loadPortfolio` checks version; runs appropriate migration chain; saves back with new version.
- Missing `tradeType` on existing positions defaults to `'swing'` and is written back explicitly (fixes silent DARF mis-classification).
**Sprint:** 10 · **Effort:** 2h

### US-111 — Setter Pattern for Module Globals
**Status: ✅ Complete**
**As a** developer, **I want** state mutations to go through setters, **so that** re-renders are automatic and can't be forgotten.
- Create `setState(key, value)` that updates the global, calls the relevant renderer, and optionally persists.
- Migrate the 6 most-mutated globals first: `_signalFilter`, `_portfolioMonthFilter`, `_lang`, `_eduTopic`, `_taxReportMonth`, `_newsSentimentFilter`.
- Each setter replaces all direct-assignment + manual re-render call sites.
**Sprint:** 10 · **Effort:** 1 day

---

---

## Epic 30 — Design Foundation (Sprint D)

**Context:** `design_handoff_momentum_br/README.md` defines a complete mobile-first, Brazilian fintech redesign targeting 25–40-year-old Brazilians (classe C, mobile-primary, learning trading for the first time). The bundled React prototype (`design_handoff_momentum_br/`) is the pixel-close reference — port it back into the existing single-file vanilla-JS SPA (`stock-dashboard.html`) without introducing React or a build pipeline. This sprint establishes the standard design system for all future work.

**Implementation order:** tokens → AppBar → Home/Scanner → Detail → Tracked/Learn/Portfolio → Correlation/DARF → Simulator → Admin → Auth modal → Cookie banner → Mobile → generateWhy().

**Reference files:**
- `design_handoff_momentum_br/styles.css` — lift CSS nearly wholesale (strip `.phone-mock` rules)
- `design_handoff_momentum_br/components.jsx` — `FeedCard`, `StoryCard`, `ScanRing`, `Sparkline`, `SignalPill`, `Chip`
- `design_handoff_momentum_br/screens.jsx` — all screen layouts
- `design_handoff_momentum_br/data.js` — stock object shape (especially `why`, `emoji`, `flag` fields)

---

### US-112 — Design Tokens & Typography

**Status: ✅ Complete**

**As a** developer,
**I want** the CSS custom properties and font stack replaced with the new design system,
**so that** all subsequent component work inherits the correct tokens automatically.

**Acceptance criteria:**
- Google Fonts link loads Sora (400/500/600/700/800), Inter (400/500/600/700), JetBrains Mono (400/500/600).
- `:root` defines all spacing (`--s-1`–`--s-8`), radius (`--r-xs`–`--r-pill`), shadow (`--shadow-1`, `--shadow-2`), and semantic color tokens.
- `[data-theme="brasil"]` block is the default warm dark theme (money green primary, `#0c0e10` bg).
- `[data-theme="day"]` block is the light theme.
- `[data-theme="pop"]` block is the high-contrast magenta theme.
- `[data-theme="calmo"]` block is the cool dark blue theme.
- All four themes are switchable via `document.documentElement.setAttribute('data-theme', name)` and persist in localStorage.
- Type utility classes exist: `.hed1`, `.hed2`, `.hed3`, `.dek`, `.eyebrow`, `.kicker`.
- No visual reference to old dev-aesthetic token names (`dracula`, `monokai`, etc.).

**Sprint:** D · **Effort:** 3h · **Implements:** Section 1 of design_handoff_momentum_br/README.md

---

### US-113 — AppBar Redesign

**Status: ✅ Complete**

**As a** user,
**I want** the top navigation bar to reflect the new Momentum brand with the correct layout and user controls,
**so that** the app feels like a modern Brazilian fintech product from the first pixel.

**Acceptance criteria:**
- Left zone: 32×32px primary square logo ("M") + "Momentum" wordmark (Sora 700 19px).
- Center zone (desktop ≥900px only): segmented pill nav — Início / Scanner / Acompanhados / Aprender / Carteira.
- Right zone: FX mini-ticker (USD, IBOV, SELIC, desktop only) · PT/EN language toggle pill · ⚡ Varrer primary pill · "Entrar" pill (signed out) or 30px magenta avatar + tier chip (signed in).
- Signed-in user avatar click opens dropdown: email + tier · 🔑 Alterar senha · ⭐ Virar Pro (free only) · ⚙️ Painel admin (admin only) · 📥 Exportar meus dados · 🚪 Sair (red) · 🗑️ Excluir conta (red).
- AppBar is sticky, has blurred backdrop, 14px vertical padding.
- Existing `updateAuthUI()` auth-state wiring is reused — only markup and styles change.
- Existing `setLang()` is wired to the PT/EN toggle (replaces admin-only lang selector from US-43).

**Sprint:** D · **Effort:** 4h · **Implements:** Section 4 of design handoff · **Supersedes:** US-43 visibility restriction

---

### US-114 — Home Screen

**Status: ✅ Complete**

**As a** user,
**I want** the Home screen to show a personalised greeting, portfolio summary, and featured stock picks,
**so that** I can immediately see what matters on my first screen.

**Acceptance criteria:**
- Greeting row: 44px circular magenta avatar (white initial) + eyebrow date (e.g. "17 de maio · 14h32") + "Oi [Name] 👋".
- Hed1 with inline primary-colored count: "Hoje tem **5 oportunidades** de compra na sua lista."
- Dek with inline buy-colored portfolio change: "Sua carteira está **+12,4% no mês**. Bora ver o que tá rolando?"
- Balance card (`.bal-card`): primary→bg gradient, label/value/change, two CTAs ("⚡ Varrer mercado" primary + "Ver carteira" default).
- Hero StoryCard: 2-col grid — left: ticker + name + price + change + why + indicators + 2 CTAs; right: large sparkline (200px, primary stroke).
- 3-col grid of FeedCards (secondary buy signals).
- 2-col row: news column (`.news-row`) + lesson card stack (`.lesson-card`).
- Layout is max-width 1320px, padded 32px.
- FeedCard structure matches Section 3.1 of design handoff exactly (emoji logo, ticker, flag, signal pill, price, sparkline strip, "Por quê:", indicator chips, action row).

**Sprint:** D · **Effort:** 6h · **Implements:** Section 3.1 of design handoff

---

### US-115 — Scanner Screen

**Status: ✅ Complete**

**As a** user,
**I want** the Scanner screen to use the new segmented region control, filter chips, and ScanRing animation,
**so that** scanning feels fast and visually distinct from the old terminal aesthetic.

**Acceptance criteria:**
- Hed1 with green-highlighted count: "5 ações com sinal de **compra**."
- Region segmented control (`.seg`): pill-shaped, primary fill on active — Todos · 🇧🇷 BR · 🇺🇸 US · 🇪🇺 EU · 🌍 EM.
- Filter chips (Todos / Compra / Aguardar / Venda) + "⚡ Varrer agora" primary button right-aligned.
- Scan-in-progress state: 160×160 SVG ScanRing (circle animating via stroke-dashoffset, center shows % + "VARRENDO") + headline "Lendo a série de 90 dias de [TICKER]…" + progress bar. Tick 5% every 110ms (~2.2s total).
- Results: 3-col FeedCard grid.
- Existing `scanMarket()` fetch logic is unchanged — only UI shell changes.

**Sprint:** D · **Effort:** 5h · **Implements:** Section 3.2 of design handoff

---

### US-116 — Stock Detail Screen

**Status: ✅ Complete**

**As a** user,
**I want** the Stock Detail screen to clearly show the signal rationale, chart, levels, and indicators in the new layout,
**so that** I can make an informed decision quickly.

**Acceptance criteria:**
- Back link → Scanner.
- Two-row header: 56px emoji logo + ticker (44px display) + name + sector eyebrow + price (44px mono) + change pill + signal pill + "⭐ Acompanhar" + "💰 Adicionar à carteira" (primary).
- "Por que esse sinal?" card (`.card-glow`, magenta gradient border) with explanation paragraph + 3 indicator chips.
- Chart frame: range pills (1D/1S/1M/3M/6M/1A/5A) + legend chips (MM 20, MM 50, Bollinger) + existing canvas chart (styled to fill frame).
- Levels row (3 cols): `.level-tp` (buy-soft bg) · `.level-now` (bg-3) · `.level-sl` (sell-soft bg) — TP price / current price / SL price.
- Indicator grid (4 cols): RSI · MACD · ADX · Pattern — each in `.metric` card with label/value/hint.
- Learn hint card: "O que significa RSI [N]?" contextual answer + "Ler aula" CTA.

**Sprint:** D · **Effort:** 5h · **Implements:** Section 3.3 of design handoff

---

### US-117 — Tracked / Watchlist Screen

**Status: ✅ Complete**

**As a** user,
**I want** the Tracked screen to display my picks as the new FeedCard grid,
**so that** monitoring my watchlist feels consistent with the rest of the app.

**Acceptance criteria:**
- Hed1: "Sua **watchlist**."
- Empty state: 48px "📋" emoji + h3 "Nada por aqui ainda" + helper text + CTA to Scanner.
- Populated state: 2-col grid of FeedCards (same component as Home/Scanner).
- Existing tracked picks data (localStorage + server) is unchanged — only presentation changes.
- Count badge on nav item updates correctly.

**Sprint:** D · **Effort:** 2h · **Implements:** Section 3.4 of design handoff

---

### US-118 — Learn / Education Screen

**Status: ✅ Complete**

**As a** user,
**I want** the Learn screen to use the new lesson card layout with the onboarding hero,
**so that** the education section invites beginners rather than overwhelming them.

**Acceptance criteria:**
- Hed1: "Trade não é sorte — é **leitura**."
- Onboarding hero card (`.onboard-hero`, primary→magenta gradient): "Comece com R$ 100 simulados." + dek + "Fazer tour guiado →" CTA. White text on gradient bg.
- 2-col grid of `.lesson-card` covering 6 lessons: 📊 RSI · 🔀 MACD · 💪 ADX · 🎯 Take Profit/SL · 📉 Bollinger · 💸 Quanto investir. Each: 44px rounded emoji icon (primary-tinted bg) + title (Sora 700 17px) + body excerpt + meta row (lesson #, read time, level chip).
- Existing education content rendered by existing `renderEducation()` is retained; only the shell and card markup change.

**Sprint:** D · **Effort:** 3h · **Implements:** Section 3.5 of design handoff

---

### US-119 — Portfolio Screen

**Status: ✅ Complete**

**As a** Pro user,
**I want** the Portfolio screen to lead with big stat cards and a clean table layout,
**so that** my position summary is scannable at a glance.

**Acceptance criteria:**
- Hed1 with sign-colored %: "Você tá **+24,8%** em 3 posições." (color = buy/sell depending on sign).
- Three `.big-stat` cards: Valor total · Custo de entrada · Lucro/prejuízo.
- Positions table as a flush card (no per-row cards): cols — emoji logo · ticker + entry price · Preço atual · Valor · Dias · P&L %.
- Tax tip card with magenta "Pro · R$ 9/mês" CTA → DARF screen.
- R$ currency symbol used for all BRL positions (per US-56).
- All existing sell, edit, remove flows are preserved — only markup/styles change.

**Sprint:** D · **Effort:** 4h · **Implements:** Section 3.6 of design handoff

---

### US-120 — Correlation Screen (Pro Paywall + Matrix)

**Status: ✅ Complete**

**As a** Pro user,
**I want** the Correlation screen to show the paywall for free users and the full heatmap for Pro/Admin,
**so that** the feature gate is clear and the Pro experience is visually compelling.

**Acceptance criteria:**
- Free users: `.pro-lock` card — 64px circular star icon (magenta bg) + h2 "Matriz de correlação é Pro" + body + feature list (✓ items with primary check) + "⭐ Virar Pro — R$ 9/mês" magenta CTA.
- Pro/Admin users: 6×6 correlation heatmap. Cells colored by value using `color-mix` from sell-red → bg-3 → buy-green. Below: insight card explaining one strong correlation pair in plain language.
- Existing correlation calculation logic is unchanged.

**Sprint:** D · **Effort:** 3h · **Implements:** Section 3.7 of design handoff

---

### US-121 — DARF / IR Screen (Pro Paywall + Table)

**Status: ✅ Complete**

**As a** Brazilian Pro user,
**I want** the DARF screen to present the paywall clearly and, when unlocked, show my tax liability with all required context,
**so that** filing DARF is straightforward.

**Acceptance criteria:**
- Free users: same `.pro-lock` pattern as US-120 with DARF-specific copy.
- Pro/Admin users: Hed1 with magenta-colored R$ value: "Você tem **R$ 47,80** de imposto a pagar."
- Three stat cards + table of taxable operations.
- Yellow warning card explaining the R$20k isenção rule (US-69).
- CSV / PDF / "Gerar DARF →" buttons (existing logic retained).
- Existing `computeDARF()` output is wired to the new screen shell.

**Sprint:** D · **Effort:** 4h · **Implements:** Section 3.8 of design handoff

---

### US-122 — Simulator Screen

**Status: ✅ Complete**

**As a** any user,
**I want** a Simulator screen where I can pick an amount and a stock to see best/expected/worst-case scenarios,
**so that** I can understand potential outcomes before investing real money.

**Acceptance criteria:**
- New nav item "Simulador" accessible from the user menu or a CTA on the Home screen.
- Left card: amount pills (R$ 100 / 250 / 500 / 1000 / 2500, `.amount-pill`, primary fill on active, mono font) + ticker pills from the current scan results.
- Three scenario boxes (`.level-tp` / `.level-now` / `.level-sl`): each shows qty purchased, gain/no-change/loss in R$.
- Plain-language summary paragraph below the scenarios.
- Right aside (`.card-glow`): a trading tip + CTA linking to the selected stock's detail view.
- Calculation is purely client-side from current price + TP + SL values.

**Sprint:** D · **Effort:** 4h · **Implements:** Section 3.9 of design handoff · **New screen (no prior story)**

---

### US-123 — Admin Panel Restyle

**Status: ✅ Complete**

**As an** admin,
**I want** the Admin panel to use the new design language,
**so that** the management interface matches the rest of the app.

**Acceptance criteria:**
- Hed1 with user count + "ativos hoje" subtitle.
- Four `.big-stat` cards: total users · Pro conversion % · MRR (R$) · trades this week.
- Flush card with grid header + user rows: email · plan chip · joined · trades · edit link.
- All existing admin actions (make Pro, revoke Pro) remain wired — only layout and styles change.

**Sprint:** D · **Effort:** 2h · **Implements:** Section 3.10 of design handoff

---

### US-124 — Auth Modal Redesign

**Status: ✅ Complete**

**As a** visitor or returning user,
**I want** the sign-in / sign-up modal to use the new friendly layout,
**so that** first impressions match the Brazilian fintech target aesthetic.

**Acceptance criteria:**
- Modal: 440px max-width, 32px padding, radius 28px, backdrop blur.
- Brand mark (32×32 "M" square) + "Momentum" wordmark at top.
- Hed2: "Bem-vindo de volta 👋" (sign-in) or "Cria sua conta grátis" (sign-up).
- Two inputs (`.input`): email + password, with correct `autocomplete` attributes (US-55).
- Primary CTA full-width.
- Toggle link to switch between sign-in / sign-up.
- Footer in mono: "Simulador educacional · Não é recomendação de investimento."
- Existing auth endpoints, JWT storage, and error display are unchanged.

**Sprint:** D · **Effort:** 2h · **Implements:** Section 3.11 of design handoff

---

### US-125 — LGPD Cookie Banner

**Status: ✅ Complete**

**As a** first-time visitor,
**I want** to see a LGPD-compliant cookie consent banner,
**so that** I understand how the app uses browser storage before proceeding.

**Acceptance criteria:**
- Fixed-bottom glass banner on first visit: 🍪 icon + LGPD text + "Aceitar e continuar" primary button.
- Dismissing the banner writes `momentum_consent=1` to localStorage; banner does not appear on subsequent visits.
- Banner is accessible via keyboard (focusable button, dismiss on Enter/Space).
- Updates the consent dialog text per US-106 conflict note (storage is localStorage for portfolio; server for account).

**Sprint:** D · **Effort:** 1h · **Implements:** Section 3.12 of design handoff · **Updates:** US-106 consent copy

---

### US-126 — Mobile Bottom Nav & Responsive Breakpoints

**Status: ✅ Complete**

**As a** mobile user,
**I want** a bottom navigation bar and correctly stacked layouts under 720px,
**so that** the app is fully usable on any phone without horizontal scrolling or tiny tap targets.

**Acceptance criteria:**
- Under 720px: AppBar collapses (segmented nav hides, FX ticker hides, user button shows avatar only).
- Sticky bottom nav appears (`.bn`, fixed bottom, 5 items: Início / Scanner / Watch / Aulas / Carteira); body gets `padding-bottom: 70px`.
- Cards and grids collapse to single column under 600px.
- hed1 scales to 38px, hed2 to 28px, dek to 15px on mobile.
- All primary tap targets (scan, track, add to portfolio, bottom nav items) meet 44px minimum height.
- No horizontal overflow at 375px viewport in any screen.
- Implementation is CSS-only (no JS responsive logic).

**Sprint:** D · **Effort:** 4h · **Implements:** Section 5 of design handoff · **Supersedes:** US-71 + US-72

---

### US-127 — generateWhy() Server Function

**Status: ✅ Complete**

**As a** beginner user,
**I want** each stock card to explain its signal in plain Portuguese,
**so that** I understand *why* MOMENTUM recommends buying, holding, or selling.

**Acceptance criteria:**
- `server.js` exports a `generateWhy(stock)` function that templates the most salient indicator into PT-BR prose.
- Logic: if RSI < 35 → "RSI em [N], indicando ativo sobrevendido e possível reversão."; if RSI > 70 → "RSI em [N], ativo sobrecomprado — sinal de cautela."; if MACD positive + ADX > 25 → "MACD positivo com tendência forte (ADX [N])."; if named pattern → "Padrão [pattern] identificado nos últimos 90 dias." Combine salient indicators into one or two sentences.
- `why` string is attached to each stock object returned by `/api/scan` and `/api/history`.
- `why` field is shown in FeedCard's "Por quê:" paragraph and in the Detail screen's signal rationale card.
- English fallback: if `lang=en`, template uses English prose (same logic, different strings).

**Sprint:** D · **Effort:** 3h · **Implements:** Section 7 + 8 of design handoff · **New feature (no prior story)**

---

### US-128 — Replace Legacy Themes with Four New Themes

**Status: ✅ Complete**

**As a** user,
**I want** the theme switcher to offer the four new Brazilian fintech themes,
**so that** the visual options match the audience and product direction.

**Acceptance criteria:**
- `brasil` (warm dark, money green) is the default theme on first visit.
- `day` (light), `pop` (magenta high-contrast), `calmo` (cool dark blue) are the three alternatives.
- Theme toggle cycles `brasil → day → pop → calmo → brasil` and displays the current theme name.
- Selected theme is persisted in localStorage and restored on next visit.
- Old themes (`dracula`, `monokai`, `nord`, `solarized`, `onedark`, and generic `dark`/`light`) are removed from the CSS and the toggle loop.
- No visual regression on any of the four new themes for all screens implemented in Sprint D.

**Sprint:** D · **Effort:** 1h · **Implements:** Section 1 (colors) of design handoff · **Supersedes:** US-45

---

---

## Epic 31 — UI Polish & Brasil Focus (Sprint 11)

**Context:** User feedback from live session: (1) the legacy market-tabs bar shows 9 items at once causing horizontal scroll and visual noise; (2) US and Emerging markets are not relevant for the target audience (Brazilian retail investors); (3) the "Scanner" nav-pill duplicates the scan button already on Início; (4) the market-tabs bar stays visible when the user navigates to non-scanner views; (5) the 📘 emoji on Primeiros Passos nav looks cluttered; (6) the Calendário Econômico lives in a legacy sidebar card that doesn't match the design system; (7) the candlestick chart is ~330px wide on desktop instead of filling the card; (8) the profile dropdown overflows the viewport horizontally; (9) general padding/margin inconsistencies throughout.

### US-129 — Remove US and Emerging Markets (Brasil Focus)
**Status: ✅ Complete**
**As a** Brazilian investor, **I want** the app to show only Brasil (B3) and Europe markets, **so that** the interface stays focused on what's relevant to me.
- Remove `🇺🇸 US` and `🌍 Emerging` buttons from the market-tabs bar.
- Remove US and Emerging region-filter buttons from the scan-header segmented control.
- Default market remains `'brasil'`. If `state.market` is `'us'` or `'emerging'` on load (legacy localStorage), reset to `'brasil'`.
- Server-side: keep UNIVERSES.us and UNIVERSES.emerging data (don't delete), but the UI never exposes them.
**Sprint:** 11 · **Effort:** 1h · **Priority:** HIGH

### US-130 — Remove Scanner Nav Pill from Top Nav
**Status: ✅ Complete**
**As a** user, **I want** the top nav to not have a redundant "Scanner" button, **so that** navigation is clean and unambiguous.
- Remove `<button class="nav-pill" … data-view="scan">Scanner</button>` from the AppBar nav.
- Scan is initiated via the scan button on Início — no second entry point needed.
- No functionality is lost; `scanAll()` remains callable from Início.
**Sprint:** 11 · **Effort:** 15min

### US-131 — Hide Market-Tabs Bar When Not on Scanner View
**Status: ✅ Complete**
**As a** user, **I want** the market-tabs row to disappear when I navigate to Acompanhados, Carteira, Primeiros Passos, or Simular, **so that** I don't see irrelevant market buttons while I'm in a different section.
- `showTrackedView()`, `showPortfolioView()`, `showEducationView()`, `showSimulatorView()` each call `document.getElementById('marketTabs').style.display = 'none'`.
- `switchMarket()` (Início) restores `marketTabs` to `display: 'flex'`.
- The user-dropdown menu closes automatically (`display: 'none'`) whenever any nav-pill or market-tab is clicked.
**Sprint:** 11 · **Effort:** 1h

### US-132 — Remove Emoji from Primeiros Passos Nav Button
**Status: ✅ Complete**
**As a** user, **I want** the Primeiros Passos nav button to show only text (with the progress pill), **so that** the nav bar looks consistent with the other text-only pills.
- Remove the `📘` emoji from the nav-pill label in the HTML and from `updateCourseNavBtn()`.
- Progress pill `<span class="course-nav-pill">N/13</span>` is kept when progress > 0.
- Result: `PRIMEIROS PASSOS` or `PRIMEIROS PASSOS 3/13`.
**Sprint:** 11 · **Effort:** 15min

### US-133 — Fix Candlestick Chart Width in Detail View
**Status: ✅ Complete**
**As a** user, **I want** the candlestick chart to fill the full width of the detail card on desktop, **so that** I can actually read the price action without squinting.
- Add CSS: `.chart-container canvas { width: 100%; height: 320px; display: block; }`.
- The existing `drawChart()` already reads `rect.width || canvas.offsetWidth || canvas.parentElement?.offsetWidth || 800` — once the CSS sets the width, the chart renders correctly.
- Verify on desktop (≥900px) and mobile (375px); chart should be full-width on both.
**Sprint:** 11 · **Effort:** 30min · **Priority:** HIGH

### US-134 — Fix Profile Dropdown Viewport Overflow
**Status: ✅ Complete**
**As a** user on a narrower viewport, **I want** the profile dropdown to stay within the screen, **so that** I don't have to scroll right to see "Sair" or "Exportar dados".
- Change `.user-dropdown` CSS: add `max-width: min(280px, calc(100vw - 32px))` and `right: 0; left: auto`.
- On mobile (< 480px), pin the dropdown to `right: var(--s-3)` relative to the viewport using `position: fixed` with `top` derived from the AppBar height.
**Sprint:** 11 · **Effort:** 30min

### US-135 — Revamp Calendário Econômico into Design-System Card
**Status: ✅ Complete**
**As a** user, **I want** the economic calendar to look like the rest of the app and appear in a natural position on Início, **so that** it doesn't feel like a legacy sidebar afterthought.
- Move `#calendarContent` out of `#legacySidebar` and into the Início view, rendered as a `.card` section between the market pulse news and the stock grid.
- Restyle each event row: date chip (`eyebrow` typography), event name (`dek`), impact dot (green/yellow/red for low/medium/high).
- Remove the `legacySidebar` wrapper and the old `side-card` CSS class from this element.
- Calendar still loads via `loadCalendar()` on init; no server changes needed.
**Sprint:** 11 · **Effort:** 2h

### US-136 — Global Padding & Margin Audit
**Status: ✅ Complete**
**As a** user, **I want** consistent spacing between all cards and sections, **so that** the app feels polished and intentional.
- Audit and fix: card gaps in the scanner results grid, detail view inner padding, nav-pill spacing, market-tabs padding, and the gap between AppBar and page content.
- All spacing uses design-token values (`--s-*`) — no magic pixel values.
- Verify on desktop (1280px), tablet (768px), and mobile (375px).
**Sprint:** 11 · **Effort:** 2h

---

## Epic 32 — Design System Migration (Sprint 12)

**Goal:** Eliminate all legacy CSS variables (`--bg-card`, `--border`, `--text-dim`, `--green-bull`, `--red-bear`, `--text-primary`, `--bg-term`, `--accent-amber`) from the codebase and replace every affected view with the Sprint D design tokens. 180 occurrences were found in the audit. Views most affected: Carteira position table, Diário de Operações, Pro upgrade modal, legacy sidebar.

---

### US-137 — Carteira Position Table Redesign
**Status: ✅ Complete**

**As a** investor, **I want** the Carteira (portfolio) table to feel visually consistent with the rest of the app, **so that** it is easy to read and does not look broken against the current dark/light themes.

**Problem:** `renderPortfolioView()` builds a 15-column dense HTML `<table>` that uses `var(--bg-card)`, `var(--border)`, `var(--text-dim)`, `var(--green-bull)`, `var(--red-bear)`, `var(--accent-amber)`, and `var(--text-primary)`. These variables are undefined in the Sprint D design system, so the table renders with incorrect colours — rows merge into the background, gains/losses are invisible.

**Acceptance Criteria:**
- Replace all 7 legacy variables inside `renderPortfolioView()` with their Sprint D equivalents:
  - `var(--bg-card)` → `var(--bg-2)`
  - `var(--border)` → `var(--line)`
  - `var(--text-dim)` → `var(--ink-3)`
  - `var(--green-bull)` → `var(--buy)`
  - `var(--red-bear)` → `var(--sell)`
  - `var(--accent-amber)` → `var(--primary)` (or `var(--warn)` if defined, else `#f59e0b`)
  - `var(--text-primary)` → `var(--ink)`
- Table uses `font-family: var(--font-mono)` for numeric columns (quantity, price, P&L).
- Alternating row background uses `var(--bg-2)` / `var(--bg)` — no hardcoded hex.
- Positive P&L cells: `color: var(--buy)`, negative: `color: var(--sell)`.
- Column headers use `var(--ink-3)` and `font-size: var(--font-xs)`.
- Table is horizontally scrollable on mobile (375px) without breaking layout.
- All four themes (brasil / day / pop / calmo) render correctly.
- No regression in portfolio totals or action buttons (Vender, Histórico).
**Sprint:** 12 · **Effort:** 3h

---

### US-138 — Diário de Operações (Tax Report) Redesign
**Status: ✅ Complete**

**As a** investor, **I want** the Diário de Operações / DARF report to use the same visual design as the rest of the app, **so that** it looks professional and is easy to read.

**Problem:** `generateTaxReport()` wraps the report in the new shell (`.card`, `.hed2`) but all internal rows, headers, and badges still reference `var(--bg-card)`, `var(--border)`, `var(--text-dim)`, `var(--text-primary)`, `var(--green-bull)`, `var(--red-bear)`. Column headers mix English labels (e.g., "Avg Cost") with Portuguese copy. Button styles use old classes.

**Acceptance Criteria:**
- Apply the same variable mapping as US-137 to all legacy vars inside `generateTaxReport()`.
- All column headers are in Portuguese (e.g., "Custo Médio", "Preço de Venda", "Resultado", "IR Devido").
- Month-section headings use `.hed3` + `var(--ink)`.
- "Lucro" rows: `color: var(--buy)`, "Prejuízo" rows: `color: var(--sell)`.
- DARF due-amount chip uses `var(--primary)` background with `var(--ink)` text.
- "Exportar CSV" and "Imprimir" buttons use `.btn-primary` / `.btn-ghost` classes.
- Empty state (no operations) shows an illustrated empty state card using `.kicker` + `var(--ink-3)`.
- All four themes render correctly.
**Sprint:** 12 · **Effort:** 3h

---

### US-139 — Pro Upgrade Modal — Design System Migration
**Status: ✅ Complete**

**As a** free-tier user, **I want** the upgrade prompt to look polished and on-brand, **so that** it builds trust before I enter payment details.

**Problem:** The Pro upgrade modal (static HTML block, lines ~142–154) uses `var(--bg-card)`, `var(--border)`, `var(--text-dim)`, `var(--text-primary)` throughout. On Sprint D themes the modal background is transparent / wrong colour.

**Acceptance Criteria:**
- Replace all legacy variables in the upgrade modal HTML with Sprint D equivalents (same mapping as US-137).
- Modal backdrop: `rgba(0,0,0,0.6)`.
- Modal card: `background: var(--bg-2)`, `border: 1px solid var(--line)`, `border-radius: var(--r-xl)`.
- Title uses `.hed2`, subtitle uses `.kicker` with `color: var(--ink-3)`.
- Feature list bullets use `color: var(--buy)` for the checkmark icon.
- CTA button "Assinar Pro" uses `.btn-primary` with full-width on mobile.
- "Cancelar" link uses `color: var(--ink-3)`, `text-decoration: underline`.
- Modal is dismissible via Escape key and backdrop click.
**Sprint:** 12 · **Effort:** 1.5h

---

### US-140 — Legacy Sidebar & Settings Panel — Design System Migration
**Status: ✅ Complete**

**As a** user, **I want** the sidebar and settings panel to use the current design system, **so that** they don't feel out of place compared to the rest of the app.

**Problem:** The legacy sidebar HTML (lines ~163–173) and settings/profile panel use `var(--text-dim)` throughout for labels, separators, and icons. Some items have hardcoded `background: #1e1e1e` and `border: 1px solid #333`.

**Acceptance Criteria:**
- Replace `var(--text-dim)` → `var(--ink-3)` in sidebar and settings panel.
- Remove all hardcoded hex colours — use design tokens only.
- Sidebar background: `var(--bg-2)`, separator lines: `1px solid var(--line)`.
- Active item highlight: `background: var(--primary)` at 15% opacity, `color: var(--primary)`.
- Avatar/profile icon area uses `var(--bg-2)` background with `var(--line)` border.
- Tier badge ("Pro", "Free") uses `.kicker` class with `background: var(--primary)` / `var(--bg-2)`.
**Sprint:** 12 · **Effort:** 1.5h

---

### US-141 — Global CSS Token Migration (Full Sweep)
**Status: ✅ Complete**

**As a** developer, **I want** zero legacy CSS variable references remaining in the codebase, **so that** all four Sprint D themes render correctly everywhere and future design changes only require updating token values.

**Problem:** After US-137–140 address the four largest problem areas, ~80–100 legacy variable references will still exist scattered across: `renderTrackedPicks()` fallback cards, `renderSimulator()` edge cases, `renderNews()` date chips, the correlation matrix table, and various inline `style=` attributes throughout the HTML.

**Acceptance Criteria:**
- Run a full `grep` for all 8 legacy variable names in `stock-dashboard.html`; count must be 0 after this story.
  - `var(--bg-card)`, `var(--border)`, `var(--text-dim)`, `var(--green-bull)`, `var(--red-bear)`, `var(--text-primary)`, `var(--bg-term)`, `var(--accent-amber)`
- Each replacement follows the canonical mapping:
  - `--bg-card` → `--bg-2`
  - `--border` → `--line`
  - `--text-dim` → `--ink-3`
  - `--green-bull` → `--buy`
  - `--red-bear` → `--sell`
  - `--text-primary` → `--ink`
  - `--bg-term` → `--bg`
  - `--accent-amber` → `--primary`
- All four themes (brasil / day / pop / calmo) pass a visual smoke-test: no transparent backgrounds, no invisible text, no missing borders.
- `renderTrackedPicks()` fallback card uses `.card` wrapper and `.hed3` / `.kicker` typography.
- Correlation matrix: header row `background: var(--bg-2)`, cell borders `1px solid var(--line)`.
- `renderNews()` date chips: `color: var(--ink-3)`, `background: var(--bg-2)`.
- No hardcoded hex or RGB colour values remain in generated HTML strings (except SVG icon paths and theme-definition blocks).
**Sprint:** 12 · **Effort:** 4h

---

### US-142 — Calendário Econômico — Full View Revamp
**Status: ✅ Complete**

**As a** trader, **I want** the economic calendar to be visually consistent with the app's current design and placed logically in the navigation, **so that** I can quickly scan upcoming events without switching context.

**Problem (from user audit):** The calendar is placed at the very bottom of the page (not in the navigation flow), its event cards use old CSS variables, column headers and impact labels are not localised to Portuguese, and the layout does not match the card/grid system used elsewhere.

**Acceptance Criteria:**
- Move the calendar to a dedicated nav section accessible from the bottom nav bar (mobile) or the left nav (desktop) — it must not require scrolling past all other content.
- Event cards use `.card` wrapper: `background: var(--bg-2)`, `border: 1px solid var(--line)`, `border-radius: var(--r-lg)`.
- Impact indicator:
  - Alto (🔴): `color: var(--sell)` dot
  - Médio (🟡): `color: var(--primary)` dot
  - Baixo (⚪): `color: var(--ink-3)` dot
- Date-group headers use `.hed3` + `var(--ink)`.
- Event name uses `var(--ink)`, country flag is displayed as emoji.
- Forecast / Previous / Actual columns: monospace font (`var(--font-mono)`), aligned right.
- "Actual vs Forecast" delta: green (`var(--buy)`) if better-than-expected, red (`var(--sell)`) if worse.
- Filter pill row (All / Alto / Médio / Baixo) uses the standard `.pill` component.
- Mobile: single-column stacked layout; desktop: table-style grid.
- No legacy CSS variable references in calendar rendering code.
**Sprint:** 12 · **Effort:** 3h

---

## Epic 33 — Início View Modes & Admin Access (Sprint 13)

**Goal:** Give users three distinct home views to choose from on the Início screen, and ensure admin accounts bypass all Pro gates without any upgrade prompts.

---

### US-143 — Admin Bypasses All Pro Gates
**Status: ✅ Complete**
**As an** admin, **I want** to access every feature without any upgrade prompt or Pro gate, **so that** I can test and demonstrate all functionality.

**Acceptance Criteria:**
- `isPro` helper returns `true` for `tier === 'admin'` everywhere (already true in most places — audit and fix any remaining `tier === 'pro'`-only checks).
- The "Padrões" and "Simular" tab buttons in the market-tabs bar show for both `pro` **and** `admin` (currently admin-only at lines 408–410).
- `showSimulateView()` and `showEducationView()` admit admin without a gate (already done — confirm).
- No upgrade modal, no `pro-lock` card, no "Virar Pro" CTA is shown to admin.
- Portfolio position limit (max 3) does not apply to admin.
**Sprint:** 13 · **Effort:** 30min

---

### US-144 — Início Home View Mode Switcher
**Status: ✅ Complete**
**As a** user, **I want** to choose what I see on the Início screen — scan signals, all stocks list, or candlestick patterns — **so that** the home screen shows the information most relevant to what I'm doing right now.

**Acceptance Criteria:**
- A segmented control appears in the scan-header area with three options: `⚡ Sinais` (default), `📋 Lista`, `🕯 Padrões`.
- Selecting a mode updates `state.homeMode` (new state key) and re-renders the home content area.
- The selected mode is persisted in `localStorage` under `'momentum_home_mode'` and restored on page load.
- Switching mode does NOT trigger a scan — it only changes the display.
- On mobile, the segmented control wraps or stacks cleanly.
- `renderDashboard()` dispatches to the correct renderer based on `state.homeMode`.
**Sprint:** 13 · **Effort:** 1h

---

### US-145 — Lista de Ações (All Stocks Table on Início)
**Status: ✅ Complete**
**As a** user, **I want** to see all B3 stocks in a clean table on the home screen, **so that** I can browse the full universe without going to a separate view.

**Acceptance Criteria:**
- When `state.homeMode === 'lista'`, `renderDashboard()` renders a sortable table of all B3 stocks using `state.universeCache['brasil']`.
- Table columns: Ticker, Nome, Setor, Preço atual, Variação %, Sinal (buy/hold/sell badge).
- Layout mirrors the Carteira positions table: `.card-flush` + `.tracked-table` with `--font-mono` numbers.
- Ticker column is clickable — opens the stock detail view (`openStockDetail()`).
- "Sinal" column shows only if the stock has been scanned (from `state.analyzed['brasil']`); otherwise shows `—`.
- Variação % uses `var(--buy)` for positive, `var(--sell)` for negative.
- Table is sorted by ticker name by default; clicking column headers re-sorts.
- A search/filter input above the table filters by ticker or name in real time.
- Shows stock count: "X de Y ações".
**Sprint:** 13 · **Effort:** 2.5h

---

### US-146 — Padrões de Candle (Pattern Finder on Início)
**Status: ✅ Complete**
**As a** user, **I want** to see the candlestick pattern scanner directly on the home screen, **so that** I don't have to navigate to a separate tab to find pattern matches.

**Acceptance Criteria:**
- When `state.homeMode === 'padroes'`, `renderDashboard()` calls `renderPatternFinder()` inline (no separate navigation step).
- No Pro/login gate — any user who can see the home screen can browse pattern results.
- The "← Voltar" back button inside `renderPatternFinder()` is replaced by switching `state.homeMode` back to `'sinais'` and re-rendering.
- Direction filter (Todos / Alta / Baixa / Neutro) works the same as in the current standalone view.
- Prompts the user to run a scan first if no data is available yet.
**Sprint:** 13 · **Effort:** 1h

---

---

## Epic 34 — Mobile UX & Open Access (Sprint 14)

**Goal:** Fix mobile usability pain points, remove all Pro paywalls so every feature is available to free users, add an admin-controlled feature-flag panel so tier restrictions can be toggled without code changes, and clean up redundant Pro-upgrade UI elements.

---

### US-147 — Mobile Period Buttons: Size & Active State
**As a** mobile user,
**I want** chart period buttons (1D / 1M / 3M / 6M / 1A / 5A) to be large enough to tap and clearly show which period is active,
**so that** I can switch timeframes without squinting or mis-tapping.

**Acceptance Criteria:**
- `.chart-period-btn` minimum height is `36px`, font-size `13px`, padding `6px 14px` on all screen sizes.
- Active period button (`.active-period`) uses `background: var(--primary)`, `color: var(--primary-ink)`, `border-color: var(--primary)` — visually distinct from inactive buttons at a glance.
- The same styles apply to simulator pattern-view period buttons (those currently use `font-size:8px;padding:3px 6px` inline — remove those inline overrides and use the class).
- On screens ≤ 480 px the buttons wrap naturally without horizontal scroll.

**Sprint:** 14 · **Effort:** 1h

---

### US-148 — Mobile Segmented Controls & Touch Targets
**As a** mobile user,
**I want** all segmented controls (home mode, region filter, signal filter) to have comfortable touch targets and a clear active highlight,
**so that** I can navigate the app confidently on a phone screen.

**Acceptance Criteria:**
- `.seg-btn` minimum height is `36px` on all screens; on ≤ 480 px, font-size is at least `13px`.
- Active `.seg-btn` uses `background: var(--primary)`, `color: var(--primary-ink)` — same pattern as period buttons so the language is consistent throughout the app.
- Market-tabs `.btn.active-market` already uses this pattern; verify and align so all active states look identical.
- Scan-header controls stack vertically on screens ≤ 600 px with full-width "⚡ Varrer agora" button.

**Sprint:** 14 · **Effort:** 1h

---

### US-149 — All Features Free (Remove Hard Pro Gates)
**As a** free user,
**I want** access to all app features without hitting paywalls,
**so that** I can use the full product during the open-access phase.

**Acceptance Criteria:**
- Correlation matrix is always shown (remove `correlationProLock` element and the isPro show/hide logic).
- Pattern Finder nav button (🔍 PADRÕES in market tabs) is always visible regardless of tier.
- Simulator nav button (Simular in top nav) is always visible regardless of tier.
- The portfolio add-position limit (currently 3 for free users) is removed.
- The tracked-picks soft limit (currently 5 for free) is removed from the UI gate — feature flags (US-150) now control limits, not hard-coded tier checks.
- `proUpsell` banner is permanently hidden and its HTML removed.
- `goProBtn` ("⭐ Virar Pro") is removed from the user dropdown.

**Sprint:** 14 · **Effort:** 2h

---

### US-150 — Admin Feature-Flag Panel
**As an** admin,
**I want** a feature-flag control panel inside the admin view,
**so that** I can enable or disable specific features per tier without touching code.

**Acceptance Criteria:**
- Admin panel has a new "⚙️ Feature Flags" section rendered as a table: rows = features, columns = Free / Pro.
- Each cell is a toggle (checkbox or switch) that the admin can flip.
- Feature list (minimum): Correlation Matrix, Pattern Finder, Simulator, DARF Report, Portfolio, Tracked Picks.
- Flags are persisted server-side in `data/feature-flags.json` via a `POST /api/admin/feature-flags` endpoint (admin-only, JWT-gated).
- On app load, flags are fetched from `GET /api/feature-flags` (public endpoint, returns current state).
- A helper `featureEnabled(featureKey)` function is used everywhere a feature is gated, replacing direct tier checks.
- Default state for all flags is **enabled for all tiers** (open access, consistent with US-149).

**Sprint:** 14 · **Effort:** 4h

---

### US-151 — Remove Pro Upgrade Badges from UI
**As a** user,
**I want** the UI to be free of "Pro · R$ 9/mês" upgrade prompts,
**so that** the interface feels clean and uncluttered during the open-access phase.

**Acceptance Criteria:**
- The "Pro · R$ 9/mês" button on the Relatório de IR (DARF) card in the portfolio view is removed.
- The `correlationProLock` div (shows upgrade CTA when correlation is locked) is removed entirely.
- The `proUpsell` banner HTML block is deleted (not just hidden).
- Any remaining `onclick="upgradeToPro()"` buttons visible to non-admin users are removed.
- The `upgradeToPro()` JS function is kept (admin may still need to manually promote users) but no longer triggered from visible UI.

**Sprint:** 14 · **Effort:** 1h

---

### US-152 — Lista: Quick Track & Portfolio Actions
**As a** user browsing the Lista view,
**I want** to track a stock or add it to my portfolio directly from the list row,
**so that** I don't have to open the detail modal for a simple action.

**Acceptance Criteria:**
- Each Lista row has two compact action buttons at the far right: **+ Rastrear** and **+ Carteira**.
- **+ Rastrear**: toggles tracking for the stock. If already tracked, shows "✓ Rastreado" in muted style. Clicking again un-tracks. Respects feature-flag limits (US-150).
- **+ Carteira**: opens the existing add-to-portfolio modal pre-filled with the ticker. Uses the same flow as the stock detail modal.
- Action buttons do not trigger `openStockDetailByTicker()` — they use `event.stopPropagation()`.
- On screens ≤ 480 px, buttons collapse to icon-only (⭐ and 📊) to keep the table scannable.

**Sprint:** 14 · **Effort:** 2h

---

## Epic 35 — Qualidade & Português Completo (Sprint 15)

> Corrigir regressões visuais no mobile, completar a tradução para português em toda a UI, melhorar as views de Acompanhados e Lista, e garantir acesso irrestrito ao DARF.

---

### US-153 — Mobile Layout: Conteúdo Cortado e Bottom Nav Incorreto
**As a** usuário em smartphone,
**I want** que toda a interface caiba na tela sem cortes e que o bottom nav exiba os itens corretos,
**so that** eu possa navegar e ler conteúdo sem scrollar horizontalmente.

**Acceptance Criteria:**
- Nenhum elemento é cortado à direita em viewport de 375 px (iPhone SE / padrão).
- Bottom nav exibe exatamente: Início · Rastrear · Simular · Aulas · Carteira — "Varrer" não aparece.
- A seção de Aulas (Educação) não transborda horizontalmente; textos longos fazem wrap dentro do padding seguro.
- `max-width: 100%; overflow-x: hidden;` aplicado em `.shell`, `.edu-section` e containers-pai relevantes.
- Testado com Playwright em 375 × 812 px — zero scroll horizontal detectado.

**Sprint:** 15 · **Effort:** 2h

---

### US-154 — Tradução Completa: Remover Todo Texto em Inglês
**As a** usuário brasileiro,
**I want** que 100 % do texto visível ao usuário esteja em português,
**so that** a experiência seja totalmente nativa sem termos estranhos.

**Acceptance Criteria (lista exaustiva dos strings pendentes):**
- Status bar (rodapé): `SCAN: IDLE` → `VARREDURA: AGUARDANDO`; `MARKET:` → `MERCADO:`; `DATA: READY` → `DADOS: PRONTOS`.
- Footer versão: `MOMENTUM · v5.0 · live from market data` → `MOMENTUM · v5.0 · dados ao vivo do mercado`.
- Aviso paper trading: todo o parágrafo em inglês (`⚠ PAPER TRADING — EDUCATIONAL PURPOSES ONLY. MOMENTUM is a technical analysis simulator…`) traduzido para português.
- Aviso da carteira: `⚠️ NOT a tax filing document. P&L figures are personal estimates…` traduzido integralmente.
- Cabeçalhos da tabela de carteira: `#`, `TICKER`, `QTD` (já PT), `BUY PRICE` → `COMPRA`, `CURRENT/SELL` → `ATUAL/VENDA`, `COST BASIS` → `CUSTO`, `VALUE NOW` → `VALOR ATUAL`, `P&L %`, `P&L $`, `SITUAÇÃO` (já PT), `TRADE TYPE` → `TIPO`, `MONTH PROFIT` → `LUCRO MÊS`.
- Resumo da carteira: `COST BASIS:` → `CUSTO TOTAL:`, `VALUE NOW:` → `VALOR ATUAL:`, `P&L:`, `TOTAL REALIZED:` → `REALIZADO:`, `TOTAL UNREALIZED:` → `NÃO REALIZADO:`.
- Label `ADD POSITION` → `ADICIONAR POSIÇÃO`.
- Label `ECONOMIC CALENDAR` → `CALENDÁRIO ECONÔMICO`.
- Seção Aulas (Educação): todos os títulos, parágrafos e seções do conteúdo de educação traduzidos (`YOUR STRATEGY` → `SUA ESTRATÉGIA`, `Building Your Investment Strategy` → `Construindo Sua Estratégia de Investimento`, todos os parágrafos de corpo de texto).
- `title="Remove"` → `title="Remover"` nos botões de carteira.
- Qualquer `alert()` remanescente em inglês substituído por `showToast()` em português.

**Sprint:** 15 · **Effort:** 3h

---

### US-155 — Lista: Substituir "Portfolio Manager" por "Adicionar à Carteira"
**As a** usuário na view Lista,
**I want** adicionar um ativo diretamente à minha carteira sem sair da lista,
**so that** o fluxo seja rápido e sem fricção.

**Acceptance Criteria:**
- O botão "Portfolio Manager" (ou equivalente em inglês) é removido da view Lista.
- Cada linha da Lista tem um botão compacto **"+ Carteira"** na coluna de ações.
- Clicar em "+ Carteira" abre o modal de adicionar posição pré-preenchido com o ticker da linha.
- O botão usa `event.stopPropagation()` — não abre o detalhe do ativo.
- Em ≤ 480 px o botão colapsa para ícone `📊` sem texto.

**Sprint:** 15 · **Effort:** 2h

---

### US-156 — Lista: Corrigir Botão "Adicionar à Lista" (Rastrear)
**As a** usuário na view Lista,
**I want** que clicar no ícone de estrela/rastrear realmente adicione o ativo à minha lista de Acompanhados,
**so that** eu possa monitorar ações de interesse sem abrir o modal de detalhe.

**Acceptance Criteria:**
- O botão de estrela (⭐) em cada linha da Lista chama `toggleTracked(ticker)` (ou equivalente) corretamente.
- Após clicar, o estado visual muda imediatamente (estrela preenchida se rastreado, contornada se não).
- O ativo aparece na view Rastrear/Acompanhados sem necessidade de reload.
- O bug onde o click não tinha efeito (evento não propagado / função não conectada) está corrigido e coberto por teste manual em desktop e mobile.

**Sprint:** 15 · **Effort:** 1h

---

### US-157 — DARF: Remover Pro Gate Remanescente do Card de Relatório
**As a** usuário free,
**I want** acessar o Relatório de IR (DARF) diretamente pelo card na view Carteira,
**so that** eu possa gerar e exportar meu relatório sem ser bloqueado por paywall.

**Acceptance Criteria:**
- O card "Relatório de IR (DARF)" na view Carteira não exibe badge "Pro · R$ 9/mês" nem CTA de upgrade.
- Clicar no card abre a seção DARF (`showDarfSection()` ou equivalente) para qualquer usuário logado.
- Qualquer verificação de tier (`authUser.tier !== 'pro'`) que bloqueia o DARF é removida.
- O botão de download CSV do DARF funciona e gera arquivo com dados em português.
- Testado como usuário free: card visível, clicável, relatório gerado sem erro.

**Sprint:** 15 · **Effort:** 1h

---

### US-158 — Botão "Varrer" Global no Appbar (Acessível de Qualquer View)
**As a** usuário,
**I want** acionar a varredura de mercado de qualquer tela,
**so that** eu não precise navegar até a view Sinais para iniciar uma nova varredura.

**Acceptance Criteria:**
- O botão "⚡ Varrer" é exibido permanentemente no appbar (row 1, lado direito, antes do menu do usuário) em desktop e tablet.
- Em mobile, o botão aparece como ícone `⚡` sem texto no appbar para não sobrepor o nome da marca.
- Clicar no botão chama `scanAll()` independentemente da view ativa.
- O botão "Varrer agora" que existia apenas dentro de Sinais é removido ou mantido como atalho secundário — não é a única rota.
- Estado visual: enquanto varrendo, botão exibe `⟳ Varrendo...` e fica desabilitado; ao terminar, volta para `⚡ Varrer`.

**Sprint:** 15 · **Effort:** 2h

---

### US-159 — Suprimir Mensagens de Erro 502 Durante Varredura
**As a** usuário,
**I want** que erros temporários de rede durante a varredura não exibam mensagens de erro vermelhas na tela,
**so that** a experiência de varredura seja limpa mesmo quando alguns tickers falham.

**Acceptance Criteria:**
- Erros 502/503/timeout em `/api/history/:ticker` são capturados silenciosamente — o ticker é ignorado sem exibir toast ou alerta.
- O progresso da varredura continua normalmente para os demais tickers.
- Um contador discreto no status bar mostra `X tickers ignorados` apenas ao final (não em tempo real).
- Nenhum `console.error` de rede aparece como mensagem visível ao usuário.
- Se **todos** os tickers falharem, exibe um toast único: `Varredura falhou — verifique sua conexão.`

**Sprint:** 15 · **Effort:** 1h

---

### US-160 — Acompanhados: View de Lista com Totais e Potencial de Lucro
**As a** usuário na view Rastrear/Acompanhados,
**I want** ver meus ativos rastreados como uma lista estruturada com preço atual, sinal e potencial de lucro,
**so that** eu tenha uma visão consolidada do meu watchlist sem precisar abrir cada ativo individualmente.

**Acceptance Criteria:**
- A view Acompanhados exibe uma tabela/lista com colunas: Ticker · Nome · Preço · Sinal · RSI · Alvo (TP) · Potencial % · Ação.
- Rodapé da lista exibe totais: quantidade de ativos rastreados, quantos estão em sinal de compra, e o potencial médio de valorização dos sinais de compra.
- Cada linha tem botão "Ver detalhe" que abre o modal de detalhe do ativo.
- Botão de remover (✕) remove o ativo dos Acompanhados com confirmação visual (toast, não `confirm()`).
- Se a lista estiver vazia, exibe estado vazio: `Você ainda não acompanha nenhum ativo. Explore os Sinais e clique ⭐ para adicionar.`
- Layout responsivo: em ≤ 480 px, colunas Alvo e Potencial % são ocultadas para caber em tela.

**Sprint:** 15 · **Effort:** 3h

---

### US-161 — Restaurar Botão "Primeiros Passos" na View Início
**As a** usuário novo,
**I want** ver o botão "Primeiros Passos" na tela inicial,
**so that** eu possa acessar rapidamente o curso introdutório de investimentos.

**Acceptance Criteria:**
- O botão "Primeiros Passos" (ou card de entrada para o curso) está visível na view Início para todos os usuários.
- Clicar navega para a view de Educação (`showEducationView()`), abrindo diretamente o módulo introdutório.
- O botão é exibido tanto em desktop quanto em mobile (375 px).
- O botão não some após login — persiste independentemente do estado de autenticação.
- Posicionamento: abaixo do hero/scan-header, antes do grid de sinais, em destaque visual consistente com o design system.

**Sprint:** 15 · **Effort:** 1h

---

---

## Epic 36 — Watchlist P&L, Lista Redesign & DARF Fix (Sprint 16)

> Completar o acompanhamento de performance pessoal: P&L por ativo na watchlist, Lista com sinais técnicos e ações inline funcionando, e relatório DARF acessível de verdade.

---

### US-162 — Acompanhados: Colunas de P&L por Posição
**As a** usuário que acompanha ações,
**I want** ver o preço em que adicionei o ativo à watchlist, o preço atual e meu P&L (% e R$),
**so that** eu possa saber se minhas teses de acompanhamento estão funcionando sem precisar abrir o detalhe de cada ativo.

**Acceptance Criteria:**
- A tabela de Acompanhados exibe as seguintes colunas: `#` · `TICKER` · `PREÇO ENTRADA` · `PREÇO ATUAL` · `P&L %` · `P&L R$` · `SINAL` · `RSI` · `ALVO (TP)` · `POTENCIAL` · (remover).
- `PREÇO ENTRADA` = o preço (`price`) registrado no momento em que o usuário adicionou o ativo à watchlist. Se não foi salvo, exibe `—`.
- `PREÇO ATUAL` = preço live do ativo (após varredura) ou `—` se não varrido.
- `P&L %` = `(preço atual − preço entrada) / preço entrada × 100`, exibido em verde se positivo, vermelho se negativo. Exibe `—` se preço de entrada ausente.
- `P&L R$` = `(preço atual − preço entrada) × quantidade implícita de 1 ação` (watchlist não tem quantidade). Exibe variação absoluta por ação.
- O preço no momento do rastreamento é salvo em `pick.addedPrice` quando `trackPickFromBtn` ou `listaTrack` é chamado.
- A barra de totais no topo inclui `P&L MÉDIO %` dos ativos com preço de entrada registrado.
- Em ≤ 480 px, colunas `P&L R$` e `ALVO (TP)` são ocultadas para manter a tabela legível.

**Sprint:** 16 · **Effort:** 2h

---

### US-163 — Lista: Remover VAR %, Adicionar Sinais, Corrigir Ações Inline
**As a** usuário na view Lista,
**I want** ver sinais técnicos (RSI, MACD, Sinal) em vez de apenas variação percentual, e poder adicionar/remover da watchlist e adicionar à carteira diretamente na linha,
**so that** a Lista seja uma tela de triagem completa, não apenas um catálogo de preços.

**Acceptance Criteria:**

**Colunas:**
- Remover coluna `VAR %` da Lista.
- Adicionar coluna `RSI` (valor numérico, ex: `54.2`, com cor: verde se < 40, vermelho se > 70, neutro caso contrário).
- Manter coluna `SINAL` com badges de Compra/Aguardar/Venda.
- Ordem final de colunas: `TICKER` · `NOME` · `SETOR` · `PREÇO` · `RSI` · `SINAL` · (ações).

**Botões de ação (coluna final):**
- **⭐ / ✓**: botão de watchlist — adiciona ou remove o ativo dos Acompanhados. Estado visual imediato (⭐ = não rastreado, ✓ verde = rastreado). Chama `listaTrack()` corretamente com `event.stopPropagation()`.
- **📊**: botão de carteira — abre o modal de adicionar posição pré-preenchido com ticker e preço atual. Usa `openPortfolioModal(ticker, price)`. Não há mais botão "PORTFOLIO MANAGER" na Lista.
- Ambos os botões têm `event.stopPropagation()` para não abrir o detalhe do ativo acidentalmente.
- O bug em que clicar em ⭐ não tinha efeito (evento não propagado ou `listaTrack` não chamado) é corrigido e verificado manualmente.

**Em ≤ 480 px:** coluna SETOR é ocultada; botões colapsam para ícones apenas.

**Sprint:** 16 · **Effort:** 2h

---

### US-164 — DARF: Corrigir Link "Ver Relatório" e Acesso à Seção
**As a** usuário com posições vendidas na Carteira,
**I want** que o clique em "Ver relatório" no card DARF efetivamente me leve à seção de cálculo de impostos,
**so that** eu possa visualizar e exportar meu DARF sem precisar rolar manualmente a página.

**Acceptance Criteria:**
- Clicar no card "Relatório de IR (DARF)" na view Carteira exibe a seção DARF (cálculo de imposto) na mesma tela, seja por scroll suave até `#darfAnchor` ou por expansão condicional da seção.
- O elemento `#darfAnchor` existe e está posicionado ANTES do bloco de cálculo do DARF (swing + daytrade). A âncora foi confirmada como presente no DOM renderizado (não só no HTML estático).
- Se o usuário não tem posições vendidas (a seção DARF não é renderizada), o card mostra uma mensagem explicativa: `"Registre uma venda na sua carteira para gerar o relatório DARF."` em vez de fingir que o relatório existe.
- O scroll funciona em desktop e mobile (iOS Safari smooth-scroll fallback se necessário).
- Testado manualmente: usuário com pelo menos 1 posição vendida clica no card → página rola e a seção DARF fica visível.

**Sprint:** 16 · **Effort:** 1h

---

---

## Epic 37 — Simular, Primeiros Passos & Mobile Profile (Sprint 17)

> Melhorar a qualidade do Simular com filtragem inteligente, restaurar o acesso a Primeiros Passos no desktop, expandir o conteúdo educacional com renda fixa e juros compostos, e corrigir o perfil do usuário no mobile.

---

### US-165 — Simular: Filtrar Apenas Ações com Sinal de Compra ou Neutro
**As a** usuário na view Simular (Pattern Finder),
**I want** que a lista de ativos disponíveis para simulação mostre apenas ações com sinal de Compra ou Aguardar,
**so that** eu não perca tempo simulando padrões em ativos já em tendência de venda.

**Acceptance Criteria:**
- O seletor de ativos no Simular exibe apenas ações cujo `signal` é `'buy'` ou `'neutral'` (exclui `'sell'`).
- Se nenhum ativo varrido tiver sinal compra/neutro, exibe mensagem: `"Nenhum ativo elegível — execute uma varredura ou aguarde sinais de compra/neutro."`.
- A filtragem ocorre sobre `state.analyzed[state.market]`; se o array estiver vazio, o seletor mantém o comportamento atual (todos os ativos do universo).
- A ordem no seletor é: sinais de Compra primeiro, depois Neutro, ambos ordenados por RSI crescente (RSI mais baixo = mais interessante para compra).
- Não há um toggle para ver ativos de Venda — o foco do Simular é exclusivamente em oportunidades de entrada.

**Sprint:** 17 · **Effort:** 1h

---

### US-166 — Simular: Nota Explicativa dos Critérios Usados
**As a** usuário no Simular,
**I want** ver uma nota clara explicando quais critérios o Simular usa para encontrar e classificar padrões gráficos,
**so that** eu entenda a lógica por trás das sugestões e use a ferramenta com mais confiança.

**Acceptance Criteria:**
- Uma nota fixa aparece no topo da view Simular, abaixo do título e acima do seletor de ativos.
- Conteúdo da nota (em português):
  - Indica que o Simular usa dados da última varredura.
  - Lista os critérios de seleção: sinal técnico (Compra ou Aguardar), RSI, MACD e ADX.
  - Explica o score de correspondência de padrão (quanto maior, mais próximo o ativo está do padrão histórico).
  - Inclui aviso: `"Padrões gráficos são indicadores, não garantias. Use sempre Stop de Proteção."`.
- A nota usa estilo de card discreto (`card` com texto em `var(--ink-3)`, sem cor de destaque).
- A nota não aparece quando não há dados de varredura (o aviso de "execute uma varredura" já cobre esse caso).

**Sprint:** 17 · **Effort:** 1h

---

### US-167 — Primeiros Passos: Mover para Nav ao Lado de Carteira
**As a** usuário em desktop e mobile,
**I want** acessar Primeiros Passos pelo menu de navegação principal, ao lado de Carteira,
**so that** o curso seja uma destino de primeiro nível — não um botão secundário enterrado na tela Início.

**Acceptance Criteria:**
- **Desktop (appbar-row2):** o nav pill `📘 Primeiros Passos` é adicionado após `Carteira` na barra de navegação superior. Ordem final: Início · Acompanhados · Simular · Carteira · Primeiros Passos.
- **Mobile (bottom-nav):** o item `📘 Aulas` já existente continua apontando para `showEducationView()` — nenhuma mudança necessária no bottom nav.
- O botão `📘 Primeiros Passos` que foi adicionado ao `#sinaisControls` (scan-header) em US-161/US-167 anterior é **removido** dali para evitar duplicação.
- `data-view="learn"` é usado no nav pill para que o estado ativo seja sincronizado com os demais itens de nav.
- Clicar no pill chama `showEducationView()`.
- Testado em 1280 × 800 px: pill visível na row 2 do appbar, ativo quando a view de educação está aberta.

**Sprint:** 17 · **Effort:** 30min

---

### US-168 — Primeiros Passos: Módulo Tesouro Direto
**As a** investidor iniciante,
**I want** aprender sobre Tesouro Direto dentro do app,
**so that** eu entenda a alternativa mais segura de renda fixa antes de arriscar em ações.

**Acceptance Criteria:**
- Um novo tópico `tesouro` é adicionado ao menu lateral de Primeiros Passos.
- Conteúdo mínimo do módulo (em português, tom acessível como os demais módulos do curso):
  - O que é o Tesouro Direto e por que existe (dívida do governo federal).
  - Tipos principais: Tesouro Selic, Tesouro IPCA+, Tesouro Prefixado — diferenças práticas.
  - Como funciona a marcação a mercado (por que o preço oscila mesmo sendo "renda fixa").
  - Tributação: tabela regressiva de IR (22,5% → 15%) e o IOF nos primeiros 30 dias.
  - Quando faz sentido usar Tesouro vs. ações.
  - Exemplo numérico: R$ 10.000 em Tesouro Selic por 2 anos vs. poupança vs. IPCA+.
- O módulo tem um botão "Marcar como concluído" com persistência em `localStorage`.
- Total de tópicos do curso atualizado (contador `X/N` no botão do menu).

**Sprint:** 17 · **Effort:** 2h

---

### US-169 — Primeiros Passos: Módulo LCI e LCA
**As a** investidor iniciante,
**I want** entender o que são LCI e LCA e por que elas são isentas de IR,
**so that** eu saiba quando elas são mais vantajosas que CDBs ou Tesouro Direto.

**Acceptance Criteria:**
- Um novo tópico `lci_lca` é adicionado ao menu de Primeiros Passos.
- Conteúdo mínimo (em português):
  - O que são LCI (Letra de Crédito Imobiliário) e LCA (Letra de Crédito do Agronegócio).
  - Por que são isentas de IR para pessoa física (e o limite de isenção anual).
  - Cobertura pelo FGC (Fundo Garantidor de Créditos) até R$ 250.000 por instituição.
  - Comparação prática: LCI de 88% CDI isenta vs. CDB de 110% CDI tributado — quem ganha?
  - Liquidez: a maioria tem prazo mínimo (carência) — diferença de Tesouro Selic.
  - Riscos: concentração em banco emissor, liquidez restrita antes do vencimento.
  - Quando LCI/LCA faz sentido: investidor em faixa de IR alta e horizonte ≥ 90 dias.
- Botão "Marcar como concluído" com persistência.

**Sprint:** 17 · **Effort:** 2h

---

### US-170 — Primeiros Passos: Módulo Poder dos Juros Compostos
**As a** investidor iniciante,
**I want** entender visualmente o poder dos juros compostos ao longo do tempo,
**so that** eu me motive a começar a investir cedo e a manter consistência.

**Acceptance Criteria:**
- Um novo tópico `juros_compostos` é adicionado ao menu de Primeiros Passos.
- Conteúdo mínimo (em português):
  - Diferença entre juros simples e compostos com exemplo numérico lado a lado.
  - Fórmula `M = C × (1 + i)^t` explicada em linguagem acessível.
  - Tabela de crescimento de R$ 1.000 a 12% a.a. em 5, 10, 20 e 30 anos.
  - O efeito do aporte mensal: R$ 200/mês por 20 anos a 12% a.a. — quanto vira?
  - Comparação: começar aos 20 vs. aos 30 vs. aos 40 — mesmo aporte, diferença astronômica.
  - A "regra dos 72": tempo para dobrar o capital = 72 / taxa anual.
  - Aviso: a taxa de 12% a.a. é plausível na bolsa brasileira historicamente, mas não garantida.
- Botão "Marcar como concluído" com persistência.

**Sprint:** 17 · **Effort:** 2h

---

### US-171 — Mobile: Perfil do Usuário Visível no Appbar
**As a** usuário logado em smartphone,
**I want** ver meu avatar/iniciais e menu de perfil no appbar,
**so that** eu saiba que estou logado e possa acessar configurações de conta sem precisar ir ao desktop.

**Acceptance Criteria:**
- O `#userMenu` (avatar + dropdown) é visível no appbar em viewport ≤ 720 px.
- O avatar exibe a inicial do e-mail do usuário (ex: `T` para `tupa@gmail.com`).
- Tapping no avatar abre o dropdown com as opções: Alterar senha, Exportar dados, Sair, Excluir conta.
- O dropdown é posicionado abaixo do avatar e não ultrapassa a borda direita da tela.
- O `#signInBtn` ("Entrar") permanece visível em mobile quando o usuário não está logado.
- Testado em viewport 375 × 812 px: avatar presente, clicável, dropdown abre corretamente.
- O `#tierChip` (badge Free/Pro/Admin) pode ficar oculto em mobile para economizar espaço — somente o avatar é obrigatório.

**Sprint:** 17 · **Effort:** 1h

---

### US-172 — Remover Botão "Varrer agora" da Tela Início
**As a** usuário na tela Início,
**I want** que o botão "⚡ Varrer agora" não apareça mais nos controles do scan-header,
**so that** a interface fique mais limpa e o acesso à varredura fique centralizado no botão `⚡ Varrer` fixo do appbar.

**Acceptance Criteria:**
- O botão `⚡ Varrer agora` dentro do `#sinaisControls` é removido do HTML.
- O botão `⚡ Varrer` no appbar (appbar-row1, sempre visível após login) é o único ponto de entrada para varredura.
- Os chips de filtro (Compra / Aguardar / Venda / Todos) permanecem visíveis no `#sinaisControls` pois são controles de exibição, não de ação.
- Nenhuma regressão: `scanAll()` continua funcionando pelo botão do appbar.

**Sprint:** 17 · **Effort:** 15min

---

---

## Epic 38 — Sprint 18: Lista Interatividade (Acompanhar + Carteira)

### US-173 — Corrigir Botão Acompanhar na Lista (Bug: função inexistente)
**As a** usuário na view Lista,
**I want** que o botão ⭐/✓ de cada linha funcione corretamente para adicionar ou remover a ação dos Acompanhados,
**so that** posso montar minha watchlist diretamente da Lista sem abrir o detalhe da ação.

**Root Cause:**
A função `listaTrack()` chama `trackPickFromBtn()` (linha ~1471 do stock-dashboard.html), que **não existe**. A função correta é `trackPick(ticker, market, entryPrice, tp, sl)`. Por isso, ao clicar ⭐ para adicionar, ocorre um `ReferenceError` silencioso e nada acontece.

**Acceptance Criteria:**
- Clicar ⭐ em uma linha da Lista chama `trackPick()` com os dados corretos e adiciona o ticker em `state.trackedPicks`.
- O botão muda visualmente para ✓ (com borda verde) ao ser adicionado.
- Clicar ✓ remove o ticker de `state.trackedPicks` e o botão volta ao estado ⭐.
- Um toast confirma a ação: "✅ TICKER TRACKED!" ao adicionar ou "TICKER removido dos acompanhados" ao remover.
- A lista rerenderiza mantendo a posição de scroll e o filtro de busca ativo.

**Sprint:** 18 · **Effort:** 30min

---

### US-174 — Remover Botão 📊 Duplicado da Tabela Lista
**As a** usuário na view Lista,
**I want** que o botão 📊 (gráfico de barras) que aparece em cada linha da tabela seja removido,
**so that** a interface fique mais limpa e sem ações redundantes ou confusas ao lado do botão de Acompanhar.

**Context:**
O botão `📊` atual chama `openPortfolioModal()` que abre o modal de adicionar à Carteira, mas sua presença ao lado do ⭐ cria confusão (dois botões de ação por linha, sem label). A ação de adicionar à Carteira será substituída por um botão mais claro (US-175).

**Acceptance Criteria:**
- O botão `📊` (que chama `openPortfolioModal`) é removido do HTML gerado por `renderHomeLista()`.
- Cada linha da Lista passa a ter apenas o botão ⭐/✓ de Acompanhar.
- Nenhuma regressão na funcionalidade de Carteira acessada por outras rotas (modal de detalhe da ação, view Carteira).

**Sprint:** 18 · **Effort:** 15min

---

### US-175 — Botão "Adicionar à Carteira" na Tabela Lista
**As a** usuário na view Lista,
**I want** um botão dedicado em cada linha da tabela para adicionar aquela ação à minha Carteira,
**so that** posso registrar uma compra diretamente da Lista sem precisar abrir o detalhe do ativo.

**UX:**
- Ícone: 📊 (gráfico de barras colorido — conforme referência visual do usuário)
- Label tooltip: "Adicionar à Carteira"
- Comportamento: abre o `portfolioModal` com ticker e preço pré-preenchidos (mesmo comportamento do `openPortfolioModal()` atual)
- Posição: coluna de ações, após o botão ⭐/✓, separado visualmente

**Acceptance Criteria:**
- Cada linha da Lista exibe o botão 📊 após o ⭐/✓.
- Clicar 📊 abre o modal de Carteira (`showPortfolioModal()`) com o campo Ticker e Preço já preenchidos.
- `event.stopPropagation()` impede que o clique no botão abra o detalhe da ação.
- O botão tem `title="Adicionar à Carteira"` para acessibilidade.
- Funciona tanto para ações com dados de scan (preço disponível) quanto para ações sem scan (preço = 0 → campo preço vazio).

**Sprint:** 18 · **Effort:** 30min

---

---

## Epic 39 — Sprint 19: Acompanhados — Colunas de Acompanhamento e Indicadores

### US-176 — Redesign da Tabela Acompanhados: Colunas de Preço, P&L e Indicadores Técnicos
**As a** usuário na view Acompanhados,
**I want** que a tabela mostre colunas de variação diária, resultado desde que comecei a acompanhar e indicadores técnicos (MACD e ADX) com seus valores numéricos,
**so that** posso acompanhar a performance e o momentum de cada ação sem precisar abrir o detalhe individual.

---

#### Colunas Removidas
| Coluna atual | Motivo da remoção |
|---|---|
| **POTENCIAL** | Mostra distância até o TP — útil no scan, mas sem significado como KPI de acompanhamento. Substituída por P&L real. |

#### Colunas Mantidas
| Coluna | Dado | Observação |
|---|---|---|
| **#** | Índice sequencial | — |
| **TICKER** | `pick.ticker` | — |
| **PREÇO** | `d.price` | Preço atual do último scan |
| **SINAL** | `d.signal` | Compra / Aguardar / Venda |
| **RSI** | `d.rsi` | Valor numérico |
| **ALVO (TP)** | `d.tp ?? pick.tp` | Alvo de preço |
| **Ações** | botão ✕ | Remover da watchlist |

#### Colunas Novas
| Coluna | Dado | Formato | Cor |
|---|---|---|---|
| **VAR %** | `d.changePercent` | `+1,23%` / `-0,45%` | Verde se ≥ 0, vermelho se < 0 |
| **P&L %** | `(d.price - pick.entryPrice) / pick.entryPrice × 100` | `+8,40%` / `-3,10%` | Verde se ≥ 0, vermelho se < 0. `—` se `entryPrice = 0` |
| **MACD** | `d.macd` | `+0.32` / `-0.18` (2 casas decimais, sinal explícito) | Verde se > 0, vermelho se < 0 |
| **ADX** | `d.adx` | `28.4` (1 casa decimal) | `> 25` → cor de destaque (`var(--primary)`); `≤ 25` → `var(--ink-3)` (tendência fraca) |

**Ordem das colunas no redesign:**
`# | TICKER | PREÇO | VAR% | P&L% | SINAL | RSI | MACD | ADX | ALVO (TP) | [✕]`

---

#### Summary Bar (barra de totais acima da tabela)

| Métrica atual | Alteração |
|---|---|
| TOTAL | mantida |
| COMPRA | mantida |
| POTENCIAL MÉDIO | **removida** |
| — | **nova: RESULTADO** — média de P&L % de todas as posições com preço disponível. Formato: `+4,2%` ou `-1,8%`. Verde/vermelho conforme sinal. Se nenhuma posição tiver preço, ocultar. |

---

**Acceptance Criteria:**
- A coluna POTENCIAL é removida da tabela e do cálculo de `avgPotential`.
- A coluna VAR % exibe `d.changePercent` formatado com sinal e 2 casas; mostra `—` quando dado indisponível (ação não analisada no último scan).
- A coluna P&L % calcula `(price - pick.entryPrice) / pick.entryPrice × 100` com sinal e 2 casas; mostra `—` quando `pick.entryPrice === 0` ou preço atual não disponível.
- A coluna MACD exibe `d.macd` com sinal explícito (`+`/`-`) e 2 casas decimais; verde se > 0, vermelho se < 0; `—` se dado indisponível.
- A coluna ADX exibe `d.adx` com 1 casa decimal; cor de destaque se `> 25` (tendência forte), cinza se `≤ 25`; `—` se dado indisponível.
- Na summary bar: "POTENCIAL MÉDIO" é substituído por "RESULTADO" (média de P&L % das posições com preço).
- Todas as colunas novas têm `font-family: var(--font-mono)` para alinhamento numérico.
- A tabela é horizontalmente rolável em mobile (overflow-x: auto já existente via `.card-flush`).
- Ações sem dados de scan exibem `—` em VAR%, P&L%, MACD e ADX sem quebrar o layout.

**Dados disponíveis no objeto `d` (resultado de `analyzeStock()`):**
- `d.macd` — número (positivo = bull, negativo = bear), calculado em `calcMACD()` — disponível após varredura
- `d.adx` — número 0–100, calculado em `calcADX(c, 14)` — disponível após varredura
- `d.changePercent` — variação diária % — disponível após varredura
- `pick.entryPrice` — preço na hora em que o usuário clicou ⭐, salvo em `trackPick()`

**Sprint:** 19 · **Effort:** 2h

---

*End of User Stories — v2.2*
*B3 stocks · português · 176 stories across 39 epics*

| Sprint | Epics | Stories | Theme |
|--------|-------|---------|-------|
| **D** | **30** | **US-112–128** | **Design Foundation: Mobile-First Redesign (PRIORITY — run first)** |
| 1 | 1–13 | US-1–52 | MVP |
| 2 | 14–20 | US-53–74 | Brazilian Market & UX |
| 3 | 21–22 | US-75–77 | Compliance & Stability |
| 4 | 23 | US-78–79 | Monetisation (blocked on keys) |
| 5 | 24 | US-80–87 | Primeiros Passos Course |
| 6 | 25 | US-88–93 | Code Structure: File Split (run after Sprint D) |
| 7 | 26 | US-94–98 | Security Hardening |
| 8 | 27 | US-99–103 | Server Reliability |
| 9 | 28 | US-104–107 | Server-Side Portfolio Storage |
| 10 | 29 | US-108–111 | Frontend State & Reliability |
| 11 | 31 | US-129–136 | UI Polish & Brasil Focus |
| 12 | 32 | US-137–142 | Design System Migration & UI Audit |
| 13 | 33 | US-143–146 | Início View Modes & Admin Access |
| 14 | 34 | US-147–152 | Mobile UX & Open Access |
| 15 | 35 | US-153–161 | Qualidade & Português Completo |
| 16 | 36 | US-162–164 | Watchlist P&L, Lista Redesign & DARF Fix |
| 17 | 37 | US-165–172 | Simular, Primeiros Passos & Mobile Profile |
| 18 | 38 | US-173–175 | Lista Interatividade: Acompanhar + Carteira |
| 19 | 39 | US-176 | Acompanhados: Colunas de Acompanhamento e Indicadores |
