# MOMENTUM — User Stories (Pending)

*Version 2.6 — May 2026*
*Completed stories → USER_STORIES_COMPLETED.md*

---

## 🔄 Sprint 18 — Current (In Progress)

**Epics:** 38, 40 · **Stories:** US-173, US-174, US-175, US-177, US-191, US-192

## Epic 38 — Sprint 18: Lista Interatividade (Acompanhar + Carteira)

### US-173 — Corrigir Botão Acompanhar na Lista (Bug: função inexistente)
**As a** usuário na view Lista,
**I want** que o botão ⭐/✓ de cada linha funcione corretamente para adicionar ou remover a ação dos Acompanhados,
**so that** posso montar minha watchlist diretamente da Lista sem abrir o detalhe da ação.

**Root Cause:**
A função `listaTrack()` chama `trackPickFromBtn()` (linha ~1471 do stock-dashboard.html), que **não existe**. A função correta é `trackPick(ticker, market, entryPrice, tp, sl)`. Por isso, ao clicar ⭐ para adicionar, ocorre um `ReferenceError` silencioso e nada acontece.

**Acceptance Criteria:**
- Clicar ⭐ em uma linha da Lista chama `trackPick()` com os dados corretos e adiciona o ticker em `state.trackedPicks`.
- O botão muda visualmente para ✓ (com borda verde) ao ser adicionado.
- Clicar ✓ remove o ticker de `state.trackedPicks` e o botão volta ao estado ⭐.
- Um toast confirma a ação: "✅ TICKER TRACKED!" ao adicionar ou "TICKER removido dos acompanhados" ao remover.
- A lista rerenderiza mantendo a posição de scroll e o filtro de busca ativo.

**Sprint:** 18 · **Effort:** 30min

---

### US-174 — Remover Botão 📊 Duplicado da Tabela Lista
**As a** usuário na view Lista,
**I want** que o botão 📊 (gráfico de barras) que aparece em cada linha da tabela seja removido,
**so that** a interface fique mais limpa e sem ações redundantes ou confusas ao lado do botão de Acompanhar.

**Context:**
O botão `📊` atual chama `openPortfolioModal()` que abre o modal de adicionar à Carteira, mas sua presença ao lado do ⭐ cria confusão (dois botões de ação por linha, sem label). A ação de adicionar à Carteira será substituída por um botão mais claro (US-175).

**Acceptance Criteria:**
- O botão `📊` (que chama `openPortfolioModal`) é removido do HTML gerado por `renderHomeLista()`.
- Cada linha da Lista passa a ter apenas o botão ⭐/✓ de Acompanhar.
- Nenhuma regressão na funcionalidade de Carteira acessada por outras rotas (modal de detalhe da ação, view Carteira).

**Sprint:** 18 · **Effort:** 15min

---

### US-192 — Corrigir Link "Ver Relatório DARF" que Não Funciona
**As a** usuário na view Carteira,
**I want** que ao clicar em "↓ Ver relatório" no card do Relatório de IR (DARF) o painel DARF apareça sempre — mesmo quando ainda não tenho nenhuma venda registrada,
**so that** possa configurar meu prejuízo acumulado (carryforward), ver meu CPF e entender o relatório antes de realizar a primeira venda.

**Root Cause:**
O card "Relatório de IR (DARF)" (linha ~2562) usa `onclick="document.getElementById('darfAnchor')?.scrollIntoView({behavior:'smooth'})"`. O elemento `#darfAnchor` só é renderizado **dentro de um `if (brlSold.length > 0)`** (linha ~3005) — ou seja, ele só existe no DOM quando o usuário já tem posições vendidas em BRL. Sem vendas, `getElementById('darfAnchor')` retorna `null`, o optional chaining `?.` silencia o erro e nada acontece.

**Fix — Renderizar o painel DARF sempre:**
Mover o `<div id="darfAnchor">` para fora da condição `if (brlSold.length > 0)`. O painel deve sempre estar presente no DOM. A condição permanece, mas apenas para controlar o **conteúdo interno**:

```
[sempre renderizado]
<div id="darfAnchor">
  <h3>DARF_TITLE</h3>
  
  [sempre visível] Campos de Loss Carryforward (Swing + Daytrade)
  [sempre visível] Seção CPF + link SicalcWeb
  
  if (brlSold.length > 0):
    → blocos de cálculo swing + daytrade (comportamento atual)
  else:
    → nota informativa: "Nenhuma venda em BRL registrada ainda.
       Registre a venda de uma posição para ver o cálculo de IR."
</div>
```

**Por que mostrar carryforward e CPF mesmo sem vendas:**
- O usuário pode já ter prejuízos de meses anteriores para configurar antes de operar.
- O CPF é necessário para preencher o DARF no SicalcWeb — visualizá-lo mesmo sem vendas é útil.
- Mantém consistência: o painel sempre existe e o scroll sempre funciona.

**Acceptance Criteria:**
- Clicar "↓ Ver relatório" sempre rola até `#darfAnchor`, independente de haver ou não posições vendidas.
- Com zero vendas: painel exibe os campos de carryforward, a seção de CPF e uma nota informativa. **Não** exibe os blocos de cálculo (swing/daytrade).
- Com vendas BRL: exibe o painel completo com cálculos, exatamente como hoje (sem regressão).
- Os campos de carryforward são editáveis e salvam via `saveDarfLossCarryforward()` em ambos os estados.
- Nenhuma mudança nos cálculos de impostos, na exportação CSV ou na lógica de `darfBlock()`.

**Sprint:** 18 · **Effort:** 30min

---

### US-191 — Traduzir Texto "Positions / holding / sold" na Carteira
**As a** usuário na view Carteira,
**I want** que o texto de resumo de posições seja exibido em português,
**so that** a interface seja consistente com o restante do app que já está em PT-BR.

**Context:**
Na view Carteira, abaixo dos totais realizados/não-realizados, há um texto hardcoded em inglês na linha ~2477 do `stock-dashboard.html`:
```
Positions: 3 (3 holding, 0 sold)
```
O código ao redor já usa o sistema de tradução `t()` (ex: `t('portfolio_totalRealized')`, `t('portfolio_totalUnrealized')`), mas esta linha foi deixada sem tradução.

**Keys a adicionar em `static/i18n.js`:**
| Key | EN | PT |
|---|---|---|
| `portfolio_positions` | `Positions` | `Posições` |
| `portfolio_posHolding` | `holding` | `em carteira` |
| `portfolio_posSold` | `sold` | `encerradas` |

**Resultado esperado em PT:** `Posições: 3 (3 em carteira, 0 encerradas)`
**Resultado esperado em EN:** `Positions: 3 (3 holding, 0 sold)`

**Code change (`stock-dashboard.html` linha ~2477):**
Substituir:
```js
html += 'Positions: <strong style="color:var(--ink)">' + state.portfolio.length + '</strong> (' + state.portfolio.filter(p => p.status === 'holding').length + ' holding, ' + state.portfolio.filter(p => p.status === 'sold').length + ' sold)</div>';
```
Por:
```js
html += t('portfolio_positions') + ': <strong style="color:var(--ink)">' + state.portfolio.length + '</strong> (' + state.portfolio.filter(p => p.status === 'holding').length + ' ' + t('portfolio_posHolding') + ', ' + state.portfolio.filter(p => p.status === 'sold').length + ' ' + t('portfolio_posSold') + ')</div>';
```

**Acceptance Criteria:**
- Com `_lang = 'pt'` (padrão): exibe `Posições: X (X em carteira, X encerradas)`.
- Com `_lang = 'en'`: exibe `Positions: X (X holding, X sold)`.
- Os valores numéricos são calculados dinamicamente conforme o portfólio do usuário.
- Nenhuma regressão no layout ou no cálculo de posições.

**Sprint:** 18 · **Effort:** 15min

---

### US-175 — Botão "Adicionar à Carteira" na Tabela Lista
**As a** usuário na view Lista,
**I want** um botão dedicado em cada linha da tabela para adicionar aquela ação à minha Carteira,
**so that** posso registrar uma compra diretamente da Lista sem precisar abrir o detalhe do ativo.

**UX:**
- Ícone: 📊 (gráfico de barras colorido — conforme referência visual do usuário)
- Label tooltip: "Adicionar à Carteira"
- Comportamento: abre o `portfolioModal` com ticker e preço pré-preenchidos (mesmo comportamento do `openPortfolioModal()` atual)
- Posição: coluna de ações, após o botão ⭐/✓, separado visualmente

**Acceptance Criteria:**
- Cada linha da Lista exibe o botão 📊 após o ⭐/✓.
- Clicar 📊 abre o modal de Carteira (`showPortfolioModal()`) com o campo Ticker e Preço já preenchidos.
- `event.stopPropagation()` impede que o clique no botão abra o detalhe da ação.
- O botão tem `title="Adicionar à Carteira"` para acessibilidade.
- Funciona tanto para ações com dados de scan (preço disponível) quanto para ações sem scan (preço = 0 → campo preço vazio).

**Sprint:** 18 · **Effort:** 30min

---

---

## Epic 40 — Admin: Controles de Cadastro e CPF

### US-177 — Toggle Admin: Exigir ou Dispensar CPF no Cadastro
**As an** administrador,
**I want** um toggle no Painel Admin para ativar ou desativar a obrigatoriedade de CPF no cadastro de novas contas,
**so that** posso controlar o requisito de CPF remotamente sem precisar fazer deploy — útil para testes A/B, abertura temporária para usuários sem CPF, ou conformidade com mudanças regulatórias.

**Context:**
Atualmente o CPF é validado e obrigatório em `server.js` no endpoint `/api/auth/signup` (linha ~150, hardcoded: `if (!cpfDigits) return sendError(res, 400, 'CPF é obrigatório')`). O servidor já possui a infraestrutura de feature flags (`feature-flags.json`, endpoint `/api/admin/feature-flags`, função `toggleFeatureFlag()` no frontend) que pode ser reutilizada diretamente.

**Backend changes (`server.js`):**
- Adicionar `cpf_required: true` à estrutura inicial de `featureFlags` (ou no `feature-flags.json`).
- No endpoint de signup, substituir o hardcode por: `if (featureFlags.cpf_required && !cpfDigits) return sendError(...)`.
- O endpoint `/api/feature-flags` (GET público) já expõe as flags para o frontend, então o formulário de signup pode ocultar/mostrar o campo CPF conforme a flag.

**Frontend changes (`stock-dashboard.html`):**
- O campo CPF no modal de signup deve ser exibido condicionalmente: visível e obrigatório se `featureFlags.cpf_required === true`; oculto/opcional se `false`.
- O Painel Admin (tabela de feature flags existente) deve exibir a nova flag `cpf_required` com o label "Exigir CPF no cadastro" e os checkboxes Free/Pro para free e pro tiers — ou, dado que CPF é um requisito global de cadastro, um único toggle "Global" faz mais sentido. Escolha: toggle único global (não por tier).
- A flag deve ser carregada na inicialização via o endpoint `/api/feature-flags` já existente.

**Acceptance Criteria:**
- Com `cpf_required = true` (padrão): cadastro exige CPF válido; formulário mostra campo CPF; tentativa sem CPF retorna erro 400.
- Com `cpf_required = false`: cadastro aceita email + senha sem CPF; campo CPF some do formulário de signup (ou vira opcional); usuário criado com `cpf: null`.
- O admin pode alternar a flag via Painel Admin sem reload do servidor.
- A flag persiste em `feature-flags.json` entre restarts do container Docker.
- Usuários já cadastrados (com ou sem CPF) não são afetados pela alteração da flag.
- Login continua funcionando independentemente da flag (CPF não é verificado no login).

**Sprint:** 18 · **Effort:** 2h

---



---

## 📋 Sprint 19 — Planned

## Epic 46 — Sprint 19: Signup Estabilidade em Fresh Install

### US-209 — "Internal Server Error" Intermitente no Primeiro Cadastro em Nova Instalação
**As a** developer or user setting up MOMENTUM on a new machine,
**I want** the signup to succeed on the first attempt,
**so that** I don't have to refresh the page and retry to create an account.

**Observed behaviour:** On a fresh Docker install, the first signup attempt returns `Internal server error (500)`. Refreshing and trying again succeeds. Subsequent signups always work.

**Root cause analysis (most likely):**
1. **Missing `data/` directory on first boot.** `saveUsers()` calls `fs.mkdirSync({ recursive: true })` before writing, but on some Docker volume configurations `fs.renameSync(tmp, DB_PATH)` can race with the volume mount completing — throwing `ENOENT` or `EXDEV` which bubbles up as a 500.
2. **`scryptSync` slow on cold start.** `crypto.scryptSync` is CPU-blocking. On a resource-constrained or cold Docker container it can take 1–3s, potentially exceeding client-side timeouts before returning — causing the client to receive an error even though the server succeeds.
3. **No startup pre-flight.** The server starts accepting HTTP connections before verifying the `data/` directory is writable. First inbound request hits the unready state.

