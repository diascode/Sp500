const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── LOAD ENV ───────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = { PORT: '8080', HOST: '0.0.0.0', JWT_SECRET: '', APP_URL: 'http://localhost:8080', NODE_ENV: 'development' };
  try {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !m[1].startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
  for (const k of Object.keys(process.env)) { env[k] = process.env[k]; }
  return env;
}
const ENV = loadEnv();

const PORT = parseInt(ENV.PORT) || 8080;
const HOST = ENV.HOST || '0.0.0.0';
const DIR = __dirname;

// ─── LIB ────────────────────────────────────────────────────────────────
const auth = require('./lib/auth')(ENV, DIR);
const scan = require('./lib/scan')(auth);
const { generateCalendar } = require('./lib/calendar');

const {
  signToken, verifyToken, sendEmail,
  _resetTokens, _verifyTokens, _verifyCooldown,
  makeToken,
  saveUsers, ADMIN_EMAIL, users,
  hashPassword, verifyPassword, findUser, nextId,
  TIERS, AUTH_MAX, AUTH_WINDOW_MS,
  checkAuthRateLimit, getAuthUser, APP_URL_BASE, saveTokens,
} = auth;

const {
  UNIVERSES, CACHE_TTL_MS,
  getTier, getScanState, checkScanLimit,
  yahooFetch, yahooNews,
  serverCalcRSI, serverCalcMACD, generateWhy, extractCloses,
} = scan;

// ─── PROCESS ERROR HANDLERS ─────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught exception:', err);
  process.exit(1);
});

// ─── FEATURE FLAGS ──────────────────────────────────────────────────────
const FLAGS_PATH = path.join(DIR, 'data', 'feature-flags.json');
const DEFAULT_FLAGS = {
  correlation:    { free: true,  pro: true },
  patternFinder:  { free: true,  pro: true },
  simulator:      { free: true,  pro: true },
  portfolio:      { free: true,  pro: true },
  trackedPicks:   { free: true,  pro: true },
};

function loadFlags() {
  try { return { ...DEFAULT_FLAGS, ...JSON.parse(fs.readFileSync(FLAGS_PATH, 'utf8')) }; }
  catch { return { ...DEFAULT_FLAGS }; }
}
function saveFlags(flags) {
  fs.mkdirSync(path.join(DIR, 'data'), { recursive: true });
  fs.writeFileSync(FLAGS_PATH, JSON.stringify(flags, null, 2));
}
let featureFlags = loadFlags();

// ─── TELEGRAM BOT ───────────────────────────────────────────────────────
const telegramBot = require('./lib/telegram')(ENV, DIR);

// ─── STRIPE ─────────────────────────────────────────────────────────────
let stripe;
try {
  if (ENV.STRIPE_SECRET_KEY && !ENV.STRIPE_SECRET_KEY.startsWith('sk_live_...')) {
    stripe = require('stripe')(ENV.STRIPE_SECRET_KEY);
  }
} catch {}

// ─── MIME ───────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
};

// ─── PUBLIC RATE LIMITER ────────────────────────────────────────────────
const _publicRateLimits = new Map();
function checkPublicRateLimit(ip, endpoint, maxPerMin) {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const entry = _publicRateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    _publicRateLimits.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= maxPerMin) return false;
  entry.count++;
  return true;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of _publicRateLimits) if (v.resetAt < now) _publicRateLimits.delete(k); }, 5 * 60_000);

// ─── DAILY SCAN CACHE ───────────────────────────────────────────────────
const SCAN_CACHE_STALE_MS = 12 * 60 * 60 * 1000;   // skip refresh if cache < 12h
const SCAN_CACHE_VERSION = 2;  // bump when universe changes to force client/server rebuild
const SCAN_REFRESH_EVERY_MS = 6 * 60 * 60 * 1000;  // scheduled interval
const _scanRefreshInFlight = new Set();

function scanCachePath(market) {
  return path.join(DIR, 'data', `scan-cache-${market}.json`);
}

function loadScanCache(market) {
  try { return JSON.parse(fs.readFileSync(scanCachePath(market), 'utf8')); }
  catch { return null; }
}

function saveScanCache(market, payload) {
  const p = scanCachePath(market);
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(payload));
  fs.renameSync(tmp, p);
}

async function refreshMarketCache(market) {
  if (_scanRefreshInFlight.has(market)) return;
  _scanRefreshInFlight.add(market);
  console.log(`[scan-cache] refreshing ${market}...`);
  try {
    const stocks = UNIVERSES[market];
    const prev = loadScanCache(market);
    const prevMap = {};
    if (prev) prev.stocks.forEach(s => { prevMap[s.t] = s; });

    const results = [];
    const CONCURRENCY = 5;
    for (let i = 0; i < stocks.length; i += CONCURRENCY) {
      const batch = stocks.slice(i, i + CONCURRENCY);
      const settled = await Promise.allSettled(batch.map(async (stock) => {
        const data = await yahooFetch(stock.t);
        const closes = extractCloses(data);
        const rsi = closes.length >= 15 ? serverCalcRSI(closes) : 50;
        const macd = closes.length >= 26 ? serverCalcMACD(closes) : 0;
        return {
          ...stock,
          data,
          why:   generateWhy(rsi, macd, 20, null, 'en'),
          whyEn: generateWhy(rsi, macd, 20, null, 'en'),
          _rsi:  +rsi.toFixed(1),
          _macd: +macd.toFixed(3),
          stale: false,
        };
      }));
      for (let j = 0; j < settled.length; j++) {
        if (settled[j].status === 'fulfilled') {
          results.push(settled[j].value);
        } else {
          const stock = batch[j];
          console.warn(`[scan-cache] failed ${stock.t}: ${settled[j].reason?.message} (${settled[j].reason?.cause?.code || settled[j].reason?.name || 'unknown'})`);
          if (prevMap[stock.t]) results.push({ ...prevMap[stock.t], stale: true });
        }
      }
    }

    const payload = { generatedAt: new Date().toISOString(), market, stocks: results, v: SCAN_CACHE_VERSION };
    saveScanCache(market, payload);
    const staleCount = results.filter(s => s.stale).length;
    console.log(`[scan-cache] ${market} done — ${results.length} stocks, ${staleCount} stale`);
  } catch (err) {
    console.error(`[scan-cache] refresh failed for ${market}:`, err.message);
  } finally {
    _scanRefreshInFlight.delete(market);
  }
}

