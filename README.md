# ⚡ JobsTrackerAI — AI-Powered Job Tracker with Smart Matching

<div align="center">

![JobsTrackerAI](https://img.shields.io/badge/JobsTrackerAI-AI%20Powered-6366f1?style=for-the-badge&logo=lightning&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Fastify-68A063?style=for-the-badge&logo=node.js&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-AI%20Matching-1C3C3C?style=for-the-badge)
![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-1C3C3C?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**A full-stack AI-powered job tracking platform that fetches real jobs, intelligently matches them to your resume, and lets a conversational AI assistant control your search filters in real time.**

[Live Demo](https://jobs-tracker-ai.vercel.app) · [GitHub Repository](https://github.com/Mohith-gmgk/jobsTrackerAi)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [LangChain & LangGraph Usage](#langchain--langgraph-usage)
- [AI Matching Logic](#ai-matching-logic)
- [Popup Flow Design](#popup-flow-design)
- [AI Assistant UI Choice](#ai-assistant-ui-choice)
- [Scalability](#scalability)
- [Tradeoffs](#tradeoffs)

---

## Overview

JobsTrackerAI is a production-grade job tracking application built for the modern job seeker. It combines real-time job data from the Adzuna API with AI-powered resume matching and a conversational assistant that directly manipulates UI state — no manual filter clicks required.

> ⚠️ **Note:** The Job Feed takes **10-15 seconds** to fully load. Jobs appear within 2-3 seconds, then AI match scores are calculated in the background. This is expected behavior during AI scoring.

**Test Credentials:**
- Email: `test@gmail.com`
- Password: `test@123`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND  (React 18 + Vite)                    │
│                                                                     │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │   Job Feed   │  │   Filters   │  │ Application │  │    AI    │ │
│  │  + Scoring   │  │  50+ Skills │  │   Tracker   │  │Assistant │ │
│  │  + Applied✓  │  │  Dark/Light │  │  Pie Chart  │  │ + Voice  │ │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘  └────┬─────┘ │
│         └─────────────────┴─────────────────┴──────────────┘       │
│                        Zustand Global Store                         │
│           { jobs, filters, applications, user, resume }             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP / axios (2min timeout)
               ┌───────────────▼──────────────────┐
               │       BACKEND  (Fastify + Node.js) │
               │                                    │
               │  GET  /api/jobs          ────────► Adzuna Jobs API  │
               │  POST /api/resume        ────────► Firestore        │
               │  POST /api/match         ────────► LangChain + AI   │
               │  POST /api/assistant     ────────► LangGraph + AI   │
               │  CRUD /api/applications  ────────► Firestore        │
               │  POST /api/resume-tips   ────────► AI               │
               │  POST /api/cover-letter  ────────► AI               │
               └───────────┬──────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
   ┌──────▼───────┐              ┌──────────▼──────────────────────┐
   │  LangChain   │              │  LangGraph (AI Assistant)        │
   │  Job Matcher │              │                                  │
   │              │              │  __start__                       │
   │  ChatOpenAI  │              │      ↓                           │
   │  gpt-3.5     │              │  intent_classifier               │
   │  Score 0-100 │              │      ↓ (conditional edge)        │
   │  + Explain   │              │  ┌─────────────────────────┐    │
   └──────────────┘              │  │ job_search_node          │    │
                                 │  │ filter_update_node → UI  │    │
                                 │  │ help_node                │    │
                                 │  └─────────────────────────┘    │
                                 │      ↓                           │
                                 │  response_formatter              │
                                 │      ↓                           │
                                 │  __end__                         │
                                 └──────────────────────────────────┘
                                           │
                    ┌──────────────────────▼─────────────────────┐
                    │  Firebase  (Free Spark Plan)                │
                    │  ├── Auth: Email/Password authentication    │
                    │  └── Firestore: users + applications        │
                    └────────────────────────────────────────────┘
```

---

## Features

### ✅ Core Features (All Requirements Met)

| Feature | Description |
|---|---|
| **Real Job Feed** | Fetches live jobs from Adzuna API with pagination |
| **7 Smart Filters** | Role, Skills (50+), Date Posted, Job Type, Work Mode, Location, Match Score |
| **AI Job Matching** | LangChain scores every job 0-100% against your uploaded resume |
| **Color-Coded Badges** | 🟢 Green (>70%), 🟡 Yellow (40-70%), ⚪ Gray (<40%) |
| **Best Matches Section** | Top 6-8 highest scoring jobs displayed prominently at top |
| **Resume Upload** | PDF or TXT — text extracted and stored in Firestore |
| **Resume Replace** | Update resume anytime via 📄 button in header |
| **Smart Apply Popup** | "Did you apply?" popup on tab return with 3 options |
| **Application Tracker** | Full pipeline: Applied → Interview → Offer → Rejected |
| **Timeline per Application** | Timestamped history of every status change |
| **AI Assistant** | LangGraph-powered chat that directly controls UI filters |
| **Natural Language Search** | "Show remote React jobs" → filters update automatically |
| **Applied ✓ Indicator** | Jobs you've applied to show green "✓ Applied" badge in feed |
| **Product Help** | AI answers questions about all app features |

### 🚀 Bonus Features

| Feature | Description |
|---|---|
| **🎙️ Voice Input** | Speak queries in AI chat — Web Speech API (Chrome) |
| **💡 Resume Tips** | AI generates 3 specific, actionable tips per job |
| **📧 Cover Letter** | AI writes personalized cover letter from resume + job |
| **📊 Pie Chart Analytics** | Visual pipeline breakdown with interview & offer rates |
| **⏰ Follow-up Reminders** | Smart banner highlights applications needing follow-up |
| **☀️/🌙 Dark/Light Mode** | Full theme toggle with CSS variable system |
| **📱 Mobile Responsive** | Bottom navigation, slide-in filter drawer, dropdown menu |
| **🔀 Advanced LangGraph** | Conditional edges routing across 4 specialized nodes |
| **🧠 Conversation Memory** | AI remembers last 6 messages for contextual responses |
| **⚡ Background Scoring** | Jobs display instantly, AI scores load progressively |

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend Framework | React | 18.3 | UI components |
| Build Tool | Vite | 5.3 | Fast dev server + bundling |
| State Management | Zustand | 4.5 | Global app state |
| Routing | React Router | 6.26 | Client-side navigation |
| HTTP Client | Axios | 1.7 | API calls with interceptors |
| Animations | Framer Motion | 11.3 | Smooth transitions |
| Backend Framework | Fastify | 4.28 | High-performance Node.js server |
| AI Matching | LangChain (`@langchain/openai`) | 0.3 | Resume-job scoring chain |
| AI Orchestration | LangGraph (`@langchain/langgraph`) | 0.2 | Multi-node AI graph |
| LLM Provider | OpenAI GPT-3.5-turbo | — | Language model |
| Job Data | Adzuna API | v1 | Real-time job listings |
| Authentication | Firebase Auth | 10.12 | Email/password login |
| Database | Firebase Firestore | 10.12 | Applications + user data |
| File Parsing | pdf-parse | 1.1.1 | Resume PDF text extraction |
| Deployment | Vercel + Render | — | Frontend + Backend hosting |

---



## Authentication Design Decision

The assignment specifically states:

> *"Use the following test credentials: Email: test@gmail.com / Password: test@123"*

Based on this requirement, a **dedicated Login page with pre-filled test credentials** was implemented instead of a full Sign Up / Registration flow. Here's the reasoning:

### Why No Signup Page?

| Approach | Decision | Reason |
|---|---|---|
| Full Sign Up / Login flow | ❌ Not built | Assignment provides fixed test credentials — no new accounts needed |
| Login page only (pre-filled) | ✅ Built | Evaluators can login instantly without typing credentials |
| Social Auth (Google/GitHub) | ❌ Not built | Overkill for a fixed test credential scenario |

### What Was Built Instead

- **Login page** with `test@gmail.com` and `test@123` **pre-filled by default**
- Evaluators just click **"Sign In"** — no typing required
- Firebase Auth handles session management, token refresh, and security
- After login → Resume upload onboarding → Job Feed

### Benefits of This Approach

1. **Faster evaluation** — No signup flow to go through
2. **Consistent data** — All evaluators see the same test account
3. **Assignment compliant** — Directly follows the spec requirement
4. **Still secure** — Firebase Auth tokens protect all API endpoints

## LLM Provider: Why Groq?

The assignment lists **OpenAI / Anthropic / Gemini** as suggested LLM providers. During development, all three were evaluated:

| Provider | Tried | Result | Reason |
|---|---|---|---|
| **OpenAI GPT-3.5** | ✅ Yes | ❌ Not used | Requires minimum $5 billing — not feasible for assignment |
| **Anthropic Claude** | ✅ Yes | ❌ Not used | Model name compatibility issues with `@langchain/anthropic` version |
| **Gemini 1.5-flash** | ✅ Yes | ❌ Not used | `404 Not Found` — model not available in v1beta API with installed package version |
| **Gemini 2.0-flash** | ✅ Yes | ❌ Not used | Free tier quota = 0 requests — requires billing |
| **Groq (llama-3.1-8b-instant)** | ✅ Yes | ✅ **Selected** | Free, fast, full LangChain support, all features working |

### Why Groq is Valid for This Assignment

Groq is accessed via **`@langchain/groq`** — an official LangChain integration package. This means:

- ✅ **LangChain is still used** — `ChatGroq` extends `BaseChatModel`, uses `HumanMessage`, `SystemMessage`, `PromptTemplate` — all standard LangChain primitives
- ✅ **LangGraph is still used** — the 4-node graph with conditional edges is completely provider-agnostic
- ✅ **Switching providers** is a one-line change (`ChatGroq` → `ChatOpenAI`) — the architecture is identical
- ✅ **Production-ready** — Groq's free tier supports 30 RPM, 6000 TPM — sufficient for this use case

The core requirement is demonstrating **LangChain for matching** and **LangGraph for orchestration** — both are fully implemented regardless of the underlying LLM provider.

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm 10+
- Firebase project (free Spark plan)
- OpenAI API key — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Adzuna API credentials — [developer.adzuna.com](https://developer.adzuna.com)

### 1. Clone & Install

```bash
git clone https://github.com/Mohith-gmgk/jobsTrackerAi.git
cd jobsTrackerAi

# Install root dependencies
npm install

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Firebase Setup

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication → Email/Password**
3. Enable **Firestore Database** (start in test mode)
4. Get **Web SDK config** → Project Settings → Your Apps → Web
5. Get **Admin SDK key** → Project Settings → Service Accounts → Generate key

**Create Firestore Composite Index:**
```
Go to: Firestore → Indexes → Composite → Create index
Collection ID:  applications
Field 1:        userId      → Ascending
Field 2:        createdAt   → Descending
Query scope:    Collection
```

### 3. Environment Variables

**`backend/.env`**
```env
PORT=3001
FRONTEND_URL=http://localhost:5173

OPENAI_API_KEY=sk-proj-...

ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
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

### 4. Create Test User

```bash
node scripts/setup-firebase.js
```

This creates `test@gmail.com` / `test@123` in Firebase Auth.

### 5. Run Locally

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001/health

---

## LangChain & LangGraph Usage

### LangChain: Job Matching

LangChain orchestrates OpenAI GPT-3.5-turbo to score each job against the candidate's resume using a structured prompting pipeline:

```
Resume Text + Job Description
         ↓
   SystemMessage  (scoring rubric + JSON output format)
   HumanMessage   (resume snippet + job details)
         ↓
   ChatOpenAI  (gpt-3.5-turbo, temp=0.1)
         ↓
   JSON Output Parser
         ↓
   { score: 85, matchingSkills: [...], relevantExperience: "...", keywordsAlignment: "..." }
```

**File:** `backend/src/services/langchain/jobMatcher.js`

Jobs are scored sequentially with 200ms delay between requests. The `batchScoreJobs()` function processes all 20 jobs and returns normalized scores with explanations.

### LangGraph: AI Assistant

A 4-node directed graph with conditional routing handles all AI assistant interactions:

```
__start__
    ↓
intent_classifier          ← Classifies: job_search | filter_update | clear_filters | help
    ↓
    ├─► job_search_node    ← Extracts search params → UPDATE_FILTERS uiAction
    ├─► filter_update_node ← Extracts filter values → UPDATE_FILTERS uiAction
    └─► help_node          ← Generates conversational response → NONE uiAction
    ↓
response_formatter         ← Shapes { message, uiAction } response
    ↓
__end__
```

**File:** `backend/src/services/langgraph/graph.js`

The critical mechanism: every node returns a `uiAction` object. When `type === "UPDATE_FILTERS"`, the frontend's `useAssistant` hook calls `applyFilterActions()` in Zustand — **directly mutating filter state** and triggering a job re-fetch. This is how the AI controls the UI in real time without any user interaction.

### Prompt Design Philosophy

| Node | Temperature | Strategy |
|---|---|---|
| Job Matching | 0.1 | Low temp for consistent numeric scores |
| Intent Classifier | 0.0 | Deterministic classification |
| Filter Extractor | 0.0 | Only extract explicitly mentioned fields |
| Help Node | 0.3 | Slightly creative for natural conversation |

---

## AI Matching Logic

**Approach:** Rather than simple keyword counting (which is brittle), the LLM acts as an expert recruiter performing semantic comparison. It understands that "React experience" is relevant to a "Frontend JavaScript Developer" role even without exact keyword matches.

**Scoring Rubric:**

| Score Range | Meaning |
|---|---|
| 80 – 100 | Excellent match: 70%+ required skills present, directly relevant experience |
| 50 – 79 | Good match: 40-70% skills, transferable experience |
| 20 – 49 | Partial match: some relevant skills, limited experience alignment |
| 0 – 19 | Poor match: few shared skills or experience |

**Output per job:**
```json
{
  "score": 82,
  "matchingSkills": ["React", "TypeScript", "Node.js"],
  "relevantExperience": "3 years frontend development with React",
  "keywordsAlignment": "Strong overlap in modern JS stack"
}
```

**Performance Optimization:** Jobs are displayed immediately from Adzuna (2-3 seconds). Scoring runs as a background process, updating the UI progressively as each batch completes — eliminating the perceived 15-second wait.

---

## Popup Flow Design

**Why this design:**

When a user clicks "Apply →", the job opens in a new tab (preserving their session in the app). We listen for the `visibilitychange` event to detect when they return, then show a popup after an 800ms delay to avoid jarring the user.

**Three options cover every real-world scenario:**

| Option | Action | When to Use |
|---|---|---|
| ✅ Yes, Applied | Saves with current Firestore Timestamp | Normal application flow |
| 📅 Applied Earlier | Also saves (marked as applied) | Retroactive tracking |
| No, just browsing | Dismisses without saving | Accidental click |

**Edge cases handled:**
- Multiple Apply clicks → last job wins (popup overwrites)
- Network failure on save → toast error, popup persists for retry
- User closes tab without returning → popup remains on next return

---

## AI Assistant UI Choice: Floating Bubble

**Selected: Option A — Floating Chat Bubble (bottom-right)**

**Reasoning:**

1. **Non-intrusive** — Users can browse jobs while chat is closed. A sidebar would force a permanent space tradeoff.
2. **Mobile-first** — The bubble is always 56×56px regardless of screen size. A sidebar would consume 40% of mobile screen width.
3. **Filter feedback is visible** — When the AI updates filters, the left filter panel updates in real time. Users can see the effect without the chat panel blocking it.
4. **Clear close button** — Red ✕ button is high-contrast and immediately recognizable.
5. **Voice input integration** — The 🎙️ mic button fits naturally in the compact input bar.

---

## Scalability

### Handling 100+ Jobs

- Client-side filtering runs on the in-memory job array — O(n) complexity, no additional API calls
- AI scoring processes jobs in batches of 5 sequentially
- Pagination support ready via Adzuna `page` parameter

### Handling 10,000 Users

| Component | Current | At Scale |
|---|---|---|
| Firestore | Auto-scales horizontally | Implement security rules + indexes |
| Backend | Single Fastify instance | Multiple instances behind load balancer |
| AI Scoring | Per-request (synchronous) | Background queue (BullMQ + Redis) |
| Job Data | Fresh fetch per request | Redis cache (5min TTL) |
| Resume Storage | Text in Firestore | Vector embeddings in Pinecone |

---

## Tradeoffs

| Known Limitation | Production Solution |
|---|---|
| Job feed takes 2-15 seconds | Pre-score jobs in background queue; serve cached results |
| OpenAI API costs per request | Cache scores by jobId + resumeHash; invalidate on resume update |
| Voice input: Chrome only | Integrate OpenAI Whisper API for cross-browser support |
| Resume text capped at 1200 chars | Chunking + vector embeddings for full document analysis |
| No real-time application updates | Firebase Firestore real-time listeners (`onSnapshot`) |
| Single resume per user | Resume versioning with timestamp history |

---

## Bonus Features Implemented

| Bonus | Implementation |
|---|---|
| ✅ Advanced LangGraph | Conditional edges routing across 4 specialized nodes |
| ✅ Conversation Memory | Last 6 messages passed to helpNode for context |
| ✅ Smooth UI Animations | CSS keyframes + staggered `animation-delay` on cards |
| ✅ Voice Input | Web Speech API integrated in AI chat input |
| ✅ Mobile-First Design | Bottom navigation, slide-in filter drawer, responsive header |
| ✅ Resume Tips Generator | 3 specific, job-targeted tips per card |
| ✅ Cover Letter Generator | Personalized letter from resume + job description |
| ✅ Analytics Dashboard | Pie chart + interview rate + offer rate + avg match score |
| ✅ Follow-up Reminders | Smart banner for applications pending response |
| ✅ Dark / Light Mode | Full CSS variable theme system with instant toggle |

---

## Project Structure

```
jobsTrackerAi/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js              # Firebase Admin initialization
│   │   ├── routes/
│   │   │   ├── jobRoutes.js             # GET /api/jobs
│   │   │   ├── resumeRoutes.js          # POST/GET /api/resume
│   │   │   ├── matchRoutes.js           # POST /api/match
│   │   │   ├── assistantRoutes.js       # POST /api/assistant
│   │   │   ├── applicationRoutes.js     # CRUD /api/applications
│   │   │   ├── resumeTipsRoutes.js      # POST /api/resume-tips
│   │   │   └── coverLetterRoutes.js     # POST /api/cover-letter
│   │   ├── services/
│   │   │   ├── adzunaService.js         # Adzuna API + normalization
│   │   │   ├── langchain/
│   │   │   │   └── jobMatcher.js        # LangChain scoring chain
│   │   │   └── langgraph/
│   │   │       ├── graph.js             # LangGraph compiled graph
│   │   │       └── nodes/
│   │   │           ├── intentClassifier.js
│   │   │           ├── filterUpdateNode.js
│   │   │           ├── jobSearchNode.js
│   │   │           ├── helpNode.js
│   │   │           └── responseFormatter.js
│   │   └── server.js                    # Fastify entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIAssistant/             # Chat bubble + voice input
│   │   │   ├── ApplicationTracker/      # Tracker + pie chart + analytics
│   │   │   ├── Filters/                 # 50+ skill chips + 7 filters
│   │   │   ├── JobCard/                 # Card + score ring + tips + cover letter
│   │   │   ├── JobFeed/                 # Best matches + all jobs
│   │   │   ├── Layout/                  # Header (desktop + mobile)
│   │   │   ├── Common/                  # Apply popup
│   │   │   └── Resume/                  # Resume upload manager
│   │   ├── hooks/
│   │   │   ├── useJobFeed.js            # Fetch + background scoring
│   │   │   ├── useAssistant.js          # AI chat + filter mutations
│   │   │   ├── useApplyFlow.js          # Apply popup logic
│   │   │   ├── useVoiceInput.js         # Web Speech API
│   │   │   └── useFollowUpNotifications.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── OnboardingPage.jsx
│   │   │   └── MainPage.jsx
│   │   ├── services/
│   │   │   ├── api.js                   # Axios instance + all endpoints
│   │   │   └── firebase.js              # Firebase Web SDK
│   │   ├── store/
│   │   │   └── index.js                 # Zustand global store
│   │   ├── styles/
│   │   │   └── globals.css              # Design system + dark/light mode
│   │   └── utils/
│   │       ├── scoring.js               # Badge colors + client filters
│   │       └── toast.js                 # Notification system
│   ├── .env.example
│   └── package.json
├── scripts/
│   └── setup-firebase.js                # Creates test user
├── CLAUDE.md                            # Architecture reference
├── firestore.rules                      # Security rules
├── firestore.indexes.json               # Composite index definitions
├── .gitignore
└── README.md
```

---

<div align="center">

Built with ❤️ for the AI Engineering Internship Assignment

**Stack:** React · Fastify · LangChain · LangGraph · OpenAI · Firebase · Adzuna · Vercel · Render

</div>