**Implementation:**
- In `server.js` startup sequence, add a pre-flight check: create `data/` dir and write a test file before the HTTP server starts listening. If it fails, log a clear error and exit.
- In `lib/auth.js`, wrap `saveUsers` write+rename in a retry loop (max 3 attempts, 50ms apart) to handle transient filesystem race on Docker volume mount.
- Log the actual caught error (not just "Internal server error") to `console.error` so future failures are diagnosable: `console.error('[signup error]', err)`.
- Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ADMIN_EMAIL` to `.env.example` with comments — currently missing, causing confusing `undefined` values on fresh installs.

**Acceptance Criteria:**
- Fresh Docker install: first signup attempt succeeds without needing a refresh.
- If `data/` directory is not writable, server logs a clear message on startup and refuses to start (rather than failing silently on first request).
- Actual error details are logged server-side (not swallowed), so the root cause is visible in `docker logs jerry-stock-dashboard`.
- `.env.example` includes `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ADMIN_EMAIL`.

**Sprint:** 19 · **Effort:** 45min · **Priority:** 🔴 High (blocks new deployments)

---

## Epic 45 — Sprint 19: UX & Localização

### US-208 — Confirmação de Exclusão de Conta em Português com Double-Confirm
**As a** usuário que deseja excluir sua conta,
**I want** que o diálogo de confirmação de exclusão esteja em português e exija que eu digite "EXCLUIR" para confirmar,
**so that** a ação destrutiva seja clara, intencional e localizada corretamente.

**Current behaviour (bug):**
- First dialog: `"Permanently delete <email>? This cannot be undone. All your data will be erased."` — hardcoded English.
- Second dialog: `"Are you absolutely sure? Type OK to confirm."` — misleading: says "Type OK" but is a `confirm()` dialog, not a `prompt()`. User just clicks OK, no typing required.

**Expected behaviour:**
- Single `confirm()` in Portuguese: `"Tem certeza que deseja excluir permanentemente <email>? Esta ação não pode ser desfeita."` — first warning.
- Followed by a `prompt()` in Portuguese: `"Digite EXCLUIR para confirmar."` — user must type the exact word `EXCLUIR` (case-insensitive). Any other input or cancel aborts.

**Implementation:** `deleteMyAccount()` in `stock-dashboard.html` — replace lines 619–620:
```js
if (!confirm(`Tem certeza que deseja excluir permanentemente ${email}? Esta ação não pode ser desfeita. Todos os seus dados serão apagados.`)) return;
const typed = prompt('Digite EXCLUIR para confirmar a exclusão da conta.');
if ((typed || '').trim().toUpperCase() !== 'EXCLUIR') return;
```

**Acceptance Criteria:**
- Both dialogs are in Portuguese.
- Second step requires typing `EXCLUIR` (case-insensitive). Anything else — including Cancel — aborts.
- Account is only deleted if both steps pass.
- Supersedes US-206 (Sprint 24) — remove US-206 from backlog once shipped.

**Sprint:** 19 · **Effort:** 10min · **Priority:** 🟠 Medium

---

## Epic 44 — Sprint 19: Configuração de Admin via Variável de Ambiente

### US-207 — ADMIN_EMAIL Configurável via Variável de Ambiente
**As a** developer installing MOMENTUM on a new server,
**I want** to set the admin account email via an environment variable,
**so that** any install can have its own admin without hardcoding an email in the source code.

**Context:** Currently `ADMIN_EMAIL` is hardcoded as `thiagotupa@hotmail.com` in `lib/auth.js:90`. On a fresh install the admin email never changes, making it impossible to grant admin access to a different owner without editing source code.

**Implementation:**
- Add `ADMIN_EMAIL` to `.env.example` with a placeholder and comment
- In `lib/auth.js`, replace the hardcoded string with `process.env.ADMIN_EMAIL?.toLowerCase()` with a fallback warning if not set
- Server should log a clear warning on startup if `ADMIN_EMAIL` is not set in the environment
- Update `README.md` to document the variable and explain the first-login flow (sign up → auto-promoted to admin on next boot)

**Acceptance Criteria:**
- Setting `ADMIN_EMAIL=owner@example.com` in `.env` makes that email the admin on server start.
- If `ADMIN_EMAIL` is not set, server logs `⚠ ADMIN_EMAIL not set — admin panel disabled` and all `/api/admin/*` routes return 403.
- `.env.example` includes `ADMIN_EMAIL=` with an explanatory comment.
- `README.md` documents the env var and the signup → admin flow.
- Existing behaviour (auto-promote on boot, auto-demote others) is unchanged.

**Sprint:** 19 · **Effort:** 30min · **Priority:** 🔴 High (blocks new deployments)

---

## Epic 39 — Sprint 19: Acompanhados — Colunas de Acompanhamento e Indicadores

### US-176 — Redesign da Tabela Acompanhados: Colunas de Preço, P&L e Indicadores Técnicos
**As a** usuário na view Acompanhados,
**I want** que a tabela mostre colunas de variação diária, resultado desde que comecei a acompanhar e indicadores técnicos (MACD e ADX) com seus valores numéricos,
**so that** posso acompanhar a performance e o momentum de cada ação sem precisar abrir o detalhe individual.

---

#### Colunas Removidas
| Coluna atual | Motivo da remoção |
|---|---|
| **POTENCIAL** | Mostra distância até o TP — útil no scan, mas sem significado como KPI de acompanhamento. Substituída por P&L real. |

#### Colunas Mantidas
| Coluna | Dado | Observação |
|---|---|---|
| **#** | Índice sequencial | — |
| **TICKER** | `pick.ticker` | — |
| **PREÇO** | `d.price` | Preço atual do último scan |
| **SINAL** | `d.signal` | Compra / Aguardar / Venda |
| **RSI** | `d.rsi` | Valor numérico |
| **ALVO (TP)** | `d.tp ?? pick.tp` | Alvo de preço |
| **Ações** | botão ✕ | Remover da watchlist |

#### Colunas Novas
| Coluna | Dado | Formato | Cor |
|---|---|---|---|
| **VAR %** | `d.changePercent` | `+1,23%` / `-0,45%` | Verde se ≥ 0, vermelho se < 0 |
| **P&L %** | `(d.price - pick.entryPrice) / pick.entryPrice × 100` | `+8,40%` / `-3,10%` | Verde se ≥ 0, vermelho se < 0. `—` se `entryPrice = 0` |
| **MACD** | `d.macd` | `+0.32` / `-0.18` (2 casas decimais, sinal explícito) | Verde se > 0, vermelho se < 0 |
| **ADX** | `d.adx` | `28.4` (1 casa decimal) | `> 25` → cor de destaque (`var(--primary)`); `≤ 25` → `var(--ink-3)` (tendência fraca) |

**Ordem das colunas no redesign:**
`# | TICKER | PREÇO | VAR% | P&L% | SINAL | RSI | MACD | ADX | ALVO (TP) | [✕]`

---

#### Summary Bar (barra de totais acima da tabela)

| Métrica atual | Alteração |
|---|---|
| TOTAL | mantida |
| COMPRA | mantida |
| POTENCIAL MÉDIO | **removida** |
| — | **nova: RESULTADO** — média de P&L % de todas as posições com preço disponível. Formato: `+4,2%` ou `-1,8%`. Verde/vermelho conforme sinal. Se nenhuma posição tiver preço, ocultar. |

---

**Acceptance Criteria:**
- A coluna POTENCIAL é removida da tabela e do cálculo de `avgPotential`.
- A coluna VAR % exibe `d.changePercent` formatado com sinal e 2 casas; mostra `—` quando dado indisponível (ação não analisada no último scan).
- A coluna P&L % calcula `(price - pick.entryPrice) / pick.entryPrice × 100` com sinal e 2 casas; mostra `—` quando `pick.entryPrice === 0` ou preço atual não disponível.
- A coluna MACD exibe `d.macd` com sinal explícito (`+`/`-`) e 2 casas decimais; verde se > 0, vermelho se < 0; `—` se dado indisponível.
- A coluna ADX exibe `d.adx` com 1 casa decimal; cor de destaque se `> 25` (tendência forte), cinza se `≤ 25`; `—` se dado indisponível.
- Na summary bar: "POTENCIAL MÉDIO" é substituído por "RESULTADO" (média de P&L % das posições com preço).
- Todas as colunas novas têm `font-family: var(--font-mono)` para alinhamento numérico.
- A tabela é horizontalmente rolável em mobile (overflow-x: auto já existente via `.card-flush`).
- Ações sem dados de scan exibem `—` em VAR%, P&L%, MACD e ADX sem quebrar o layout.

**Dados disponíveis no objeto `d` (resultado de `analyzeStock()`):**
- `d.macd` — número (positivo = bull, negativo = bear), calculado em `calcMACD()` — disponível após varredura
- `d.adx` — número 0–100, calculado em `calcADX(c, 14)` — disponível após varredura
- `d.changePercent` — variação diária % — disponível após varredura
- `pick.entryPrice` — preço na hora em que o usuário clicou ⭐, salvo em `trackPick()`

**Sprint:** 19 · **Effort:** 2h

---

---



---

## 🔒 Future Sprints — Parked

> Sprints 20–22 are documented and ready but parked for a future session.
> See LGPD gating notes inside Epic 41 before scheduling.

## Epic 41 — Admin Dashboard & Data Monetisation (LGPD-Compliant)

> ⚠️ **LGPD — Lei nº 13.709/2018:** E-mail, CPF e dados comportamentais (tickers, preferências de sinal) são dados pessoais. Compartilhá-los ou vendê-los a terceiros exige **consentimento explícito, específico, informado e livre** do usuário (Art. 7 I e Art. 8). O consentimento deve ser granular por finalidade, revogável a qualquer momento e demonstrável. As stories US-184, US-185, US-186 e US-187 **não podem ir a produção** antes que US-183 (infraestrutura de consentimento) esteja live e verificada. CPF nunca deve aparecer em exports para parceiros.

---

### US-178 — Acesso Autenticado ao Painel Admin
**As an** admin, **I want** a protected `/admin` area gated by an `is_admin` flag on the user record, **so that** only authorised staff can view operational metrics and user data.

**Acceptance Criteria:**
- New boolean field `is_admin` on user record, default `false`, set manually in the DB/users.json.
- All `/api/admin/*` routes reject non-admin sessions with 403.
- Admin session uses the existing auth cookie; no separate login.
- Admin actions are logged with `admin_user_id`, `action`, `timestamp`, `ip` (see US-188).
- Failed admin access attempts are logged and rate-limited.

**Sprint:** 25 · **Effort:** S

---

### US-179 — Admin KPI Dashboard (Visão Geral)
**As an** admin, **I want** a single overview page showing key platform KPIs, **so that** I can monitor health and growth at a glance.

**Acceptance Criteria:**
- Tiles: total users, free users, Pro users, Pro conversion %, signups last 7d / 30d.
- Active users last 7d and 30d (at least one authenticated session in the period).
- CPF-verified % (users with non-null, validated CPF / total users).
- Signup trend line chart (daily, last 90 days).
- All numbers computed server-side (aggregates); no per-user data leaked.
- Page loads under 2s with 10k users.

**Sprint:** 25 · **Effort:** M

---

### US-180 — Lista de Usuários com Filtros e Busca
**As an** admin, **I want** a paginated user list I can filter and search, **so that** I can find cohorts for support, analysis, or outreach.

**Acceptance Criteria:**
- Columns: email, tier, signup date, last login, CPF status (verified / unverified / missing), partner-sharing consent status.
- Filters: tier, signup date range, last login range, CPF status, consent status.
- Free-text search across email (case-insensitive, partial match).
- Server-side pagination (50 per page), sortable columns.
- CPF masked in the table (e.g. `***.***.**-12`); full CPF visible only on the detail view (US-181).

**Sprint:** 25 · **Effort:** M

---

### US-181 — Visão Detalhada por Usuário (Admin)
**As an** admin, **I want** to drill into a single user's profile, **so that** I can investigate support issues and understand their engagement.

**Acceptance Criteria:**
- Shows: email, full CPF (masked by default, reveal button — reveal is logged), tier, signup date, last login, Pro subscription status.
- Portfolio summary: number of positions, total cost basis, tickers held.
- Watchlist: tickers tracked.
- Scan activity: number of scans last 7d / 30d, last scan timestamp.
- Consent record: partner-sharing opt-in status, timestamp, consent text version accepted.
- Every CPF reveal writes to the audit log (US-188).
- Read-only view; no edit capabilities in this story.

**Sprint:** 25 · **Effort:** M

---

### US-182 — Export da Lista de Usuários para CSV/JSON (Uso Interno)
**As an** admin, **I want** to export the currently filtered user list to CSV or JSON, **so that** I can perform offline analysis or feed internal tools.

**Acceptance Criteria:**
- Export button respects active filters.
- Formats: CSV and JSON.
- Fields: email, tier, signup date, last login, CPF status (boolean — **not** the CPF number), consent status.
- Confirmation modal warns: _"Este export contém dados pessoais. Uso interno somente. Não compartilhe externamente sem revisão jurídica LGPD."_
- Export recorded in audit log (US-188) with row count, filters applied, and format.
- Max 50k rows per export.
- **⚠️ LGPD:** Este export é para uso de controllers internos (equipe Momentum) apenas. Qualquer envio a terceiros requer o fluxo de export consentido (US-185).

**Sprint:** 25 · **Effort:** M

---

### US-183 — Infraestrutura de Consentimento LGPD (Pré-requisito)
**As a** platform engineer, **I want** a versioned, auditable consent store, **so that** every partner-sharing opt-in is legally demonstrable and revocable per LGPD Art. 8 §2.

**Acceptance Criteria:**
- New data store `user_consents` with: `user_id`, `purpose` (enum — starts with `partner_data_sharing`), `granted` (bool), `consent_text_version`, `granted_at`, `revoked_at`, `ip`, `user_agent`.
- Consent texts stored as immutable versioned records; never edited in place.
- Service API: `grant(userId, purpose)`, `revoke(userId, purpose)`, `isActive(userId, purpose)`.
- Revoking creates a new row (audit trail preserved); old rows never deleted.
- Any query targeting users for partner sharing **must** use `isActive()`; direct joins forbidden.
- **⚠️ LGPD Hard gate:** US-184, US-185, US-186, US-187 são bloqueadas até esta story estar live e verificada.

**Sprint:** 21 · **Effort:** L

---

### US-184 — Opt-in do Usuário para Compartilhamento com Parceiros
**As a** Momentum user, **I want** to be clearly informed about and explicitly opt into partner data sharing, **so that** I retain full control over my personal data as guaranteed by LGPD.

**Acceptance Criteria:**
- Opt-in fica na página de Configurações do usuário — **nunca** no fluxo de signup (consentimento bundled é proibido pelo LGPD Art. 8 §4).
- Estado padrão: **desativado**. Nunca pré-marcado.
- Texto de consentimento em português claro: o que é compartilhado (email, tickers, preferências de sinal, tier — **nunca CPF**), categorias de destinatários (corretoras, plataformas de trading, publicidade financeira), retenção, e como revogar.
- Botão "Revogar" visível sempre que o consentimento estiver ativo; revoga imediatamente.
- Grant e revoke escrevem no consent store (US-183) e exibem toast de confirmação.
- Bilíngue (PT-BR e EN).
- **⚠️ LGPD:** Consentimento deve ser específico a esta finalidade. Não agrupar com termos de serviço ou outros consentimentos.
- **Bloqueada por:** US-183

**Sprint:** 21 · **Effort:** M

---

### US-185 — Export de Leads para Parceiros (Usuários Opt-in Somente)
**As an** admin, **I want** to export an opt-in-only dataset useful to commercial partners, **so that** Momentum can monetise data lawfully under LGPD.

**Acceptance Criteria:**
- Query obrigatoriamente filtra por `isActive(userId, 'partner_data_sharing') === true`.
- Campos incluídos: email, tickers watched (array), signal preferences (RSI/MACD/ADX flags), tier. **Excluídos:** CPF, nome completo, IP, hash de senha, custo de portfólio, qualquer campo livre.
- Admin deve selecionar um parceiro nomeado de uma lista gerenciada (`partners` store com nome, contato, referência de contrato) antes de exportar.
- Modal dupla confirmação: contagem de linhas, campos, nome do parceiro e base legal ("consentimento LGPD Art. 7 I").
- Export assinado (HMAC de conteúdo + timestamp) e armazenado server-side por 5 anos.
- Audit log detalhado (US-188): admin id, parceiro id, contagem de linhas, lista de campos, snapshot de versão de consentimento, hash do arquivo assinado.
- Usuários que revogam o consentimento entre exports são automaticamente excluídos de exports futuros.
- **⚠️ LGPD Hard gate:** Bloqueada até US-183, US-184 estarem live. Revisão jurídica do texto de consentimento e template de contrato com parceiro é gate de release. Realizar RIPD (Relatório de Impacto à Proteção de Dados) antes do primeiro export.
- **Bloqueada por:** US-183, US-184, US-188

**Sprint:** 22 · **Effort:** L

---

### US-186 — Export Agregado / Anonimizado para Parceiros
**As an** admin, **I want** to export aggregate-only statistics (no per-user rows), **so that** I can offer partners market-trend data without triggering personal-data sharing rules.

**Acceptance Criteria:**
- Output: somente contagens e percentuais (ex: "X% dos usuários acompanham PETR4", "top 20 tickers por watchlist", "distribuição de tier").
- Tamanho mínimo de célula: 10 usuários; buckets menores suprimidos para evitar re-identificação.
- Nenhum email, CPF, user_id ou identificador direto no output.
- **Não requer consentimento** (dados anonimizados estão fora do escopo da LGPD, Art. 12), mas a metodologia de anonimização deve ser documentada no export.
- Registrado no audit log (US-188) como `partner_aggregate_export`.
- **Bloqueada por:** US-188

**Sprint:** 22 · **Effort:** M

---

### US-187 — Dashboard de Consentimento para Admins
**As an** admin, **I want** to monitor opt-in/opt-out trends, **so that** I can size the partner-export audience and detect consent-funnel issues.

**Acceptance Criteria:**
- Tiles: total usuários com consentimento ativo, taxa de opt-in (% do total), revogações nos últimos 30d, variação líquida nos últimos 30d.
- Gráfico de série temporal de concessões e revogações (diário, últimos 90 dias).
- Breakdown por tier (taxa de opt-in free vs Pro).
- Nenhum dado individual exibido — somente agregados.
- Link para a lista de usuários (US-180) pré-filtrada por `consent=granted`.
- **Bloqueada por:** US-183

**Sprint:** 22 · **Effort:** S

---

### US-188 — Audit Log de Ações Admin (Conformidade LGPD Art. 37)
**As a** data protection officer, **I want** an immutable audit log of every sensitive admin action, **so that** Momentum can demonstrate compliance with LGPD Art. 37 (records of processing) and respond to ANPD inquiries.

**Acceptance Criteria:**
- Store `admin_audit_log`: `id`, `admin_user_id`, `action` (enum), `target_type`, `target_id`, `metadata` (JSON), `ip`, `user_agent`, `created_at`.
- Ações logadas: admin login, user list export, user detail view, CPF reveal, partner export, partner export download, consent text version change.
- Rows append-only na camada de aplicação; nenhuma UI de admin oferece delete ou edit.
- Retenção: 5 anos mínimo (configurável).
- Admin UI para visualizar e filtrar: por admin, tipo de ação, intervalo de datas, usuário alvo.
- Log exportável para CSV para atender solicitações da ANPD; este export também é logado.
- Alerta (email ao contato de segurança) se um admin exportar mais de N linhas em 24h (padrão N = 5.000).

**Sprint:** 25 · **Effort:** M

---

### US-189 — Direitos do Titular de Dados (LGPD Art. 18)
**As a** Momentum user, **I want** to download my data and request deletion, **so that** I can exercise data-subject rights guaranteed by LGPD Art. 18.

**Acceptance Criteria:**
- Página de Configurações expõe "Baixar meus dados" (retorna JSON de perfil, portfólio, watchlist, histórico de consentimentos) e "Excluir minha conta".
- Exclusão remove ou anonimiza irreversivelmente campos pessoais (email → hash, CPF → null) mantendo contadores agregados e referências no audit log.
- Após exclusão, usuário é automaticamente removido de exports futuros para parceiros (revogação propagada).
- Ambas as ações registradas no audit log (US-188).
- E-mail de confirmação enviado para cada ação; exclusão é reversível por 7 dias, depois permanente.
- **⚠️ LGPD:** Pré-requisito legal para qualquer uso comercial de dados de usuários. Recomendar bundling com US-183.
- **Bloqueada por:** US-183, US-188

**Sprint:** 21 · **Effort:** M

---

### Ordem de Release Recomendada (gating legal)

| Fase | Stories | Requisito |
|------|---------|-----------|
| **1 — Tooling interno** | US-178, US-179, US-180, US-181, US-182, US-188 | Nenhum parceiro externo; uso interno de admins apenas |
| **2 — Infraestrutura de consentimento** | US-183, US-184, US-189 | **Revisão jurídica obrigatória** antes de release |
| **3 — Monitoramento** | US-187 | Depende de US-183 |
| **4 — Export agregado** | US-186 | Menor risco legal (dados anônimos) |
| **5 — Export individual** | US-185 | **Gate rígido:** sign-off jurídico + RIPD completo antes do primeiro export |

---



---

---

## Epic 43 — Security & Code Quality (Code Review Findings)

> Findings from automated code review. Split into Sprint 23 (Critical + Major) and Sprint 24 (Minor). C3 (`trackPickFromBtn`) is already covered by US-173 in Sprint 18.

---

### US-193 — [C1] XSS: Sanitizar Conteúdo de Notícias Antes de Inserir no innerHTML
**As a** usuário da plataforma,
**I want** que títulos, resumos e publicadores de notícias sejam escapados antes de serem inseridos no DOM,
**so that** um payload malicioso vindo da API do Yahoo Finance não execute código JavaScript no meu navegador.

**Root Cause:**
`stock-dashboard.html` função `renderItem` (~linha 1740): campos `n.title`, `n.summary` e `n.publisher` vindos da API de notícias são inseridos diretamente em `innerHTML` sem sanitização. Um título como `</a><img src=x onerror=alert(1)>` executa JS no contexto do usuário.

**Fix:**
```js
function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
```
Usar `esc(n.title)`, `esc(n.publisher)`, `esc(summary)` em todos os pontos de interpolação em `renderItem`. Para elementos que não precisam de HTML filho, usar `textContent` em vez de `innerHTML`.

**Acceptance Criteria:**
- `n.title`, `n.publisher` e `n.summary` são escapados via `esc()` antes de qualquer interpolação em string HTML.
- Títulos com `<script>`, `<img onerror>` e aspas simples/duplas são exibidos como texto literal, sem execução.
- Layout visual das notícias permanece idêntico.

**Sprint:** 23 · **Effort:** 1h · **Severity:** 🔴 Critical

---

### US-194 — [C2] XSS: Email do Usuário no Painel Admin via onclick Inline
**As an** administrador,
**I want** que os botões de ação na tabela de usuários usem atributos `data-*` em vez de interpolar o email diretamente em strings `onclick`,
**so that** um email cadastrado com conteúdo malicioso (ex: `x')+alert(1)//`) não execute código JS no painel admin.

**Root Cause:**
`stock-dashboard.html` função `showAdminView` (~linha 716): emails são interpolados diretamente em `onclick="setUserTier('${u.email}','free')"`. Um email contendo `'` quebra a string de atributo e executa JS arbitrário.

**Fix:**
```js
// Em vez de onclick inline:
`<button class="set-tier-btn" data-email="${esc(u.email)}" data-tier="free">↓ Revogar</button>`
// Com listener separado:
btn.addEventListener('click', () => setUserTier(btn.dataset.email, 'free'));
```
Aplicar para todos os botões da tabela admin (setUserTier, setAdmin).

**Acceptance Criteria:**
- Nenhum email de usuário é interpolado em strings de atributos `onclick`.
- Botões da tabela admin usam `data-email` + `addEventListener`.
- Email com caracteres especiais (`'`, `"`, `<`, `>`) é exibido corretamente e não executa código.
- Adicionar validação de formato de email no signup no servidor (ver US-204).

**Sprint:** 23 · **Effort:** 1h · **Severity:** 🔴 Critical

---

### US-195 — [M1] Rate Limiter: Remover Confiança em X-Forwarded-For
**As a** operador da plataforma,
**I want** que o rate limiter de autenticação use o IP real da conexão TCP em vez do header `X-Forwarded-For`,
**so that** um atacante não possa burlar o limite de 10 tentativas/15min simplesmente trocando o valor desse header a cada requisição.

**Root Cause:**
`server.js` linha 138: `const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress`. O header `x-forwarded-for` é controlado pelo cliente — qualquer um pode enviar um IP diferente em cada request, zerando o contador de tentativas.

**Fix:**
```js
const clientIp = req.socket.remoteAddress || 'unknown';
```
Em deployment Docker sem proxy reverso na frente, `remoteAddress` é o IP real. Se um proxy (nginx, Cloudflare) for adicionado no futuro, confiar apenas no último IP adicionado pelo proxy, não no header completo.

**Acceptance Criteria:**
- Rate limiter usa `req.socket.remoteAddress` exclusivamente.
- 10 tentativas de login com IPs falsos via `X-Forwarded-For` são corretamente bloqueadas.
- Comportamento de bloqueio por IP real permanece intacto.

**Sprint:** 23 · **Effort:** 30min · **Severity:** 🟠 Major

---

### US-196 — [M2] Stripe Webhook: Adicionar Limite de Tamanho ao Body
**As a** operador da plataforma,
**I want** que o endpoint `/api/stripe/webhook` tenha um limite de tamanho no body recebido,
**so that** um atacante não possa enviar um payload gigante e esgotar a memória do servidor.

**Root Cause:**
`server.js` linhas 481–483: o webhook do Stripe acumula o body sem limite, enquanto todas as outras rotas usam `readBody()` que tem cap de 1MB. O body bruto é necessário para verificação de assinatura HMAC, mas ainda precisa de um teto.

**Fix:**
```js
let body = '', size = 0;
req.on('data', c => {
  size += c.length;
  if (size > 1_048_576) { req.destroy(); return; }
  body += c;
});
```

**Acceptance Criteria:**
- Payload acima de 1MB no webhook do Stripe destrói a conexão imediatamente.
- Payloads legítimos do Stripe (sempre pequenos) continuam sendo processados corretamente.
- Verificação de assinatura `stripe.webhooks.constructEvent` não é afetada.

**Sprint:** 23 · **Effort:** 30min · **Severity:** 🟠 Major

---

### US-197 — [M3] Auth: Substituir scryptSync por scrypt Assíncrono
**As a** usuário fazendo login ou cadastro,
**I want** que a operação de hashing de senha não bloqueie o servidor para outros usuários,
**so that** múltiplos logins simultâneos não causem lentidão para todos.

**Root Cause:**
`lib/auth.js` linhas 101 e 106: `crypto.scryptSync` bloqueia o event loop do Node.js por ~35ms a cada chamada. Com 10 logins simultâneos, isso gera ~350ms de stall antes da primeira resposta.

**Fix:** Usar `crypto.scrypt` (versão assíncrona com callback) e `await` nas rotas de signup/login.
```js
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) =>
    crypto.scrypt(pw, salt, 64, (err, hash) =>
      err ? reject(err) : resolve(salt + ':' + hash.toString('hex'))
    )
  );
}
```

**Acceptance Criteria:**
- `hashPassword()` e `verifyPassword()` são assíncronas e retornam Promises.
- Rotas de signup e login usam `await hashPassword()` / `await verifyPassword()`.
- Múltiplos logins simultâneos não bloqueiam o event loop.
- Hash e verificação continuam funcionando corretamente.

**Sprint:** 23 · **Effort:** 1h · **Severity:** 🟠 Major

---

### US-198 — [M4] Admin Email: Mover para Variável de Ambiente
**As a** operador da plataforma,
**I want** que o email do administrador seja configurado via variável de ambiente em vez de hardcoded no código-fonte,
**so that** a conta admin não fique exposta se o repositório for compartilhado ou tornado público.

**Root Cause:**
`lib/auth.js` linha 90: `const ADMIN_EMAIL = 'thiagotupa@hotmail.com'.toLowerCase()` — email pessoal commitado no código.

**Fix:**
```js
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();
if (!ADMIN_EMAIL) console.warn('[auth] ADMIN_EMAIL not set — admin panel disabled');
```
Adicionar `ADMIN_EMAIL=...` ao `.env` do container Docker.

**Acceptance Criteria:**
- `ADMIN_EMAIL` lido de `process.env.ADMIN_EMAIL`.
- Se não definido, painel admin fica inacessível e um warning é logado na inicialização.
- Funcionalidade admin permanece idêntica quando a variável está definida.
- Email não aparece mais em nenhum arquivo commitado no repositório.

**Sprint:** 23 · **Effort:** 30min · **Severity:** 🟠 Major

---

### US-199 — [M5] Persistência: Proteger users.json Contra Gravações Concorrentes
**As a** usuário salvando minha carteira,
**I want** que meus dados não sejam perdidos quando outro usuário salva os dele simultaneamente,
**so that** gravações concorrentes no mesmo arquivo não se sobrescrevam.

**Root Cause:**
`server.js` linhas 330 e 351: `saveUsers()` serializa e renomeia `users.json` inteiro a cada save de portfólio/watchlist. O padrão tmp+rename previne arquivos corrompidos mas não previne race conditions — duas gravações simultâneas resultam na segunda sobrescrevendo a primeira.

**Fix — fila de gravação serial:**
```js
let _saveLock = Promise.resolve();
function saveUsers() {
  _saveLock = _saveLock.then(() => {
    const tmp = DB_PATH + '.tmp.' + Date.now();
    fs.writeFileSync(tmp, JSON.stringify(users, null, 2));
    fs.renameSync(tmp, DB_PATH);
  });
  return _saveLock;
}
```
Long-term: migrar portfólio e watchlist para arquivos por usuário (`data/portfolio-{id}.json`) para reduzir o tamanho do arquivo e o escopo de cada gravação.

**Acceptance Criteria:**
- `saveUsers()` executa gravações de forma serial via fila de Promises.
- Dois saves simultâneos não resultam em perda de dados de nenhum dos usuários.
- A abordagem de arquivo por usuário é documentada como próximo passo (não obrigatória nesta US).

**Sprint:** 23 · **Effort:** 2h · **Severity:** 🟠 Major

---

### US-200 — [M6] Validação: Sanitizar Payloads de Portfólio e Watchlist
**As a** operador da plataforma,
**I want** que os endpoints de save de portfólio e watchlist validem os dados recebidos antes de persistir,
**so that** um usuário autenticado não possa armazenar dados arbitrários e causar corrupção ou crescimento ilimitado do arquivo.

**Root Cause:**
`server.js` linhas 327–353: apenas verifica se o body é um array, sem validar campos, tipos, comprimento ou tamanho máximo.

**Fix:**
```js
if (body.length > 500) return sendError(res, 400, 'Payload too large');
for (const item of body) {
  if (typeof item.ticker !== 'string' || item.ticker.length > 20) return sendError(res, 400, 'Invalid ticker');
  if (item.quantity != null && typeof item.quantity !== 'number') return sendError(res, 400, 'Invalid quantity');
  if (item.buyPrice != null && typeof item.buyPrice !== 'number') return sendError(res, 400, 'Invalid price');
}
```

**Acceptance Criteria:**
- Arrays com mais de 500 itens são rejeitados com 400.
- Campos `ticker`, `quantity`, `buyPrice` têm tipos validados.
- Payloads com campos válidos continuam sendo salvos normalmente.
- Aplica-se tanto ao endpoint de portfólio quanto ao de watchlist.

**Sprint:** 23 · **Effort:** 1h · **Severity:** 🟠 Major

---

### US-201 — [m4] getCurrentPrice Não Busca Preços do Mercado Brasil
**As a** usuário com ações brasileiras na watchlist,
**I want** que o preço atual de ações B3 seja encontrado e exibido corretamente,
**so that** posso ver o status (TP/SL hit) das minhas posições acompanhadas sem que fique sempre em "WAITING".

**Root Cause:**
`stock-dashboard.html` função `getCurrentPrice` (~linha 1975): itera sobre `['us','europe','emerging']` mas omite `'brasil'` — o mercado principal. Qualquer ticker B3 retorna `null`.

**Fix:** Adicionar `'brasil'` à lista:
```js
for (const m of ['brasil','us','europe','emerging']) {
```

**Acceptance Criteria:**
- Ações B3 (ex: PETR4.SA, VALE3.SA) exibem preço atual corretamente na watchlist após um scan.
- Status de TP/SL é calculado corretamente para posições brasileiras.

**Sprint:** 18 · **Effort:** 5min · **Severity:** 🟡 Minor (high impact)

---

### US-202 — [m1] nextId(): Substituir Math.max(...spread) por reduce
**As a** operador da plataforma,
**I want** que a geração de IDs de usuário não quebre com bases de dados grandes,
**so that** o servidor não lance `RangeError: Maximum call stack size exceeded` com mais de ~65k usuários.

**Root Cause:**
`lib/auth.js` linha 109: `Math.max(...users.map(u => u.id))` — spread como argumentos de função tem limite de ~65k itens no V8.

**Fix:**
```js
function nextId() {
  return users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
}
```

**Acceptance Criteria:**
- `nextId()` usa `reduce` em vez de spread.
- Funciona corretamente com qualquer número de usuários.

**Sprint:** 24 · **Effort:** 5min · **Severity:** 🟡 Minor

---

### US-203 — [m3] Adicionar Handlers de uncaughtException e unhandledRejection
**As a** operador da plataforma,
**I want** que erros não tratados sejam logados antes de derrubar o servidor,
**so that** posso diagnosticar crashes em produção em vez de encontrar o processo simplesmente morto.

**Root Cause:**
`server.js`: sem `process.on('unhandledRejection')` ou `process.on('uncaughtException')`. Em Node 15+, uma Promise rejeitada não tratada derruba o processo silenciosamente.

**Fix:**
```js
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught exception:', err);
  process.exit(1);
});
```

**Acceptance Criteria:**
- Rejeições não tratadas são logadas com stack trace antes de qualquer exit.
- Exceções não capturadas são logadas e o processo sai com código 1.

**Sprint:** 24 · **Effort:** 15min · **Severity:** 🟡 Minor

---

### US-204 — [m6] Validar Formato de Email no Signup
**As a** operador da plataforma,
**I want** que o signup rejeite emails sem formato válido,
**so that** a base de dados não acumule registros com emails inválidos que causam falhas silenciosas no envio.

**Root Cause:**
`server.js` linhas 147–148: apenas verifica se o campo é truthy — `"abc"` (sem `@`) é aceito, causando falha silenciosa no envio de email via Resend.

**Fix:**
```js
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) return sendError(res, 400, 'Email inválido');
```

**Acceptance Criteria:**
- Emails sem `@` ou sem domínio são rejeitados com 400 no signup.
- Emails válidos continuam sendo aceitos normalmente.
- Mensagem de erro em PT: "Email inválido".

**Sprint:** 24 · **Effort:** 15min · **Severity:** 🟡 Minor

---

### US-205 — [m5] CPF: Remover do Retorno de /api/auth/me
**As a** usuário autenticado,
**I want** que meu CPF não seja retornado em toda chamada de verificação de sessão,
**so that** esse dado sensível não apareça em logs de rede, proxies ou DevTools desnecessariamente.

**Root Cause:**
`server.js` linha 185: CPF incluído no payload de `/api/auth/me` que é chamado a cada carregamento de página.

**Fix:** Remover `cpf` do retorno de `/api/auth/me`. Criar endpoint separado `/api/auth/profile` (ou aproveitar o existente) que retorna o CPF somente quando explicitamente solicitado (ex: ao abrir a tela de perfil).

**Acceptance Criteria:**
- `/api/auth/me` não retorna o campo `cpf`.
- A tela de perfil (`showProfile()`) busca o CPF via chamada separada somente quando necessário.
- A tela do DARF que usa `authUser.cpf` é atualizada para buscar o CPF on-demand.
- Regressão zero nas funcionalidades de perfil e DARF.

**Sprint:** 24 · **Effort:** 1h · **Severity:** 🟡 Minor

---

### US-206 — [m7] Corrigir Confirmação Enganosa no "Excluir Conta"
**As a** usuário tentando excluir minha conta,
**I want** que o diálogo de confirmação peça que eu digite uma palavra específica para confirmar,
**so that** a ação seja genuinamente intencional e não apenas dois cliques em "OK".

**Root Cause:**
`stock-dashboard.html` linhas 613–614: segundo `confirm()` diz "Type OK to confirm" mas `confirm()` não tem campo de texto — apresenta apenas OK/Cancel, tornando a instrução enganosa.

**Fix:** Substituir o segundo `confirm()` por `prompt()`:
```js
const typed = prompt('Para confirmar, digite EXCLUIR:');
if (typed !== 'EXCLUIR') return;
```

**Acceptance Criteria:**
- O segundo passo de confirmação usa `prompt()` pedindo que o usuário digite `EXCLUIR`.
- Qualquer resposta diferente de `EXCLUIR` (incluindo cancelar) aborta a exclusão.
- Mensagem em PT-BR.

**Sprint:** 24 · **Effort:** 15min · **Severity:** 🟡 Minor

---

---

## 📋 Sprint 20 — Signal Engine v2: Critérios e Scoring

> ⚠️ **Prioridade alta** — Opus review identified that the current signal system contains dead code and should NOT be demoed to institutional partners (brokers, accelerators) until US-210 ships.

## Epic 47 — Signal Engine v2

### US-210 — Signal Scoring v2: Remove Dead Code, Add SMA200 Regime Gate e Volume
**As a** user scanning stocks,
**I want** the BUY/HOLD/SELL signal to be based on a logically coherent, multi-factor score,
**so that** the signals I see reflect genuine market conditions and not a broken scoring formula.

**Background:** A quantitative review (subagent + Opus) found three critical flaws in the current `pickSignal` function:
1. The `RSI < 35` bonus is dead code — RSI < 35 and RSI 45–65 are mutually exclusive sets that can never both be true.
2. Three inputs (RSI, MACD, SMA50) measure the same thing (trend direction) — no independent confirmation.
3. No volume confirmation and no bear-market regime gate — can fire BUY in a confirmed downtrend.

**New scoring function (replace `pickSignal` in `stock-dashboard.html`):**

```js
function pickSignal(rsi, macd, macdHist, adx, above50, above200, volRatio) {
  let s = 0;

  // 1. Medium-term trend (SMA50) — max 0.75 pts
  if (above50) s += 0.75;

  // 2. Long-term regime (SMA200) — max 0.75 pts
  if (above200) s += 0.75;

  // 3. Momentum — MACD value + histogram direction — max 1.0 pt
  if (macd > 0 && macdHist > 0) s += 1.0;  // positive AND accelerating
  else if (macd > 0)             s += 0.5;  // positive but not accelerating

  // 4. RSI — single coherent zone — max 1.0 pt
  if      (rsi >= 50 && rsi <= 65) s += 1.0;   // trend-confirmation zone
  else if (rsi > 65  && rsi <= 70) s += 0.25;  // strong but stretched
  else if (rsi >= 40 && rsi <  50) s -= 0.25;  // weakening momentum

  // 5. Trend strength (ADX) — max 0.5 pts
  if (adx > 25) s += 0.5;

  // 6. Volume confirmation — max 0.5 pts
  if (volRatio > 1.2) s += 0.5;   // 20%+ above 20-day average volume

  // Hard guards
  if (!above200) s = Math.min(s, 1.0);  // cap at HOLD in confirmed bear regime
  if (rsi > 75 || rsi < 25) s -= 1.0;  // severe extreme penalty

  const signal = s >= 2.5 ? 'buy' : s >= 1.0 ? 'neutral' : 'sell';
  return { signal, score: parseFloat(s.toFixed(1)) };
}
```

**Maximum possible score: 4.5 points — 6 independent criteria:**
- SMA50 (medium-term trend): 0.75
- SMA200 (long-term regime): 0.75
- MACD positive + accelerating: 1.0
- RSI in sweet zone (50–65): 1.0
- ADX > 25: 0.5
- Volume > 1.2×: 0.5

> ⚠️ **Refinement vs original v2 spec:** SMA50 and SMA200 are scored as two independent criteria (+0.75 each) instead of one combined criterion (+1.5 for both, +0.75 for SMA50 only). This fixes the case where "above SMA200, below SMA50" (pullback in uptrend) scored 0 pts — it now correctly scores +0.75. The regime hard cap (`!above200 → max 1.0`) is unchanged. See US-219.

**`analyze()` function:** Pass `macdHist` (last histogram value), `above200` (price > sma200), and `volRatio` (already computed) to `pickSignal`.

**Acceptance Criteria:**
- No dead code — all scoring clauses can independently contribute to BUY.
- A stock with price below SMA200 cannot receive a BUY signal (capped at HOLD by the regime gate).
- The RSI sweet zone is 50–65 (not 45–65 — tightened to reduce noise).
- Volume above 1.2× 20-day average adds +0.5 to score.
- Existing `analyze()` function passes the new arguments without breaking other features.
- All signal chips (Compra / Aguardar / Venda) continue to work for filtering.

**Sprint:** 20 · **Effort:** 2h · **Priority:** 🔴 Critical (blocks partner demo)

---

### US-211 — ATR-Based TP/SL: Exits que Respeitam a Volatilidade de Cada Ativo
**As a** user tracking a position or viewing a stock card,
**I want** the Take Profit and Stop Loss levels to be based on each stock's actual volatility (ATR),
**so that** B3 stocks with high volatility don't get me stopped out on normal noise, and low-volatility stocks aren't given excessively wide stops.

**Background:** Current TP = price × 1.15, SL = price × 0.93 (fixed 15%/7% for all stocks). Opus review: "A 7% SL is ~0.4σ on VALE3 — you're guaranteed to be stopped on noise." B3 stocks average 30–50% annualized vol vs ~20% for S&P 500. Fixed stops are wrong for this universe.

**New formula (replace TP/SL calculation in `analyze()`):**
```js
const atr14 = atr; // already computed in analyze()
const tp = parseFloat((price + 3.0 * atr14).toFixed(2));  // 3× ATR upside
const sl = parseFloat((price - 1.5 * atr14).toFixed(2));  // 1.5× ATR downside
// R:R ratio preserved at 2:1
```

For reference on typical B3 names:
| Stock | ATR(14) approx | New SL | New TP |
|-------|---------------|--------|--------|
| PETR4 (R$45) | ~R$1.80 | −R$2.70 (−6%) | +R$5.40 (+12%) |
| VALE3 (R$81) | ~R$3.20 | −R$4.80 (−6%) | +R$9.60 (+12%) |
| MGLU3 (R$6.6) | ~R$0.45 | −R$0.68 (−10%) | +R$1.35 (+20%) |
| ITUB4 (R$40) | ~R$0.90 | −R$1.35 (−3%) | +R$2.70 (+7%) |

Natural volatility scaling — tight for blue chips, wider for small/mid caps.

**Acceptance Criteria:**
- TP = price + (3.0 × ATR14), SL = price − (1.5 × ATR14), rounded to 2 decimal places.
- Displayed TP/SL values on stock cards and in the Acompanhados table update to ATR-based values.
- Portfolio modal pre-fill uses ATR-based TP/SL (not fixed percentages).
- Existing stored `trackedPicks` with old fixed TP/SL are not retroactively changed — only new picks use ATR-based exits.

**Sprint:** 20 · **Effort:** 1h · **Priority:** 🔴 High

---

### US-212 — Mostrar Score Numérico no Sinal: "COMPRA · 3.2/4.5"
**As a** user viewing a stock card or the Lista,
**I want** to see the numeric score behind the BUY/HOLD/SELL verdict,
**so that** I can understand how strong the signal is and learn what makes a conviction buy vs a marginal one.

**Implementation:**
- `analyze()` returns `score` (the raw numeric value before threshold comparison).
- Signal badge becomes: `"COMPRA · 3.2"` or `"Aguardar · 1.8"` with max shown in tooltip: `title="Score: 3.2 / 4.5 máximo"`.
- Color logic unchanged — buy = green, sell = red, neutral = yellow.
- In the Lista table, the SINAL column shows badge + score.
- In the Sinais feed cards, the pill shows score.

**Acceptance Criteria:**
- Score is visible in the signal badge on both the Sinais feed and Lista table.
- Tooltip on hover shows the max score (4.5) for context.
- Score is rounded to 1 decimal place.

**Sprint:** 20 · **Effort:** 1h · **Priority:** 🟠 Medium

---

### US-213 — Enriquecer "Por que:" com Explicações Detalhadas por Indicador
**As a** user viewing a stock card,
**I want** the "Por que:" section to explain in plain Portuguese why the stock received that signal, with a line per indicator showing the value and what it means,
**so that** I learn to read indicators — not just trust a label.

**Current behaviour:** "Por que:" shows a brief generic summary like "MACD positivo, RSI neutro, acima da SMA50."

**New behaviour — structured explanation per indicator, matching the v2 scoring:**

```
Por que: COMPRA (score 3.5/4.5)

✅ SMA50 — preço acima da média de 50 dias (tendência de médio prazo)
✅ SMA200 — preço acima da média de 200 dias (regime de alta estrutural)
✅ MACD +0.43 e acelerando — momentum de compra em desenvolvimento
✅ RSI 57 — zona saudável de tendência (50–65), sem sobrecompra
✅ Volume 1.8× acima da média — pressão compradora presente
⚠️ ADX 21 — tendência ainda fraca (< 25), aguardar confirmação
```

For HOLD (pullback in uptrend — above SMA200 but below SMA50):
```
Por que: AGUARDAR (score 1.5/4.5)

❌ SMA50 — preço abaixo da média de 50 dias — pullback de médio prazo
✅ SMA200 — preço acima da média de 200 dias — regime de alta preservado
⚠️ MACD +0.12 positivo mas sem aceleração — momentum fraco
⚠️ RSI 47 — abaixo de 50, momentum enfraquecendo
❌ Volume na média — sem convicção direcional
❌ ADX 18 — mercado lateral, sem tendência definida
```

For SELL:
```
Por que: VENDA (score 0.2/4.5)

❌ SMA50 — preço abaixo da média de 50 dias
❌ SMA200 — preço abaixo da média de 200 dias — bear market confirmado
❌ MACD −0.28 negativo — momentum de venda dominante
⚠️ RSI 38 — queda sem sobrevendido extremo, sem sinal de reversão
❌ Volume 0.9× na média — sem pressão compradora
🔴 Regime de mercado: abaixo da SMA200 — sinais de compra bloqueados
```

**Implementation:** Replace `feedCardWhy(d)` in `stock-dashboard.html` with a structured function that maps each of the 6 scoring components to a PT-BR sentence using the actual indicator values. SMA50 and SMA200 are shown as **two separate lines**.

**Acceptance Criteria:**
- SMA50 and SMA200 each get their own line with ✅/❌ icon (not combined into one line).
- Each of the other 4 indicators (MACD, RSI, Volume, ADX) gets its own line with ✅/⚠️/❌ icon.
- Values are shown numerically (RSI 57, MACD +0.43, Volume 1.8×, ADX 28).
- The regime gate is explained if active ("sinais de compra bloqueados — ativo abaixo da SMA200").
- Score is shown in the header line ("COMPRA · 3.5/4.5").
- Language is Portuguese only (matches app default language).

**Sprint:** 20 · **Effort:** 2h · **Priority:** 🟠 Medium

---

### US-214 — Lista/Sinais: Colunas de Indicadores (RSI, MACD, ADX, Volume, SMA, Score)

**Epic:** 47 — Signal Engine v2

**Como** investidor olhando para a tabela de sinais,
**Quero** ver os valores numéricos dos indicadores principais diretamente nas colunas da Lista,
**Para que** eu possa comparar ativos rapidamente sem precisar abrir cada linha individualmente.

**Contexto:**
A tabela Lista/Sinais atualmente exibe TICKER, NOME, SETOR, PREÇO, VAR%, SINAL e ações. Toda a inteligência analítica (RSI, MACD, ADX, Volume ratio, SMA trend, Score) fica escondida dentro do "Por que:" ao expandir a linha. Isso força o usuário a abrir cada ativo para comparar critérios — fluxo ineficiente quando se quer fazer triagem entre dezenas de ativos.

Com o Signal Engine v2 (US-210), o scoring passa a ter 4.5 pts possíveis com componentes independentes. Exibir esses valores na tabela permite ao usuário fazer triagem quantitativa de um relance.

**Novas colunas a adicionar (após VAR%, antes de SINAL):**

| Coluna | Valor exibido | Cor/destaque |
|--------|---------------|--------------|
| RSI | Valor numérico (ex: 52) | Verde se ≥ 50, vermelho se < 40, neutro entre 40–49 |
| MACD | Valor numérico + seta (ex: +0.43 ↑) | Verde se positivo, vermelho se negativo |
| ADX | Valor numérico (ex: 28) | Destaque (cor primária) se > 25 (tendência confirmada) |
| Volume | Ratio vs média 20d (ex: 1.8×) | Verde se > 1.2×, neutro caso contrário |
| SMA | Tendência (ex: "50+200" / "50" / "200" / "—") | Verde se acima de ambas, amarelo se só SMA50 ou só SMA200, vermelho se abaixo de ambas |
| Score | Pontuação numérica (ex: 3.2/4.5) | Usa escala de cor: verde ≥ 3.0, amarelo 1.5–2.9, vermelho < 1.5 |

**Comportamento:**
- Colunas são adicionadas entre VAR% e SINAL (ou após SINAL, antes de ações — a decidir no design).
- Em mobile (< 768px): ocultar ADX e Volume para manter legibilidade — RSI, MACD, Score, SINAL permanecem.
- Ordenação por coluna: clique no header ordena a tabela por aquele indicador (decrescente no primeiro clique).
- Tooltip no header de cada coluna explica o que é o indicador em PT-BR.
- Valores "N/D" quando o dado não estiver disponível (ex: ativo sem volume suficiente).
- Score exibido como denominador da versão v2 (4.5 pts, conforme US-210).

**Acceptance Criteria:**
- [ ] Todas as 6 colunas aparecem na tabela Lista com valores corretos.
- [ ] Cores aplicadas conforme especificação acima.
- [ ] Em viewport < 768px: colunas ADX e Volume somem, restantes permanecem.
- [ ] Clique no header de cada nova coluna ordena a tabela.
- [ ] Tooltip em PT-BR aparece ao hover no header.
- [ ] Valores "N/D" para dados ausentes — sem crash.
- [ ] A coluna Score usa o scoring v2 (US-210 deve estar shipado antes).

**Depends on:** US-210 (score v2 must ship first or simultaneously)
**Sprint:** 20 · **Effort:** 3h · **Priority:** 🟡 High

---

## 📋 Sprint 26 — Education & Onboarding

## Epic 48 — Educação & Primeiros Passos

### US-215 — Primeiros Passos: Guia de Início para Novos Usuários

**Como** um novo usuário que acabou de criar conta,
**Quero** ver um guia de primeiros passos que me explique como o Momentum funciona e o que fazer primeiro,
**Para que** eu possa aproveitar o app desde o primeiro acesso sem precisar descobrir tudo sozinho.

**Contexto:**
Atualmente um novo usuário cria conta e cai direto na tela de scan sem qualquer orientação. Não sabe que precisa varrer o mercado primeiro, não entende o que é RSI ou ADX, não sabe que existe a view Acompanhados. A taxa de abandono de novos usuários deve ser alta por isso.

**UX — Modal "Primeiros Passos" no primeiro login:**

Exibido automaticamente na primeira vez que o usuário faz login (controlado por flag `user.onboardingDone` no perfil). Pode ser dispensado pelo usuário, mas reaparece ao clicar em "Primeiros Passos" no menu.

Estrutura do modal — 4 passos com ícones e descrição curta:

```
🚀 Bem-vindo ao Momentum!

Passo 1 — Varra o mercado
  Clique em "Varrer Agora" para analisar as ações disponíveis.
  O Momentum vai calcular RSI, MACD, ADX e outros indicadores
  e mostrar um sinal: Compra, Aguardar ou Venda.

Passo 2 — Acompanhe as melhores oportunidades
  Clique ⭐ em qualquer ação para adicioná-la aos Acompanhados.
  Você vai ver P&L%, VAR%, MACD e ADX em tempo real.

Passo 3 — Simule uma operação
  Clique em "Carteira" e adicione uma compra simulada.
  Acompanhe seu resultado sem arriscar dinheiro real.

Passo 4 — Aprenda os indicadores
  Vá em "Educação" para entender RSI, MACD, ADX, DARF e mais.
  16 lições para você operar com mais segurança.

[Começar agora →]   [Ver depois]
```

**Comportamento:**
- Modal aparece automaticamente após o primeiro login bem-sucedido.
- "Começar agora" fecha o modal e marca `onboardingDone: true` no perfil do usuário via `PATCH /api/user/profile`.
- "Ver depois" fecha sem marcar — modal reaparece no próximo login até ser completado.
- Link "Primeiros Passos" no header/menu abre o modal manualmente a qualquer momento.
- Em mobile: modal ocupa tela inteira com scroll.

**Acceptance Criteria:**
- [ ] Modal aparece automaticamente no primeiro login (usuário sem `onboardingDone: true`).
- [ ] "Começar agora" marca `onboardingDone` e fecha.
- [ ] "Ver depois" fecha sem marcar — reaparece no próximo login.
- [ ] Link no menu abre o modal manualmente.
- [ ] Modal é responsivo (mobile-friendly).
- [ ] Backend: `PATCH /api/user/profile` aceita `{ onboardingDone: true }` e persiste no users.json.

**Sprint:** 26 · **Effort:** 2h · **Priority:** 🟡 High

---

### US-216 — Educação: Módulo "Como Funciona o Sinal Momentum"

**Como** usuário que vê sinais de Compra/Aguardar/Venda na tela,
**Quero** um módulo de educação que explique exatamente como o Momentum calcula esses sinais,
**Para que** eu entenda o que está por trás do número e possa usá-lo com mais confiança.

**Contexto:**
O Signal Engine v2 (Sprint 20) usa 5 critérios independentes com pontuação máxima de 4.5 pts. Os usuários veem "COMPRA · 3.2" e "Por que:" com ✅/⚠️/❌ por indicador, mas não há nenhuma explicação sistematizada sobre o modelo de scoring. Este módulo preenche essa lacuna.

**Novo módulo na seção Educação:**

```
id: 'momentum_signal'
icon: '🎯'
name: 'Sinal Momentum'
color: '#22d3ee'
title: 'Como o Momentum Calcula os Sinais'
subtitle: 'Entenda os 6 critérios do scoring v2 e o que significa a pontuação 3.5/4.5.'
```

**Conteúdo do módulo (corpo do texto em PT-BR):**

```
O Momentum avalia cada ação em 6 critérios independentes e soma uma pontuação de 0 a 4.5 pontos.
Acima de 2.5 → COMPRA. Entre 1.0 e 2.5 → AGUARDAR. Abaixo de 1.0 → VENDA.

─── Os 6 Critérios ───

1. SMA50 — Tendência de Médio Prazo — até 0.75 pts
   Preço acima da média de 50 dias = tendência de médio prazo confirmada → +0.75
   Preço abaixo da SMA50 = pressão vendedora no médio prazo → +0

2. SMA200 — Regime de Longo Prazo — até 0.75 pts
   Preço acima da média de 200 dias = mercado em alta estrutural → +0.75
   Preço abaixo da SMA200 = bear market confirmado → +0
   ⚠ Proteção: se abaixo da SMA200, o score total é limitado a 1.0
   (nenhum sinal de COMPRA em bear market confirmado)

3. Momentum — MACD + Aceleração — até 1.0 pt
   MACD positivo E acelerando (histograma crescendo) → +1.0
   MACD positivo mas estagnado → +0.5
   MACD negativo → +0

4. RSI — Zona de Tendência — até 1.0 pt
   RSI entre 50 e 65 = zona saudável de tendência → +1.0
   RSI entre 65 e 70 = forte mas esticado → +0.25
   RSI entre 40 e 50 = momentum enfraquecendo → −0.25
   ⚠ Proteção: RSI > 75 ou < 25 aplica penalidade de −1.0 ponto

5. Força da Tendência — ADX — até 0.5 pt
   ADX > 25 = tendência definida → +0.5
   ADX ≤ 25 = mercado lateral, sem direção clara → +0

6. Confirmação de Volume — até 0.5 pt
   Volume atual > 1.2× a média de 20 dias → +0.5
   Volume na média ou abaixo → +0

─── Por que SMA50 e SMA200 são critérios separados? ───

A SMA50 mede a tendência de médio prazo (últimos ~2 meses).
A SMA200 mede o regime estrutural do ativo (últimos ~10 meses).
Um ativo pode estar em pullback de curto prazo (abaixo da SMA50)
mas ainda em alta estrutural (acima da SMA200) — esse cenário
antes pontuava 0; agora recebe +0.75 por preservar o regime de alta.

─── Exemplo Real ───

PETR4: RSI 57, MACD +0.43 acelerando, ADX 28, Volume 1.8×, acima de SMA50 e SMA200
→ SMA50: +0.75 | SMA200: +0.75 | MACD: +1.0 | RSI: +1.0 | ADX: +0.5 | Volume: +0.5
→ Score: 4.5/4.5 → COMPRA (convicção máxima)

VALE3: RSI 47, MACD +0.12 estagnado, ADX 19, Volume 0.9×, acima só da SMA200
→ SMA50: +0 | SMA200: +0.75 | MACD: +0.5 | RSI: −0.25 | ADX: +0 | Volume: +0
→ Score: 1.0/4.5 → AGUARDAR (pullback em uptrend, aguardar retomada da SMA50)
```

**Implementation:** Add the new lesson object to the `eduLessons` array in `stock-dashboard.html` and add the corresponding `edu_momentumSignalBody` key to `static/i18n.js` (PT-BR only — English version can be same content for now).

**Acceptance Criteria:**
- [ ] Módulo aparece na lista de lições da Educação.
- [ ] Conteúdo explica os **6 critérios** com pontuação e exemplos reais.
- [ ] SMA50 e SMA200 são explicados como critérios separados com motivação clara.
- [ ] Regime gate e RSI extremo são explicados.
- [ ] Exemplo numérico com ação real (PETR4 ou similar) incluído.
- [ ] Módulo acessível via filtro/categoria "Sinais" ou "Análise Técnica".

**Sprint:** 26 · **Effort:** 1.5h · **Priority:** 🟡 High

---

### US-217 — Educação: Módulo "CDB e CDI — Renda Fixa Bancária"

**Como** investidor brasileiro que usa o Momentum para ações,
**Quero** entender CDB e CDI no módulo de educação,
**Para que** eu possa comparar renda fixa com renda variável e tomar decisões mais informadas sobre alocação.

**Contexto:**
O Momentum já tem módulos sobre Tesouro Direto e LCI/LCA. CDB e CDI estão ausentes — são os instrumentos de renda fixa mais populares no Brasil (mais de 60% dos investidores PF têm algum CDB). Faz sentido completar o bloco de renda fixa.

**Novo módulo na seção Educação:**

```
id: 'cdb_cdi'
icon: '🏦'
name: 'CDB e CDI'
color: '#4caf50'
title: 'CDB e CDI — Renda Fixa Bancária'
subtitle: 'O que é CDI, como o CDB rende sobre ele, e quando compensa mais que o Tesouro.'
```

**Conteúdo do módulo (corpo do texto em PT-BR):**

```
─── O que é o CDI? ───

CDI (Certificado de Depósito Interbancário) é a taxa que os bancos cobram
uns dos outros em empréstimos overnight. Na prática, o CDI anda colado à
Taxa Selic — costuma ficar 0,10% abaixo dela.

Exemplo: Selic em 13,25% → CDI ≈ 13,15% ao ano.

─── O que é o CDB? ───

CDB (Certificado de Depósito Bancário) é um título emitido por bancos
para captar dinheiro do público. Funciona como um empréstimo que você
faz ao banco — ele te paga juros em troca.

A rentabilidade é quase sempre expressa como % do CDI:
• CDB a 100% do CDI: rende o mesmo que o CDI
• CDB a 110% do CDI: rende 10% a mais que o CDI
• CDB a 90% do CDI: rende menos — evite

─── Imposto de Renda (Tabela Regressiva) ───

Quanto mais tempo você fica, menos IR paga:

Prazo            IR sobre o lucro
Até 180 dias     22,5%
181 a 360 dias   20,0%
361 a 720 dias   17,5%
Acima de 720d    15,0%   ← meta ideal para CDB longo

IOF: incidem sobre resgates nos primeiros 30 dias (tabela decrescente de 96% a 0%).

─── Garantia do FGC ───

CDBs são garantidos pelo FGC (Fundo Garantidor de Créditos) até
R$250.000 por CPF por instituição. Bancos menores costumam pagar
mais justamente por terem rating de crédito mais baixo — o FGC
compensa esse risco para o investidor.

─── CDB vs Tesouro Selic vs LCI/LCA ───

                  CDB         Tesouro Selic   LCI/LCA
Rentabilidade     90–115% CDI  Selic − 0,10%  85–95% CDI
IR                Sim           Sim             Não (isento)
Liquidez          Varia*        D+1             90–365 dias
FGC               Sim           Não (Tesouro)   Sim
Risco             Banco         União Federal   Banco

* CDB com liquidez diária existe, mas paga menos (95–100% CDI).
  CDB de prazo fixo (sem liquidez) paga mais (100–115% CDI).

─── Quando escolher CDB? ───

✅ Reserve de emergência: prefira CDB com liquidez diária a 100%+ CDI
   ou Tesouro Selic — ambos funcionam, mas confira qual paga mais.

✅ Investimento de médio prazo (> 2 anos): CDB prefixado ou IPCA+ de
   banco médio a 110%+ CDI pode superar o Tesouro IPCA+ após IR.

❌ Evite CDB com carência longa sem liquidez se não souber quando
   vai precisar do dinheiro.

─── Dica Momentum ───

O Momentum é para renda variável — ações de alta volatilidade.
CDB e Tesouro são sua reserva de emergência e sua base de segurança.
A regra geral: monte a base de renda fixa primeiro, depois explore
ações com o que sobra e não vai fazer falta.
```

**Implementation:** Add the new lesson object to the `eduLessons` array in `stock-dashboard.html` and add the `edu_cdbCdiBody` key to `static/i18n.js` (PT-BR only for now).

**Acceptance Criteria:**
- [ ] Módulo aparece na lista de lições com ícone 🏦 e cor verde.
- [ ] Conteúdo cobre: definição CDI, CDB como % do CDI, tabela IR regressiva, FGC, comparativo com Tesouro e LCI/LCA, dica de alocação.
- [ ] Tabela IR está correta (22.5% → 15%).
- [ ] Limite FGC de R$250k por CPF por instituição está correto.
- [ ] Módulo acessível via filtro/categoria "Renda Fixa".

**Sprint:** 26 · **Effort:** 1h · **Priority:** 🟠 Medium

---

### US-218 — Simulador: Incorporar Critérios v2 (Score, Scorecard, Ranking por Convicção)

**Como** usuário no Simulador que quer simular uma operação,
**Quero** ver o score de convicção do sinal, o detalhamento dos 5 critérios e os ativos ordenados por força do sinal,
**Para que** eu simule operações nos ativos com maior fundamentação técnica — não apenas os de RSI mais baixo.

**Contexto:**
O Simulador atual filtra ativos por Compra/Aguardar e os ordena por RSI crescente. Com o Signal Engine v2 (US-210), cada ativo tem um score numérico de 0 a 4.5 que representa convicção real. Um ativo com score 1.1 ("Aguardar fraco") aparece atualmente ao lado de um com score 4.2 ("Compra forte") sem distinção visual. O usuário não sabe qual setup é mais sólido antes de simular.

**Mudanças a implementar em `renderSimulator()` em `stock-dashboard.html`:**

---

#### 1. Ordenar ativos por score decrescente (substituir sort por RSI)

Linha atual (~2298):
```js
.sort((a, b) => (a.rsi || 50) - (b.rsi || 50))
```

Substituir por:
```js
.sort((a, b) => (b.score || 0) - (a.score || 0))
```

Ativos com maior convicção aparecem primeiro na lista de pills.

---

#### 2. Mostrar score em cada ticker pill

Cada pill atualmente mostra apenas um ponto colorido + ticker. Adicionar score:

```
● PETR4 · 3.8     (verde, score alto)
● VALE3 · 2.1     (amarelo, score médio)
● MGLU3 · 1.1     (cinza, score baixo)
```

Cor do score segue a mesma escala da Lista: verde ≥ 3.0, amarelo 1.5–2.9, cinza < 1.5.

Implementação — no loop de `displayStocks.forEach`:
```js
const scoreVal = s.score != null ? +s.score : null;
const scoreColor = scoreVal != null
  ? (scoreVal >= 3.0 ? 'var(--buy)' : scoreVal >= 1.5 ? 'var(--hold)' : 'var(--ink-3)')
  : 'var(--ink-3)';
const scoreLabel = scoreVal != null ? ` · ${scoreVal.toFixed(1)}` : '';
// add scoreLabel to the pill button text after ticker
```

---

#### 3. Painel de Scorecard para o ativo selecionado

Exibir acima dos cenários (TP/SL), após o resumo de quantidade comprada:

```
┌─────────────────────────────────────────────────────────┐
│  CONVICÇÃO DO SINAL — PETR4                             │
│  ████████████████████  4.5 / 4.5   Alta convicção       │
│                                                         │
│  ✅ SMA50 — tendência de médio prazo     +0.75 pts      │
│  ✅ SMA200 — regime de alta estrutural   +0.75 pts      │
│  ✅ MACD positivo acelerando             +1.0 pts       │
│  ✅ RSI 57 — zona saudável               +1.0 pts       │
│  ✅ Volume 1.8× média                    +0.5 pts       │
│  ⚠️ ADX 21 — tendência fraca             +0.0 pts       │
└─────────────────────────────────────────────────────────┘
```

**Label de convicção** baseado no score:
- score ≥ 3.5 → "Alta convicção" (verde)
- score ≥ 2.5 → "Convicção moderada" (verde claro)
- score ≥ 1.5 → "Sinal fraco" (amarelo)
- score < 1.5 → "Aguardar — sinal muito fraco" (cinza)

**Barra de progresso** visual: `width: ${(score/4.5)*100}%`, cor conforme label.

**Critérios** — mostrar cada um com ícone e pontos efetivos:

| Critério | Condição | Pontos |
|----------|----------|--------|
| SMA50 | `pA50` → +0.75 | dinâmico |
| SMA200 | `pA200` → +0.75 | dinâmico |
| MACD | `macd > 0 && macdHist > 0` → +1.0, `macd > 0` → +0.5 | dinâmico |
| RSI | zona 50–65 → +1.0, 65–70 → +0.25, 40–50 → −0.25 | dinâmico |
| Volume | `volRatio > 1.2` → +0.5 | dinâmico |
| ADX | `adx > 25` → +0.5 | dinâmico |

Cada linha mostra: ícone (✅/⚠️/❌) + descrição curta + pontos em `var(--font-mono)`.

---

#### 4. Label de convicção no cenário TP

No bloco do Cenário Otimista (🚀 TP atingido), adicionar uma linha extra:

```
Confiança do sinal: Alta convicção · 3.8/4.5
```

Cor e texto conforme a mesma escala acima.

---

**Acceptance Criteria:**
- [ ] Ativos ordenados por score decrescente (maior convicção primeiro).
- [ ] Cada ticker pill mostra score com cor (verde/amarelo/cinza).
- [ ] Painel Scorecard aparece para o ativo selecionado mostrando os **6 critérios** (SMA50 e SMA200 como linhas separadas) com pontos e ícone.
- [ ] Barra de progresso visual mostra score/4.5.
- [ ] Label de convicção (Alta/Moderada/Fraco) aparece no painel e no cenário TP.
- [ ] Valores "N/D" para campos ausentes — sem crash.
- [ ] Layout funciona em mobile (scorecard empilha verticalmente).

**Depends on:** US-210 (score em analyze()) — já shipado em Sprint 20.
**Sprint:** 26 · **Effort:** 2h · **Priority:** 🟡 High

---

### US-219 — Signal Scoring: SMA50 e SMA200 como Critérios Independentes

**Como** usuário que lê os sinais do Momentum,
**Quero** que SMA50 e SMA200 sejam avaliados separadamente no scoring,
**Para que** uma ação em pullback de médio prazo (abaixo da SMA50) mas em alta estrutural (acima da SMA200) receba crédito pelo regime de longo prazo — em vez de pontuar zero como se estivesse em bear market completo.

**Contexto:**
No Signal Engine v2 (US-210), SMA50 e SMA200 eram avaliados de forma combinada: ambos acima = +1.5, só SMA50 = +0.75, nenhum = +0. O caso "acima da SMA200, abaixo da SMA50" — pullback em uptrend, um setup clássico — pontuava 0, incorretamente equiparando-o a um bear market confirmado. Com critérios separados (+0.75 cada), esse setup passa a pontuar +0.75, refletindo que o regime de longo prazo está preservado.

**Mudanças de implementação:**

#### 1. `pickSignal()` em `stock-dashboard.html`

Substituir o bloco de tendência combinada:
```js
// ANTES (combinado):
if (above50 && above200) s += 1.5;
else if (above50)        s += 0.75;

// DEPOIS (independente):
if (above50)  s += 0.75;  // 1. Medium-term trend (SMA50)
if (above200) s += 0.75;  // 2. Long-term regime (SMA200)
```

O hard guard de regime permanece inalterado:
```js
if (!above200) s = Math.min(s, 1.0);  // cap at HOLD in bear regime
```

Score máximo permanece 4.5 pts. Thresholds BUY (≥ 2.5) e HOLD (≥ 1.0) inalterados.

#### 2. `feedCardWhy(d)` em `stock-dashboard.html`

Substituir o bloco de tendência combinada (uma linha) por **duas linhas independentes**:

```js
// SMA50
if (d.pA50) {
  lines.push('✅ SMA50 — preço acima da média de 50 dias (tendência de médio prazo)');
} else {
  lines.push('❌ SMA50 — preço abaixo da média de 50 dias — pressão vendedora no médio prazo');
}

// SMA200
if (d.pA200) {
  lines.push('✅ SMA200 — preço acima da média de 200 dias (regime de alta estrutural)');
} else {
  lines.push('❌ SMA200 — preço abaixo da média de 200 dias — bear market confirmado');
}
```

O bloco de regime gate ao final permanece (só aparece quando `d.pA200 === false`).

#### 3. Lista SMA column — `renderHomeLista()` em `stock-dashboard.html`

Adicionar o caso "acima só da SMA200" que antes mostrava "—":
```js
// ANTES:
const smaLabel = (d?.pA50 && d?.pA200) ? '50+200' : d?.pA50 ? '50' : '—';
const smaColor = (d?.pA50 && d?.pA200) ? 'var(--buy)' : d?.pA50 ? 'var(--hold)' : 'var(--sell)';

// DEPOIS:
const smaLabel = (d?.pA50 && d?.pA200) ? '50+200'
               : d?.pA50  ? '50'
               : d?.pA200 ? '200'
               : '—';
const smaColor = (d?.pA50 && d?.pA200) ? 'var(--buy)'
               : (d?.pA50 || d?.pA200) ? 'var(--hold)'
               : 'var(--sell)';
```

**Acceptance Criteria:**
- [ ] `pickSignal()` avalia SMA50 e SMA200 em linhas independentes (+0.75 cada).
- [ ] Score máximo permanece 4.5 pts. Thresholds BUY/HOLD inalterados.
- [ ] Hard guard de regime (`!above200 → max 1.0`) inalterado.
- [ ] "Por que:" mostra duas linhas separadas: uma para SMA50, uma para SMA200.
- [ ] Coluna SMA na Lista mostra "200" quando ativo está acima da SMA200 mas abaixo da SMA50.
- [ ] Scorecard do Simulador (US-218) mostra 6 linhas: SMA50 e SMA200 separadas.
- [ ] Sem regressão nos sinais existentes — verificar que COMPRA/AGUARDAR/VENDA ainda funcionam para filtros.

**Depends on:** US-210 (já shipado), US-218 (scorecard — pode ser implementado em conjunto)
**Sprint:** 26 · **Effort:** 1h · **Priority:** 🔴 High (corrige modelo de scoring)

---

## Epic 49 — Lista Completa com Sinais

### US-220 — Lista: Exibir Todos os Ativos com Sinais Completos

**Como** usuário da aba Lista,
**Quero** ver todos os ativos do universo Brasil com seus sinais e indicadores calculados,
**Para que** eu possa comparar e filtrar o mercado completo sem precisar clicar em "Varrer" manualmente.

**Contexto — por que hoje não funciona:**

A Lista mostra todos os ativos de `state.universeCache['brasil']` (universo completo), mas os sinais (RSI, MACD, ADX, Score, Sinal) só aparecem para stocks em `state.analyzed['brasil']`, que só é populado após uma varredura manual ("⚡ Varrer"). Dois problemas adicionais agravam isso:

1. **Filtro de candles silencioso** (`scanMarket`, linha ~1060): `if (c.length > 100)` — ativos com menos de 100 velas históricas (listagens recentes, FIIs, BDRs) são descartados silenciosamente e nunca entram em `state.analyzed`. Aparecem na Lista com `N/D` em todas as colunas.

2. **Sem auto-varredura ao abrir a Lista**: Entrar na aba Lista sem ter varrido antes resulta em uma tabela com 300+ linhas e zero sinais. O usuário não recebe nenhum aviso nem botão de ação dentro da tabela.

**Mudanças de implementação:**

#### 1. Auto-scan ao entrar na Lista (`setHomeMode` / `renderHomeLista`)

Em `setHomeMode('lista')`, verificar se `state.analyzed['brasil']` está vazio. Se sim, disparar `scanMarket('brasil')` em background e mostrar um banner de progresso no topo da tabela:

```js
if (state.homeMode === 'lista' && !(state.analyzed['brasil']||[]).length) {
  // Show inline progress bar, then scan
  _listaScanning = true;
  scanMarket('brasil').then(() => { _listaScanning = false; renderHomeLista(); });
}
```

O banner deve mostrar: `"Calculando sinais… X de Y ações"` — atualizando a cada tick de `scanMarket`. A tabela exibe linhas à medida que os resultados chegam (re-render progressivo via `renderHomeLista()` já chamado dentro de `scanMarket`).

#### 2. Abaixar threshold de candles: `> 100` → `>= 30`

Em `scanMarket()`:
```js
// ANTES:
if (c.length > 100) {

// DEPOIS:
if (c.length >= 30) {
```

Com 30 velas (~6 semanas de pregão) é possível calcular RSI(14), MACD(12,26) básico e SMA50 parcial. Para ativos com menos de 50 velas, indicadores que requerem mais dados (`pA50`, `pA200`, `adx`) serão `null` e exibirão `N/D`, mas o ativo ainda aparece com os indicadores disponíveis em vez de sumir completamente.

#### 3. Distinção visual: `N/D` vs `Sem dados`

Na renderização da Lista:
- Ativo **analisado mas indicador nulo** (ex: SMA200 sem dados suficientes): mostrar `N/D` em cinza claro.
- Ativo **não analisado** (fora do `sigMap`): mostrar `—` em cinza mais escuro com `title="Não varrido"`.

Isso permite que o usuário distinga entre "indicador calculado mas ausente" e "ativo nunca analisado".

#### 4. Botão "Varrer Lista" no header da Lista (fallback manual)

No header da Lista (ao lado do campo de busca), adicionar um botão `"⚡ Varrer Lista"` que dispara `scanMarket('brasil')` e re-renderiza progressivamente. O botão fica desabilitado durante a varredura e mostra `"Varrendo… X%"`.

**Acceptance Criteria:**
- [ ] Ao clicar em "📋 Lista" pela primeira vez (sem varredura prévia), a varredura inicia automaticamente e um banner de progresso aparece no topo da tabela.
- [ ] Ativos com 30–99 velas são incluídos na varredura e aparecem na Lista com os indicadores que for possível calcular.
- [ ] Ativos sem nenhum dado de mercado (falha total no fetch) continuam mostrando `—` e não travam o render.
- [ ] Há um botão "⚡ Varrer Lista" no header que permite re-varrer manualmente.
- [ ] O botão fica desabilitado e mostra progresso durante a varredura.
- [ ] Após a varredura, a tabela exibe sinais (Compra / Aguardar / Venda) para todos os ativos que retornaram dados suficientes.
- [ ] Se a varredura já foi feita (sinais em cache), abrir a Lista não dispara uma nova varredura automática.
- [ ] Sem regressão no comportamento atual de "Varrer" pelo botão global.

**Depends on:** US-214 (colunas da Lista — já shipado)
**Sprint:** 27 · **Effort:** 3h · **Priority:** 🔴 High

---

## Epic 51 — Signal Engine v3: Critérios de Qualidade e Consistência

### US-222 — Signal v3: Novo Tier "Monitorar", Critérios de Qualidade e Consistência Total

**Como** usuário que segue os sinais de Compra do Momentum,
**Quero** que o sinal de Compra represente apenas oportunidades com expectativa positiva comprovada,
**Para que** eu não tome posições em ativos com sinal fraco que historicamente perdem valor.

**Contexto — o que o backtest revelou:**

Backtest executado em 33 ações B3, 5 anos de dados diários, 10.524 sinais de Compra gerados:

| Tier | Sinais | Taxa de acerto 20d | Retorno médio 20d |
|------|---------|--------------------|-------------------|
| Score ≥ 3.5 (Alta Convicção) | 5.477 | **59,4%** | **+1,45%** |
| Score 2.5–3.4 (Compra Regular) | 5.047 | **43,9%** | **-1,02%** |

O band 2.5–3.4 tem **valor esperado negativo**. Chamar isso de "Compra" é enganoso para o usuário e prejudicial às suas posições. Esta story corrige o engine, adiciona 3 critérios de qualidade não-correlacionados e atualiza cada ponto do app que exibe rótulos de sinal.

---

### Parte 1 — Mudanças em `pickSignal()` (`stock-dashboard.html`)

#### 1.1 Novo tier "watchlist" (Monitorar)

```js
// ANTES:
const signal = s >= 2.5 ? 'buy' : s >= 1.0 ? 'neutral' : 'sell';

// DEPOIS:
const signal = s >= 3.5 ? 'buy'
             : s >= 2.5 ? 'watchlist'  // "Monitorar" — observar, sem ação recomendada
             : s >= 1.0 ? 'neutral'
             : 'sell';
```

#### 1.2 Gate estrutural (precondição antes do scoring)

Adicionar antes do bloco de scoring, usando valores já computados por `analyze()`:

```js
// Hard gate: ativo em tendência estrutural de queda é capado em neutral
// sma200Rising = SMA200 hoje > SMA200 de 20 pregões atrás
// distFromHigh = (max52w - price) / max52w
if (!sma200Rising || distFromHigh > 0.35) {
  return { signal: 'neutral', score: 0.0, structuralWeak: true };
}
```

`sma200Rising` e `distFromHigh` são calculados em `analyze()` e passados como novos argumentos.

#### 1.3 Três novos critérios de qualidade

```js
// Critério 7 — Distância do topo de 52 semanas (proximidade = liderança)
if      (distFromHigh <= 0.05) s += 0.75;  // dentro de 5% do topo — ação em liderança
else if (distFromHigh <= 0.15) s += 0.50;  // dentro de 15% — uptrend saudável
else if (distFromHigh >  0.40) s -= 1.00;  // queda > 40% do topo — fraqueza estrutural

// Critério 8 — Slope do RSI (momentum acelerando ou desacelerando)
// rsiSlope = RSI[i] - RSI[i-5]
if      (rsiSlope >= 5)               s += 0.50;  // momentum acelerando — entry timing bom
else if (rsiSlope <= -5 && rsi < 60)  s -= 0.50;  // momentum caindo — sinal tardio

// Critério 9 — Regime de volatilidade ATR (penalizar caos)
// atrPctNow  = ATR14 / price (hoje)
// atrPctAvg  = média de (ATR14/price) dos últimos 50 dias
if (atrPctNow > 1.5 * atrPctAvg) s -= 0.50;  // volatilidade muito acima do normal
```

#### 1.4 Novo score máximo e thresholds

Com os 3 novos critérios, o score máximo teórico sobe de 4.5 para 6.0 (arredondado). Atualizar a assinatura e toda exibição de score:

```js
// Score máximo: 6.0
// Exibição: "3.8/6.0" em vez de "3.8/4.5"
const MAX_SCORE = 6.0;
```

Thresholds:
- **Alta Convicção (BUY)**: score ≥ 3.5
- **Monitorar (watchlist)**: score 2.5–3.4
- **Aguardar (neutral)**: score 1.0–2.4
- **Venda (sell)**: score < 1.0

---

### Parte 2 — Mudanças em `analyze()` (`stock-dashboard.html`)

`analyze()` precisa calcular e passar para `pickSignal()` os três novos inputs:

```js
// Calcular max52w (máximo de fechamento nos últimos 252 pregões)
const max52w = Math.max(...c.slice(-252).map(x => x.c));
const distFromHigh = parseFloat(((max52w - price) / max52w).toFixed(3));

// Calcular sma200Rising (SMA200 hoje > SMA200 de 20 dias atrás)
const sma200_20dAgo = s200[s200.length - 21] ?? sma200;
const sma200Rising = sma200 > sma200_20dAgo;

// Calcular rsiSlope (RSI hoje - RSI há 5 pregões)
const rsiSlope = parseFloat(((rsiA[rsiA.length-1] ?? 50) - (rsiA[rsiA.length-6] ?? 50)).toFixed(1));

// Calcular ATR regime
const atrPctNow = parseFloat((atr / price).toFixed(4));
const atrSlice = atrA.slice(-50).filter(v => v != null);
const atrPctAvg = parseFloat((atrSlice.reduce((s,v) => s + v/price, 0) / (atrSlice.length || 1)).toFixed(4));

// Atualizar chamada de pickSignal:
const { signal, score, structuralWeak } = pickSignal(
  rsi, macd, macdHist, adx, pA50, pA200, volRatio,
  distFromHigh, sma200Rising, rsiSlope, atrPctNow, atrPctAvg
);

// Incluir no objeto retornado:
return { ..., distFromHigh, sma200Rising, rsiSlope, atrPctNow, atrPctAvg, structuralWeak };
```

---

### Parte 3 — Consistência: todos os pontos de exibição de sinal

Cada um dos itens abaixo deve ser atualizado para reconhecer `signal === 'watchlist'` e exibir "Monitorar":

#### 3.1 Filter chips (linha ~117)
```html
<!-- Renomear "Compra" para "Alta Convicção", adicionar chip "Monitorar" -->
<button class="chip chip-active" data-signal="buy"       onclick="filterSignal('buy')">⭐ Alta Convicção</button>
<button class="chip"             data-signal="watchlist" onclick="filterSignal('watchlist')">👁 Monitorar</button>
<button class="chip"             data-signal="neutral"   onclick="filterSignal('neutral')">Aguardar</button>
<button class="chip"             data-signal="sell"      onclick="filterSignal('sell')">Venda</button>
<button class="chip"             data-signal="all"       onclick="filterSignal('all')">Todos</button>
```

#### 3.2 `feedCardPillLabel()` e `signalBadgeHtml()` (linhas ~1239–1244)
```js
function feedCardPillLabel(sig) {
  return sig === 'buy' ? 'Alta Convicção' : sig === 'watchlist' ? 'Monitorar' : sig === 'sell' ? 'Venda' : 'Aguardar';
}

function signalBadgeHtml(sig, score) {
  const label = sig === 'buy' ? 'Alta Convicção' : sig === 'watchlist' ? 'Monitorar' : sig === 'sell' ? 'Venda' : 'Aguardar';
  const cls   = sig === 'buy' ? 'buy' : sig === 'watchlist' ? 'watchlist' : sig === 'sell' ? 'sell' : 'hold';
  // ... resto igual
}
```

#### 3.3 CSS — novo badge `.status-badge.watchlist`
Adicionar ao CSS existente:
```css
.status-badge.watchlist {
  background: rgba(234,179,8,0.15);  /* amarelo neutro — nem verde nem cinza */
  color: #ca8a04;
  border: 1px solid #ca8a04;
}
```

#### 3.4 Lista `sigBadge` (linha ~1579)
```js
if (s === 'buy')       return `<span class="status-badge active">Alta Convicção</span>`;
if (s === 'watchlist') return `<span class="status-badge watchlist">Monitorar</span>`;
if (s === 'sell')      return `<span class="status-badge sl">Venda</span>`;
return `<span style="font-size:10px;color:var(--hold);font-weight:600">Aguardar</span>`;
```

#### 3.5 `updateScanHed()` (linhas ~1341–1344)
```js
const buyCount = (stocks || []).filter(s => s.signal === 'buy').length;
const watchCount = (stocks || []).filter(s => s.signal === 'watchlist').length;
hed.innerHTML = buyCount > 0
  ? `${buyCount} ${buyCount !== 1 ? 'ações' : 'ação'} com <span class="text-primary">Alta Convicção</span>${watchCount > 0 ? ` · ${watchCount} para Monitorar` : ''}.`
  : watchCount > 0
    ? `${watchCount} ${watchCount !== 1 ? 'ações' : 'ação'} para <span class="text-primary">Monitorar</span>.`
    : 'Nenhum sinal de compra no momento.';
