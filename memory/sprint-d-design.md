---
name: sprint-d-design
description: Sprint D is the priority design foundation sprint — implement mobile-first Brazilian fintech redesign from design_handoff_momentum_br/README.md into stock-dashboard.html before any other remaining sprints
metadata:
  type: project
---

Sprint D (Design Foundation) was created on 2026-05-17 as the top-priority sprint. All remaining sprints (5–10) run after Sprint D.

**Why:** design_handoff_momentum_br/README.md defines the standard visual design going forward — targeting 25–40-year-old Brazilians, classe C, mobile-first. All future features must be built inside this design system.

**Stories:** US-112–128 (17 stories, Epic 30) in USER_STORIES.md.

**Conflicts identified and documented in USER_STORIES.md:**
- US-45 (old themes) → superseded by US-128 (4 new themes: brasil/day/pop/calmo)
- US-71/72 (old mobile CSS) → superseded by US-126 (new mobile bottom nav + breakpoints)
- US-89 (Sprint 6 CSS extraction) → ordering dependency: Sprint D must land first

**Implementation target:** `stock-dashboard.html` — vanilla JS SPA, no React, no build pipeline.
**Reference files:** `design_handoff_momentum_br/` (styles.css, components.jsx, screens.jsx, data.js).

**How to apply:** When implementing any UI feature, check Sprint D stories first. All new screens must use the design tokens from US-112 and the FeedCard/StoryCard components from US-114.
