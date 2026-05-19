// Momentum — FX rate helpers. No DOM deps except renderFxBar (requires #fxBar element).
function getCurrencySymbol(ticker) {
  if (!ticker) return '$';
  const t = ticker.toUpperCase();
  if (t.endsWith('.SA')) return 'R$';
  if (t.endsWith('.L')) return '£';
  if (t.endsWith('.DE') || t.endsWith('.PA') || t.endsWith('.AS') || t.endsWith('.MC') ||
      t.endsWith('.MI') || t.endsWith('.BR') || t.endsWith('.AT') || t.endsWith('.LS')) return '€';
  if (t.endsWith('.NS') || t.endsWith('.BO')) return '₹';
  if (t.endsWith('.MX')) return 'MX$';
  if (t.endsWith('.JO')) return 'R';
  return '$';
}

// FX rate infrastructure — used only in the tax estimate BRL total
var FX_CACHE_KEY = 'momentum_fx_rates';
var FX_CACHE_TTL = 60 * 60 * 1000; // 60 minutes

function getCurrencyCode(sym) {
  const map = { '$': 'USD', 'R$': 'BRL', '£': 'GBP', '€': 'EUR', '₹': 'INR', 'MX$': 'MXN', 'R': 'ZAR' };
  return map[sym] || sym;
}

function getFxYahooTicker(code) {
  if (code === 'BRL') return null;
  return code + 'BRL=X';
}

function loadFxCache() {
  try { return JSON.parse(localStorage.getItem(FX_CACHE_KEY) || '{}'); } catch { return {}; }
}

function saveFxCache(cache) {
  localStorage.setItem(FX_CACHE_KEY, JSON.stringify(cache));
}

// Returns { USD: 5.42, EUR: 5.85, ... } from cache + manual overrides
function getFxRates() {
  return loadFxCache();
}

function setFxRateManual(code, rate) {
  const cache = loadFxCache();
  cache[code] = { rate: parseFloat(rate), manual: true, fetchedAt: Date.now() };
  saveFxCache(cache);
}

async function fetchFxRate(code) {
  if (code === 'BRL') return 1.0;
  const ticker = getFxYahooTicker(code);
  if (!ticker) return null;
  try {
    const data = await api('/api/history/' + encodeURIComponent(ticker));
    // Yahoo chart format: {chart:{result:[{meta:{regularMarketPrice},indicators:{quote:[{close:[]}]}}]}}
    const result = data?.chart?.result?.[0];
    if (result) {
      const price = result.meta?.regularMarketPrice;
      if (price && price > 0) return price;
      const closes = result.indicators?.quote?.[0]?.close;
      if (Array.isArray(closes) && closes.length > 0) {
        const last = closes.filter(Boolean).pop();
        if (last) return last;
      }
    }
  } catch {}
  return null;
}

async function refreshFxRates(codes) {
  const cache = loadFxCache();
  const now = Date.now();
  await Promise.all(codes.filter(c => c !== 'BRL').map(async code => {
    const rate = await fetchFxRate(code);
    if (rate && rate > 0) cache[code] = { rate, manual: false, fetchedAt: now };
  }));
  saveFxCache(cache);
  renderFxBar();
  if (document.getElementById('taxMonthSelect')) generateTaxReport();
}

function renderFxBar() {
  const bar = document.getElementById('fxBar');
  if (!bar) return;
  const cache = getFxRates();
  const codes = Object.keys(cache).filter(c => c !== 'BRL');
  if (codes.length === 0) { bar.style.display = 'none'; return; }
  const codeToSym = { USD:'$', GBP:'£', EUR:'€', INR:'₹', MXN:'MX$', ZAR:'R' };
  const parts = codes.map(code => {
    const entry = cache[code];
    const age = entry.manual ? ' ✎' : (entry.fetchedAt ? ' ⏱' + new Date(entry.fetchedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '');
    const sym = codeToSym[code] || code;
    return `<span style="color:var(--text-dim)">${sym}</span><span style="color:var(--accent-amber);font-weight:700">R$${entry.rate.toFixed(2)}</span><span style="font-size:8px;color:var(--text-dim)">${age}</span>`;
  });
  bar.style.display = '';
  bar.innerHTML = `${parts.join('<span style="color:var(--line);padding:0 4px">·</span>')}`;
}

async function autoFetchFxRates(forceRefresh) {
  const portfolioCodes = [...new Set(
    state.portfolio.map(p => getCurrencyCode(getCurrencySymbol(p.ticker)))
  )].filter(c => c !== 'BRL');
  const defaultCodes = ['USD', 'EUR'];
  const codes = [...new Set([...portfolioCodes, ...defaultCodes])];
  const cache = loadFxCache();
  const now = Date.now();
  const toFetch = forceRefresh
    ? codes
    : codes.filter(c => !cache[c] || (now - (cache[c].fetchedAt || 0)) > FX_CACHE_TTL);
  if (toFetch.length > 0) await refreshFxRates(toFetch);
  else renderFxBar();
}