```

#### 3.6 `buyCount` no header (linha ~97 + 1709)
Atualizar para somar buy + watchlist no contador, ou mostrar apenas buy:
```js
// Mostrar apenas Alta Convicção no badge do header (mais seletivo)
document.getElementById('buyCount').textContent = results.filter(r => r.signal === 'buy').length;
```

#### 3.7 `simConvictionLabel()` (linhas ~2379–2381)
```js
function simConvictionLabel(score) {
  if (score >= 3.5) return { text: 'Alta convicção',   color: 'var(--buy)' };
  if (score >= 2.5) return { text: 'Monitorar',         color: '#ca8a04' };
  if (score >= 1.0) return { text: 'Aguardar',          color: 'var(--hold)' };
  return                   { text: 'Sem sinal',          color: 'var(--sell)' };
}
```

#### 3.8 Score display — "/4.5" → "/6.0" (linhas ~1236, 1244, 1604, 1650, 2502, 2558)
Substituir todas as ocorrências de `/4.5` e `/ 4.5` e `4.5 máximo` por `/6.0` e `6.0 máximo`.

#### 3.9 Módulo de educação — `Sinal Momentum` (linha ~4394)
Atualizar `subtitle` e `edu_momentumSignalBody` em `static/i18n.js`:
- Mudar "score de 0 a 4.5" → "score de 0 a 6.0"
- Adicionar descrição dos 3 novos critérios (Topo 52s, Slope RSI, Regime ATR)
- Adicionar explicação do tier "Monitorar" vs "Alta Convicção"
- Atualizar thresholds: BUY agora ≥ 3.5 (antes 2.5)

#### 3.10 Onboarding Primeiros Passos (linha ~4824)
Atualizar referência de "score de 0 a 4.5" → "score de 0 a 6.0" e mencionar que BUY = Alta Convicção ≥ 3.5.

#### 3.11 `feedCardWhy()` — exibir structuralWeak (linha ~1162)
Se `d.structuralWeak === true`, adicionar aviso no painel "Por que":
```js
if (d.structuralWeak) {
  lines.push('🔴 Saúde estrutural: ativo a mais de 35% do topo de 52 semanas ou SMA200 em queda — sinal bloqueado');
}
```
Também adicionar linha de Distância do Topo como critério visível:
```js
if (d.distFromHigh != null) {
  const pct = (d.distFromHigh * 100).toFixed(1);
  if (d.distFromHigh <= 0.05)       lines.push(`✅ Topo 52s: a ${pct}% do topo — ação em liderança (+0.75)`);
  else if (d.distFromHigh <= 0.15)  lines.push(`✅ Topo 52s: a ${pct}% do topo — tendência preservada (+0.50)`);
  else if (d.distFromHigh > 0.40)   lines.push(`❌ Topo 52s: a ${pct}% do topo — fraqueza estrutural (-1.00)`);
  else                               lines.push(`⚠️ Topo 52s: a ${pct}% do topo — pullback moderado`);
}
```

---

### Parte 4 — Backtest: atualizar `backtestStock()` (US-221)

A função `backtestStock()` usada no Histórico deve passar os novos argumentos para `pickSignal()`. Atualizar para calcular `distFromHigh`, `sma200Rising`, `rsiSlope`, `atrPctNow` e `atrPctAvg` dentro do loop de rolling window, consistente com a nova assinatura de `pickSignal()`.

---

**Acceptance Criteria:**
- [ ] `pickSignal()` recebe 12 argumentos; thresholds BUY ≥ 3.5, watchlist 2.5–3.4.
- [ ] Gate estrutural retorna `signal:'neutral', score:0, structuralWeak:true` quando SMA200 em queda ou ativo >35% abaixo do topo de 52 semanas.
- [ ] Critério 7 (Topo 52s), Critério 8 (RSI slope), Critério 9 (ATR regime) são calculados e somados ao score.
- [ ] Score máximo exibido em toda a app é 6.0 (não 4.5).
- [ ] Filter chips incluem "⭐ Alta Convicção" e "👁 Monitorar" como opções separadas.
- [ ] Badge "Monitorar" aparece em amarelo (distinto de verde e cinza) em todos os pontos de exibição: Lista, card de sinal, Simulador, "Por que".
- [ ] `updateScanHed()` mostra contagens separadas de Alta Convicção e Monitorar.
- [ ] `simConvictionLabel()` retorna "Monitorar" (amarelo) para scores 2.5–3.4.
- [ ] `feedCardWhy()` mostra critérios 7, 8 e 9 com ✅/⚠️/❌ e o gate estrutural quando ativado.
- [ ] Módulo de educação "Sinal Momentum" em `static/i18n.js` atualizado: score 0–6.0, 3 novos critérios, thresholds revisados.
- [ ] Onboarding Primeiros Passos atualizado para score 0–6.0.
- [ ] `backtestStock()` (US-221) atualizado com a nova assinatura de `pickSignal()`.
- [ ] Sem regressão em Sinais, Lista, Simulador, Acompanhados, Portfólio.

**Depends on:** US-210 (pickSignal v2 — base), US-218 (Simulador scorecard), US-221 (backtestStock)
**Sprint:** 29 · **Effort:** 6h · **Priority:** 🔴 High · **Epic:** 51

---

## Epic 50 — Backtest do Signal Engine

### US-221 — Backtest: Probabilidade de Ganho por Sinal de Compra

**Como** usuário que confia nos sinais do Momentum,
**Quero** ver uma análise histórica que mostre quantas vezes os sinais de Compra geraram retorno positivo em 10, 20 e 30 dias,
**Para que** eu saiba a taxa de acerto real dos critérios e possa calibrar minha confiança nos sinais futuros.

**Contexto técnico:**

O servidor já busca `range=5y&interval=1d` do Yahoo Finance — cada ativo tem ~1250 velas diárias disponíveis em `state.analyzed[market][i].candles`. Todas as funções de indicador (`calcSMA`, `calcRSI`, `calcMACD`, `calcADX`, `calcATR`) já rodam no cliente e operam sobre arrays de velas. Isso permite um backtest client-side completo: rodar `pickSignal()` em janela deslizante sobre os dados históricos e medir o retorno futuro a cada sinal gerado.

**Avisos obrigatórios (mostrar na UI):**
- "Backtest in-sample: os mesmos critérios foram desenhados com visão do passado — os resultados reais podem ser menores."
- "Não inclui custos de corretagem, spread ou slippage."
- "Survivorship bias: apenas ações que existem hoje são analisadas."

---

**Implementação — `stock-dashboard.html`:**

#### 1. Função `backtestStock(ticker, candles)`

```js
function backtestStock(ticker, candles) {
  const WARMUP = 230; // candles needed for SMA200 + ADX stability
  const HORIZONS = [10, 20, 30];
  const signals = [];

  // Pre-compute full indicator arrays once
  const rsiA   = calcRSI(candles, 14);
  const macdA  = calcMACD(candles);
  const adxA   = calcADX(candles, 14);
  const sma50A = calcSMA(candles, 50);
  const sma200A= calcSMA(candles, 200);

  for (let i = WARMUP; i < candles.length - 30; i++) {
    const rsi      = rsiA[i]    ?? 50;
    const macd     = macdA[i]   ?? 0;
    const macdHist = (macdA[i] ?? 0) - (macdA[i-1] ?? 0);
    const adx      = adxA[i]    ?? 20;
    const above50  = candles[i].c > (sma50A[i]  ?? 0);
    const above200 = candles[i].c > (sma200A[i] ?? 0);
    // volume ratio: current vs 20-day avg
    const volSlice = candles.slice(Math.max(0, i-19), i+1);
    const volAvg   = volSlice.reduce((s, c) => s + c.v, 0) / volSlice.length;
    const volRatio = candles[i].v / (volAvg || 1);

    const { signal, score } = pickSignal(rsi, macd, macdHist, adx, above50, above200, volRatio);
    if (signal !== 'buy') continue;

    const entry = candles[i].c;
    const row = { ticker, date: candles[i].d, entry, score };
    HORIZONS.forEach(h => {
      const exit = candles[i + h]?.c;
      row['ret' + h] = exit != null ? parseFloat(((exit - entry) / entry * 100).toFixed(2)) : null;
    });
    signals.push(row);
  }
  return signals;
}
```

#### 2. Função `runBacktest()`

```js
function runBacktest() {
  const all = [];
  (state.analyzed['brasil'] || []).forEach(d => {
    if (d.candles && d.candles.length >= 260) {
      backtestStock(d.ticker, d.candles).forEach(s => all.push(s));
    }
  });
  return all;
}
```

#### 3. Nova aba "📊 Histórico" no segmented control

Adicionar ao `#homeModesSeg` após o botão de Padrões:
```html
<button class="seg-btn" data-mode="historico" onclick="setHomeMode('historico')">📊 Histórico</button>
```

