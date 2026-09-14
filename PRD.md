# Product Requirements Document (PRD) — Version 2

**Product Name:** StudyFlow  
**Document Owner:** Product Team  
**Date:** 2026-09-14  
**Status:** ✅ Final — V3 (all decisions resolved, ready for development)  

---

## 1. Executive Summary & Objectives

### Executive Summary

StudyFlow is a web-based platform that helps college and university students achieve high-efficiency studying through **AI-powered note expansion and summarization**. During lectures, students jot down only minimal notes — brief keywords, topic titles, or bullet-point fragments about the day's material. After class, StudyFlow's AI engine works in two stages: first, it **expands those fragments into complete, structured, and comprehensive study notes** covering full explanations, definitions, examples, and key takeaways; then, it **generates a concise summary** distilling the most critical points into a quick-review format.

This approach solves the core problem: students no longer need to choose between *listening* and *writing*. They capture just enough context during class (a few words per topic), and the AI fills in the rest — producing both detailed study material and a condensed summary, which would have taken hours to write manually.

### Objectives

| # | Objective | Measure of Success |
|---|---|---|
| O1 | Minimize in-class writing so students can focus on understanding the lecturer | ≥ 70% of active users report improved in-class focus (survey) |
| O2 | Drastically reduce post-lecture review/note-completion time | Average review time reduced by ≥ 40% vs. baseline |
| O3 | Produce study notes of equal or higher quality than manual notes | ≥ 80% of AI-expanded notes rated "useful" or "very useful" by users |
| O4 | Provide concise, high-signal summaries that enable rapid review before exams | ≥ 75% of users prefer StudyFlow summaries over their own manual summaries (survey) |
| O5 | Enable students to reallocate saved time toward supplementary learning or projects | ≥ 50% of active users report engaging in additional learning activities |
| O6 | Deliver a frictionless, web-first experience accessible on any device | 100% core functionality available via modern web browsers; no native install required |

---

## 2. Target Persona & User Stories

### Primary Persona

| Attribute | Detail |
|---|---|
| **Name** | Alex — "The Overloaded Student" |
| **Age** | 18–25 |
| **Role** | Full-time undergraduate or graduate student |
| **Pain Points** | Misses key lecture insights while writing notes; spends 2–3× lecture duration post-class reconstructing and completing notes; material not in textbook or online; too drained for deeper projects |
| **Tech Comfort** | High — uses laptop/tablet in class, comfortable with web apps |
| **Goals** | Understand lectures in real time, minimize review time, pursue independent study or projects |

### User Stories (Agile Format)

#### Must-Have (MVP)

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-01 | As a student, I want to **quickly jot down minimal notes** (keywords, topic titles, short bullet points) during a lecture so that I capture enough context without losing focus. | A fast, distraction-free note input area; supports plain text and simple bullet points; auto-saves every few seconds. |
| US-02 | As a student, I want to **trigger AI expansion** on my minimal notes so that they become complete, well-structured study material. | One-click "Expand Notes" action; AI generates comprehensive notes organized by topic with explanations, definitions, and key takeaways; completes within 30 seconds for a typical lecture's notes. |
| US-03 | As a student, I want to **review the AI-expanded notes side-by-side with my original input** so that I can verify accuracy and fill in any gaps. | Two-panel view: original notes (left) ↔ AI-expanded output (right); student can edit either side. |
| US-04 | As a student, I want the platform to **automatically generate a concise summary** of the expanded notes so that I have a quick-review cheat sheet for each lecture. | After expansion, an AI-generated summary appears with key concepts, definitions, formulas, and takeaways; summary length ≤ 20% of the expanded notes. |
| US-05 | As a student, I want to **switch between the full expanded notes and the summary view** so that I can choose the right level of detail for my study session. | Tab or toggle control to switch between "Full Notes" and "Summary" views within the same lecture page. |
| US-06 | As a student, I want to **provide course context** (course name, subject area, textbook, syllabus topics) so that the AI produces more accurate and relevant expansions. | Course profile with fields for subject, description, topics/syllabus, and optional textbook reference; AI uses this context during expansion. |
| US-07 | As a student, I want to **organize my notes by course and date** so that my materials are easy to navigate. | CRUD for courses; each note session is assigned to a course with a date and optional title; dashboard view with sorting/filtering. |
| US-08 | As a student, I want to **search across all my notes** (both original and AI-expanded) so that I can quickly find specific concepts. | Full-text search returns results with highlighted matches and links to the source note session. |
| US-09 | As a student, I want to **edit and refine the AI-expanded notes** so that I can correct errors or add personal insights. | Rich-text editor on the expanded notes; changes persist; version history for last 10 edits. |
| US-10 | As a student, I want to **re-expand or expand specific sections** so that I can iteratively improve the notes. | Select a section of original notes → click "Expand this section" → AI regenerates only that section; option to "Expand more" or "Make more concise" per section. |
| US-11 | As a student, I want to **create an account and log in securely** so that my data is private and persistent. | Email/password and OAuth (Google) sign-up/sign-in; sessions persist across browser tabs. |
| US-12 | As a student, I want to **share my notes with classmates** so we can collaboratively build better study materials. | Share a note session via invite link (view-only or edit access); shared notes appear in the recipient's dashboard under a "Shared with me" section; real-time sync for collaborative edits. |

