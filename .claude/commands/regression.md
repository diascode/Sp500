You are a UI regression tester for the MOMENTUM stock scanner app running at http://localhost:8081.

Systematically test all major features using the Playwright MCP tools (browser_navigate, browser_snapshot, browser_take_screenshot, browser_click, browser_evaluate, browser_console_messages, browser_type, browser_wait_for, browser_press_key, browser_select_option).

Save all screenshots to the `qa_screenshots/` directory (create it if needed via `mkdir -p qa_screenshots` in bash first).

---

## TEST SUITE

### T1 — Page Load
- Navigate to http://localhost:8081
- Screenshot: `qa_screenshots/t1-page-load.png`
- Check: page title contains "MOMENTUM", calendar renders, status bar visible
- Check browser console: zero JS errors on fresh load

### T2 — Language Switch EN ↔ PT
- Switch to EN via `#langSelect`: verify tab labels → TRACKED, ALL STOCKS, PORTFOLIO, SCAN, MARKET, DATA, IDLE, READY
- Switch to PT: verify → RASTREADOS, TODOS OS ATIVOS, PORTFÓLIO, VARRER, MERCADO, DADOS, OCIOSO, PRONTO
- Screenshot each state: `qa_screenshots/t2-lang-en.png`, `qa_screenshots/t2-lang-pt.png`

### T3 — Market Tab Navigation
- Click US tab → verify market set, scan placeholder or cards shown, no crash
- Click EUROPE tab → verify market switches
- Click EMERGING tab → verify market switches
- No JS errors during tab switching

### T4 — Tracked Picks Tab (RASTREADOS)
- Click RASTREADOS tab
- Verify renders without crash (empty state or picks shown — both valid)
- Check: ATUALIZAR PREÇOS / REFRESH PRICES button present, CLEAR ALL button present
- Screenshot: `qa_screenshots/t4-tracked.png`

### T5 — ALL STOCKS Tab (TODOS OS ATIVOS)
- Click TODOS OS ATIVOS tab
- Verify table renders with stock rows
- For each visible row check: has a TRACK button (or tracked indicator) AND a `+ MY STOCKS` button (or ✅ badge if already in portfolio)
- Screenshot: `qa_screenshots/t5-all-stocks.png`

### T6 — Portfolio — Full Sell
- Click PORTFÓLIO tab
- Inject a test position via JS:
  ```js
  window.authUser = { email: 'test@test.com', tier: 'pro' };
  state.portfolio = [{ ticker:'AAPL', quantity:5, buyPrice:150, sellPrice:null, buyDate:'2024-01-01', sellDate:null, status:'holding' }];
  savePortfolio();
  renderPortfolioView();
  ```
- Click SELL on the AAPL row
- Verify sell modal has: "SHARES TO SELL (max 5)" field, SELL PRICE field, SELL DATE field
- Enter qty=5 (full sell), price=200
- Verify preview shows: "Selling: 5 of 5 shares", positive P&L, no "remaining holding" line
- Confirm sale → verify AAPL row now shows SOLD status
- Screenshot after: `qa_screenshots/t6a-full-sell.png`

### T7 — Portfolio — Partial Sell
- Inject fresh position:
  ```js
  state.portfolio = [{ ticker:'TSLA', quantity:10, buyPrice:200, sellPrice:null, buyDate:'2024-01-01', sellDate:null, status:'holding' }];
  savePortfolio();
  renderPortfolioView();
  ```
- Click SELL on TSLA row
- Enter qty=3, price=260
- Verify preview: "Selling: 3 of 10 shares", "Remaining holding: 7 shares @ $200.00", P&L = +$180 (+30%)
- Confirm → verify 2 rows: TSLA×7 HOLDING + TSLA×3 SOLD
- Screenshot: `qa_screenshots/t7-partial-sell.png`

### T8 — Portfolio — Sell Validation
- Inject TSLA×5 holding again
- Open sell modal
- Try to confirm with qty=10 (exceeds holding of 5) → verify error message appears, no crash
- Try qty=0 → verify error appears
- Try qty=3 price=0 → verify error appears

### T9 — Auth Modal
- Click ENTRAR / SIGN IN button
- Verify modal opens with email + password inputs
- Verify no "password not in form" console error
- Evaluate: `document.getElementById('authForm') !== null` → must be true (inputs wrapped in form)
- Evaluate: `document.getElementById('authPassword').closest('form')?.id === 'authForm'` → must be true
- Screenshot: `qa_screenshots/t9-auth-modal.png`

### T10 — Font Size Controls
- Click A+ twice → evaluate `parseFloat(document.body.style.zoom)` → must be > 1.0
- Click A- twice → verify zoom returns to ~1.0

### T11 — Theme Toggle
- Toggle theme button once → verify `document.documentElement.dataset.theme` changes
- Toggle again → verify it changes again
- Toggle back to original

### T12 — Console Error Final Check
- Check browser_console_messages for any `type: 'error'` entries
- List all errors found (expected: zero)

---

## REPORTING FORMAT

After all tests, output a markdown table:

| Test | Description | Result | Notes |
|------|-------------|--------|-------|
| T1 | Page load | ✅ PASS / ❌ FAIL | ... |
| T2 | Language EN↔PT | ✅ PASS / ⚠️ WARN / ❌ FAIL | ... |
...

Then:
- **Known i18n gaps** (hardcoded strings not yet wired to `t()`) — list them but mark as pre-existing if present in prior reports
- **New regressions** (anything broken that wasn't broken before)
- **Overall verdict**: `CLEAN` or `REGRESSIONS FOUND`