Em `renderDashboard()`, adicionar branch:
```js
if (state.homeMode === 'historico') {
  if (grid) { grid.style.display = 'none'; grid.innerHTML = ''; }
  if (dash) dash.style.display = 'block';
  renderBacktest();
  return;
}
```

#### 4. Função `renderBacktest()`

Layout de 4 seções:

**a) Explicação para o usuário (sempre visível, acima dos resultados)**

Mostrar um parágrafo fixo no topo da aba explicando o que a ferramenta faz e por que os números importam. Não deve ser colapsável — faz parte da experiência de aprender a usar os sinais. Exemplo de texto:

> **O que é o Histórico?**
> O Histórico aplica os critérios de sinal do Momentum (RSI, MACD, ADX, Volume, SMA50, SMA200) sobre todos os pregões dos últimos 5 anos, identificando cada data em que uma ação teria gerado um sinal de **Compra**. Em seguida, mede o retorno real da ação nos 10, 20 e 30 pregões seguintes.
>
> O resultado mostra a **taxa de acerto histórica** — quantas vezes o sinal de Compra foi seguido de uma valorização — e o **retorno médio**, indicando se os ganhos quando o sinal acertou compensaram as perdas quando errou.
>
> Use o Histórico para calibrar sua confiança: sinais de **Alta Convicção** (score ≥ 3.5) tendem a ter taxa de acerto e retorno médio maiores do que sinais de **Compra Regular** (score 2.5–3.4).

