- **[P2] Failed parsing stops the fallback chain** — [index.ts:246–248](/Users/aksheywa/Documents/Claude%20Code/GrowFlowAI/supabase/functions/process-ai-notes/index.ts:246). The helper returns `[]` for missing content, invalid JSON, or a non-array response (lines 181–194). The new loop treats that as success and breaks, skipping OpenAI and the regex parser. Nonempty notes then become one raw-text task (lines 260–266), losing task splitting, assignees, and deadlines. Make malformed responses throw so the next provider runs; preserve valid `[]` separately.

**Claim 0: partially refuted.** With `OPENROUTER_API_KEY` unset, existing task-processing behavior is preserved. With it set, the stated fallback order applies only to thrown errors; unsuccessful parsing can bypass both fallbacks.

Static review only; no files modified or scripts run.

VERDICT: FIX