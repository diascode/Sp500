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

  // 1. Trend structure (SMA50 + SMA200) — max 1.5 pts
  if (above50 && above200) s += 1.5;   // full uptrend
  else if (above50)        s += 0.75;  // partial uptrend (above 50 only)

  // 2. Momentum — MACD value + histogram direction — max 1.0 pt
  if (macd > 0 && macdHist > 0) s += 1.0;  // positive AND accelerating
  else if (macd > 0)             s += 0.5;  // positive but not accelerating

  // 3. RSI — single coherent zone — max 1.0 pt
  if      (rsi >= 50 && rsi <= 65) s += 1.0;   // trend-confirmation zone
  else if (rsi > 65  && rsi <= 70) s += 0.25;  // strong but stretched
  else if (rsi >= 40 && rsi <  50) s -= 0.25;  // weakening momentum

  // 4. Trend strength (ADX) — max 0.5 pts
  if (adx > 25) s += 0.5;

  // 5. Volume confirmation (NEW) — max 0.5 pts
  if (volRatio > 1.2) s += 0.5;   // 20%+ above 20-day average volume

  // Hard guards
  if (!above200) s = Math.min(s, 1.0);  // cap at HOLD in confirmed bear regime
  if (rsi > 75 || rsi < 25) s -= 1.0;  // severe extreme penalty

  return s >= 2.5 ? 'buy' : s >= 1.0 ? 'neutral' : 'sell';
}
```

**Maximum possible score: 4.5 points.**
- Full uptrend (SMA50+200): 1.5
- MACD positive + accelerating: 1.0
- RSI in sweet zone (50–65): 1.0
- ADX > 25: 0.5
- Volume > 1.2×: 0.5

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
Por que: COMPRA (score 3.2/4.5)

✅ Tendência confirmada — preço acima das médias de 50 e 200 dias (alta estrutural)
✅ MACD +0.43 e acelerando — momentum de compra em desenvolvimento
✅ RSI 57 — zona saudável de tendência (50–65), sem sobrecompra
✅ Volume 1.8× acima da média — pressão compradora institucional
⚠️ ADX 21 — tendência ainda fraca (< 25), aguardar confirmação
```

For HOLD:
```
Por que: AGUARDAR (score 1.5/4.5)

✅ Preço acima da SMA50, mas abaixo da SMA200 — tendência parcial
⚠️ MACD +0.12 positivo mas sem aceleração — momentum fraco
⚠️ RSI 47 — abaixo de 50, momentum enfraquecendo
❌ Volume na média — sem convicção direcional
❌ ADX 18 — mercado lateral, sem tendência definida
```

For SELL:
```
Por que: VENDA (score 0.5/4.5)

❌ Preço abaixo das médias de 50 e 200 dias — tendência de baixa
❌ MACD −0.28 negativo — momentum de venda dominante
⚠️ RSI 38 — queda sem sobrevendido extremo, sem sinal de reversão
❌ Volume 0.9× na média — sem pressão compradora
🔴 Regime de mercado: ativo abaixo da SMA200 — sinais de compra bloqueados
```

**Implementation:** Replace `generateWhy()` in `server.js` (or the client-side equivalent) with a structured function that maps each scoring component to a PT-BR sentence using the actual indicator values.

**Acceptance Criteria:**
- Each indicator (SMA trend, MACD, RSI, Volume, ADX) gets its own line with ✅/⚠️/❌ icon.
- Values are shown numerically (RSI 57, MACD +0.43, Volume 1.8×, ADX 28).
- The regime gate is explained if active ("sinais de compra bloqueados — ativo abaixo da SMA200").
- Score is shown in the header line ("COMPRA · 3.2/4.5").
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
| SMA | Tendência (ex: "50+200" / "50" / "—") | Verde se acima de ambas as médias, amarelo se só SMA50, vermelho se abaixo |
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
subtitle: 'Entenda os 5 critérios do scoring v2 e o que significa a pontuação 3.2/4.5.'
```

**Conteúdo do módulo (corpo do texto em PT-BR):**

```
O Momentum avalia cada ação em 5 critérios independentes e soma uma pontuação de 0 a 4.5 pontos.
Acima de 2.5 → COMPRA. Entre 1.0 e 2.5 → AGUARDAR. Abaixo de 1.0 → VENDA.

─── Os 5 Critérios ───

1. Tendência Estrutural (SMA50 + SMA200) — até 1.5 pts
   Preço acima de SMA50 E SMA200 = alta estrutural confirmada → +1.5
   Preço acima apenas da SMA50 = tendência parcial → +0.75
   Preço abaixo das duas médias = baixa → +0

2. Momentum — MACD + Aceleração — até 1.0 pt
   MACD positivo E acelerando (histograma crescendo) → +1.0
   MACD positivo mas estagnado → +0.5
   MACD negativo → +0

