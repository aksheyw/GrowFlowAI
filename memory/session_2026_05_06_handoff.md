---
name: session_2026_05_06_handoff
description: GrowFlowAI session 2026-05-06 — open-source launch, secrets rotation, portfolio polish
type: project
---

Session 2026-05-06 took GrowFlowAI from private repo with leaked secrets to public portfolio piece. Key facts to remember in future sessions:

**What landed (5 commits, all pushed to main)**:
- `5ae2b5a` chore: prepare repo for open-source — sanitize, README, LICENSE, n8n placeholders, history scrub
- `27a8e16` docs: add screenshots gallery scaffolding
- `27a54b6` docs: surface live demo + tech badges above the fold
- `7b25936` chore: npm audit fix + tar override (60→6 vulns, dev-only)
- `3c1f6b6` docs: add real screenshots showing capture → AI → tasks → leadership brief pipeline

**Why**: User wanted public repo for recruiter portfolio. Used pre-flip private state to safely scrub leaked Telegram bot token from full history via `git filter-repo`. Then polished for portfolio audience.

**How to apply**:
- Repo is now PUBLIC. Don't reveal anything sensitive in commits/PRs.
- VPS env vars `GROWFLOW_TELEGRAM_BOT_TOKEN`, `GROWFLOW_SUPABASE_URL`, `GROWFLOW_SUPABASE_SERVICE_ROLE_KEY` are set on `n8n.srv1134430.hstgr.cloud` and live in container env. Future Telegram or Supabase rotations: just edit `/root/.env` and `docker compose up -d` — no workflow edits needed.
- Telegram credential in n8n UI was manually rotated by user — confirmed.
- Telegram bot has separate April 2026 logic bugs unrelated to credential issues. Fixing those = Phase 4.
- 4 demo tasks in user's live Supabase from screenshot prep — user can clean up via UI.
- Old Telegram token `7981658390:AAH...` is REVOKED. Anywhere in scrollback or history is dead data.
- **The new Telegram bot token + service_role JWT are NOT in my working memory anymore**. If asked about either, ask the user to re-paste OR re-read from VPS env file.