#### Nice-to-Have (Phase 2)

| ID | User Story |
|---|---|
| US-13 | As a student, I want to **generate flashcards automatically** from my expanded notes so I can self-test efficiently. |
| US-14 | As a student, I want to **upload a syllabus or course outline** so the AI has deeper context for all my expansions in that course. |
| US-15 | As a student, I want to **export my notes** as PDF or Markdown files. |
| US-16 | As a student, I want to **see a "study guide" view** that aggregates key concepts across multiple lectures for exam prep. |
| US-17 | As a student, I want to **ask follow-up questions** about a topic in my notes and get AI explanations inline. |

---

## 3. Problem Statement & Proposed Solution

### Problem Statement

College students frequently attend lectures where the material is **not available in textbooks or online resources**. This forces them to spend the majority of class time writing comprehensive notes rather than listening, questioning, and understanding. The downstream effects are severe:

- **In-class:** Cognitive load is consumed by transcribing, not comprehending.
- **Post-class:** Students spend 2–3× the lecture duration reconstructing, completing, and organizing notes.
- **Long-term:** Reduced time and energy for deeper learning, research, or personal projects — limiting academic and professional growth.

Existing solutions like audio recording require phone-based hardware, generic note apps don't add intelligence, and shared Google Docs are unstructured. Students need a purpose-built tool that transforms minimal input into comprehensive study material.

### Proposed Solution

StudyFlow uses an **AI-powered note expansion and summarization** workflow:

```
┌──────────────────┐    ┌───────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Minimal Notes   │───▶│  Course Context    │───▶│  AI Expansion    │───▶│  AI Summary      │───▶│  Review & Edit   │
│ (keywords/titles │    │  (subject, syllabus│    │  (complete notes  │    │  (concise cheat   │    │  (verify, refine │
│  during class)   │    │   topics, textbook)│    │   with full       │    │   sheet of key    │    │   iterate)       │
└──────────────────┘    └───────────────────┘    │   explanations)   │    │   concepts)       │    └─────────────────┘
                                                  └──────────────────┘    └──────────────────┘
```

**How it works:**

1. **Capture (during class):** Student types brief keywords, topic titles, or one-line bullet points into a fast, minimal editor. Example input:
   - `"Fourier transform — breaking signals into frequencies"`
   - `"Convolution theorem — mult in freq = conv in time"`
   - `"Nyquist rate — 2× max frequency"`

2. **Contextualize:** The AI combines these notes with the student's course profile (subject area, syllabus, textbook info) for domain-specific accuracy.

3. **Expand (after class):** One-click triggers AI expansion. Each bullet point becomes a full paragraph or section with:
   - Clear explanation of the concept
   - Formal definitions and formulas where applicable
   - Illustrative examples
   - Connections to related topics in the course

