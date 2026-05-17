// Screens for Momentum BR
const { useState: useStateS } = React;

// ============ Home ============
function HomeScreen({ onOpen, setRoute, cardVariant }) {
  const stocks = window.MOCK.stocks;
  const brStocks = stocks.filter(s => s.region === "BR");
  const buys = brStocks.filter(s => s.signal === "buy");
  const hero = buys[0];
  const others = buys.slice(1, 4);
  const news = window.MOCK.news;
  const lessons = window.MOCK.lessons;

  return (
    <div className="shell">
      {/* Greeting + balance */}
      <section className="section">
        <div className="hero-greeting">
          <div className="hero-avatar">T</div>
          <div>
            <div className="eyebrow">17 de maio · 14h32</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em" }}>
              Oi Thiago 👋
            </div>
          </div>
        </div>

        <h1 className="hed1">
          Hoje tem <span style={{ color: "var(--primary)" }}>{buys.length} oportunidades</span> de compra na sua lista.
        </h1>
        <p className="dek">Sua carteira está <strong style={{ color: "var(--buy)" }}>+12,4% no mês</strong>. Bora ver o que tá rolando?</p>
      </section>

      {/* Balance card */}
      <section style={{ marginBottom: 24 }}>
        <div className="bal-card">
          <div className="spread" style={{ alignItems: "start", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div className="lbl">Sua carteira (simulada)</div>
              <div className="val">R$ 8.420,18</div>
              <div className="change">+R$ 928,50 · +12,4% este mês</div>
            </div>
            <div className="row">
              <button className="btn btn-primary btn-lg" onClick={() => setRoute("scan")}>⚡ Varrer mercado</button>
              <button className="btn btn-lg" onClick={() => setRoute("portfolio")}>Ver carteira</button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero story card */}
      {hero && (
        <section className="section">
          <div className="spread" style={{ marginBottom: 16 }}>
            <div>
              <div className="kicker">★ Destaque do dia</div>
              <h2 className="hed2" style={{ marginTop: 8 }}>O setup mais limpo</h2>
            </div>
            <button className="btn btn-sm" onClick={() => setRoute("scan")}>Ver todos →</button>
          </div>
          <StoryCard stock={hero} onOpen={onOpen} onTrack={() => {}} />
        </section>
      )}

      {/* Other buys */}
      {others.length > 0 && (
        <section className="section">
          <div className="spread" style={{ marginBottom: 16 }}>
            <h2 className="hed2">Outras oportunidades</h2>
            <span className="eyebrow">{others.length} ações</span>
          </div>
          <div className="grid-3">
            {others.map(s => (
              <FeedCard key={s.ticker} stock={s} onOpen={onOpen} onTrack={() => {}} />
            ))}
          </div>
        </section>
      )}

      {/* News + Lessons two-col */}
      <section className="section">
        <div className="grid-2">
          <div className="card">
            <div className="spread" style={{ marginBottom: 12 }}>
              <h3 className="hed3">📰 No mercado hoje</h3>
              <span className="eyebrow">Ao vivo</span>
            </div>
            {news.map((n, i) => (
              <div key={i} className="news-row">
                <h5>{n.title}</h5>
                <div className="src">{n.source} · {n.time}</div>
                <Chip>{n.ticker}</Chip>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="spread" style={{ marginBottom: 12 }}>
              <h3 className="hed3">🎓 Aprenda agora</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setRoute("learn")}>Ver todas →</button>
            </div>
            <div className="stack-3">
              {lessons.slice(0, 3).map((l, i) => (
                <div key={i} className="lesson-card">
                  <div className="ic">{l.emoji}</div>
                  <h4>{l.title}</h4>
                  <p>{l.body}</p>
                  <div className="meta">
                    <span>{l.read} de leitura</span>
                    <Chip>{l.level}</Chip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ Scanner ============
function ScannerScreen({ onOpen, onScan, scanState, scanProgress }) {
  const [region, setRegion] = useStateS("br");
  const [filter, setFilter] = useStateS("all"); // all | buy | hold | sell

  const stocks = window.MOCK.stocks.filter(s => {
    const regOk = region === "all" ? true : s.region === region.toUpperCase();
    const sigOk = filter === "all" ? true : s.signal === filter;
    return regOk && sigOk;
  });

  const regions = [
    { id: "all", label: "Todos", count: 164 },
    ...window.MOCK.regions.map(r => ({ id: r.id, label: r.flag + " " + r.name, count: r.count })),
  ];

  const buys = stocks.filter(s => s.signal === "buy").length;
  const holds = stocks.filter(s => s.signal === "hold").length;
  const sells = stocks.filter(s => s.signal === "sell").length;

  return (
    <div className="shell">
      <section className="section">
        <div className="kicker">⚡ Scanner</div>
        <h1 className="hed1" style={{ marginTop: 8 }}>
          {buys} ações com sinal de <span style={{ color: "var(--buy)" }}>compra</span>.
        </h1>
        <p className="dek">Cada varredura busca preços ao vivo e roda análise técnica em {stocks.length} ações: RSI, MACD, ADX, médias móveis e Bandas de Bollinger.</p>
      </section>

      {/* Region selector */}
      <div className="seg" style={{ marginBottom: 20 }}>
        {regions.map(r => (
          <button key={r.id} data-active={region === r.id} onClick={() => setRegion(r.id)}>
            {r.label}
            <span className="badge">{r.count}</span>
          </button>
        ))}
      </div>

      {/* Filter chips + scan CTA */}
      <div className="spread" style={{ marginBottom: 24, flexWrap: "wrap" }}>
        <div className="seg">
          {[
            { id: "all", label: "Todos", count: stocks.length },
            { id: "buy", label: "Compra", count: buys },
            { id: "hold", label: "Aguardar", count: holds },
            { id: "sell", label: "Venda", count: sells },
          ].map(f => (
            <button key={f.id} data-active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="badge">{f.count}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => onScan()}>
          {scanState === "scanning" ? "Varrendo…" : "⚡ Varrer agora"}
        </button>
      </div>

      {/* Scan in progress */}
      {scanState === "scanning" && (
        <div className="card" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center", marginBottom: 24 }}>
          <ScanRing progress={scanProgress} />
          <div>
            <div className="kicker">Varrendo o mercado</div>
            <h3 className="hed3" style={{ marginTop: 4 }}>Lendo a série de 90 dias de PETR4…</h3>
            <div className="pbar" style={{ marginTop: 12 }}>
              <div className="fill" style={{ width: scanProgress + "%" }}></div>
            </div>
            <div className="eyebrow" style={{ marginTop: 8 }}>{scanProgress}% · {Math.max(0, Math.round((100 - scanProgress) * 0.12))}s restantes</div>
          </div>
        </div>
      )}

      {/* Results grid */}
      <section className="stack-4">
        <div className="grid-3">
          {stocks.map(s => (
            <FeedCard key={s.ticker} stock={s} onOpen={onOpen} onTrack={() => {}} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ============ Detail ============
function DetailScreen({ stock, onBack }) {
  const [range, setRange] = useStateS("3M");
  const tone = stock.signal === "buy" ? "buy" : stock.signal === "sell" ? "sell" : "hold";
  return (
    <div className="shell">
      <section className="section" style={{ paddingTop: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Voltar ao scanner</button>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, alignItems: "end" }}>
          <div>
            <div className="row" style={{ marginBottom: 8 }}>
              <div className="hero-avatar" style={{ width: 56, height: 56, background: "var(--bg-3)", color: "var(--ink)", fontSize: 26 }}>{stock.emoji}</div>
              <div>
                <h1 className="hed1" style={{ fontSize: 44 }}>
                  {stock.ticker} <span style={{ fontSize: 18, color: "var(--ink-3)", fontWeight: 400 }}>{stock.flag} {stock.name}</span>
                </h1>
                <div className="eyebrow" style={{ marginTop: 4 }}>{stock.sector} · Bolsa B3</div>
              </div>
            </div>
            <div className="row" style={{ alignItems: "baseline", marginTop: 14 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 44, fontWeight: 700, letterSpacing: "-0.025em" }}>
                {fmt(stock.price, stock.currency)}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 500, color: stock.change1d >= 0 ? "var(--buy)" : "var(--sell)" }}>
                {fmtPct(stock.change1d)} hoje
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink-3)" }}>· {fmtPct(stock.change1y)} ano</span>
            </div>
          </div>
          <div className="row">
            <SignalPill signal={stock.signal} />
            <button className="btn">⭐ Acompanhar</button>
            <button className="btn btn-primary">💰 Adicionar à carteira</button>
          </div>
        </div>
      </section>

      {/* Why this signal */}
      <section>
        <div className="card-glow" style={{ borderRadius: 20 }}>
          <div className="kicker">🤔 Por que esse sinal?</div>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)", margin: "10px 0 0", maxWidth: "60ch" }}>
            {stock.why}
          </p>
          <div className="row" style={{ marginTop: 14 }}>
            <Chip tone="buy">RSI {stock.rsi.toFixed(0)} → momentum subindo</Chip>
            <Chip tone="primary">MACD positivo</Chip>
            <Chip>{stock.pattern}</Chip>
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="spread" style={{ marginBottom: 16, flexWrap: "wrap" }}>
          <h2 className="hed3">📈 Gráfico</h2>
          <div className="range-pills">
            {["1D", "1S", "1M", "3M", "6M", "1A", "5A"].map(r => (
              <button key={r} className="range-pill" data-active={range === r} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="chart-frame">
          <div className="row" style={{ marginBottom: 12, gap: 14 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
              <span style={{ display: "inline-block", width: 10, height: 2, background: "var(--primary)", marginRight: 6, verticalAlign: "middle" }}></span>
              MM 20
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
              <span style={{ display: "inline-block", width: 10, height: 2, background: "var(--magenta)", marginRight: 6, verticalAlign: "middle" }}></span>
              MM 50
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>Bandas de Bollinger</span>
          </div>
          <BigChart stock={stock} />

          {/* Levels */}
          <div className="levels">
            <div className="level level-tp">
              <span className="lbl">🎯 Lucro alvo (+15%)</span>
              <span className="num">{fmt(stock.tp, stock.currency)}</span>
            </div>
            <div className="level level-now">
              <span className="lbl">📍 Preço atual</span>
              <span className="num">{fmt(stock.price, stock.currency)}</span>
            </div>
            <div className="level level-sl">
              <span className="lbl">🛑 Stop (-7%)</span>
              <span className="num">{fmt(stock.sl, stock.currency)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="hed3" style={{ marginBottom: 14 }}>Indicadores técnicos</h2>
        <div className="metrics">
          <Metric lbl="RSI 14" val={stock.rsi.toFixed(1)} hint="momentum" tone={stock.rsi > 70 ? "dn" : stock.rsi < 30 ? "up" : ""} />
          <Metric lbl="MACD" val={(stock.macd >= 0 ? "+" : "") + stock.macd.toFixed(2).replace(".", ",")} hint="tendência" tone={stock.macd >= 0 ? "up" : "dn"} />
          <Metric lbl="ADX" val={stock.adx.toFixed(1)} hint="força" />
          <Metric lbl="Padrão" val={stock.pattern} hint="detectado" />
        </div>
      </section>

      {/* Learn hint */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="lesson-card" style={{ borderColor: "var(--primary)", borderWidth: 1 }}>
          <div className="row" style={{ gap: 16, alignItems: "start" }}>
            <div className="ic" style={{ background: "var(--primary)", color: "var(--primary-ink)", flexShrink: 0 }}>?</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4>O que significa RSI {stock.rsi.toFixed(0)}?</h4>
              <p>
                RSI acima de 70 indica que a ação pode estar "esticada" (compra forte). {stock.ticker} está em {stock.rsi.toFixed(0)} — {stock.rsi > 70 ? "atenção, pode corrigir." : stock.rsi > 50 ? "momentum positivo." : "ainda sem força."}
              </p>
            </div>
            <button className="btn btn-sm">Ler aula →</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ lbl, val, hint, tone }) {
  return (
    <div className="metric">
      <div className="lbl">{lbl}</div>
      <div className={`val ${tone === "up" ? "up" : tone === "dn" ? "dn" : ""}`}>{val}</div>
      <div className="hint">{hint}</div>
    </div>
  );
}

// ============ Learn ============
function LearnScreen() {
  const lessons = window.MOCK.lessons;
  return (
    <div className="shell">
      <section className="section">
        <div className="kicker">🎓 Aprender</div>
        <h1 className="hed1" style={{ marginTop: 8 }}>
          Trade não é sorte — é <span style={{ color: "var(--primary)" }}>leitura</span>.
        </h1>
        <p className="dek">Aulas curtas, na linguagem que você fala. Sem fórmula mágica, sem promessa de ficar rico — só os fundamentos pra você entender o que tá lendo na tela.</p>
      </section>

      {/* Onboarding card */}
      <section style={{ marginBottom: 32 }}>
        <div className="onboard-hero">
          <div className="row" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>👋</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Primeira vez aqui?</span>
          </div>
          <h1>Comece com R$ 100 simulados.</h1>
          <p>O Momentum é um simulador. Você aprende a operar com dinheiro de mentira antes de arriscar o seu de verdade — sem perder nada nesse meio tempo.</p>
          <div className="row" style={{ marginTop: 24 }}>
            <button className="btn btn-lg" style={{ background: "var(--bg)", color: "var(--ink)", borderColor: "transparent" }}>Fazer tour guiado →</button>
          </div>
        </div>
      </section>

      <section>
        <div className="grid-2">
          {lessons.map((l, i) => (
            <article key={i} className="lesson-card">
              <div className="ic">{l.emoji}</div>
              <h4>{l.title}</h4>
              <p>{l.body}</p>
              <div className="meta">
                <span>Aula {i + 1} · {l.read}</span>
                <Chip tone={l.level === "iniciante" ? "primary" : "magenta"}>{l.level}</Chip>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

// ============ Portfolio ============
function PortfolioScreen() {
  const positions = window.MOCK.portfolio;
  const totalValue = positions.reduce((s, p) => s + p.qty * p.current, 0);
  const totalCost = positions.reduce((s, p) => s + p.qty * p.entry, 0);
  const totalPl = totalValue - totalCost;
  const totalPlPct = (totalPl / totalCost) * 100;

  return (
    <div className="shell">
      <section className="section">
        <div className="kicker">💼 Carteira</div>
        <h1 className="hed1" style={{ marginTop: 8 }}>
          Você tá <span style={{ color: totalPl >= 0 ? "var(--buy)" : "var(--sell)" }}>{totalPlPct >= 0 ? "+" : ""}{totalPlPct.toFixed(1).replace(".", ",")}%</span><br />
          em {positions.length} posições.
        </h1>
      </section>

      <section style={{ marginBottom: 32 }}>
        <div className="grid-3">
          <div className="big-stat">
            <div className="lbl">Valor total</div>
            <div className="val">{fmt(totalValue, "R$")}</div>
            <div className="sub">{positions.length} ativos</div>
          </div>
          <div className="big-stat">
            <div className="lbl">Custo de entrada</div>
            <div className="val">{fmt(totalCost, "R$")}</div>
            <div className="sub">Investido</div>
          </div>
          <div className="big-stat">
            <div className="lbl">Lucro/prejuízo</div>
            <div className={`val ${totalPl >= 0 ? "up" : "dn"}`}>
              {totalPl >= 0 ? "+" : "-"}{fmt(Math.abs(totalPl), "R$")}
            </div>
            <div className="sub">{totalPlPct >= 0 ? "+" : ""}{totalPlPct.toFixed(1).replace(".", ",")}% do total</div>
          </div>
        </div>
      </section>

      {/* Positions table */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="spread" style={{ marginBottom: 14 }}>
          <h2 className="hed3">Suas posições</h2>
          <div className="row">
            <button className="btn btn-sm">📥 Exportar CSV</button>
            <button className="btn btn-primary btn-sm">+ Nova posição</button>
          </div>
        </div>

        <div className="card-flush">
          {positions.map((p, i) => {
            const value = p.qty * p.current;
            const cost = p.qty * p.entry;
            const dollar = value - cost;
            const pct = (dollar / cost) * 100;
            return (
              <div key={p.ticker} style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr 1fr 1fr 100px", padding: "18px 20px", borderBottom: i < positions.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-3)", display: "grid", placeItems: "center", fontSize: 18 }}>{p.emoji}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{p.ticker}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>{p.qty} ações @ {fmt(p.entry, p.currency)}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-3)" }}>Atual</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 500 }}>{fmt(p.current, p.currency)}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-3)" }}>Valor</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 500 }}>{fmt(value, p.currency)}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-3)" }}>{p.days} dias</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>desde a entrada</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700, color: dollar >= 0 ? "var(--buy)" : "var(--sell)" }}>
                    {dollar >= 0 ? "+" : ""}{pct.toFixed(1).replace(".", ",")}%
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
                    {dollar >= 0 ? "+" : "-"}{fmt(Math.abs(dollar), p.currency)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tax tip */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="card-glow">
          <div className="row" style={{ gap: 16, alignItems: "start" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "color-mix(in srgb, var(--magenta) 18%, transparent)", color: "var(--magenta)", display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0 }}>💰</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Relatório de IR (DARF)</h4>
              <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 14, lineHeight: 1.5 }}>
                Calcula automaticamente seu imposto sobre ganhos, gera DARF mensal e exporta tudo em CSV pra você não passar nervoso em abril.
              </p>
            </div>
            <button className="btn btn-magenta">Pro · R$ 9/mês</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ Calendar ============
function CalendarScreen() {
  const items = window.MOCK.calendar;
  return (
    <div className="shell">
      <section className="section">
        <div className="kicker">📅 Agenda</div>
        <h1 className="hed1" style={{ marginTop: 8 }}>
          O que <span style={{ color: "var(--primary)" }}>mexe</span> o mercado nas próximas semanas.
        </h1>
        <p className="dek">Eventos econômicos que historicamente movimentam as ações que você acompanha.</p>
      </section>

      <section>
        <div className="card-flush">
          {items.map((it, i) => (
            <div key={i} style={{ padding: "20px 24px", borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none", display: "grid", gridTemplateColumns: "80px 100px 1fr auto", gap: 20, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, color: "var(--ink-2)" }}>{it.date}</div>
              <Chip tone={it.impact === "high" ? "sell" : "hold"}>{it.impact === "high" ? "ALTO IMPACTO" : "MÉDIO"}</Chip>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600 }}>{it.flag} {it.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>{it.note}</div>
              </div>
              <button className="btn btn-ghost btn-sm">+ Lembrete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ============ Auth modal ============
function AuthModal({ onClose, mode = "signin" }) {
  const [tab, setTab] = useStateS(mode);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="brand" style={{ marginBottom: 24 }}>
          <div className="brand-mark">M</div>
          <span className="brand-name">Momentum</span>
        </div>

        <h2 className="hed2" style={{ fontSize: 28 }}>
          {tab === "signin" ? "Bem-vindo de volta 👋" : "Cria sua conta grátis"}
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: 14, margin: "8px 0 24px" }}>
          {tab === "signin" ? "Continua de onde você parou." : "Em 30 segundos você tá dentro."}
        </p>

        <div className="stack-3">
          <input className="input" placeholder="seu@email.com" defaultValue="thiago@momentum.test" />
          <input className="input" type="password" placeholder="Senha (min. 6 caracteres)" />
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 16 }}>
          {tab === "signin" ? "Entrar →" : "Criar conta →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--ink-3)" }}>
          {tab === "signin" ? "Não tem conta ainda?" : "Já tem conta?"}{" "}
          <button className="btn btn-ghost btn-sm" style={{ padding: 0, color: "var(--primary)" }} onClick={() => setTab(tab === "signin" ? "signup" : "signin")}>
            {tab === "signin" ? "Cria uma" : "Entrar"}
          </button>
        </div>

        <hr className="div" />

        <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", textAlign: "center", lineHeight: 1.6 }}>
          Simulador educacional · Não é recomendação de investimento.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  HomeScreen, ScannerScreen, DetailScreen, LearnScreen,
  PortfolioScreen, CalendarScreen, AuthModal,
  TrackedScreen, CorrelationScreen, DARFScreen, SimulatorScreen, AdminScreen,
});

// ============ Tracked Picks ============
function TrackedScreen({ onOpen }) {
  const tracked = window.MOCK.stocks.filter(s => ["PETR4", "WEGE3"].includes(s.ticker));
  return (
    <div className="shell">
      <section className="section">
        <div className="kicker">⭐ Acompanhados</div>
        <h1 className="hed1" style={{ marginTop: 8 }}>
          Sua <span style={{ color: "var(--primary)" }}>watchlist</span>.
        </h1>
        <p className="dek">{tracked.length} ações que você marcou pra olhar de perto. Quando o sinal mudar, te aviso.</p>
      </section>

      {tracked.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 56 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 className="hed3">Nada por aqui ainda</h3>
          <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 8 }}>Use ⭐ Acompanhar em qualquer ação pra adicionar à sua watchlist.</p>
        </div>
      ) : (
        <div className="grid-2">
          {tracked.map(s => (
            <FeedCard key={s.ticker} stock={s} onOpen={onOpen} onTrack={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Correlation Matrix (Pro) ============
function CorrelationScreen({ isPro, onGoPro }) {
  // sample correlation matrix
  const tickers = ["PETR4", "VALE3", "ITUB4", "BBDC4", "MGLU3", "ABEV3"];
  // deterministic-ish values
  const corr = (a, b) => {
    if (a === b) return 1;
    const h = (a.charCodeAt(0) + b.charCodeAt(0) + a.length + b.length) % 100;
    return ((h - 50) / 50);
  };
  const colorFor = (c) => {
    if (c >= 0.99) return "var(--primary)";
    const intensity = Math.abs(c);
    if (c >= 0) return `color-mix(in srgb, var(--buy) ${20 + intensity * 70}%, var(--bg-3))`;
    return `color-mix(in srgb, var(--sell) ${20 + intensity * 70}%, var(--bg-3))`;
  };

  if (!isPro) {
    return (
      <div className="shell">
        <section className="section">
          <div className="kicker">🔗 Matriz de correlação</div>
          <h1 className="hed1" style={{ marginTop: 8 }}>
            Veja quais ações <span style={{ color: "var(--primary)" }}>andam juntas</span>.
          </h1>
        </section>
        <div className="pro-lock">
          <div className="star">⭐</div>
          <h2>Matriz de correlação é Pro</h2>
          <p>Diversificar é o segredo. Veja em uma tela só quais das suas ações se movem em sincronia (e quais te protegem quando uma cai).</p>
          <ul>
            <li>Heatmap visual de 6 ações ou mais</li>
            <li>Recálculo automático a cada varredura</li>
            <li>Inclui DARF, relatório fiscal e acesso à carteira ilimitada</li>
          </ul>
          <button className="btn btn-magenta btn-xl" onClick={onGoPro}>⭐ Virar Pro — R$ 9/mês</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <section className="section">
        <div className="kicker">🔗 Correlação</div>
        <h1 className="hed1" style={{ marginTop: 8 }}>Quais ações <span style={{ color: "var(--primary)" }}>andam juntas</span>.</h1>
        <p className="dek">+1 = se movem iguais · -1 = se movem opostos · 0 = independentes. Diversifique nas independentes.</p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <div className="row" style={{ marginBottom: 16 }}>
          <div className="corr-legend">
            <span>-1 (opostos)</span>
            <div className="scale"></div>
            <span>+1 (juntos)</span>
          </div>
        </div>

        <div className="card">
          <div className="corr-matrix" style={{ gridTemplateColumns: `60px repeat(${tickers.length}, 1fr)` }}>
            <div></div>
            {tickers.map(t => <div key={t} className="corr-cell head">{t}</div>)}
            {tickers.map(row => (
              <React.Fragment key={row}>
                <div className="corr-cell head" style={{ textAlign: "right", paddingRight: 8 }}>{row}</div>
                {tickers.map(col => {
                  const v = corr(row, col);
                  return (
                    <div key={col} className="corr-cell" style={{ background: colorFor(v) }}>
                      {v.toFixed(2).replace("-", "−")}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <div className="card-glow">
        <div className="kicker">💡 Insight</div>
        <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.55, margin: "8px 0 0", maxWidth: "60ch" }}>
          PETR4 e VALE3 têm correlação <strong style={{ color: "var(--buy)" }}>+0,72</strong> — sobem e descem juntas (commodities). Para diversificar, considere ITUB4 ou ABEV3, que têm correlação mais próxima de zero.
        </p>
      </div>
    </div>
  );
}

// ============ DARF / Tax report (Pro) ============
function DARFScreen({ isPro, onGoPro }) {
  if (!isPro) {
    return (
      <div className="shell">
        <section className="section">
          <div className="kicker">💰 Relatório DARF</div>
          <h1 className="hed1" style={{ marginTop: 8 }}>
            Imposto sem <span style={{ color: "var(--primary)" }}>nervosismo</span>.
          </h1>
        </section>
        <div className="pro-lock">
          <div className="star">📋</div>
          <h2>DARF mensal automático</h2>
          <p>Toda venda gera obrigação fiscal. O Momentum Pro calcula o IR a pagar, gera a DARF e exporta CSV pra você não passar nervoso em abril.</p>
          <ul>
            <li>Cálculo automático de ganhos realizados</li>
            <li>DARF mensal com código de barras</li>
            <li>Exportação em CSV, MD e PDF</li>
            <li>Inclui matriz de correlação e carteira ilimitada</li>
          </ul>
          <button className="btn btn-magenta btn-xl" onClick={onGoPro}>⭐ Virar Pro — R$ 9/mês</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <section className="section">
        <div className="kicker">💰 DARF · Maio 2026</div>
        <h1 className="hed1" style={{ marginTop: 8 }}>
          Você tem <span style={{ color: "var(--magenta)" }}>R$ 47,80</span> de imposto a pagar.
        </h1>
        <p className="dek">Cálculo baseado nas vendas realizadas em maio. Vencimento: último dia útil de junho.</p>
      </section>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="big-stat">
          <div className="lbl">Ganho realizado</div>
          <div className="val up">R$ 318,67</div>
          <div className="sub">2 operações</div>
        </div>
        <div className="big-stat">
          <div className="lbl">IR (15%)</div>
          <div className="val">R$ 47,80</div>
          <div className="sub">Alíquota swing trade</div>
        </div>
        <div className="big-stat">
          <div className="lbl">Líquido após IR</div>
          <div className="val up">R$ 270,87</div>
          <div className="sub">+8,5% no mês</div>
        </div>
      </div>

      <div className="card">
        <div className="spread" style={{ marginBottom: 14 }}>
          <h3 className="hed3">Operações tributáveis</h3>
          <div className="row">
            <button className="btn btn-sm">📥 CSV</button>
            <button className="btn btn-sm">📄 PDF</button>
            <button className="btn btn-primary btn-sm">Gerar DARF →</button>
          </div>
        </div>
        {[
          { ticker: "PETR4", entry: 32.50, exit: 38.42, qty: 50, gain: 296.00, date: "12/Mai" },
          { ticker: "WEGE3", entry: 41.20, exit: 41.65, qty: 30, gain: 13.50, date: "15/Mai" },
        ].map((op, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 80px 80px 100px 1fr auto", padding: "14px 0", borderBottom: i === 0 ? "1px solid var(--line)" : "none", alignItems: "center", gap: 16, fontFamily: "var(--font-mono)", fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>{op.ticker}</div>
            <div style={{ color: "var(--ink-3)" }}>{op.qty}x</div>
            <div>R$ {op.entry.toFixed(2)}</div>
            <div>→ R$ {op.exit.toFixed(2)}</div>
            <div style={{ color: "var(--ink-3)" }}>{op.date}</div>
            <div style={{ color: "var(--buy)", fontWeight: 600 }}>+R$ {op.gain.toFixed(2).replace(".", ",")}</div>
          </div>
        ))}
      </div>

      <div className="card-glow" style={{ marginTop: 20 }}>
        <div className="row" style={{ gap: 14, alignItems: "start" }}>
          <div style={{ fontSize: 24 }}>⚠️</div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
            <strong style={{ color: "var(--ink)" }}>Isenção:</strong> vendas de ações até R$ 20.000 no mês são isentas. Como você operou R$ 19.700, ainda está dentro do limite — mas o cálculo da DARF aqui é só pra você praticar antes da venda real.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ Simulator (admin/all) ============
function SimulatorScreen({ onOpen }) {
  const [amount, setAmount] = useStateS(500);
  const [ticker, setTicker] = useStateS("PETR4");
  const stock = window.MOCK.stocks.find(s => s.ticker === ticker) || window.MOCK.stocks[0];
  const qty = Math.floor(amount / stock.price);
  const tpGain = (stock.tp - stock.price) * qty;
  const slLoss = (stock.sl - stock.price) * qty;

  return (
    <div className="shell">
      <section className="section">
        <div className="kicker">🎮 Simulador</div>
        <h1 className="hed1" style={{ marginTop: 8 }}>
          E se eu tivesse <span style={{ color: "var(--primary)" }}>R$ {amount}</span>?
        </h1>
        <p className="dek">Veja na prática quanto você ganharia ou perderia em cada cenário. Sem arriscar nada.</p>
      </section>

      <div className="sim-stage">
        <div className="card">
          <div className="eyebrow">Escolha um valor</div>
          <div className="amount-picker" style={{ marginTop: 10 }}>
            {[100, 250, 500, 1000, 2500].map(v => (
              <button key={v} className="amount-pill" data-active={amount === v} onClick={() => setAmount(v)}>
                R$ {v.toLocaleString("pt-BR")}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 24 }} className="eyebrow">Em qual ação?</div>
          <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
            {window.MOCK.stocks.filter(s => s.region === "BR").slice(0, 6).map(s => (
              <button key={s.ticker} className="amount-pill" data-active={ticker === s.ticker} onClick={() => setTicker(s.ticker)}>
                {s.emoji} {s.ticker}
              </button>
            ))}
          </div>

          <hr className="div" />

          <div className="eyebrow">Cenários simulados</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="level level-tp">
              <span className="lbl">🎯 Se bater alvo (+15%)</span>
              <span className="num">+ R$ {tpGain.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="level level-now">
              <span className="lbl">📍 Compraria</span>
              <span className="num">{qty} ações</span>
            </div>
            <div className="level level-sl">
              <span className="lbl">🛑 Se stop (-7%)</span>
              <span className="num">{slLoss.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: "var(--bg-3)", borderRadius: 14 }}>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>
              Investindo <strong style={{ color: "var(--ink)" }}>R$ {amount}</strong> em <strong style={{ color: "var(--primary)" }}>{ticker}</strong> ao preço atual de <strong style={{ fontFamily: "var(--font-mono)" }}>{fmt(stock.price, stock.currency)}</strong>, você teria <strong>{qty} ações</strong>. Se o alvo de <strong style={{ color: "var(--buy)" }}>{fmt(stock.tp, stock.currency)}</strong> for atingido, lucro de <strong style={{ color: "var(--buy)" }}>+R$ {tpGain.toFixed(2).replace(".", ",")}</strong>. Se o stop em <strong style={{ color: "var(--sell)" }}>{fmt(stock.sl, stock.currency)}</strong> for atingido, perda de <strong style={{ color: "var(--sell)" }}>{slLoss.toFixed(2).replace(".", ",")}</strong>.
            </div>
          </div>
        </div>

        <aside className="card-glow" style={{ padding: 22 }}>
          <div className="kicker">💡 Dica</div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, margin: "8px 0", letterSpacing: "-0.015em" }}>
            Comece pequeno
          </h4>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
            Os primeiros trades servem pra você aprender, não pra ficar rico. Com R$ 100 já dá pra praticar os mesmos princípios que mover R$ 100.000.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={() => onOpen(stock)}>
            Ver análise de {ticker} →
          </button>
        </aside>
      </div>
    </div>
  );
}

// ============ Admin Panel ============
function AdminScreen() {
  const users = [
    { email: "thiago@momentum.test", tier: "admin", joined: "2026-01-12", trades: 47 },
    { email: "lucas.silva@gmail.com", tier: "pro", joined: "2026-03-04", trades: 23 },
    { email: "maria.duarte@hotmail.com", tier: "free", joined: "2026-04-22", trades: 8 },
    { email: "rafael.s@uol.com.br", tier: "free", joined: "2026-05-01", trades: 3 },
    { email: "ana.beatriz@gmail.com", tier: "pro", joined: "2026-02-18", trades: 89 },
  ];
  return (
    <div className="shell">
      <section className="section">
        <div className="kicker" style={{ color: "var(--hold)" }}>👑 Painel admin</div>
        <h1 className="hed1" style={{ marginTop: 8 }}>
          <span style={{ color: "var(--primary)" }}>{users.length} usuários</span> · 3 ativos hoje.
        </h1>
      </section>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="big-stat">
          <div className="lbl">Total usuários</div>
          <div className="val">128</div>
          <div className="sub">+12 esta semana</div>
        </div>
        <div className="big-stat">
          <div className="lbl">Conversão Pro</div>
          <div className="val">11%</div>
          <div className="sub">14 contas Pro</div>
        </div>
        <div className="big-stat">
          <div className="lbl">MRR</div>
          <div className="val">R$ 126</div>
          <div className="sub">14 × R$ 9</div>
        </div>
        <div className="big-stat">
          <div className="lbl">Trades simulados</div>
          <div className="val">2.842</div>
          <div className="sub">esta semana</div>
        </div>
      </div>

      <div className="card-flush">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 80px 100px", padding: "14px 20px", background: "var(--bg-2)", borderBottom: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>
          <div>Email</div><div>Plano</div><div>Entrou</div><div>Trades</div><div></div>
        </div>
        {users.map((u, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 80px 100px", padding: "14px 20px", borderBottom: i < users.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center", fontSize: 13 }}>
            <div style={{ fontFamily: "var(--font-mono)" }}>{u.email}</div>
            <Chip tone={u.tier === "admin" ? "magenta" : u.tier === "pro" ? "primary" : ""}>{u.tier}</Chip>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>{u.joined}</div>
            <div style={{ fontFamily: "var(--font-mono)" }}>{u.trades}</div>
            <button className="btn btn-ghost btn-sm">Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