function cacheNeedsRefresh(c) {
  if (!c) return true;
  if (c.v !== SCAN_CACHE_VERSION) return true;
  if (c.stocks.filter(s => !s.stale).length === 0) return true;
  return Date.now() - new Date(c.generatedAt).getTime() > SCAN_CACHE_STALE_MS;
}

function scheduleDailyScanRefresh() {
  // On startup: refresh markets whose cache is stale, empty, or wrong version
  for (const market of Object.keys(UNIVERSES)) {
    const c = loadScanCache(market);
    if (cacheNeedsRefresh(c)) {
      refreshMarketCache(market).catch(err => console.error('[scan-cache] startup error:', err));
    }
  }
  // Re-check every 6 hours
  setInterval(() => {
    for (const market of Object.keys(UNIVERSES)) {
      const c = loadScanCache(market);
      if (cacheNeedsRefresh(c)) {
        refreshMarketCache(market).catch(err => console.error('[scan-cache] scheduled error:', err));
      }
    }
  }, SCAN_REFRESH_EVERY_MS);
}

// ─── HTTP HELPERS ──────────────────────────────────────────────────────
function sendJSON(res, code, data) {
  const origin = ENV.APP_URL || 'http://localhost:8080';
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin });
  res.end(JSON.stringify(data));
}
function sendError(res, code, msg) { sendJSON(res, code, { error: msg }); }

function readBody(req, maxBytes = 1_048_576) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > maxBytes) { reject(new Error('Request body too large')); return; }
      body += c;
    });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

