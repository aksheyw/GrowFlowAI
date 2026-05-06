# 🌱 GrowFlowAI

> **Your meeting notes, turned into tasks that grow like plants.**

GrowFlowAI is a personal AI task-management companion. Forward a meeting note via Telegram, web, or email — the AI extracts WHO does WHAT by WHEN, drops them into a Supabase task store, and visualises each task as a plant that grows the more you tend it. Every morning at 9am, the Telegram bot sends a digest with inline `✅ Done` / `⏰ Snooze` / `📅 Tomorrow` buttons.

<p align="center">
  <img src="public/logo.png" alt="GrowFlowAI logo" width="100" />
</p>

<p align="center">
  <a href="public/screenshots/dashboard.png">
    <img src="public/screenshots/dashboard.png" alt="GrowFlowAI dashboard — tasks visualised as plants" width="800" />
  </a>
</p>

<p align="center">
  <em>Tasks as plants. They grow as you make progress.</em>
</p>

---

## Why I built this

I spend most of my day in meetings, and most action items I commit to in those meetings end up forgotten — buried under notes I never re-read. I wanted something that:

- Lived where I already work (Telegram, mostly)
- Required zero structured input (paste a transcript, forward an email, send a voice note — that's it)
- Made progress feel rewarding without being gimmicky (hence the plant metaphor — tasks visibly grow as you make progress on them)

I built it as a side-project to push myself end-to-end on a real product: web + Android (via Capacitor) + a Telegram bot orchestrated through n8n + AI processing on Supabase Edge Functions. It is opinionated, single-user, and actively in use.

---

## What it does

**Capture surfaces** — every one of these creates a structured task in seconds:

| Surface | Input | What happens |
|---------|-------|--------------|
| Telegram text | Plain message | LLM extracts tasks with assignee, deadline, priority |
| Telegram voice | Voice note | Whisper transcribes → LLM extracts tasks |
| Telegram photo | Photo of a whiteboard / sticky note | Vision OCR → LLM extracts tasks |
| Web app | Paste a meeting transcript | Same LLM pipeline + meeting summary + leadership brief |
| Email | Forward to the ingestion inbox | n8n parses → same pipeline |
| Voice rambling | Stream-of-consciousness recording | AI cleans it up, then extracts tasks |

**Output**

- A dashboard of tasks, each rendered as a plant whose growth stage tracks status (`Not Started → In Progress → Done`)
- A meeting note detail page with AI-generated 2–3 sentence summary, related tasks, and an exec-style leadership brief (TL;DR + decisions + action items in email/chat/document formats)
- "The Gardener" — chat-with-your-data RAG over all your past notes (pgvector embeddings, semantic search)
- Daily 9am Telegram digest of due/overdue tasks with one-tap action buttons
- Hybrid Google Calendar sync (tasks ↔ calendar events)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  CAPTURE                                                         │
│  Telegram (text / voice / photo)   Web app   Email forwarding    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  n8n on VPS                                                      │
│  – Whisper (voice) / Vision (photo) / direct (text)              │
│  – Sends `{user_id, note_text}` to Supabase Edge Function        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Edge Functions (Deno)                                  │
│  – process-ai-notes     LLM extracts WHO / WHAT / WHEN           │
│  – webhook-telegram-note Note ingestion entrypoint               │
│  – update-task-status   Auth-checked status updates              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Postgres (RLS-enforced)                                │
│  notes · tasks · task_details · profiles · notifications         │
│  + pgvector embeddings (Memory Maker → RAG)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │  React PWA   │  │  Telegram    │  │  Daily 9am   │
     │  + Capacitor │  │  bot replies │  │  digest job  │
     │  Android     │  │  (callbacks) │  │  (n8n cron)  │
     └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **React 18 + Vite + TypeScript** | Fast dev loop, type safety, modern build |
| Styling | **Tailwind + Framer Motion** | Utility-first + buttery animations |
| State / data | **TanStack Query + Supabase Realtime** | Server-state + push updates with one library |
| Routing | **react-router 7** | Latest, file-style routes |
| Mobile | **Capacitor 7 + PWA** (`vite-plugin-pwa`) | One codebase, web + Android |
| Backend | **Supabase** (Auth + Postgres + Edge Functions + pgvector) | Single platform, RLS, Deno edge runtime |
| AI | **OpenAI GPT-4o-mini, Whisper, Vision** (via n8n) | Task extraction, voice transcription, OCR |
| Automation | **n8n on Hostinger VPS** | Visual flows for Telegram bot + email + cron |
| Quality | **TypeScript strict + ESLint** | Cheap safety net |

---

## Local setup

> Recruiters: feel free to skip this — the [code](src/), [edge functions](supabase/functions/), and [migrations](supabase/migrations/) are the interesting bits.

### Prerequisites
- Node 18+
- A Supabase project
- (Optional) OpenAI API key for AI task extraction in the edge function (falls back to a regex parser without it)
- (Optional) An n8n instance + Telegram bot for the full Telegram experience

### Steps

```bash
# 1. Clone and install
git clone https://github.com/aksheyw/GrowFlowAI.git
cd GrowFlowAI
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase URL + anon key

# 3. Apply database schema (33 migrations)
npx supabase db push

# 4. Deploy edge functions
npx supabase functions deploy process-ai-notes
npx supabase functions deploy webhook-telegram-note
npx supabase functions deploy update-task-status

# 5. (Optional) Set OpenAI key for the edge function
npx supabase secrets set OPENAI_API_KEY=sk-...

# 6. Run
npm run dev
```

For the **Telegram bot** experience, see [`n8n/README.md`](n8n/README.md) — it walks through importing the sanitised workflow templates and wiring up your Telegram + Supabase + OpenAI credentials.

For the **Android** build:

```bash
npm run build
npx cap add android        # first time only
npx cap sync android
npx cap open android       # opens Android Studio
```

---

## Project structure

```
src/
├── components/        UI components (cards, modals, layout, theme)
│   ├── meeting-note/    Meeting detail UI (summary, tasks, leadership brief)
│   ├── notes/           Note editor + media input (voice / photo)
│   ├── premium/         Premium dashboard widgets
│   ├── task-detail/     Task hero plant + activity timeline
│   └── ui/              Atoms (Button, Card, DatePicker, Select, ...)
├── contexts/          AuthContext, ThemeContext, ToastContext
├── hooks/             React Query hooks (useTasks, useNotifications, ...)
├── lib/               Supabase client, API helpers, type defs
├── pages/             Route components (Dashboard, TaskDetail, AddNote, ...)
├── types/             Shared TypeScript types
└── utils/             Audio compression, premium helpers, text analysis

supabase/
├── functions/         3 Deno edge functions
└── migrations/        33 SQL migrations (schema, RLS policies, indexes)

n8n/                   Telegram bot workflow exports (sanitised)
Docs/                  ROADMAP.md, SKILLS.md
```

---

## Screenshots

<table>
  <tr>
    <td align="center">
      <img src="public/screenshots/task-detail.png" alt="Task detail — hero plant and inline editing" width="380" />
      <br/><sub>Task detail · hero plant + inline editing</sub>
    </td>
    <td align="center">
      <img src="public/screenshots/meeting-note.png" alt="Meeting note with AI summary and extracted tasks" width="380" />
      <br/><sub>Meeting note · AI summary + extracted tasks</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="public/screenshots/telegram-digest.png" alt="Daily 9am Telegram digest with action buttons" width="380" />
      <br/><sub>Telegram digest · Done / Snooze / Tomorrow buttons</sub>
    </td>
    <td align="center">
      <img src="public/screenshots/mobile.png" alt="Android app with bottom tab bar" width="380" />
      <br/><sub>Android (Capacitor) · bottom tab bar</sub>
    </td>
  </tr>
</table>

## Status

Personal project, actively developed. Used daily by me. Not multi-tenant yet — single-user model with RLS. See [`Docs/ROADMAP.md`](Docs/ROADMAP.md) for what's built vs. what's planned.

## License

[MIT](LICENSE) © 2026 Akshey Walia
