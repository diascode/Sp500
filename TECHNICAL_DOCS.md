# MOMENTUM — Technical Documentation

*Version 5.4 — July 2026*

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Repository Structure](#2-repository-structure)
3. [Environment & Configuration](#3-environment--configuration)
4. [Server (server.js)](#4-server-serverjs)
   - [Startup & Boot Sequence](#41-startup--boot-sequence)
   - [Request Handler](#42-request-handler)
   - [Security Middleware](#43-security-middleware)
   - [Authentication System](#44-authentication-system)
   - [Rate Limiting](#45-rate-limiting)
   - [Caching Layer](#46-caching-layer)
   - [User Database](#47-user-database)
   - [Subscription & Tier System](#48-subscription--tier-system)
5. [API Reference](#5-api-reference)
   - [Auth Endpoints](#51-auth-endpoints)
   - [GDPR Endpoints](#52-gdpr-endpoints)
   - [Admin Endpoints](#53-admin-endpoints)
   - [Stock Data Endpoints](#54-stock-data-endpoints)
   - [Stripe Endpoints](#55-stripe-endpoints)
   - [Utility Endpoints](#56-utility-endpoints)
6. [Frontend (stock-dashboard.html)](#6-frontend-stock-dashboardhtml)
   - [State Management](#61-state-management)
   - [i18n System](#62-i18n-system)
   - [Rendering Architecture](#63-rendering-architecture)
   - [Technical Analysis Engine](#64-technical-analysis-engine)
   - [Chart Renderer](#65-chart-renderer)
   - [Portfolio Engine](#66-portfolio-engine)
   - [Pattern Finder](#67-pattern-finder-patterns-tab)
   - [Interactive Lesson System](#68-interactive-primeiros-passos-lesson-system)
7. [Stock Universes](#7-stock-universes)
8. [Data Flow Diagrams](#8-data-flow-diagrams)
9. [Docker & Deployment](#9-docker--deployment)
10. [Security Model](#10-security-model)
11. [Known Limitations & Migration Plan](#11-known-limitations--migration-plan)
12. [Development Guide](#12-development-guide)

---

## 1. Architecture Overview

MOMENTUM is a **monolithic, server-rendered single-page application** deliberately built with minimal dependencies to keep operational complexity near zero.

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│                                                     │
│  stock-dashboard.html  (Vanilla JS SPA ~6,500 lines)│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Auth UI │ │ Scanner  │ │Portfolio │  ...        │
│  └──────────┘ └──────────┘ └──────────┘            │
│                    localStorage                     │
│          (JWT token, portfolio, preferences)        │
└─────────────────────────┬───────────────────────────┘
                          │ HTTP (port 8081 → 8080)
┌─────────────────────────▼───────────────────────────┐
│              Docker Container                       │
│                                                     │
│  server.js  (Node.js, no framework)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │   Auth   │ │  Stock   │ │  Stripe  │            │
│  │  Routes  │ │  Routes  │ │  Webhook │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  /app/data/users.json   (user records)              │
└─────────────────────────┬───────────────────────────┘
                          │ HTTPS
          ┌───────────────┴───────────────┐
          │                               │
   ┌──────▼──────┐               ┌────────▼───────┐
   │Yahoo Finance│               │  Stripe API    │
   │  (unofficial│               │  (payments)    │
   │   proxy)    │               └────────────────┘
   └─────────────┘
```

**Key design decisions:**

| Decision | Rationale |
|---|---|
| No framework (Node.js raw `http`) | Zero dependency surface; trivial Docker image size |
| Single HTML file frontend | No build step; deploy by copying one file |
| localStorage for portfolio | No server storage cost; data owned by user |
| JSON file for users | Zero-ops until ~5k users; atomic writes prevent corruption |
| Server-side Yahoo proxy | Avoids CORS; allows caching; hides user IPs from third party |
| Vanilla JS (no React/Vue) | No build toolchain; fully readable in browser devtools |

---

## 2. Repository Structure

```
Momentum/
├── server.js                 # Full backend — auth, stock proxy, Stripe, admin
├── stock-dashboard.html      # Full frontend SPA — all UI, charts, logic (~6,500 lines)
├── legend.html               # Static legend/help page
├── package.json              # Dependencies: jsonwebtoken, stripe
├── Dockerfile                # Node 22 Alpine, non-root appuser
├── docker-compose.yml        # Port 8081→8080, env vars, volume mount
├── .env.example              # Template for required environment variables
├── static/
│   ├── app.css               # Global stylesheet
│   ├── fx.js                 # Currency / FX helpers (~111 lines)
│   ├── i18n.js               # Translation strings — LANGS.en + LANGS.pt (~1,011 lines)
│   ├── indicators.js         # TA indicator stubs / exports (~37 lines)
│   ├── lessons.js            # Interactive lesson data — window.LESSON_DATA (~2,188 lines)
│   └── patterns.js           # Chart pattern definitions (~83 lines)
├── .github/
│   └── workflows/
│       └── backup.yml        # GitHub Actions: daily backup to backups branch
├── data/
│   ├── users.json            # User database (created at first signup)
│   └── tokens.json           # Pending reset/verify tokens (persisted across restarts)
├── .claude/
│   ├── settings.json         # Claude Code permissions
│   └── commands/
│       └── regression.md     # /regression slash command definition
├── STARTUP.md                # Business / investor document
├── USER_STORIES.md           # Product user stories
└── TECHNICAL_DOCS.md         # This file
```

**Runtime-generated files:**

| File | When Created | Purpose |
|---|---|---|
| `data/users.json` | First signup | Persistent user records |
| `data/users.json.tmp.<pid>` | During save | Atomic write temp file (auto-deleted) |
| `data/tokens.json` | First token issued | Reset and verify tokens — persists across restarts |
| `data/feature-flags.json` | First admin toggle | Feature flag overrides (defaults in `server.js`) |

---

## 3. Environment & Configuration

Copy `.env.example` to `.env` and fill in values before running.

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | **Yes** | — | Secret for signing JWTs. Min 32 chars. Generate: `openssl rand -hex 64` |
| `APP_URL` | **Yes** | `http://localhost:8080` | Public URL — used for email links and Stripe redirect URLs. Production: `https://www.craquei.com.br` |
| `NODE_ENV` | No | `development` | Set to `production` to enable JWT_SECRET safety guard |
| `PORT` | No | `8080` | Port the server listens on inside the container |
| `HOST` | No | `0.0.0.0` | Bind address |
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key (`sk_live_...`). Leave blank to disable payments |
| `STRIPE_PRICE_PRO_MONTHLY` | No | — | Stripe Price ID for the Pro plan (`price_...`) |
| `STRIPE_WEBHOOK_SECRET` | No | — | Stripe webhook signing secret (`whsec_...`) |
| `RESEND_API_KEY` | No | — | Resend API key for transactional email (verification, password reset) |
| `BRAPI_TOKEN` | No | — | brapi.dev token for official B3 data. Falls back to Yahoo Finance if unset |

**Production safety guard:**

If `NODE_ENV=production` and `JWT_SECRET` is missing or equals the default dev value, the server calls `process.exit(1)` at boot. This prevents silent insecure deployments.

```js
if (ENV.NODE_ENV === 'production' && (!ENV.JWT_SECRET || JWT_SECRET === 'dev-secret-change-me')) {
  console.error('❌ FATAL: JWT_SECRET is not set or is using the default dev value.');
  process.exit(1);
}
```

---

## 4. Server (server.js)

### 4.1 Startup & Boot Sequence

1. `loadEnv()` — reads `.env` file (if present), then overrides with `process.env` values.
2. JWT secret validation — exits if in production with default secret.
3. `loadUsers()` — reads `data/users.json`; returns `[]` if file doesn't exist.
4. Admin enforcement — ensures the hardcoded admin email always has `tier: 'admin'`; strips admin tier from any other account that may have it.
5. Optional Stripe init — only if `STRIPE_SECRET_KEY` is set and doesn't equal the placeholder.
6. `http.createServer(handleRequest)` → `server.listen(PORT, HOST)`.
7. Startup log printed to stdout (version, market count, user count, Stripe status).

### 4.2 Request Handler

All requests funnel through a single `async function handleRequest(req, res)`.

Flow:

```
Request
  │
  ├─ Set security + CORS headers (always)
  ├─ Handle OPTIONS preflight → 204
  ├─ Auth rate limit check (login/signup only)
  │
  ├─ /api/auth/*          → Auth routes
  ├─ /api/admin/*         → Admin routes (admin JWT required)
  ├─ /api/stripe/*        → Stripe routes (auth required, except webhook)
  ├─ /api/limit           → Scan limit check
  ├─ /api/universes       → Universe metadata
  ├─ /api/universe/:id    → Tier-limited stock list
  ├─ /api/history/:ticker → Yahoo proxy (auth + scan limit)
  ├─ /api/news/:ticker    → Yahoo news proxy
  ├─ /api/scan            → Full market scan (auth + scan limit)
  ├─ /api/calendar        → Economic calendar
  │
  └─ Static file serving  → stock-dashboard.html (SPA fallback)
```

### 4.3 Security Middleware

Applied to **every** response before any route logic:

```js
res.setHeader('Access-Control-Allow-Origin', ENV.APP_URL);   // No wildcard
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
```

### 4.4 Authentication System

**Token format:** JWT (HS256 algorithm via `jsonwebtoken` library).

**Payload:**
```json
{ "id": 1, "email": "user@example.com", "tier": "free" }
```

**Expiry:** 30 days.

**Mandatory email verification:**

Email verification is enforced at login. Users who have not confirmed their email cannot obtain a JWT:

- `POST /api/auth/signup` — creates the account, sends verification email, returns `{ pending: true, email }`. **No JWT issued.**
- `POST /api/auth/login` — if `emailVerified === false`, returns HTTP 403 `{ error: "EMAIL_NOT_VERIFIED", email }`.
- `GET /api/auth/verify-email?token=...` — marks the account as verified; the user can then log in normally.

The frontend responds to both `pending` and `EMAIL_NOT_VERIFIED` by displaying a full-screen verification wall (`showVerifyPendingWall(email)`) with a resend button. The resend uses `POST /api/auth/resend-verification-public` (no JWT required) with a 60-second per-email cooldown.

**Token persistence (`data/tokens.json`):**

Reset and verification tokens were previously stored in in-memory Maps and lost on server restart. They are now persisted to `data/tokens.json` on every mutation and reloaded at boot (expired tokens are filtered out on load). This ensures password-reset and verification links remain valid across Railway redeployments.

**Token extraction:**

```js
function getAuthUser(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return verifyToken(token); // returns null on invalid/expired
}
```

**Password hashing:**

Uses Node.js built-in `crypto.scryptSync` (memory-hard, secure against GPU cracking):

```js
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return salt + ':' + hash;   // stored as "salt:hash"
}
```

### 4.5 Rate Limiting

**Auth rate limiter** (IP-based):

- Applies to `POST /api/auth/login` and `POST /api/auth/signup`.
- Max **10 attempts per IP per 15 minutes**.
- State stored in an in-memory `Map`; resets after window expires.
- Returns HTTP 429 with message: `"Too many attempts. Please wait 15 minutes."`

```js
const _authAttempts = new Map();
const AUTH_MAX = 10;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
```

> **Note:** The in-memory map is cleared on server restart. For multi-instance deployments this would need a shared store (Redis).

**Body size limit:**

All `readBody()` calls enforce a 1 MB maximum. Requests exceeding this are rejected before reading completes:

```js
function readBody(req, maxBytes = 1_048_576) { ... }
```

### 4.6 Caching Layer

An in-memory `Map` caches Yahoo Finance responses to reduce upstream calls:

```js
const _cache = new Map();
const CACHE_TTL_MS = 60_000; // 60 seconds
```

Cache keys:
- `chart:<TICKER>` — OHLCV history data
- `news:<TICKER>` — news headlines

`cacheGet(key)` returns `null` if missing or expired (auto-deletes stale entry).
`cacheSet(key, data, ttlMs)` stores data with an absolute expiry timestamp.

A 60-second TTL means a full scan of 50 US stocks refreshes data at most once per minute regardless of how many users click SCAN simultaneously.

### 4.7 User Database

**File:** `data/users.json`

**Schema (per user record):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "password": "saltHex:hashHex",
  "tier": "free",
  "createdAt": "2026-01-15T10:30:00.000Z",
  "subscriptionId": "cus_xxxxxxxx",
  "subscriptionEnd": "2027-01-15T10:30:00.000Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Auto-incremented from `Math.max(...ids) + 1` |
| `email` | string | Lowercased on write; case-insensitive on lookup |
| `password` | string | `scrypt` hash in `salt:hash` format — never plain text |
| `tier` | `"free"` \| `"pro"` \| `"admin"` | Enforced on every request |
| `createdAt` | ISO 8601 string | Set at signup |
| `subscriptionId` | string \| null | Stripe customer ID |
| `subscriptionEnd` | ISO 8601 string \| null | Checked on every `getTier()` call |

**Atomic writes:**

```js
function saveUsers(users) {
  const tmp = DB_PATH + '.tmp.' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(users, null, 2));
  fs.renameSync(tmp, DB_PATH); // atomic on POSIX
}
```

`fs.renameSync` is atomic on Linux/macOS — a partial write can never leave `users.json` in a corrupt state. The `.tmp.<pid>` suffix prevents collision when multiple Node processes run concurrently.

### 4.8 Subscription & Tier System

**Tier capabilities:**

```js
const TIERS = {
  free:  { maxTrackedPicks: 5,    maxStocksPerMarket: 5  },
  pro:   { maxTrackedPicks: 9999, maxStocksPerMarket: 9999 },
  admin: { maxTrackedPicks: 9999, maxStocksPerMarket: 9999 },
};
```

**Expiry enforcement:**

`getTier(email)` checks `subscriptionEnd` on every call. If a Pro user's subscription has lapsed, their tier is silently downgraded to `free` and saved:

```js
if (user.tier === 'pro' && user.subscriptionEnd) {
  if (new Date(user.subscriptionEnd) < new Date()) {
    user.tier = 'free';
    saveUsers(users);
    return TIERS.free;
  }
}
```

---

## 5. API Reference

All endpoints return `Content-Type: application/json`. Authentication uses `Authorization: Bearer <JWT>`.

### 5.1 Auth Endpoints

#### `POST /api/auth/signup`

Create a new user account.

**Request body:**
```json
{ "email": "user@example.com", "password": "mypassword" }
```

**Responses:**

| Code | Body | Condition |
|---|---|---|
| 201 | `{ pending: true, email }` | Account created — verification email sent, no JWT |
| 400 | `{ error }` | Missing fields or password < 6 chars |
| 409 | `{ error }` | Duplicate email or CPF |
| 429 | `{ error }` | Rate limit exceeded |

> **No JWT is issued on signup.** The user must verify their email before they can log in.

---

#### `POST /api/auth/login`

Authenticate an existing user.

**Request body:**
```json
{ "email": "user@example.com", "password": "mypassword" }
```

**Responses:**

| Code | Body | Condition |
|---|---|---|
| 200 | `{ token, user: { id, email, tier } }` | Success |
| 400 | `{ error }` | Missing fields |
| 401 | `{ error: "Email ou senha inválidos" }` | Wrong credentials |
| 403 | `{ error: "EMAIL_NOT_VERIFIED", email }` | Correct credentials but email not confirmed |
| 429 | `{ error }` | Rate limit exceeded |

---

#### `GET /api/auth/me`

Return the current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Responses:**

| Code | Body | Condition |
|---|---|---|
| 200 | `{ id, email, tier, subscriptionEnd }` | Valid token |
| 401 | `{ error }` | Missing or invalid token |

---

#### `POST /api/auth/change-password`

Change the authenticated user's password.

**Request body:**
```json
{ "oldPassword": "current", "newPassword": "newone123" }
```

**Responses:**

| Code | Body | Condition |
|---|---|---|
| 200 | `{ ok: true }` | Success |
| 400 | `{ error }` | Missing fields, wrong current password, or new password too short |
| 401 | `{ error }` | Not authenticated |

---

---

#### `POST /api/auth/resend-verification-public`

Resend the verification email without requiring a JWT. Used by the frontend pending-wall for users who are not yet logged in.

**Request body:**
```json
{ "email": "user@example.com" }
```

**Responses:**

| Code | Body | Condition |
|---|---|---|
| 200 | `{ ok: true }` | Email sent (or user doesn't exist — silent, no enumeration) |
| 429 | `{ error }` | Called again within the 60-second cooldown |

---

#### `POST /api/auth/forgot-password`

Send a password-reset link to the given email. Always returns 200 to prevent user enumeration. The reset token is persisted to `data/tokens.json` and expires in 1 hour.

**Request body:**
```json
{ "email": "user@example.com" }
```

**Response 200:** `{ ok: true, message: "Se esse email estiver cadastrado..." }`

---

#### `POST /api/auth/reset-password`

Set a new password using a reset token from the email link.

**Request body:**
```json
{ "token": "<hex token from email>", "password": "newpassword" }
```

| Code | Body | Condition |
|---|---|---|
| 200 | `{ ok: true }` | Password updated; token invalidated |
| 400 | `{ error }` | Token expired/invalid or password < 6 chars |

---

### 5.2 GDPR Endpoints

#### `GET /api/auth/data-export`

Download all server-side data held for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "tier": "free",
  "createdAt": "2026-01-15T10:30:00.000Z",
  "subscriptionEnd": null,
  "exportedAt": "2026-05-12T09:00:00.000Z",
  "note": "Portfolio and tracking data is stored locally in your browser (localStorage)."
}
```

---

#### `DELETE /api/auth/account`

Permanently delete the authenticated user's account.

**Headers:** `Authorization: Bearer <token>`

**Responses:**

| Code | Body | Condition |
|---|---|---|
| 200 | `{ ok: true, message }` | Account deleted |
| 400 | `{ error: "Cannot delete admin account" }` | Admin attempted self-delete |
| 401 | `{ error }` | Not authenticated |
| 404 | `{ error }` | User not found |

---

### 5.3 Admin Endpoints

All admin endpoints require a valid JWT for the hardcoded admin email (`thiagotupa@hotmail.com`). Any other JWT receives HTTP 403.

#### `GET /api/admin/users`

List all registered users with stats.

**Response 200:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "tier": "free",
      "createdAt": "...",
      "subscriptionEnd": null,
      "isSubscribed": false
    }
  ],
  "stats": {
    "total": 10,
    "free": 8,
    "pro": 1,
    "admin": 1,
    "activeSubscriptions": 1
  }
}
```

---

#### `POST /api/admin/set-tier`

Manually set a user's tier to `free` or `pro`.

**Request body:**
```json
{ "email": "target@example.com", "tier": "pro" }
```

- Setting to `pro` grants a 1-year `subscriptionEnd` if the user has no active subscription.
- Setting to `free` clears `subscriptionEnd`.
- Cannot change the admin account's tier.

**Response 200:**
```json
{ "ok": true, "email": "target@example.com", "tier": "pro", "subscriptionEnd": "2027-05-12T..." }
```

---

#### `POST /api/admin/set-admin`

Grant or revoke admin tier.

**Request body:**
```json
{ "email": "target@example.com", "admin": true }
```

> This endpoint exists for future multi-admin scenarios. Currently the admin email is hardcoded in server.js.

---

---

#### `GET /api/admin/backup`

Download the full `users.json` as a JSON file. Used by the GitHub Actions daily backup workflow.

**Headers:** `Authorization: Bearer <admin-token>`

**Response 200:** Raw `users.json` array with `Content-Disposition: attachment; filename="users-YYYY-MM-DD.json"`.

> Contains hashed passwords, emails, CPFs, and Stripe IDs. Store only in private/encrypted destinations.

---

### 5.4 Stock Data Endpoints

#### `GET /api/universes`

Return metadata for all four markets, with tier-aware `visibleCount`.

**Response 200:**
```json
[
  { "id": "us",       "name": "United States",    "label": "🇺🇸 S&P 500",          "count": 50, "visibleCount": 5 },
  { "id": "brasil",   "name": "Brasil B3",        "label": "🇧🇷 B3",               "count": 24, "visibleCount": 5 },
  { "id": "europe",   "name": "Europe",           "label": "🇪🇺 STOXX 600",        "count": 30, "visibleCount": 5 },
  { "id": "emerging", "name": "Emerging Markets", "label": "🌍 Emerging Markets",  "count": 44, "visibleCount": 5 }
]
```

---

#### `GET /api/universe/:market`

Return the tier-limited stock list for a market (`us`, `europe`, `emerging`).

**Headers:** `Authorization: Bearer <token>` (optional — unauthenticated defaults to free tier)

**Response 200:**
```json
{
  "stocks": [{ "t": "AAPL", "n": "Apple Inc.", "s": "Technology" }],
  "total": 50,
  "visible": 5,
  "tier": "Free"
}
```

---

#### `GET /api/history/:ticker`

Proxy to Yahoo Finance chart API. Returns 5-year daily OHLCV data for the given ticker.

**Headers:** `Authorization: Bearer <token>` (**required**)

**Cache:** 60-second in-memory TTL per ticker.

**Responses:**

| Code | Condition |
|---|---|
| 200 | Yahoo Finance chart JSON |
| 401 | Not authenticated |
| 429 | Daily scan limit reached |
| 502 | Yahoo returned an error |

**Response 200 — Example (abbreviated):**
```json
{
  "chart": {
    "result": [
      {
        "meta": {
          "currency": "USD",
          "symbol": "AAPL",
          "exchangeName": "NMS",
          "regularMarketPrice": 213.49,
          "previousClose": 210.62
        },
        "timestamp": [1704067200, 1704153600, 1704240000],
        "indicators": {
          "quote": [
            {
              "open":  [185.59, 183.92, 184.35],
              "high":  [186.74, 185.26, 185.88],
              "low":   [183.43, 183.31, 183.50],
              "close": [185.85, 184.37, 184.92],
              "volume":[71879800, 52455900, 44694300]
            }
          ]
        }
      }
    ],
    "error": null
  }
}
```

The server passes the raw Yahoo Finance response directly. The frontend reads timestamps + indicators.quote[0] arrays to build the OHLCV candle array for indicator computation and charting.

---

#### `GET /api/news/:ticker`

Proxy to Yahoo Finance search API. Returns up to 5 news headlines.

**Cache:** 60-second in-memory TTL per ticker.

**Response 200:**
```json
[
  {
    "title": "Apple reports record earnings",
    "link": "https://...",
    "publisher": "Reuters",
    "summary": "..."
  }
]
```

---

#### `GET /api/scan`

Fetch and return OHLCV data for all stocks across all markets in one call. Intended for bulk background refresh.

**Headers:** `Authorization: Bearer <token>` (**required**)

> This endpoint is expensive — it fetches all tickers for all markets. The frontend instead calls `/api/history/:ticker` per stock during an interactive scan.

---

#### `GET /api/limit`

Return the current scan limit state for the authenticated user.

**Response 200:**
```json
{
  "allowed": true,
  "tier": "Pro",
  "scansRemaining": 999950,
  "scanInterval": 80
}
```

---

### 5.5 Stripe Endpoints

#### `GET /api/stripe/create-checkout`

Create a Stripe Checkout session for the Pro subscription.

**Headers:** `Authorization: Bearer <token>`

**Response 200:** `{ "url": "https://checkout.stripe.com/..." }`

---

#### `GET /api/stripe/create-portal`

Open the Stripe Billing Portal for subscription management.

**Headers:** `Authorization: Bearer <token>`

Requires the user to have a `subscriptionId` (Stripe customer ID).

**Response 200:** `{ "url": "https://billing.stripe.com/..." }`

---

#### `POST /api/stripe/webhook`

Receive and process Stripe webhook events. Validates the `Stripe-Signature` header using `STRIPE_WEBHOOK_SECRET`.

**Handled events:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Set user `tier = 'pro'`, save `subscriptionId` and `subscriptionEnd` |
| `customer.subscription.updated` | Update `subscriptionEnd`; downgrade to `free` if status is not `active`/`trialing` |
| `customer.subscription.deleted` | Set `tier = 'free'`, clear `subscriptionEnd` |

**Customer email resolution:** Both `checkout.session.completed` and subscription events retrieve the customer email via `stripe.customers.retrieve(customerId)` as a fallback, since `customer_email` is not always present on subscription objects.

---

### 5.6 Utility Endpoints

#### `GET /api/calendar`

Return a list of upcoming economic calendar events generated server-side (no external API).

**Response 200:**
```json
[
  {
    "date": "2026-05-21",
    "title": "🛢️ EIA Crude Oil Inventories",
    "title_pt": "🛢️ Estoques de Petróleo EIA",
    "impact": "medium",
    "market": "us",
    "note": "Rising inventories bearish for oil → watch PETR4",
    "note_pt": "Estoques em alta são baixistas para petróleo → observar PETR4",
    "tickers_up": ["PETR4.SA", "XOM", "CVX"],
    "tickers_down": [],
    "links": [{ "label": "EIA", "url": "https://www.eia.gov/petroleum/supply/weekly/" }]
  },
  {
    "date": "2026-05-22",
    "title": "📊 US Jobless Claims",
    "title_pt": "📊 Pedidos de Auxílio-Desemprego EUA",
    "impact": "high",
    "market": "us",
    "note": "Weak claims → growth concern → defensive rotation",
    "note_pt": "Pedidos fracos → preocupação com crescimento → rotação defensiva",
    "tickers_up": [],
    "tickers_down": ["SPY", "QQQ"],
    "links": [{ "label": "DOL", "url": "https://www.dol.gov/ui/data.pdf" }]
  }
]
```

---

## 6. Frontend (stock-dashboard.html)

### 6.1 State Management

All mutable state lives in module-scoped variables (no framework, no store):

```js
let authUser = null;           // { id, email, tier } or null
let _lang = 'en';              // 'en' | 'pt'
let _currentMarket = 'us';     // 'us' | 'europe' | 'emerging'
let _signalFilter = 'buy';     // 'buy' | 'neutral' | 'sell' | 'all'
let _taxReportMonth = '';      // 'YYYY-MM' or '' for all time
let _lastScanResults = null;   // raw scan data cache
let _simPattern     = null;    // active pattern name filter (null = all)
let _simDir         = 'all';   // 'all' | 'bull' | 'bear' | 'neutral'
let _simExpanded    = null;    // ticker of expanded pattern-finder row
let _simCandles     = [];      // candles for currently expanded row
let _portfolioMonthFilter = 'all'; // '3m'|'6m'|'12m'|'all'|'YYYY-MM'
// Primeiros Passos lesson state
let _eduTopic     = 'strategy'; // active topic id
let _lessonStep   = 1;          // 1–4 = content section, 5 = quiz
let _quizAnswers  = {};         // { questionIndex: answerIndex }
let _quizSubmitted = false;     // true after "Ver Resultado" clicked
```

**Persistent state (localStorage keys):**

| Key | Type | Description |
|---|---|---|
| `jerry_token` | string | JWT for current session |
| `jerry_lang` | `'en'` \| `'pt'` | Language preference |
| `jerry_theme` | string | Active theme name |
| `jerry_font` | number | Zoom multiplier |
| `jerry_picks` | JSON array | Tracked picks |
| `jerry_portfolio` | JSON array | Portfolio positions |
| `jerry_prices` | JSON object | Last known prices per ticker |
| `jerry_tax_rate` | string | Tax rate for estimate (default: `'30'`) |
| `darf_carry_swing` | number | Accumulated swing loss carryforward (R$) |
| `darf_carry_daytrade` | number | Accumulated day-trade loss carryforward (R$) |
| `momentum_consent` | `'1'` | Cookie/LGPD consent accepted flag |

**Email verification wall:**

When signup or login returns a pending/unverified state, the frontend calls `showVerifyPendingWall(email)`, which appends a full-screen overlay (`#verifyPendingWall`) blocking app access. The overlay shows the email address, a "Reenviar email de ativação" button (calls `resendVerifyPublic()` → `/api/auth/resend-verification-public`), and a "Voltar" button that removes the wall. When the user clicks the verification link, `?verify=` handling removes the wall and prompts login.

### 6.2 i18n System

**Language lookup:**

```js
function t(key) {
  return (LANGS[_lang] && LANGS[_lang][key]) || LANGS['en'][key] || key;
}
```

`LANGS` is an object with `en` and `pt` sub-objects. Every UI string that needs translation has a key. Keys are namespaced by feature area using a category prefix (see Section 12 — Adding a Translation Key for the full category list). Example:

```js
LANGS.en = {
  portfolio_sell: '💰 SELL',
  portfolio_sharesToSell: 'SHARES TO SELL (max',
  taxReport_title: '📓 TRADING JOURNAL — P&L SUMMARY',
  // ...
}
```

> **Sprint 2 expansion:** `LANGS` was expanded from ~7 keys to ~180 keys per language, covering all render functions across every view (stock cards, portfolio, tracked picks, tax report, education, footer, auth). All render functions are wired to call `t()` for every user-facing string — no raw string literals remain in rendering code.

**`applyLang()`** is called on language switch and page load. It updates static DOM elements (tab labels, status bar, auth modal text). Dynamic content uses `t()` inline inside rendering functions.

**`switchLang(lang)`** — sets `_lang`, saves to localStorage, calls `applyLang()`, and re-renders all currently visible dynamic views.

**Language selector visibility:** From Sprint 2 onwards the `<select id="langSelect">` is publicly visible to all users regardless of tier or auth state. The previous admin-only gate has been removed from `updateAuthUI()`.

**Auto-detection:** `init()` reads `navigator.language` on first load. If no `jerry_lang` preference is stored and the detected language starts with `'pt'`, `_lang` is set to `'pt'` before any UI renders.

#### 6.2.1 Currency Symbol Helper

`getCurrencySymbol(ticker)` derives the correct currency symbol from the Yahoo Finance ticker suffix. No conversion math is performed — this is display-only labeling.

```js
function getCurrencySymbol(ticker) {
  const t = (ticker || '').toUpperCase();
  if (t.endsWith('.SA'))                                      return 'R$';
  if (t.endsWith('.L'))                                       return '£';
  if (['.DE','.PA','.AS','.MC','.MI','.BR'].some(s => t.endsWith(s))) return '€';
  if (t.endsWith('.NS') || t.endsWith('.BO'))                 return '₹';
  if (t.endsWith('.MX'))                                      return 'MX$';
  if (t.endsWith('.JO'))                                      return 'R';
  return '$';  // US and unknown
}
```

**Suffix → symbol mapping:**

| Suffix | Market | Symbol |
|---|---|---|
| `.SA` | Brazil B3 | `R$` |
| `.L` | UK LSE | `£` |
| `.DE` | Germany XETRA | `€` |
| `.PA` | France Euronext | `€` |
| `.AS` | Netherlands AEX | `€` |
| `.MC` | Spain BME | `€` |
| `.MI` | Italy Borsa Italiana | `€` |
| `.BR` | Belgium Euronext | `€` |
| `.NS` / `.BO` | India NSE / BSE | `₹` |
| `.MX` | Mexico BMV | `MX$` |
| `.JO` | South Africa JSE | `R` |
| (none) | US and fallback | `$` |

All ~25 hardcoded `$` price strings across the app (stock cards, chart tooltips, portfolio table, tracked picks table, CSV/MD exports) call `getCurrencySymbol(ticker)` instead of embedding a literal `$`. The `card_tp` and `card_sl` LANGS keys no longer embed a currency symbol — the symbol is prepended at render time.

### 6.3 Rendering Architecture

All views are rendered by injecting HTML strings into container elements. There is no virtual DOM or diffing — views are fully re-rendered on state change.

**Main render functions:**

| Function | Container | Triggered by |
|---|---|---|
| `renderDashboard()` | `#dashboard` | Scan complete, signal filter change |
| `renderTrackedPicks()` | `#dashboard` | showTrackedView(), refresh |
| `renderPortfolioView()` | `#dashboard` | showPortfolioView(), position change |
| `generateTaxReport()` | `#dashboard` | Button click, month/rate change |
| `showUniverseView()` | `#dashboard` | Tab click |
| `showEducationView()` | `#dashboard` | Tab click |
| `showAdminView()` | `#dashboard` | Tab click (admin only) |
| `renderPatternFinder()` | `#dashboard` | showSimulateView(), direction/pattern filter, expand row |
| `updatePortfolioSidebar()` | `.side-card` | Any portfolio mutation |

**Navigation pattern:**

```js
function showPortfolioView() {
  clearActiveTab();
  document.getElementById('portfolioTabBtn').classList.add('active-market');
  renderPortfolioView();
}
```

Tabs do not use routing or URLs — they are purely in-memory view switches.

**Stats bar:** The stats bar no longer shows the "UNIVERSE:" / "UNIVERSO:" label — only the count and "stocks"/"ativos" label are displayed.

### 6.4 Technical Analysis Engine

All indicator computation runs client-side in the browser from raw OHLCV arrays returned by the server.

**Input format (from Yahoo Finance via `/api/history/:ticker`):**

```js
const timestamps = data.chart.result[0].timestamp;        // Unix seconds array
const closes     = data.chart.result[0].indicators.quote[0].close;
const highs      = data.chart.result[0].indicators.quote[0].high;
const lows       = data.chart.result[0].indicators.quote[0].low;
const volumes    = data.chart.result[0].indicators.quote[0].volume;
```

**Indicators computed:**

| Indicator | Period | Logic |
|---|---|---|
| **RSI** | 14 | Wilder smoothing; buy zone 45–65, oversold <35 |
| **MACD** | 12/26/9 | EMA difference + signal line; bullish if MACD > 0 |
| **ADX** | 14 | Average True Range smoothed; trend confirmed if >25 |
| **SMA** | 9, 20, 50, 200 | Simple moving average; bullish if price > SMA |
| **Bollinger Bands** | 20, 2σ | Squeeze / breakout detection |
| **ATR** | 14 | Average True Range for TP/SL band sizing |
| **Volume Ratio** | 20-day avg | Current volume vs. 20-day average |
| **Support / Resistance** | 20-day | Recent swing lows (S1) and highs (R1, R2) |
| **Pattern Detection** | 5-candle | Doji, Hammer, Engulfing, Morning Star |

**Composite scoring → signal:**

Each indicator contributes a score (+1, +0.5, 0, -0.5, or -1). The sum determines:
- Score ≥ 2.5 → **BUY**
- Score ≤ -1.0 → **SELL**
- Otherwise → **HOLD**

**TP / SL bands:**

```js
tp  = currentPrice + (atr * 2.0)
sl  = currentPrice - (atr * 1.5)
entryZone = [support1, support1 + atr * 0.5]
```

### 6.5 Chart Renderer

Charts are drawn on a `<canvas>` element using the 2D Canvas API directly (no Chart.js or similar).

**Rendered elements:**
- Candlestick bars (OHLC)
- SMA lines (9, 20, 50, 200) — toggled via buttons
- Bollinger Bands upper/lower/mid — toggled via button
- Volume bars at the bottom
- Crosshair on hover with OHLCV tooltip

**Period buttons:** 1D, 1M, 3M, 6M, 1Y, 5Y — slice the data array to the relevant window and redraw.

**Responsive sizing:** Canvas width is set to the container's `clientWidth` on render and on `window.resize`.

### 6.6 Portfolio Engine

Portfolio is a flat JSON array in localStorage under key `jerry_portfolio`.

**Position schema:**

```js
{
  ticker:    'AAPL',
  quantity:  10,
  buyPrice:  150.00,
  sellPrice: null,          // null = holding
  buyDate:   '2024-01-15',
  sellDate:  null,          // null = holding
  status:    'holding'      // 'holding' | 'sold'
}
```

**Partial sell logic:**

When `sellQty < position.quantity`:
```js
// Reduce the existing holding
state.portfolio[index] = { ...position, quantity: position.quantity - sellQty };

// Append a new closed entry
state.portfolio.push({
  ticker: position.ticker,
  quantity: sellQty,
  buyPrice: position.buyPrice,
  sellPrice: sellPrice,
  buyDate: position.buyDate,
  sellDate: sellDate,
  status: 'sold'
});
```

**P&L calculation:**
```js
// Realized (sold positions)
pnl = (sellPrice - buyPrice) * quantity

// Unrealized (holding positions)
currentPrice = getPortfolioPrice(ticker) || buyPrice
unrealizedPnl = (currentPrice - buyPrice) * quantity
```

**`getPortfolioPrice(ticker)`** looks up the last known price from `jerry_prices` (populated during scans).

#### DARF Tax Engine (Sprint 2 Phase 1)

Brazilian traders are subject to monthly capital-gains tax (DARF) on B3 equity sales. The engine covers swing trades (DARF code 6015, 17.5%) and day-trades (code 6010, 20%).

**`BR_TAX` constants:**

```js
const BR_TAX = {
  SWING_RATE:             0.175,   // 17.5% — swing trade
  DAYTRADE_RATE:          0.20,    // 20%   — day-trade
  SWING_CODE:             '6015',
  DAYTRADE_CODE:          '6010',
  SWING_EXEMPT_THRESHOLD: 20000,   // R$20k monthly sales → swing DARF exempt
  DEDODURO_RATE:          0.00005, // 0.005% IR retido na fonte
};
```

**`tradeType` field on positions:**

The position schema gains a `tradeType` field:

```js
{
  ticker:    'PETR4.SA',
  quantity:  100,
  buyPrice:  35.00,
  sellPrice: 38.50,
  buyDate:   '2026-04-10',
  sellDate:  '2026-04-15',
  status:    'sold',
  tradeType: 'swing',     // 'swing' | 'daytrade'  (defaults to 'swing')
  dedoDuro:  0.10         // IR retido na fonte (R$), entered at sell time
}
```

Existing positions without `tradeType` are treated as `'swing'` at read time without requiring migration.

**`computeDARF(month, year)` spec:**

```
1. Filter portfolio for .SA tickers, status='sold', sellDate in (month, year).
2. Split into swing[] and daytrade[] arrays by tradeType.
3. For each bucket:
   a. totalSales  = sum(sellPrice × quantity)
   b. netGain     = sum((sellPrice − buyPrice) × quantity)
   c. carryIn     = localStorage.getItem('darf_carry_swing' | 'darf_carry_daytrade') || 0
   d. taxableGain = max(0, netGain − carryIn)
   e. carryOut    = max(0, carryIn − netGain)   // reduced by gain, never below 0
   f. if netGain < 0: carryOut += abs(netGain)  // loss adds to carry
   g. dedoDuroTotal = sum(position.dedoDuro)
   h. exemptSwing  = (bucket === swing) && totalSales < BR_TAX.SWING_EXEMPT_THRESHOLD
   i. darf = exemptSwing ? 0 : max(0, taxableGain × rate − dedoDuroTotal)
4. Update localStorage carry keys with carryOut values.
5. Return { swing: { darf, taxableGain, carryOut, dedoDuro, totalSales, exempt },
            daytrade: { darf, taxableGain, carryOut, dedoDuro, totalSales } }
```

**Loss carryforward localStorage keys:**

| Key | Type | Description |
|---|---|---|
| `darf_carry_swing` | number (R$) | Accumulated swing loss not yet offset against a future gain |
| `darf_carry_daytrade` | number (R$) | Accumulated day-trade loss not yet offset |

Both keys persist in localStorage alongside the portfolio. They are displayed (read-only) in the DARF summary panel and recalculated every time `computeDARF()` is called.

**Monthly Profit / Deficit Breakdown**

The breakdown card above the disclaimer shows realized P&L grouped by month. The filter bar offers four range presets (3M / 6M / 12M / ALL) plus a `<select>` dropdown populated with all individual months that have realized trades. Selecting a specific month overrides the range preset. The section title, table column headers (MONTH / PROFIT / DEFICIT), and badge labels are all wired to `t()` for EN/PT translation.

---

### 6.7 Pattern Finder (PATTERNS Tab)

The Pattern Finder scans all stocks from `state.analyzed` against the 20 canonical chart patterns and renders a ranked, filterable result list.

**State variables:**

| Variable | Default | Description |
|---|---|---|
| `_simPattern` | `null` | Active pattern name filter; `null` = all patterns |
| `_simDir` | `'all'` | Direction filter: `'all'` \| `'bull'` \| `'bear'` \| `'neutral'` |
| `_simExpanded` | `null` | Ticker of the currently expanded row (one at a time) |
| `_simCandles` | `[]` | Full candle history of the expanded stock (used by period buttons) |

**PATTERNS array (20 entries):**

Each entry has:
```js
{
  name:    'Rounding Bottom',
  dir:     'bull',           // 'bull' | 'bear' | 'neutral'
  svg:     `<path .../>`,    // inline SVG for the pattern thumbnail
  desc:    'Gradual U-shaped bottom...',
  play:    'Buy above rounding top on uptrend confirmation.',
  desc_pt: 'Fundo gradual em forma de U...',
  play_pt: 'Comprar acima do topo arredondado...',
}
```

**`scorePatternMatch(d, patDef)`** — scores a stock against one pattern (max 9 pts):
- Direction alignment layer (0–4 pts): compares RSI, MACD, ADX, and SMA position against pattern `dir`.
- Candle shape layer (0–5 pts): heuristic inspection of the last 30–90 candles (high/low/close arrays) for structural features matching the pattern (e.g. U-shape for Rounding Bottom, higher-lows for Ascending Triangle).

**`findAllPatternMatches()`** — loops all markets in `state.analyzed`, applies `_simDir` and `_simPattern` filters, scores every stock against every matching pattern, keeps the best score per stock, and returns a score-descending array.

**UI structure:**
1. Direction buttons: ALL / ▲ BULLISH / ▼ BEARISH / ◈ NEUTRAL
2. Pattern chips: one chip per pattern in the active direction (tap to narrow further)
3. Result rows: SVG thumbnail · ticker · pattern name · signal badge · price · RSI/MACD/ADX · score bar (X/9) · expand arrow
4. Expanded row: period button bar (1D/1M/3M/6M/1Y/5Y) + candlestick chart with SMAs, Bollinger Bands, and pattern overlay lines

**`changeSimChartPeriod(ticker, period)`** — updates the active period button, slices `_simCandles` to the requested window, and redraws the chart via `drawChart()` with SMAs, Bollinger Bands, and `buildPatternOverlay()` lines.

**`buildPatternOverlay(candles, patternName)`** — returns an array of `{x1,y1,x2,y2,color,dash,width,label}` line descriptors drawn on top of the candlestick chart to annotate the pattern geometry.

---

### 6.8 Interactive Primeiros Passos Lesson System

All 23 education topics render as **interactive multi-section lessons** with inline SVG charts and a 6-question quiz. Static body-text rendering was fully replaced in Sprint 4.

#### Data Source — `static/lessons.js`

The file is loaded via `<script src="/static/lessons.js">` and populates `window.LESSON_DATA`:

```js
window.LESSON_DATA = {
  'why': {
    totalSteps: 5,           // 4 content sections + 1 quiz step
    sections: [              // array of 4 objects
      {
        icon:    '📉',
        title:   'Seu Dinheiro Está Encolhendo',
        hook:    'Você sabia que...',      // italic callout quote
        content: '<p>...</p>',             // innerHTML string
        chart:   'chartRealReturns'        // CHART_REGISTRY key or null
      },
      // ... 3 more sections
    ],
    quiz: [                  // array of 6 objects
      {
        q:               'Pergunta?',
        options:         ['A', 'B', 'C', 'D'],
        correct:         2,             // 0-based index
        correctFeedback: 'Exatamente!',
        wrongFeedback:   'Na verdade...'
      },
      // ... 5 more questions
    ]
  },
  'strategy': { ... },
  // ... 21 more topics
};
```

All 23 topics are defined: `why`, `strategy`, `diversify`, `brazilstats`, `sectors`, `realcases`, `chart_basics`, `rsi`, `macd`, `adx`, `atr`, `sma`, `bb`, `patterns`, `tesouro`, `cdb_cdi`, `lci_lca`, `juros_compostos`, `darf`, `momentum_signal`, `smart_exit`, `market_regime`, `capital_mgmt`.

#### CHART_REGISTRY

28 inline SVG chart functions are defined in `stock-dashboard.html` and registered by name in `CHART_REGISTRY` (a `const` in the inline script — not on `window`):

```js
const CHART_REGISTRY = {};
CHART_REGISTRY['chartRealReturns']     = chartRealReturns;
CHART_REGISTRY['chartCompoundInterest'] = chartCompoundInterest;
// ... 26 more entries
```

Each function returns an HTML string containing an inline `<svg>` element with CSS `@keyframes` animations. No external chart library is used.

**Chart functions by topic:**

| Key | Topic |
|---|---|
| `chartRealReturns` | why |
| `chartCompoundInterest` | why |
| `chartCostOfWaiting` | why |
| `chartPyramid` | strategy |
| `chartDiversificationRisk` | diversify |
| `chartPieAllocation` | diversify |
| `chartIbovVsSP500` | brazilstats |
| `chartSectorWeights` | sectors |
| `chartSectorRotation` | sectors |
| `chartCandlestick` | chart_basics |
| `chartTrendlines` | chart_basics |
| `chartRSIZones` | rsi |
| `chartRSIDivergence` | rsi |
| `chartMACDHistogram` | macd |
| `chartMACDCrossover` | macd |
| `chartADXStrength` | adx |
| `chartATRVolatility` | atr |
| `chartSMAGoldenCross` | sma |
| `chartBollingerBands` | bb |
| `chartBollingerSqueeze` | bb |
| `chartCandlePatterns` | patterns |
| `chartTesouroTypes` | tesouro |
| `chartCDIvsSelicRate` | cdb_cdi |
| `chartTaxComparison` | lci_lca |
| `chartCompoundSimple` | juros_compostos |
| `chartDARFCalendar` | darf |
| `chartMomentumScore` | momentum_signal |
| `chartTrailingStop` | smart_exit |
| `chartMarketRegime` | market_regime |
| `chartPositionSizing` | capital_mgmt |

#### Universal Renderer

`renderEdu()` detects whether the current topic has lesson data and routes accordingly:

```js
} else if (window.LESSON_DATA && window.LESSON_DATA[current.id]) {
  html += renderInteractiveLesson(current.id, isDone);
} else {
  // fallback: static body text (used only if a topic has no LESSON_DATA entry)
}
```

`renderInteractiveLesson(topicId, isDone)` builds:
1. **Progress pills** — one per section title + "Quiz Final"; active pill shows full title, completed pills show `✓ N`.
2. **Content area** — delegates to `renderLessonSection()`.
3. **Nav bar** — ← Anterior / Próximo → buttons; "Marcar como concluído" appears from step 4 onward.

`renderLessonSection()` reads `LESSON_DATA[_eduTopic].sections[_lessonStep - 1]`, renders `icon → title → hook → content`, then calls `CHART_REGISTRY[sec.chart]()` if a chart key is set.

`renderLessonQuiz()` reads `LESSON_DATA[_eduTopic].quiz` and renders all 6 questions with radio-style option buttons. After `submitQuiz()`, it shows per-question feedback and a total score badge.

#### Gating

`FREE_EDU_TOPICS = ['why']` — only the `why` topic is accessible without a Pro subscription. All other topics trigger `showUpgradeModal()` via `switchEduTopic()`.

#### Lesson State Functions

| Function | Action |
|---|---|
| `lessonGoTo(step)` | Set `_lessonStep`, re-render edu |
| `lessonNext()` | Advance to `min(step+1, totalSteps)` |
| `lessonPrev()` | Retreat to `max(step-1, 1)` |
| `selectQuizAnswer(qIdx, aIdx)` | Record answer, re-render |
| `submitQuiz()` | Set `_quizSubmitted = true`, re-render |
| `retryQuiz()` | Clear answers and submitted flag, re-render |
| `switchEduTopic(id)` | Reset lesson state, set `_eduTopic`, re-render |

---

## 7. Stock Universes

The universe is defined in `server.js` as a static `UNIVERSES` object.

| Market | Count | Coverage |
|---|---|---|
| `us` | 50 | S&P 500 blue-chips across 12 sectors |
| `brasil` | 24 | B3 blue-chips — Petrobras, Vale, Itaú, Bradesco, Ambev, WEG and 18 others |
| `europe` | 30 | STOXX 600 blue-chips (Germany, France, UK, Netherlands, Spain, Italy, Belgium) |
| `emerging` | 44 | Mexico (6), India (5), China ADRs (5), South Africa (2), Chile (1), Poland (1) — note: B3 tickers moved to `brasil` market |

**Stock record fields:**

```js
// US
{ t: 'AAPL',    n: 'Apple Inc.',    s: 'Technology' }

// Europe (adds market)
{ t: 'SAP.DE',  n: 'SAP SE',        s: 'Technology',  m: 'Germany' }

// Emerging (adds region)
{ t: 'PETR4.SA', n: 'Petrobras PN', s: 'Energy',       r: 'Brazil' }
```

Ticker symbols follow Yahoo Finance conventions:
- US stocks: plain ticker (`AAPL`)
- German stocks: `.DE` suffix (`SAP.DE`)
- Brazilian B3 stocks: `.SA` suffix (`PETR4.SA`)
- French stocks: `.PA` suffix (`MC.PA`)

---

## 8. Data Flow Diagrams

### Scan Flow

```
User clicks SCAN
       │
       ▼
scanAll()
  ├─ GET /api/universes          → get tier-limited count per market
  └─ for each ticker in market:
       GET /api/history/:ticker   → Yahoo proxy (with 60s cache)
           │
           ▼
       computeIndicators(ohlcv)   → RSI, MACD, ADX, SMA, BB, ATR
           │
           ▼
       scoreSignal(indicators)    → BUY / HOLD / SELL + score
           │
           ▼
       renderCard(result)         → inject HTML into #dashboard
           │
           ▼
       GET /api/news/:ticker      → attach headlines to card
```

### Auth Flow

```
User submits sign-in form
       │
       ▼
POST /api/auth/login
  ├─ Rate limit check (IP)
  ├─ findUser(email)
  ├─ verifyPassword(pw, stored_hash)
  └─ signToken(user) → JWT

       │
       ▼
setToken(jwt)          → localStorage.setItem('jerry_token', jwt)
authUser = { id, email, tier }
updateAuthUI()
```

### Stripe Webhook Flow

```
User completes Stripe Checkout
       │
       ▼
Stripe → POST /api/stripe/webhook
  ├─ stripe.webhooks.constructEvent(body, sig, secret)
  ├─ event.type === 'checkout.session.completed'
  │    ├─ Get email: session.customer_email
  │    │    └─ fallback: stripe.customers.retrieve(session.customer).email
  │    ├─ findUser(email)
  │    ├─ user.tier = 'pro'
  │    ├─ user.subscriptionId = session.customer
  │    ├─ user.subscriptionEnd = sub.current_period_end
  │    └─ saveUsers()
  │
  └─ event.type === 'customer.subscription.updated/deleted'
       ├─ Get email via stripe.customers.retrieve(sub.customer).email
       ├─ if status active/trialing → keep pro + update subscriptionEnd
       └─ else → tier = 'free', subscriptionEnd = null
```

---

## 9. Docker & Deployment

### Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js stock-dashboard.html legend.html ./
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /app/data && chown -R appuser:appgroup /app
USER appuser
EXPOSE 8080
CMD ["node", "server.js"]
```

Key decisions:
- **Node 22 Alpine** — minimal image size (~180 MB with deps).
- **`--omit=dev`** — production-only install; excludes devDependencies.
- **Non-root user** — `appuser` in `appgroup`. Reduces blast radius if the container is compromised.
- **`chown /app/data`** — ensures `appuser` can write `users.json` at runtime.

### docker-compose.yml

```yaml
services:
  stock-dashboard:
    build: .
    container_name: jerry-stock-dashboard
    ports:
      - "8081:8080"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - APP_URL=${APP_URL:-http://localhost:8080}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
      - STRIPE_PRICE_PRO_MONTHLY=${STRIPE_PRICE_PRO_MONTHLY:-}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 30s
      timeout: 5s
      retries: 3
```

- Port **8081** on the host maps to **8080** in the container.
- `./data` is volume-mounted so `users.json` persists across container rebuilds.
- All secrets come from environment variables — never hardcoded.

### Running Locally

```bash
# First time setup
cp .env.example .env
# Edit .env — set JWT_SECRET at minimum

# Start
JWT_SECRET=your-secret docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Production Deployment — Railway (current)

The production instance runs at **https://www.craquei.com.br** on Railway.

**Setup checklist:**

| Step | Status |
|---|---|
| GitHub repo connected | ✅ |
| Railway volume `app-data` mounted at `/app/data` | ✅ |
| `APP_URL=https://www.craquei.com.br` | ✅ |
| `JWT_SECRET` (64-char hex) | ✅ |
| `ADMIN_EMAIL` | ✅ |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | ✅ |
| `STRIPE_SECRET_KEY` (use `sk_live_...` for production) | ⚠️ sandbox |
| `STRIPE_PRICE_PRO_MONTHLY` (live price ID) | ⚠️ sandbox |
| `STRIPE_WEBHOOK_SECRET` (live webhook) | ⚠️ sandbox |

**Data persistence:** The Railway volume `app-data` is mounted at `/app/data`. Both `users.json` and `tokens.json` are written there and survive redeployments. Verified: after a forced redeploy, user count remained unchanged.

**Why not Vercel?**

Vercel's serverless functions have a **read-only filesystem** — writing to `data/users.json` is not possible. Railway is the recommended platform and is already in production.

### Daily Backup (GitHub Actions)

A scheduled workflow (`.github/workflows/backup.yml`) runs at **03:00 UTC daily** and on manual trigger:

1. Authenticates as admin via `POST /api/auth/login`
2. Downloads `GET /api/admin/backup` (full `users.json`)
3. Saves as `backups/users-YYYY-MM-DD.json` on the `backups` branch
4. Removes files older than 30 days
5. Commits with `[skip ci]` to avoid triggering a Railway redeploy

**Required GitHub secrets** (Settings → Secrets → Actions):

| Secret | Value |
|---|---|
| `CRAQUEI_ADMIN_EMAIL` | Admin account email |
| `CRAQUEI_ADMIN_PASSWORD` | Admin account password |

The `backups` branch is an orphan branch (no shared history with `master`). Manual trigger available under Actions → Daily Backup → Run workflow.

### Healthcheck

The Docker healthcheck polls `http://localhost:8080/` every 30 seconds. The container is considered healthy when the endpoint returns HTTP 200. Unhealthy containers are restarted by Docker.

---

## 10. Security Model

### Threat Model Summary

| Threat | Mitigated by |
|---|---|
| Credential stuffing | Auth rate limit (10/15min/IP) |
| Password cracking (if DB leaked) | scrypt with random 16-byte salt per user |
| JWT tampering | HS256 signature; verified on every authenticated request |
| Default secret in production | Boot-time guard; `process.exit(1)` |
| XSS via injected content | Server never injects user-controlled HTML; all user data is stored client-side in localStorage (not rendered server-side) |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| CORS misconfiguration | Origin locked to `APP_URL` — no wildcard |
| Path traversal (static files) | `fpath.startsWith(DIR)` check before `fs.readFileSync` |
| Oversized request body DoS | 1 MB hard cap in `readBody()` |
| Admin impersonation | Admin email is hardcoded in `server.js`; JWT tier field is not trusted for admin check — the server always cross-references the email against `ADMIN_EMAIL` |

### What Is NOT Mitigated (Scope for Future Sprints)

| Gap | Planned Fix |
|---|---|
| No email verification | Sprint 2: Resend/Postmark integration |
| No password reset | Sprint 2: Time-limited reset tokens |
| Portfolio data in localStorage | Sprint 3: Server-side encrypted storage |
| In-memory rate limit state | Multi-instance: Redis; single instance: acceptable |
| No CSP header | Add `Content-Security-Policy` before public launch |
| No audit log | Admin panel v2: action log per user |

---

## 11. Known Limitations & Migration Plan

### Yahoo Finance Unofficial API

**Status:** Currently used. **Risk: High (Existential).**

Yahoo Finance does not offer a public API and explicitly prohibits scraping in their Terms of Service. The server-side proxy pattern reduces the risk profile (user IPs are never sent to Yahoo; the server's IP makes the request), but Yahoo can block the server's IP at any time — instantly breaking all market scans.

**Planned migration — Hybrid data source (Sprint 3, US-75):**

Route each market to the best available official source rather than a monolithic replacement:

| Market | Current | Sprint 3 Target | Cost | Notes |
|---|---|---|---|---|
| 🇧🇷 Brasil (40 `.SA` tickers) | Yahoo Finance | **brapi.dev** | R$49.99/mo | Official B3 API, SLA-backed, 150k req/mo |
| 🇺🇸 US (51 tickers) | Yahoo Finance | Yahoo Finance (keep) | Free | No affordable mass-coverage alternative yet |
| 🇪🇺 Europe (29 tickers) | Yahoo Finance | Yahoo Finance (keep) | Free | Polygon.io covers some; not all local exchanges |
| 🌍 Emerging (20 tickers) | Yahoo Finance | Yahoo Finance (keep) | Free | Mixed exchanges — Yahoo is best single source |

**Why brapi.dev for Brasil only:**

| | Yahoo Finance | brapi.dev |
|---|---|---|
| B3 coverage | All (unofficial) | All (official) |
| ToS compliance | Prohibited | Fully compliant |
| SLA | None | 99.9% |
| Cost | Free | R$49.99/mo |
| Data delay | Near real-time | 15 min (Startup plan) |
| Ticker format | `PETR4.SA` | `PETR4` (strip `.SA`) |

**Key implementation detail:** The ticker format differs — brapi uses `PETR4`, Yahoo uses `PETR4.SA`. The `yahooFetch()` function splits into `yahooFetch()` (unchanged) and `brapiFetch(ticker)`. The B3 route strips `.SA` before calling brapi, re-attaches it in the normalized response. All downstream code (frontend, cache keys, portfolio, DARF) continues using `.SA` format — zero frontend changes required.

**brapi.dev request volume estimate at current scale:**

```
40 tickers × 10 scans/day × 30 days = 12,000 requests/month
Startup plan limit: 150,000 requests/month
Usage: ~8% of quota — no risk of hitting limits
```

**Fallback behavior:** If `BRAPI_TOKEN` is not set in the environment, the server logs a warning at startup and continues using Yahoo Finance for B3. This allows self-hosted deployments to function without a brapi.dev account.

**Full Polygon.io migration (if Yahoo blocks US/EU):**

| Plan | Price | Calls/min | B3 support | Notes |
|---|---|---|---|---|
| Free | $0 | 5/min | None | Too slow for 51-stock scan |
| Developer | $79/mo | 100/min | None | Viable for US; Europa partial |

Polygon.io is the Sprint 3 contingency plan for US/EU if Yahoo blocks server IPs. It is not in the current Sprint 3 scope because Yahoo Finance has been stable and Polygon does not cover B3.

### JSON File User Database

**Status:** Active. **Risk: High above ~5k users.**

- No query capability — all lookups are linear scans.
- No concurrent write safety beyond atomic rename.
- Single file means full file is read and written on every change.

**Migration path:**

| Trigger | Target | Effort |
|---|---|---|
| 1,000 users | **SQLite** via `better-sqlite3` | ~1 day |
| 10,000 users | **PostgreSQL** (managed, e.g. Supabase) | ~3 days |

SQLite requires no separate process, fits in the current Docker-first model, and handles 100k+ users easily. The user schema maps 1:1 to a relational table.

### i18n Coverage

**Status:** Resolved. ~180 keys per language across EN and PT, all render functions wired to `t()`, `navigator.language` auto-detection, public language toggle. Education lesson content (`lessons.js`) is currently PT-only — EN lesson content is a future sprint item.

### localStorage Portfolio

**Status:** Active. **Risk: Data loss on browser clear.**

Portfolio positions live only in the browser. A user who clears cookies/localStorage permanently loses their trading journal.

**Migration path:**
- Sprint 3: Add `POST /api/portfolio/sync` endpoint.
- Client pushes encrypted portfolio blob to server on save.
- Client decrypts on load using a key derived from the user's password.
- Opt-in initially; mandatory in v2.

---

## 12. Development Guide

### Prerequisites

- Node.js 18+
- Docker + Docker Compose
- A valid `JWT_SECRET` in `.env`

### Running Without Docker

```bash
npm install
JWT_SECRET=dev-local node server.js
# App available at http://localhost:8080
```

> Without `NODE_ENV=production`, the JWT_SECRET guard does not fire.

### Running the Regression Test Suite

The `/regression` slash command is available in Claude Code sessions:

```
/regression
```

This runs the 12-test Playwright-based suite defined in `.claude/commands/regression.md`. Screenshots are saved to `qa_screenshots/`.

### Making Frontend Changes

1. Edit `stock-dashboard.html` directly.
2. The server serves it statically with `Cache-Control: no-cache` — hard refresh (`Cmd+Shift+R`) picks up changes immediately without rebuilding Docker.
3. For server changes, rebuild: `docker compose up -d --build`.

### Adding a Translation Key

The `LANGS` object contains ~180 keys per language (as of Sprint 2). Keys are grouped by category prefix:

| Category prefix | Covers |
|---|---|
| `status_` | Signal badges: BUY, HOLD, SELL, loading, error states |
| `signals_` | Indicator pill labels (RSI, MACD, ADX, SMA, Bollinger) |
| `card_` | Stock card fields: price, TP, SL, entry zone, verdict |
| `auth_` | Sign-in / sign-up modal, change password, error messages |
| `portfolio_` | Portfolio table columns, sell modal, position actions |
| `tracked_` | Tracked picks table, refresh button, empty state |
| `taxReport_` | Trading journal headings, DARF panel, monthly breakdown |
| `edu_` | Education module section headings and body text |
| `footer_` | Footer disclaimer and links |

**Steps to add a new key:**

1. Choose the appropriate category prefix and add the key to `LANGS.en` in `stock-dashboard.html`.
2. Add the Portuguese equivalent to `LANGS.pt` immediately below (keep the two objects in sync).
3. Use `t('category_keyName')` wherever the string is rendered in a dynamic view.
4. If the string appears in a static DOM element that is not re-rendered on language switch, also call `el.textContent = t('category_keyName')` inside `applyLang()` so it updates on `switchLang()`.
5. Run the `/regression` suite to confirm no untranslated keys appear as raw key strings in either language.

### Adding a New API Endpoint

1. Add a new `if (pathname === '/api/your-route')` block inside `handleRequest()`.
2. Use `getAuthUser(req)` to authenticate.
3. Use `sendJSON(res, code, data)` for all responses.
4. Never call `res.end()` directly — use `sendJSON` or `sendError` to ensure CORS and content-type headers are always set.

### Package Dependencies

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.x",
    "stripe": "^14.x"
  }
}
```

Both are optional at runtime:
- If `jsonwebtoken` is missing, the server exits immediately with an install instruction.
- If `stripe` is not installed or `STRIPE_SECRET_KEY` is not set, Stripe endpoints return 503 and the rest of the app functions normally.

---

*End of Technical Documentation — v5.3 · June 2026*