Abaixo do texto explicativo, mostrar os avisos de limitação em fonte menor (12px, cinza):

```
⚠️ Backtest in-sample · Os critérios foram calibrados com visão do passado — resultados reais podem ser menores.
⚠️ Não inclui custos de corretagem, spread, IR ou slippage.
⚠️ Survivorship bias: apenas ações que existem hoje são analisadas.
```

**b) Cards de resumo** (calculados sobre todos os sinais de Compra):

| Card | Fórmula |
|------|---------|
| Sinais de Compra | `all.length` |
| Taxa de Acerto 20d | `% where ret20 > 0` |
| Retorno Médio 20d | `mean(ret20)` |
| Fator de Lucro | `sum(positive ret20) / abs(sum(negative ret20))` |
| Melhor / Pior 20d | `max / min ret20` |

Mostrar também cards para 10d e 30d.

**c) Tabela por score tier:**

Segmentar resultados em dois grupos:
- **Alta Convicção** (score ≥ 3.5): mostrar taxa de acerto + retorno médio 20d
- **Compra Regular** (score 2.5–3.4): idem

Isso permite comparar se scores mais altos realmente têm melhor desempenho.

**d) Botão "Calcular Backtest"**

O cálculo não deve rodar automaticamente (pode levar 1–3s com 300 ações × 1000 dias). Mostrar:
```
[📊 Calcular Backtest]
"Requer varredura completa. Analisará X anos de histórico para Y ações."
```

