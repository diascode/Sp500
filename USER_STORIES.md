# MOMENTUM — User Stories

*Version 1.0 — May 2026*

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

*End of User Stories — v1.4*
*160 stocks · 4 markets · 2 languages · 79 stories across 23 epics*
*Sprint 1 complete · Sprint 2: US-53–US-74 · Sprint 3: US-75–US-78 · Sprint 4: US-79 (Epics 21–23)*
