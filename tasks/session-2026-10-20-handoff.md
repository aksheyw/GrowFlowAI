# Session handoff 2026-10-20 (security + model switch)

Read this as a list of claims. Provenance: (his call) binding, (verified) checked live this session, (my judgement) question it.
The rolling file tasks/session-handoff.md is from 2026-05-06 and is STALE for §2/§5.

## What changed (all verified live unless marked)
- RLS was OFF on profiles, calendar_events, portfolio_embeddings; anon had full grants. Fixed: RLS on, anon revoked, profiles owner-only SELECT. Migration 20261020000000. (verified: anon gets 42501)
- Sign-up stays open: repo is a public demo. (his call) DECISIONS.md
- Chinese models allowed for GrowFlow only. (his call) DECISIONS.md
- n8n webhooks now need a Supabase login (Code node "Verify Caller"): calendar sync r3Cs9x5QxDoCApPR (+ task ownership), summary 9E4IIiq8GCelpKwl (+ note ownership), transcriber folbVjsJtikIr0n6, vision reNdB5g2HVUxhhLR. App sends the token via src/lib/n8n.ts. (verified: no/fake token rejected; real logged-in calls pass for all four)
- Gardener chat workflow Ugb2TKmnuRFA4Scf UNPUBLISHED (only caller is the inactive Telegram bot). Needs auth before re-enabling.
- Task extraction (edge fn process-ai-notes v12+): DeepSeek deepseek/deepseek-v4.1-flash via OpenRouter first, gpt-4o-mini fallback, then regex parser. OPENROUTER_API_KEY set in Supabase secrets by owner. Codex review caught a fallback bug, fixed. (verified with one real note)
- Summary: prompt no longer assumes 2024; meeting_title/meeting_date now saved; date clamped to not be after the note's save date. (verified)
- Vision: placeholder OpenAI credential replaced, binary data0->data mapping, responseCode types fixed. (verified: test image transcribed)
- Calendar: manual sync no longer duplicates when an event exists; links point to grow-flow-ai.vercel.app. (verified "updated")
- vercel.json SPA rewrite for deep links. (deploying at session end; my judgement it works)
- Ship gate: build check enabled (.shipgate.json).
- New MCP connections in Claude Code: supabase-growflow, n8n-mcp (copied from desktop).

## Open (owner action or next session)
1. Owner: delete duplicate "Prepare mockups" Google Calendar event on Nov 22 (my test made it).
2. DONE 2026-10-21: Email Ingestion and Memory Maker were readable through n8n-mcp after all; neither calls process-ai-notes.
3. DONE 2026-10-21: process-ai-notes v13 binds user_id to the caller's login; service key still allowed; note ownership checked. (verified: anon-only call 401; logged-in app note created a task under the right owner)
4. DONE 2026-10-21: the key leaked in FAILED runs (HTTP Request error records), not successful ones. Summary workflow's 3 Supabase HTTP nodes now use the n8n credential Izgj68viMSbUDE1o; its 11 old failed runs deleted. (verified: summary run 19823 saved title/date/brief)
4b. DONE 2026-10-21 (found by Codex): webhook-telegram-note (verify_jwt off) accepted any user_id with no login. v7 now requires the service key. (verified: no-key and anon-key calls 401) Bot payload sends telegram_id, not user_id, so the bot path was already broken.
4c. OPEN, owner call: one medium follow-up on task assignment. Detail only in the gitignored ledger .claude/wiki/open-security-findings.md.
5. Telegram bot (P1 from May) still inactive.
6. Model upgrades not done: voice cleanup node (gpt-4o-mini), brief (gpt-4.1: DeepSeek Pro too slow, Flash untested), vision (gpt-4o). Evidence: tasks/model-compare-2026-10-20.md.
7. Calendar/bot SQL interpolation: manual path now UUID-validated; Telegram bot path still raw.

## Evidence files
tasks/n8n-audit-2026-10-20.md · tasks/model-compare-2026-10-20.md (+ .raw.json) · tasks/openrouter-models-2026-10-20.txt · tasks/codex-review-process-ai-notes.md · tasks/codex-review-auth-binding.md · .claude/wiki/open-security-findings.md