Após calcular, armazenar em `state.backtestResults` para não recalcular ao trocar de aba.

#### 5. Persistência em `state`

```js
// Em state (linha ~263):
state = { ..., backtestResults: null };
```

**Acceptance Criteria:**
- [ ] Aba "📊 Histórico" aparece no segmented control como 4º botão após Padrões.
- [ ] Antes de calcular, mostrar CTA com número de ações disponíveis para análise.
- [ ] `backtestStock()` usa janela deslizante de 230 candles de aquecimento antes de gerar o primeiro sinal.
- [ ] Somente sinais onde `candles[i + 30]` existe são incluídos (sem lookahead além da janela disponível).
- [ ] Cards de resumo mostram: número de sinais, taxa de acerto (10d / 20d / 30d), retorno médio, fator de lucro.
- [ ] Tabela por tier (≥ 3.5 vs 2.5–3.4) mostra se alta convicção supera compra regular.
- [ ] Parágrafo explicativo ("O que é o Histórico?") é sempre visível no topo da aba, antes dos resultados.
- [ ] Três avisos de disclaimer (in-sample, sem custos, survivorship bias) aparecem abaixo do parágrafo em fonte menor.
- [ ] Resultados ficam em `state.backtestResults` — trocar de aba e voltar não recalcula.
- [ ] Se não há varredura (< 5 ações analisadas), mostrar mensagem pedindo para varrer primeiro.
- [ ] Sem regressão nas outras abas (Sinais, Lista, Simulador).

**Depends on:** US-210 (pickSignal v2 — já shipado), US-220 (candles em state.analyzed)
**Sprint:** 28 · **Effort:** 5h · **Priority:** 🟡 Medium · **Epic:** 50

---

## Epic 52 — Strategy Engine: Saída, Regime e Capital

### US-223 — Saída Inteligente: Stop Móvel + Prazo de 20 Dias

**Como** usuário que acompanha sinais de Alta Convicção,
**Quero** que cada posição tenha uma regra clara de saída — um prazo máximo e um stop que sobe junto com o preço —
**Para que** eu nunca fique preso numa posição por indecisão e meus ganhos sejam protegidos quando o papel valoriza.

**O que muda para o usuário:**

Hoje cada sinal tem um alvo fixo (+3×ATR) e um stop fixo (−1.5×ATR) que nunca se movem. Na prática, a maioria das posições não chega em nenhum dos dois — o usuário fica sem saber quando sair. Após esta story:

- Cada posição rastreada exibe: **"Saída em 12 pregões"** (contagem regressiva visível)
- Se o papel subir e recuar, o **stop móvel** trava os ganhos a 2×ATR abaixo do ponto mais alto atingido
- O usuário sempre sabe: *"Saio no prazo ou quando o stop móvel for atingido, o que vier primeiro"*
- Cards de posição mostram: preço de entrada, stop atual (atualizado), dias restantes

**Implementação — `stock-dashboard.html`:**

#### Lógica de saída por posição em `state.trackedPicks`

Ao registrar uma posição, salvar:
```js
{
  ticker, entryPrice, entryDate,
  atrAtEntry,          // ATR no dia de entrada
  highSinceEntry,      // atualizado a cada varredura
  holdDays: 20,        // padrão; varia se regime ativo (US-224)
  exitRule: 'time_or_trail'
}
```

A cada varredura, para cada pick ativo:
```js
const daysHeld = businessDaysBetween(pick.entryDate, today);
const trailStop = pick.highSinceEntry - 2 * pick.atrAtEntry;
const timeExit  = daysHeld >= pick.holdDays;
const stopHit   = currentPrice <= trailStop && pick.highSinceEntry > pick.entryPrice;

if (timeExit || stopHit) {
  // sinalizar saída recomendada com motivo
  pick.exitSignal = timeExit ? 'prazo' : 'stop_movel';
  pick.exitPrice  = currentPrice;
}
// Atualizar highSinceEntry
if (currentPrice > pick.highSinceEntry) pick.highSinceEntry = currentPrice;
```

#### UI — cards de posição em `renderTrackedPicks()`

Cada card mostra:
- **Barra de progresso**: `████████░░ 8/20 pregões`
- **Stop móvel atual**: `Stop: R$18.40 (↑ de R$17.20 na entrada)`
- **Status**: `✅ Dentro do prazo` / `⚠️ Saída recomendada — prazo atingido` / `🔴 Saída recomendada — stop atingido`

Remover o alvo fixo (`tp`) da exibição — substituir pelo stop móvel.

**Acceptance Criteria:**
- [ ] Cada pick salvo inclui `atrAtEntry`, `highSinceEntry`, `holdDays`, `exitRule`.
- [ ] A cada varredura, `highSinceEntry` é atualizado e `trailStop` recalculado.
- [ ] Card mostra contagem de dias restantes e stop móvel atual em R$.
- [ ] Quando prazo OU stop são atingidos, card destaca a saída recomendada com motivo.
- [ ] Módulo de educação US-229 é linkado no card via "?" tooltip.

**Depends on:** US-211 (ATR exits base), US-229 (training module)
**Sprint:** 30 · **Effort:** 3h · **Priority:** 🔴 High · **Epic:** 52

---

### US-224 — Filtro de Regime de Mercado (IBOV)

**Como** usuário do Momentum,
**Quero** que o app me avise quando o mercado está em condição desfavorável para compras —
**Para que** eu não entre em posições durante quedas do IBOV que historicamente eliminam o ganho dos sinais técnicos.

**O que muda para o usuário:**

Em outubro de 2022, o app teria gerado sinais de Alta Convicção para PETR4, MGLU3 e SMTO3 — todas perderam 28–38% em 20 dias porque o IBOV estava em queda confirmada. Com o filtro de regime, esses sinais não teriam aparecido como acionáveis.

O usuário vê, no topo da tela (abaixo do header), um indicador de 3 estados:

```
🟢 Mercado Favorável   — sinais normais, capital total
🟡 Mercado Neutro      — apenas score ≥ 4.0, posições menores
🔴 Mercado em Alerta   — nenhum sinal de compra recomendado
                          "IBOV abaixo da SMA200 — aguardando recuperação"
```

Em RISK_OFF, o app substitui os sinais de Compra por uma mensagem explicativa e um link para o módulo de educação US-228.

**Implementação — `stock-dashboard.html` + `server.js`:**

#### Cálculo do regime em `scanMarket()` / novo `calcMarketRegime()`

BOVA11.SA já está no universo. A cada varredura, buscar seus candles e calcular:

```js
function calcMarketRegime(bova11Candles) {
  const closes  = bova11Candles.map(c => c.c);
  const sma200  = calcSMA(bova11Candles, 200);
  const sma50   = calcSMA(bova11Candles, 50);
  const last    = closes.length - 1;
  const price   = closes[last];
  const hi60    = Math.max(...closes.slice(-60));
  const drawdown = (hi60 - price) / hi60;
  const atrPct   = calcATR(bova11Candles, 20)[last] / price;

  if (price < sma200[last] || drawdown > 0.15 || atrPct > 0.025) return 'risk_off';
  if (price > sma200[last] && sma50[last] > sma200[last] && drawdown < 0.08) return 'risk_on';
  return 'neutral';
}
```

Salvar em `state.marketRegime`. Reavaliado a cada varredura.

#### Aplicação do regime

- **risk_on**: sistema completo, threshold 3.5
- **neutral**: threshold sobe para 4.0; posição padrão × 0.5 (exibido no card)
- **risk_off**: `renderDashboard()` em modo Sinais mostra banner vermelho + zero sinais de compra; Lista ainda exibe os dados mas sem badge "Alta Convicção"; Simulador mostra aviso

