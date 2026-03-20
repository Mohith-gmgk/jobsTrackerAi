# ⚡ JobsTrackerAI — AI-Powered Job Tracker with Smart Matching

> Find your perfect job with AI-powered matching, natural language search, voice input, and smart application tracking.

**⚠️ Note:** Job Feed page takes **10-15 seconds** to load — this is normal. Jobs are fetched from Adzuna API first, then each job is scored against your resume using AI (Groq LLM). Please wait for the match scores (%) to appear on each card.

**Live Demo:** `[Your Deployed URL]` | **GitHub:** `[Your Repo URL]`

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                               │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Job Feed   │  │  Filters    │  │  Application │  │  AI Assistant │  │
│  │  + Best     │  │  Panel      │  │  Tracker     │  │  Chat Bubble  │  │
│  │  Matches    │  │  (50+skills)│  │  + Pie Chart │  │  + 🎙️ Voice   │  │
│  │  Applied ✓  │  │  Dark/Light │  │  + Follow-up │  │  + Memory     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         └────────────────┴─────────────────┴──────────────────┘          │
│                         Zustand Global Store                              │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTP (axios — 2min timeout for scoring)
                    ┌────────────────▼─────────────────┐
                    │        BACKEND (Fastify)           │
                    │                                    │
                    │  GET  /api/jobs ─────────────────► Adzuna API        │
                    │  POST /api/resume ───────────────► Firestore         │
                    │  POST /api/match ─────────────────► LangChain+Groq  │
                    │  POST /api/assistant ─────────────► LangGraph+Groq  │
                    │  CRUD /api/applications ──────────► Firestore        │
                    │  POST /api/resume-tips ───────────► Groq AI          │
                    │  POST /api/cover-letter ──────────► Groq AI          │
                    └──────────┬──────────┬─────────────┘
                               │          │
              ┌────────────────▼──┐  ┌────▼──────────────────────────────┐
              │   LangChain       │  │  LangGraph (AI Assistant)          │
              │   Job Matcher     │  │                                    │
              │  @langchain/groq  │  │  intent_classifier                 │
              │  llama-3.1-8b     │  │       ↓ (conditional edge)         │
              │  Score 0-100%     │  │  ┌──────────────────────────────┐  │
              │  Per-job explain  │  │  │ job_search | filter_update   │  │
              └───────────────────┘  │  │ _node      | _node → UI      │  │
                                     │  │            | help_node        │  │
                                     │  └──────────────────────────────┘  │
                                     │       ↓                             │
                                     │  response_formatter                 │
                                     └─────────────────────────────────────┘
                                                    │
                              ┌─────────────────────▼──────────────────────┐
                              │  Firebase (Spark Plan — Free)               │
                              │  Auth: Email/password                        │
                              │  Firestore: users + applications             │
                              │  No Storage needed (resume text in Firestore)│
                              └────────────────────────────────────────────┘
```

---

## All Features

### Core (Required)
- ✅ **Job Feed** — Real jobs from Adzuna API
- ✅ **7 Filters** — Role, Skills (50+), Date, Job Type, Work Mode, Location, Match Score
- ✅ **AI Matching (LangChain)** — Every job scored 0-100% against uploaded resume
- ✅ **Color Badges** — 🟢 Green >70%, 🟡 Yellow 40-70%, ⚪ Gray <40%
- ✅ **Best Matches** — Top 6-8 highest scoring jobs shown at top
- ✅ **Resume Upload** — PDF or TXT, stored as text in Firestore (no Storage billing)
- ✅ **Replace Resume** — 📄 Resume button in header anytime
- ✅ **Smart Apply Popup** — "Did you apply?" with Yes/No/Applied Earlier
- ✅ **Application Tracker** — Pipeline: Applied → Interview → Offer/Rejected
- ✅ **Timeline per Application** — Full status history with correct timestamps
- ✅ **AI Assistant (LangGraph)** — Directly controls UI filters from chat
- ✅ **Natural Language Search** — "Show me remote React jobs" → filters update
- ✅ **Product Help** — "How does matching work?" → AI answers
- ✅ **Applied ✓ Button** — Jobs you've applied to show green "✓ Applied" in feed

### Bonus Features
- ✅ **🎙️ Voice Input** — Click mic in AI chat, speak your query (Chrome)
- ✅ **💡 Resume Tips** — AI gives 3 actionable tips per job (~3 sec)
- ✅ **📧 Cover Letter** — AI generates personalized cover letter (~5 sec)
- ✅ **📊 Pie Chart Analytics** — Visual pipeline breakdown with rates
- ✅ **⏰ Follow-up Reminders** — Banner shows all pending applied jobs
- ✅ **☀️/🌙 Dark/Light Mode** — Full theme toggle in header
- ✅ **Conversation Memory** — AI remembers last 6 messages
- ✅ **Advanced LangGraph** — Conditional edges, 4-node routing

---

## Setup Instructions

### Prerequisites
- Node.js 20+, npm 10+
- Firebase project (free Spark plan)
- Groq API key — free at **https://console.groq.com**
- Adzuna API — free at **https://developer.adzuna.com**
- Anthropic API key — **https://console.anthropic.com**

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/jobstrackerai.git
cd jobstrackerai
npm run install:all
```

