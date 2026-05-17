const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
  for (const k of Object.keys(env)) { if (process.env[k]) env[k] = process.env[k]; }
  return env;
}
const ENV = loadEnv();

const PORT = parseInt(ENV.PORT) || 8080;
const HOST = ENV.HOST || '0.0.0.0';
const DIR = __dirname;

// ─── JWT ────────────────────────────────────────────────────────────────
let jwt;
try { jwt = require('jsonwebtoken'); } catch { console.error('❌ jsonwebtoken not installed. Run: npm install'); process.exit(1); }

const JWT_SECRET = ENV.JWT_SECRET || 'dev-secret-change-me';
if (ENV.NODE_ENV === 'production' && (!ENV.JWT_SECRET || JWT_SECRET === 'dev-secret-change-me')) {
  console.error('❌ FATAL: JWT_SECRET is not set or is using the default dev value in production. Set the JWT_SECRET environment variable.');
  process.exit(1);
}

function signToken(user) { return jwt.sign({ id: user.id, email: user.email, tier: user.tier }, JWT_SECRET, { expiresIn: '30d' }); }
function verifyToken(token) { try { return jwt.verify(token, JWT_SECRET); } catch { return null; } }

// ─── EMAIL ──────────────────────────────────────────────────────────────
const RESEND_API_KEY = ENV.RESEND_API_KEY || '';
const RESEND_FROM = ENV.RESEND_FROM_EMAIL || 'Momentum <noreply@momentum.app>';
const APP_URL_BASE = ENV.APP_URL || 'http://localhost:8080';

function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) { console.warn('[email] RESEND_API_KEY not set — skipping'); return Promise.resolve(); }
  return new Promise((resolve) => {
    const body = JSON.stringify({ from: RESEND_FROM, to: [to], subject, html });
    const https = require('https');
    const req = https.request({
      hostname: 'api.resend.com', path: '/emails', method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => { res.resume(); resolve(res.statusCode); });
    req.on('error', e => { console.error('[email] send error:', e.message); resolve(null); });
    req.write(body); req.end();
  });
}

// ─── TOKEN STORES ───────────────────────────────────────────────────────
const _resetTokens = new Map();   // token → { email, expiresAt }
const _verifyTokens = new Map();  // token → { email, expiresAt }
const _verifyCooldown = new Map();// email → lastSentAt (ms)

function makeToken() { return crypto.randomBytes(32).toString('hex'); }

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _resetTokens) if (v.expiresAt < now) _resetTokens.delete(k);
  for (const [k, v] of _verifyTokens) if (v.expiresAt < now) _verifyTokens.delete(k);
}, 60_000);

// ─── USER DB ────────────────────────────────────────────────────────────
const DB_PATH = path.join(DIR, 'data', 'users.json');

function loadUsers() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return []; }
}

function saveUsers(users) {
  try {
    fs.mkdirSync(path.join(DIR, 'data'), { recursive: true });
    // Atomic write: write to temp file then rename to prevent corruption
    const tmp = DB_PATH + '.tmp.' + process.pid;
    fs.writeFileSync(tmp, JSON.stringify(users, null, 2));
    fs.renameSync(tmp, DB_PATH);
  } catch (e) { console.error('saveUsers error:', e); }
}

