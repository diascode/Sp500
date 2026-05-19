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
**As an** operator, **I want** all Yahoo Finance and brapi.dev fetch calls to time out after 8 seconds, **so that** a hung upstream never stalls the Node event loop.
- Wrap `yahooFetch` and brapi fetch calls with `AbortController` + `setTimeout(abort, 8000)`.
- On timeout, return `null` (same as current network error path) and log `[fetch] timeout: <url>`.
**Sprint:** 8 · **Effort:** 2h

### US-100 — Health Check Endpoint
**As an** operator, **I want** `GET /api/health` to return a structured status, **so that** Docker/load balancers can probe liveness without loading the full app.
- Returns `{ status: 'ok', uptime: seconds, users: count, version: '5.1' }`.
- No auth required. Responds in < 5ms.
**Sprint:** 8 · **Effort:** 30min

### US-101 — Graceful Shutdown on SIGTERM
**As an** operator, **I want** the server to finish in-flight requests before exiting, **so that** Docker restarts don't drop active scans or corrupt mid-write data.
- Register `process.on('SIGTERM', ...)` to stop accepting new connections and wait up to 10s for active requests to finish before exiting.
**Sprint:** 8 · **Effort:** 1h

### US-102 — Fix loadUsers Silent Data Loss on Corrupt JSON
**As an** operator, **I want** `loadUsers` to refuse to start rather than silently overwrite the user DB with an empty array, **so that** a corrupted `users.json` doesn't result in all users being deleted.
- If `JSON.parse` throws, log `[FATAL] users.json is corrupt — refusing to start. Restore from backup.` and call `process.exit(1)`.
- If file is missing (first run), continue with empty array as before.
**Sprint:** 8 · **Effort:** 30min · **Priority:** HIGH

### US-103 — Surface saveUsers Failures to API Callers
**As a** user, **I want** the server to return an error when it can't persist my changes (e.g. disk full), **so that** I'm not misled into thinking my password change succeeded when it didn't.
- Wrap `saveUsers` in try/catch; if write fails, throw so the calling route handler can return `500`.
- All callers (`change-password`, `profile`, `reset-password`, `signup`, etc.) return `500` instead of `200` on save failure.
**Sprint:** 8 · **Effort:** 1h

---

## Epic 28 — Server-Side Portfolio Storage (Sprint 9)

**Context:** Portfolio data (positions, tracked picks, loss carryforward, tax rate) is 100% localStorage-only. Users lose all data on browser clear, can't use the app on a second device, and account deletion cannot honor "Right to Erasure" for portfolio data. The consent dialog at line 828 incorrectly states data is stored server-side — a LGPD/GDPR inconsistency.

### US-104 — Server-Side Portfolio Storage
**As a** Pro user, **I want** my portfolio positions saved to the server, **so that** I don't lose them when I clear my browser or switch devices.
- `PUT /api/portfolio` — auth required; saves full portfolio JSON blob to user record.
- `GET /api/portfolio` — auth required; returns saved blob or `[]`.
- Frontend writes to both localStorage (immediate) and server (debounced 2s).
- On login, server data is authoritative; merged with local if server returns empty.
**Sprint:** 9 · **Effort:** 1 day

### US-105 — Server-Side Tracked Picks Storage
**As a** Pro user, **I want** my tracked picks saved to the server, **so that** my watchlist persists across browsers and devices.
- `PUT /api/tracked` / `GET /api/tracked` — same pattern as US-104.
**Sprint:** 9 · **Effort:** 3h

### US-106 — Fix Consent Dialog Data Storage Claim
**As a** user, **I want** the consent dialog to accurately describe where my data is stored, **so that** I can make an informed consent decision.
- Update consent text (line 828) to reflect actual storage (localStorage for portfolio, server for account). After US-104/105 land, update again to reflect server-side storage.
**Sprint:** 9 · **Effort:** 30min · **Priority:** HIGH (LGPD)

### US-107 — Account Deletion Removes All Portfolio Data
**As a** user who deletes their account, **I want** all my server-side data removed, **so that** my Right to Erasure (LGPD Art. 18) is fully honored.
- `DELETE /api/auth/account` removes user row, portfolio blob, and tracked picks blob.
**Sprint:** 9 · **Effort:** 30min

---

## Epic 29 — Frontend State & Reliability (Sprint 10)

**Context:** 45 ad-hoc re-render call sites with inconsistent pairing; scan requests have no abort mechanism (stale results land on new state); scan errors are silently swallowed (`catch(() => {})`); portfolio data has no schema version (migrations are fragile one-shot code).

### US-108 — AbortController for In-Flight Scans
**As a** user, **I want** switching markets to cancel the previous scan immediately, **so that** I don't see results from the wrong market or waste server quota.
- Store `_scanAbort = new AbortController()` before each scan; pass `signal` to each `fetchHistory` call.
- `switchMarket()` calls `_scanAbort.abort()` before starting new scan.
- Aborted fetches are silently ignored (not surfaced as errors).
**Sprint:** 10 · **Effort:** 2h

### US-109 — Surface Scan Errors to User
**As a** user, **I want** to see a message when a scan fails, **so that** I know why I'm seeing zero results instead of assuming the market has no signals.
- Replace `catch(() => {})` in `scanMarket` with `catch(e => { if (!aborted) showToast(...) }`.
- Network error → `"Erro de rede — tente novamente"` toast.
- 429 rate limit → `"Limite de varredura atingido — aguarde"` toast with remaining time.
**Sprint:** 10 · **Effort:** 2h

### US-110 — Portfolio Schema Versioning
**As a** developer, **I want** localStorage portfolio data to carry a schema version, **so that** future migrations are safe and detectable.
- Add `_schemaVersion: 2` to the root of saved portfolio JSON.
- `loadPortfolio` checks version; runs appropriate migration chain; saves back with new version.
- Missing `tradeType` on existing positions defaults to `'swing'` and is written back explicitly (fixes silent DARF mis-classification).
**Sprint:** 10 · **Effort:** 2h

### US-111 — Setter Pattern for Module Globals
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

*End of User Stories — v1.6*
*160 stocks · 4 markets · 2 languages · 128 stories across 30 epics*

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