4. **Summarize:** The AI automatically generates a **concise summary** from the expanded notes, distilling:
   - Key concepts and their one-line definitions
   - Critical formulas or rules
   - Must-know takeaways for the lecture
   - Summary length ≤ 20% of the expanded notes — designed for quick review and exam prep

5. **Review & Iterate:** Student reviews both the expanded notes and summary, edits as needed, and can re-expand or re-summarize specific sections for more depth or conciseness.

---

## 4. Core Features (Prioritized)

> [!IMPORTANT]
> **Solo developer, 7-day sprint (Sep 14–21, 2026).** Features are split into Day-by-Day P0 (must-ship) and P1 (ship-if-time). Collaborative note-sharing is deferred to Week 2 post-launch to protect the core loop.

### MVP (Phase 1) — Target Launch: September 21, 2026

#### P0 — Must Ship (Days 1–5)

| Feature | Description | Est. Effort |
|---|---|---|
| **User Authentication** | Supabase Auth: Google OAuth + email/password. Protected routes. Session persistence. | Day 1 |
| **Course Context Profiles** | CRUD for courses: name, subject area, description, syllabus topic list. Simple form + Supabase table. | Day 1–2 |
| **Fast Minimal Note Input** | Distraction-free textarea per lecture session. Plain text + bullet points. Auto-save to Supabase every 5 seconds. | Day 2 |
| **AI Note Expansion** | One-click "Expand Notes" → sends minimal notes + course context to Gemini API → returns structured, comprehensive notes. Markdown rendering. | Day 3 |
| **AI Lecture Summarization** | Automatically generates a concise summary after expansion. Key concepts, definitions, takeaways. ≤ 20% of expanded content length. | Day 3 |
| **Full Notes / Summary Toggle** | Tab control to switch between "Full Notes" and "Summary" views on the lecture page. | Day 3–4 |
| **Course & Note Organization** | Dashboard with course cards → course detail with lecture list sorted by date. | Day 4 |
| **Responsive Minimalist UI** | Clean, minimal design using Tailwind + shadcn/ui. Mobile-responsive. Neutral palette, generous whitespace. | Throughout |

#### P1 — Ship If Time (Days 5–7)

| Feature | Description | Est. Effort |
|---|---|---|
| **Side-by-Side Review View** | Two-panel layout: original notes (left) ↔ expanded notes (right). | Day 5 |
| **Editable Expanded Notes** | Allow students to edit the AI-expanded output. Persist changes. | Day 5 |
| **Section-Level Re-Expansion** | Select a section → re-expand with "More detail" / "More concise" options. | Day 6 |
| **Depth Level Toggle** | Per-section Brief / Standard / Deep Dive toggle. | Day 6 |
| **Full-Text Search** | Search across all notes. Highlighted match results with navigation. | Day 7 |
| **Landing Page** | Simple marketing page: value prop, demo screenshot, "Get Started" CTA. | Day 7 |

### Phase 1.5 — Week 2 Post-Launch

| Feature | Description | Priority |
|---|---|---|
| **Collaborative Note Sharing** | Share via invite link (view-only or edit). "Shared with me" section. Real-time sync via Supabase Realtime. | P1 |
| **Version History** | Last 10 edits on expanded notes, with restore capability. | P1 |

### Phase 2 — Post-Launch Enhancements

| Feature | Description | Priority |
|---|---|---|
| **Auto-Generated Flashcards** | AI extracts Q&A pairs from expanded notes for spaced-repetition review. | P2 |
| **Syllabus Upload & Parsing** | Upload a PDF/DOCX syllabus; AI extracts the topic list automatically to populate course context. | P2 |
| **Inline Q&A / Follow-Up** | Highlight a concept in expanded notes → ask the AI a follow-up question → answer appears inline. | P2 |
| **Exam Study Guide Generator** | Aggregate key concepts across multiple lecture notes into a single study guide. | P2 |
| **Export (PDF / Markdown)** | One-click export of notes (original + expanded + summary). | P3 |

---

