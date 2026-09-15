# StudyFlow - AI-Powered Study Platform for College Students

StudyFlow is an intelligent, distraction-free study companion designed for university students. It transforms raw, fragmented lecture notes into structured, high-yield study materials using Google Gemini 2.0 and Supabase.

---

## Features

### Core Study Workflow
- **Distraction-Free Minimal Editor:** Clean markdown note-taking environment with automatic 5-second debounced auto-saving.
- **AI-Powered Note Expansion:** One-click expansion powered by Gemini 2.0 Flash that turns bullet points into detailed conceptual explanations, real-world examples, and step-by-step proofs grounded in course context.
- **Section-Level Re-Expansion & Depth Control:** Select specific sections to regenerate, make more concise, or expand with customizable depth levels (Brief, Standard, Deep Dive).
- **Executive Summary & Cheat Sheet:** Automatically extracts key takeaways, core formulas, and exam tips side-by-side with your full notes.
- **Course & Lecture Dashboard:** Organize materials by course and lecture date with real-time statistics, progress tracking, and global full-text search.

### Phase 2 Study Acceleration Tools
- **Auto-Generated Flashcards:** Convert lecture notes into 5–10 active recall flashcards with 3D flip card interactions and mastery tracking.
- **Syllabus Upload & Parsing:** Upload syllabus documents (`.txt` / `.md`) to automatically extract structured topics and feed them into the course context.
- **Inline Q&A (Study Buddy):** Ask targeted clarifying questions about specific formulas or concepts and receive grounded explanations.
- **Exam Study Guide Generator:** Synthesize multiple lectures across an entire semester or exam module into a single high-yield study guide.
- **Exporting:** Download lecture notes as clean Markdown (`.md`) or generate print-optimized PDF study packets.
- **Collaborative Sharing & Version History:** Share read-only snapshots via unique links and track note revisions with one-click restore.

---

## Tech Stack

- **Framework:** [Next.js 16 (App Router & Server Actions)](https://nextjs.org/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, SSR Auth & OAuth)
- **AI Engine:** [Google Gemini 2.0 Flash](https://ai.google.dev/) via `@google/generative-ai`
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide Icons](https://lucide.dev/)

---

## Getting Started Locally

### 1. Prerequisites
- Node.js 18+ or 20+
- A Supabase account and project
- A Google Gemini API Key from Google AI Studio

### 2. Clone the Repository
```bash
git clone https://github.com/dzakyard/studyflow.git
cd studyflow
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file by copying `.env.example`:
```bash
cp .env.example .env.local
```

Fill in your project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 5. Run Database Migrations
Execute the SQL migration scripts in order in your Supabase SQL Editor:
1. `supabase/migrations/001_create_courses_and_lectures.sql`
2. `supabase/migrations/002_create_shared_lectures_and_versions.sql`
3. `supabase/migrations/003_create_phase2_tables.sql`

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view StudyFlow in your browser.

---

## Deployment to Vercel

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon / public key.
   - `GEMINI_API_KEY`: Your Google Gemini API key.
4. In your Supabase Dashboard:
   - Navigate to **Authentication -> URL Configuration**.
   - Add your production Vercel URL (e.g. `https://your-studyflow-app.vercel.app`) to **Site URL** and **Redirect URLs** (including `https://your-studyflow-app.vercel.app/auth/callback`).
5. Click **Deploy** on Vercel.

---

## License

MIT License. Designed and built with ❤️ for college students.
