// Mock data for Momentum BR
window.MOCK = (function () {
  function series(seed, n, base, vol) {
    const out = [];
    let v = base;
    let s = seed;
    for (let i = 0; i < n; i++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280 - 0.5;
      v = v + r * vol;
      out.push(Math.max(0.1, v));
    }
    return out;
  }

  // Brazilian stocks first — that's the home market
  const stocks = [
    { ticker: "PETR4", name: "Petrobras PN", sector: "Energia", region: "BR", flag: "🇧🇷", emoji: "🛢️", currency: "R$", price: 38.42, change1y: 14.5, change1d: 1.2, signal: "buy", rsi: 58.7, macd: 0.92, adx: 28.3, pattern: "Tendência de alta", series: series(7, 90, 36, 0.8), tp: 44.18, sl: 35.73, why: "Dividendos altos e petróleo em alta sustentando o papel." },
    { ticker: "VALE3", name: "Vale ON", sector: "Mineração", region: "BR", flag: "🇧🇷", emoji: "⛏️", currency: "R$", price: 64.80, change1y: -3.2, change1d: -0.8, signal: "hold", rsi: 47.1, macd: -0.18, adx: 19.6, pattern: "Lateralizado", series: series(43, 90, 65, 1.2), tp: 74.52, sl: 60.26, why: "Minério lateralizado, mas câmbio favorece resultado." },
    { ticker: "ITUB4", name: "Itaú Unibanco PN", sector: "Financeiro", region: "BR", flag: "🇧🇷", emoji: "🏦", currency: "R$", price: 34.15, change1y: 22.8, change1d: 0.6, signal: "buy", rsi: 62.4, macd: 0.45, adx: 31.2, pattern: "Cruzamento de alta", series: series(11, 90, 30, 0.4), tp: 39.27, sl: 31.76, why: "Banco mais lucrativo do país surfando alta da Selic." },
    { ticker: "MGLU3", name: "Magazine Luiza ON", sector: "Varejo", region: "BR", flag: "🇧🇷", emoji: "🛍️", currency: "R$", price: 12.40, change1y: -28.4, change1d: -2.1, signal: "sell", rsi: 31.2, macd: -0.84, adx: 38.5, pattern: "Tendência de baixa", series: series(23, 90, 16, 0.5), tp: 14.26, sl: 11.53, why: "Pressão de juros altos no consumo. Cuidado." },
    { ticker: "WEGE3", name: "WEG ON", sector: "Indústria", region: "BR", flag: "🇧🇷", emoji: "⚡", currency: "R$", price: 42.18, change1y: 18.3, change1d: 1.5, signal: "buy", rsi: 65.1, macd: 0.62, adx: 35.4, pattern: "Cruzamento de alta", series: series(31, 90, 38, 0.5), tp: 48.51, sl: 39.23, why: "Exportadora forte com câmbio favorável." },
    { ticker: "BBDC4", name: "Bradesco PN", sector: "Financeiro", region: "BR", flag: "🇧🇷", emoji: "🏦", currency: "R$", price: 16.85, change1y: 8.2, change1d: 0.4, signal: "hold", rsi: 52.3, macd: 0.12, adx: 22.1, pattern: "Indecisão", series: series(37, 90, 16, 0.3), tp: 19.38, sl: 15.67, why: "Resultado estável, espera por gatilho." },
    { ticker: "ABEV3", name: "Ambev ON", sector: "Bebidas", region: "BR", flag: "🇧🇷", emoji: "🍺", currency: "R$", price: 11.95, change1y: 5.4, change1d: 0.2, signal: "hold", rsi: 49.8, macd: 0.05, adx: 18.2, pattern: "Lateralizado", series: series(41, 90, 11.5, 0.2), tp: 13.74, sl: 11.12, why: "Defensiva clássica, paga dividendos." },
    { ticker: "LREN3", name: "Lojas Renner ON", sector: "Varejo", region: "BR", flag: "🇧🇷", emoji: "👕", currency: "R$", price: 18.62, change1y: 15.7, change1d: 0.9, signal: "buy", rsi: 60.2, macd: 0.38, adx: 26.8, pattern: "Tendência de alta", series: series(47, 90, 17, 0.4), tp: 21.41, sl: 17.32, why: "Recuperação do varejo de vestuário." },

    // International (secondary tier)
    { ticker: "NVDA", name: "NVIDIA", sector: "Semicondutores", region: "US", flag: "🇺🇸", emoji: "🎮", currency: "$", price: 215.20, change1y: 1408.5, change1d: 2.4, signal: "buy", rsi: 65.9, macd: 5.86, adx: 78.6, pattern: "Tendência de alta forte", series: series(11, 90, 200, 4), tp: 247.48, sl: 200.14, why: "Rali contínuo. Cuidado: pode estar esticada." },
    { ticker: "MSFT", name: "Microsoft", sector: "Tecnologia", region: "US", flag: "🇺🇸", emoji: "💻", currency: "$", price: 415.12, change1y: 67.9, change1d: 0.8, signal: "buy", rsi: 53.9, macd: 5.88, adx: 60.0, pattern: "Cruzamento de alta", series: series(7, 90, 400, 6), tp: 477.39, sl: 386.06, why: "Recuperação após dip do Q1, momentum bom." },
    { ticker: "AAPL", name: "Apple", sector: "Tecnologia", region: "US", flag: "🇺🇸", emoji: "🍎", currency: "$", price: 192.45, change1y: 12.3, change1d: 0.3, signal: "hold", rsi: 48.2, macd: -0.34, adx: 22.1, pattern: "Indecisão", series: series(3, 90, 190, 3), tp: 220.00, sl: 178.50, why: "Esperando gatilho. Range apertado." },
    { ticker: "AMZN", name: "Amazon", sector: "Varejo", region: "US", flag: "🇺🇸", emoji: "📦", currency: "$", price: 178.90, change1y: 28.4, change1d: 1.1, signal: "buy", rsi: 58.1, macd: 2.11, adx: 31.5, pattern: "Cruzamento de alta", series: series(17, 90, 170, 5), tp: 205.74, sl: 166.38, why: "Cloud crescendo, anúncios surpreendendo." },
  ];

  const news = [
    { title: "Petróleo sobe 2% com expectativa de novo corte da OPEP", source: "Valor Econômico", time: "1h", ticker: "PETR4" },
    { title: "Itaú anuncia maior lucro trimestral da história do banco", source: "Folha", time: "3h", ticker: "ITUB4" },
    { title: "Vale terá investimento bilionário em mineração sustentável", source: "InfoMoney", time: "5h", ticker: "VALE3" },
    { title: "Magazine Luiza pressionada por juros altos e vendas fracas", source: "Brazil Journal", time: "1d", ticker: "MGLU3" },
    { title: "WEG bate recorde de exportação no primeiro tri", source: "Estadão", time: "1d", ticker: "WEGE3" },
  ];

  const calendar = [
    { date: "17/Mai", impact: "high", flag: "🇧🇷", title: "Decisão do COPOM (Selic)", note: "Tendência de manutenção em 10,75%" },
    { date: "18/Mai", impact: "high", flag: "🇧🇷", title: "IPCA-15 maio", note: "Inflação mensal. Acima do esperado pressiona Selic" },
    { date: "19/Mai", impact: "med", flag: "🇺🇸", title: "Pedidos de auxílio-desemprego", note: "Mercado de trabalho forte = Fed firme" },
    { date: "21/Mai", impact: "high", flag: "🇧🇷", title: "PIB Brasil 1T", note: "Acima do esperado favorece consumo" },
    { date: "23/Mai", impact: "high", flag: "🇧🇷", title: "Ata do COPOM", note: "Sinaliza tom para próximas reuniões" },
  ];

  const lessons = [
    { emoji: "📊", title: "O que é RSI?", body: "É um medidor de força entre 0 e 100. Acima de 70 = pode estar caro. Abaixo de 30 = pode estar barato.", read: "3 min", level: "iniciante" },
    { emoji: "🔀", title: "Como ler um cruzamento de MACD", body: "Quando a linha rápida cruza a lenta pra cima, é sinal de força. Pra baixo, sinal de fraqueza.", read: "4 min", level: "iniciante" },
    { emoji: "💪", title: "ADX e a força da tendência", body: "ADX não diz pra que lado vai — diz se tem tendência mesmo. Acima de 25, vale a pena seguir.", read: "5 min", level: "intermediário" },
    { emoji: "🎯", title: "Take Profit e Stop Loss", body: "Antes de comprar, defina onde vai sair lucrando e onde vai cortar prejuízo. Sem isso, não é trade, é apostar.", read: "6 min", level: "iniciante" },
    { emoji: "📉", title: "Bandas de Bollinger", body: "Duas linhas em volta da média. Quando o preço estoura a banda, fique atento — reversão pode vir.", read: "4 min", level: "intermediário" },
    { emoji: "💸", title: "Quanto investir no começo?", body: "Comece com o que você não vai precisar. R$100 já é o suficiente pra aprender — o objetivo aqui é aprender, não enriquecer.", read: "5 min", level: "iniciante" },
  ];

  const regions = [
    { id: "br", code: "BR", name: "Brasil", flag: "🇧🇷", count: 40, signals: 5 },
    { id: "us", code: "US", name: "EUA", flag: "🇺🇸", count: 51, signals: 8 },
    { id: "eu", code: "EU", name: "Europa", flag: "🇪🇺", count: 29, signals: 4 },
    { id: "em", code: "EM", name: "Emergentes", flag: "🌍", count: 44, signals: 6 },
  ];

  const portfolio = [
    { ticker: "PETR4", emoji: "🛢️", qty: 100, entry: 32.50, current: 38.42, days: 87, currency: "R$" },
    { ticker: "ITUB4", emoji: "🏦", qty: 50, entry: 28.10, current: 34.15, days: 124, currency: "R$" },
    { ticker: "MGLU3", emoji: "🛍️", qty: 200, entry: 15.80, current: 12.40, days: 45, currency: "R$" },
  ];

  return { stocks, news, calendar, lessons, regions, portfolio };
})();
