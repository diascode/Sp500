// Components for Momentum BR
const { useState, useEffect, useMemo, useRef } = React;

function fmt(n, currency = "R$") {
  if (Math.abs(n) >= 1000) return currency + " " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency + " " + n.toFixed(2).replace(".", ",");
}
function fmtPct(n, withSign = true) {
  const s = (n >= 0 && withSign ? "+" : "") + n.toFixed(1).replace(".", ",") + "%";
  return s;
}

// ============ Sparkline ============
function Sparkline({ data, color, height = 56, fill = true, strokeWidth = 1.6 }) {
  const w = 240;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * h]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const fillPath = `${d} L${w},${h} L0,${h} Z`;
  const c = color || "var(--primary)";
  return (
    <svg style={{ width: "100%", height: "100%", display: "block" }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={fillPath} fill={c} opacity="0.14" />}
      <path d={d} fill="none" stroke={c} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ============ Chip ============
function Chip({ children, tone, className = "" }) {
  const cls = tone === "buy" ? "chip-buy"
    : tone === "sell" ? "chip-sell"
    : tone === "hold" ? "chip-hold"
    : tone === "primary" ? "chip-primary"
    : tone === "magenta" ? "chip-magenta"
    : "";
  return (
    <span className={`chip ${cls} ${className}`}>
      {children}
    </span>
  );
}

// ============ Signal Pill ============
function SignalPill({ signal }) {
  if (signal === "buy") return <span className="sig sig-buy">↑ Compra</span>;
  if (signal === "sell") return <span className="sig sig-sell">↓ Venda</span>;
  return <span className="sig sig-hold">— Aguardar</span>;
}

// ============ App Bar (top) ============
function AppBar({ route, setRoute, onScan, lang, setLang, signedIn, tier, onSignIn, onSignOut }) {
  const navItems = [
    { id: "home", label: lang === "en" ? "Home" : "Início" },
    { id: "scan", label: "Scanner" },
    { id: "tracked", label: lang === "en" ? "Tracked" : "Acompanhados" },
    { id: "learn", label: lang === "en" ? "Learn" : "Aprender" },
    { id: "portfolio", label: lang === "en" ? "Portfolio" : "Carteira" },
  ];
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="appbar">
      <div className="shell appbar-row">
        <div className="brand" onClick={() => setRoute("home")} style={{ cursor: "pointer" }}>
          <div className="brand-mark">M</div>
          <span className="brand-name">Momentum</span>
        </div>

        <nav className="seg" style={{ display: "none" }} data-desktop-nav>
          {navItems.map((it) => (
            <button key={it.id} data-active={route === it.id} onClick={() => setRoute(it.id)}>
              {it.label}
            </button>
          ))}
        </nav>

        <div className="row">
          <div className="fx" style={{ display: "none" }} data-desktop-fx>
            <span>USD <b>R$ 5,05</b></span>
            <span>IBOV <b className="up">+0,4%</b></span>
            <span>SELIC <b>10,75%</b></span>
          </div>

          {/* Language toggle */}
          <div className="lang-toggle">
            <button data-active={lang === "pt"} onClick={() => setLang("pt")}>PT</button>
            <button data-active={lang === "en"} onClick={() => setLang("en")}>EN</button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onScan}>
            ⚡ {lang === "en" ? "Scan" : "Varrer"}
          </button>

          {!signedIn && (
            <button className="btn btn-sm" onClick={onSignIn}>
              {lang === "en" ? "Sign in" : "Entrar"}
            </button>
          )}

          {signedIn && (
            <div style={{ position: "relative" }}>
              <button className="user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="ua">T</span>
                <span className="ut" data-tier={tier}>
                  {tier === "admin" ? "👑 Admin" : tier === "pro" ? "⭐ Pro" : "Free"}
                </span>
              </button>
              {menuOpen && (
                <div className="user-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="um-head">
                    <div className="ua-lg">T</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>thiago@momentum.test</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                        {tier === "admin" ? "Admin · acesso total" : tier === "pro" ? "Conta Pro · R$ 9/mês" : "Conta grátis"}
                      </div>
                    </div>
                  </div>
                  <div className="um-divider"></div>
                  <button className="um-item">🔑 {lang === "en" ? "Change password" : "Alterar senha"}</button>
                  {tier !== "pro" && tier !== "admin" && (
                    <button className="um-item um-pro">⭐ {lang === "en" ? "Go Pro" : "Virar Pro"} — R$ 9/mês</button>
                  )}
                  {tier === "admin" && (
                    <button className="um-item">⚙️ {lang === "en" ? "Admin panel" : "Painel admin"}</button>
                  )}
                  <button className="um-item">📥 {lang === "en" ? "Export my data" : "Exportar meus dados"}</button>
                  <div className="um-divider"></div>
                  <button className="um-item um-danger">🚪 {lang === "en" ? "Sign out" : "Sair"}</button>
                  <button className="um-item um-danger">🗑️ {lang === "en" ? "Delete account" : "Excluir conta"}</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          [data-desktop-nav] { display: inline-flex !important; }
          [data-desktop-fx] { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

// ============ Cookie consent ============
function CookieBanner({ onAccept, lang }) {
  return (
    <div className="cookie-banner">
      <div className="shell" style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>🍪</span>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", maxWidth: "55ch" }}>
            {lang === "en"
              ? "We use cookies to keep you signed in and remember your preferences. By continuing you accept these technologies."
              : "Usamos cookies pra te manter conectado e lembrar suas preferências. Ao continuar, você aceita."}
            {" "}
            <a href="#" style={{ color: "var(--primary)" }}>{lang === "en" ? "Learn more" : "Saiba mais"}</a>
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onAccept}>
          {lang === "en" ? "Accept & continue" : "Aceitar e continuar"}
        </button>
      </div>
    </div>
  );
}

// ============ Stock Cards ============

// Feed card (default) — single-column, friendly
function FeedCard({ stock, onTrack, onOpen }) {
  const tone = stock.signal === "buy" ? "buy" : stock.signal === "sell" ? "sell" : "hold";
  const color = `var(--${tone})`;

  return (
    <article className="feed-card" onClick={() => onOpen(stock)}>
      <div className="top">
        <div className="top-left">
          <div className="logo">{stock.emoji}</div>
          <div className="id">
            <div className="tk">
              <span>{stock.ticker}</span>
              <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 400 }}>· {stock.flag}</span>
            </div>
            <div className="nm">{stock.name} · {stock.sector}</div>
          </div>
        </div>
        <SignalPill signal={stock.signal} />
      </div>

      <div className="price-block">
        <span className="price">{fmt(stock.price, stock.currency)}</span>
        <span className={`ch ${stock.change1d >= 0 ? "up" : "dn"}`}>
          {fmtPct(stock.change1d)} hoje
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          · {fmtPct(stock.change1y)} ano
        </span>
      </div>

      <div className="spark-h">
        <Sparkline data={stock.series} color={color} strokeWidth={1.6} />
      </div>

      <p className="why"><strong style={{ color: "var(--ink)" }}>Por quê:</strong> {stock.why}</p>

      <div className="indicators">
        <Chip>RSI {stock.rsi.toFixed(0)}</Chip>
        <Chip>MACD {stock.macd >= 0 ? "+" : ""}{stock.macd.toFixed(2).replace(".", ",")}</Chip>
        <Chip>{stock.pattern}</Chip>
      </div>

      <div className="actions">
        <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); onTrack(stock); }}>
          ⭐ Acompanhar
        </button>
        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(stock); }}>
          Ver gráfico →
        </button>
      </div>
    </article>
  );
}

