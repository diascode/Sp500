'use strict';

module.exports = function createScan(auth) {
  const { findUser, TIERS, users, saveUsers } = auth;

  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  const YAHOO_BASE = process.env.YAHOO_PROXY_URL
    ? process.env.YAHOO_PROXY_URL.trim().replace(/\/$/, '')
    : 'https://query1.finance.yahoo.com';

  // ─── IN-MEMORY CACHE (Yahoo Finance) ────────────────────────────────────
  const _cache = new Map();
  const CACHE_TTL_MS = 60_000;

  function cacheGet(key) {
    const entry = _cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
    return entry.data;
  }
  function cacheSet(key, data, ttlMs = CACHE_TTL_MS) {
    _cache.set(key, { data, expiresAt: Date.now() + ttlMs });
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
  async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
    const ac = new AbortController();
    const timer = setTimeout(() => { ac.abort(); console.warn(`[fetch] timeout: ${url}`); }, timeoutMs);
    try {
      return await fetch(url, { ...opts, signal: ac.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function yahooFetch(ticker) {
    const cacheKey = 'chart:' + ticker;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
    const url = `${YAHOO_BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?range=5y&interval=1d`;
    const r = await fetchWithTimeout(url, { headers: { 'User-Agent': UA } });
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
    const url = `${YAHOO_BASE}/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=5`;
    const r = await fetchWithTimeout(url, { headers: { 'User-Agent': UA } });
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

  // ─── INDICATOR HELPERS (server-side) ────────────────────────────────────
  function serverCalcRSI(closes, period = 14) {
    if (closes.length < period + 1) return 50;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
      const d = closes[i] - closes[i - 1];
      if (d > 0) gains += d; else losses -= d;
    }
    let avgGain = gains / period, avgLoss = losses / period;
    for (let i = period + 1; i < closes.length; i++) {
      const d = closes[i] - closes[i - 1];
      avgGain = (avgGain * (period - 1) + Math.max(0, d)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.max(0, -d)) / period;
    }
    if (avgLoss === 0) return 100;
    return 100 - 100 / (1 + avgGain / avgLoss);
  }

  function serverCalcMACD(closes) {
    function ema(arr, n) {
      const k = 2 / (n + 1);
      let e = arr[0];
      for (let i = 1; i < arr.length; i++) e = arr[i] * k + e * (1 - k);
      return e;
    }
    if (closes.length < 26) return 0;
    return ema(closes, 12) - ema(closes, 26);
  }

  function generateWhy(rsi, macd, adx, patternName, lang = 'en') {
    const parts = [];
    if (rsi < 35) parts.push(`RSI at ${rsi.toFixed(0)}, indicating oversold conditions and possible reversal.`);
    else if (rsi > 70) parts.push(`RSI at ${rsi.toFixed(0)}, overbought — caution advised.`);
    if (macd > 0 && adx > 25) parts.push(`Positive MACD with strong trend (ADX ${adx.toFixed(0)}).`);
    else if (macd > 0) parts.push('Positive MACD, favourable momentum.');
    if (patternName && patternName !== 'none' && patternName !== 'Analysis') parts.push(`${patternName} pattern identified in the last 90 days.`);
    return parts.length > 0 ? parts.slice(0, 2).join(' ') : 'Signal based on multi-indicator technical analysis.';
  }

  function extractCloses(yahooData) {
    try {
      const result = yahooData.chart.result[0];
      const q = result.indicators.quote[0];
      return q.close.filter(v => v != null && !isNaN(v));
    } catch { return []; }
  }

  return {
    UNIVERSES, CACHE_TTL_MS,
    getTier, getScanState, checkScanLimit,
    yahooFetch, yahooNews,
    serverCalcRSI, serverCalcMACD, generateWhy, extractCloses,
  };
};
