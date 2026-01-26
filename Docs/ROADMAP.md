# GrowFlow Holistic Roadmap v3.0

> **Created:** January 23, 2026  
> **Last Updated:** January 26, 2026  
> **Purpose:** Personal task management companion across Telegram + Web App + Desktop  
> **Core Philosophy:** Meeting notes → AI-extracted tasks → Visual progress (plant growth metaphor)

---

## 🎯 VISION STATEMENT

GrowFlow is your **always-available task companion** that lives where you already work:
- **Telegram**: Quick capture, reminders, status updates
- **Web App**: Full task management, dashboards, analytics
- **Desktop**: (Future) Native experience for power users

**The goal:** Never forget a meeting action item. Never lose track of what matters.

---

## 🏆 COMPETITIVE LANDSCAPE ANALYSIS

### What Makes GrowFlow Different

| Competitor | Their Focus | GrowFlow Advantage |
|------------|-------------|-------------------|
| **TwinMind** | Real-time meeting capture, browser extension | GrowFlow: Telegram-first, works without being in meetings |
| **Memorae.ai** | WhatsApp reminders, simple lists | GrowFlow: AI task extraction, visual gamification, calendar sync |
| **Reclaim AI** | Calendar auto-scheduling | GrowFlow: Meeting context, plant metaphor, Telegram native |
| **Motion** | Project management + calendar | GrowFlow: Simpler, personal focus, messaging-first |
| **Todoist** | Personal task lists | GrowFlow: AI intelligence, meeting origin tracking |
| **Notion** | Everything workspace | GrowFlow: Purpose-built, zero setup, gamified |

### Key Insights from Competitors

**TwinMind does well:**
- Real-time transcription during meetings
- Proactive suggestions (answers before you ask)
- Deep memory search across all notes
- Cross-device sync
- Follow-up email generation