## 5. User Flow / UI Expectations

### 5.1 High-Level User Flow

```
[Landing Page] ──▶ [Sign Up / Log In]
                        │
                        ▼
                 [Dashboard: My Courses]
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
     [Create New Course]    [Select Existing Course]
     (name, subject,              │
      syllabus topics)            ▼
              │           [Course Detail: Notes List]
              ▼                    │
     [Course Created] ◀───────────┘
                                   │
                        ┌──────────┴──────────┐
                        ▼                     ▼
              [New Note Session]       [View Past Notes]
              (minimal note input)           │
                        │                    ▼
                        ▼           [Full Notes ↔ Summary Toggle]
              [Type minimal notes            │
               during class]                 ▼
                        │           [Search / Navigate / Review]
                        ▼
              [Click "Expand Notes"]
                        │
                        ▼
              [AI Processing]
              (expand ≤ 30s, then summarize)
                        │
                        ▼
              [Side-by-Side Review]
              (original ↔ expanded)
                        │
                        ▼
              [Toggle: Full Notes ↔ Summary]
                        │
                        ▼
              [Edit / Re-expand / Done]
```

### 5.2 Key Screens

| Screen | Key Elements |
|---|---|
| **Landing Page** | Value proposition ("Type less, learn more"), CTA ("Get Started Free"), before/after demo showing minimal notes → expanded output |
| **Dashboard** | List of courses (cards), global search bar, "New Course" button, recent notes feed |
| **Course Setup** | Course name, subject area, description, syllabus topic list (tag-style input), optional textbook reference |
| **Course Detail** | Course title + context summary, list of note sessions sorted by date, "New Note Session" button |
| **Note Input (During Class)** | Full-screen minimal editor. Clean, fast, distraction-free. Auto-save indicator. Large "Expand Notes" button visible but unobtrusive. |
| **AI Expansion Processing** | Brief loading state (≤ 30s) with progress indicator; shows "Expanding…" then "Summarizing…" |
| **Side-by-Side Review** | Two-panel layout: **left** = original minimal notes (read-only), **right** = AI-expanded output (editable, rich-text). Per-section actions: "Re-expand," "More detail," "More concise." Toggle at top-right to switch to Summary view. Top bar: note title, date, course breadcrumb. |
| **Summary View** | Concise, scannable cheat sheet: key concepts as bold headings, one-line definitions, critical formulas in highlighted blocks, must-know takeaways as a numbered list. "Switch to Full Notes" toggle. Editable. |
| **Search Results** | Query input, list of matching excerpts with course/note context and click-to-navigate |

### 5.3 Branding & Design (Minimalist)

**Design philosophy:** Less is more. The UI should feel like a clean notebook — students should feel calm and focused, not overwhelmed.

| Element | Guideline |
|---|---|
| **Color Palette** | Neutral base (white/off-white background, dark gray text). Single accent color (e.g., soft blue or indigo) for CTAs and active states. No bright or competing colors. |
| **Typography** | Clean sans-serif (Inter or system font stack). Two sizes max per screen: heading + body. Generous line height (1.6+). |
| **Spacing** | Generous whitespace. Content should breathe. Cards and sections have ample padding. |
| **Components** | shadcn/ui defaults — simple, accessible, consistent. No custom animations or decorative elements. |
| **Icons** | Lucide icons (bundled with shadcn). Line-style only. Used sparingly. |
| **Layout** | Max content width (768–1024px). Centered. No sidebar in note input view. Dashboard uses a simple card grid. |
| **Dark Mode** | Not in MVP. Consider for Phase 2. |

### 5.4 UI Principles

- **Speed-first for note input:** The note editor must load instantly and feel like a blank sheet of paper. Zero friction to start typing.
- **Minimalist & distraction-free:** Students are already cognitively loaded in class; the UI must be calm and clear.
- **Clear before/after mental model:** The platform's value should be visually obvious — tiny input becomes rich output.
- **Accessibility:** WCAG 2.1 AA compliance (keyboard navigation, screen reader support, sufficient contrast).
- **Mobile-responsive:** Fully functional on phones and tablets for on-the-go review (input is optimized for laptop/tablet in class).