// ─── REQUEST HANDLER ────────────────────────────────────────────────────
async function handleRequest(req, res) {
  const allowedOrigin = ENV.APP_URL || 'http://localhost:8080';

  // Security + CORS headers
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.resend.com https://query1.finance.yahoo.com https://brapi.dev");

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Auth rate limiting (IP-based)
  const clientIp = req.socket.remoteAddress || 'unknown';
  if ((pathname === '/api/auth/login' || pathname === '/api/auth/signup' || pathname === '/api/auth/forgot-password') && req.method === 'POST') {
    if (!checkAuthRateLimit(clientIp)) return sendError(res, 429, 'Too many attempts. Please wait 15 minutes before trying again.');
  }

  try {
    // ─── AUTH ────────────────────────────────────────────────────
    if (pathname === '/api/auth/signup' && req.method === 'POST') {
      const body = await readBody(req);
      const { email, password } = body;
      if (!email || !password || password.length < 6) return sendError(res, 400, 'Email and password (min 6 characters) are required');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return sendError(res, 400, 'Invalid email');
      if (findUser(email)) return sendError(res, 409, 'Email already registered');
      const user = { id: nextId(), email: email.toLowerCase(), password: await hashPassword(password), tier: 'free', createdAt: new Date().toISOString(), stripeCustomerId: null, stripeSubId: null, subStatus: null, paymentMethodLast4: null, failedPaymentCount: 0, paymentHistory: [], subscriptionEnd: null, emailVerified: false };
      users.push(user); saveUsers(users);
      // Send verification email (non-blocking)
      const vToken = makeToken();
      _verifyTokens.set(vToken, { email: user.email, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
      _verifyCooldown.set(user.email, Date.now());
      saveTokens();
      const vLink = `${APP_URL_BASE}/?verify=${vToken}`;
      sendEmail(user.email, 'Confirm your email — Momentum', `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;padding:32px;border-radius:12px;color:#e0e0e0">
          <h2 style="color:#4ade80;margin:0 0 8px">Momentum ★</h2>
          <p style="color:#aaa;font-size:13px;margin:0 0 24px">S&P 500 Stock Scanner &middot; Live Market Data</p>
          <p style="font-size:15px;margin:0 0 8px">Hi there!</p>
          <p style="font-size:14px;color:#ccc;margin:0 0 24px">Thanks for creating your account. Click the button below to confirm your email address and activate your account.</p>
          <a href="${vLink}" style="display:inline-block;background:#4ade80;color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px">Confirm email →</a>
          <p style="color:#666;font-size:12px;margin:0">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>`);
      return sendJSON(res, 201, { pending: true, email: user.email });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readBody(req);
      const { email, password } = body;
      if (!email || !password) return sendError(res, 400, 'Email and password are required');
      const user = findUser(email);
      if (!user || !await verifyPassword(password, user.password)) return sendError(res, 401, 'Invalid email or password');
      if (user.emailVerified === false) return sendJSON(res, 403, { error: 'EMAIL_NOT_VERIFIED', email: user.email });
      return sendJSON(res, 200, { token: signToken(user), user: { id: user.id, email: user.email, tier: user.tier } });
    }

    if (pathname === '/api/auth/me') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 401, 'User not found');
      return sendJSON(res, 200, { id: user.id, email: user.email, name: user.name || null, tier: user.tier, subscriptionEnd: user.subscriptionEnd, subStatus: user.subStatus || null, failedPaymentCount: user.failedPaymentCount || 0, cancelAtPeriodEnd: user.cancelAtPeriodEnd || false, paymentHistory: (user.paymentHistory || []).slice(-6).reverse(), emailVerified: user.emailVerified !== false, isAdmin: user.isAdmin || false, onboardingDone: user.onboardingDone || false });
    }

    if (pathname === '/api/auth/profile' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const body = await readBody(req);
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      if (body.name !== undefined) user.name = body.name || null;
      saveUsers(users);
      return sendJSON(res, 200, { ok: true });
    }

    if (pathname === '/api/user/profile' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      const { password, passwordHash, ...safe } = user;
      return sendJSON(res, 200, safe);
    }

    if (pathname === '/api/user/profile' && req.method === 'PATCH') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const body = await readBody(req);
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      if (body.onboardingDone === true) user.onboardingDone = true;
      saveUsers(users);
      return sendJSON(res, 200, { ok: true });
    }

    if (pathname === '/api/auth/change-password' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const body = await readBody(req);
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      if (!body.oldPassword) return sendError(res, 400, 'Current password is required');
      if (!await verifyPassword(body.oldPassword, user.password)) return sendError(res, 400, 'Current password is incorrect');
      if (!body.newPassword || body.newPassword.length < 6) return sendError(res, 400, 'New password must be at least 6 characters');
      user.password = await hashPassword(body.newPassword);
      user.passwordChangedAt = new Date().toISOString();
      saveUsers(users);
      return sendJSON(res, 200, { ok: true });
    }

    if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
      const body = await readBody(req);
      const email = (body.email || '').toLowerCase().trim();
      const user = findUser(email);
      // Always respond OK — never reveal whether email exists
      if (user) {
        const token = makeToken();
        _resetTokens.set(token, { email, expiresAt: Date.now() + 60 * 60 * 1000 }); // 1 hour
        saveTokens();
        const link = `${APP_URL_BASE}/?reset=${token}`;
        await sendEmail(email, 'Password reset — Momentum', `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;padding:32px;border-radius:12px;color:#e0e0e0">
            <h2 style="color:#f59e0b;margin:0 0 8px">Momentum ★</h2>
            <p style="color:#aaa;font-size:13px;margin:0 0 24px">S&P 500 Stock Scanner &middot; Live Market Data</p>
            <p style="font-size:15px;margin:0 0 8px">Hi there!</p>
            <p style="font-size:14px;color:#ccc;margin:0 0 24px">You requested a password reset. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${link}" style="display:inline-block;background:#c85a17;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px">Reset password →</a>
            <p style="color:#666;font-size:12px;margin:0">If you didn't request this, you can ignore this email. Your password has not been changed.</p>
            <p style="color:#666;font-size:12px;margin:8px 0 0">Link: <a href="${link}" style="color:#c85a17">${link}</a></p>
          </div>`);
      }
      return sendJSON(res, 200, { ok: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
      const body = await readBody(req);
      const { token, password } = body;
      if (!token || !password || password.length < 6) return sendError(res, 400, 'Token and password (min 6 characters) are required');
      const entry = _resetTokens.get(token);
      if (!entry || entry.expiresAt < Date.now()) return sendError(res, 400, 'Reset link expired or invalid. Request a new one.');
      const user = findUser(entry.email);
      if (!user) return sendError(res, 404, 'User not found');
      user.password = await hashPassword(password);
      user.passwordChangedAt = new Date().toISOString();
      saveUsers(users);
      _resetTokens.delete(token);
      saveTokens();
      return sendJSON(res, 200, { ok: true });
    }

    if (pathname === '/api/auth/verify-email' && req.method === 'GET') {
      const token = url.searchParams.get('token') || '';
      const entry = _verifyTokens.get(token);
      if (!entry || entry.expiresAt < Date.now()) return sendError(res, 400, 'Verification link expired or invalid.');
      const user = findUser(entry.email);
      if (!user) return sendError(res, 404, 'User not found');
      user.emailVerified = true;
      saveUsers(users);
      _verifyTokens.delete(token);
      saveTokens();
      return sendJSON(res, 200, { ok: true });
    }

    if (pathname === '/api/auth/resend-verification' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      if (user.emailVerified) return sendJSON(res, 200, { ok: true, alreadyVerified: true });
      const lastSent = _verifyCooldown.get(user.email) || 0;
      if (Date.now() - lastSent < 60_000) return sendError(res, 429, 'Please wait before requesting another verification email.');
      const vToken = makeToken();
      _verifyTokens.set(vToken, { email: user.email, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
      _verifyCooldown.set(user.email, Date.now());
      saveTokens();
      const vLink = `${APP_URL_BASE}/?verify=${vToken}`;
      await sendEmail(user.email, 'Confirm your email — Momentum', `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;padding:32px;border-radius:12px;color:#e0e0e0">
          <h2 style="color:#4ade80;margin:0 0 8px">Momentum ★</h2>
          <p style="color:#aaa;font-size:13px;margin:0 0 24px">S&P 500 Stock Scanner &middot; Live Market Data</p>
          <p style="font-size:14px;color:#ccc;margin:0 0 24px">Click the button below to confirm your email address.</p>
          <a href="${vLink}" style="display:inline-block;background:#4ade80;color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px">Confirm email →</a>
          <p style="color:#666;font-size:12px;margin:0">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
        </div>`);
      return sendJSON(res, 200, { ok: true });
    }

    // Resend without auth — for pending-verification state after signup
    if (pathname === '/api/auth/resend-verification-public' && req.method === 'POST') {
      const body = await readBody(req);
      const email = (body.email || '').toLowerCase().trim();
      const user = findUser(email);
      if (!user || user.emailVerified) return sendJSON(res, 200, { ok: true }); // silent — no enumeration
      const lastSent = _verifyCooldown.get(user.email) || 0;
      if (Date.now() - lastSent < 60_000) return sendError(res, 429, 'Please wait before requesting another verification email.');
      const vToken = makeToken();
      _verifyTokens.set(vToken, { email: user.email, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
      _verifyCooldown.set(user.email, Date.now());
      saveTokens();
      const vLink = `${APP_URL_BASE}/?verify=${vToken}`;
      await sendEmail(user.email, 'Confirm your email — Momentum', `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;padding:32px;border-radius:12px;color:#e0e0e0">
          <h2 style="color:#4ade80;margin:0 0 8px">Momentum ★</h2>
          <p style="color:#aaa;font-size:13px;margin:0 0 24px">S&P 500 Stock Scanner &middot; Live Market Data</p>
          <p style="font-size:14px;color:#ccc;margin:0 0 24px">Click the button below to confirm your email address.</p>
          <a href="${vLink}" style="display:inline-block;background:#4ade80;color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px">Confirm email →</a>
          <p style="color:#666;font-size:12px;margin:0">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
        </div>`);
      return sendJSON(res, 200, { ok: true });
    }

    // ─── GDPR / ACCOUNT ─────────────────────────────────────────
    if (pathname === '/api/auth/data-export' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      return sendJSON(res, 200, {
        id: user.id, email: user.email, tier: user.tier,
        createdAt: user.createdAt, subscriptionEnd: user.subscriptionEnd,
        portfolio: user.portfolio || [],
        trackedPicks: user.trackedPicks || [],
        exportedAt: new Date().toISOString(),
        note: 'Portfolio and tracked picks are stored server-side when signed in. Account deletion removes all personal data.',
      });
    }

    if (pathname === '/api/auth/account' && req.method === 'DELETE') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() === ADMIN_EMAIL) return sendError(res, 400, 'Cannot delete admin account');
      const idx = users.findIndex(u => u.email.toLowerCase() === authUser.email.toLowerCase());
      if (idx === -1) return sendError(res, 404, 'User not found');
      users.splice(idx, 1);
      saveUsers(users);
      return sendJSON(res, 200, { ok: true, message: 'Account deleted. All server-side personal data has been removed.' });
    }

    // ─── PORTFOLIO ───────────────────────────────────────────────
    if (pathname === '/api/portfolio' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      return sendJSON(res, 200, user.portfolio || []);
    }

    if (pathname === '/api/portfolio' && req.method === 'PUT') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const body = await readBody(req);
      if (!Array.isArray(body)) return sendError(res, 400, 'Portfolio must be an array');
      if (body.length > 500) return sendError(res, 400, 'Payload too large');
      for (const item of body) {
        if (typeof item.ticker !== 'string' || item.ticker.length > 20) return sendError(res, 400, 'Invalid ticker');
        if (item.quantity != null && typeof item.quantity !== 'number') return sendError(res, 400, 'Invalid quantity');
        if (item.buyPrice != null && typeof item.buyPrice !== 'number') return sendError(res, 400, 'Invalid price');
      }
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      user.portfolio = body;
      saveUsers(users);
      return sendJSON(res, 200, { ok: true });
    }

    // ─── TRACKED PICKS ───────────────────────────────────────────
    if (pathname === '/api/tracked' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      return sendJSON(res, 200, user.trackedPicks || []);
    }

    if (pathname === '/api/tracked' && req.method === 'PUT') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const body = await readBody(req);
      if (!Array.isArray(body)) return sendError(res, 400, 'Tracked picks must be an array');
      if (body.length > 500) return sendError(res, 400, 'Payload too large');
      for (const item of body) {
        if (typeof item.ticker !== 'string' || item.ticker.length > 20) return sendError(res, 400, 'Invalid ticker');
        if (item.entryPrice != null && typeof item.entryPrice !== 'number') return sendError(res, 400, 'Invalid price');
      }
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      user.trackedPicks = body;
      saveUsers(users);
      return sendJSON(res, 200, { ok: true });
    }

    // ─── ADMIN ───────────────────────────────────────────────────
    if (pathname === '/api/admin/telegram-conversations' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      if (!telegramBot) return sendJSON(res, 200, { conversations: [], botActive: false });
      return sendJSON(res, 200, { conversations: telegramBot.getConversations(), botActive: true });
    }

    if (pathname === '/api/admin/backup' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="users-${new Date().toISOString().slice(0,10)}.json"`);
      res.writeHead(200);
      res.end(JSON.stringify(users, null, 2));
      return;
    }

    if (pathname === '/api/admin/users' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      const safe = users.map(u => ({
        id: u.id, email: u.email, tier: u.tier, createdAt: u.createdAt,
        subscriptionEnd: u.subscriptionEnd,
        stripeSubId: u.stripeSubId || null,
        subStatus: u.subStatus || null,
        cancelAtPeriodEnd: u.cancelAtPeriodEnd || false,
        failedPaymentCount: u.failedPaymentCount || 0,
        paymentHistory: (u.paymentHistory || []).slice(-6).reverse(),
        isSubscribed: u.tier === 'pro' && u.subscriptionEnd && new Date(u.subscriptionEnd) > new Date(),
        emailVerified: u.emailVerified !== false,
      }));
      const stats = {
        total: users.length,
        free: users.filter(u => u.tier === 'free').length,
        pro: users.filter(u => u.tier === 'pro').length,
        admin: users.filter(u => u.tier === 'admin').length,
        activeSubscriptions: users.filter(u => u.tier === 'pro' && u.subscriptionEnd && new Date(u.subscriptionEnd) > new Date()).length,
      };
      return sendJSON(res, 200, { users: safe, stats });
    }

    if (pathname === '/api/admin/set-admin' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      const body = await readBody(req);
      const targetEmail = (body.email || '').toLowerCase();
      const targetUser = findUser(targetEmail);
      if (!targetUser) return sendError(res, 404, 'User not found');
      targetUser.tier = body.admin === true || body.admin === 'true' ? 'admin' : 'free';
      saveUsers(users);
      return sendJSON(res, 200, { ok: true, email: targetEmail, tier: targetUser.tier });
    }

    if (pathname === '/api/admin/set-tier' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      const body = await readBody(req);
      const targetEmail = (body.email || '').toLowerCase();
      const newTier = body.tier;
      if (!['free', 'pro'].includes(newTier)) return sendError(res, 400, 'tier must be free or pro');
      if (targetEmail === ADMIN_EMAIL) return sendError(res, 400, 'Cannot change admin tier');
      const targetUser = findUser(targetEmail);
      if (!targetUser) return sendError(res, 404, 'User not found');
      targetUser.tier = newTier;
      if (newTier === 'pro') {
        const existingEnd = targetUser.subscriptionEnd ? new Date(targetUser.subscriptionEnd) : null;
        if (!existingEnd || existingEnd <= new Date()) {
          const end = new Date();
          end.setFullYear(end.getFullYear() + 1);
          targetUser.subscriptionEnd = end.toISOString();
        }
      } else {
        targetUser.subscriptionEnd = null;
      }
      saveUsers(users);
      return sendJSON(res, 200, { ok: true, email: targetEmail, tier: targetUser.tier, subscriptionEnd: targetUser.subscriptionEnd });
    }

    if (pathname === '/api/admin/revenue' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      const now = new Date();
      const PRO_PRICE_USD = 9.99;
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const activeProUsers = users.filter(u =>
        u.tier === 'pro' && u.subscriptionEnd && new Date(u.subscriptionEnd) > now && u.subStatus === 'active'
      );
      const cancelPending = users.filter(u => u.cancelAtPeriodEnd === true);
      const withFailed = users.filter(u => (u.failedPaymentCount || 0) > 0);
      const newThisMonth = users.filter(u => {
        const paid = (u.paymentHistory || []).filter(p => p.status === 'paid');
        if (!paid.length) return false;
        const first = paid.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        return new Date(first.date) >= startOfMonth;
      });
      const totalRevenueCents = users.reduce((acc, u) =>
        acc + (u.paymentHistory || []).filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0), 0);
      return sendJSON(res, 200, {
        mrr: activeProUsers.length * PRO_PRICE_USD,
        activeSubscribers: activeProUsers.length,
        newThisMonth: newThisMonth.length,
        churnPending: cancelPending.length,
        failedPayments: withFailed.length,
        totalRevenueCents,
      });
    }

    if (pathname === '/api/admin/cancel-subscription' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      if (!stripe) return sendError(res, 503, 'Stripe not configured');
      const body = await readBody(req);
      const targetEmail = (body.email || '').toLowerCase();
      const targetUser = findUser(targetEmail);
      if (!targetUser) return sendError(res, 404, 'User not found');
      if (!targetUser.stripeSubId) return sendError(res, 400, 'No Stripe subscription found');
      try {
        await stripe.subscriptions.update(targetUser.stripeSubId, { cancel_at_period_end: true });
        targetUser.cancelAtPeriodEnd = true;
        saveUsers(users);
        return sendJSON(res, 200, { ok: true, email: targetEmail });
      } catch (e) { return sendError(res, 500, 'Stripe error: ' + e.message); }
    }

    if (pathname === '/api/admin/extend-subscription' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      const body = await readBody(req);
      const targetEmail = (body.email || '').toLowerCase();
      const days = parseInt(body.days) || 30;
      if (days < 1 || days > 90) return sendError(res, 400, 'days must be 1–90');
      const targetUser = findUser(targetEmail);
      if (!targetUser) return sendError(res, 404, 'User not found');
      let base = targetUser.subscriptionEnd ? new Date(targetUser.subscriptionEnd) : new Date();
      if (base < new Date()) base = new Date();
      base.setDate(base.getDate() + days);
      targetUser.subscriptionEnd = base.toISOString();
      if (!targetUser.auditLog) targetUser.auditLog = [];
      targetUser.auditLog.push({ action: 'extend_subscription', days, by: authUser.email, at: new Date().toISOString() });
      saveUsers(users);
      return sendJSON(res, 200, { ok: true, email: targetEmail, subscriptionEnd: targetUser.subscriptionEnd, days });
    }

    // ─── FEATURE FLAGS ───────────────────────────────────────────
    if (pathname === '/api/feature-flags' && req.method === 'GET') {
      return sendJSON(res, 200, featureFlags);
    }

    if (pathname === '/api/admin/delete-user' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      const body = await readBody(req);
      const targetEmail = (body.email || '').toLowerCase().trim();
      if (!targetEmail) return sendError(res, 400, 'Email is required');
      if (targetEmail === ADMIN_EMAIL) return sendError(res, 400, 'Cannot delete admin account');
      const idx = users.findIndex(u => u.email === targetEmail);
      if (idx === -1) return sendError(res, 404, 'User not found');
      users.splice(idx, 1);
      saveUsers(users);
      return sendJSON(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/feature-flags' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      const body = await readBody(req);
      for (const [key, val] of Object.entries(body)) {
        if (typeof val === 'boolean') {
          featureFlags[key] = val;   // top-level boolean flags like cpf_required
        } else if (featureFlags[key] && typeof val === 'object') {
          featureFlags[key] = { ...featureFlags[key], ...val };
        }
      }
      saveFlags(featureFlags);
      return sendJSON(res, 200, { ok: true, flags: featureFlags });
    }

    // ─── STRIPE ──────────────────────────────────────────────────
    if (pathname === '/api/stripe/create-checkout') {
      if (!stripe) return sendError(res, 503, 'Stripe not configured');
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      // Guard: only block if user is already Pro AND has an active Stripe sub
      if (user && user.tier === 'pro' && user.stripeSubId && user.subStatus === 'active') {
        return sendJSON(res, 200, { alreadySubscribed: true });
      }
      const priceId = ENV.STRIPE_PRICE_PRO_MONTHLY;
      if (!priceId) return sendError(res, 500, 'STRIPE_PRICE_PRO_MONTHLY not set');
      // Build redirect base URL from the request host so mobile (LAN IP) and desktop work
      const reqProto = req.headers['x-forwarded-proto'] || 'http';
      const reqHost = req.headers.host || new URL(ENV.APP_URL).host;
      const baseUrl = `${reqProto}://${reqHost}`;
      try {
        const sessionParams = {
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: baseUrl + '/?subscription=success&session_id={CHECKOUT_SESSION_ID}',
          cancel_url: baseUrl + '/?subscription=canceled',
          metadata: { userId: String(authUser.id) },
        };
        // Reuse existing Stripe customer to avoid duplicates
        if (user && user.stripeCustomerId) {
          sessionParams.customer = user.stripeCustomerId;
        } else {
          sessionParams.customer_email = authUser.email;
        }
        const session = await stripe.checkout.sessions.create(sessionParams);
        return sendJSON(res, 200, { url: session.url });
      } catch (e) { return sendError(res, 500, 'Stripe error: ' + e.message); }
    }

    if (pathname === '/api/stripe/create-portal') {
      if (!stripe) return sendError(res, 503, 'Stripe not configured');
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user || !user.stripeCustomerId) return sendError(res, 400, 'No active subscription');
      const reqProto = req.headers['x-forwarded-proto'] || 'http';
      const reqHost = req.headers.host || new URL(ENV.APP_URL).host;
      const baseUrl = `${reqProto}://${reqHost}`;
      try {
        const session = await stripe.billingPortal.sessions.create({ customer: user.stripeCustomerId, return_url: baseUrl + '/' });
        return sendJSON(res, 200, { url: session.url });
      } catch (e) { return sendError(res, 500, 'Stripe error: ' + e.message); }
    }

    if (pathname === '/api/stripe/verify-session') {
      if (!stripe) return sendError(res, 503, 'Stripe not configured');
      const authUserReq = getAuthUser(req);
      if (!authUserReq) return sendError(res, 401, 'Not authenticated');
      const sessionId = new URL('http://x' + req.url).searchParams.get('session_id');
      if (!sessionId) return sendError(res, 400, 'session_id required');
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
        if (session.payment_status === 'paid' && session.subscription) {
          const user = findUser(authUserReq.email);
          if (user) {
            const sub = session.subscription;
            user.tier = 'pro';
            user.stripeCustomerId = session.customer;
            user.stripeSubId = sub.id;
            user.subStatus = sub.status;
            user.cancelAtPeriodEnd = sub.cancel_at_period_end;
            user.subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
            saveUsers(users);
          }
        }
        return sendJSON(res, 200, { ok: true, status: session.payment_status });
      } catch (e) { return sendError(res, 500, 'Stripe error: ' + e.message); }
    }

    if (pathname === '/api/stripe/webhook' && req.method === 'POST') {
      if (!stripe || !ENV.STRIPE_WEBHOOK_SECRET) return sendError(res, 503, 'Stripe webhook not configured');
      let body = '', size = 0;
      req.on('data', chunk => {
        size += chunk.length;
        if (size > 1_048_576) { req.destroy(); return; }
        body += chunk;
      });
      await new Promise(resolve => req.on('end', resolve));
      try {
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(body, sig, ENV.STRIPE_WEBHOOK_SECRET);
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          let email = session.customer_email;
          if (!email && session.customer) {
            const customer = await stripe.customers.retrieve(session.customer);
            email = customer.email;
          }
          const user = email && findUser(email);
          if (user) {
            user.tier = 'pro';
            user.stripeCustomerId = session.customer;
            user.stripeSubId = session.subscription;
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            user.subStatus = sub.status;
            user.subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
            saveUsers(users);
          }
        }
        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
          const sub = event.data.object;
          // prefer lookup by stripeCustomerId for reliability
          let user = users.find(u => u.stripeCustomerId === sub.customer);
          if (!user) {
            let email = sub.customer_email;
            if (!email && sub.customer) {
              const customer = await stripe.customers.retrieve(sub.customer);
              email = customer.email;
            }
            user = email ? findUser(email) : null;
          }
          if (user) {
            user.stripeCustomerId = user.stripeCustomerId || sub.customer;
            user.stripeSubId = sub.id;
            user.subStatus = sub.status;
            user.cancelAtPeriodEnd = sub.cancel_at_period_end;
            if (sub.status === 'active' || sub.status === 'trialing') {
              user.tier = 'pro';
              user.subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
            } else {
              user.tier = 'free';
              user.subscriptionEnd = null;
            }
            saveUsers(users);
          }
        }
        if (event.type === 'invoice.payment_succeeded') {
          const invoice = event.data.object;
          const user = users.find(u => u.stripeCustomerId === invoice.customer);
          if (user) {
            if (!Array.isArray(user.paymentHistory)) user.paymentHistory = [];
            user.paymentHistory.push({
              date: new Date(invoice.created * 1000).toISOString(),
              amountUSD: invoice.amount_paid / 100,
              status: 'paid',
              invoiceId: invoice.id,
              receiptUrl: invoice.hosted_invoice_url || null,
              periodEnd: invoice.lines?.data?.[0]?.period?.end
                ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
                : null,
            });
            user.failedPaymentCount = 0;
            user.subStatus = 'active';
            if (invoice.lines?.data?.[0]?.period?.end) {
              user.subscriptionEnd = new Date(invoice.lines.data[0].period.end * 1000).toISOString();
            }
            saveUsers(users);
          }
        }
        if (event.type === 'invoice.payment_failed') {
          const invoice = event.data.object;
          const user = users.find(u => u.stripeCustomerId === invoice.customer);
          if (user) {
            if (!Array.isArray(user.paymentHistory)) user.paymentHistory = [];
            user.paymentHistory.push({
              date: new Date(invoice.created * 1000).toISOString(),
              amountUSD: invoice.amount_due / 100,
              status: 'failed',
              invoiceId: invoice.id,
            });
            user.failedPaymentCount = (user.failedPaymentCount || 0) + 1;
            user.subStatus = 'past_due';
            saveUsers(users);
          }
        }
        return sendJSON(res, 200, { received: true });
      } catch (e) { return sendError(res, 400, 'Webhook error: ' + e.message); }
    }

    // ─── HEALTH CHECK ────────────────────────────────────────────
    if (pathname === '/api/health') {
      return sendJSON(res, 200, { status: 'ok', uptime: Math.floor(process.uptime()), users: users.length, version: '6.0' });
    }

    // ─── TELEGRAM WEBHOOK ────────────────────────────────────────────
    if (pathname === '/api/telegram/webhook' && req.method === 'POST') {
      if (!telegramBot) return sendJSON(res, 200, { ok: true });
      const body = await readBody(req);
      sendJSON(res, 200, { ok: true }); // respond immediately — Telegram requires <5s
      telegramBot.handleUpdate(body).catch(err => console.error('[telegram] handleUpdate error:', err));
      return;
    }

    // ─── SCAN LIMIT ──────────────────────────────────────────────
    if (pathname === '/api/limit') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendJSON(res, 200, { allowed: false, tier: 'guest', scansRemaining: 0 });
      const limit = getScanState(authUser.email);
      return sendJSON(res, 200, { allowed: limit.allowed, tier: limit.tier, scansRemaining: limit.remaining, scanInterval: limit.scanInterval });
    }

    // ─── STOCK ROUTES ────────────────────────────────────────────
    if (pathname === '/api/universes') {
      const authUser = getAuthUser(req);
      const tier = authUser ? getTier(authUser.email) : TIERS.free;
      const summary = Object.entries(UNIVERSES).map(([key, stocks]) => ({
        id: key,
        name: 'United States',
        label: '🇺🇸 S&P 500',
        count: stocks.length,
        visibleCount: Math.min(stocks.length, tier.maxStocksPerMarket),
      }));
      return sendJSON(res, 200, summary);
    }

    const universeMatch = pathname.match(/^\/api\/universe\/(\w+)$/);
    if (universeMatch) {
      const authUser = getAuthUser(req);
      const tier = authUser ? getTier(authUser.email) : TIERS.free;
      const allStocks = UNIVERSES[universeMatch[1]];
      if (!allStocks) return sendError(res, 404, 'Unknown universe');
      const limited = allStocks.slice(0, tier.maxStocksPerMarket);
      return sendJSON(res, 200, { stocks: limited, total: allStocks.length, visible: limited.length, tier: tier.name });
    }

    const historyMatch = pathname.match(/^\/api\/history\/([A-Za-z0-9.=%]+)$/);
    if (historyMatch) {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const limit = checkScanLimit(authUser.email);
      if (!limit.allowed) return sendJSON(res, 429, { error: 'Daily scan limit reached', limit, tier: limit.tier });
      try {
        const ticker = decodeURIComponent(historyMatch[1]);
        const lang = 'en';
        // Serve from scan cache when available — avoids live Yahoo Finance calls on Railway
        for (const mkt of Object.keys(UNIVERSES)) {
          const cached = loadScanCache(mkt);
          if (cached) {
            const entry = cached.stocks.find(s => s.t === ticker);
            if (entry && entry.data) {
              const closes = extractCloses(entry.data);
              const rsi = closes.length >= 15 ? serverCalcRSI(closes) : 50;
              const macd = closes.length >= 26 ? serverCalcMACD(closes) : 0;
              const why = generateWhy(rsi, macd, 20, null, lang);
              return sendJSON(res, 200, { ...entry.data, why, _rsi: +rsi.toFixed(1), _macd: +macd.toFixed(3) });
            }
          }
        }
        const data = await yahooFetch(ticker);
        const closes = extractCloses(data);
        const rsi = closes.length >= 15 ? serverCalcRSI(closes) : 50;
        const macd = closes.length >= 26 ? serverCalcMACD(closes) : 0;
        const why = generateWhy(rsi, macd, 20, null, lang);
        return sendJSON(res, 200, { ...data, why, _rsi: +rsi.toFixed(1), _macd: +macd.toFixed(3) });
      } catch (err) {
        if (err.message && err.message.includes('returned 404')) return sendError(res, 404, 'Ticker not found or delisted.');
        return sendError(res, 502, err.message);
      }
    }

    const newsMatch = pathname.match(/^\/api\/news\/([A-Za-z0-9.]+)$/);
    if (newsMatch) {
      if (!checkPublicRateLimit(clientIp, 'news', 60)) return sendError(res, 429, 'Too many requests');
      try {
        const news = await yahooNews(newsMatch[1]);
        return sendJSON(res, 200, news);
      } catch {
        return sendJSON(res, 200, []);
      }
    }

    if (pathname === '/api/scan/health') {
      const healthData = {};
      for (const market of Object.keys(UNIVERSES)) {
        const c = loadScanCache(market);
        if (c) {
          const ageMs = Date.now() - new Date(c.generatedAt).getTime();
          healthData[market] = { lastRefresh: c.generatedAt, ageHours: +(ageMs / 3_600_000).toFixed(1), stockCount: c.stocks.length, staleCount: c.stocks.filter(s => s.stale).length, inFlight: _scanRefreshInFlight.has(market) };
        } else {
          healthData[market] = { lastRefresh: null, ageHours: null, stockCount: 0, staleCount: 0, inFlight: _scanRefreshInFlight.has(market) };
        }
      }
      return sendJSON(res, 200, { markets: healthData, proxy: process.env.YAHOO_PROXY_URL || null });
    }

    if (pathname === '/api/scan/cached') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const market = url.searchParams.get('market') || 'us';
      if (!UNIVERSES[market]) return sendError(res, 400, 'Invalid market');
      const cache = loadScanCache(market);
      if (!cache) return sendJSON(res, 503, { status: 'warming_up', retryAfter: 30, message: 'Market data is being prepared. Please try again in a moment.' });
      const etag = `"${new Date(cache.generatedAt).getTime()}"`;
      if (req.headers['if-none-match'] === etag) { res.writeHead(304); res.end(); return; }
      const visibleCache = { ...cache, stocks: cache.stocks.filter(s => !s._regime) };
      const ageMs = Date.now() - new Date(cache.generatedAt).getTime();
      res.setHeader('ETag', etag);
      res.setHeader('X-Cache-Age', String(Math.round(ageMs / 1000)));
      return sendJSON(res, 200, visibleCache);
    }

    if (pathname === '/api/scan') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const limit = checkScanLimit(authUser.email);
      if (!limit.allowed) return sendJSON(res, 429, { error: 'Daily scan limit reached', limit, tier: limit.tier });
      const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'pt';
      const results = {};
      for (const [market, stocks] of Object.entries(UNIVERSES)) {
        const batch = [];
        for (const stock of stocks) {
          try {
            const data = await yahooFetch(stock.t);
            const closes = extractCloses(data);
            const rsi = closes.length >= 15 ? serverCalcRSI(closes) : 50;
            const macd = closes.length >= 26 ? serverCalcMACD(closes) : 0;
            const why = generateWhy(rsi, macd, 20, null, lang);
            batch.push({ ...stock, data, why, _rsi: +rsi.toFixed(1), _macd: +macd.toFixed(3) });
          } catch {}
          await new Promise(r => setTimeout(r, limit.scanInterval));
        }
        results[market] = batch;
      }
      return sendJSON(res, 200, results);
    }

    if (pathname === '/api/calendar') {
      if (!checkPublicRateLimit(clientIp, 'calendar', 60)) return sendError(res, 429, 'Too many requests');
      return sendJSON(res, 200, generateCalendar());
    }

    // ─── STATIC FILES ────────────────────────────────────────────
    // US-94: allowlist — only serve known HTML files or /static/ assets
    const ALLOWED_HTML = new Set(['/stock-dashboard.html', '/legend.html', '/docs.html']);
    let uri = pathname === '/' ? '/stock-dashboard.html' : pathname;
    if (!ALLOWED_HTML.has(uri) && !uri.startsWith('/static/')) return sendError(res, 403, 'Forbidden');

    let fpath = path.join(DIR, uri);
    // US-95: fix path traversal — resolved path must be inside DIR
    if (fpath !== DIR && !fpath.startsWith(DIR + path.sep)) return sendError(res, 403, 'Forbidden');

    try {
      const content = fs.readFileSync(fpath);
      const ext = path.extname(fpath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(content);
    } catch { sendError(res, 404, 'Not Found'); }
  } catch (err) {
    console.error('[signup error]', err);
    res.writeHead(500); res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// ─── START ──────────────────────────────────────────────────────────────

// US-207: warn if admin email is not configured
if (!process.env.ADMIN_EMAIL) {
  console.warn('⚠ ADMIN_EMAIL not set — admin panel will be disabled. Set ADMIN_EMAIL in .env to enable.');
}

// US-209: pre-flight check — ensure data/ directory is writable before accepting requests
const DATA_DIR = path.join(__dirname, 'data');
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const testFile = path.join(DATA_DIR, '.write-test');
  fs.writeFileSync(testFile, 'ok');
  fs.unlinkSync(testFile);
} catch (err) {
  console.error('FATAL: data/ directory is not writable:', err.message);
  process.exit(1);
}