#### Indicador visual no header

Entre a barra de navegação e os seg-btns, adicionar:
```html
<div id="regimeIndicator" style="...">
  🟢 Mercado Favorável — sinais ativos
</div>
```

Atualizado após cada varredura.

**Acceptance Criteria:**
- [ ] `calcMarketRegime()` retorna `risk_on` / `neutral` / `risk_off` baseado em BOVA11.SA.
- [ ] Indicador de regime visível no header em todas as views (Sinais, Lista, Simulador).
- [ ] Em `risk_off`: nenhum sinal aparece com badge "Alta Convicção"; banner explica motivo.
- [ ] Em `neutral`: sinais com score < 4.0 aparecem como "Monitorar" independente do score original.
- [ ] Regime é recalculado a cada varredura e persiste em `state.marketRegime`.
- [ ] Link para módulo de educação US-228 aparece no banner de RISK_OFF.

**Depends on:** US-222 (threshold logic), US-228 (training module)
**Sprint:** 31 · **Effort:** 4h · **Priority:** 🔴 High · **Epic:** 52

---

### US-225 — Capital Composto + Caixa Rende CDI no Simulador

**Como** usuário do Simulador,
**Quero** que meus ganhos sejam reinvestidos automaticamente nas próximas posições e que o capital parado renda CDI —
**Para que** o Simulador reflita como funciona um investimento real e eu veja o efeito do juro composto ao longo do tempo.

**O que muda para o usuário:**

Hoje o Simulador usa R$100 fixo por posição independente de ganhos anteriores. Após esta story:

1. **Compounding**: posição = 10% do capital atual. Se o usuário começou com R$1.000 e tem agora R$1.200, cada posição é R$120 — os ganhos trabalham para gerar mais ganhos.

2. **Caixa rende CDI**: quando menos de 10 posições estão abertas, o capital parado aparece com um rendimento estimado baseado na taxa CDI atual (~13,75% a.a.). Exibido como: `"R$400 em caixa · rendendo ~R$0,15/dia (CDI)"`.

3. **Comparativo honesto**: o Simulador passa a mostrar a comparação correta entre a estratégia e o CDI — antes, o caixa parado rendia zero no cálculo, subestimando o retorno real.

**Implementação — `stock-dashboard.html` (Simulador):**

```js
const CDI_ANNUAL = 0.1375;  // configurável — reavaliar a cada sprint
const CDI_DAILY  = Math.pow(1 + CDI_ANNUAL, 1/252) - 1;

// Em vez de POSITION_SIZE fixo:
function calcPositionSize(equity) {
  return Math.floor(equity * 0.10 / 10) * 10; // 10% do equity, arredondado p/ R$10
}

// Rendimento diário do caixa
function applyIdleCDI(state, daysElapsed) {
  const deployed = state.openPositions.reduce((s,p) => s + p.cost, 0);
  const idle = state.equity - deployed;
  state.equity += idle * CDI_DAILY * daysElapsed;
}
```

**UI — painel de capital no Simulador:**

```
Capital total:    R$1.243,80
  ├ Posições abertas:  R$840  (6 posições × ~R$140)
  └ Caixa (CDI):       R$403,80  +R$0,15/dia estimado
Tamanho por posição: R$124 (10% do capital)
```

**Acceptance Criteria:**
- [ ] Tamanho de posição = 10% do equity atual (não R$100 fixo).
- [ ] Capital parado acumula rendimento CDI diário proporcional ao período simulado.
- [ ] Painel de capital mostra split posições / caixa com rendimento estimado.
- [ ] Comparativo CDI no Simulador usa o mesmo CDI_ANNUAL como linha de referência (não zero).
- [ ] Módulo de educação US-228 linkado via "?" no painel de capital.

**Depends on:** US-218 (Simulador base), US-228 (training module)
**Sprint:** 32 · **Effort:** 3h · **Priority:** 🔴 High · **Epic:** 52

---

### US-226 — Tamanho de Posição por Qualidade + Limite por Setor

**Como** usuário que segue múltiplos sinais simultaneamente,
**Quero** que o app aposte mais nos sinais de maior qualidade e menos nos de maior risco —
**Para que** as posições com maior probabilidade de ganho pesem mais no meu resultado final.

**O que muda para o usuário:**

Hoje todos os sinais recebem o mesmo tamanho (R$100, ou 10% após US-225). Após esta story, o usuário vê no card de cada sinal e no Simulador:

```
WEGE3  score 4.5  → Posição: R$156  (alta convicção, baixa vol)
PETR4  score 3.5  → Posição: R$72   (convicção mínima, vol elevada)
```

E se dois sinais do mesmo setor já estiverem abertos:
```
PRIO3 — ⚠️ Energia já em 22% do capital (limite: 25%) — posição reduzida
```

**Implementação — `stock-dashboard.html`:**

```js
const SECTOR_MAP = {
  'PETR4.SA':'energia','PRIO3.SA':'energia','CSAN3.SA':'energia','UGPA3.SA':'energia','VBBR3.SA':'energia',
  'VALE3.SA':'materiais','SUZB3.SA':'materiais','GGBR4.SA':'materiais','CSNA3.SA':'materiais',
  'ITUB4.SA':'financeiro','BBDC4.SA':'financeiro','BBAS3.SA':'financeiro','B3SA3.SA':'financeiro',
  'ABEV3.SA':'consumo','JBSS3.SA':'consumo','BRFS3.SA':'consumo','SMTO3.SA':'consumo',
  'WEGE3.SA':'industrial','RAIL3.SA':'industrial','EMBR3.SA':'industrial',
  'EQTL3.SA':'utilidades','TAEE11.SA':'utilidades','CPFE3.SA':'utilidades','CMIG4.SA':'utilidades','SBSP3.SA':'utilidades','ELET3.SA':'utilidades',
  'VIVT3.SA':'telecom','TIMS3.SA':'telecom',
  'MGLU3.SA':'varejo','LREN3.SA':'varejo','PETZ3.SA':'varejo',
  'RADL3.SA':'saude','HAPV3.SA':'saude',
  'TOTS3.SA':'tecnologia',
  'SLCE3.SA':'agro','AGRO3.SA':'agro','MRFG3.SA':'agro',
  'MULT3.SA':'imoveis','RENT3.SA':'imoveis',
};

function calcAdjustedSize(baseSize, score, atrPct, ticker, openPositions, equity) {
  // Score multiplier
  const scoreMult = score >= 4.5 ? 1.50 : score >= 4.0 ? 1.20 : score >= 3.75 ? 1.00 : 0.70;

  // Volatility normalisation (target 2.2% ATR as baseline)
  const volMult = Math.min(Math.max(0.022 / (atrPct || 0.022), 0.6), 1.4);

  // Sector cap (25% of equity max per sector)
  const sector = SECTOR_MAP[ticker];
  const sectorExposure = openPositions
    .filter(p => SECTOR_MAP[p.ticker] === sector)
    .reduce((s, p) => s + p.cost, 0);
  const sectorMult = (sectorExposure / equity) >= 0.25 ? 0.0 : 1.0; // block if at cap

  return Math.round(baseSize * scoreMult * volMult * sectorMult / 10) * 10;
}
```

**UI — card de sinal:**

Adicionar abaixo do badge de sinal:
```
Posição sugerida: R$124
  Score 4.0 ↑  ·  Vol normal  ·  Setor: 12% do capital
```

Se setor em limite: `⚠️ Setor Energia no limite (25%) — sinal postergado`

**Acceptance Criteria:**
- [ ] `calcAdjustedSize()` combina score × vol × setor corretamente.
- [ ] Score 3.5 em ação volátil resulta em posição menor que base; score 4.5 em ação estável resulta em maior.
- [ ] Setor no limite (≥ 25% do equity) → posição bloqueada com explicação.
- [ ] SECTOR_MAP cobre todos os 40 ativos do universo Brasil.
- [ ] Posição sugerida visível no card do sinal e no Simulador.
- [ ] Módulo US-228 linkado via tooltip "Como calculamos o tamanho?".

**Depends on:** US-225 (equity base), US-222 (score), US-228 (training)
**Sprint:** 32 · **Effort:** 4h · **Priority:** 🟡 Medium · **Epic:** 52

---

## Epic 53 — Educação: Estratégia Avançada

### US-227 — Módulo "Saída Inteligente — Stop Móvel e o Prazo de 20 Dias"

**Como** usuário que nunca usou stop ou saída programada,
**Quero** entender por que o app sugere sair em 20 dias e o que é um stop móvel —
**Para que** eu siga as saídas com confiança em vez de ignorá-las por falta de entendimento.

**Contexto educacional:**

O maior erro do investidor iniciante não é entrar errado — é não saber quando sair. Segurar um papel que caiu esperando "voltar" é o comportamento que transforma pequenas perdas em grandes. Este módulo explica a lógica de saída do Momentum de forma que qualquer pessoa entenda, sem jargão financeiro.

**Conteúdo do módulo (em PT-BR, tom de conversa):**

> **Por que sair em 20 dias?**
>
> O Momentum analisou 5 anos de histórico de 33 ações brasileiras. Descobrimos que os sinais de Alta Convicção geram o maior retorno médio nos primeiros 20 pregões após a entrada. Depois disso, a probabilidade de ganho começa a cair — o movimento já aconteceu.
>
> 20 dias = aproximadamente 1 mês de pregão. É tempo suficiente para o mercado "digerir" o sinal, mas não tanto que outros fatores comecem a dominar.
>
> **O que é um stop móvel?**
>
> Imagine que você comprou WEGE3 a R$40. O papel sobe para R$46. Um stop fixo travaria sua saída em R$38 (abaixo da entrada). Mas com o stop móvel, ele sobe junto: agora protege em R$43. Se o papel continuar subindo para R$50, o stop sobe para R$47.
>
> O stop móvel nunca desce. Só sobe. Assim você protege os ganhos acumulados sem precisar monitorar o papel o dia todo.
>
> **E se o stop for atingido antes dos 20 dias?**
>
> Sai. Sem hesitação. O stop foi calculado sobre o ATR — a volatilidade normal do papel. Se ele caiu abaixo do stop, algo mudou. O sinal foi invalidado. Não faz sentido esperar os 20 dias se o mercado já mostrou que estava errado.
>
> **Resumo:**
> ✅ Saia no 20º pregão se o stop não tiver sido atingido
> ✅ Saia antes se o stop móvel for tocado
> ✅ O app avisa os dois — você só precisa agir

Adicionar exemplos visuais (mini-chart ASCII ou tabela simples) mostrando:
- Trade vencedor: entrada → stop sobe junto → saída no topo
- Trade perdedor: entrada → cai → stop atingido no dia 7 → saída protegida

**Acceptance Criteria:**
- [ ] Módulo registrado em COURSE_MODULES sob categoria "Estratégia".
- [ ] Ícone: 🛡️, nome: "Saída Inteligente".
- [ ] Conteúdo em PT-BR e EN (keys `edu_smartExitBody` em `static/i18n.js`).
- [ ] Link para o módulo aparece no card de posição rastreada (tooltip "?").
- [ ] Módulo menciona explicitamente os 20 dias e o cálculo 2×ATR do stop.

**Sprint:** 30 · **Effort:** 2h · **Priority:** 🟡 Medium · **Epic:** 53

---

### US-228 — Módulo "Regime de Mercado — Quando Investir e Quando Esperar"

**Como** usuário que vê o indicador de regime na tela,
**Quero** entender o que significa 🟢 / 🟡 / 🔴 e por que o app para de mostrar compras em alerta —
**Para que** eu confie no sistema em vez de ficar frustrado quando não aparecem sinais.

**Contexto educacional:**

A maior surpresa para usuários novos será ver a tela de Sinais vazia durante um período de RISK_OFF. Sem explicação, a reação natural é "o app quebrou" ou "não funciona". Este módulo transforma essa frustração em confiança.

**Conteúdo do módulo (em PT-BR, tom de conversa):**

> **O que é regime de mercado?**
>
> O Momentum monitora o índice IBOV (via BOVA11) para entender se o mercado como um todo está em alta, lateral ou em queda. Chamamos isso de "regime".
>
> Mesmo a melhor ação, com todos os indicadores positivos, tende a cair durante uma queda do IBOV. É como nadar contra a maré: você pode ser um ótimo nadador, mas a maré mais forte.
>
> **Os três estados:**
>
> 🟢 **Favorável** — IBOV acima da média de 200 dias, tendência clara de alta. Os sinais de Alta Convicção têm historicamente 60–65% de acerto neste regime.
>
> 🟡 **Neutro** — IBOV em zona de indefinição. O app só mostra sinais com score muito alto (≥ 4.0) e sugere posições menores. É como dirigir em neblina: pode continuar, mas devagar.
>
> 🔴 **Em Alerta** — IBOV abaixo da média de 200 dias ou caindo mais de 15% do topo recente. O app pausa os sinais de compra. Em vez de entrar em posições de risco, o capital parado rende CDI.
>
> **O que fazer em cada estado?**
>
> - 🟢: siga os sinais normalmente
> - 🟡: seja seletivo, prefira scores ≥ 4.0, posições menores
> - 🔴: não compre. Revise posições abertas. Deixe o caixa render.
>
> **Isso não é "market timing"?**
>
> Market timing significa tentar prever o topo e o fundo exato. O filtro de regime não faz isso — ele segue regras objetivas baseadas em médias móveis do IBOV. Não é uma aposta sobre o futuro; é uma leitura do presente.
>
> **Dado histórico:** Em 2022, o filtro de regime teria pausado os sinais de Alta Convicção durante ~60% do ano. As posições que seriam abertas nesse período perderam em média 18% em 20 dias. Ficar fora valeu +CDI.

**Acceptance Criteria:**
- [ ] Módulo registrado em COURSE_MODULES sob categoria "Estratégia".
- [ ] Ícone: 🌡️, nome: "Regime de Mercado".
- [ ] Conteúdo em PT-BR e EN (keys `edu_marketRegimeBody` em `static/i18n.js`).
- [ ] Link para o módulo aparece no banner de RISK_OFF (linha "Saiba mais →").
- [ ] Módulo menciona BOVA11, SMA200, os três estados e o dado histórico de 2022.
- [ ] Seção "O que fazer em cada estado?" exibe os três estados com ícones coloridos.

**Sprint:** 31 · **Effort:** 2h · **Priority:** 🔴 High · **Epic:** 53

---

### US-229 — Módulo "Gestão de Capital — Tamanho de Posição, Juros Compostos e Diversificação"

**Como** usuário que quer maximizar seus retornos com segurança,
**Quero** entender por que o Momentum varia o tamanho das posições e como os juros compostos funcionam na prática —
**Para que** eu compreenda que não é aleatório — há uma lógica matemática que protege o capital e potencializa os ganhos.

**Contexto educacional:**

Este é o módulo mais poderoso e mais ignorado da educação financeira. A maioria dos investidores foca em "qual ação comprar" e ignora "quanto comprar". Mas o *quanto* determina mais o resultado final do que o *qual*. Este módulo explica três conceitos que o app usa silenciosamente e que o usuário merece entender.

**Conteúdo do módulo (em PT-BR, tom de conversa):**

> **1. Por que o tamanho da posição muda?**
>
> Imagine dois sinais de Alta Convicção no mesmo dia:
> - WEGE3: score 4.5, volatilidade baixa (oscila ~1.5%/dia)
> - PETR4: score 3.5, volatilidade alta (oscila ~3%/dia)
>
> Se você aposta o mesmo valor em ambos, está arriscando o dobro em PETR4 — porque ela pode cair o dobro em um dia ruim. O Momentum ajusta automaticamente: menos dinheiro onde há mais risco, mais onde há mais qualidade.
>
> Regra simples: **apostamos mais quando temos mais certeza e o papel é mais estável.**
>
> **2. O que é juro composto e por que importa?**
>
> Se você tem R$1.000 e ganha 10%, tem R$1.100. No próximo round, você investe R$110 (10% de R$1.100) — não R$100. Esse reinvestimento dos ganhos é o juro composto.
>
> Sem composto: R$1.000 → R$1.521 em 5 anos (nosso backtest).
> Com composto: R$1.000 → ~R$1.900 em 5 anos — sem mudar nenhum sinal.
>
> A diferença de R$379 não veio de sinais melhores. Veio de usar os ganhos para gerar mais ganhos.
>
> Einstein chamou o juro composto de "a oitava maravilha do mundo". Quem entende, ganha. Quem não entende, paga.
>
> **3. Por que limitar a exposição por setor?**
>
> Se você tem PETR4, PRIO3 e CSAN3 abertas ao mesmo tempo (todas do setor Energia), você não tem três apostas — você tem uma. Quando o petróleo cai, as três caem juntas.
>
> O Momentum limita Energia (e qualquer outro setor) a no máximo 25% do seu capital. Isso garante que uma notícia ruim de um setor não destrua seu portfólio inteiro.
>
> **O que "diversificação real" significa:**
> ❌ Ter 10 ações do setor financeiro não é diversificação
> ✅ Ter ações de 5 setores diferentes com limite de 25% cada é diversificação
>
> **Resumo prático:**
> - O app calcula o tamanho certo automaticamente
> - Seus ganhos são reinvestidos — deixe o composto trabalhar
> - Nunca mais de 25% num setor — o app bloqueia quando necessário

**Acceptance Criteria:**
- [ ] Módulo registrado em COURSE_MODULES sob categoria "Estratégia".
- [ ] Ícone: 💰, nome: "Gestão de Capital".
- [ ] Conteúdo em PT-BR e EN (keys `edu_capitalMgmtBody` em `static/i18n.js`).
- [ ] Exemplo numérico do juro composto (R$1.521 vs R$1.900) incluído no texto.
- [ ] Seção de diversificação inclui o exemplo ❌/✅.
- [ ] Link para o módulo aparece no card de sinal (tooltip "Como calculamos o tamanho?").
- [ ] Módulo menciona WEGE3 vs PETR4 como exemplo concreto de ajuste por volatilidade.

**Sprint:** 32 · **Effort:** 2h · **Priority:** 🟡 Medium · **Epic:** 53

---

## Sprint 33 — UX Polish & Education Completeness

### US-230 — Posição Sugerida como Percentual (não R$)

**Como** usuário que vê os cards de sinal,
**Quero** que a posição sugerida seja exibida como percentual do capital —
**Para que** a recomendação seja útil independentemente do tamanho do meu portfólio real.

**O que muda:**

Hoje o card exibe `"Posição sugerida: R$ 200,00"`, que pressupõe que o usuário tem o mesmo capital do Simulador. Após esta story:

```
Posição: 12% do capital  ·  Score 4.3 · Setor: consumo  (?)
```

O percentual é derivado do multiplicador ajustado: `adjMult = scoreMult × volMult` (sem o sectorMult, que bloqueia e já tem aviso próprio). Exemplos:
- Score 4.5, vol baixa (1.4×): `1.50 × 1.4 = 2.1×` → base 10% × 2.1 = 21% → arredondar para 20%
- Score 3.5, vol alta (0.7×): `0.70 × 0.7 = 0.49×` → base 10% × 0.49 = 4.9% → arredondar para 5%
- Clamp final: mínimo 5%, máximo 20%

```js
function calcPositionPct(score, atrPct) {
  const scoreMult = score >= 4.5 ? 1.50 : score >= 4.0 ? 1.20 : score >= 3.75 ? 1.00 : 0.70;
  const volMult   = Math.min(Math.max(0.022 / (atrPct || 0.022), 0.6), 1.4);
  const pct       = Math.round(10 * scoreMult * volMult / 5) * 5; // nearest 5%
  return Math.min(20, Math.max(5, pct));
}
```