---

## 6. Success Metrics & KPIs

### Leading Indicators (Predictive — Measured Weekly)

| Metric | Target (3 months post-launch) | Measurement Method |
|---|---|---|
| Weekly Active Users (WAU) | ≥ 20 (initial cohort); grow 50% month-over-month via word-of-mouth | Analytics (e.g., Mixpanel/GA) |
| Note Sessions Created per User per Week | ≥ 3 | Application database |
| AI Expansion Trigger Rate | ≥ 85% of note sessions are expanded | Application database |
| Expansion Quality Rating | ≥ 4.0 / 5.0 user rating per expansion | In-app feedback prompt (thumbs up/down + optional rating) |
| Summary Quality Rating | ≥ 4.0 / 5.0 user rating per summary | In-app feedback prompt on summary view |
| Summary View Usage | ≥ 60% of users who expand notes also view the summary | Analytics |
| Edit Rate on Expanded Notes | ≤ 30% of expanded content is manually edited (indicates high AI quality) | Diff analysis on expanded notes |
| Feature Adoption: Search Usage | ≥ 40% of WAU use search weekly | Analytics |

### Lagging Indicators (Outcome — Measured Monthly/Quarterly)

| Metric | Target | Measurement Method |
|---|---|---|
| User-Reported Reduction in Review Time | ≥ 40% reduction vs. pre-StudyFlow baseline | In-app survey (onboarding baseline + 30-day follow-up) |
| User Retention (Month-over-Month) | ≥ 60% M1 retention | Cohort analysis |
| Net Promoter Score (NPS) | ≥ 40 | Quarterly NPS survey |
| Organic Growth (Referral Rate) | ≥ 20% of new sign-ups come from existing user referrals | Analytics (referral tracking) |
| Time Reallocated to Additional Learning | ≥ 50% of active users report doing extra learning | Quarterly survey |

---

## 7. Out of Scope / Edge Cases

### Out of Scope for V1

| Item | Rationale |
|---|---|
| **Audio recording / transcription** | Requires phone hardware; not aligned with the web-first, text-input mechanism. |
| **Native mobile apps (iOS/Android)** | Web-first strategy; responsive web covers mobile use cases for MVP. |
| **Video content processing** | Adds significant complexity; text-based note expansion is the core value proposition. |
| **LMS integration (Canvas, Blackboard, Moodle)** | Requires partnership agreements and technical integrations; deferred to Phase 3+. |
| **Instructor-facing features** | V1 focuses solely on the student experience. |
| **Offline AI expansion** | Expansion requires cloud LLM processing; offline is not feasible for MVP. Offline note-taking (with sync-on-reconnect) is a Phase 2 consideration. |
| **Multi-language support** | English only for MVP; multi-language expansion deferred. |

### Edge Cases to Address

| Edge Case | Handling |
|---|---|
| **Notes too vague for meaningful expansion** | AI returns a "low confidence" warning and asks clarifying questions (e.g., "Can you specify the topic area for 'theorem proof'?"). Expansion is still attempted with best-effort output. |
| **Notes for highly niche/obscure topics** | Course context (syllabus, textbook) helps ground the AI. If the topic is unknown, the AI flags sections as "[Needs review — topic not recognized]." |
| **Very long note sessions (> 100 bullet points)** | Process in batches; show progress per batch. Enforce a soft limit with a warning. |
| **Student provides incorrect course context** | Expanded notes may be inaccurate; mitigated by the review step. Encourage students to update course context if results seem off. |
| **Concurrent editing during expansion** | Lock the original notes input during AI processing; unlock after expansion completes. |
| **AI hallucination / incorrect information** | Prominent "AI-generated — please verify" label on all expanded content. Easy inline editing to correct errors. Feedback button to report inaccuracies. |
| **Account data deletion requests** | Implement GDPR-compliant data export and deletion flow accessible from account settings. |

---

## 8. Technical Assumptions & Constraints

### Monetization Model

