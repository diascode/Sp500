// Main App — mobile-first BR

const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "brasil",
  "leadWithMobile": true,
  "tier": "free",
  "lang": "pt"
}/*EDITMODE-END*/;

const THEME_PALETTES = {
  brasil: ["#39d98a", "#0c0e10", "#14181c"],
  day:    ["#1f8d52", "#f4f5f7", "#ffffff"],
  pop:    ["#ec4899", "#0a0a0f", "#14141d"],
  calmo:  ["#3b82f6", "#0d1219", "#161d27"],
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateA("home");
  const [detailStock, setDetailStock] = useStateA(null);
  const [authOpen, setAuthOpen] = useStateA(false);
  const [cookieAccepted, setCookieAccepted] = useStateA(false);
  const [scanState, setScanState] = useStateA("done");
  const [scanProgress, setScanProgress] = useStateA(0);
  const [signedIn, setSignedIn] = useStateA(true);

  useEffectA(() => {
    document.documentElement.setAttribute("data-theme", t.theme || "brasil");
  }, [t.theme]);

  useEffectA(() => {
    if (scanState !== "scanning") return;
    setScanProgress(0);
    const id = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setScanState("done");
          return 100;
        }
        return p + 5;
      });
    }, 110);
    return () => clearInterval(id);
  }, [scanState]);

  const handleScan = () => setScanState("scanning");
  const handleOpen = (s) => { setDetailStock(s); setRoute("detail"); };
  const handleBack = () => { setDetailStock(null); setRoute("scan"); };

  const isPro = t.tier === "pro" || t.tier === "admin";

  return (
    <div className="app">
      <AppBar
        route={route}
        setRoute={(r) => { setRoute(r); setDetailStock(null); }}
        onScan={handleScan}
        lang={t.lang}
        setLang={(v) => setTweak('lang', v)}
        signedIn={signedIn}
        tier={t.tier}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={() => setSignedIn(false)}
      />

      {/* Mobile gallery */}
      {t.leadWithMobile && (
        <section style={{ background: "var(--bg)", paddingTop: 56, paddingBottom: 24 }}>
          <div className="shell">
            <div className="kicker">📱 Mobile-first</div>
            <h1 className="hed1" style={{ marginTop: 8 }}>
              Momentum vive no <span style={{ color: "var(--primary)" }}>seu bolso</span>.
            </h1>
            <p className="dek">Aprendizado de trade onde você passa o dia — no celular. Toque em qualquer tela pra navegar.</p>
          </div>

          <div style={{ overflowX: "auto", paddingBottom: 32, marginTop: 36 }} className="hide-scroll">
            <div style={{ display: "flex", gap: 28, padding: "0 32px", minWidth: "min-content" }}>
              {[
                { id: "onboard", l: "Onboarding", screen: <MobileOnboarding /> },
                { id: "home", l: "Início", screen: <MobileHome /> },
                { id: "scan", l: "Scanner", screen: <MobileScan /> },
                { id: "detail", l: "Análise PETR4", screen: <MobileDetail /> },
                { id: "learn", l: "Aulas", screen: <MobileLearn /> },
                { id: "portfolio", l: "Carteira", screen: <MobilePortfolio /> },
              ].map((p) => (
                <div key={p.id} style={{ flexShrink: 0 }}>
                  <div className="eyebrow" style={{ textAlign: "center", marginBottom: 14 }}>{p.l}</div>
                  <MobileFrame screen={p.id} setScreen={() => {}}>
                    {p.screen}
                  </MobileFrame>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section divider */}
      <div style={{ borderTop: "1px solid var(--line)", padding: "56px 0 24px" }}>
        <div className="shell">
          <div className="kicker">💻 Desktop</div>
          <h2 className="hed1" style={{ marginTop: 8, fontSize: 44 }}>
            Também na <span style={{ color: "var(--primary)" }}>tela grande</span>.
          </h2>
          <p className="dek">A mesma experiência otimizada pra notebook. Use as abas no topo pra navegar — Pro, Admin e demais recursos pelos Tweaks.</p>
        </div>
      </div>

      {/* Desktop content */}
      <div style={{ background: "var(--bg)" }}>
        {route === "home" && <HomeScreen onOpen={handleOpen} setRoute={setRoute} />}
        {route === "scan" && <ScannerScreen onOpen={handleOpen} onScan={handleScan} scanState={scanState} scanProgress={scanProgress} />}
        {route === "detail" && detailStock && <DetailScreen stock={detailStock} onBack={handleBack} />}
        {route === "tracked" && <TrackedScreen onOpen={handleOpen} />}
        {route === "learn" && <LearnScreen />}
        {route === "portfolio" && <PortfolioScreen />}
        {route === "calendar" && <CalendarScreen />}
        {route === "correlation" && <CorrelationScreen isPro={isPro} onGoPro={() => setTweak('tier', 'pro')} />}
        {route === "darf" && <DARFScreen isPro={isPro} onGoPro={() => setTweak('tier', 'pro')} />}
        {route === "simulator" && <SimulatorScreen onOpen={handleOpen} />}
        {route === "admin" && <AdminScreen />}
      </div>

      {/* Extra-route picker (since they're not in main nav) */}
      <section className="section" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="shell">
          <div className="kicker">⭐ Recursos Pro · Admin</div>
          <h2 className="hed2" style={{ marginTop: 8 }}>Mais telas pra explorar</h2>
          <div className="grid-4" style={{ marginTop: 24 }}>
            {[
              { id: "tracked", e: "⭐", t: "Acompanhados", d: "Sua watchlist" },
              { id: "correlation", e: "🔗", t: "Correlação", d: "Pro · matriz visual" },
              { id: "darf", e: "💰", t: "DARF / IR", d: "Pro · imposto automático" },
              { id: "simulator", e: "🎮", t: "Simulador", d: "E se eu tivesse R$ 500?" },
              { id: "calendar", e: "📅", t: "Agenda", d: "Eventos macro" },
              { id: "admin", e: "👑", t: "Painel admin", d: "Só pra admins" },
            ].map(it => (
              <button key={it.id} className="lesson-card" onClick={() => setRoute(it.id)} style={{ textAlign: "left", border: "1px solid var(--line)", cursor: "pointer", background: "var(--bg-2)" }}>
                <div className="ic">{it.e}</div>
                <h4>{it.t}</h4>
                <p>{it.d}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile sticky nav */}
      <MobileMainNav route={route} setRoute={setRoute} />

      {/* Cookie banner */}
      {!cookieAccepted && <CookieBanner onAccept={() => setCookieAccepted(true)} lang={t.lang} />}

      {/* Auth modal */}
      {authOpen && <AuthModal mode="signin" onClose={() => setAuthOpen(false)} />}

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema">
          <TweakColor
            label="Paleta"
            value={THEME_PALETTES[t.theme] || THEME_PALETTES.brasil}
            options={Object.values(THEME_PALETTES)}
            onChange={(palette) => {
              const name = Object.keys(THEME_PALETTES).find(k =>
                JSON.stringify(THEME_PALETTES[k]) === JSON.stringify(palette)
              ) || "brasil";
              setTweak('theme', name);
            }}
          />
        </TweakSection>
        <TweakSection label="Conta de demo">
          <TweakRadio
            label="Plano do usuário"
            value={t.tier}
            options={["free", "pro", "admin"]}
            onChange={(v) => setTweak('tier', v)}
          />
        </TweakSection>
        <TweakSection label="Idioma">
          <TweakRadio
            label="Língua"
            value={t.lang}
            options={["pt", "en"]}
            onChange={(v) => setTweak('lang', v)}
          />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakToggle
            label="Mobile primeiro"
            value={t.leadWithMobile}
            onChange={(v) => setTweak('leadWithMobile', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function MobileMainNav({ route, setRoute }) {
  return (
    <>
      <style>{`
        .mobile-main-nav { display: none; }
        @media (max-width: 720px) {
          .mobile-main-nav { display: flex; }
          body { padding-bottom: 70px; }
        }
      `}</style>
      <div className="bn mobile-main-nav" style={{ position: "fixed", zIndex: 50 }}>
        {[
          { id: "home", l: "Início", ic: "🏠" },
          { id: "scan", l: "Scanner", ic: "⚡" },
          { id: "tracked", l: "Watch", ic: "⭐" },
          { id: "learn", l: "Aulas", ic: "🎓" },
          { id: "portfolio", l: "Carteira", ic: "💼" },
        ].map(it => (
          <button key={it.id} data-active={route === it.id} onClick={() => setRoute(it.id)}>
            <span className="ic">{it.ic}</span>
            {it.l}
          </button>
        ))}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