// Compact row card
function RowCard({ stock, onOpen }) {
  const tone = stock.signal === "buy" ? "buy" : stock.signal === "sell" ? "sell" : "hold";
  const color = `var(--${tone})`;
  return (
    <div className="row-card" onClick={() => onOpen(stock)}>
      <div className="logo">{stock.emoji}</div>
      <div className="id">
        <div className="tk">{stock.ticker} <span style={{ marginLeft: 4, fontSize: 11 }}>{stock.flag}</span></div>
        <div className="nm">{stock.name}</div>
      </div>
      <div className="spark-h">
        <Sparkline data={stock.series} color={color} fill={false} strokeWidth={1.4} />
      </div>
      <div className="pr">
        <div className="num">{fmt(stock.price, stock.currency)}</div>
        <div className={`ch ${stock.change1d >= 0 ? "up" : "dn"}`}>
          {fmtPct(stock.change1d)}
        </div>
      </div>
    </div>
  );
}

// Story card (editorial, hero)
function StoryCard({ stock, onOpen, onTrack }) {
  const tone = stock.signal === "buy" ? "buy" : stock.signal === "sell" ? "sell" : "hold";
  const color = `var(--${tone})`;
  return (
    <article className="story-card" onClick={() => onOpen(stock)}>
      <div>
        <div className="row" style={{ marginBottom: 10 }}>
          <div className="feed-card" style={{ padding: 0, background: "none", border: "none", flexDirection: "row", gap: 12, alignItems: "center", cursor: "default" }}>
            <div className="logo" style={{ width: 56, height: 56, fontSize: 26 }}>{stock.emoji}</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em" }}>
                {stock.ticker} <span style={{ fontSize: 14, color: "var(--ink-3)", fontWeight: 400 }}>· {stock.name}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>{stock.flag} {stock.sector}</div>
            </div>
          </div>
        </div>

        <div className="row" style={{ alignItems: "baseline", gap: 10, marginTop: 14 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em" }}>
            {fmt(stock.price, stock.currency)}
          </span>
          <span className={stock.change1d >= 0 ? "up" : "dn"} style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: stock.change1d >= 0 ? "var(--buy)" : "var(--sell)" }}>
            {fmtPct(stock.change1d)} hoje
          </span>
        </div>

        <p style={{ fontSize: 16, color: "var(--ink-2)", lineHeight: 1.55, marginTop: 14, marginBottom: 0 }}>
          {stock.why}
        </p>

        <div className="row" style={{ marginTop: 18 }}>
          <SignalPill signal={stock.signal} />
          <Chip>RSI {stock.rsi.toFixed(0)}</Chip>
          <Chip>{stock.pattern}</Chip>
        </div>

        <div className="row" style={{ marginTop: 22, gap: 10 }}>
          <button className="btn btn-primary btn-lg" onClick={(e) => { e.stopPropagation(); onOpen(stock); }}>
            Abrir análise →
          </button>
          <button className="btn btn-lg" onClick={(e) => { e.stopPropagation(); onTrack(stock); }}>
            ⭐ Acompanhar
          </button>
        </div>
      </div>

      <div className="spark-h">
        <Sparkline data={stock.series} color={color} strokeWidth={2} />
      </div>
    </article>
  );
}