**Free for all users.** No paid tiers, no ads, no feature gating. The goal is maximum adoption and impact among students. AI API costs are managed through smart rate limiting (e.g., daily expansion quota per user) and efficient prompt engineering to minimize token usage.

| Consideration | Approach |
|---|---|
| **Revenue** | None (free product). Future consideration: institutional sponsorship, grants, or optional donations. |
| **Cost Control** | Per-user daily expansion quota (e.g., 10 expansions/day); caching of common expansions; efficient prompt design to minimize tokens. |
| **Sustainability** | Monitor cost-per-user monthly. If costs grow unsustainably, introduce a waitlist or seek institutional funding before considering premium tiers. |

### Recommended Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | **Next.js 14+ (React)** | Best ecosystem for web apps; SSR for fast landing page SEO; App Router for modern layouts; massive community and hiring pool. |
| **Styling** | **Tailwind CSS + shadcn/ui** | Rapid UI development; consistent design system; accessible components out of the box. |
| **Backend** | **Next.js API Routes + Server Actions** | Full-stack in one framework; reduces deployment complexity; serverless-friendly. |
| **Database** | **PostgreSQL via Supabase** | Free tier includes auth, database, and real-time subscriptions; scales well; SQL for complex queries on notes/courses. |
| **Auth** | **Supabase Auth** | Built-in email/password + Google OAuth; JWT sessions; free tier generous for student apps; eliminates custom auth code. |
| **AI/ML** | **Google Gemini API (Gemini 2.0 Flash)** | Generous free tier; fast inference; strong at structured content generation; cost-effective at scale. Fallback: OpenAI GPT-4o-mini. |
| **Hosting** | **Vercel (Frontend + API)** | Free tier for Next.js; automatic deployments from Git; edge functions for low latency. |
| **Monitoring** | **Vercel Analytics + Sentry (free tier)** | Performance monitoring and error tracking at zero cost. |
| **Version Control** | **GitHub** | Free for public/private repos; integrates with Vercel for CI/CD. |

### AI Expansion Tone & Depth

The AI produces output in a **conversational "study buddy" tone** — friendly, clear, and approachable rather than textbook-formal. Students can **toggle between depth levels** per section:

| Depth Level | Description | Example Output |
|---|---|---|
| **Brief** | One-line definition + key formula (if any). For quick scanning. | "**Fourier Transform** — Decomposes a signal into its constituent frequencies. Formula: F(ω) = ∫f(t)e^(-iωt)dt" |
| **Standard** (default) | 2–3 paragraph explanation with definition, intuition, and a worked example. Conversational tone. | Full explanation with "Think of it like…" analogies and a step-by-step example. |
| **Deep Dive** | Comprehensive coverage: formal definition, intuition, multiple examples, edge cases, connections to other topics. | Textbook-level detail but in friendly language, with practice problems suggested. |

- Default depth: **Standard**
- Students toggle depth per-section via a simple control (e.g., dropdown or segmented button: Brief / Standard / Deep Dive)
- Depth preference is saved per course (students can set a default for each course)

### Launch Strategy

| Aspect | Detail |
|---|---|
| **Launch Type** | Public launch (no invite-only or university pilot) |
| **Launch Date** | **September 21, 2026** |
| **Development Timeline** | 7-day solo sprint: Sep 14–21, 2026 |
| **Team** | Solo developer (full-stack) |
| **Initial Target** | 20 users in the first cohort |
| **Growth Model** | Organic word-of-mouth; target 50% month-over-month growth |
| **Infrastructure Sizing** | Free tiers of Vercel + Supabase comfortably support 20–200 users; re-evaluate at ~500 users |
| **Feedback Loop** | Direct feedback channels (in-app feedback button, Discord/WhatsApp group) with the small initial cohort to iterate rapidly |

#### 7-Day Sprint Plan

