# GrowFlow Project Memory & Skills

> **Purpose:** System memory for AI assistants working on GrowFlow  
> **Last Updated:** January 23, 2026  
> **Companion Doc:** [ROADMAP.md](./ROADMAP.md)

---

## 🎯 Project Identity

**What GrowFlow IS:**
- Personal task management companion
- Meeting notes → AI-extracted tasks → Visual progress (plant growth metaphor)
- Telegram-first with Web App dashboard
- Solo user focus (not team collaboration)

**What GrowFlow is NOT:**
- ❌ NOT a plant care app (that's "Sage AI" - different codebase)
- ❌ NOT a portfolio website (that's aksheywalia.in)
- ❌ NOT a team/enterprise tool
- ❌ NOT a calendar app (integrates with calendar, doesn't replace it)

---

## 🏗️ Architecture Decisions

### Tech Stack (Locked In)

| Layer | Choice | Why | Alternatives Rejected |
|-------|--------|-----|----------------------|
| **Backend** | Supabase | Postgres + Edge Functions + Auth + Realtime | Firebase (less SQL power) |
| **Automation** | n8n (self-hosted) | Visual workflows, Telegram integration | Zapier (expensive), custom code (maintenance) |
| **Mobile** | Capacitor | Web-first, single codebase | React Native (separate codebase) |
| **Frontend** | React + Vite + TypeScript | Fast builds, type safety | Next.js (overkill for SPA) |
| **Styling** | Tailwind CSS | Utility-first, consistent | CSS Modules, Styled Components |
| **Animations** | Framer Motion | Declarative, powerful | CSS animations (limited) |
| **AI** | OpenAI (GPT-4, Whisper, Vision) | Best quality | Claude (API less mature) |

### Design Standards

| Standard | Details |
|----------|---------|
| **Design System** | Apple Human Interface Guidelines (HIG) |
| **Dark Mode** | "GrowFlow Centurion" - luxury dark theme |
| **Colors** | Apple System Colors palette |
| **Interactions** | Smooth 200-300ms transitions, spring animations |
| **Mobile** | iOS-style bottom tab bar, safe area handling |

---

## ✅ DO's (Best Practices)

### UI/UX
- ✅ Use `useLayoutEffect` for theme application (prevents FOUC)
- ✅ Always handle safe areas for mobile notches
- ✅ Use custom components over native (Select, DatePicker) for Android consistency
- ✅ Add glassmorphic effects with `backdrop-blur-xl`
- ✅ Include loading states with plant emoji animations
- ✅ Celebrate completions (confetti, plant blooms)

### Code Architecture
- ✅ Extract complex logic into custom hooks (`useNoteProcessing`, `useUpdates`)
- ✅ Use contexts for global state (Theme, Auth, Toast)
- ✅ Keep Edge Functions minimal - offload to n8n where possible
- ✅ Use Supabase RLS policies for security
- ✅ Add database indexes for frequently queried columns

### Telegram Bot
- ✅ All bot logic lives in n8n workflows (not Edge Functions)
- ✅ Daily 9 AM IST digest is the core reminder mechanism
- ✅ Support multiple input types: text, voice, photo
- ✅ Use inline keyboards for quick actions

### Testing
- ✅ Test on actual Android device (emulator misses issues)
- ✅ Check dark mode AND light mode
- ✅ Verify auth flows don't show flash of wrong content

---

## ❌ DON'Ts (Anti-Patterns to Avoid)

### UI/UX Mistakes
- ❌ Don't use native `<select>` on Android WebView (styling breaks)
- ❌ Don't use `useEffect` for theme - causes FOUC
- ❌ Don't forget status bar styling for auth pages
- ❌ Don't use placeholder images - generate real ones or use emojis

### Code Mistakes
- ❌ Don't put Telegram logic in Supabase Edge Functions (use n8n)
- ❌ Don't create new workflows when existing ones can be modified
- ❌ Don't over-engineer - GrowFlow is a personal tool, not enterprise
- ❌ Don't add team/collaboration features (out of scope)

### Architecture Mistakes
- ❌ Don't mix projects - GrowFlow ≠ Sage AI ≠ Portfolio
- ❌ Don't use Firebase (we migrated to Supabase)
- ❌ Don't build desktop app before mobile is polished

### Bug Patterns to Watch
- ❌ Auth state race conditions causing blank screens
- ❌ Android autofill styling issues
- ❌ Dropdown text invisible on light backgrounds
- ❌ Theme not persisting across sessions

---

## 🐛 Known Bug Patterns & Fixes

| Bug Pattern | Root Cause | Fix |
|-------------|------------|-----|
| **FOUC on auth** | `useEffect` for theme | Use `useLayoutEffect` |
| **Android dropdown invisible** | Native select styling | Use custom Select component |
| **Blank screen on load** | Auth state not resolved | Wait for auth before rendering routes |
| **Status bar wrong color** | Theme not applied to native | Use `StatusBarManager` component |
| **Theme doesn't persist** | Local storage only | Sync to Supabase user preferences |

---

## 📊 Key Metrics & Context

### User: Akshey Walia
- Solo developer/user
- India timezone (IST)
- Primary device: Android
- Use case: Personal productivity, meeting action items

### Telegram Bot
- Handle: @growflowai_bot (or similar)
- Daily digest: 9 AM IST
- Supports: Text, Voice (Whisper), Photo (Vision OCR)

### Deployment
- Frontend: Vercel
- Backend: Supabase (hosted)
- Automation: n8n (self-hosted or n8n cloud)
- Mobile: Capacitor → Android APK

---

## 🔮 Vision & Principles

### Core Philosophy
> "Never forget a meeting action item. Never lose track of what matters."

### Guiding Principles
1. **Telegram-first**: Capture happens where you already are
2. **AI-powered**: Extraction, not manual entry
3. **Gamified**: Plant metaphor makes progress visible
4. **Personal**: Built for solo use, not teams
5. **Premium feel**: Apple-level polish, not MVP quality

### Competitive Positioning
| vs Competitor | GrowFlow Advantage |
|---------------|-------------------|
| TwinMind | Telegram-first, works outside meetings |
| Memorae.ai | AI task extraction, visual gamification |
| Todoist | AI intelligence, meeting origin tracking |
| Notion | Purpose-built, zero setup |

---

## 📝 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | `*Page.tsx` | `DashboardPage.tsx` |
| Hooks | `use*` | `useNoteProcessing.ts` |
| Contexts | `*Context.tsx` | `ThemeContext.tsx` |
| Utilities | `*Helpers.ts` | `premiumHelpers.ts` |
| Components | PascalCase | `PremiumTaskCard.tsx` |
| Edge Functions | kebab-case folders | `process-ai-notes/` |

---

## 🔗 Key File Locations

| Purpose | Location |
|---------|----------|
| Roadmap (source of truth) | `/Docs/ROADMAP.md` |
| This file | `/Docs/SKILLS.md` |
| Build APK workflow | `/.agent/workflows/build_apk.md` |
| Edge Functions | `/supabase/functions/` |
| Migrations | `/supabase/migrations/` |

---

## 🚀 Quick Reference: Common Tasks

### Building APK
```bash
# See /.agent/workflows/build_apk.md for full workflow
cd android && ./gradlew assembleDebug
```

### Running Dev Server
```bash
npm run dev
```

### Deploying Edge Functions
```bash
supabase functions deploy <function-name>
```

---

*This file should be updated whenever major decisions are made or lessons are learned.*
