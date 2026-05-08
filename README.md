# MOMENTUM · Stock Scanner

> Multi-market technical analysis scanner for momentum trading. Scan **🇺🇸 US · 🇪🇺 Europe · 🇧🇷 Brazil** stocks with live Yahoo Finance data.

**Target:** +15% in 30 days · **Stop-loss:** −7%

![MOMENTUM Dashboard](https://img.shields.io/badge/status-live-brightgreen)
![Version](https://img.shields.io/badge/version-5.0-orange)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue)

## Features

- **105 stocks** across 3 markets — US (50), Europe (30), Brazil (25)
- **Full technical stack** — RSI, MACD, ADX, SMA 9/20/50/200, Bollinger Bands, ATR
- **Auto signal engine** — BUY / NEUTRAL / SELL based on multi-indicator scoring
- **Chart pattern detection** — Ascending/Descending Triangles, H&S, Double Tops/Bottoms, Flags, Channels
- **Live price targets** — TP +15% / SL −7% bands drawn on every chart
- **Portfolio tracker** — Track positions, P&L, auto-detect TP/SL hits
- **Signal history** — Every BUY signal logged with timestamp and price
- **Correlation matrix** — Pearson correlation between top stocks by volume
- **Economic calendar** — Upcoming Fed, GDP, PCE, jobless claims events
- **News sentiment** — Latest Yahoo Finance news per stock
- **Adjustable chart periods** — 1D · 1M · 3M · 6M · 1Y · 5Y

## Quick Start

```bash
# Clone & run
npm install  # (zero deps — Node.js built-in modules only)
node server.js

# Open in browser
open http://localhost:8080
```

### Docker

```bash
docker compose up -d
# or
docker build -t momentum .
docker run -d -p 8080:8080 momentum
```

### Access from phone (Tailscale)

```bash
# Get your Tailscale IP
tailscale ip -4
# → 100.x.x.x
# Open http://100.x.x.x:8080 on your phone
```

## How It Works

```
Your browser ──→ Node.js proxy (port 8080) ──→ Yahoo Finance API
   (all calculations happen in your browser — no LLM costs)
```

1. **SCAN** fetches 5 years of daily OHLCV data from Yahoo Finance
2. All technical indicators calculate **client-side** in JavaScript
3. BUY signals display with full analysis, charts, and targets
4. **Track** picks you like → monitor P&L on subsequent scans
5. Auto-detects when a pick hits **+15% TP** or **−7% SL**

## Pages

| Tab | Description |
|-----|-------------|
| **SCAN** | Main view — up to 3 BUY signals per market |
| **🇺🇸🇪🇺🇧🇷** | Switch between US, Europe, Brazil universes |
| **📋 TRACKED** | Your tracked picks with live P&L, status, days held |
| **📋 UNIVERSE** | Full stock list per market with signals |
| **📁 PORTFOLIO** | Manual position tracking (shares × entry price) |
| **📊 SIGNAL HISTORY** | All BUY signals ever detected |
| **🔗 CORRELATION** | How your picks move together |

## Technical Indicators

| Indicator | Period | Use |
|-----------|--------|-----|
| SMA 9 | 9 days | Ultra-short momentum |
| SMA 20 | 20 days | Short-term trend (~1 month) |
| SMA 50 | 50 days | Medium-term trend (~quarter) |
| SMA 200 | 200 days | Long-term bull/bear line |
| RSI | 14 days | Overbought (>70) / Oversold (<30) |
| MACD | 12/26 | Momentum crossover signal |
| ADX | 14 days | Trend strength (>25 = trending) |
| Bollinger | 20/2 | Volatility bands |
| ATR | 14 days | Average True Range |

## Signal Scoring

Signal = RSI(45-65: +1) + MACD(>0: +1) + ADX(>22: +0.5) + Price > SMA50(+1) + RSI < 35(+0.5)

| Score | Signal |
|-------|--------|
| ≥ 2.5 | **BUY ↑** |
| 1–2.4 | **◈ HOLD** |
| < 1 | **SELL ↓** |

## Stock Universes

| Market | Count | Coverage |
|--------|-------|----------|
| 🇺🇸 US | 50 | S&P 500 — Tech, Semis, Financials, Healthcare, Consumer |
| 🇪🇺 Europe | 30 | STOXX 600 — Germany, France, UK, Netherlands, Italy, Spain |
| 🇧🇷 Brazil | 25 | Bovespa — Petrobras, Vale, Banks, Utilities, Commodities |

## Configuration

Edit `server.js` to customize:

- **`UNIVERSES`** — Add/remove stocks per market
- **`PORT`** — Change server port (default: 8080)
- **`HOST`** — Change bind address (default: 0.0.0.0)

## Tech Stack

- **Backend:** Node.js (zero dependencies — built-in `http`, `fs`, `path`, `fetch`)
- **Frontend:** Vanilla JavaScript, Canvas API
- **Data:** Yahoo Finance public API (free, no key required)

## Files

```
.
├── server.js              ← Node.js proxy + API
├── stock-dashboard.html   ← Main dashboard (44KB, all-in-one)
├── legend.html            ← Indicator reference
├── README.md              ← This file
├── Dockerfile             ← Container build
└── docker-compose.yml     ← One-command deploy
```

## License

MIT
