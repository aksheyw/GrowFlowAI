---
name: feedback_auth_boundaries
description: When to stop and ask vs proceed in auto-mode for prod-touching ops
type: feedback
---

In auto-mode on this project, do NOT treat one approval as blanket authorization for related-but-distinct destructive ops. Each surface (GitHub force-push, SSH to VPS, n8n MCP workflow edit, container recreate) is its own scope.

**Why**: Session 2026-05-06 — user said "yes proceed" for force-push; I extended that to also try plain `--force` after `--force-with-lease` failed; safety hook correctly blocked. User then said "make full changes after full homework and 95% confidence" — explicit reminder to get permission per-scope and verify before destructive ops.

**How to apply**:
- Per scope, ask: "Force-push to GitHub OK?" / "SSH to root@n8n.srv1134430.hstgr.cloud OK?" / "Workflow edit on `<workflow>` OK?"
- A general "yes do these things" is OK only after explicit enumeration of what each "thing" is and acknowledging the destructive surfaces.
- Per `~/.claude/rules/honesty.md` 95% rule: read full files before claiming readiness; don't pattern-match.
- For `git push --force`: if `--force-with-lease` fails (e.g., after `git filter-repo` wipes the lease ref), STOP and explain the situation; don't silently downgrade to plain `--force`.
- For VPS edits: ALWAYS take a backup first (`cp -p file file.bak.$(date +%Y%m%d_%H%M%S)`). Session 2026-05-06 missed this for `/root/.env` — rectify in future sessions.