const ADMIN_EMAIL = 'thiagotupa@hotmail.com'.toLowerCase();
const users = loadUsers();
let needsSave = false;
users.forEach(u => {
  if (u.email === ADMIN_EMAIL && u.tier !== 'admin') { u.tier = 'admin'; needsSave = true; }
  if (u.email !== ADMIN_EMAIL && u.tier === 'admin') { u.tier = 'free'; needsSave = true; }
});
if (needsSave) saveUsers(users);

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
  free:  { scansPerDay: 999999, maxTrackedPicks: 5,    maxStocksPerMarket: 5,    scanIntervalMs: 80, name: 'Free' },
  pro:   { scansPerDay: 999999, maxTrackedPicks: 9999,  maxStocksPerMarket: 9999, scanIntervalMs: 80, name: 'Pro' },
  admin: { scansPerDay: 999999, maxTrackedPicks: 9999,  maxStocksPerMarket: 9999, scanIntervalMs: 80, name: 'Admin' },
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
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// ─── IN-MEMORY CACHE (Yahoo Finance) ────────────────────────────────────
const _cache = new Map();
const CACHE_TTL_MS = 60_000; // 60 seconds

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.data;
}
function cacheSet(key, data, ttlMs = CACHE_TTL_MS) {
  _cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ─── AUTH RATE LIMITER ──────────────────────────────────────────────────
const _authAttempts = new Map();
const AUTH_MAX = 10;
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkAuthRateLimit(ip) {
  const now = Date.now();
  const entry = _authAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    _authAttempts.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return true;
  }
  if (entry.count >= AUTH_MAX) return false;
  entry.count++;
  return true;
}

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
  brasil: [
    { t: 'PETR4.SA', n: 'Petrobras PN', s: 'Energia' },
    { t: 'VALE3.SA', n: 'Vale ON', s: 'Materiais' },
    { t: 'ITUB4.SA', n: 'Itaú Unibanco PN', s: 'Financeiro' },
    { t: 'BBDC4.SA', n: 'Bradesco PN', s: 'Financeiro' },
    { t: 'ABEV3.SA', n: 'Ambev ON', s: 'Consumo' },
    { t: 'BBAS3.SA', n: 'Banco do Brasil ON', s: 'Financeiro' },
    { t: 'B3SA3.SA', n: 'B3 ON', s: 'Financeiro' },
    { t: 'ELET3.SA', n: 'Eletrobras ON', s: 'Utilidades' },
    { t: 'WEGE3.SA', n: 'WEG ON', s: 'Industriais' },
    { t: 'RENT3.SA', n: 'Localiza ON', s: 'Consumo' },
    { t: 'EQTL3.SA', n: 'Equatorial Energia ON', s: 'Utilidades' },
    { t: 'SUZB3.SA', n: 'Suzano ON', s: 'Materiais' },
    { t: 'RAIL3.SA', n: 'Rumo ON', s: 'Industriais' },
    { t: 'CSNA3.SA', n: 'CSN ON', s: 'Materiais' },
    { t: 'GGBR4.SA', n: 'Gerdau PN', s: 'Materiais' },
    { t: 'PRIO3.SA', n: 'Prio ON', s: 'Energia' },
    { t: 'VBBR3.SA', n: 'Vibra Energia ON', s: 'Energia' },
    { t: 'MGLU3.SA', n: 'Magazine Luiza ON', s: 'Varejo' },
    { t: 'LREN3.SA', n: 'Lojas Renner ON', s: 'Varejo' },
    { t: 'JBSS3.SA', n: 'JBS ON', s: 'Consumo' },
    { t: 'EMBR3.SA', n: 'Embraer ON', s: 'Aeroespacial' },
    { t: 'HAPV3.SA', n: 'Hapvida ON', s: 'Saúde' },
    { t: 'RADL3.SA', n: 'Raia Drogasil ON', s: 'Saúde' },
    { t: 'MRFG3.SA', n: 'Marfrig ON', s: 'Consumo' },
    { t: 'MULT3.SA', n: 'Multiplan ON', s: 'Imóveis' },
    { t: 'UGPA3.SA', n: 'Ultrapar ON', s: 'Energia' },
    { t: 'TAEE11.SA', n: 'Taesa UNT', s: 'Utilidades' },
    { t: 'VIVT3.SA', n: 'Vivo ON', s: 'Telecom' },
    { t: 'TIMS3.SA', n: 'TIM ON', s: 'Telecom' },
    { t: 'CMIG4.SA', n: 'Cemig PN', s: 'Utilidades' },
    { t: 'CPFE3.SA', n: 'CPFL Energia ON', s: 'Utilidades' },
    { t: 'CSAN3.SA', n: 'Cosan ON', s: 'Energia' },
    { t: 'CIEL3.SA', n: 'Cielo ON', s: 'Financeiro' },
    { t: 'SBSP3.SA', n: 'Sabesp ON', s: 'Utilidades' },
    { t: 'BRFS3.SA', n: 'BRF ON', s: 'Consumo' },
    { t: 'TOTS3.SA', n: 'Totvs ON', s: 'Tecnologia' },
    { t: 'PETZ3.SA', n: 'PetCenter ON', s: 'Varejo' },
    { t: 'SMTO3.SA', n: 'São Martinho ON', s: 'Consumo' },
    { t: 'SLCE3.SA', n: 'SLC Agrícola ON', s: 'Agronegócio' },
    { t: 'AGRO3.SA', n: 'BrasilAgro ON', s: 'Agronegócio' },
  ],
  emerging: [
    // 🇲🇽 MEXICO
    { t: 'AMXL.MX', n: 'América Móvil', s: 'Telecom', r: 'Mexico' },
    { t: 'WALMEX.MX', n: 'Walmart México', s: 'Consumer Staples', r: 'Mexico' },
    { t: 'FEMSAUBD.MX', n: 'FEMSA', s: 'Consumer Staples', r: 'Mexico' },
    { t: 'CX', n: 'CEMEX', s: 'Materials', r: 'Mexico' },
    { t: 'GMEXICOB.MX', n: 'Grupo México', s: 'Materials', r: 'Mexico' },
    { t: 'BBAJIOO.MX', n: 'Banco del Bajío', s: 'Financial', r: 'Mexico' },
    // 🇮🇳 INDIA (ADRs on US exchanges)
    { t: 'RELIANCE.NS', n: 'Reliance Industries', s: 'Energy', r: 'India' },
    { t: 'TCS.NS', n: 'Tata Consultancy', s: 'Technology', r: 'India' },
    { t: 'INFY', n: 'Infosys', s: 'Technology', r: 'India' },
    { t: 'HDB', n: 'HDFC Bank', s: 'Financial', r: 'India' },
    { t: 'IBN', n: 'ICICI Bank', s: 'Financial', r: 'India' },
    // 🇨🇳 CHINA (ADRs)
    { t: 'BABA', n: 'Alibaba Group', s: 'Consumer Cyclical', r: 'China' },
    { t: 'JD', n: 'JD.com', s: 'Consumer Cyclical', r: 'China' },
    { t: 'BIDU', n: 'Baidu Inc.', s: 'Technology', r: 'China' },
    { t: 'NIO', n: 'NIO Inc.', s: 'Automotive', r: 'China' },
    { t: 'PDD', n: 'Pinduoduo', s: 'Consumer Cyclical', r: 'China' },
    // 🇿🇦 SOUTH AFRICA
    { t: 'NPSNY', n: 'Naspers', s: 'Technology', r: 'South Africa' },
    { t: 'SOL.JO', n: 'Sasol', s: 'Energy', r: 'South Africa' },
    // 🇨🇱 CHILE
    { t: 'BSAC', n: 'Banco Santander Chile', s: 'Financial', r: 'Chile' },
    // 🇵🇱 POLAND
    { t: 'CDR.WA', n: 'CD Projekt', s: 'Technology', r: 'Poland' },
  ],
};

