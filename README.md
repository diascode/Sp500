# MOMENTUM

**Technical analysis scanner and paper-trading simulator for self-directed retail investors.**

Scans live market data across Brazil (B3), US, Europe, and emerging markets. Computes 10 classical indicators per stock and delivers a one-glance BUY / HOLD / SELL verdict with entry zone, take-profit, and stop-loss bands.

Bilingual — English and Portuguese (pt-BR). Built for the Brazilian retail investor market.

---

## Features

- **Live scan** — Real-time OHLCV data via server-side proxy with 60s cache. Covers 124 hand-curated stocks across 4 markets, including 40 B3 names.
- **Technical analysis** — RSI, MACD, ADX, SMA 9/20/50/200, Bollinger Bands, ATR, volume ratio, S/R levels, candlestick patterns.
- **Watchlist (Acompanhados)** — Track picks with daily VAR%, P&L since entry, MACD, and ADX.
- **Paper portfolio** — Simulate buys and sells. Tracks cost basis, unrealized/realized P&L per position.
- **IR / DARF report** — Calculates Brazilian capital gains tax (swing 15%, daytrade 20%), generates a monthly DARF report with loss carryforward support.
- **Education** — 16-lesson course covering fundamentals, technical indicators, and B3-specific tax rules.
- **Auth & accounts** — Email/password, JWT sessions, CPF validation, email verification via Resend.
- **Stripe payments** — Free and Pro tiers. Pro unlocks full scan universe and correlation matrix.
- **Admin panel** — User management, tier upgrades, and feature flag toggles.
- **i18n** — Full EN/PT-BR translation. Switches live.
- **4 colour themes** — Brasil, Dia, Pop, Calmo.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla JS SPA (`stock-dashboard.html`, ~4,500 lines) |
| Backend | Node.js, no framework (`server.js`) |
| Auth | `jsonwebtoken`, `crypto.scryptSync` |
| Payments | Stripe |
| Email | Resend |
| Data | Yahoo Finance (unofficial proxy), BrAPI |
| Database | `data/users.json` (flat file, atomic writes) |
| Deployment | Docker (Node 22 Alpine) |

---

## Quick Start

### Prerequisites
- Docker
- Node.js 22+ (for local dev only)

### Run with Docker

```bash
# 1. Copy environment template
cp .env.example .env
# Edit .env with your keys (see Environment Variables below)

# 2. Build and run
docker compose up --build

# App available at http://localhost:8081
```

### Run locally (no Docker)

```bash
npm install
node server.js
# App available at http://localhost:8080
```

---

## Environment Variables

```bash
# Required
JWT_SECRET=your-secret-key-min-32-chars

# Email (Resend — https://resend.com)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# Payments (Stripe — https://stripe.com)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# App URL (used in email links)
APP_URL=http://localhost:8081
```

See `.env.example` for the full list with descriptions.

---

## Repository Structure

```
├── server.js               # Backend — auth, stock proxy, Stripe, admin API
├── stock-dashboard.html    # Frontend SPA — all UI, charts, analysis engine
├── static/
│   ├── app.css             # Design system (CSS custom properties, themes)
│   └── i18n.js             # EN/PT-BR translation strings
├── legend.html             # Static help/legend page
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── data/
│   └── users.json          # User database (auto-created on first signup)
├── TECHNICAL_DOCS.md       # Full architecture and API reference
├── STARTUP.md              # Business and product strategy document
├── USER_STORIES.md         # Pending sprint backlog
└── USER_STORIES_COMPLETED.md  # Shipped sprint history
```

---

## Development

The app is a single HTML file with no build step. To iterate:

```bash
# Edit stock-dashboard.html or server.js, then deploy to running container:
docker cp stock-dashboard.html jerry-stock-dashboard:/app/stock-dashboard.html
docker cp server.js jerry-stock-dashboard:/app/server.js
docker restart jerry-stock-dashboard
```

For deeper architecture details see [`TECHNICAL_DOCS.md`](TECHNICAL_DOCS.md).

---

## Disclaimer

MOMENTUM is a **paper-trading simulator for educational purposes only**. Nothing in this application constitutes financial advice, investment recommendations, or solicitation to buy or sell securities. All trades are simulated. Past results do not guarantee future performance. Consult a qualified financial advisor before making real investment decisions.