// ============ Big chart (illustrative) ============
function BigChart({ stock }) {
  const w = 800;
  const h = 320;
  const data = stock.series;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);

  function ma(d, n) {
    const out = [];
    for (let i = 0; i < d.length; i++) {
      const s = Math.max(0, i - n + 1);
      let sum = 0;
      for (let j = s; j <= i; j++) sum += d[j];
      out.push(sum / (i - s + 1));
    }
    return out;
  }
  const ma20 = ma(data, 20);
  const ma50 = ma(data, 50);
  const maToPath = (m) =>
    m.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return (i === 0 ? "M" : "L") + x + "," + y;
    }).join(" ");

  function bb(d, n, k) {
    const upper = [], lower = [];
    for (let i = 0; i < d.length; i++) {
      const s = Math.max(0, i - n + 1);
      const slice = d.slice(s, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length);
      upper.push(mean + k * std);
      lower.push(mean - k * std);
    }
    return { upper, lower };
  }
  const { upper, lower } = bb(data, 20, 2);
  const bbBand = (() => {
    const up = upper.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return (i === 0 ? "M" : "L") + x + "," + y;
    }).join(" ");
    const dn = lower.slice().reverse().map((v, i) => {
      const idx = lower.length - 1 - i;
      const x = idx * step;
      const y = h - ((v - min) / range) * h;
      return "L" + x + "," + y;
    }).join(" ");
    return up + " " + dn + " Z";
  })();

  const candleW = step * 0.55;
  const candles = [];
  for (let i = 1; i < data.length; i++) {
    const open = data[i - 1];
    const close = data[i];
    const hi = Math.max(open, close) + Math.abs(open - close) * 0.3;
    const lo = Math.min(open, close) - Math.abs(open - close) * 0.3;
    const x = i * step - candleW / 2;
    const yOpen = h - ((open - min) / range) * h;
    const yClose = h - ((close - min) / range) * h;
    const yHi = h - ((hi - min) / range) * h;
    const yLo = h - ((lo - min) / range) * h;
    const up = close >= open;
    candles.push({ x, yOpen, yClose, yHi, yLo, up });
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "300px", display: "block" }}>
      <defs>
        <pattern id="grid2" width="80" height="40" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 40" fill="none" stroke="var(--line)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill="url(#grid2)" />
      <path d={bbBand} fill="var(--primary)" opacity="0.06" />
      <path d={maToPath(ma50)} stroke="var(--magenta)" strokeDasharray="4 4" strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d={maToPath(ma20)} stroke="var(--primary)" strokeWidth="1.2" fill="none" opacity="0.85" />
      {candles.map((c, i) => (
        <g key={i}>
          <line x1={c.x + candleW / 2} x2={c.x + candleW / 2} y1={c.yHi} y2={c.yLo} stroke={c.up ? "var(--buy)" : "var(--sell)"} strokeWidth="1" />
          <rect x={c.x} y={Math.min(c.yOpen, c.yClose)} width={candleW} height={Math.max(1, Math.abs(c.yClose - c.yOpen))} fill={c.up ? "var(--buy)" : "var(--sell)"} />
        </g>
      ))}
      <line x1="0" x2={w} y1={h - ((stock.tp - min) / range) * h} y2={h - ((stock.tp - min) / range) * h} stroke="var(--buy)" strokeDasharray="3 5" strokeWidth="1" opacity="0.6" />
      <line x1="0" x2={w} y1={h - ((stock.sl - min) / range) * h} y2={h - ((stock.sl - min) / range) * h} stroke="var(--sell)" strokeDasharray="3 5" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

// ============ Scan ring (animated) ============
function ScanRing({ progress }) {
  const r = 60;
  const c = 2 * Math.PI * r;
  const off = c * (1 - progress / 100);
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--line)" strokeWidth="3" />
      <circle
        cx="80" cy="80" r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 80 80)"
        style={{ transition: "stroke-dashoffset 200ms" }}
      />
      <text x="80" y="78" textAnchor="middle" fill="var(--ink)" style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700 }}>{progress}%</text>
      <text x="80" y="98" textAnchor="middle" fill="var(--ink-4)" style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1 }}>VARRENDO</text>
    </svg>
  );
}

Object.assign(window, {
  Sparkline, Chip, SignalPill, AppBar, FeedCard, RowCard, StoryCard, BigChart, ScanRing, CookieBanner,
  fmt, fmtPct,
});
