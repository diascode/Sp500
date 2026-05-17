---
name: ui-agents
description: Two Claude Code agents saved in .claude/agents/ are responsible for all UI work on the Momentum project
metadata:
  type: project
---

Two agents handle all UI work for Sprint D and beyond:

**`.claude/agents/ui-implementer.md`** — implements design stories from design_handoff_momentum_br into stock-dashboard.html. Contains: constraints (no React, no build pipeline), component patterns (FeedCard, ScanRing, fmt/fmtPct), workflow per story, what to exclude.

**`.claude/agents/ui-qa.md`** — visual QA and regression after each Sprint D story. Contains: full QA checklist (tokens, AppBar, FeedCard, ScanRing, mobile, themes, auth, LGPD, i18n, regression), reporting format, screenshot workflow.

**How to apply:** Use `ui-implementer` for all Sprint D implementation tasks. Use `ui-qa` after each story lands to verify fidelity before moving to the next story.
