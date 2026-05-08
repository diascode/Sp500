# 🤖 Agent Roster

Managed by **Jerry** — keep this updated as agents are created/retired.

## Active Agents

| Agent ID | Role | Status | Created |
|----------|------|--------|---------|
| `main` | **Jerry** — Bot Coordinator | ✅ Active | Bootstrap |
| `agent-creator` | Creates new specialized agents on demand | ✅ Active | 2026-05-08 |
| `stock-advisor` | Multi-market stock screening & portfolio advisory (US/EU/BR) | 🟡 Setup | 2026-05-08 |

## Agent Directory

### `main` — Jerry (Bot Coordinator)
- **Workspace:** `~/.openclaw/workspace`
- **Purpose:** Receive tasks, check available agents, delegate or commission new agents
- **Model:** DeepSeek V4 Flash
- **Owns:** Agent roster, delegation, orchestration

### `agent-creator` — Agent Creator
- **Workspace:** `~/.openclaw/agents/agent-creator/agent/workspace`
- **Purpose:** Create new single-purpose agents when no existing agent covers a task domain
- **Process:**
  1. Receive brief from Jerry (task domain + requirements)
  2. Design agent: identity, skills, tools, model, workspace files
  3. Create agent directory + bootstrap files
  4. Register agent in OpenClaw config (`agents.list`)
  5. Update this roster
  6. Report back to Jerry

## Principles

- **Single-purpose:** One domain, one agent. A "Python developer" agent is too broad. A "pytest-test-writer" agent is just right.
- **Reusable:** Name agents by their domain of expertise, not by the specific task they were created for.
- **No overlap:** Before creating, check that no existing agent covers the same ground.
- **Documented:** Every agent gets clear SOUL.md + TOOLS.md so Jerry knows when to use it.
