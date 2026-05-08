const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const urlMod = require('url');

// ─── LOAD ENV ───────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = { PORT: '8080', HOST: '0.0.0.0', JWT_SECRET: 'dev-secret-change-me', APP_URL: 'http://localhost:8080' };
  try {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !m[1].startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
  // Override from process.env
  for (const k of Object.keys(env)) { if (process.env[k]) env[k] = process.env[k]; }
  return env;
}
const ENV = loadEnv();

const PORT = parseInt(ENV.PORT) || 8080;
const HOST = ENV.HOST || '0.0.0.0';
const DIR = __dirname;

// ─── JWT ────────────────────────────────────────────────────────────────
let jwt;
try { jwt = require('jsonwebtoken'); } catch { console.log('⚠️ jsonwebtoken not installed. Run: npm install'); process.exit(1); }
const JWT_SECRET = ENV.JWT_SECRET || 'dev-secret-change-me';

function signToken(user) { return jwt.sign({ id: user.id, email: user.email, tier: user.tier }, JWT_SECRET, { expiresIn: '30d' }); }
function verifyToken(token) { try { return jwt.verify(token, JWT_SECRET); } catch { return null; } }

// ─── USER DB ────────────────────────────────────────────────────────────
const DB_PATH = path.join(DIR, 'data', 'users.json');

