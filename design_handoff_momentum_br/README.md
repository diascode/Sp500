# Handoff: Momentum BR — Mobile-first redesign

## TL;DR for Claude Code

You're implementing a **visual + UX redesign** of the existing Momentum app (https://github.com/diascode/Momentum-trade — single-file vanilla JS SPA in `stock-dashboard.html`, ~262 KB, served by `server.js`). The current app has a developer/IDE aesthetic (terminal vibes, monospace everywhere, 7 dev-style themes like Dracula/Monokai/Nord). The redesign pivots it to a **mobile-first, friendly, Brazilian fintech aesthetic** targeted at the actual audience: 25–40-year-old Brazilians, classe C (R$ 2k–8k income), mobile-primary, no college degree, learning trading for the first time.

**The design is bundled here as a React + JSX prototype** (it was the fastest way to build a working interactive reference). You will most likely **port it back into the existing single-file vanilla-JS SPA in `stock-dashboard.html`** rather than introducing a React build pipeline — match the codebase's existing conventions (vanilla DOM manipulation, inline `<style>`, `data-theme` attribute switching, `fetch()` to `server.js` endpoints).

## About the bundled files

These are **design references**, not production code to copy verbatim:

| File | Role |
|------|------|
| `index.html` | Entry — loads fonts + scripts |
| `styles.css` | All design tokens, theme variables, component styles |
| `data.js` | Mock data (stocks, news, lessons, calendar, portfolio) |
| `components.jsx` | React components: `AppBar`, `FeedCard`, `RowCard`, `StoryCard`, `BigChart`, `ScanRing`, `Sparkline`, `Chip`, `SignalPill`, `CookieBanner`, `fmt`/`fmtPct` helpers |
| `screens.jsx` | Desktop screens: `HomeScreen`, `ScannerScreen`, `DetailScreen`, `TrackedScreen`, `LearnScreen`, `PortfolioScreen`, `CalendarScreen`, `CorrelationScreen`, `DARFScreen`, `SimulatorScreen`, `AdminScreen`, `AuthModal` |
| `mobile.jsx` | Mobile-equivalent screens (in phone frame) |
| `app.jsx` | Root + state + routing |
| `tweaks-panel.jsx` | Dev-only tweak controls; **do not port** |

Open `index.html` in a browser to see the working reference.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, copy, signal states. Recreate pixel-close. Port the design tokens directly into `stock-dashboard.html`'s `:root` block.

---

## 1. Design system

### Typography

```
--font-display: "Sora", "Inter", system-ui    (headings, big numbers — weights 600/700/800)
--font-sans:    "Inter", system-ui             (body — weights 400/500/600/700)
--font-mono:    "JetBrains Mono", ui-monospace (numbers, prices, technical data — weights 400/500/600)
```

Load via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Type scale:
- `.hed1` — 52px / 1.04 / -0.03em, weight 700, `text-wrap: balance`
- `.hed2` — 36px / 1.1 / -0.025em, weight 700
- `.hed3` — 24px / 1.2 / -0.015em, weight 600
- `.dek`  — 17px / 1.55, color `--ink-2`, max-width 60ch
- `.eyebrow` — 11px mono, uppercase, letter-spacing 0.14em
- `.kicker` — 12px display, uppercase, weight 600, color `--primary`
- Mobile: hed1 → 38px, hed2 → 28px, dek → 15px

### Color tokens

Four themes, switched via `<html data-theme="...">`. Default is `brasil`.

**Theme: `brasil` (default, warm dark)**
```css
--bg:          #0c0e10
--bg-2:        #14181c
--bg-3:        #1d2228
--line:        #232830
--line-2:      #30363f
--ink:         #f1f4f7
--ink-2:       #c4cad2
--ink-3:       #8b929d
--ink-4:       #525861
--primary:     oklch(0.78 0.17 145)   /* money green */
--primary-ink: #0c0e10
--magenta:     oklch(0.68 0.22 340)   /* Pro accent */
--buy:         oklch(0.78 0.17 145)
--buy-soft:    oklch(0.30 0.08 145)
--sell:        oklch(0.70 0.22 25)
--sell-soft:   oklch(0.30 0.10 25)
--hold:        oklch(0.82 0.16 90)
--hold-soft:   oklch(0.32 0.08 90)
```