// ─── SCAN RATE LIMITING ─────────────────────────────────────────────────
const scanCounts = {};

function getTier(email) {
  const user = findUser(email);
  if (!user || user.tier === 'free') return TIERS.free;
  if (user.tier === 'pro' && user.subscriptionEnd) {
    if (new Date(user.subscriptionEnd) < new Date()) {
      user.tier = 'free'; saveUsers(users);
      return TIERS.free;
    }
  }
  return TIERS[user.tier] || TIERS.free;
}

function getScanState(email) {
  const tier = getTier(email);
  const today = new Date().toISOString().slice(0, 10);
  if (!scanCounts[email] || scanCounts[email].date !== today) scanCounts[email] = { date: today, count: 0 };
  const count = scanCounts[email].count;
  return { allowed: count < tier.scansPerDay, remaining: tier.scansPerDay - count, tier: tier.name, scanInterval: tier.scanIntervalMs };
}

function checkScanLimit(email) {
  const state = getScanState(email);
  if (state.allowed) {
    scanCounts[email].count++;
    const tier = getTier(email);
    state.remaining = tier.scansPerDay - scanCounts[email].count;
    state.allowed = scanCounts[email].count <= tier.scansPerDay;
  }
  return state;
}

// ─── YAHOO FETCH (with cache) ────────────────────────────────────────────
async function yahooFetch(ticker) {
  const cacheKey = 'chart:' + ticker;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=5y&interval=1d`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Yahoo returned ${r.status} for ${ticker}`);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Yahoo returned non-JSON for ${ticker}`); }
  cacheSet(cacheKey, data);
  return data;
}

async function yahooNews(ticker) {
  const cacheKey = 'news:' + ticker;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=5`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Yahoo news returned ${r.status} for ${ticker}`);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Yahoo news returned non-JSON for ${ticker}`); }
  const news = (data.news || []).map(n => ({
    title: n.title, link: n.link, publisher: n.publisher, summary: (n.summary || '').slice(0, 200),
  }));
  cacheSet(cacheKey, news);
  return news;
}

