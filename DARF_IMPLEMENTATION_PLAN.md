# DARF Integration — Research & Implementation Plan

*Research date: May 2026 | Applies to: Brazilian users on MOMENTUM*

---

## Table of Contents

1. [Brazilian Tax Rules — What We Must Implement](#1-brazilian-tax-rules--what-we-must-implement)
2. [What DARF Is and How It Works](#2-what-darf-is-and-how-it-works)
3. [Research Summary — Integration Options](#3-research-summary--integration-options)
4. [Recommended Architecture](#4-recommended-architecture)
5. [Implementation Plan — Phase by Phase](#5-implementation-plan--phase-by-phase)
6. [Tax Calculation Engine Spec](#6-tax-calculation-engine-spec)
7. [DARF Pre-Fill Form Spec](#7-darf-pre-fill-form-spec)
8. [API Integration Spec (Phase 2)](#8-api-integration-spec-phase-2)
9. [UI/UX Spec](#9-uiux-spec)
10. [Legal & Compliance Notes](#10-legal--compliance-notes)
11. [Effort Estimates & Prioritisation](#11-effort-estimates--prioritisation)

---

## 1. Brazilian Tax Rules — What We Must Implement

### 1.1 Tax Rates (2026)

Under Provisional Measure 1,303/2025 (effective January 2026), the rates changed from the historical values:

| Operation Type | Rate | DARF Code | Notes |
|---|---|---|---|
| **Swing trade** (operações comuns) | **17.5%** | **6015** | Up from 15%. On net monthly profit |
| **Day trade** | **20%** | **6010** | Unchanged. On net daily profit aggregated monthly |
| FIIs (real estate funds) | 20% | 6015 | Same code as swing, different rate |
| BDRs | 17.5% | 6015 | Same as swing trade |

> **Important:** Always verify current rates at [gov.br/receitafederal](https://www.gov.br/receitafederal) before filing. Rates are defined by law and may change with new legislation. MOMENTUM shows an estimate — it is not a tax authority.

### 1.2 Monthly Exemption (Isenção Mensal)

| Rule | Current (2026) | Pending Change |
|---|---|---|
| Swing trade exemption | Sales ≤ **R$ 20,000/month** → no tax | Proposal: R$ 60,000/quarter |
| Day trade exemption | **None** — all profits are taxed | No change proposed |

The exemption is per calendar month. If total stock sales in a month are below R$ 20,000 for swing trade, the gains are **exempt** — even if the profit was large. The R$ 20,000 threshold applies to the **sale value**, not the profit.

### 1.3 Withholding at Source — "Dedo-Duro"

Brokers automatically withhold a small amount that serves as an advance payment. This must be **deducted** from the DARF owed to avoid double payment:

| Operation | Withholding Rate | Basis |
|---|---|---|
| Swing trade | 0.005% | Gross sale value |
| Day trade | 1% | Net daily profit |

The user's broker provides the total dedo-duro withheld in their monthly note (nota de corretagem). MOMENTUM should allow the user to input this value to compute the final DARF due.

### 1.4 Loss Carryforward (Compensação de Prejuízo)

Losses must be tracked monthly and applied against future profits. Critical rules:

- Day trade losses **can only offset day trade gains** (never swing trade gains).
- Swing trade losses **can only offset swing trade gains** (never day trade gains).
- Losses carry forward **indefinitely** — no expiration.
- Losses from one asset class (e.g. stocks) **cannot** offset gains from another (e.g. FIIs) within the same bucket.

This means the system must maintain **two separate running balances**: one for swing, one for day trade.

### 1.5 Payment Deadline

The DARF must be paid by the **last business day of the month following** the month in which the profit was made.

| Profit month | DARF due |
|---|---|
| January | Last business day of February |
| February | Last business day of March |
| ... | ... |

Late payment penalty: **0.33% per day** (max 20%) + accumulated **Selic rate** interest.

### 1.6 Separate DARF Documents

If in a single month a user has both swing trade gains AND day trade gains, **two separate DARFs** must be issued — one for code 6015 (swing) and one for code 6010 (day trade). They cannot be combined.

---

## 2. What DARF Is and How It Works

**DARF** = Documento de Arrecadação de Receitas Federais (Federal Revenue Collection Document).

It is the standard payment slip issued to individuals when they owe federal tax outside the annual IRPF declaration — which includes monthly capital gains from trading.

### DARF Fields (What Must Be Filled In)

| Field | Description | Example |
|---|---|---|
| Período de apuração | Month/year of the taxable event | `04/2026` |
| CPF do contribuinte | Taxpayer's CPF number | `123.456.789-00` |
| Código da receita | Tax type code | `6015` (swing) / `6010` (day trade) |
| Referência | Free description | `Ganhos bolsa abril/2026` |
| Valor do principal | Tax due (before interest) | `R$ 425,00` |
| Multa | Penalty if late | `R$ 0,00` |
| Juros | Selic interest if late | `R$ 0,00` |
| Valor total | Sum of principal + multa + juros | `R$ 425,00` |

### Payment Methods

- Bank branch (with printed DARF)
- Internet banking (most major banks accept DARF payment by barcode)
- Pix (using the DARF's barcode/QR code — available since SicalcWeb upgrade 2021)
- ATM

### Official Generation Tool: SicalcWeb

The Receita Federal's official tool is **SicalcWeb** at `sicalc.receita.fazenda.gov.br`. It:
- Calculates interest and penalties for late payment automatically
- Generates a printable DARF with a scannable **barcode** (since July 2021)
- Generates a **QR Code for Pix payment** (since 2022)
- Is free to use — no account required

---

## 3. Research Summary — Integration Options

### Option A — Self-Calculated DARF (No API)

Generate a pre-filled form that the user takes to SicalcWeb or their bank. We calculate everything, the user just needs to submit.

| Aspect | Detail |
|---|---|
| **Cost** | Free |
| **Complexity** | Low — pure frontend math |
| **Barcode/Pix QR** | Not available (user must go to SicalcWeb) |
| **Works offline** | Yes — all calculation is client-side |
| **Maintenance risk** | Low — rate table needs updating when law changes |

### Option B — SERPRO Integra Contador API

Official government API developed by SERPRO (the Federal government's IT service company) that connects to SicalcWeb programmatically and generates a DARF with barcode + Pix QR.

| Aspect | Detail |
|---|---|
| **Provider** | SERPRO (government) |
| **API docs** | [apicenter.estaleiro.serpro.gov.br](https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-sicalc/) |
| **Registration** | Must register at [loja.serpro.gov.br](https://loja.serpro.gov.br) |
| **Designed for** | Accounting firms (Contadores). Not end-user consumer apps. |
| **Pricing** | Per-request, post-paid. Requires SERPRO commercial agreement. |
| **Auth requirement** | Requires the **taxpayer's CPF + e-CAC credentials** or an accounting firm's digital certificate (certificado digital A1/A3) |
| **Realistic for MOMENTUM** | ⚠️ **Hard.** Requires acting as an accounting intermediary, handling user CPF + e-CAC credentials. Legal and compliance overhead is significant. |

### Option C — Infosimples API

A third-party API company that wraps SicalcWeb and returns a generated DARF as JSON + PDF/barcode. Has a Node.js SDK.

| Aspect | Detail |
|---|---|
| **Provider** | Infosimples (private Brazilian company) |
| **API page** | [infosimples.com/consultas/receita-federal-sicalc-darf](https://infosimples.com/consultas/receita-federal-sicalc-darf/) |
| **Node.js SDK** | [github.com/alanmatiasdev/infosimples-sdk](https://github.com/alanmatiasdev/infosimples-sdk) |
| **Auth requirement** | Infosimples API key only — does **not** require the user's CPF or e-CAC credentials |
| **Pricing** | Credit-based. Cost per DARF generation is a few reais per call. |
| **What it returns** | Filled DARF with barcode, Pix QR code, PDF download |
| **Realistic for MOMENTUM** | ✅ **Feasible.** Lightweight integration. User inputs CPF and values; MOMENTUM calls the API; returns printable/payable DARF. |

### Option D — Open Source / Self-Hosted DARF Generation

A Python GitHub project (`renanleonellocastro/darf_generator`) computes tax and generates DARF boleto files by communicating directly with B3 CEI and SicalcWeb.

| Aspect | Detail |
|---|---|
| **Repo** | [github.com/renanleonellocastro/darf_generator](https://github.com/renanleonellocastro/darf_generator) |
| **Language** | Python 3 |
| **Barcode** | Generated as a boleto-style file |
| **B3 CEI integration** | Reads transactions directly from B3's CEI investor portal |
| **Maintenance** | Community-maintained, not backed by a company |
| **Realistic for MOMENTUM** | ⚠️ **Risky.** Depends on unofficial B3 CEI scraping which breaks frequently. Good reference for tax logic but not production-ready as-is. |

### Option E — Deep-Link to SicalcWeb (Zero Backend)

Pre-fill a SicalcWeb URL with all the calculated values and open it in a new tab. SicalcWeb generates the DARF natively; the user pays from there.

| Aspect | Detail |
|---|---|
| **Cost** | Free |
| **Complexity** | Very low |
| **Barcode/Pix QR** | Yes — SicalcWeb provides it after the user lands on the pre-filled page |
| **Limitation** | SicalcWeb does not accept GET query parameters for pre-fill (form is server-side rendered). User would need to copy values manually. |
| **Realistic for MOMENTUM** | ✅ as a **hybrid** — we show a filled summary card and a "Open SicalcWeb" button. User copies 4–5 fields. |

---

## 4. Recommended Architecture

### Recommended Approach: Phase 1 now, Phase 2 post-launch

```
┌────────────────────────────────────────────────────────────┐
│  PHASE 1 (Sprint 2 — free, ships fast)                     │
│                                                            │
│  MOMENTUM Tax Engine (client-side JS)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Classify │  │ Compute  │  │ Apply    │                  │
│  │ swing vs │→ │ monthly  │→ │ loss     │                  │
│  │ day trade│  │ P&L      │  │ carryover│                  │
│  └──────────┘  └──────────┘  └──────────┘                 │
│        │                                                   │
│        ▼                                                   │
│  DARF Summary Card                                         │
│  ┌─────────────────────────────────────────┐              │
│  │  Month: April 2026                      │              │
│  │  Swing Trade: R$ 2,500 profit           │              │
│  │  Tax (17.5%): R$ 437,50                 │              │
│  │  Dedo-duro deducted: -R$ 12,50          │              │
│  │  DARF due: R$ 425,00  [Code: 6015]      │              │
│  │  Deadline: 30/05/2026                   │              │
│  │                                         │              │
│  │  [📋 Copy values]  [🌐 Open SicalcWeb]  │              │
│  └─────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  PHASE 2 (Sprint 3 — Infosimples API, ~R$2-3 per DARF)    │
│                                                            │
│  User adds CPF once → MOMENTUM calls Infosimples API       │
│  → Returns DARF PDF + barcode + Pix QR code                │
│  → User scans QR and pays in 30 seconds                    │
└────────────────────────────────────────────────────────────┘
```

### Why This Phasing

- **Phase 1** ships in 1 sprint, costs nothing, and solves 90% of the problem. Most users just need to know the correct number and DARF code.
- **Phase 2** closes the loop: user never leaves the app to get the barcode. Cost per DARF (~R$2–3 via Infosimples) can be absorbed into Pro tier pricing or passed on as a small per-use fee.
- **SERPRO Integra Contador** is ruled out for now: it is designed for accounting firms with digital certificates, not consumer apps. The compliance overhead and credential-handling requirements are disproportionate at this stage.

---

## 5. Implementation Plan — Phase by Phase

### Phase 1 — DARF Calculator (Sprint 2, ~5–8 days)

**Goal:** Full in-app calculation with a one-click "Open SicalcWeb" shortcut. Zero external API dependency.

| # | Task | Notes |
|---|---|---|
| 1 | Add `tradeType` field to portfolio positions | `'swing'` \| `'daytrade'` — user selects at position entry. Default: `'swing'`. |
| 2 | Add `grossSaleValue` field to sold positions | Needed to compute dedo-duro deduction for swing trade |
| 3 | Build `computeDARF(positions, month)` function | See spec in Section 6 |
| 4 | Separate loss carryforward state | `state.swingLossCarryover` and `state.daytradeLossCarryover` in localStorage |
| 5 | DARF Summary UI component | Monthly summary card (see Section 7) |
| 6 | "Copy DARF values" button | Copies period, CPF, code, value to clipboard as formatted text |
| 7 | "Open SicalcWeb" button | Opens `sicalc.receita.fazenda.gov.br/sicalc/rapido/contribuinte` in new tab |
| 8 | CPF input field in user profile | Stored in localStorage (encrypted or plaintext — Phase 1: plaintext, Phase 2: encrypted) |
| 9 | Rename/update Trading Journal button | New tab/button: "📋 DARF / TAX REPORT" |
| 10 | i18n keys | Add all new strings to `LANGS.en` and `LANGS.pt` |
| 11 | Rate table config | Store rates and DARF codes in a config object — easy to update when law changes |

---

### Phase 2 — DARF Generation with Barcode + Pix QR (Sprint 3, ~3–5 days)

**Goal:** Generate a real DARF PDF with Pix QR code inside the app via Infosimples API.

| # | Task | Notes |
|---|---|---|
| 1 | Register Infosimples account | `api.infosimples.com` — credit-based pricing |
| 2 | Add `INFOSIMPLES_API_KEY` to `.env.example` and server config | Never expose in frontend |
| 3 | Add `POST /api/darf/generate` server endpoint | Receives `{cpf, period, code, value, deducao}` — calls Infosimples — returns PDF blob or barcode string |
| 4 | Frontend: "🧾 Generate DARF" button (Pro tier) | Calls `/api/darf/generate`; shows PDF download + Pix QR code inline |
| 5 | Store CPF server-side (encrypted) | Needed for Phase 2; use AES-256-GCM with user-derived key |
| 6 | Rate limiting on `/api/darf/generate` | Max 5 DARF generations per user per day to control API cost |
| 7 | Cost tracking in admin panel | Log DARF generation count per user per month for billing review |

---

### Phase 3 — Advanced Features (Sprint 4+)

| Feature | Description |
|---|---|
| Annual IRPF summary | Export all monthly results as the "Renda Variável" section of the annual declaration, compatible with the Receita Federal's IRPF program XML format |
| B3 CEI import | Allow user to import their nota de corretagem PDF or B3 CEI CSV to auto-populate positions and gross sale values |
| Multi-asset expansion | Add FII (Fundo Imobiliário) support with its own 20% rate; BDR support |
| Automatic dedo-duro calculation | Compute 0.005% and 1% withholding automatically from sale values — user no longer needs to input it manually |
| DARF payment status | After user pays, mark the month as "PAID" in the UI — manual toggle initially |

---

## 6. Tax Calculation Engine Spec

The `computeDARF(positions, month, options)` function must implement all rules from Section 1.

### Input

```js
computeDARF(
  positions,     // array of portfolio positions
  month,         // 'YYYY-MM' — the month to compute
  options: {
    swingCarryover:    number,  // accumulated swing trade losses to date
    daytradeCarryover: number,  // accumulated day trade losses to date
    swingDeducao:      number,  // dedo-duro withheld by broker (swing)
    daytradeDeducao:   number,  // dedo-duro withheld by broker (day trade)
  }
)
```

### Computation Steps

```
Step 1 — Filter positions closed in `month`
  → sold positions where sellDate starts with 'YYYY-MM'

Step 2 — Separate by trade type
  → swingSold    = positions with tradeType === 'swing'
  → daytradeSold = positions with tradeType === 'daytrade'

Step 3 — Compute gross sale values
  → swingGrossSales    = sum(sellPrice × quantity) for swingSold
  → daytradeGrossSales = sum(sellPrice × quantity) for daytradeSold

Step 4 — Compute raw P&L
  → swingPnL    = sum((sellPrice - buyPrice) × quantity) for swingSold
  → daytradePnL = sum((sellPrice - buyPrice) × quantity) for daytradeSold

Step 5 — Apply loss carryforward
  → swingNet    = swingPnL - options.swingCarryover
  → daytradeNet = daytradePnL - options.daytradeCarryover

  → if swingNet < 0:
       newSwingCarryover = abs(swingNet)
       swingNet = 0
     else:
       newSwingCarryover = 0

  → (same logic for daytradeNet)

Step 6 — Apply monthly exemption
  → swingExempt = swingGrossSales <= 20000  (R$20k threshold)
  → if swingExempt: swingTaxable = 0
  → else: swingTaxable = swingNet

  → daytradeExempt = false (no exemption for day trade)
  → daytradeTaxable = daytradeNet

Step 7 — Compute gross tax
  → swingTax    = swingTaxable    × RATE_SWING    (0.175)
  → daytradeTax = daytradeTaxable × RATE_DAYTRADE (0.20)

Step 8 — Deduct dedo-duro (withholding at source)
  → swingDARF    = max(0, swingTax    - options.swingDeducao)
  → daytradeDARF = max(0, daytradeTax - options.daytradeDeducao)

Step 9 — Build result
  → Return: {
       swing: {
         grossSales: swingGrossSales,
         rawPnl: swingPnL,
         carryoverApplied: options.swingCarryover,
         netPnl: swingNet,
         exempt: swingExempt,
         taxableAmount: swingTaxable,
         grossTax: swingTax,
         deducao: options.swingDeducao,
         darf: swingDARF,
         code: '6015',
         newCarryover: newSwingCarryover,
       },
       daytrade: { ...same structure..., code: '6010' },
       deadline: lastBusinessDayOfNextMonth(month),
     }
```

### Rate Config Object

```js
const BR_TAX = {
  SWING_RATE:         0.175,     // 17.5% as of Jan 2026 (MP 1303/2025)
  DAYTRADE_RATE:      0.20,      // 20%
  SWING_EXEMPTION:    20000,     // R$20,000 monthly gross sales threshold
  SWING_DARF_CODE:    '6015',
  DAYTRADE_DARF_CODE: '6010',
  SWING_DEDUCAO_RATE:    0.00005, // 0.005% of gross sale (dedo-duro)
  DAYTRADE_DEDUCAO_RATE: 0.01,    // 1% of net daily profit (dedo-duro)
  LATE_PENALTY_DAILY: 0.0033,    // 0.33% per day, max 20%
};
```

This config object should live at the top of the relevant JS section and be visually distinct so it is easy to update when legislation changes.

---

## 7. DARF Pre-Fill Form Spec

### DARF Summary Card UI (Phase 1)

For each month with taxable events, MOMENTUM shows a card:

```
┌──────────────────────────────────────────────────────────┐
│  📋  DARF — ABRIL 2026                                    │
│                                                          │
│  ── SWING TRADE (Operações Comuns) ────────────────────  │
│  Vendas no mês:           R$ 45.200,00                   │
│  Lucro bruto:             R$ 2.500,00                    │
│  Prejuízo compensado:    -R$ 0,00                        │
│  Lucro tributável:        R$ 2.500,00                    │
│  Imposto (17,5%):         R$ 437,50                      │
│  Dedo-duro deduzido:     -R$ 12,50                       │
│  ══ DARF A PAGAR:         R$ 425,00  ══ Código: 6015     │
│  Vencimento: 29/05/2026                                  │
│                                                          │
│  ── DAY TRADE ─────────────────────────────────────────  │
│  Lucro líquido:           R$ 0,00                        │
│  Nenhum DARF necessário                                  │
│                                                          │
│  [📋 Copiar dados do DARF]  [🌐 Abrir SicalcWeb]         │
│  [⬇ Dedo-duro: inserir valor do extrato]                 │
└──────────────────────────────────────────────────────────┘
```

### "Copiar dados do DARF" — Clipboard Content

```
DARF — Swing Trade (Operações Comuns)
Período de apuração: 04/2026
CPF: 123.456.789-00
Código da receita: 6015
Valor principal: R$ 425,00
Vencimento: 29/05/2026
Referência: Ganhos em bolsa - abril/2026
```

The user pastes this into SicalcWeb in one go.

### SicalcWeb Deep-Link

```
https://sicalc.receita.fazenda.gov.br/sicalc/rapido/contribuinte
```

This is the "quick DARF" entry page. SicalcWeb does not accept URL parameters, so the user fills in the pre-copied values. The link opens in a new tab.

---

## 8. API Integration Spec (Phase 2)

### Server Endpoint: `POST /api/darf/generate`

```js
// Request body (from authenticated Pro user)
{
  period:  '04/2026',    // MM/YYYY
  code:    '6015',       // or '6010'
  value:   425.00,       // DARF principal amount in BRL
  cpf:     '12345678900' // user's CPF (digits only, no formatting)
}

// Server calls Infosimples:
POST https://api.infosimples.com/consultas/receita-federal/sicalc/darf
Headers: { 'Authorization': 'Token <INFOSIMPLES_API_KEY>' }
Body: {
  periodo_apuracao: '04/2026',
  cpf: '12345678900',
  codigo_receita: '6015',
  valor_principal: '425.00',
  referencia: 'Ganhos em renda variavel 04/2026'
}

// Infosimples returns:
{
  status: 1,
  data: [{
    barcode: '1234 5678 ...',
    pix_qr_code: 'data:image/png;base64,...',
    pdf_base64: '...',
    vencimento: '29/05/2026',
    valor_total: '425.00'
  }]
}

// MOMENTUM returns to frontend:
{
  ok: true,
  barcode: '...',
  pixQrCode: '...',        // base64 PNG
  pdfBase64: '...',        // base64 PDF for download
  vencimento: '29/05/2026',
  valorTotal: 'R$ 425,00'
}
```

### Security Considerations for CPF

- CPF is sensitive personal data under LGPD.
- **Phase 1:** Store in localStorage only — never transmitted to server.
- **Phase 2:** If stored server-side, encrypt with AES-256-GCM using a key derived from the user's JWT secret + user ID. Never store CPF in plain text in `users.json`.
- Never log CPF in server logs.
- LGPD data export (`GET /api/auth/data-export`) must include CPF in the exported data.
- Account deletion (`DELETE /api/auth/account`) must wipe CPF.

---

## 9. UI/UX Spec

### Navigation Changes

| Current | Proposed |
|---|---|
| `📊 MY STOCKS AND TAX REPORTS` | `📊 CARTEIRA & DARF` (PT) / `📊 PORTFOLIO & DARF` (EN) |
| Portfolio view → "Trading Journal" tab | Keep. Rename sub-section button to `📋 DARF MENSAL` |

### New Fields in "Add Position" Modal

| Field | Type | Notes |
|---|---|---|
| **Tipo de operação** | Radio: Swing Trade / Day Trade | Required. Default: Swing Trade |
| **Valor total da venda** (sell modal only) | Number | Optional — for dedo-duro auto-calculation |

### New "DARF Mensal" Section (within Portfolio view)

1. **Month selector** — user picks month (default: current month)
2. **Dedo-duro input** — two fields: "Dedo-duro swing (R$)" and "Dedo-duro day trade (R$)". Hint: "Consulte sua nota de corretagem"
3. **CPF input** — one-time setup, stored locally. Shows masked after first entry.
4. **DARF summary cards** — one per DARF type with tax breakdown
5. **Action buttons** — Copy / SicalcWeb / Generate DARF (Phase 2, Pro only)
6. **Loss carryover display** — "Prejuízo acumulado swing: R$ X,XX | Day trade: R$ X,XX"
7. **Annual summary** — collapsible view of all 12 months with DARF due column

### Status Badges for Monthly DARF

| Status | Badge | Colour |
|---|---|---|
| Profit — DARF due | `DARF PENDENTE` | Red |
| Exempt (under R$20k) | `ISENTO` | Green |
| No profit | `SEM IMPOSTO` | Grey |
| Paid (manual toggle) | `PAGO ✓` | Green |
| Loss month | `PREJUÍZO COMPENSADO` | Yellow |

---

## 10. Legal & Compliance Notes

### What MOMENTUM Can Say

✅ "This is an estimated tax calculation based on your portfolio entries."
✅ "Generated using publicly published Receita Federal rules."
✅ "Verify your values against your broker's nota de corretagem before filing."

### What MOMENTUM Must NOT Say

❌ "File this DARF as-is." → Must include disclaimer.
❌ "This is your official tax document." → It is not.
❌ "You owe exactly X." → Always say "estimated" and prompt verification.

### Required Disclaimers

Every DARF section must show prominently:

> ⚠️ **Esta é uma estimativa.** Os valores são calculados com base nas operações registradas no MOMENTUM. Confirme os dados com sua nota de corretagem antes de emitir e pagar a DARF. Em caso de dúvida, consulte um contador. MOMENTUM não é responsável por erros ou multas decorrentes de divergências nos dados informados.

> ⚠️ **This is an estimate.** Values are calculated from positions entered in MOMENTUM. Verify against your broker's trade statement before filing. Consult a tax professional if in doubt. MOMENTUM is not responsible for errors, penalties, or late fees.

### Regulatory Positioning

MOMENTUM is a **calculation aid**, not a tax filing service. This places it in the same category as spreadsheets and personal finance apps — not requiring CVM or Receita Federal licensing. The distinction must be clear in:

- Terms of Service (add a "Tax Calculations" section)
- Every DARF summary card (disclaimer)
- FAQ / Help text

---

## 11. Effort Estimates & Prioritisation

### Phase 1 — DARF Calculator (No API)

| Component | Effort | Sprint |
|---|---|---|
| Tax engine (`computeDARF`) with all rules | 2 days | Sprint 2 |
| `tradeType` field on positions + migration | 0.5 days | Sprint 2 |
| Loss carryforward state in localStorage | 0.5 days | Sprint 2 |
| DARF summary UI component | 1.5 days | Sprint 2 |
| CPF input + masking + local storage | 0.5 days | Sprint 2 |
| Dedo-duro input fields | 0.5 days | Sprint 2 |
| Copy-to-clipboard + SicalcWeb link | 0.5 days | Sprint 2 |
| i18n keys (PT + EN) | 0.5 days | Sprint 2 |
| Rate config externalisation + disclaimer | 0.5 days | Sprint 2 |
| **Total Phase 1** | **~7 days** | Sprint 2 |

### Phase 2 — Infosimples API Integration

| Component | Effort | Sprint |
|---|---|---|
| Infosimples account + API key setup | 0.5 days | Sprint 3 |
| `POST /api/darf/generate` server endpoint | 1 day | Sprint 3 |
| CPF server-side encrypted storage | 1 day | Sprint 3 |
| Frontend: Generate DARF button + Pix QR display | 1 day | Sprint 3 |
| Rate limiting + cost tracking in admin | 0.5 days | Sprint 3 |
| LGPD: CPF in data export + deletion | 0.5 days | Sprint 3 |
| **Total Phase 2** | **~4.5 days** | Sprint 3 |

### Phase 3 — IRPF Annual Export + B3 CEI Import

| Component | Effort | Sprint |
|---|---|---|
| Annual summary with all months | 1 day | Sprint 4 |
| IRPF-compatible CSV/XML export | 2 days | Sprint 4 |
| B3 CEI nota de corretagem PDF import | 3–5 days | Sprint 4 |
| FII / BDR separate tax buckets | 2 days | Sprint 4 |

---

### Priority Summary

```
Phase 1 (Sprint 2) ── HIGHEST PRIORITY ──────────────────────
  Full DARF calculator + SicalcWeb link.
  Differentiates MOMENTUM from every Brazilian competitor.
  Costs nothing. Ships in one sprint.

Phase 2 (Sprint 3) ── HIGH PRIORITY ─────────────────────────
  Infosimples API → real DARF with Pix QR.
  Closes the loop — user never leaves the app.
  Cost: ~R$2–3 per DARF, absorbed by Pro pricing.

Phase 3 (Sprint 4+) ── MEDIUM PRIORITY ──────────────────────
  Annual IRPF export + B3 CEI import.
  Strong retention driver; higher complexity.
```

---

*End of DARF Implementation Plan — v1.0*

---

### Sources

- [Day trade no Imposto de Renda 2026 — XP Investimentos](https://conteudos.xpi.com.br/aprenda-a-investir/relatorios/day-trade-no-imposto-de-renda/)
- [Como declarar swing trade no Imposto de Renda — Infomoney](https://www.infomoney.com.br/minhas-financas/como-declarar-swing-trade-no-imposto-de-renda/)
- [Day trade pode ter queda de 20% para 17,5% em alíquota — Infomoney](https://www.infomoney.com.br/mercados/day-trade-pode-ter-queda-de-20-para-175-em-aliquota-mas-swing-trade-deve-ter-alta/)
- [API Receita Federal / SICALC / Gerar DARF — Infosimples](https://infosimples.com/consultas/receita-federal-sicalc-darf/)
- [DARF — Cálculo e impressão SICALC — Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/pagamentos-e-parcelamentos/darf-calculo-e-impressao-programa-sicalc-1)
- [Contexto — Integra SICALC — SERPRO API Center](https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-sicalc/)
- [DARF com Código de Barras — Questor](https://www.questor.com.br/darf-codigo-de-barras/)
- [SicalcWeb — Receita Federal](https://sicalc.receita.fazenda.gov.br/sicalc/principal)
- [Trading Taxes in Brazil — JournalPlus](https://journalplus.co/regulations/trading-taxes-brazil/)
- [GitHub — darf_generator (Python, open source)](https://github.com/renanleonellocastro/darf_generator)
- [Brazil Provisional Measure capital markets taxation — EY Global](https://www.ey.com/en_gl/technical/tax-alerts/brazil-publishes-provisional-measure-affecting-financial-and-capital-markets-taxation)
- [Node.js SDK for Infosimples API — GitHub](https://github.com/alanmatiasdev/infosimples-sdk)