### 2. Firebase Setup

1. Create project at **https://console.firebase.google.com**
2. Enable **Authentication → Email/Password**
3. Enable **Firestore Database** (start in test mode)
4. **Web SDK config** → Project Settings → Your Apps → Web → Register → copy config
5. **Admin SDK** → Project Settings → Service Accounts → Generate new private key

**Create Firestore Composite Index:**
```
URL: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes
→ Composite tab → Create index
  Collection: applications
  Field 1: userId — Ascending
  Field 2: createdAt — Descending
  Scope: Collection
```

### 3. Fill Environment Variables

**`backend/.env`**
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
ADZUNA_APP_ID=your_id
ADZUNA_APP_KEY=your_key
ADZUNA_COUNTRY=us
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

**`frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Create Test User (run once)

```bash
node scripts/setup-firebase.js
```

Creates: `test@gmail.com` / `test@123`

### 5. Run Locally

```bash
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:3001**

⚠️ **Job Feed takes 10-15 seconds** — jobs are fetched then AI-scored sequentially. This is expected behavior.

---

## LangChain & LangGraph Usage

### LangChain: Job Matching (`backend/src/services/langchain/jobMatcher.js`)

```
Resume Text + Job Description
         ↓
   SystemMessage (scoring rubric prompt)
   HumanMessage (resume + job details)
         ↓
   ChatGroq via @langchain/groq (llama-3.1-8b-instant)
         ↓
   JSON: { score: 85, matchingSkills: [...], relevantExperience: "..." }
```

Jobs scored sequentially, 500ms apart to respect Groq rate limits (6000 TPM).

### LangGraph: AI Assistant (`backend/src/services/langgraph/`)

**4-node graph with conditional edges:**

```
__start__
    ↓
intent_classifier (Groq) → classifies: job_search | filter_update | clear_filters | help
    ↓ conditional edge
    ├─► job_search_node    → extracts search params → UPDATE_FILTERS action
    ├─► filter_update_node → extracts filter values → UPDATE_FILTERS action
    └─► help_node          → conversational answers → NONE action
    ↓
response_formatter → shapes final { message, uiAction }
    ↓
__end__
```

The `uiAction.payload` is sent to frontend → `applyFilterActions()` in Zustand updates filter state → job feed re-renders. **This is how AI controls the UI directly.**

### Prompt Design
- **Scoring:** Low temp (0.1), short prompts for speed, JSON-only output enforced
- **Intent:** Temp 0 for deterministic classification
- **Filters:** Temp 0, only extract explicitly mentioned fields
- **Help:** Temp 0.3 for natural conversation, 6-message history for memory

---

## AI Matching Logic

**Scoring rubric:**
- 80-100: Excellent (70%+ skills match, directly relevant experience)
- 50-79: Good (40-70% match, transferable experience)
- 20-49: Partial (some relevant skills)
- 0-19: Poor match

**Why it works:** LLM semantic understanding beats keyword matching — "React experience" matches "Frontend development with modern JS frameworks."

**Performance:** 20 jobs × 500ms = ~10-15 seconds total. First 8 jobs show scores while rest load.

---

## Popup Flow Design

1. Click **Apply →** → job URL opens in new tab
2. `visibilitychange` event fires when user returns
3. 800ms delay → popup appears: "Did you apply to X at Y?"
4. Three options:
   - **Yes, Applied** → saves with Firestore Timestamp
   - **Applied Earlier** → also saves (retroactive tracking)
   - **No, just browsing** → dismisses, nothing saved

**Edge cases:** Multiple Apply clicks → last job wins. Network failure → popup stays open to retry.

---

## AI Assistant UI: Floating Bubble (Bottom-Right)

**Why bubble over sidebar:**
- Mobile-first — 56×56px, never blocks job cards
- Filter panel still visible when AI updates filters
- Red ✕ close button — high contrast, easy to find
- Voice input 🎙️ — speak instead of type

---

## Scalability

**100+ jobs:** Client-side filtering is O(n), no extra API calls. Scoring is sequential per batch.

**10,000 users:**
- Firestore auto-scales horizontally
- Stateless Fastify backend → horizontal scaling behind load balancer
- Redis cache for Adzuna responses (jobs don't change per-second)
- Background queue (BullMQ) for scoring → instant API response
- Groq rate limits → upgrade to Dev tier or add retry with exponential backoff

---

## Tradeoffs

| Known Limitation | Production Fix |
|---|---|
| Job feed takes 10-15s | Background scoring queue |
| Groq 6000 TPM free limit | Paid tier or batching strategy |
| Voice input: Chrome only | Whisper API for all browsers |
| Resume text capped at 800 chars | Vector embeddings for full resume |
| No real-time application updates | Firestore real-time listeners |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Zustand, React Router |
| Backend | Node.js, Fastify |
| AI Matching | LangChain (`@langchain/groq`) |
| AI Orchestration | LangGraph (`@langchain/langgraph`) |
| LLM | Groq (llama-3.1-8b-instant) |
| Job Data | Adzuna API |
| Auth | Firebase Auth |
| Database | Firebase Firestore |
| Deployment | Render (backend) + Vercel (frontend) |
