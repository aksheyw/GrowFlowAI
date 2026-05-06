# n8n Workflows

This folder contains exported n8n workflow templates for the GrowFlowAI Telegram bot. They are **sanitised** — secrets have been replaced with `{{PLACEHOLDER}}` strings.

## Files

| File | What it does |
|------|--------------|
| `_growflow_ telegram bot.json` | Base bot — text/voice/photo capture, AI extraction, write to Supabase |
| `growflow_telegram_bot_with_buttons.json` | Adds inline `✅ Done` / `⏰ Snooze 2h` / `📅 Tomorrow` buttons on daily digests |
| `growflow_telegram_bot_with_expanded_snooze.json` | Latest — adds expanded snooze options and additional callback handlers |

## Importing into your n8n instance

1. In n8n, open **Workflows → Import from file**, pick one of the JSONs above.
2. Replace each placeholder before activating:

   | Placeholder | What to replace it with |
   |-------------|-------------------------|
   | `{{TELEGRAM_BOT_TOKEN}}` | Bot token from [@BotFather](https://t.me/BotFather) |
   | `{{ALLOWED_USERNAME}}` | Telegram username allowed to use the bot (access control) |
   | `{{ALLOWED_EMAIL}}` | Email address allowed to forward notes for ingestion |

3. Set up these n8n **credentials** (referenced by the nodes):
   - **Telegram API** — paste the bot token
   - **Supabase API** — your project URL + `service_role` key
   - **OpenAI / OpenRouter** — for voice (Whisper) + vision (OCR) + LLM extraction
   - **Gmail OAuth** (or IMAP) — for email ingestion

4. **Set the workflow timezone** to your local zone (default in the templates is `Asia/Kolkata`) under the workflow's *Settings* tab — schedule triggers respect this.

5. Activate the workflow and verify the webhook URL matches what your Supabase edge functions point to.

## Architecture

```
Telegram (text / voice / photo)
        ↓
n8n Telegram Trigger → access-control filter (username allow-list)
        ↓
Voice → Whisper transcription
Photo → Vision API OCR
Text  → straight through
        ↓
Code node: send `{ user_id, note_text }` to Supabase Edge Function
        ↓
Supabase Edge Function (`process-ai-notes`) → LLM → tasks table
        ↓
Daily 9am Schedule trigger → format digest → Telegram with inline buttons
        ↓
Callback handler → update `tasks.status` / `tasks.snoozed_until`
```
