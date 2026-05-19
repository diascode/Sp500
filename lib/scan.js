'use strict';

module.exports = function createScan(auth) {
  const { findUser, TIERS, users, saveUsers } = auth;

  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

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

  function generateWhy(rsi, macd, adx, patternName, lang = 'pt') {
    const parts = [];
    if (lang === 'pt') {
      if (rsi < 35) parts.push(`RSI em ${rsi.toFixed(0)}, indicando ativo sobrevendido e possível reversão.`);
      else if (rsi > 70) parts.push(`RSI em ${rsi.toFixed(0)}, ativo sobrecomprado — sinal de cautela.`);
      if (macd > 0 && adx > 25) parts.push(`MACD positivo com tendência forte (ADX ${adx.toFixed(0)}).`);
      else if (macd > 0) parts.push('MACD positivo, momentum favorável.');
      if (patternName && patternName !== 'none' && patternName !== 'Análise') parts.push(`Padrão ${patternName} identificado nos últimos 90 dias.`);
      return parts.length > 0 ? parts.slice(0, 2).join(' ') : 'Sinal baseado em análise técnica de múltiplos indicadores.';
    } else {
      if (rsi < 35) parts.push(`RSI at ${rsi.toFixed(0)}, indicating oversold conditions and possible reversal.`);
      else if (rsi > 70) parts.push(`RSI at ${rsi.toFixed(0)}, overbought — caution advised.`);
      if (macd > 0 && adx > 25) parts.push(`Positive MACD with strong trend (ADX ${adx.toFixed(0)}).`);
      else if (macd > 0) parts.push('Positive MACD, favourable momentum.');
      if (patternName && patternName !== 'none' && patternName !== 'Analysis') parts.push(`${patternName} pattern identified in the last 90 days.`);
      return parts.length > 0 ? parts.slice(0, 2).join(' ') : 'Signal based on multi-indicator technical analysis.';
    }
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
