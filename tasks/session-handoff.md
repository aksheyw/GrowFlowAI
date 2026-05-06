# Session Handoff — GrowFlowAI

> **Last updated**: 2026-05-06 by session that took repo public.
> **Read this first when starting a new session.**

---

## §1 Project context

GrowFlowAI is a personal AI task-management companion. Meeting notes (Telegram/web/email) → AI extracts tasks → tasks visualized as growing plants → daily 9am Telegram digest with snooze buttons.

- **Repo**: https://github.com/aksheyw/GrowFlowAI (PUBLIC, MIT, since 2026-05-06)
- **Live demo**: https://grow-flow-ai.vercel.app
- **Owner**: Akshey Walia — sole dev, sole user
- **Goal of repo being public**: portfolio piece for senior PM job search (Director / Principal track)

Stack: React 18 + Vite + TS · Tailwind · TanStack Query · Supabase (Auth + Postgres + Edge Functions + pgvector) · Capacitor 7 · n8n on Hostinger VPS · OpenAI GPT-4o-mini, Whisper, Vision

---

## §2 Current state

| Surface | State | Notes |
|---------|-------|-------|
| Web app (Vercel) | ✅ Live, working | Used as public demo |
| Web app (local dev) | ✅ Build passes, typecheck clean | `npm run dev` |
| Android (Capacitor) | ⚠️ Untested in this session | Has working setup, never re-tested after npm changes |
| Telegram bot | ❌ Known logic bugs from April 2026 | Workflow active, env vars / token / credential all set, but bot doesn't respond |
| Email ingestion | ✅ Active (per workflow status) | Untouched this session |
| Calendar sync | ✅ Active | Untouched |
| Supabase Edge Functions | ✅ Deployed and active | Untouched |

---

## §3 Snapshot

- **Branch**: `main`
- **Latest commit**: `3c1f6b6 docs: add real screenshots showing capture -> AI processing -> tasks -> leadership brief pipeline`
- **Working tree**: clean, all pushed to origin
- **Tests**: no formal test suite. Build passes (`npm run build`, 2.46s). Typecheck clean (0 errors).
- **Audit**: 6 vulnerabilities (2 moderate, 4 high) — all dev-time-only (vite + @capacitor/assets transitives)

---

## §4 What landed this session (chronological)

| # | Action | SHA / Where | Why |
|---|--------|-------------|-----|
| 1 | Audit + plan | (planning only) | Identify 3 n8n bot JSONs as the only secret-bearing files |
| 2 | git filter-repo on 197 commits | (history rewrite) | Scrub leaked Telegram token + email |
| 3 | Sanitize n8n bot JSONs | `5ae2b5a` | Replace token+email with `{{placeholders}}` |
| 4 | Rewrite README, add LICENSE/SECURITY/.env.example/n8n-README, fix package.json, anonymise ROADMAP names | `5ae2b5a` | Portfolio polish |
| 5 | Fix 5 typecheck errors | `5ae2b5a` | leadership_summary→leadership_brief + 4 unused imports |
| 6 | Force-push (authorized) | (push) | Replace remote with cleaned history |
| 7 | User flips repo to public | (UI) | Goal achieved |
| 8 | User adds bio, company, location, portfolio + LinkedIn links | (UI) | Profile polish |
| 9 | Set repo description + 10 topics | (gh CLI / UI) | Discoverability |
| 10 | Surface live demo + tech badges in README hero | `27a54b6` | Recruiter conversion |
| 11 | Add screenshots gallery scaffold | `27a8e16` | Wired README to look for `public/screenshots/*.png` |
| 12 | VPS env-var migration (Telegram) | (VPS) | `GROWFLOW_TELEGRAM_BOT_TOKEN` set in `/root/.env` + docker-compose; container recreated; verified inside container |
| 13 | n8n workflow patch (`<growflow> telegram bot`) | (n8n MCP) | 5 hardcoded token sites swapped to `={{$env.GROWFLOW_TELEGRAM_BOT_TOKEN}}`; workflow reactivated via n8n CLI |
| 14 | User updates Telegram credential in n8n UI | (UI, manual) | Trigger + action nodes use credential, not env var |
| 15 | VPS env-var migration (Supabase) | (VPS) | `GROWFLOW_SUPABASE_URL` + `GROWFLOW_SUPABASE_SERVICE_ROLE_KEY` added; container recreated |
| 16 | n8n workflow patch (Leadership Summary) | (n8n MCP) | 9 hardcoded JWT/URL sites swapped to env vars; workflow reactivated |
| 17 | npm audit fix + tar override | `7b25936` | 60 vulns → 6 (90% reduction); remaining 6 dev-only |
| 18 | Real screenshots placed | `3c1f6b6` | dashboard, multi-input, meeting-note, ai-processing, leadership-brief — README rewritten as pipeline narrative |

---

## §5 Open work (prioritised)

### P1 — Telegram bot end-to-end (Phase 4)

User reported: "telegram is not responding, i think i had deactivated the workflow in april due to some known bugs". Token rotation + workflow patches fixed the credential side. Underlying bot logic bugs remain. **Workflow `IUBn7Hl4KqTEvk4b` is currently active=true on the n8n VPS but doesn't respond.**