**Theme: `day` (light)**
```css
--bg: #f4f5f7; --bg-2: #ffffff; --bg-3: #e9ebef
--line: #dcdfe4; --line-2: #c0c5cd
--ink: #0d1116; --ink-2: #2a3138; --ink-3: #5b6470; --ink-4: #8c95a1
--primary: oklch(0.52 0.16 145); --primary-ink: #ffffff
--magenta: oklch(0.52 0.20 340)
/* buy/sell/hold also shift darker/desaturated for light bg — see styles.css */
```

**Theme: `pop` (high-contrast magenta)**
```css
--bg: #0a0a0f; --bg-2: #14141d; --bg-3: #1e1e2c
--primary: oklch(0.68 0.24 340)   /* magenta is primary */
--magenta: oklch(0.78 0.20 200)
/* see styles.css */
```

**Theme: `calmo` (cool dark blue)**
```css
--bg: #0d1219; --bg-2: #161d27
--primary: oklch(0.72 0.14 210)   /* blue */
```

**Drop these from the existing app:** `dracula`, `monokai`, `nord`, `solarized`, `onedark` (developer themes that fight the new audience).

### Spacing & radii

```css
--s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
--s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 72px;

--r-xs:  6px;
--r-sm:  10px;
--r:     14px
--r-lg:  20px
--r-xl:  28px
--r-pill: 999px
```

Card padding: 20–24px. Section vertical padding: 56px desktop, 36px mobile.

### Shadows

```css
--shadow-1: 0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 8px rgba(0,0,0,0.32);
--shadow-2: 0 24px 60px -20px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.3);
```

---

## 2. Voice & copy

- **PT-BR conversational**, not literary. "Oi Thiago 👋", "Bora ver o que tá rolando?", "Trade não é sorte — é leitura", "Tá +12,4% no mês 🎉".
- Numbers always BRL (R$) for BR stocks, USD for international, with `pt-BR` locale formatting (comma decimals, period thousands: `R$ 8.420,18`).
- Helper functions `fmt(n, currency)` and `fmtPct(n)` in `components.jsx` — port these.
- Lessons keep emoji ("📊 O que é RSI?", "💰 Quanto investir no começo?"). The audience uses emoji constantly in finance contexts (Nubank, PicPay).
- EN translations should exist for admin only. The existing `t()` translation system in `stock-dashboard.html` is the right place to extend; copy keys from this design's English strings.
- BR stocks (PETR4, ITUB4, VALE3, MGLU3, WEGE3, BBDC4, ABEV3, LREN3) come **first** in every list. US stocks are secondary.

---

## 3. Screens

Listed in nav order. Each shows the existing app's route name in parentheses where there's a 1:1 mapping.

### 3.1 Home / Today (`home`)

Hero greeting + balance card + featured pick + secondary picks + news/lessons row.

**Layout** (desktop, max-width 1320px, padded 32px):

1. **Greeting row** — 44px circular avatar (magenta bg, white letter) + eyebrow date "17 de maio · 14h32" + name "Oi Thiago 👋"
2. **Hed1** — "Hoje tem `<span color=primary>5 oportunidades</span>` de compra na sua lista."
3. **Dek** — "Sua carteira está `<strong color=buy>+12,4% no mês</strong>`. Bora ver o que tá rolando?"
4. **Balance card** (`.bal-card`) — gradient primary→bg, label/value/change, two CTAs: "⚡ Varrer mercado" (primary) and "Ver carteira" (default)
5. **Story card** (hero pick, `.story-card`) — 2-col grid: left is ticker + name + price + change + why + indicators + 2 CTAs; right is large sparkline (height 200px, primary stroke)
6. **3-col grid** of `FeedCard`s — the other buy signals
7. **2-col**: News column (`.news-row` items) + Lesson column (`.lesson-card` stack)

