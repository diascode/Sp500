const fs = require('fs');
let html = fs.readFileSync('stock-dashboard.html', 'utf8');

// 1. Find and replace the chart container with toggle buttons
// Search for the chart container pattern with ticker
const regex = /<div class="chart-container"><div style="position:absolute;top:4px;left:6px;font-family:'JetBrains Mono',monospace;font-size:8px;color:var\(--text-dim\);z-index:2;pointer-events:none">'\+d\.ticker\+' \\u00b7 55 days \\u00b7 SMA20 SMA50 SMA200 \\u00b7 Bollinger \(2\\u03c3\)<\/div><canvas height="220"><\/canvas><\/div>\+/;

const replacement = '<div class="chart-container"><div style="position:absolute;top:4px;left:6px;font-family:\'JetBrains Mono\',monospace;font-size:8px;color:var(--text-dim);z-index:2;pointer-events:none">\'+d.ticker+\' \\u00b7 <span id="vw_\'+d.ticker+\'">55 days</span> \\u00b7 SMA20 SMA50 SMA200 \\u00b7 Bollinger (2\\u03c3)</div><div style="position:absolute;bottom:6px;right:6px;z-index:3;display:flex;gap:4px"><button class="vw-btn" data-tick="\'+d.ticker+\'" data-view="55d" style="background:rgba(76,175,80,0.2);border:1px solid rgba(76,175,80,0.4);color:var(--green-bull);padding:2px 8px;border-radius:3px;font-family:\'JetBrains Mono\',monospace;font-size:9px;cursor:pointer;font-weight:600">55d</button><button class="vw-btn" data-tick="\'+d.ticker+\'" data-view="1y" style="background:rgba(0,0,0,0.3);border:1px solid var(--border);color:var(--text-dim);padding:2px 8px;border-radius:3px;font-family:\'JetBrains Mono\',monospace;font-size:9px;cursor:pointer;font-weight:600">1Y</button></div><canvas height="220"></canvas></div>+';

const replaced = html.replace(regex, replacement);

if (replaced !== html) {
  html = replaced;
  console.log('Chart container replaced OK');
} else {
  console.log('Regex did not match. Searching for alternate patterns...');
  // Try simpler search
  const idx = html.indexOf('55 days');
  if (idx > 0) {
    console.log('Found "55 days" near:', html.substring(idx - 80, idx + 30));
  } else {
    console.log('Could not find "55 days"');
  }
}

// 2. Store stock data globally for redraw
html = html.replace(
  'const analyzed=stocks.map(s=>analyze(s)).sort((a,b)=>a.company.rank-b.company.rank);',
  'const analyzed=stocks.map(s=>analyze(s)).sort((a,b)=>a.company.rank-b.company.rank); window._stockData = analyzed;'
);
console.log('Global data store patched');

// 3. Add redraw + event listener before </script>
const patchCode = `
function redrawCardChart(ticker, view) {
  var cards = document.querySelectorAll('.card');
  var allCards = Array.from(cards);
  for (var ci = 0; ci < allCards.length; ci++) {
    var h3 = allCards[ci].querySelector('h3');
    if (!h3 || h3.textContent !== ticker) continue;
    var d = window._stockData && window._stockData[ci];
    if (!d) return;
    var candles = view === '1y' ? d.candles : d.chartCandles;
    var n = candles.length;
    var sma20 = calcSMA(d.candles, 20).slice(-n);
    var sma50 = calcSMA(d.candles, 50).slice(-n);
    var sma200 = calcSMA(d.candles, 200).slice(-n);
    var bb = calcBB(d.candles, 14, 2);
    var bbU = [], bbL = [], bbM = [];
    bb.upper.slice(-n).forEach(function(v,i) { bbU.push(v); bbL.push(bb.lower.slice(-n)[i]); bbM.push(bb.mid.slice(-n)[i]); });
    var cv = allCards[ci].querySelector('canvas');
    var pat = view === '1y' ? detectChartPatterns(candles) : d.pattern;
    drawChart(cv, candles, { sma20: sma20, sma50: sma50, sma200: sma200, bbUpper: bbU, bbLower: bbL, bbMid: bbM, pattern: pat });
    var span = document.getElementById('vw_' + ticker);
    if (span) span.textContent = view === '1y' ? '1 year' : '55 days';
    break;
  }
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('vw-btn')) {
    redrawCardChart(e.target.dataset.tick, e.target.dataset.view);
  }
});
`;

html = html.replace('</script>', patchCode + '\n</script>');
console.log('Redraw function added');

fs.writeFileSync('stock-dashboard.html', html);
console.log('Patch complete!');