const server = http.createServer(handleRequest);
server.listen(PORT, HOST, () => {
  const url = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
  console.log(`\n🚀  MOMENTUM v6.0 — S&P 500 Stock Scanner :: ${url}`);
  console.log('⚠️  EDUCATIONAL PURPOSES ONLY — Not financial advice.');
  console.log(`📊  ${Object.values(UNIVERSES).reduce((a, b) => a + b.length, 0)} stocks across ${Object.keys(UNIVERSES).length} markets`);
  console.log(`💳  ${stripe ? 'Stripe connected' : 'Stripe not configured (set STRIPE_SECRET_KEY)'}`);
  console.log(`👤  ${users.length} users registered`);
  console.log(`📁  Data: ${auth.DB_PATH}`);
  console.log(`🔒  Auth rate limit: ${AUTH_MAX} attempts per ${AUTH_WINDOW_MS / 60000} min per IP`);
  console.log(`💾  Yahoo cache TTL: ${CACHE_TTL_MS / 1000}s`);
  console.log(`🌐  Yahoo proxy: ${process.env.YAHOO_PROXY_URL || '(none — using Yahoo directly)'}`);
  if (telegramBot) {
    const appUrl = ENV.APP_URL || `http://localhost:${PORT}`;
    telegramBot.registerWebhook(appUrl).catch(err => console.error('[telegram] webhook registration error:', err));
    console.log(`🤖  Telegram bot: active`);
  } else {
    console.log(`🤖  Telegram bot: disabled (set TELEGRAM_BOT_TOKEN + ANTHROPIC_API_KEY)`);
  }
  console.log('');
  scheduleDailyScanRefresh();
});

// ─── GRACEFUL SHUTDOWN ───────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('[shutdown] SIGTERM received — closing server');
  server.close(() => {
    console.log('[shutdown] All connections closed. Exiting.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[shutdown] Forced exit after 10s timeout');
    process.exit(1);
  }, 10_000);
});
