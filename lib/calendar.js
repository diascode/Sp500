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

  return allEvents
    .filter(e => e.date >= todayStr && new Date(e.date) <= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

module.exports = { generateCalendar };