**Suggested debug path** (next session):
1. `mcp__n8n-mcp__n8n_executions` for `IUBn7Hl4KqTEvk4b` → look for failure patterns
2. Fix pre-existing IF node sanitization warnings (`User Found?` and `Gardener Success?` need `singleValue: true` on unary `notEmpty` operators) — see [`.claude/wiki/_findings.md`](.claude/wiki/_findings.md) F05
3. Check workflow `settings.timezone` — must be `Asia/Kolkata` for Daily 9am Trigger to fire correctly (per shared-infra rule)
4. Manual smoke test: send a Telegram message, watch executions

### P2 — VPS hygiene improvements

- **F02**: Add `/root/.env` to backup-before-edit checklist (this session missed it; only docker-compose.yml was backed up)
- **F04**: Cross-project OpenRouter key leak (31 sites still hardcode shared key) — separate session, NOT GrowFlow-scoped but same VPS

### P3 — Phase 5: Major dependency upgrades

- Vite 5 → 8 (breaking)
- @capacitor/assets 3 → 1 (downgrade — yes, latest is 3.x but vuln-fix is in 1.x; may be unnecessary risk)
- Goal: clear remaining 6 dev-only npm vulns

### P3 — Cosmetic

- 4 demo tasks in user's live Supabase DB from screenshot prep (Schedule code review / Prepare mockups / Complete user auth / Update API docs) — user can delete via UI when convenient
- Pin GrowFlowAI to GitHub profile (UI step) — low ROI since user only has 3 public repos

### P4 — Future / multi-tenant

If GrowFlow ever goes multi-tenant: must close RLS policies first (per Wealth Sage F15 pattern in shared-infra rule). Currently single-user model with service_role used from n8n Code nodes — that pattern doesn't scale to multi-user.

---

## §6 Critical context for future sessions

### Auth boundaries (LEARNED THIS SESSION)
Auto-mode is NOT blanket auth for prod-touching destructive ops. Per-scope acknowledgment required: GitHub force-push, SSH, n8n workflow edit, container recreate. Always back up files before edit. See `memory/feedback_auth_boundaries.md`.

### Tokens we touched
- **Old Telegram bot token** `7981658390:AAHPTDJHfEV84daPfjeLb2F9YZTKDsR70ag` is **REVOKED**. Anywhere it appears in old history is dead. No further rotation needed.
- **New Telegram bot token** was provided by user, used to set env var, **NOT retained in scrollback or memory**. If needed again, ask user to re-paste.
- **Supabase service_role JWT** (project `exkzusmktvaxpfayjycm`) was NOT rotated this session — same JWT now stored as env var `GROWFLOW_SUPABASE_SERVICE_ROLE_KEY` instead of hardcoded. If rotating in future: edit `/root/.env` value + `docker compose up -d` + update Supabase Edge Function secret too.

### VPS env-var pattern (USE FOR ANY FUTURE SECRETS)
- Append to `/root/.env` via SSH stdin (avoids shell history)
- Add to `/root/docker-compose.yml` `environment:` block (NOT `env_file:`)
- `docker compose --env-file /root/.env up -d` to recreate container (NOT `docker restart`)
- Reference in workflows: `={{ $env.GROWFLOW_VAR_NAME }}` (`=` prefix makes it expression mode)
- See [`.claude/wiki/gotchas/g-vps-env-var-pattern.md`](.claude/wiki/gotchas/g-vps-env-var-pattern.md)

### n8n MCP gotchas
- `fieldPath` array notation: use `.0` not `[0]` (see `.claude/wiki/gotchas/g-n8n-array-index-dot-notation.md`)
- Credentials are UI-only, not MCP-accessible (see `.claude/wiki/gotchas/g-n8n-credential-mcp-forbidden.md`)
- After patches that include IF node operator changes, n8n may auto-deactivate the workflow. Reactivate via `docker exec root-n8n-1 n8n update:workflow --id=<ID> --active=true` (deprecated but works) or n8n UI.

### Don't break next session
- Don't run `git push --force` without re-authorization (repo is now PUBLIC; force-push has bigger blast radius)
- Don't SSH to `n8n.srv1134430.hstgr.cloud` without re-authorization
- Don't add new n8n workflow patches without `validateOnly: true` first
- Don't try to use `mcp__n8n-mcp__n8n_manage_credentials` — it's Forbidden

---

## §7 Reference index

- [README.md](../README.md) — public repo readme
- [Docs/ROADMAP.md](../Docs/ROADMAP.md) — competitive analysis + phased roadmap
- [Docs/SKILLS.md](../Docs/SKILLS.md) — skills/architecture deep-dive
- [.claude/wiki/_hot.md](../.claude/wiki/_hot.md) — current focus
- [.claude/wiki/_log.md](../.claude/wiki/_log.md) — session log
- [.claude/wiki/_findings.md](../.claude/wiki/_findings.md) — issues to rectify
- [.claude/wiki/decisions/d-2026-05-06-open-source-launch.md](../.claude/wiki/decisions/d-2026-05-06-open-source-launch.md) — this session's decisions
- [.claude/wiki/architecture/a-system-overview.md](../.claude/wiki/architecture/a-system-overview.md) — surfaces, env contract, n8n inventory
- [.claude/wiki/open-security-findings.md](../.claude/wiki/open-security-findings.md) — security ledger
- [memory/MEMORY.md](../memory/MEMORY.md) — project memory index
- [`~/.claude/rules/shared-infra.md`](file:///Users/aksheywa/.claude/rules/shared-infra.md) — cross-project pointers (n8n VPS, OpenRouter, Supabase, Council)
- [`~/.claude/rules/workflow.md`](file:///Users/aksheywa/.claude/rules/workflow.md) — save-and-sync 10-step process