function loadUsers() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return []; }
}
function saveUsers(users) {
  try { if (!fs.existsSync(path.join(DIR, 'data'))) fs.mkdirSync(path.join(DIR, 'data')); fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2)); } catch {}
}
const users = loadUsers();

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return salt + ':' + hash;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = stored.split(':');
  return crypto.scryptSync(pw, salt, 64).toString('hex') === hash;
}
function findUser(email) { return users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
function nextId() { return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1; }

// ─── SUBSCRIPTION TIERS ─────────────────────────────────────────────────
const TIERS = {
  free: { scansPerDay: 999999, maxTrackedPicks: 999999, scanIntervalMs: 80, name: 'Free' },
  pro: { scansPerDay: 999999, maxTrackedPicks: 999999, scanIntervalMs: 80, name: 'Pro' },
};

// ─── STRIPE ─────────────────────────────────────────────────────────────
let stripe;
try {
  if (ENV.STRIPE_SECRET_KEY && !ENV.STRIPE_SECRET_KEY.startsWith('sk_live_...')) {
    stripe = require('stripe')(ENV.STRIPE_SECRET_KEY);
  }
} catch {}

// ─── MIME ───────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// ─── STOCK UNIVERSES ────────────────────────────────────────────────────
const UNIVERSES = {
  us: [
    { t: 'AAPL', n: 'Apple Inc.', s: 'Technology' },
    { t: 'MSFT', n: 'Microsoft Corp.', s: 'Technology' },
    { t: 'NVDA', n: 'NVIDIA Corp.', s: 'Semiconductors' },
    { t: 'AMZN', n: 'Amazon.com Inc.', s: 'Consumer Cyclical' },
    { t: 'META', n: 'Meta Platforms', s: 'Technology' },
    { t: 'GOOGL', n: 'Alphabet Inc.', s: 'Technology' },
    { t: 'TSLA', n: 'Tesla Inc.', s: 'Automotive' },
    { t: 'AVGO', n: 'Broadcom Inc.', s: 'Semiconductors' },
    { t: 'JPM', n: 'JPMorgan Chase', s: 'Financial' },
    { t: 'V', n: 'Visa Inc.', s: 'Financial' },
    { t: 'WMT', n: 'Walmart Inc.', s: 'Consumer Staples' },
    { t: 'JNJ', n: 'Johnson & Johnson', s: 'Healthcare' },
    { t: 'MA', n: 'Mastercard Inc.', s: 'Financial' },
    { t: 'PG', n: 'Procter & Gamble', s: 'Consumer Staples' },
    { t: 'XOM', n: 'Exxon Mobil Corp.', s: 'Energy' },
    { t: 'KO', n: 'Coca-Cola Co.', s: 'Consumer Staples' },
    { t: 'MRK', n: 'Merck & Co.', s: 'Healthcare' },
    { t: 'HD', n: 'Home Depot Inc.', s: 'Consumer Cyclical' },
    { t: 'COST', n: 'Costco Wholesale', s: 'Consumer Staples' },
    { t: 'ABBV', n: 'AbbVie Inc.', s: 'Healthcare' },
    { t: 'CRM', n: 'Salesforce Inc.', s: 'Technology' },
    { t: 'AMD', n: 'Advanced Micro Devices', s: 'Semiconductors' },
    { t: 'NFLX', n: 'Netflix Inc.', s: 'Technology' },
    { t: 'ADBE', n: 'Adobe Inc.', s: 'Technology' },
    { t: 'PYPL', n: 'PayPal Holdings', s: 'Financial' },
    { t: 'INTC', n: 'Intel Corp.', s: 'Semiconductors' },
    { t: 'BA', n: 'Boeing Co.', s: 'Aerospace' },
    { t: 'DIS', n: 'Walt Disney Co.', s: 'Entertainment' },
    { t: 'NKE', n: 'Nike Inc.', s: 'Consumer Cyclical' },
    { t: 'QCOM', n: 'Qualcomm Inc.', s: 'Semiconductors' },
    { t: 'TXN', n: 'Texas Instruments', s: 'Semiconductors' },
    { t: 'LMT', n: 'Lockheed Martin', s: 'Aerospace' },
    { t: 'CAT', n: 'Caterpillar Inc.', s: 'Industrials' },
    { t: 'GS', n: 'Goldman Sachs', s: 'Financial' },
    { t: 'UNH', n: 'UnitedHealth Group', s: 'Healthcare' },
    { t: 'CVX', n: 'Chevron Corp.', s: 'Energy' },
    { t: 'MCD', n: "McDonald's Corp.", s: 'Consumer Cyclical' },
    { t: 'AMAT', n: 'Applied Materials', s: 'Semiconductors' },
    { t: 'MU', n: 'Micron Technology', s: 'Semiconductors' },
    { t: 'PLTR', n: 'Palantir Technologies', s: 'Technology' },
    { t: 'UBER', n: 'Uber Technologies', s: 'Technology' },
    { t: 'SNAP', n: 'Snap Inc.', s: 'Technology' },
    { t: 'MS', n: 'Morgan Stanley', s: 'Financial' },
    { t: 'SCHW', n: 'Charles Schwab', s: 'Financial' },
    { t: 'LLY', n: 'Eli Lilly & Co.', s: 'Healthcare' },
    { t: 'NOW', n: 'ServiceNow Inc.', s: 'Technology' },
    { t: 'PANW', n: 'Palo Alto Networks', s: 'Technology' },
    { t: 'VRTX', n: 'Vertex Pharma', s: 'Healthcare' },
    { t: 'ABNB', n: 'Airbnb Inc.', s: 'Consumer Cyclical' },
    { t: 'CHD', n: 'Church & Dwight', s: 'Consumer Staples' },
    { t: 'NXPI', n: 'NXP Semiconductors', s: 'Semiconductors' },
  ],
  europe: [
    { t: 'SAP.DE', n: 'SAP SE', s: 'Technology', m: 'Germany' },
    { t: 'MC.PA', n: 'LVMH Moët Hennessy', s: 'Consumer Cyclical', m: 'France' },
    { t: 'ASML.AS', n: 'ASML Holding', s: 'Semiconductors', m: 'Netherlands' },
    { t: 'HSBA.L', n: 'HSBC Holdings', s: 'Financial', m: 'UK' },
    { t: 'TTE.PA', n: 'TotalEnergies SE', s: 'Energy', m: 'France' },
    { t: 'SIE.DE', n: 'Siemens AG', s: 'Industrials', m: 'Germany' },
    { t: 'OR.PA', n: "L'Oréal S.A.", s: 'Consumer Staples', m: 'France' },
    { t: 'SAN.MC', n: 'Banco Santander', s: 'Financial', m: 'Spain' },
    { t: 'ALV.DE', n: 'Allianz SE', s: 'Financial', m: 'Germany' },
    { t: 'DTE.DE', n: 'Deutsche Telekom', s: 'Telecom', m: 'Germany' },
    { t: 'AZN.L', n: 'AstraZeneca PLC', s: 'Healthcare', m: 'UK' },
    { t: 'DGE.L', n: 'Diageo PLC', s: 'Consumer Staples', m: 'UK' },
    { t: 'SHEL.L', n: 'Shell PLC', s: 'Energy', m: 'UK' },
    { t: 'BP.L', n: 'BP PLC', s: 'Energy', m: 'UK' },
    { t: 'BAYN.DE', n: 'Bayer AG', s: 'Healthcare', m: 'Germany' },
    { t: 'MUV2.DE', n: 'Munich Re', s: 'Financial', m: 'Germany' },
    { t: 'AD.AS', n: 'Koninklijke Ahold', s: 'Consumer Staples', m: 'Netherlands' },
    { t: 'SU.PA', n: 'Schneider Electric', s: 'Industrials', m: 'France' },
    { t: 'AIR.PA', n: 'Airbus SE', s: 'Aerospace', m: 'France' },
    { t: 'ENEL.MI', n: 'Enel S.p.A.', s: 'Utilities', m: 'Italy' },
    { t: 'RACE.MI', n: 'Ferrari N.V.', s: 'Automotive', m: 'Italy' },
    { t: 'ULVR.L', n: 'Unilever PLC', s: 'Consumer Staples', m: 'UK' },
    { t: 'RIO.L', n: 'Rio Tinto PLC', s: 'Materials', m: 'UK' },
    { t: 'GLEN.L', n: 'Glencore PLC', s: 'Materials', m: 'UK' },
    { t: 'LSEG.L', n: 'London Stock Exchange', s: 'Financial', m: 'UK' },
    { t: 'REL.L', n: 'RELX PLC', s: 'Industrials', m: 'UK' },
    { t: 'ABI.BR', n: 'Anheuser-Busch InBev', s: 'Consumer Staples', m: 'Belgium' },
    { t: 'KER.PA', n: 'Kering SA', s: 'Consumer Cyclical', m: 'France' },
    { t: 'RMS.PA', n: 'Hermès International', s: 'Consumer Cyclical', m: 'France' },
  ],
  brazil: [
    { t: 'PETR4.SA', n: 'Petrobras PN', s: 'Energy' },
    { t: 'VALE3.SA', n: 'Vale ON', s: 'Materials' },
    { t: 'ITUB4.SA', n: 'Itaú Unibanco PN', s: 'Financial' },
    { t: 'BBDC4.SA', n: 'Bradesco PN', s: 'Financial' },
    { t: 'ABEV3.SA', n: 'Ambev ON', s: 'Consumer Staples' },
    { t: 'BBAS3.SA', n: 'Banco do Brasil ON', s: 'Financial' },
    { t: 'B3SA3.SA', n: 'B3 ON', s: 'Financial' },
    { t: 'ELET3.SA', n: 'Eletrobras ON', s: 'Utilities' },
    { t: 'WEGE3.SA', n: 'WEG ON', s: 'Industrials' },
    { t: 'RENT3.SA', n: 'Localiza ON', s: 'Consumer Cyclical' },
    { t: 'EQTL3.SA', n: 'Equatorial Energia ON', s: 'Utilities' },
    { t: 'SUZB3.SA', n: 'Suzano ON', s: 'Materials' },
    { t: 'RAIL3.SA', n: 'Rumo ON', s: 'Industrials' },
    { t: 'CSNA3.SA', n: 'CSN ON', s: 'Materials' },
    { t: 'GGBR4.SA', n: 'Gerdau PN', s: 'Materials' },
    { t: 'PRIO3.SA', n: 'Prio ON', s: 'Energy' },
    { t: 'VBBR3.SA', n: 'Vibra Energia ON', s: 'Energy' },
    { t: 'MGLU3.SA', n: 'Magazine Luiza ON', s: 'Consumer Cyclical' },
    { t: 'LREN3.SA', n: 'Lojas Renner ON', s: 'Consumer Cyclical' },
    { t: 'JBSS3.SA', n: 'JBS ON', s: 'Consumer Staples' },
    { t: 'EMBR3.SA', n: 'Embraer ON', s: 'Aerospace' },
    { t: 'CVCB3.SA', n: 'CVC Brasil ON', s: 'Consumer Cyclical' },
    { t: 'HAPV3.SA', n: 'Hapvida ON', s: 'Healthcare' },
    { t: 'RADL3.SA', n: 'Raia Drogasil ON', s: 'Consumer Staples' },
    { t: 'MRFG3.SA', n: 'Marfrig ON', s: 'Consumer Staples' },
  ],
};

// ─── RATE LIMITING ──────────────────────────────────────────────────────
const scanCounts = {}; // email -> { date, count }

function getTier(email) {
  const user = findUser(email);
  if (!user || user.tier === 'free') return TIERS.free;
  // Check if subscription is active
  if (user.tier === 'pro' && user.subscriptionEnd) {
    if (new Date(user.subscriptionEnd) < new Date()) {
      user.tier = 'free'; saveUsers(users);
      return TIERS.free;
    }
  }
  return TIERS[user.tier] || TIERS.free;
}

function checkScanLimit(email) {
  const tier = getTier(email);
  const today = new Date().toISOString().slice(0, 10);
  if (!scanCounts[email] || scanCounts[email].date !== today) {
    scanCounts[email] = { date: today, count: 0 };
  }
  scanCounts[email].count++;
  const remaining = tier.scansPerDay - scanCounts[email].count;
  const allowed = scanCounts[email].count <= tier.scansPerDay;
  return { allowed, remaining, tier: tier.name, scanInterval: tier.scanIntervalMs };
}

// ─── YAHOO FETCH ────────────────────────────────────────────────────────
async function yahooFetch(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5y&interval=1d`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Yahoo returned ${r.status}`);
  return r.json();
}