**Acceptance Criteria:**
- [ ] Card mostra `"Posição: X% do capital"` em vez de valor em R$.
- [ ] Percentual arredondado ao múltiplo de 5% mais próximo (5%, 10%, 15%, 20%).
- [ ] Setor e (?) tooltip mantidos.
- [ ] Aviso de setor no limite mantido (⚠️ Setor X no limite de 25%).
- [ ] Nenhum valor em R$ exibido no card de sinal.

**Sprint:** 33 · **Effort:** 1h · **Priority:** 🔴 High · **Epic:** 52

---

### US-231 — Capital Inicial Configurável no Simulador

**Como** usuário do Simulador,
**Quero** digitar o valor real do meu capital para simular —
**Para que** os resultados reflitam meu portfólio real e não um valor fictício padrão.

**O que muda:**

No topo do painel do Simulador, um campo editável:

```
Capital inicial: R$ [_________]   [Simular]
```

Ao clicar em Simular (ou pressionar Enter), o campo persiste em `localStorage` e recalcula toda a simulação com o novo capital base.

**Implementação:**
- Novo state: `simCapital` — lido de `localStorage.getItem('momentum_sim_capital') || 1000`
- Input numérico no topo do Simulador com label "Capital inicial (R$)"
- Ao mudar: `state.simCapital = val; localStorage.setItem('momentum_sim_capital', val); renderSimulator()`
- `calcPositionSize` usa `state.simCapital` como base ao invés de `_simAmount`

**Acceptance Criteria:**
- [ ] Campo de capital inicial visível no topo do Simulador.
- [ ] Valor padrão: R$ 1.000.
- [ ] Valor persiste entre sessões via localStorage.
- [ ] Painel de capital e posição sugerida recalculam ao alterar o valor.
- [ ] Input aceita valores entre R$ 100 e R$ 1.000.000.

**Sprint:** 33 · **Effort:** 1h · **Priority:** 🔴 High · **Epic:** 52

---

### US-232 — Histórico Responsivo no Mobile

**Como** usuário mobile,
**Quero** que a aba Histórico seja legível em telas pequenas (375px) —
**Para que** eu possa consultar os dados de backtest no celular sem conteúdo cortado.

**O que muda:**

Os cards de estatística (Win rate, Avg return, etc.) e a tabela de breakdown por ação estão sendo cortados horizontalmente no mobile. Correções:

1. **Stat cards**: usar `flex-wrap: wrap` e `min-width: 140px` para quebrarem em 2×2 em vez de 1×4.
2. **Tabela per-stock**: envolver em `<div style="overflow-x:auto">` para scroll horizontal.
3. **Tabela de tier comparison**: mesmo tratamento de overflow-x.
4. **Texto de explicação**: garantir `word-break: break-word` e padding adequado.

**Acceptance Criteria:**
- [ ] Em 375px, stat cards quebram em grade 2×2 sem overflow.
- [ ] Tabela per-stock tem scroll horizontal quando necessária.
- [ ] Nenhum conteúdo cortado na aba Histórico em mobile.
- [ ] Layout desktop não afetado.

**Sprint:** 33 · **Effort:** 1h · **Priority:** 🟡 Medium · **Epic:** 50

---

### US-233 — Módulo Educacional: ATR (Average True Range)

**Como** usuário que vê referências a ATR nos cards e no Simulador,
**Quero** um módulo educacional que explique o que é ATR —
**Para que** eu entenda por que ele é usado para dimensionar posições e definir stops.

**Conteúdo do módulo:**

- O que é ATR: medida de volatilidade diária em R$ ou %
- Como é calculado: True Range = max(High–Low, |High–Close anterior|, |Low–Close anterior|); ATR = média de 14 dias
- Como o Momentum usa ATR: (a) trailing stop = highSince − 2×ATR; (b) dimensionamento de posição — ações com ATR% alto recebem posição menor
- Exemplo concreto: PETR4 com ATR de R$1,20 sobre preço de R$38 = 3.1% → posição reduzida; WEGE3 com ATR de R$0,60 sobre R$40 = 1.5% → posição normal
- Por que 2×ATR para o stop: captura ruído normal sem sair cedo demais

**Acceptance Criteria:**
- [ ] Módulo registrado em COURSE_MODULES sob "Análise Técnica" (após ADX).
- [ ] Ícone: 📏, nome: "ATR".
- [ ] Conteúdo em PT-BR e EN (keys `edu_atrBody` em `static/i18n.js`).
- [ ] Exemplo PETR4 vs WEGE3 incluído.
- [ ] Fórmula do True Range explicada visualmente.
- [ ] Ligação com trailing stop e dimensionamento de posição explicitada.

**Sprint:** 33 · **Effort:** 2h · **Priority:** 🟡 Medium · **Epic:** 48

---

### US-234 — Sinal Momentum: Todos os 9 Critérios Explicados

**Como** usuário que quer entender como o app decide comprar ou aguardar,
**Quero** que o módulo "Sinal Momentum" explique todos os 9 critérios do scoring v3 —
**Para que** eu saiba exatamente o que está por trás de cada recomendação.

**O que muda:**

O módulo atual (`edu_momentumSignalBody`) menciona os critérios de forma genérica. Esta story reescreve o corpo para cobrir todos os 9 explicitamente, com pontuação e lógica:

| # | Critério | Pontos | Lógica |
|---|----------|--------|--------|
| 1 | Preço > SMA50 | +0.75 | Tendência de curto prazo favorável |
| 2 | Preço > SMA200 | +0.75 | Tendência de longo prazo favorável |
| 3 | MACD > 0 e histograma > 0 | +1.0 (ou +0.5) | Momentum de alta confirmado |
| 4 | RSI 50–65 | +1.0 | Zona ideal: subindo sem sobrecompra |
| 5 | ADX > 25 | +0.5 | Tendência com força |
| 6 | Volume > 1.2× média | +0.5 | Confirmação institucional |
| 7 | SMA200 subindo (slope) | +0.5 | Saúde estrutural de longo prazo |
| 8 | Distância do topo < 20% | +0.5 | Não está em zona de esgotamento |
| 9 | RSI slope positivo | +0.5 | Momentum de RSI acelerando |
| Gate | Weaknesses ≥ 3 | Score limitado a 1.0 | Proteção estrutural |

Thresholds: ≥ 3.5 = Alta Convicção 🟢; 2.5–3.4 = Monitorar 👁; < 2.5 = Aguardar/Venda.

**Acceptance Criteria:**
- [ ] Todos os 9 critérios listados com pontuação e lógica.
- [ ] Structural gate explicado (weaknesses ≥ 3 → score cap 1.0).
- [ ] Tabela de thresholds incluída (≥3.5, 2.5–3.4, <2.5).
- [ ] RSI "zona ideal" (50–65) e penalidades (>75, <25) explicadas.
- [ ] ATR% e volume ratio explicados como critérios 8 e 9 (com link para módulo ATR).
- [ ] Conteúdo atualizado em PT-BR e EN.

**Sprint:** 33 · **Effort:** 2h · **Priority:** 🔴 High · **Epic:** 53

---

### US-235 — Acompanhados: Visualização em Tabela

**Como** usuário que acompanha múltiplos picks simultaneamente,
**Quero** alternar entre a visualização em cards e em tabela nos Acompanhados —
**Para que** eu possa escanear rapidamente todas as posições abertas numa única visão compacta.

**O que muda:**

Um toggle no cabeçalho de Acompanhados: `[🃏 Cards] [📋 Tabela]`

A tabela mostra por linha:
| Ticker | Entrada | Preço entrada | Preço atual | P&L% | Stop móvel | Dias | Status |
|--------|---------|---------------|-------------|------|------------|------|--------|
| WEGE3  | 12/mai  | R$42,10       | R$44,80     | +6.4%| R$41,20    | 8/20 | 🟢 Em curso |
| MGLU3  | 05/mai  | R$18,30       | R$16,90     | -7.7%| R$16,10    | 15/20| ⚠️ Prazo |

- P&L% em verde se positivo, vermelho se negativo
- Dias: `8/20` com barra de progresso mini (inline)
- Status: replica o badge dos cards (Em curso / ⚠️ Prazo / 🔴 Stop)
- Toggle persiste em localStorage (`momentum_tracked_view`)
- Em mobile: tabela usa scroll horizontal

**Acceptance Criteria:**
- [ ] Toggle [Cards] / [Tabela] visível no header de Acompanhados.
- [ ] Tabela mostra todas as colunas: Ticker, Entrada, P. Entrada, P. Atual, P&L%, Stop, Dias, Status.
- [ ] P&L% colorido (verde/vermelho).
- [ ] Dias exibe `N/20` com mini barra inline.
- [ ] Toggle persiste em localStorage.
- [ ] Mobile: tabela com overflow-x scroll.
- [ ] Nenhuma funcionalidade removida dos cards.

**Sprint:** 33 · **Effort:** 2h · **Priority:** 🟡 Medium · **Epic:** 52

---

## Sprint 34 — Performance Dashboard & Discovery

### US-236 — Histórico de Operações Encerradas (Closed Trades Log)

**Como** usuário que acompanha picks,
**Quero** ver um registro de todas as operações encerradas com resultado —
**Para que** eu possa avaliar minha performance real ao longo do tempo.

**O que muda:**

Quando um pick sai por stop ou prazo, em vez de desaparecer, é movido para uma lista `state.closedTrades`. A seção Acompanhados ganha uma terceira aba: **Abertas | Encerradas | Resumo**.

A aba **Encerradas** exibe uma tabela:

| Ticker | Entrada | Saída | P. Entrada | P. Saída | P&L% | Motivo |
|--------|---------|-------|------------|----------|------|--------|
| WEGE3  | 12/mai  | 01/jun | R$42,10   | R$46,30  | +10.0% | ⏱ Prazo |
| MGLU3  | 05/mai  | 18/mai | R$18,30   | R$16,10  | −12.0% | 🔴 Stop |

- P&L% colorido (verde/vermelho)
- Motivo: "⏱ Prazo" ou "🔴 Stop Móvel"
- Linha de totais no rodapé: N operações · X% win rate · Y% P&L médio

**Implementação:**
- `state.closedTrades = JSON.parse(localStorage.getItem('momentum_closed') || '[]')`
- Em `updateTrackedExits()`, quando um pick recebe `exitSignal`, em vez de apenas marcar, mover para `closedTrades` com `{ ...pick, exitPrice: currentPrice, exitDate: today }`
- `renderClosedTrades()` gera a tabela; `renderTrackedPicks()` mostra as abas

**Acceptance Criteria:**
- [ ] Picks encerrados movidos para `state.closedTrades` com `exitPrice` e `exitDate`.
- [ ] Aba "Encerradas" mostra tabela com todas as colunas.
- [ ] P&L% calculado como `(exitPrice − entryPrice) / entryPrice × 100`.
- [ ] Rodapé mostra: N operações, win rate%, P&L médio%.
- [ ] Dados persistidos em localStorage.
- [ ] Aba "Abertas" mantém o comportamento atual (cards + tabela toggle).

**Sprint:** 34 · **Effort:** 3h · **Priority:** 🔴 High · **Epic:** 52

---

### US-237 — Alvo de Preço no Card de Sinal

**Como** usuário que avalia um sinal,
**Quero** ver um alvo de preço estimado junto com o stop —
**Para que** eu possa avaliar a relação risco/retorno antes de entrar na operação.

**O que muda:**

No card de sinal (buy/watchlist), abaixo do "Posição: X% do capital", adicionar:

```
Alvo: R$47,20 (+8.3%)  ·  Stop inicial: R$42,10 (−3.1%)  ·  R/R: 2.7×
```

- **Alvo** = preço atual + 2 × ATR (retorno esperado em condição favorável)
- **Stop inicial** = preço atual − 2 × ATR (perda máxima no stop)
- **R/R** (Reward/Risk) = (alvo − preço) / (preço − stop)

**Acceptance Criteria:**
- [ ] Alvo, stop inicial e R/R exibidos no card para sinais buy/watchlist.
- [ ] Alvo em R$ e percentual positivo (verde).
- [ ] Stop inicial em R$ e percentual negativo (vermelho).
- [ ] R/R arredondado a 1 casa decimal.
- [ ] Linha oculta quando ATR não disponível.

**Sprint:** 34 · **Effort:** 1h · **Priority:** 🟡 Medium · **Epic:** 52

---

### US-238 — Resumo de Performance (Portfolio Analytics)

**Como** usuário com histórico de operações,
**Quero** ver um painel de performance consolidado —
**Para que** eu entenda se a estratégia está funcionando para mim especificamente.

**O que muda:**

Aba **Resumo** na seção Acompanhados:

```
┌─────────────────────────────────────────────────────────┐
│  Operações encerradas: 12        Abertas: 3             │
│  Win rate:  58.3%                P&L médio: +4.2%       │
│  Melhor:  WEGE3 +18.4%           Pior: MGLU3 −14.1%    │
│  Encerradas por prazo: 7         Por stop: 5            │
└─────────────────────────────────────────────────────────┘
Exposição aberta por setor:
  ████████░░  Energia     40%  ⚠️ próximo do limite
  ████░░░░░░  Financeiro  20%
  ██░░░░░░░░  Consumo     10%
```

**Implementação:**
- Calcular a partir de `state.closedTrades` e `state.trackedPicks`
- Barra de exposição por setor usa `SECTOR_MAP` e `state.trackedPicks`
- Aviso visual quando setor ≥ 20% (amarelo) ou ≥ 25% (vermelho)

**Acceptance Criteria:**
- [ ] Painel mostra: total encerradas, abertas, win rate, P&L médio, melhor, pior.
- [ ] Breakdown por motivo de saída (prazo vs stop).
- [ ] Barra de exposição por setor das posições abertas.
- [ ] Aviso de concentração quando setor ≥ 20% (amarelo) ou ≥ 25% (vermelho).
- [ ] Painel vazio mostra mensagem "Nenhuma operação encerrada ainda".

**Depends on:** US-236 (closedTrades), US-226 (SECTOR_MAP)
**Sprint:** 34 · **Effort:** 2h · **Priority:** 🟡 Medium · **Epic:** 52

---

### US-239 — Buscador de Ativo (Manual Stock Lookup)

**Como** usuário que quer analisar uma ação específica,
**Quero** digitar o ticker de qualquer ativo e ver seu sinal imediatamente —
**Para que** eu não precise aguardar o scan completo do universo.

**O que muda:**

Um campo de busca no topo da tela principal (ou no modo Lista):

```
🔍 Buscar ativo...   [PETR4]   [Analisar]
```

Ao clicar em Analisar:
1. `fetchHistory(ticker + '.SA')` busca os candles
2. Roda `analyze()` e `pickSignal()` normalmente
3. Exibe um card de resultado idêntico aos do scan (com score, Por quê, posição, alvo, stop)
4. O resultado aparece no topo da lista ou num modal, com badge "🔍 Busca manual"

**Acceptance Criteria:**
- [ ] Campo de busca aceita qualquer ticker (com ou sem `.SA`).
- [ ] Resultado exibido em até 3 segundos com spinner durante fetch.
- [ ] Card idêntico ao do scan normal (score, sinal, Por quê, posição %, alvo, stop).
- [ ] Badge "🔍 Busca manual" diferencia do scan.
- [ ] Erro amigável se ticker não encontrado ("Ativo não encontrado ou sem dados suficientes").
- [ ] Funciona mesmo sem scan prévio.

**Sprint:** 34 · **Effort:** 3h · **Priority:** 🟡 Medium · **Epic:** 49

---

### US-240 — Exposição por Setor Visível nos Cards de Sinal

**Como** usuário que está montando posições,
**Quero** ver no card de sinal quanto do meu capital já está alocado naquele setor —
**Para que** eu tome a decisão de entrar ou não com contexto de concentração.

**O que muda:**

No card de sinal (buy/watchlist), junto à linha de posição sugerida:

```
Posição: 15% do capital  ·  Score 4.3 · Setor: energia  (?)
Energia: ████░░░░░░  18% alocado  (limite: 25%)
```

- Barra preenchida proporcionalmente (18/25 = 72% da barra)
- Verde se < 15%, amarelo se 15–24%, vermelho se ≥ 25% (bloqueado)
- Só aparece se o usuário tiver picks abertos naquele setor

**Acceptance Criteria:**
- [ ] Barra de setor aparece no card apenas quando há posições abertas naquele setor.
- [ ] Percentual calculado como `(exposição_setor / simCapital) × 100`.
- [ ] Cores: verde < 15%, amarelo 15–24%, vermelho ≥ 25%.
- [ ] Barra e percentual atualizados a cada render.
- [ ] Nenhuma barra exibida se setor sem posições abertas.

**Depends on:** US-226 (SECTOR_MAP, calcAdjustedSize), US-236 (trackedPicks equity base)
**Sprint:** 34 · **Effort:** 2h · **Priority:** 🟡 Medium · **Epic:** 52

---

## Sprint Roadmap

| Sprint | Epics | Stories | Theme | Status |
|--------|-------|---------|-------|--------|
| 18 | 38, 40, 43 | US-173–175, US-177, US-191, US-192, US-201 | Lista Interatividade, CPF toggle, tradução "Positions", fix DARF link, B3 watchlist prices | ✅ Done |
| 19 | 39, 44, 45, 46 | US-176, US-207, US-208, US-209 | Acompanhados redesign + ADMIN_EMAIL env var + delete account PT fix + signup 500 fix | ✅ Done |
| 20 | 47 | US-210, US-211, US-212, US-213, US-214 | Signal Engine v2 — scoring fix, ATR exits, score display, Por que enrichment, indicator columns | ✅ Done |
| 26 | 48 | US-215, US-216, US-217, US-218, US-219 | Education & Onboarding — Primeiros Passos, Sinal Momentum module, CDB/CDI module, Simulador scorecard, SMA50/200 split scoring | ✅ Done |
| 23 | 43 | US-193–200 | Security & Code Quality — Critical + Major | ✅ Done |
| 27 | 49 | US-220 | Lista: auto-scan + all signals displayed | ✅ Done |
| 29 | 51 | US-222 | Signal v3: Monitorar tier, 3 quality criteria, full app consistency | ✅ Done |
| 28 | 50 | US-221 | Backtest: Histórico tab — win rate and avg return from historical BUY signals | ✅ Done |
| 30 | 52, 53 | US-223, US-227 | Saída Inteligente: trailing stop + 20-day exit + training module | ✅ Done |
| 31 | 52, 53 | US-224, US-228 | Regime de Mercado: IBOV filter + training module | 📋 Planned |
| 32 | 52, 53 | US-225, US-226, US-229 | Capital: compounding + CDI accounting + position sizing + sector cap + training module | ✅ Done |
| 33 | 48, 50, 52, 53 | US-230, US-231, US-232, US-233, US-234, US-235 | UX Polish & Education Completeness: % position sizing, sim capital input, mobile Histórico fix, ATR edu, Signal v3 full criteria, Acompanhados table view | ✅ Done |
| 34 | 49, 52 | US-236, US-237, US-238, US-239, US-240 | Performance Dashboard & Discovery: closed trades log, price target on cards, portfolio analytics, manual stock lookup, sector exposure bar | 📋 Planned |
| 24 | 43 | US-202–206 | Security & Code Quality — Minor | ✅ Done |
| 25 | 41 | US-178–182, US-188 | Admin Dashboard Fase 1: KPIs, User List, Audit Log | 🔒 Parked |
| 21 | 41 | US-183, US-184, US-189 | Admin Fase 2: Consentimento LGPD + Direitos do Titular | 🔒 Parked |
| 22 | 41 | US-185–187 | Admin Fase 3: Export para Parceiros (gate jurídico) | 🔒 Parked |

*Completed sprints → USER_STORIES_COMPLETED.md*