**Memorae.ai does well:**
- WhatsApp-native (similar to GrowFlow's Telegram approach)
- Voice note reminders
- Daily briefings
- Follow-up reminders until task completed

**Reclaim AI does well:**
- AI auto-scheduling on calendar
- Focus time defense
- Habits scheduling
- Priority-based rescheduling
- Time tracking analytics

---

## 📊 CURRENT STATE (What's Built)

### ✅ Core Infrastructure - COMPLETE
| Component | Status | Details |
|-----------|--------|---------|
| User Authentication | ✅ Done | Supabase Auth, email/password |
| Database Schema | ✅ Done | profiles, notes, tasks, notifications |
| Real-time Updates | ✅ Done | Supabase subscriptions |
| RAG System | ✅ Done | pgvector embeddings, semantic search |

### ✅ Capture Methods - COMPLETE
| Method | Status | Workflow |
|--------|--------|----------|
| Web Note Input | ✅ Done | Paste notes → AI extracts tasks |
| Telegram Text | ✅ Done | Send message → Creates note/task |
| Telegram Voice | ✅ Done | Voice → Whisper transcription → Tasks |
| Telegram Photo | ✅ Done | Photo → Vision API OCR → Tasks |
| Email Ingestion | ✅ Done | Forward email → Auto-process |
| Voice Rambling | ✅ Done | Stream of consciousness → AI cleans up |

### ✅ UI/UX Pages - COMPLETE
| Page | Status | Key Features |
|------|--------|--------------|
| Dashboard | ✅ Done | Task grid, filters, plant visuals |
| Task Detail | ✅ Done | Hero plant, inline editing, activity timeline |
| Meeting Note Detail | ✅ Done | Context cards, related tasks, AI summary |
| Mobile Navigation | ✅ Done | iOS-style bottom tab bar |
| Profile/Settings | ✅ Done | User preferences, Telegram linking |
| Updates/Notifications | ✅ Done | Real-time notifications |

### ✅ AI Features - COMPLETE
| Feature | Status | Details |
|---------|--------|---------|
| Task Extraction | ✅ Done | WHO does WHAT by WHEN |
| Meeting Summary | ✅ Done | AI-generated 2-3 sentence summary |
| Leadership Summary | ✅ Done | Multi-format exec summaries |
| Chat with Data | ✅ Done | "The Gardener" RAG semantic search |
| Memory Maker | ✅ Done | Auto-embeddings for context |

### ✅ Integrations - COMPLETE
| Integration | Status | Details |
|-------------|--------|---------|
| Telegram Bot | ✅ Done | Full bidirectional |
| Google Calendar | ✅ Done | Hybrid sync (tasks ↔ events) |
| Email Ingestion | ✅ Done | growflowai@gmail.com forwarding |

### ✅ Reminders & Actions - COMPLETE
Based on the screenshot you shared, the Telegram bot workflow already has:
```
Daily 9 AM Trigger → Fetch Due Tasks → Has Tasks? → Group & Format Messages → Send Task Digest
```

**Telegram Action Buttons (Completed Jan 26, 2026):**
- ✅ Done button - marks task complete with `completed_at` timestamp
- ⏰ 2h button - snoozes task for 2 hours  
- 📅 Tmr button - snoozes task until tomorrow 9 AM
- Snoozed tasks excluded from daily digest via `snoozed_until` filter

---

## 🔴 GAPS IDENTIFIED (From Competitor Analysis)

### High Priority Gaps (What's Missing)

| Gap | Competitor Reference | Why It Matters | Effort |
|-----|---------------------|----------------|--------|
| **Proactive Suggestions** | TwinMind | AI suggests next actions without being asked | 6-8 hrs |
| **Follow-up Until Done** | Memorae.ai | Keep reminding until task marked complete | 3-4 hrs |
| **Time/Duration Tracking** | Reclaim, Motion | Know how long tasks actually take | 8-10 hrs |
| **Deadline Auto-Rescheduling** | Motion, Reclaim | When overdue, AI suggests new deadline | 4-6 hrs |
| **Weekly Review Summary** | TwinMind, Reclaim | Automated productivity insights | 4-5 hrs |
| **Priority Auto-Adjustment** | Motion | AI raises priority as deadline approaches | 3-4 hrs |

### Medium Priority Gaps

| Gap | Competitor Reference | Why It Matters | Effort |
|-----|---------------------|----------------|--------|
| **Habits/Recurring Tasks** | Reclaim | Regular activities that repeat | 6-8 hrs |
| **Focus Time Defense** | Reclaim | Block calendar for deep work | 4-5 hrs |
| **Multi-Language Support** | TwinMind | Hindi, etc. for Indian context | 6-8 hrs |
| **Natural Language Task Entry** | Todoist | "Call mom tomorrow at 5pm" → parsed task | 5-6 hrs |

### Lower Priority (Nice to Have)

| Gap | Competitor Reference | Effort |
|-----|---------------------|--------|
| **Browser Extension** | TwinMind | 10-15 hrs |
| **Desktop App** | Motion | 20-30 hrs |
| **Team Collaboration** | Asana | 15-20 hrs |
| **Public/Private Task Sharing** | Various | 6-8 hrs |

---

## 🗺️ HOLISTIC FEATURE MAP

### How Everything Connects

```
                                    ┌─────────────────────────────────────┐
                                    │         CAPTURE LAYER               │
                                    │  (How tasks enter the system)       │
                                    └─────────────────────────────────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
                    ▼                               ▼                               ▼
            ┌───────────────┐               ┌───────────────┐               ┌───────────────┐
            │   TELEGRAM    │               │    WEB APP    │               │    EMAIL      │
            │  ✅ Complete  │               │  ✅ Complete  │               │  ✅ Complete  │
            │               │               │               │               │               │
            │ • Text notes  │               │ • Paste notes │               │ • Forward to  │
            │ • Voice notes │               │ • Manual entry│               │   growflowai@ │
            │ • Photo OCR   │               │               │               │               │
            │ • Rambling    │               │               │               │               │
            └───────────────┘               └───────────────┘               └───────────────┘
                    │                               │                               │
                    └───────────────────────────────┼───────────────────────────────┘
                                                    │
                                    ┌─────────────────────────────────────┐
                                    │          AI PROCESSING              │
                                    │     ✅ Complete (Core)              │
                                    └─────────────────────────────────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
                    ▼                               ▼                               ▼
            ┌───────────────┐               ┌───────────────┐               ┌───────────────┐
            │ TASK EXTRACT  │               │   SUMMARY     │               │  EMBEDDINGS   │
            │  ✅ Complete  │               │  ✅ Complete  │               │  ✅ Complete  │
            │               │               │               │               │               │
            │ • WHO/WHAT/   │               │ • Meeting     │               │ • Memory      │
            │   WHEN        │               │   summaries   │               │   Maker       │
            │ • Priority    │               │ • Leadership  │               │ • RAG search  │
            │   inference   │               │   summaries   │               │               │
            └───────────────┘               └───────────────┘               └───────────────┘
                    │                               │                               │
                    └───────────────────────────────┼───────────────────────────────┘
                                                    │
                                    ┌─────────────────────────────────────┐
                                    │         TASK STORAGE                │
                                    │         ✅ Complete                 │
                                    │   (Supabase + Real-time)            │
                                    └─────────────────────────────────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
                    ▼                               ▼                               ▼
            ┌───────────────┐               ┌───────────────┐               ┌───────────────┐
            │  DASHBOARD    │               │  REMINDERS    │               │   CALENDAR    │
            │  ✅ Complete  │               │  ✅ Complete  │               │  ✅ Complete  │
            │               │               │               │               │               │
            │ • Task grid   │               │ • Daily 9 AM  │               │ • Hybrid sync │
            │ • Filters     │               │   digest      │               │ • Tasks as    │
            │ • Plant emoji │               │ • Telegram    │               │   events      │
            │               │               │   delivery    │               │               │
            └───────────────┘               └───────────────┘               └───────────────┘
                    │                               │                               │
                    └───────────────────────────────┼───────────────────────────────┘
                                                    │
                                    ┌─────────────────────────────────────┐
                                    │       INTELLIGENCE LAYER            │
                                    │       ⏳ Partially Built            │
                                    └─────────────────────────────────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
                    ▼                               ▼                               ▼
            ┌───────────────┐               ┌───────────────┐               ┌───────────────┐
            │   INSIGHTS    │               │  PROACTIVE    │               │   LEARNING    │
            │  ❌ Not Built │               │  ❌ Not Built │               │  ❌ Not Built │
            │               │               │               │               │               │
            │ • Weekly      │               │ • Suggestions │               │ • Preference  │
            │   review      │               │   before ask  │               │   tracking    │
            │ • Patterns    │               │ • Auto-remind │               │ • Time est.   │
            │ • Completion  │               │   until done  │               │   learning    │
            │   rates       │               │               │               │               │
            └───────────────┘               └───────────────┘               └───────────────┘
```

---

## 📅 PHASED ROADMAP

### ~~Phase A: Quick Wins~~ ✅ COMPLETE (Jan 26, 2026)
*Features that add immediate value with minimal effort*

| Feature | Description | Effort | Status |
|---------|-------------|--------|---------|
| **Quick Telegram Actions** | "✅ Done" "⏰ Snooze 2h" "📅 Tomorrow" buttons in task reminders | 4-5 hrs | ✅ Done |

---

## 📱 TELEGRAM ACTION BUTTONS - DETAILED SPEC

### User Experience

**Current State:**
```
🌱 *Good morning Akshey!*
No urgent tasks due today! 🎉
📋 *Backlog:* 1 task without deadline
→ Check your GrowFlow dashboard to prioritize
```

**New State (with action buttons):**
```
🌱 *Good morning Akshey!*

📋 *Due Today:*
1. Call Rohan Choudhary (High) - Saturday 11am
   [✅ Done] [⏰ 2hrs] [📅 Tomorrow]

2. Ping Sujoy Ghosh on WhatsApp (Medium) - Sunday 2pm
   [✅ Done] [⏰ 2hrs] [📅 Tomorrow]

📋 *Backlog:* 1 task without deadline
→ Check your GrowFlow dashboard to prioritize

🌿 _Water your tasks, watch your garden grow!_
```

### Button Actions

| Button | Action | Response Message |
|--------|--------|------------------|
| **✅ Done** | Sets `status = 'done'`, `completed_at = NOW()` | "🌺 Task completed! Your plant has bloomed!" |
| **⏰ 2hrs** | Sets `snoozed_until = NOW() + 2 hours` | "⏰ Got it! I'll remind you in 2 hours." |
| **📅 Tomorrow** | Sets `snoozed_until = tomorrow 9:00 AM IST` | "📅 Snoozed until tomorrow morning." |

### Technical Implementation

#### Database Change
```sql
-- Add snooze tracking to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMP WITH TIME ZONE;
```

#### n8n Workflow Changes

**1. Modify "Group & Format Messages" node:**

Update message formatting to include inline keyboard per task:

```javascript
// For each task, generate message with buttons
const tasks = $input.all();
const messages = tasks.map(task => ({
  text: `📋 *${task.json.task_description}*\n📅 Due: ${task.json.deadline}\n🔴 Priority: ${task.json.priority}`,
  reply_markup: {
    inline_keyboard: [[
      { text: "✅ Done", callback_data: `done_${task.json.id}` },
      { text: "⏰ 2hrs", callback_data: `snooze_2h_${task.json.id}` },
      { text: "📅 Tomorrow", callback_data: `snooze_tomorrow_${task.json.id}` }
    ]]
  }
}));
return messages;
```

**2. Add Callback Query Handler (new branch in telegram bot workflow):**

```
Telegram Trigger
  ↓
Switch: Check update type
  ├─ message → [existing flow]
  └─ callback_query → NEW BRANCH:
       ↓
     Parse callback_data
       ↓
     Switch: Action type
       ├─ "done_*" → 
       │    Supabase: UPDATE tasks SET status='done', completed_at=NOW() WHERE id=$taskId
       │    → Answer callback: "🌺 Task completed!"
       │    → Edit message: Add ~~strikethrough~~ to task text
       │
       ├─ "snooze_2h_*" →
       │    Supabase: UPDATE tasks SET snoozed_until=NOW()+'2 hours' WHERE id=$taskId
       │    → Answer callback: "⏰ Snoozed 2 hours"
       │
       └─ "snooze_tomorrow_*" →
            Supabase: UPDATE tasks SET snoozed_until=DATE_TRUNC('day', NOW()+'1 day')+'9 hours' WHERE id=$taskId
            → Answer callback: "📅 Reminder set for tomorrow 9 AM"
```

**3. Update Daily Digest Query:**

```sql
-- Exclude snoozed tasks from daily reminder
SELECT t.*, p.telegram_id
FROM tasks t
JOIN profiles p ON t.user_id = p.user_id
WHERE t.status != 'done'
  AND (t.snoozed_until IS NULL OR t.snoozed_until <= NOW())
  AND (
    t.deadline <= CURRENT_DATE + INTERVAL '1 day'  -- Due today or tomorrow
    OR t.deadline IS NULL  -- Backlog items
  )
ORDER BY t.deadline ASC NULLS LAST, t.priority DESC;
```

#### Callback Data Format
```
done_{task_uuid}
snooze_2h_{task_uuid}
snooze_tomorrow_{task_uuid}
```

Example: `done_a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Edge Cases to Handle

| Scenario | Handling |
|----------|----------|
| Button pressed twice | Check if already done/snoozed, show "Already completed" |
| Task deleted before button press | Show "Task no longer exists" |
| Snooze while already snoozed | Update snoozed_until to new time |
| Multiple tasks in one message | Each task gets its own button row |

### Testing Checklist ✅ ALL PASSED (Jan 26, 2026)
- [x] ✅ Done button marks task complete
- [x] ⏰ 2hrs button snoozes correctly  
- [x] 📅 Tomorrow button sets correct IST time (9 AM next day)
- [x] Snoozed tasks don't appear in next digest
- [x] Button feedback is instant (callback answer toast)

---

### Phase B: Voice Commands & Intelligence (Week 2-3) - 12-15 hours
*Make Telegram interactions feel natural*

| Feature | Description | Effort | Builds On |
|---------|-------------|--------|-----------|
| **Voice Commands** | "Mark done: call Rohan" via voice note → executes action | 6-8 hrs | Existing voice transcription |
| **Natural Language Input** | "Remind me to call mom tomorrow 5pm" → parsed task | 5-6 hrs | Existing AI processing |

---

## 🎤 VOICE COMMANDS - DETAILED SPEC

### User Experience

**Current State:**
User sends voice note → Transcribed → Creates new task/note

**New State:**
User sends voice note → AI detects if it's a COMMAND or a NOTE → Executes accordingly

### Supported Voice Commands

| Voice Input | Detected Intent | Action |
|-------------|-----------------|--------|
| "Mark done call Rohan" | `COMMAND:COMPLETE` | Find task matching "call Rohan", mark complete |
| "Complete the budget review task" | `COMMAND:COMPLETE` | Find task matching "budget review", mark complete |
| "Snooze ping Sujoy until tomorrow" | `COMMAND:SNOOZE` | Find task, set snoozed_until = tomorrow 9 AM |
| "Delete the meeting notes task" | `COMMAND:DELETE` | Find task, set status = 'deleted' |
| "Change priority of proposal to high" | `COMMAND:UPDATE` | Find task, update priority |
| "What tasks do I have today?" | `COMMAND:QUERY` | Return today's task list |
| "Need to call Rohan on Saturday..." | `NOTE:CREATE` | Normal flow - create task |

### Technical Implementation

#### AI Prompt for Intent Detection

```
System: You are GrowFlow's voice command interpreter. Analyze the transcribed voice input and determine:

1. Is this a COMMAND (action on existing task) or a NOTE (create new task)?
2. If COMMAND, extract:
   - action: COMPLETE | SNOOZE | DELETE | UPDATE | QUERY
   - task_identifier: keywords to match against existing tasks
   - parameters: (for SNOOZE: duration, for UPDATE: field + value)

Return JSON:
{
  "type": "COMMAND" | "NOTE",
  "action": "COMPLETE" | "SNOOZE" | "DELETE" | "UPDATE" | "QUERY" | null,
  "task_identifier": "keywords from user's speech",
  "parameters": { ... },
  "confidence": 0.0-1.0
}

Examples:
Input: "Mark done the call Rohan task"
Output: {"type": "COMMAND", "action": "COMPLETE", "task_identifier": "call Rohan", "confidence": 0.95}

Input: "I need to prepare the quarterly report by Friday"
Output: {"type": "NOTE", "action": null, "task_identifier": null, "confidence": 0.90}

Input: "Snooze the budget thing for 2 hours"
Output: {"type": "COMMAND", "action": "SNOOZE", "task_identifier": "budget", "parameters": {"duration": "2h"}, "confidence": 0.85}
```

#### n8n Workflow Changes

**Modify Audio-to-Action Transcriber workflow:**

```
Voice Note Received
  ↓
Transcribe (Whisper) - [EXISTING]
  ↓
NEW: Intent Detection (OpenAI)
  ↓
Switch: type
  ├─ "NOTE" → [existing flow: create task/note]
  │
  └─ "COMMAND" →
       ↓
     Switch: action
       ├─ "COMPLETE" →
       │    Fuzzy match task by task_identifier
       │    → If found: Mark complete, reply "✅ Done: {task_name}"
       │    → If not found: Reply "❓ Couldn't find task matching '{keywords}'"
       │
       ├─ "SNOOZE" →
       │    Fuzzy match task
       │    → Update snoozed_until
       │    → Reply "⏰ Snoozed: {task_name}"
       │
       ├─ "QUERY" →
       │    Fetch tasks matching criteria
       │    → Reply with task list
       │
       └─ "UPDATE" →
            Fuzzy match task
            → Update specified field
            → Reply "✏️ Updated: {task_name}"
```

#### Fuzzy Task Matching Query

```sql
-- Find best matching task using trigram similarity
SELECT id, task_description, 
       similarity(task_description, $search_term) as match_score
FROM tasks
WHERE user_id = $user_id
  AND status != 'done'
  AND similarity(task_description, $search_term) > 0.3
ORDER BY match_score DESC
LIMIT 1;
```

Note: Requires `pg_trgm` extension in Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Response Templates

| Scenario | Bot Response |
|----------|--------------|
| Task found & completed | "✅ Done! Marked complete: *Call Rohan Choudhary*\n🌺 Your plant has bloomed!" |
| Task found & snoozed | "⏰ Snoozed: *Call Rohan Choudhary*\nI'll remind you tomorrow at 9 AM" |
| Task not found | "❓ I couldn't find a task matching '*call rohan*'\n\nDid you mean one of these?\n• Call Rohan Choudhary (due Saturday)\n• Review Rohan's proposal (due Monday)" |
| Low confidence | "🤔 I'm not sure if you want me to:\n• Create a new task, or\n• Mark an existing task complete\n\nCould you clarify?" |
| Query response | "📋 *Your tasks for today:*\n1. Call Rohan Choudhary (High)\n2. Ping Sujoy on WhatsApp (Medium)" |

### Confidence Thresholds

| Confidence | Behavior |
|------------|----------|
| > 0.85 | Execute immediately |
| 0.6 - 0.85 | Execute but confirm: "I marked 'Call Rohan' as done. Was that right?" |
| < 0.6 | Ask for clarification |

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Multiple tasks match | Show top 3 matches, ask user to pick |
| Ambiguous command | "Did you mean mark done or snooze?" |
| Task already done | "That task is already complete!" |
| Empty query result | "You have no tasks for today! 🎉" |

---

### Phase C: User Experience Polish (Week 4) - 8-10 hours
*Make the existing features feel premium*

| Feature | Description | Effort | Status |
|---------|-------------|--------|--------|
| **Snooze Options Expanded** | Add "1 Week", "Pick Date" with AI parsing | 4-5 hrs | ✅ Done (Jan 26) |
| **Reasoning Transparency** | Show why AI set priority/deadline | 4-5 hrs | ⏳ Pending |
| **Task Edit via Telegram** | "Change deadline to Monday" command | 2-3 hrs | ⏳ Pending |

### Phase D: Desktop App (Month 2) - 20-25 hours
*Native experience for power users*

| Feature | Description | Effort | Strategic Value |
|---------|-------------|--------|-----------------|
| **Desktop App (Electron/Tauri)** | Native macOS/Windows app wrapping web | 15-20 hrs | Work-from-desktop users |
| **Menu Bar Quick Add** | Cmd+Shift+G to add task from anywhere | 3-4 hrs | Capture speed |
| **Notifications** | Native OS notifications for reminders | 2-3 hrs | Visibility |

**Desktop App Tech Options:**

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Electron** | Mature, easy, full Node.js | Heavy (100MB+), RAM hungry | Good for MVP |
| **Tauri** | Lightweight (3-5MB), Rust backend | Newer, less docs | Better long-term |
| **Capacitor** | Also does mobile | Web-wrapper feel | Skip for desktop |

**Recommended: Tauri** for lightweight native feel, but Electron for faster MVP.

### Phase E: Advanced Features (Month 3+) - 15-20 hours
*Nice-to-haves based on usage patterns*

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Habits/Recurring** | "Water plants every Sunday" auto-creates | 6-8 hrs | Medium |
| **Browser Extension** | Capture from any webpage | 10-15 hrs | Low |
| **Weekly Review** | Sunday productivity summary | 4-5 hrs | Low |

### Deprioritized (Not in Active Roadmap)

| Feature | Reason | Revisit When |
|---------|--------|--------------|
| Calendar bidirectional sync | Works well enough one-way | User feedback requests it |
| Analytics/patterns | Daily reminder sufficient | Want insights on productivity |
| Priority auto-escalation | Manual control preferred | Missing deadlines repeatedly |
| Team collaboration | Solo use case | If sharing with team |

---

## 🎯 PRIORITY MATRIX (Updated)

### Must Have (Immediate Focus)
1. ✅ Core task capture (DONE)
2. ✅ Telegram integration (DONE)
3. ✅ Daily reminders (DONE)
4. ✅ **Telegram Action Buttons** (DONE - Jan 26, 2026)

### Should Have (Next 2-3 Weeks)
1. ⏳ Voice Commands ("Mark done: call Rohan")
2. ⏳ Natural Language task entry
3. ✅ **Expanded Snooze Options** (DONE - Jan 26, 2026) - 1 Week, Pick Date with AI parsing

### Could Have (Month 2+)
1. ⏳ Desktop App (Tauri/Electron)
2. ⏳ Reasoning transparency
3. ⏳ Habits/recurring tasks

### Deprioritized
1. ❌ Calendar bidirectional sync
2. ❌ Analytics/patterns/insights
3. ❌ Priority auto-escalation
4. ❌ Team collaboration

---

## 📊 EFFORT SUMMARY (Updated)

| Phase | Features | Effort | Cumulative |
|-------|----------|--------|------------|
| A | Telegram Action Buttons | 4-5 hrs | 4-5 hrs |
| B | Voice Commands + NL Input | 12-15 hrs | 16-20 hrs |
| C | Polish & Snooze | 8-10 hrs | 24-30 hrs |
| D | Desktop App | 20-25 hrs | 44-55 hrs |
| E | Advanced (optional) | 15-20 hrs | 59-75 hrs |

**Recommended Sprint:**
- **Phase A**: This weekend (4-5 hours)
- **Phase B**: Next 2 weeks (12-15 hours)
- **Evaluate** before Phase C/D

---

## 🔧 TECHNICAL IMPLEMENTATION SUMMARY

### n8n Workflow Changes Needed

| Workflow | Change Type | Phase |
|----------|-------------|-------|
| `telegram bot` | Add callback query handler branch | A |
| `telegram bot` | Modify message formatting with inline keyboards | A |
| `Audio-to-Action Transcriber` | Add intent detection + command execution | B |

### Database Changes Needed

```sql
-- Phase A: Snooze support
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMP WITH TIME ZONE;

-- Phase B: Fuzzy matching support
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### No New Workflows Required
The existing telegram bot workflow will be modified rather than creating new workflows.

---

## 🎬 RECOMMENDATION

### This Weekend: Phase A (4-5 hours)

**Telegram Action Buttons Implementation:**

1. **Add `snoozed_until` column to tasks table** (5 min)
2. **Modify "Group & Format Messages" node** to include inline keyboards (1-2 hrs)
3. **Add Callback Query Handler branch** in telegram bot workflow (2-3 hrs)
4. **Update Daily Digest query** to exclude snoozed tasks (15 min)
5. **Test all button actions** (30 min)

### Next 2 Weeks: Phase B (12-15 hours)

1. **Voice Commands** (6-8 hrs)
   - Intent detection prompt
   - Fuzzy task matching
   - Action execution handlers
   
2. **Natural Language Task Entry** (5-6 hrs)
   - Parse "call mom tomorrow 5pm" style inputs
   - Handle relative dates ("next Tuesday", "in 3 days")

---

## ✅ DECISIONS MADE

| Item | Decision | Rationale |
|------|----------|-----------|
| Priority Auto-Escalation | ❌ Skip for now | Daily reminders sufficient |
| Desktop App | ✅ Keep in roadmap | Useful for work-from-desktop |
| Voice Commands | ✅ Add to Phase B | High value, natural extension |
| Calendar bidirectional sync | ❌ Very low priority | One-way works fine |
| Analytics/patterns | ❌ Very low priority | Daily reminder sufficient |

---

## 🔧 TECHNICAL NOTES

### Prerequisites for Phase A
- [ ] Supabase: Add `snoozed_until` column
- [ ] n8n: Access to telegram bot workflow
- [ ] Telegram Bot API: Inline keyboard support (already available)

### Prerequisites for Phase B  
- [ ] Supabase: Enable `pg_trgm` extension for fuzzy matching
- [ ] OpenAI: Access for intent detection (already have)

---

*Roadmap created: January 23, 2026*
*Last updated: January 26, 2026*
*Phase A completed: January 26, 2026*
*Expanded Snooze Options (Phase C) completed: January 26, 2026*
*Next milestone: Phase B (Voice Commands)*
