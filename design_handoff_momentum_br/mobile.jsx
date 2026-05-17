// Mobile screens for Momentum BR — mobile-first

function MobileFrame({ children, screen, setScreen }) {
  return (
    <div className="phone-mock">
      <div className="phone-status">
        <span>9:41</span>
        <span>●●● 100%</span>
      </div>
      <div className="phone-body">{children}</div>
      <div className="bn">
        {[
          { id: "home", l: "Início", ic: "🏠" },
          { id: "scan", l: "Scanner", ic: "⚡" },
          { id: "learn", l: "Aulas", ic: "🎓" },
          { id: "portfolio", l: "Carteira", ic: "💼" },
          { id: "me", l: "Perfil", ic: "👤" },
        ].map((t) => (
          <button key={t.id} data-active={screen === t.id} onClick={() => setScreen && setScreen(t.id)}>
            <span className="ic">{t.ic}</span>
            {t.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function MobileHome() {
  const buys = window.MOCK.stocks.filter(s => s.region === "BR" && s.signal === "buy");
  const hero = buys[0];

  return (
    <div>
      {/* Greeting */}
      <div className="hero-greeting" style={{ marginBottom: 16 }}>
        <div className="hero-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>T</div>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>17 Mai</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600 }}>Oi Thiago 👋</div>
        </div>
      </div>

      <h1 className="display" style={{ fontSize: 26, lineHeight: 1.1, marginBottom: 8, letterSpacing: "-0.025em" }}>
        Hoje tem <span style={{ color: "var(--primary)" }}>{buys.length} oportunidades</span>.
      </h1>
      <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 20px" }}>Sua carteira tá +12,4% no mês 🎉</p>

      {/* Balance card */}
      <div className="bal-card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="lbl">Sua carteira (simulada)</div>
        <div className="val" style={{ fontSize: 32 }}>R$ 8.420,18</div>
        <div className="change">+R$ 928,50 · +12,4% no mês</div>
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 14 }}>⚡ Varrer mercado</button>
      </div>

      {/* Hero pick */}
      {hero && (
        <div style={{ marginBottom: 20 }}>
          <div className="kicker" style={{ fontSize: 11, marginBottom: 8 }}>★ Destaque</div>
          <div className="feed-card" style={{ padding: 16, gap: 12 }}>
            <div className="top">
              <div className="top-left">
                <div className="logo" style={{ width: 38, height: 38, fontSize: 16 }}>{hero.emoji}</div>
                <div className="id">
                  <div className="tk" style={{ fontSize: 15 }}>{hero.ticker} <span style={{ fontSize: 10 }}>{hero.flag}</span></div>
                  <div className="nm" style={{ fontSize: 11 }}>{hero.name}</div>
                </div>
              </div>
              <SignalPill signal={hero.signal} />
            </div>
            <div className="price-block">
              <span className="price" style={{ fontSize: 22 }}>{fmt(hero.price, hero.currency)}</span>
              <span className="ch up">{fmtPct(hero.change1d)}</span>
            </div>
            <div className="spark-h" style={{ height: 44 }}>
              <Sparkline data={hero.series} color="var(--buy)" strokeWidth={1.5} />
            </div>
            <p className="why" style={{ fontSize: 12 }}>{hero.why}</p>
            <button className="btn btn-primary btn-sm" style={{ width: "100%" }}>Ver gráfico →</button>
          </div>
        </div>
      )}

      {/* Quick rows */}
      <div className="spread" style={{ marginBottom: 10 }}>
        <h3 className="hed3" style={{ fontSize: 16 }}>Outras boas</h3>
        <span className="eyebrow" style={{ fontSize: 10 }}>+ {buys.length - 1}</span>
      </div>
      <div className="stack-2">
        {buys.slice(1, 4).map((s) => (
          <div key={s.ticker} className="row-card" style={{ padding: "10px 12px", gridTemplateColumns: "32px 1fr 80px" }}>
            <div className="logo" style={{ width: 32, height: 32, fontSize: 14 }}>{s.emoji}</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{s.ticker}</div>
              <div style={{ fontSize: 10, color: "var(--ink-4)" }}>{s.sector}</div>
            </div>
            <div className="pr">
              <div className="num" style={{ fontSize: 13 }}>{fmt(s.price, s.currency)}</div>
              <div className="ch up" style={{ fontSize: 10 }}>{fmtPct(s.change1d)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Learn tip */}
      <div className="lesson-card" style={{ padding: 14, marginTop: 20 }}>
        <div className="ic" style={{ width: 36, height: 36, fontSize: 18, marginBottom: 10 }}>📊</div>
        <h4 style={{ fontSize: 14 }}>O que é RSI?</h4>
        <p style={{ fontSize: 11.5, lineHeight: 1.5 }}>Aula de 3 min sobre o medidor de força que você vê em todas as ações.</p>
      </div>
    </div>
  );
}

function MobileScan() {
  const buys = window.MOCK.stocks.filter(s => s.region === "BR" && s.signal === "buy");
  return (
    <div>
      <div className="kicker" style={{ fontSize: 11, marginBottom: 8 }}>⚡ Scanner</div>
      <h1 className="display" style={{ fontSize: 24, lineHeight: 1.1, marginBottom: 14, letterSpacing: "-0.025em" }}>
        <span style={{ color: "var(--buy)" }}>{buys.length} ações</span><br />
        com sinal de compra.
      </h1>

      {/* Region pills */}
      <div className="seg" style={{ marginBottom: 14, padding: 3 }}>
        {[
          { id: "br", l: "🇧🇷 BR", count: 40 },
          { id: "us", l: "🇺🇸 US", count: 51 },
          { id: "eu", l: "🇪🇺 EU", count: 29 },
          { id: "em", l: "🌍 EM", count: 44 },
        ].map((r, i) => (
          <button key={r.id} data-active={i === 0} style={{ fontSize: 11, padding: "6px 11px" }}>
            {r.l}
            <span className="badge" style={{ fontSize: 9, padding: "1px 5px" }}>{r.count}</span>
          </button>
        ))}
      </div>

      <button className="btn btn-primary btn-lg" style={{ width: "100%", marginBottom: 18 }}>
        ⚡ Varrer agora
      </button>

      {/* Filter chips */}
      <div className="row" style={{ marginBottom: 14, flexWrap: "wrap" }}>
        <Chip tone="buy">Compra · 5</Chip>
        <Chip tone="hold">Aguardar · 3</Chip>
        <Chip tone="sell">Venda · 2</Chip>
      </div>

      {/* Feed */}
      <div className="stack-3">
        {buys.slice(0, 4).map((s) => (
          <div key={s.ticker} className="feed-card" style={{ padding: 14, gap: 10 }}>
            <div className="top">
              <div className="top-left">
                <div className="logo" style={{ width: 34, height: 34, fontSize: 14, borderRadius: 10 }}>{s.emoji}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{s.ticker}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-4)" }}>{s.sector}</div>
                </div>
              </div>
              <SignalPill signal={s.signal} />
            </div>
            <div className="price-block">
              <span className="price" style={{ fontSize: 18 }}>{fmt(s.price, s.currency)}</span>
              <span className="ch up" style={{ fontSize: 11 }}>{fmtPct(s.change1d)}</span>
            </div>
            <div className="spark-h" style={{ height: 36 }}>
              <Sparkline data={s.series} color="var(--buy)" strokeWidth={1.4} />
            </div>
            <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
              <Chip>RSI {s.rsi.toFixed(0)}</Chip>
              <Chip>{s.pattern}</Chip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileDetail() {
  const s = window.MOCK.stocks[0]; // PETR4
  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ padding: "4px 0", marginBottom: 10 }}>← Voltar</button>

      <div className="row" style={{ marginBottom: 6 }}>
        <div className="logo" style={{ width: 40, height: 40, fontSize: 18, borderRadius: 12, background: "var(--bg-3)", display: "grid", placeItems: "center" }}>{s.emoji}</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.ticker} <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{s.flag}</span></div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{s.name}</div>
        </div>
      </div>

      <div className="row" style={{ alignItems: "baseline", marginTop: 12, marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>{fmt(s.price, s.currency)}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--buy)" }}>{fmtPct(s.change1d)} hoje</span>
      </div>

      <SignalPill signal={s.signal} />

      <div className="card-glow" style={{ marginTop: 14, padding: 14 }}>
        <div className="kicker" style={{ fontSize: 10 }}>🤔 Por quê?</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, margin: "6px 0 0" }}>{s.why}</p>
      </div>

      {/* Mini chart */}
      <div className="chart-frame" style={{ padding: 14, marginTop: 14 }}>
        <div className="range-pills" style={{ marginBottom: 10, width: "100%", display: "flex" }}>
          {["1D", "1S", "1M", "3M", "1A"].map((r, i) => (
            <button key={r} className="range-pill" data-active={i === 3} style={{ flex: 1, fontSize: 10, padding: "4px 6px" }}>{r}</button>
          ))}
        </div>
        <div style={{ height: 180 }}>
          <BigChart stock={s} />
        </div>
      </div>

      {/* Levels */}
      <div className="stack-2" style={{ marginTop: 12 }}>
        <div className="level level-tp" style={{ padding: "10px 14px", flexDirection: "row", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12 }}>🎯 Lucro alvo (+15%)</span>
          <span className="num" style={{ fontSize: 14 }}>{fmt(s.tp, s.currency)}</span>
        </div>
        <div className="level level-sl" style={{ padding: "10px 14px", flexDirection: "row", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12 }}>🛑 Stop (-7%)</span>
          <span className="num" style={{ fontSize: 14 }}>{fmt(s.sl, s.currency)}</span>
        </div>
      </div>

      {/* Indicators */}
      <div className="metrics" style={{ marginTop: 14, gridTemplateColumns: "1fr 1fr" }}>
        <div className="metric" style={{ padding: 12 }}>
          <div className="lbl">RSI 14</div>
          <div className="val" style={{ fontSize: 18 }}>{s.rsi.toFixed(0)}</div>
        </div>
        <div className="metric" style={{ padding: 12 }}>
          <div className="lbl">MACD</div>
          <div className="val up" style={{ fontSize: 18 }}>+{s.macd.toFixed(2).replace(".", ",")}</div>
        </div>
      </div>

      <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 16 }}>
        💰 Adicionar à carteira
      </button>
    </div>
  );
}

function MobileLearn() {
  const lessons = window.MOCK.lessons;
  return (
    <div>
      <div className="kicker" style={{ fontSize: 11, marginBottom: 8 }}>🎓 Aulas</div>
      <h1 className="display" style={{ fontSize: 24, lineHeight: 1.1, marginBottom: 14, letterSpacing: "-0.025em" }}>
        Trade não é sorte.<br />
        É <span style={{ color: "var(--primary)" }}>leitura</span>.
      </h1>

      {/* Hero card */}
      <div className="onboard-hero" style={{ padding: 20, marginBottom: 18 }}>
        <h1 style={{ fontSize: 22 }}>Comece com R$ 100 simulados.</h1>
        <p style={{ fontSize: 13, marginTop: 8 }}>Aprenda primeiro. Arrisque depois.</p>
        <button className="btn" style={{ background: "var(--bg)", color: "var(--ink)", borderColor: "transparent", marginTop: 14, fontSize: 13 }}>Tour guiado →</button>
      </div>

      <div className="stack-3">
        {lessons.slice(0, 5).map((l, i) => (
          <div key={i} className="lesson-card" style={{ padding: 14 }}>
            <div className="ic" style={{ width: 36, height: 36, fontSize: 18, marginBottom: 10 }}>{l.emoji}</div>
            <h4 style={{ fontSize: 14 }}>{l.title}</h4>
            <p style={{ fontSize: 12, marginTop: 4 }}>{l.body}</p>
            <div className="meta" style={{ fontSize: 10, marginTop: 10 }}>
              <span>Aula {i + 1} · {l.read}</span>
              <Chip tone={l.level === "iniciante" ? "primary" : "magenta"}>{l.level}</Chip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobilePortfolio() {
  const positions = window.MOCK.portfolio;
  const totalValue = positions.reduce((s, p) => s + p.qty * p.current, 0);
  const totalCost = positions.reduce((s, p) => s + p.qty * p.entry, 0);
  const totalPl = totalValue - totalCost;
  const totalPlPct = (totalPl / totalCost) * 100;

  return (
    <div>
      <div className="kicker" style={{ fontSize: 11, marginBottom: 8 }}>💼 Carteira</div>
      <h1 className="display" style={{ fontSize: 24, lineHeight: 1.1, marginBottom: 14, letterSpacing: "-0.025em" }}>
        Tá <span style={{ color: "var(--buy)" }}>+{totalPlPct.toFixed(1).replace(".", ",")}%</span><br />
        em {positions.length} posições.
      </h1>

      <div className="bal-card" style={{ padding: 20, marginBottom: 18 }}>
        <div className="lbl">Valor total</div>
        <div className="val" style={{ fontSize: 32 }}>{fmt(totalValue, "R$")}</div>
        <div className="change">+{fmt(totalPl, "R$").replace("R$ ", "R$ ")} unrealizad</div>
      </div>

      <div className="stack-2">
        {positions.map((p) => {
          const pct = ((p.current - p.entry) / p.entry) * 100;
          return (
            <div key={p.ticker} style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 12, alignItems: "center", padding: "12px 14px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12 }}>
              <div className="logo" style={{ width: 36, height: 36, fontSize: 16, borderRadius: 10, background: "var(--bg-3)", display: "grid", placeItems: "center" }}>{p.emoji}</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{p.ticker}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>{p.qty} ações</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600 }}>{fmt(p.current, p.currency)}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: pct >= 0 ? "var(--buy)" : "var(--sell)" }}>{pct >= 0 ? "+" : ""}{pct.toFixed(1).replace(".", ",")}%</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-glow" style={{ padding: 16, marginTop: 18 }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>💰</div>
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Relatório DARF</h4>
        <p style={{ fontSize: 11.5, color: "var(--ink-3)", margin: 0 }}>Calcula seu IR e exporta tudo.</p>
        <button className="btn btn-magenta btn-sm" style={{ marginTop: 10, fontSize: 11 }}>Pro · R$ 9/mês</button>
      </div>
    </div>
  );
}

function MobileOnboarding() {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "20px 4px" }}>
      <div className="brand" style={{ marginBottom: 24 }}>
        <div className="brand-mark">M</div>
        <span className="brand-name" style={{ fontSize: 17 }}>Momentum</span>
      </div>

      <div style={{ fontSize: 56, marginBottom: 14 }}>👋</div>
      <h1 className="display" style={{ fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.025em", margin: "0 0 14px" }}>
        Bora aprender a investir <span style={{ color: "var(--primary)" }}>de verdade</span>?
      </h1>
      <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 28px", lineHeight: 1.55 }}>
        O Momentum é um simulador. Você opera com dinheiro de mentira primeiro — depois decide se quer arriscar o seu de verdade.
      </p>

      <div className="stack-3">
        <div className="row-nowrap" style={{ background: "var(--bg-2)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 22 }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Sinais ao vivo</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>164 ações varridas a cada minuto</div>
          </div>
        </div>
        <div className="row-nowrap" style={{ background: "var(--bg-2)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 22 }}>🎓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Aulas curtas</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Em português, sem enrolar</div>
          </div>
        </div>
        <div className="row-nowrap" style={{ background: "var(--bg-2)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 22 }}>💸</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Grátis pra sempre</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Pro opcional · R$ 9/mês</div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 24, fontSize: 14 }}>
        Criar conta grátis →
      </button>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>Já tenho conta</button>
    </div>
  );
}

Object.assign(window, {
  MobileFrame, MobileHome, MobileScan, MobileDetail, MobileLearn, MobilePortfolio, MobileOnboarding,
});