| Day | Focus | Deliverable |
|---|---|---|
| **Day 1** (Sep 14) | Auth + project setup | Next.js app scaffolded, Supabase connected, login/signup working |
| **Day 2** (Sep 15) | Courses + note input | Course CRUD, lecture note creation, auto-save |
| **Day 3** (Sep 16) | AI core loop | Gemini integration, note expansion, summarization, Full/Summary toggle |
| **Day 4** (Sep 17) | Dashboard + organization | Course dashboard, lecture list, navigation, breadcrumbs |
| **Day 5** (Sep 18) | Review UX | Side-by-side view, editable expanded notes |
| **Day 6** (Sep 19) | Polish + extras | Section re-expansion, depth toggle, bug fixes |
| **Day 7** (Sep 20) | Launch prep | Search, landing page, final testing, deploy to Vercel |
| **Launch** (Sep 21) | 🚀 Go live | Share with first 20 users |

### Content Scope

**All subjects supported.** The AI expansion and summarization engine handles any academic discipline — STEM, humanities, social sciences, arts, law, medicine, and more. Implementation approach:

- **No subject restriction in the AI prompts** — the LLM is general-purpose and adapts to the course context provided by the student.
- **Course context is key** — the subject area, syllabus topics, and textbook reference in the course profile help the AI produce domain-appropriate output (e.g., formal proofs for math, case analysis for law, close reading for literature).
- **Edge case:** Highly specialized or niche topics where the LLM lacks training data — handled by flagging low-confidence sections as "[Needs review]."

### Infrastructure Constraints

| Constraint | Detail |
|---|---|
| **Platform** | Web-based (SPA with SSR); target browsers: Chrome, Firefox, Safari, Edge (latest 2 versions) |
| **Storage** | Supabase PostgreSQL for notes and course data; no large file storage needed (text-only MVP) |
| **Real-Time Sync** | Supabase Realtime for collaborative note-sharing; handles concurrent edits with conflict resolution |
| **AI Rate Limits** | Per-user daily quota: 10 full expansions + 20 section re-expansions; prevents abuse and controls costs |
| **AI Latency Target** | Expansion: ≤ 30 seconds; Summarization: ≤ 10 seconds; Section re-expansion: ≤ 10 seconds |
| **Data Privacy** | User notes are private by default; shared only via explicit invite links; GDPR-compliant data export and deletion; no training on user data |

---

## Appendix: Resolved Decisions

### ✅ Resolved (from V2)

| # | Question | Decision |
|---|---|---|
| 1 | Monetization & Access Model | **Free for all users.** No ads, no paid tiers. Cost managed via daily AI expansion quotas and efficient prompting. |
| 2 | Technology Stack | **Next.js (React) + Tailwind/shadcn + Supabase (PostgreSQL + Auth) + Google Gemini API + Vercel.** Full-stack JS, free-tier optimized. |
| 3 | AI Expansion Depth & Tone | **Conversational "study buddy" tone** with **toggleable depth levels** (Brief / Standard / Deep Dive) per section. Default: Standard. |

### ✅ Resolved (from V2.1)

| # | Question | Decision |
|---|---|---|
| 4 | Launch Strategy & Scale | **Public launch on Sep 21, 2026**, 20 initial users. Organic word-of-mouth growth, 50% MoM target. |
| 5 | Content Scope | **All subjects** — STEM, humanities, arts, law, medicine, etc. LLM adapts via course context. |
| 6 | Collaboration Priority | **Note-sharing deferred to Week 2 post-launch** (Phase 1.5) to protect core loop delivery in the 7-day sprint. |

### ✅ Resolved (from V2.2)

| # | Question | Decision |
|---|---|---|
| 7 | Branding & Design | **Minimalist.** Neutral palette, single accent color, clean sans-serif, generous whitespace, shadcn/ui components. |
| 8 | MVP Timeline | **7-day solo sprint: Sep 14–21, 2026.** Day-by-day plan with P0/P1 feature split. |
| 9 | Team & Roles | **Solo developer (full-stack).** Architecture optimized for single-person velocity: Next.js full-stack, Supabase managed backend, minimal custom infra. |

> [!NOTE]
> **All blocking questions are resolved.** This PRD is ready for development. Start building! 🚀