3. RSI — Zona de Tendência — até 1.0 pt
   RSI entre 50 e 65 = zona saudável de tendência → +1.0
   RSI entre 65 e 70 = forte mas esticado → +0.25
   RSI entre 40 e 50 = momentum enfraquecendo → −0.25

4. Força da Tendência — ADX — até 0.5 pt
   ADX > 25 = tendência definida → +0.5

5. Confirmação de Volume — até 0.5 pt
   Volume atual > 1.2× a média de 20 dias → +0.5

─── Proteções Adicionais ───

• Gate de regime (SMA200): se o preço estiver abaixo da SMA200,
  o score é limitado a 1.0 — nenhum sinal de COMPRA em bear market confirmado.

• RSI extremo: RSI > 75 ou < 25 aplica penalidade de −1.0 ponto.

─── Exemplo Real ───

PETR4: RSI 57, MACD +0.43 acelerando, ADX 28, Volume 1.8×, acima de SMA50 e SMA200
→ Tendência: +1.5 | MACD: +1.0 | RSI: +1.0 | ADX: +0.5 | Volume: +0.5
→ Score: 4.5/4.5 → COMPRA (convicção máxima)

VALE3: RSI 47, MACD +0.12 estagnado, ADX 19, Volume 0.9×, acima só da SMA50
→ Tendência: +0.75 | MACD: +0.5 | RSI: −0.25 | ADX: +0 | Volume: +0
→ Score: 1.0/4.5 → AGUARDAR (momentum fraco)
```

**Implementation:** Add the new lesson object to the `eduLessons` array in `stock-dashboard.html` and add the corresponding `edu_momentumSignalBody` key to `static/i18n.js` (PT-BR only — English version can be same content for now).

**Acceptance Criteria:**
- [ ] Módulo aparece na lista de lições da Educação.
- [ ] Conteúdo explica os 5 critérios com pontuação e exemplos reais.
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
│  ████████████████░░░  3.8 / 4.5   Alta convicção        │
│                                                         │
│  ✅ Tendência SMA50+200    +1.5 pts                     │
│  ✅ MACD positivo acelerando   +1.0 pts                 │
│  ✅ RSI 57 — zona saudável     +1.0 pts                 │
│  ✅ Volume 1.8× média          +0.5 pts                 │
│  ⚠️ ADX 21 — tendência fraca   +0.0 pts                 │
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
| Tendência SMA | `pA50 && pA200` → +1.5, `pA50` → +0.75 | dinâmico |
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
- [ ] Painel Scorecard aparece para o ativo selecionado mostrando os 5 critérios com pontos e ícone.
- [ ] Barra de progresso visual mostra score/4.5.
- [ ] Label de convicção (Alta/Moderada/Fraco) aparece no painel e no cenário TP.
- [ ] Valores "N/D" para campos ausentes — sem crash.
- [ ] Layout funciona em mobile (scorecard empilha verticalmente).

**Depends on:** US-210 (score em analyze()) — já shipado em Sprint 20.
**Sprint:** 26 · **Effort:** 2h · **Priority:** 🟡 High

---

## Sprint Roadmap

| Sprint | Epics | Stories | Theme | Status |
|--------|-------|---------|-------|--------|
| 18 | 38, 40, 43 | US-173–175, US-177, US-191, US-192, US-201 | Lista Interatividade, CPF toggle, tradução "Positions", fix DARF link, B3 watchlist prices | ✅ Done |
| 19 | 39, 44, 45, 46 | US-176, US-207, US-208, US-209 | Acompanhados redesign + ADMIN_EMAIL env var + delete account PT fix + signup 500 fix | ✅ Done |
| 20 | 47 | US-210, US-211, US-212, US-213, US-214 | Signal Engine v2 — scoring fix, ATR exits, score display, Por que enrichment, indicator columns | ✅ Done |
| 26 | 48 | US-215, US-216, US-217, US-218 | Education & Onboarding — Primeiros Passos, Sinal Momentum module, CDB/CDI module, Simulador scorecard | 📋 Planned |
| 23 | 43 | US-193–201 | Security & Code Quality — Critical + Major | 📋 Planned |
| 24 | 43 | US-202–206 | Security & Code Quality — Minor | 📋 Planned |
| 25 | 41 | US-178–182, US-188 | Admin Dashboard Fase 1: KPIs, User List, Audit Log | 🔒 Parked |
| 21 | 41 | US-183, US-184, US-189 | Admin Fase 2: Consentimento LGPD + Direitos do Titular | 🔒 Parked |
| 22 | 41 | US-185–187 | Admin Fase 3: Export para Parceiros (gate jurídico) | 🔒 Parked |

*Completed sprints → USER_STORIES_COMPLETED.md*
