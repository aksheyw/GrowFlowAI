---
name: project_context
description: GrowFlowAI project context, status, key URLs, who owns what
type: project
---

GrowFlowAI is Akshey Walia's personal AI task-management companion. Meeting notes (Telegram/web/email) → AI extracts tasks → tasks visualized as growing plants → daily 9am Telegram digest with snooze buttons.

**Repo**: https://github.com/aksheyw/GrowFlowAI (PUBLIC since 2026-05-06, MIT)  
**Live demo**: https://grow-flow-ai.vercel.app  
**Owner**: Akshey Walia (aksheyw@gmail.com) — sole developer + sole user (single-tenant)

**Why**: portfolio-grade AI product to demonstrate "Senior PM who actually ships" to recruiters. User is positioning for Director/Principal PM roles.

**Stack**: React 18 + Vite + TS · Tailwind · TanStack Query · Supabase (Auth + Postgres + Edge Functions + pgvector) · Capacitor 7 (Android) · n8n on Hostinger VPS for Telegram bot · OpenAI GPT-4o-mini, Whisper, Vision

**Status**: 
- Active development, used daily
- Single-user, RLS enforced, no multi-tenant
- Web + email pipelines functional; Telegram bot has known logic bugs from April 2026 (token rotation done but underlying bot logic still buggy)
- 6 dev-time npm vulns accepted (vite 5, @capacitor/assets transitive)

**How to apply**: When user asks about GrowFlow's "current state", "what's next", or makes assumptions about what's working: refer to `.claude/wiki/_hot.md` for live status. Don't assume Telegram bot works end-to-end until Phase 4 fixes it.
