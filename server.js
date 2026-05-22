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
  makeToken, validateCPF,
  saveUsers, ADMIN_EMAIL, users,
  hashPassword, verifyPassword, findUser, nextId,
  TIERS, AUTH_MAX, AUTH_WINDOW_MS,
  checkAuthRateLimit, getAuthUser, APP_URL_BASE,
} = auth;

const {
  UNIVERSES, CACHE_TTL_MS,
  getTier, getScanState, checkScanLimit,
  yahooFetch, yahooNews,
  serverCalcRSI, serverCalcMACD, generateWhy, extractCloses,
} = scan;

// ─── FEATURE FLAGS ──────────────────────────────────────────────────────
const FLAGS_PATH = path.join(DIR, 'data', 'feature-flags.json');
const DEFAULT_FLAGS = {
  cpf_required:   true,
  correlation:    { free: true,  pro: true },
  patternFinder:  { free: true,  pro: true },
  simulator:      { free: true,  pro: true },
  darfReport:     { free: true,  pro: true },
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
      if (!email || !password || password.length < 6) return sendError(res, 400, 'Email and password (min 6 chars) required');
      const cpfDigits = (body.cpf || '').replace(/\D/g, '');
      if (featureFlags.cpf_required !== false && !cpfDigits) return sendError(res, 400, 'CPF é obrigatório para cadastro');
      if (!validateCPF(cpfDigits)) return sendError(res, 400, 'CPF inválido');
      if (users.some(u => u.cpf === cpfDigits)) return sendError(res, 409, 'CPF já cadastrado');
      if (findUser(email)) return sendError(res, 409, 'Email already registered');
      const user = { id: nextId(), email: email.toLowerCase(), password: await hashPassword(password), cpf: cpfDigits, tier: 'free', createdAt: new Date().toISOString(), subscriptionId: null, subscriptionEnd: null, emailVerified: false };
      users.push(user); saveUsers(users);
      // Send verification email (non-blocking)
      const vToken = makeToken();
      _verifyTokens.set(vToken, { email: user.email, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
      _verifyCooldown.set(user.email, Date.now());
      const vLink = `${APP_URL_BASE}/?verify=${vToken}`;
      sendEmail(user.email, 'Verify your Momentum email', `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#c85a17">Momentum — Verify your email</h2>
          <p>Thanks for signing up! Click the button below to verify your email address.</p>
          <a href="${vLink}" style="display:inline-block;background:#c85a17;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">Verify Email</a>
          <p style="color:#888;font-size:12px">Link: <a href="${vLink}">${vLink}</a></p>
        </div>`);
      return sendJSON(res, 201, { token: signToken(user), user: { id: user.id, email: user.email, tier: user.tier }, emailVerified: false });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readBody(req);
      const { email, password } = body;
      if (!email || !password) return sendError(res, 400, 'Email and password required');
      const user = findUser(email);
      if (!user || !await verifyPassword(password, user.password)) return sendError(res, 401, 'Invalid email or password');
      return sendJSON(res, 200, { token: signToken(user), user: { id: user.id, email: user.email, tier: user.tier } });
    }

    if (pathname === '/api/auth/me') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 401, 'User not found');
      return sendJSON(res, 200, { id: user.id, email: user.email, name: user.name || null, tier: user.tier, subscriptionEnd: user.subscriptionEnd, emailVerified: user.emailVerified !== false, isAdmin: user.isAdmin || false, onboardingDone: user.onboardingDone || false });
    }

    if (pathname === '/api/auth/profile' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const body = await readBody(req);
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      const cpf = (body.cpf || '').replace(/\D/g, '');
      if (cpf && !validateCPF(cpf)) return sendError(res, 400, 'CPF inválido');
      if (cpf && users.some(u => u.cpf === cpf && u.email !== user.email)) return sendError(res, 409, 'CPF já cadastrado');
      user.cpf = cpf || null;
      saveUsers(users);
      return sendJSON(res, 200, { ok: true, cpf: user.cpf });
    }

    if (pathname === '/api/user/profile' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'Usuário não encontrado');
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
        const link = `${APP_URL_BASE}/?reset=${token}`;
        await sendEmail(email, 'Reset your Momentum password', `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2 style="color:#c85a17">Momentum — Password Reset</h2>
            <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${link}" style="display:inline-block;background:#c85a17;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">Reset Password</a>
            <p style="color:#888;font-size:12px">If you didn't request this, you can safely ignore this email. Your password has not changed.</p>
            <p style="color:#888;font-size:12px">Link: <a href="${link}">${link}</a></p>
          </div>`);
      }
      return sendJSON(res, 200, { ok: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
      const body = await readBody(req);
      const { token, password } = body;
      if (!token || !password || password.length < 6) return sendError(res, 400, 'Token and password (min 6 chars) required');
      const entry = _resetTokens.get(token);
      if (!entry || entry.expiresAt < Date.now()) return sendError(res, 400, 'Reset link has expired or is invalid. Please request a new one.');
      const user = findUser(entry.email);
      if (!user) return sendError(res, 404, 'User not found');
      user.password = await hashPassword(password);
      user.passwordChangedAt = new Date().toISOString();
      saveUsers(users);
      _resetTokens.delete(token);
      return sendJSON(res, 200, { ok: true });
    }

    if (pathname === '/api/auth/verify-email' && req.method === 'GET') {
      const token = url.searchParams.get('token') || '';
      const entry = _verifyTokens.get(token);
      if (!entry || entry.expiresAt < Date.now()) return sendError(res, 400, 'Verification link has expired or is invalid.');
      const user = findUser(entry.email);
      if (!user) return sendError(res, 404, 'User not found');
      user.emailVerified = true;
      saveUsers(users);
      _verifyTokens.delete(token);
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
      const vLink = `${APP_URL_BASE}/?verify=${vToken}`;
      await sendEmail(user.email, 'Verify your Momentum email', `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#c85a17">Momentum — Verify your email</h2>
          <p>Click the button below to verify your email address.</p>
          <a href="${vLink}" style="display:inline-block;background:#c85a17;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">Verify Email</a>
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
        cpf: user.cpf || null,
        createdAt: user.createdAt, subscriptionEnd: user.subscriptionEnd,
        portfolio: user.portfolio || [],
        trackedPicks: user.trackedPicks || [],
        exportedAt: new Date().toISOString(),
        note: 'Portfolio and tracked picks are stored server-side when signed in. Account deletion removes all data per LGPD Art. 18.',
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

    // ─── B3 TICKER AUTOCOMPLETE ──────────────────────────────────
    if (pathname === '/api/tickers/b3' && req.method === 'GET') {
      if (!checkPublicRateLimit(clientIp, 'tickers_b3', 120)) return sendError(res, 429, 'Too many requests');
      const q = (url.searchParams.get('q') || '').toUpperCase().trim();
      if (!q || q.length < 1) return sendJSON(res, 200, []);
      const results = UNIVERSES.brasil
        .filter(s => s.t.replace('.SA','').startsWith(q) || s.n.toUpperCase().includes(q))
        .slice(0, 8)
        .map(s => ({ ticker: s.t, name: s.n }));
      return sendJSON(res, 200, results);
    }

    // ─── ADMIN ───────────────────────────────────────────────────
    if (pathname === '/api/admin/users' && req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      if (authUser.email.toLowerCase() !== ADMIN_EMAIL) return sendError(res, 403, 'Admin only');
      const safe = users.map(u => ({
        id: u.id, email: u.email, tier: u.tier, createdAt: u.createdAt,
        subscriptionEnd: u.subscriptionEnd,
        isSubscribed: u.tier === 'pro' && u.subscriptionEnd && new Date(u.subscriptionEnd) > new Date(),
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

    // ─── FEATURE FLAGS ───────────────────────────────────────────
    if (pathname === '/api/feature-flags' && req.method === 'GET') {
      return sendJSON(res, 200, featureFlags);
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
      const priceId = ENV.STRIPE_PRICE_PRO_MONTHLY;
      if (!priceId) return sendError(res, 500, 'STRIPE_PRICE_PRO_MONTHLY not set');
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          customer_email: authUser.email,
          success_url: ENV.APP_URL + '/?subscription=success',
          cancel_url: ENV.APP_URL + '/?subscription=canceled',
          metadata: { userId: String(authUser.id) },
        });
        return sendJSON(res, 200, { url: session.url });
      } catch (e) { return sendError(res, 500, 'Stripe error: ' + e.message); }
    }

    if (pathname === '/api/stripe/create-portal') {
      if (!stripe) return sendError(res, 503, 'Stripe not configured');
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user || !user.subscriptionId) return sendError(res, 400, 'No active subscription');
      try {
        const session = await stripe.billingPortal.sessions.create({ customer: user.subscriptionId, return_url: ENV.APP_URL + '/' });
        return sendJSON(res, 200, { url: session.url });
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
            user.subscriptionId = session.customer;
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            user.subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
            saveUsers(users);
          }
        }
        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
          const sub = event.data.object;
          let email = sub.customer_email;
          if (!email && sub.customer) {
            const customer = await stripe.customers.retrieve(sub.customer);
            email = customer.email;
          }
          const user = email && findUser(email);
          if (user) {
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
        return sendJSON(res, 200, { received: true });
      } catch (e) { return sendError(res, 400, 'Webhook error: ' + e.message); }
    }

    // ─── HEALTH CHECK ────────────────────────────────────────────
    if (pathname === '/api/health') {
      return sendJSON(res, 200, { status: 'ok', uptime: Math.floor(process.uptime()), users: users.length, version: '5.1' });
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
        name: key === 'us' ? 'United States' : key === 'europe' ? 'Europe' : key === 'brasil' ? 'Brasil' : 'Emerging Markets',
        label: key === 'us' ? '🇺🇸 S&P 500' : key === 'europe' ? '🇪🇺 STOXX 600' : key === 'brasil' ? '🇧🇷 B3' : '🌍 Emerging Markets',
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
      if (!authUser) return sendError(res, 401, 'Sign in required to scan');
      const limit = checkScanLimit(authUser.email);
      if (!limit.allowed) return sendJSON(res, 429, { error: 'Scan limit reached for today', limit, tier: limit.tier });
      try {
        const ticker = decodeURIComponent(historyMatch[1]);
        const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'pt';
        const data = await yahooFetch(ticker);
        const closes = extractCloses(data);
        const rsi = closes.length >= 15 ? serverCalcRSI(closes) : 50;
        const macd = closes.length >= 26 ? serverCalcMACD(closes) : 0;
        const why = generateWhy(rsi, macd, 20, null, lang);
        return sendJSON(res, 200, { ...data, why, _rsi: +rsi.toFixed(1), _macd: +macd.toFixed(3) });
      } catch (err) { return sendError(res, 502, err.message); }
    }

    const newsMatch = pathname.match(/^\/api\/news\/([A-Za-z0-9.]+)$/);
    if (newsMatch) {
      if (!checkPublicRateLimit(clientIp, 'news', 60)) return sendError(res, 429, 'Too many requests');
      try {
        const news = await yahooNews(newsMatch[1]);
        return sendJSON(res, 200, news);
      } catch (err) { return sendError(res, 502, err.message); }
    }

    if (pathname === '/api/scan') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Sign in required to scan');
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
  console.log(`\n🚀  MOMENTUM v5.1 — Trading Journal & Scanner :: ${url}`);
  console.log('⚠️  EDUCATIONAL PURPOSES ONLY — Not financial advice.');
  console.log(`📊  ${Object.values(UNIVERSES).reduce((a, b) => a + b.length, 0)} stocks across ${Object.keys(UNIVERSES).length} markets`);
  console.log(`💳  ${stripe ? 'Stripe connected' : 'Stripe not configured (set STRIPE_SECRET_KEY)'}`);
  console.log(`👤  ${users.length} users registered`);
  console.log(`📁  Data: ${auth.DB_PATH}`);
  console.log(`🔒  Auth rate limit: ${AUTH_MAX} attempts per ${AUTH_WINDOW_MS / 60000} min per IP`);
  console.log(`💾  Yahoo cache TTL: ${CACHE_TTL_MS / 1000}s\n`);
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