// ─── ECONOMIC CALENDAR ──────────────────────────────────────────────────
function nextWeekday(from, offset) { const d = new Date(from); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); }
function nthWeekday(year, month, n, dow) { let count = 0; for (let day = 1; day <= 31; day++) { const d = new Date(year, month, day); if (d.getMonth() !== month) break; if (d.getDay() === dow) { count++; if (count === n) return d.toISOString().slice(0, 10); } } return ''; }
function lastDay(year, month) { const d = new Date(year, month, 0); return d.toISOString().slice(0, 10); }
function nextMonday(from) { const d = new Date(from); const day = d.getDay(); const diff = day === 1 ? 7 : (8 - day) % 7 || 7; d.setDate(d.getDate() + diff); return d.toISOString().slice(0, 10); }
function lastWeekdayOfMonth(year, month) { const d = new Date(year, month + 1, 0); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }
function addDays(dateStr, n) { const d = new Date(dateStr); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

function generateCalendar() {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() + 60);
  const todayStr = now.toISOString().slice(0, 10);

  const allEvents = [];

  // ── US events ──────────────────────────────────────────────────────────
  allEvents.push({
    date: nextWeekday(now, 0),
    title: '🛢️ EIA Crude Oil Inventories',
    title_pt: '🛢️ Estoques de Petróleo EIA',
    impact: 'medium', market: 'us',
    note: 'Rising inventories bearish for oil → watch PETR4',
    note_pt: 'Estoques em alta são baixistas para petróleo → observar PETR4',
    tickers_up: ['PETR4.SA', 'XOM', 'CVX'], tickers_down: [],
    links: [{ label: 'EIA', url: 'https://www.eia.gov/petroleum/supply/weekly/' }],
  });
  allEvents.push({
    date: nextWeekday(now, 1),
    title: '📊 Jobless Claims',
    title_pt: '📊 Pedidos de Seguro-Desemprego',
    impact: 'high', market: 'us',
    note: 'Lower claims = strong labor market, broadly bullish',
    note_pt: 'Menos pedidos = mercado de trabalho forte, amplamente altista',
    tickers_up: ['SPY', 'VALE3.SA'], tickers_down: [],
    links: [{ label: 'BLS', url: 'https://www.bls.gov/news.release/jobsit.nr0.htm' }],
  });
  allEvents.push({
    date: nextWeekday(now, 2),
    title: '🏠 Existing Home Sales',
    title_pt: '🏠 Vendas de Imóveis Usados (EUA)',
    impact: 'medium', market: 'us',
    note: 'Housing data affects construction and mortgage rates',
    note_pt: 'Dados de habitação afetam construção e taxas de hipotecas',
    tickers_up: [], tickers_down: [],
    links: [{ label: 'NAR', url: 'https://www.nar.realtor/research-and-statistics' }],
  });
  allEvents.push({
    date: nextWeekday(now, 3),
    title: '📈 S&P Flash Manufacturing PMI',
    title_pt: '📈 PMI Industrial S&P Flash',
    impact: 'high', market: 'us',
    note: 'PMI > 50 signals expansion — bullish for equities and commodities',
    note_pt: 'PMI > 50 sinaliza expansão — altista para ações e commodities',
    tickers_up: ['SPY', 'VALE3.SA'], tickers_down: [],
    links: [{ label: 'S&P Global', url: 'https://www.spglobal.com/marketintelligence/en/mi/research-analysis/pmi.html' }],
  });
  allEvents.push({
    date: nextWeekday(now, 4),
    title: '🔨 Durable Goods Orders',
    title_pt: '🔨 Pedidos de Bens Duráveis (EUA)',
    impact: 'high', market: 'us',
    note: 'Strong orders signal industrial demand',
    note_pt: 'Pedidos fortes sinalizam demanda industrial',
    tickers_up: ['BA', 'CAT'], tickers_down: [],
    links: [{ label: 'Census', url: 'https://www.census.gov/economic-indicators/' }],
  });
  allEvents.push({
    date: nthWeekday(y, m, 2, 3),
    title: '🏛️ FOMC Minutes Release',
    title_pt: '🏛️ Ata do FOMC (Fed)',
    impact: 'high', market: 'us',
    note: 'Fed tone shapes global risk appetite — hawkish = USD up, BRL down',
    note_pt: 'Tom do Fed molda apetite global — hawkish = USD sobe, BRL cai',
    tickers_up: [], tickers_down: [],
    links: [{ label: 'Fed', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm' }],
  });
  allEvents.push({
    date: nthWeekday(y, m, 3, 4),
    title: '📊 GDP (Second Estimate)',
    title_pt: '📊 PIB EUA (Segunda Estimativa)',
    impact: 'high', market: 'us',
    note: 'US GDP miss may strengthen Fed dovish case — positive for equities',
    note_pt: 'PIB abaixo pode fortalecer caso dovish do Fed — positivo para ações',
    tickers_up: ['SPY'], tickers_down: [],
    links: [{ label: 'BEA', url: 'https://www.bea.gov/news/schedule' }],
  });
  allEvents.push({
    date: lastDay(y, m + 1),
    title: '📊 PCE Price Index (Core)',
    title_pt: '📊 Índice de Preços PCE (Núcleo)',
    impact: 'high', market: 'us',
    note: 'Core PCE is Fed\'s preferred inflation gauge — hot reading = rate concern',
    note_pt: 'PCE é o indicador de inflação preferido do Fed — leitura quente = preocupação com juros',
    tickers_up: [], tickers_down: [],
    links: [{ label: 'BEA PCE', url: 'https://www.bea.gov/data/personal-consumption-expenditures-price-index' }],
  });

  // ── Brazilian events ───────────────────────────────────────────────────
  // COPOM meeting dates 2026
  const copomDates = [
    '2026-01-29','2026-03-19','2026-05-07','2026-06-18',
    '2026-07-30','2026-09-17','2026-11-05','2026-12-10',
  ];
  copomDates.forEach(date => {
    allEvents.push({
      date,
      title: '🏦 COPOM Meeting (SELIC Rate)',
      title_pt: '🏦 Reunião do COPOM (Taxa SELIC)',
      impact: 'high', market: 'brasil',
      note: 'SELIC rate decision — rate cut favors banks and retail; rate hike pressures equities',
      note_pt: 'Decisão da taxa SELIC — corte favorece bancos e varejo; alta pressiona ações',
      tickers_up: ['ITUB4.SA', 'BBDC4.SA', 'BBAS3.SA', 'LREN3.SA'],
      tickers_down: ['MGLU3.SA', 'RENT3.SA'],
      links: [
        { label: 'BCB', url: 'https://www.bcb.gov.br/controleinflacao/copom' },
        { label: 'InfoMoney', url: 'https://www.infomoney.com.br/mercados/' },
      ],
    });
    // Ata do COPOM — 6 days after each meeting
    allEvents.push({
      date: addDays(date, 6),
      title: '📋 COPOM Minutes (Ata)',
      title_pt: '📋 Ata do COPOM',
      impact: 'medium', market: 'brasil',
      note: 'Meeting minutes may signal next rate direction — watch hawkish/dovish tone',
      note_pt: 'Ata pode sinalizar próxima direção da taxa — atenção ao tom hawkish/dovish',
      tickers_up: ['ITUB4.SA', 'BBDC4.SA'],
      tickers_down: [],
      links: [{ label: 'Atas BCB', url: 'https://www.bcb.gov.br/publicacoes/atascopom' }],
    });
  });

  // IPCA — 9th of current month or next month if past
  const ipcaDay = 9;
  let ipcaDate = new Date(y, m, ipcaDay);
  if (ipcaDate <= now) ipcaDate = new Date(y, m + 1, ipcaDay);
  allEvents.push({
    date: ipcaDate.toISOString().slice(0, 10),
    title: '📊 IPCA — Brazil CPI Release',
    title_pt: '📊 IPCA — Índice de Preços ao Consumidor',
    impact: 'high', market: 'brasil',
    note: 'Inflation above estimate pressures SELIC — negative for rate-sensitive stocks',
    note_pt: 'Inflação acima do esperado pressiona SELIC — negativo para ações sensíveis a juros',
    tickers_up: ['VALE3.SA', 'PETR4.SA'],
    tickers_down: ['LREN3.SA', 'MGLU3.SA', 'ITUB4.SA'],
    links: [
      { label: 'IBGE', url: 'https://www.ibge.gov.br/explica/inflacao.php' },
      { label: 'BCB Metas', url: 'https://www.bcb.gov.br/controleinflacao/historicotaxasinflacao' },
    ],
  });

  // Balança Comercial — next Monday from today
  allEvents.push({
    date: nextMonday(now),
    title: '⚖️ Brazil Trade Balance',
    title_pt: '⚖️ Balança Comercial Brasileira',
    impact: 'medium', market: 'brasil',
    note: 'Trade surplus strengthens BRL — positive for importers; surplus driven by commodity exports',
    note_pt: 'Superávit fortalece o BRL — positivo para importadores; superávit impulsionado por exportações de commodities',
    tickers_up: ['VALE3.SA', 'PETR4.SA', 'SUZB3.SA'],
    tickers_down: [],
    links: [
      { label: 'MDIC', url: 'https://balanca.economia.gov.br/balanca/' },
      { label: 'B3 Data', url: 'https://www.b3.com.br/pt_br/market-data-e-indices/' },
    ],
  });

  // PIB Brazil — last weekday of current month
  allEvents.push({
    date: lastWeekdayOfMonth(y, m),
    title: '📈 Brazil GDP (PIB)',
    title_pt: '📈 PIB Brasil (Produto Interno Bruto)',
    impact: 'high', market: 'brasil',
    note: 'GDP above estimate is broadly bullish; strong domestic data favors consumer and bank stocks',
    note_pt: 'PIB acima do esperado é amplamente altista; dados domésticos fortes favorecem consumo e bancos',
    tickers_up: ['ITUB4.SA', 'BBDC4.SA', 'LREN3.SA', 'WEGE3.SA'],
    tickers_down: [],
    links: [{ label: 'IBGE PIB', url: 'https://www.ibge.gov.br/explica/pib.php' }],
  });

  // Filter: only future events within 60 days, sort by date ascending
  return allEvents
    .filter(e => e.date >= todayStr && new Date(e.date) <= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
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

function getAuthUser(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return verifyToken(token);
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

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Auth rate limiting (IP-based)
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if ((pathname === '/api/auth/login' || pathname === '/api/auth/signup' || pathname === '/api/auth/forgot-password') && req.method === 'POST') {
    if (!checkAuthRateLimit(clientIp)) return sendError(res, 429, 'Too many attempts. Please wait 15 minutes before trying again.');
  }

  try {
    // ─── AUTH ────────────────────────────────────────────────────
    if (pathname === '/api/auth/signup' && req.method === 'POST') {
      const body = await readBody(req);
      const { email, password } = body;
      if (!email || !password || password.length < 6) return sendError(res, 400, 'Email and password (min 6 chars) required');
      if (findUser(email)) return sendError(res, 409, 'Email already registered');
      const user = { id: nextId(), email: email.toLowerCase(), password: hashPassword(password), tier: 'free', createdAt: new Date().toISOString(), subscriptionId: null, subscriptionEnd: null, emailVerified: false };
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
      if (!user || !verifyPassword(password, user.password)) return sendError(res, 401, 'Invalid email or password');
      return sendJSON(res, 200, { token: signToken(user), user: { id: user.id, email: user.email, tier: user.tier } });
    }

    if (pathname === '/api/auth/me') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 401, 'User not found');
      return sendJSON(res, 200, { id: user.id, email: user.email, tier: user.tier, subscriptionEnd: user.subscriptionEnd, emailVerified: user.emailVerified !== false });
    }

    if (pathname === '/api/auth/change-password' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) return sendError(res, 401, 'Not authenticated');
      const body = await readBody(req);
      const user = findUser(authUser.email);
      if (!user) return sendError(res, 404, 'User not found');
      if (!body.oldPassword) return sendError(res, 400, 'Current password is required');
      if (!verifyPassword(body.oldPassword, user.password)) return sendError(res, 400, 'Current password is incorrect');
      if (!body.newPassword || body.newPassword.length < 6) return sendError(res, 400, 'New password must be at least 6 characters');
      user.password = hashPassword(body.newPassword);
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
      user.password = hashPassword(password);
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
        createdAt: user.createdAt, subscriptionEnd: user.subscriptionEnd,
        exportedAt: new Date().toISOString(),
        note: 'Portfolio and tracking data is stored locally in your browser (localStorage). This export covers only your account record on our server.',
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

    // ─── B3 TICKER AUTOCOMPLETE ──────────────────────────────────
    if (pathname === '/api/tickers/b3' && req.method === 'GET') {
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
      let body = '';
      req.on('data', c => body += c);
      await new Promise(resolve => req.on('end', resolve));
      try {
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(body, sig, ENV.STRIPE_WEBHOOK_SECRET);
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          // customer_email may be null on some session types; fall back to customer lookup
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
        const data = await yahooFetch(ticker);
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
  console.log(`\n🚀  MOMENTUM v5.1 — Trading Journal & Scanner :: ${url}`);
  console.log('⚠️  EDUCATIONAL PURPOSES ONLY — Not financial advice.');
  console.log(`📊  ${Object.values(UNIVERSES).reduce((a, b) => a + b.length, 0)} stocks across ${Object.keys(UNIVERSES).length} markets`);
  console.log(`💳  ${stripe ? 'Stripe connected' : 'Stripe not configured (set STRIPE_SECRET_KEY)'}`);
  console.log(`👤  ${users.length} users registered`);
  console.log(`📁  Data: ${DB_PATH}`);
  console.log(`🔒  Auth rate limit: ${AUTH_MAX} attempts per ${AUTH_WINDOW_MS / 60000} min per IP`);
  console.log(`💾  Yahoo cache TTL: ${CACHE_TTL_MS / 1000}s\n`);
});