async function yahooNews(ticker) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=5`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Yahoo news returned ${r.status}`);
  const data = await r.json();
  return (data.news || []).map(n => ({
    title: n.title, link: n.link, publisher: n.publisher, summary: (n.summary || '').slice(0, 200),
  }));
}

// ─── ECONOMIC CALENDAR ──────────────────────────────────────────────────
function generateCalendar() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const events = [
    { date: nextWeekday(now, 0), title: '🛢️ EIA Crude Oil Inventories', impact: 'medium' },
    { date: nextWeekday(now, 1), title: '📊 Jobless Claims', impact: 'high' },
    { date: nextWeekday(now, 2), title: '🏠 Existing Home Sales', impact: 'medium' },
    { date: nextWeekday(now, 3), title: '📈 S&P Flash Manufacturing PMI', impact: 'high' },
    { date: nextWeekday(now, 4), title: '🔨 Durable Goods Orders', impact: 'high' },
  ];
  events.push({ date: nthWeekday(y, m, 2, 3), title: '🏛️ FOMC Minutes Release', impact: 'high' });
  events.push({ date: nthWeekday(y, m, 3, 4), title: '📊 GDP (Second Estimate)', impact: 'high' });
  events.push({ date: lastDay(y, m + 1), title: '📊 PCE Price Index (Core)', impact: 'high' });
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}
function nextWeekday(from, offset) { const d = new Date(from); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); }
function nthWeekday(year, month, n, dow) { let count = 0; for (let day = 1; day <= 31; day++) { const d = new Date(year, month, day); if (d.getMonth() !== month) break; if (d.getDay() === dow) { count++; if (count === n) return d.toISOString().slice(0, 10); } } return ''; }
function lastDay(year, month) { const d = new Date(year, month, 0); return d.toISOString().slice(0, 10); }

