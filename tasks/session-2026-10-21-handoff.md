# Session handoff 2026-10-21 (closes the 2026-10-20/21 session)

Read this as a list of claims, not a briefing. Tags: **(his call)** binding · **(verified)** checked live
this session · **(my judgement)** question it. Previous handoff: `tasks/session-2026-10-20-handoff.md`.
The rolling `tasks/session-handoff.md` is stale since 2026-05-06; this project uses per-session files.

## State
- Branch `main`, pushed to `dfd66c6` (verified). Tests 22/22, lint, typecheck, build, secret scan pass (verified).
- Live app: grow-flow-ai.vercel.app. Supabase `exkzusmktvaxpfayjycm`. n8n n8n.srv1134430.hstgr.cloud.
- Project is **parked** by the owner (his call).
- Untracked: `tasks/design-qa-2026-08-09.md` (August design review). Not from this session; left alone.

## What was done, and why
1. **Database leak closed (verified).** An outside email said `profiles` was readable with the public key.
   Three tables had row security off. Fixed with owner-only rules. Migration `supabase/migrations/20261020000000_profiles_owner_only_select.sql`.
2. **App webhooks need a login (verified).** Calendar, Summary, Voice and Photo workflows check the caller's
   Supabase login in a "Verify Caller" node. The app sends the token via `src/lib/n8n.ts`.
3. **Task function binds the user to the login (verified, v14).** Before, anyone with the public key could
   create tasks for any user. Now the public key alone gets 401.
4. **Telegram note function locked (verified, v7).** Codex found it accepted any `user_id` with no login.
   It now needs the service key. Its only caller (the bot) was already off.
5. **Service key out of n8n run records (verified).** It leaked in FAILED runs only. The Summary workflow
   now uses the n8n credential `Izgj68viMSbUDE1o`; 11 old failed runs were deleted. Wiki: `g-n8n-secrets-in-failed-runs`.
6. **Older bugs fixed (verified):** photo reading, summary dates and title, duplicate calendar events, deep-link 404s.
7. **Every AI call moved off OpenAI (his call; verified live for the active paths).** Routing table:
   `.claude/wiki/decisions/d-2026-10-21-openrouter-model-routing.md`. Test evidence: `tasks/model-swap-2026-10-21.md`.
   All 15 notes re-embedded with `qwen/qwen3-embedding-8b` at 1536 dims.
8. Nothing destructive to user data. Deleted only: 11 n8n failed-run records (held the key), 11 old note
   embeddings (rebuilt as 15), and my temporary test workflows. **(verified)**

## Owner decisions this session (his call, binding; also in DECISIONS.md)
- Sign-up stays open (public demo). · Chinese models allowed for GrowFlow only.
- Cross-account task assignment kept for now. · Duplicate "Prepare mockups" calendar event left in place.
- Model work: replace all OpenAI with cheap Chinese models that are not near retirement.

## Pending, in priority order
| P | Item | Why | Where |
|---|---|---|---|
| P1 | Design CRITICALs F08-F11: keyboard-unreachable task cards, failed load shown as onboarding, invisible focus ring, failed transcription deletes the recording | Real users would lose work or be blocked | `.claude/wiki/_findings.md` F08-F11, `tasks/design-qa-2026-08-09.md` |
| P2 | F12-F16 design HIGH/MEDIUM (F13 is his call: garden theme in a B2B tool) | Quality | same |
| P2 | F18: test the bot, Gardener and Reprocess once before switching any on; add a login check to the Gardener; fix the bot's raw SQL and its `telegram_id` payload | Untested model swap; known security gaps | `_findings.md` F01, F18 |
| P3 | F17: cross-account task assignment | Deferred by owner until real users | `_findings.md` F17 |
| P3 | Re-check model ids and retirement dates at openrouter.ai/api/v1/models | Models move monthly | routing decision page |
| P3 | Unused OpenAI key: Supabase secret `OPENAI_API_KEY`, n8n credential `TJm1Ph1vGD2513AH` | Check other projects use it before removing | — |
| P3 | Delete test notes/tasks ("Auth test", "Model swap test", "Q4 budget", "offsite venue") if wanted | Tidiness | Supabase `notes`, `tasks` |
| P3 | Decide whether to commit `tasks/design-qa-2026-08-09.md` | Repo is public | — |

## Rules the next session must keep
- Repo is PUBLIC. Never commit real note content or describe an unfixed hole in a tracked file.
  The detail of F17 lives only in the gitignored wiki and `.claude/wiki/open-security-findings.md`.
- Push only through `/ship`. Never print keys. Akshey logs into the app himself.
- `.claude/` is gitignored: the wiki is local-only.

## Links
- Wiki: `.claude/wiki/_hot.md`, `_findings.md`, `_log.md`, `open-security-findings.md`,
  `gotchas/g-n8n-secrets-in-failed-runs.md`, `gotchas/g-openrouter-audio-and-vision.md`,
  `decisions/d-2026-10-21-openrouter-model-routing.md`
- Evidence: `tasks/model-swap-2026-10-21.md`, `tasks/n8n-audit-2026-10-20.md`, `tasks/codex-review-auth-binding.md` (gitignored)
- Skills: `/ship`, `/design-qa`, `/wiki-lint`, `/doc-confluence`, `handoff-audit`, `prompting-codex`

## Recommended model and effort for the next session (my judgement)
- **Opus 5.5 at medium** for P1 (React fixes in 4 files plus tests). This is ordinary product code.
- **PAUSE and ask Akshey to raise to high** before: any change to auth, RLS, edge functions or n8n
  Verify Caller nodes, or switching any inactive workflow on (F18).
- **PAUSE and suggest low, or delegate to a Sonnet subagent,** for mechanical browser walkthroughs and bulk
  copy edits.
- Use Codex (not agy) for any security review, per the global routing rule.
