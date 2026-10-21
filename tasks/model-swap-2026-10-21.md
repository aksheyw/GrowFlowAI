# Model swap test: OpenAI -> Chinese models (2026-10-21)

Owner call (DECISIONS.md 2026-10-21): replace every OpenAI model in GrowFlow n8n with cheap Chinese models.
Harness: temp n8n workflow MJVWU659pwIpVSb8 via OpenRouter credential pkqRdXQOeVHVCrl0. Synthetic inputs only
(a `say`-generated voice note, a rendered note image, a made-up meeting note). One run each. Raw: model-swap-2026-10-21.raw.json.
Catalogue read live from openrouter.ai/api/v1/models on 2026-10-21; none of the picks has an expiration_date.

| Job | Model | Result | Cost/call |
|---|---|---|---|
| Voice cleanup (JSON) | deepseek-v4.1-flash | valid JSON, self-correction resolved | $0.0010 |
| | glm-5.3-flash | valid JSON | $0.00004 |
| | qwen3.8-flash | valid JSON | $0.0003 |
| Leadership brief | deepseek-v4.1-flash | parses; title+date right; 4 actions | $0.0018 |
| | glm-5.3-flash | parses; 3 actions (missed one) | $0.0001 |
| | qwen3.8-flash | did NOT parse | $0.0017 |
| Photo -> text | qwen3.8-flash / deepseek-v4.1-flash / glm-5.3-flash | all read every line; none kept the arrow; checkbox glyph test inconclusive (font lacked the glyph) | $0.0001 / $0.001 / $0.00001 |
| Voice -> text | qwen3.8-omni-flash | mp3, m4a, wav and webm all accepted; near-verbatim ("Q for" vs "Q4" on wav/webm) | $0.0001 |
| Embeddings @1536 dims | qwen3-embedding-8b / 4b | return 1536 dims (fits vector(1536)) | ~$0.000001 |

Picks: brief + voice cleanup + task fallback -> deepseek-v4.1-flash (best quality, still cheap);
photo -> glm-5.3-flash; audio -> qwen3.8-omni-flash; embeddings -> qwen3-embedding-8b (re-embed old rows: other vector space).
OpenRouter docs list no webm for audio, but the live test accepted it (my judgement: may vary by provider).

## Applied 2026-10-21 (verified live unless marked)
| Where | Before | After |
|---|---|---|
| Summary 9E4IIiq8GCelpKwl | gpt-4.1 (OpenAI node) | HTTP to OpenRouter: deepseek-v4.1-flash, fallback glm-5.3-flash. (verified: title, date, brief saved) |
| Voice 9 folbVjsJtikIr0n6 transcribe | Whisper translate | qwen3.8-omni-flash, English output. (verified: app upload of webm) |
| Voice cleanup | gpt-4o-mini | deepseek-v4.1-flash, fallback glm-5.3-flash. (verified: self-correction resolved) |
| Photo reNdB5g2HVUxhhLR | gpt-4o | qwen3.8-flash, fallback glm-5.3-flash. (verified: exact text; GLM primary misread "Q4" as "QA" once, so Qwen leads) |
| Memory Maker W7zIgkRU1YPDNV0z + Backfill Jv9SA24hKp0C5IQP | text-embedding-3-small | qwen3-embedding-8b @1536. All 15 notes re-embedded. (verified: 15/15 rows, 1536 dims) |
| Gardener Ugb2TKmnuRFA4Scf (inactive) | OpenAI embed + gpt-4o-mini | qwen3-embedding-8b + deepseek-v4.1-flash. (NOT run: workflow is off) |
| Reprocess 6hzcHY7LEKbQnVdt (inactive) | chatgpt-4o-latest | OpenRouter Chat Model deepseek-v4.1-flash. (NOT run) |
| Telegram bot IUBn7Hl4KqTEvk4b (inactive) | gpt-4.1-mini, Whisper, chatgpt-4o-latest, gpt-4o-mini x3 | deepseek/glm/qwen via OpenRouter; adapter Code nodes keep the old output shapes. (NOT run; Telegram voice is Ogg Opus, untested) |
| Edge fn process-ai-notes v14 | DeepSeek then gpt-4o-mini | DeepSeek then glm-5.3-flash, then regex. (verified: app note made the right task) |

No GrowFlow path calls OpenAI now. The OPENAI_API_KEY Supabase secret and n8n credential TJm1Ph1vGD2513AH are unused by GrowFlow (credential may serve other projects: do not delete without checking).