// ─── HTTP HELPERS ──────────────────────────────────────────────────────
function sendJSON(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}
function sendError(res, code, msg) { sendJSON(res, code, { error: msg }); }
function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}
function getAuthUser(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return verifyToken(token);
}

// ─── REQUEST HANDLER ────────────────────────────────────────────────────
async function handleRequest(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // ─── AUTH ROUTES ────────────────────────────────────────────
    if (pathname === '/api/auth/signup' && req.method === 'POST') {
      const body = await readBody(req);
      const { email, password } = body;
      if (!email || !password || password.length < 6) return sendError(res, 400, 'Email and password (min 6 chars) required');
      if (findUser(email)) return sendError(res, 409, 'Email already registered');
      const user = { id: nextId(), email: email.toLowerCase(), password: hashPassword(password), tier: 'free', createdAt: new Date().toISOString(), subscriptionId: null, subscriptionEnd: null };
      users.push(user); saveUsers(users);
      const token = signToken(user);
      return sendJSON(res, 201, { token, user: { id: user.id, email: user.email, tier: user.tier } });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readBody(req);
      const { email, password } = body;
      const user = findUser(email);
      if (!user || !verifyPassword(password, user.password)) return sendError(res, 401, 'Invalid email or password');
      const token = signToken(user);
      return sendJSON(res, 200, { token, user: { id: user.id, email: user.email, tier: user.tier } });
    }

    if (pathname === '/api/auth/me') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 401, 'User not found');
      return sendJSON(res, 200, { id: user.id, email: user.email, tier: user.tier, subscriptionEnd: user.subscriptionEnd });
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
        const session = await stripe.billingPortal.sessions.create({
          customer: user.subscriptionId,
          return_url: ENV.APP_URL + '/',
        });
        return sendJSON(res, 200, { url: session.url });
      } catch (e) { return sendError(res, 500, 'Stripe error: ' + e.message); }
    }

    if (pathname === '/api/stripe/webhook' && req.method === 'POST') {
      if (!stripe || !ENV.STRIPE_WEBHOOK_SECRET) return sendError(res, 503, 'Stripe webhook not configured');
      let body = '';
      req.on('data', c => body += c);
      await new Promise(resolve => req.on('end', resolve));
      try {
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(body, sig, ENV.STRIPE_WEBHOOK_SECRET);
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const email = session.customer_email;
          const user = findUser(email);
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
          const email = sub.customer_email || (sub.customer && (await stripe.customers.retrieve(sub.customer)).email);
          const user = findUser(email);
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

    // ─── SCAN LIMIT CHECK ───────────────────────────────────────
    if (pathname === '/api/limit') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendJSON(res, 200, { allowed: false, tier: 'guest', scansRemaining: 0 });
      const limit = checkScanLimit(authUser.email);
      return sendJSON(res, 200, { allowed: limit.allowed, tier: limit.tier, scansRemaining: limit.remaining, scanInterval: limit.scanInterval });
    }

    // ─── STOCK ROUTES ────────────────────────────────────────────
    if (pathname === '/api/universes') {
      const summary = Object.entries(UNIVERSES).map(([key, stocks]) => ({
        id: key, name: key === 'us' ? 'United States' : key === 'europe' ? 'Europe' : 'Brazil',
        label: key === 'us' ? '🇺🇸 S&P 500' : key === 'europe' ? '🇪🇺 STOXX 600' : '🇧🇷 Bovespa', count: stocks.length,
      }));
      return sendJSON(res, 200, summary);
    }

    const universeMatch = pathname.match(/^\/api\/universe\/(\w+)$/);
    if (universeMatch) {
      const stocks = UNIVERSES[universeMatch[1]];
      if (!stocks) return sendError(res, 404, 'Unknown universe');
      return sendJSON(res, 200, stocks);
    }

    const historyMatch = pathname.match(/^\/api\/history\/([A-Za-z0-9.]+)$/);
    if (historyMatch) {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Sign in required to scan');
      const limit = checkScanLimit(authUser.email);
      if (!limit.allowed) return sendJSON(res, 429, { error: 'Scan limit reached for today', limit, tier: limit.tier });
      try {
        const data = await yahooFetch(historyMatch[1]);
        return sendJSON(res, 200, data);
      } catch (err) { return sendError(res, 502, err.message); }
    }

    const newsMatch = pathname.match(/^\/api\/news\/([A-Za-z0-9.]+)$/);
    if (newsMatch) {
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
      // Scan all markets
      const results = {};
      for (const [market, stocks] of Object.entries(UNIVERSES)) {
        const batch = [];
        for (const stock of stocks) {
          try { const data = await yahooFetch(stock.t); batch.push({ ...stock, data }); } catch {}
          await new Promise(r => setTimeout(r, limit.scanInterval));
        }
        results[market] = batch;
      }
      return sendJSON(res, 200, results);
    }

    if (pathname === '/api/calendar') return sendJSON(res, 200, generateCalendar());

    // ─── STATIC FILES ────────────────────────────────────────────
    let uri = pathname === '/' ? '/stock-dashboard.html' : pathname;
    let fpath = path.join(DIR, uri);
    if (!fpath.startsWith(DIR)) return sendError(res, 403, 'Forbidden');
    try {
      const content = fs.readFileSync(fpath);
      const ext = path.extname(fpath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(content);
    } catch {
      // Fallback to dashboard for SPA routing
      const fallback = path.join(DIR, 'stock-dashboard.html');
      try {
        const content = fs.readFileSync(fallback);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(content);
      } catch { sendError(res, 404, 'Not Found'); }
    }
  } catch (err) {
    console.error('Server error:', err);
    sendError(res, 500, 'Internal server error');
  }
}

// ─── START ──────────────────────────────────────────────────────────────
const server = http.createServer(handleRequest);
server.listen(PORT, HOST, () => {
  const url = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
  console.log(`\n🚀  MOMENTUM v5.0 — Paper Trading Simulator :: ${url}`);
  console.log('⚠️  EDUCATIONAL PURPOSES ONLY — Not financial advice.');
  console.log(`📊  ${Object.values(UNIVERSES).reduce((a,b) => a+b.length, 0)} stocks across ${Object.keys(UNIVERSES).length} markets`);
  console.log(`💳  ${stripe ? 'Stripe connected' : 'Stripe not configured (set STRIPE_SECRET_KEY)'}`);
  console.log(`👤  ${users.length} users registered`);
  console.log(`📁  Data: ${DB_PATH}\n`);
});
