const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const HOST = '0.0.0.0';
const DIR = __dirname;

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

// ─── HELPERS ────────────────────────────────────────────────────────────
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
    title: n.title,
    link: n.link,
    publisher: n.publisher,
    summary: (n.summary || '').slice(0, 200),
  }));
}

// ─── REQUEST HANDLER ────────────────────────────────────────────────────
async function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // ── GET /api/universes ── list available market universes
  if (pathname === '/api/universes') {
    const summary = Object.entries(UNIVERSES).map(([key, stocks]) => ({
      id: key,
      name: key === 'us' ? 'United States' : key === 'europe' ? 'Europe' : 'Brazil',
      label: key === 'us' ? '🇺🇸 S&P 500' : key === 'europe' ? '🇪🇺 STOXX 600' : '🇧🇷 Bovespa',
      count: stocks.length,
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(summary));
    return;
  }

  // ── GET /api/universe/:market ── list stocks in a market
  const universeMatch = pathname.match(/^\/api\/universe\/(\w+)$/);
  if (universeMatch) {
    const key = universeMatch[1];
    const stocks = UNIVERSES[key];
    if (!stocks) { res.writeHead(404); res.end(JSON.stringify({ error: 'Unknown universe' })); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stocks));
    return;
  }

  // ── GET /api/history/:ticker ── stock price history
  const historyMatch = pathname.match(/^\/api\/history\/([A-Za-z0-9.]+)$/);
  if (historyMatch) {
    const ticker = historyMatch[1].toUpperCase();
    try {
      const data = await yahooFetch(ticker);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(502);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── GET /api/news/:ticker ── recent news
  const newsMatch = pathname.match(/^\/api\/news\/([A-Za-z0-9.]+)$/);
  if (newsMatch) {
    const ticker = newsMatch[1].toUpperCase();
    try {
      const news = await yahooNews(ticker);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(news));
    } catch (err) {
      res.writeHead(502);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── GET /api/scan ── scan all markets, return analyzed data
  if (pathname === '/api/scan') {
    const results = {};
    for (const [market, stocks] of Object.entries(UNIVERSES)) {
      const batch = [];
      for (const stock of stocks) {
        try {
          const data = await yahooFetch(stock.t);
          batch.push({ ...stock, data });
        } catch {
          // skip failures
        }
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
      }
      results[market] = batch;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
    return;
  }

  // ── GET /api/calendar ── economic calendar (returns upcoming events)
  if (pathname === '/api/calendar') {
    const events = generateCalendar();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(events));
    return;
  }

  // ── GET /api/portfolio ── placeholder (could persist to disk later)
  if (pathname === '/api/portfolio') {
    const portfolioPath = path.join(DIR, 'portfolio.json');
    try {
      const data = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([]));
    }
    return;
  }

  // ── POST /api/portfolio ── save portfolio
  if (pathname === '/api/portfolio' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        fs.writeFileSync(path.join(DIR, 'portfolio.json'), body, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ── Serve static files ──
  let uri = pathname === '/' ? '/stock-dashboard.html' : pathname;
  let fpath = path.join(DIR, uri);
  if (!fpath.startsWith(DIR)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    const content = fs.readFileSync(fpath);
    const ext = path.extname(fpath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}

// ─── ECONOMIC CALENDAR ──────────────────────────────────────────────────
function generateCalendar() {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const events = [
    { date: nextWeekday(now, 0), title: '🛢️ EIA Crude Oil Inventories', impact: 'medium' },
    { date: nextWeekday(now, 1), title: '📊 Jobless Claims', impact: 'high' },
    { date: nextWeekday(now, 2), title: '🏠 Existing Home Sales', impact: 'medium' },
    { date: nextWeekday(now, 3), title: '📈 S&P Flash Manufacturing PMI', impact: 'high' },
    { date: nextWeekday(now, 4), title: '🔨 Durable Goods Orders', impact: 'high' },
  ];
  // Add Fed events (2nd and 4th week-ish)
  events.push({ date: nthWeekday(y, m, 2, 3), title: '🏛️ FOMC Minutes Release', impact: 'high' });
  events.push({ date: nthWeekday(y, m, 3, 4), title: '📊 GDP (Second Estimate)', impact: 'high' });
  events.push({ date: lastDay(y, m + 1), title: '📊 PCE Price Index (Core)', impact: 'high' });
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function nextWeekday(from, offset) {
  const d = new Date(from);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function nthWeekday(year, month, n, dow) {
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) break;
    if (d.getDay() === dow) { count++; if (count === n) return d.toISOString().slice(0, 10); }
  }
  return '';
}

function lastDay(year, month) {
  const d = new Date(year, month, 0);
  return d.toISOString().slice(0, 10);
}

// ─── START ──────────────────────────────────────────────────────────────
const server = http.createServer(handleRequest);
server.listen(PORT, HOST, () => {
  console.log(`🚀 Jerry's Stock Dashboard v5.0 :: http://localhost:${PORT}`);
  console.log(`📊 Universes: ${Object.keys(UNIVERSES).length} (${Object.values(UNIVERSES).reduce((a,b) => a+b.length, 0)} stocks)`);
});