**FeedCard** structure (most important component):
- Top row: 44×44 emoji logo (rounded 12px, bg `--bg-3`) + ticker (Sora 700 18px) + flag + signal pill on right
- Price block: mono 26px price + small ch% + 1y change
- Sparkline strip (56px high, full width, color = buy/sell/hold)
- "Por quê:" paragraph (13.5px, plain language explanation)
- Indicator chips (RSI 65, MACD +0.92, pattern name)
- Action row: ⭐ Acompanhar (default) + Ver gráfico → (primary, both flex:1)

### 3.2 Scanner (`scan`)

- Hed1 with green-highlighted count: "5 ações com sinal de **compra**."
- **Region segmented control** (`.seg`) — pill-shaped, primary fill on active. Order: Todos · 🇧🇷 BR · 🇺🇸 US · 🇪🇺 EU · 🌍 EM.
- **Filter chips** (signal: Todos/Compra/Aguardar/Venda) + `⚡ Varrer agora` primary button on right
- **Scan-in-progress card** when scanning: `<ScanRing progress={0–100} />` (160×160 SVG, circle with stroke-dashoffset animating; center shows "67%" + "VARRENDO"). Plus headline "Lendo a série de 90 dias de PETR4…" and progress bar.
- **Results grid** — 3-col FeedCards

Scan progress: tick 5% every 110ms (so ~2.2s end-to-end).

### 3.3 Stock detail (`detail`)

- Back link → Scanner
- Two-row header: 56px logo + ticker (44px display) + name + sector eyebrow + price (44px mono) + change + signal pill + "⭐ Acompanhar" + "💰 Adicionar à carteira" (primary)
- **"Por que esse sinal?"** card (`.card-glow`, magenta gradient border) — explanation + 3 chips
- **Chart frame**: range pills (1D/1S/1M/3M/6M/1A/5A) + legend chips (MM 20, MM 50, Bollinger) + `BigChart` (full candlesticks + MA20/MA50 + BB band — see `components.jsx`)
- **Levels row** (3 cols): `.level-tp` (buy-soft bg) / `.level-now` (bg-3) / `.level-sl` (sell-soft bg) — each shows TP/current/SL price
- **Indicator grid** (4 cols): RSI, MACD, ADX, Pattern — each in `.metric` card with label/value/hint
- **Learn hint card** — "O que significa RSI 65?" with contextual answer + "Ler aula" CTA

### 3.4 Tracked (`tracked`)

- Hed1: "Sua **watchlist**."
- Empty state: 48px emoji "📋" + h3 "Nada por aqui ainda" + helper text
- Otherwise: 2-col grid of FeedCards

### 3.5 Learn (`learn`)

