// Momentum — Currency helpers (USD-only for S&P 500 scanner).
function getCurrencySymbol(ticker) {
  return '$';
}

function getCurrencyCode(sym) {
  return 'USD';
}

function getFxRates() {
  return {};
}

function renderFxBar() {
  const bar = document.getElementById('fxBar');
  if (bar) bar.style.display = 'none';
}

async function autoFetchFxRates() {
  renderFxBar();
}
