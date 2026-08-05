'use strict';

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
    impact: 'medium', market: 'us',
    note: 'Rising inventories bearish for oil → watch XOM, CVX',
    tickers_up: ['XOM', 'CVX'], tickers_down: [],
    links: [{ label: 'EIA', url: 'https://www.eia.gov/petroleum/supply/weekly/' }],
  });
  allEvents.push({
    date: nextWeekday(now, 1),
    title: '📊 Jobless Claims',
    impact: 'high', market: 'us',
    note: 'Lower claims = strong labor market, broadly bullish',
    tickers_up: ['SPY'], tickers_down: [],
    links: [{ label: 'BLS', url: 'https://www.bls.gov/news.release/jobsit.nr0.htm' }],
  });
  allEvents.push({
    date: nextWeekday(now, 2),
    title: '🏠 Existing Home Sales',
    impact: 'medium', market: 'us',
    note: 'Housing data affects construction and mortgage rates',
    tickers_up: [], tickers_down: [],
    links: [{ label: 'NAR', url: 'https://www.nar.realtor/research-and-statistics' }],
  });
  allEvents.push({
    date: nextWeekday(now, 3),
    title: '📈 S&P Flash Manufacturing PMI',
    impact: 'high', market: 'us',
    note: 'PMI > 50 signals expansion — bullish for equities and commodities',
    tickers_up: ['SPY'], tickers_down: [],
    links: [{ label: 'S&P Global', url: 'https://www.spglobal.com/marketintelligence/en/mi/research-analysis/pmi.html' }],
  });
  allEvents.push({
    date: nextWeekday(now, 4),
    title: '🔨 Durable Goods Orders',
    impact: 'high', market: 'us',
    note: 'Strong orders signal industrial demand',
    tickers_up: ['BA', 'CAT'], tickers_down: [],
    links: [{ label: 'Census', url: 'https://www.census.gov/economic-indicators/' }],
  });
  allEvents.push({
    date: nthWeekday(y, m, 2, 3),
    title: '🏛️ FOMC Minutes Release',
    impact: 'high', market: 'us',
    note: 'Fed tone shapes risk appetite — hawkish = USD up, equities under pressure',
    tickers_up: [], tickers_down: [],
    links: [{ label: 'Fed', url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm' }],
  });
  allEvents.push({
    date: nthWeekday(y, m, 3, 4),
    title: '📊 GDP (Second Estimate)',
    impact: 'high', market: 'us',
    note: 'US GDP miss may strengthen Fed dovish case — positive for equities',
    tickers_up: ['SPY'], tickers_down: [],
    links: [{ label: 'BEA', url: 'https://www.bea.gov/news/schedule' }],
  });
  allEvents.push({
    date: lastDay(y, m + 1),
    title: '📊 PCE Price Index (Core)',
    impact: 'high', market: 'us',
    note: 'Core PCE is Fed\'s preferred inflation gauge — hot reading = rate concern',
    tickers_up: [], tickers_down: [],
    links: [{ label: 'BEA PCE', url: 'https://www.bea.gov/data/personal-consumption-expenditures-price-index' }],
  });

  // ── US events only ─────────────────────────────────────────────────────

  return allEvents
    .filter(e => e.date >= todayStr && new Date(e.date) <= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

module.exports = { generateCalendar };