- Hed1: "Trade não é sorte — é **leitura**."
- **Onboarding hero card** (`.onboard-hero`, primary→magenta gradient) — "Comece com R$ 100 simulados." + dek + "Fazer tour guiado →" CTA. White text on gradient bg.
- 2-col grid of `.lesson-card` (6 lessons). Each: 44px rounded emoji icon (primary-tinted bg) + title (Sora 700 17px) + body + meta row (lesson #, read time, level chip)

Lessons list (port from existing `USER_STORIES.md` for full content):
1. 📊 O que é RSI? · 3min · iniciante
2. 🔀 Como ler um cruzamento de MACD · 4min · iniciante
3. 💪 ADX e a força da tendência · 5min · intermediário
4. 🎯 Take Profit e Stop Loss · 6min · iniciante
5. 📉 Bandas de Bollinger · 4min · intermediário
6. 💸 Quanto investir no começo? · 5min · iniciante

### 3.6 Portfolio (`portfolio`)

- Hed1 with sign-colored %: "Você tá **+24,8%** em 3 posições."
- 3 `.big-stat` cards: Valor total / Custo de entrada / Lucro/prejuízo
- Positions table — flush card, no per-row card. Cols: emoji (44px logo) · ticker + entry · Atual · Valor · Days · P&L %
- Tax tip card with magenta "Pro · R$ 9/mês" CTA → DARF screen

### 3.7 Correlation (`correlation`) — Pro

If user.tier === "free": show **Pro lock card** (`.pro-lock`):
- 64px circular star icon (magenta bg)
- h2 "Matriz de correlação é Pro"
- Body text
- Feature list (✓ items styled with primary check)
- Magenta CTA "⭐ Virar Pro — R$ 9/mês"

If Pro/Admin: show 6×6 matrix heatmap. Cells colored by correlation value (`color-mix` from sell-red → bg-3 → buy-green). Below: insight card explaining one strong correlation pair in plain language.

### 3.8 DARF / IR (`darf`) — Pro

Same paywall pattern. When unlocked: Hed1 with magenta-colored R$ value: "Você tem **R$ 47,80** de imposto a pagar." Then 3 stat cards + a table of taxable operations + a yellow-warning card explaining the R$20k isenção rule. CSV / PDF / "Gerar DARF →" buttons. (See `DARF_IMPLEMENTATION_PLAN.md` for the actual calculation logic to wire in — this screen is the UI shell.)

### 3.9 Simulator (`simulator`)

2-col layout:
- **Left card**: "Escolha um valor" → amount pills (R$ 100 / 250 / 500 / 1000 / 2500). "Em qual ação?" → ticker pills. Then 3 scenario boxes (`.level-tp` / `.level-now` / `.level-sl`) showing gain/qty/loss. Plus a plain-language summary paragraph.
- **Right aside** (`.card-glow`): a tip + CTA to open the chosen stock's analysis

The amount picker (`.amount-pill`) is a key reusable affordance — pill-shaped, primary fill on active, mono font.

### 3.10 Admin (`admin`)

- Hed1 with count + active today
- 4 `.big-stat` cards: total users / Pro conversion / MRR / trades this week
- Flush card with grid header + user rows. Cols: email · plan chip · joined · trades · edit link.

### 3.11 Auth modal

- Centered, 440px max-width, 32px padding, radius 28px, backdrop blur
- Brand mark + name at top
- hed2 "Bem-vindo de volta 👋" / "Cria sua conta grátis"
- Two inputs (`.input`) — email + password
- Primary CTA full-width
- Toggle to switch between sign-in/sign-up
- Footer microcopy in mono: "Simulador educacional · Não é recomendação de investimento."

### 3.12 Cookie banner (LGPD)

Fixed-bottom, glass background, `🍪` icon + LGPD text + "Aceitar e continuar" primary button.

---

## 4. AppBar (top nav)

Sticky, blurred background, 14px vertical padding. Three zones:

**Left**: brand mark (32×32 primary square, white "M") + "Momentum" wordmark (Sora 700 19px)

**Center (desktop only)**: segmented pill nav — Início / Scanner / Acompanhados / Aprender / Carteira. Hidden under 900px.

**Right**:
- FX mini-ticker (desktop only): USD, IBOV, SELIC values (mono, dim)
- **Language toggle** (`.lang-toggle`) — PT / EN pill, inverted active state
- **⚡ Varrer** primary pill (always visible)
- If signed out: "Entrar" pill
- If signed in: **user button** — 30px magenta avatar + tier chip ("👑 Admin" / "⭐ Pro" / "Free"). Click → dropdown:
  - Email + tier subline
  - 🔑 Alterar senha
  - ⭐ Virar Pro (if free)
  - ⚙️ Painel admin (if admin)
  - 📥 Exportar meus dados
  - 🚪 Sair (red)
  - 🗑️ Excluir conta (red)

---

## 5. Mobile

The mobile gallery in the prototype is purely a presentational scroll-strip showing what mobile *looks like*. **In production, mobile is the same single SPA, just responsive.**

Behavior under 720px viewport:
- AppBar collapses (segmented nav hides, FX hides, user button text hides — only avatar remains)
- Sticky bottom nav appears (`.bn` style, fixed bottom, 5 items: Início / Scanner / Watch / Aulas / Carteira)
- Body gets `padding-bottom: 70px` so content doesn't hide under nav
- Cards stack to single column
- hed sizes drop (52→38, 36→28)
- Grids collapse to 1 col under 600px

The phone-mock styling in `styles.css` (`.phone-mock`, `.phone-status`, `.phone-body`) is **only** for the gallery — don't ship it.

---

## 6. Interactions

- **Scan button** → set `scanState="scanning"`, advance progress 5% every 110ms, transition back to results when 100%
- **Card click** → open detail
- **⭐ Acompanhar** → toast confirmation + add to tracked list (real app: POST to `/api/tracked`)
- **+ Carteira** → modal for qty + entry price (your existing add-position flow)
- **Region tab change** → re-filter stock list (no re-scan)
- **Theme switch** → `document.documentElement.setAttribute('data-theme', name)` + persist to localStorage (your existing pattern)
- **Language switch** → call existing `setLang(code)`, re-render
- **All transitions** ~150ms ease-out

---

## 7. Data shape

Each stock object (from `data.js`):
```js
{
  ticker: "PETR4",
  name: "Petrobras PN",
  sector: "Energia",
  region: "BR",       // "BR" | "US" | "EU" | "EM"
  flag: "🇧🇷",
  emoji: "🛢️",        // sector emoji for the logo
  currency: "R$",
  price: 38.42,
  change1y: 14.5,
  change1d: 1.2,
  signal: "buy",      // "buy" | "hold" | "sell"
  rsi: 58.7,
  macd: 0.92,
  adx: 28.3,
  pattern: "Tendência de alta",
  series: [...],      // 90 daily close prices for sparkline + chart
  tp: 44.18,
  sl: 35.73,
  why: "Plain-language reason for the signal in PT-BR."
}
```

The `why` field is new — your existing scanner returns indicators, but no human-readable justification. The redesign relies on this for newcomers. Consider building a simple `generateWhy(stock)` function on the server that templates the most salient indicator into Portuguese.

---

## 8. Implementation notes for Claude Code

The existing app is **vanilla JS single-file** (`stock-dashboard.html`). Don't introduce React or a build pipeline. Recreate the design using:

- Existing function-based components / template strings (the codebase uses `container.innerHTML = ...`)
- Existing `t()` translation helper
- Existing `apiGet`/`apiPost`/`apiAuth` fetch helpers
- Existing JWT auth and tier-gating logic
- Existing theme switcher — extend it with the 4 new themes; remove the 7 old ones (or keep them behind a "Legacy themes" toggle for backwards compat)

**Suggested implementation order:**

1. **Tokens & fonts**: replace `:root` and theme blocks in the `<style>` tag with the new ones above. Load Sora + Inter + JetBrains Mono.
2. **AppBar**: rebuild the `.header` block to match the new structure. Reuse existing auth state, just restyle.
3. **Home / scanner**: rewrite the card markup to match `FeedCard` / `StoryCard` from `components.jsx`. Add the `why` field server-side.
4. **Detail page**: restyle. Levels, metrics, learn-tip card are new.
5. **Tracked / Learn / Portfolio / Calendar**: restyle screens that exist.
6. **Correlation / DARF**: build out the Pro paywall card (`.pro-lock`) + Pro variants.
7. **Simulator**: new screen — amount picker + scenario calc.
8. **Admin panel**: restyle existing admin list.
9. **Cookie banner**: LGPD-compliant on first visit, dismiss persists.

The bundled `styles.css` is meant to be lifted nearly wholesale into `stock-dashboard.html`'s `<style>` tag. Just strip the `.phone-mock` rules.

---

## 9. What to discard from the prototype

- `tweaks-panel.jsx` (dev-only)
- `mobile.jsx` & `.phone-mock` styles (demo presentation only)
- The "Mais telas pra explorar" grid at the bottom of `app.jsx` (it exists to surface routes that aren't in the primary nav for demo purposes — in the real app these are reached via the user menu, Pro upsell, or context-specific entry points)
- The Tweaks-driven `tier` switcher (real app uses actual JWT)
- Mock data in `data.js` (real app fetches from your `server.js`)

---

## 10. Open questions

- **DARF logic**: the existing `DARF_IMPLEMENTATION_PLAN.md` has the calculation spec. Wire the existing logic into the new screen.
- **Lessons content**: `USER_STORIES.md` likely has fuller lesson copy than the 6 placeholders here.
- **Real translation strings**: keep your existing `t()` system; the redesign's PT-BR strings need to be added as new keys.

Ship in stages — tokens + appbar + home is enough for a first PR.
