#!/bin/bash
# ============================================================
# StudyFlow — GitHub Issues Creator
# Run: chmod +x create-issues.sh && ./create-issues.sh
# Requires: gh CLI authenticated (run `gh auth login` first)
# ============================================================

REPO="" # Leave empty to use current repo, or set "owner/repo"
REPO_FLAG=""
if [ -n "$REPO" ]; then
  REPO_FLAG="--repo $REPO"
fi

echo "🚀 Creating StudyFlow GitHub Issues..."
echo "========================================="

# ----------------------------------------------------------
# MILESTONE LABELS (create labels first)
# ----------------------------------------------------------
echo "📌 Creating labels..."

gh label create "P0-must-ship" --color "d73a4a" --description "Must ship for MVP launch" $REPO_FLAG 2>/dev/null
gh label create "P1-stretch" --color "e4e669" --description "Ship if time allows" $REPO_FLAG 2>/dev/null
gh label create "P2-phase2" --color "0075ca" --description "Post-launch Phase 2" $REPO_FLAG 2>/dev/null
gh label create "day-1" --color "c5def5" --description "Sprint Day 1 (Sep 14)" $REPO_FLAG 2>/dev/null
gh label create "day-2" --color "c5def5" --description "Sprint Day 2 (Sep 15)" $REPO_FLAG 2>/dev/null
gh label create "day-3" --color "c5def5" --description "Sprint Day 3 (Sep 16)" $REPO_FLAG 2>/dev/null
gh label create "day-4" --color "c5def5" --description "Sprint Day 4 (Sep 17)" $REPO_FLAG 2>/dev/null
gh label create "day-5" --color "c5def5" --description "Sprint Day 5 (Sep 18)" $REPO_FLAG 2>/dev/null
gh label create "day-6" --color "c5def5" --description "Sprint Day 6 (Sep 19)" $REPO_FLAG 2>/dev/null
gh label create "day-7" --color "c5def5" --description "Sprint Day 7 (Sep 20)" $REPO_FLAG 2>/dev/null
gh label create "phase-1.5" --color "bfdadc" --description "Week 2 post-launch" $REPO_FLAG 2>/dev/null
gh label create "setup" --color "d4c5f9" --description "Project setup & config" $REPO_FLAG 2>/dev/null
gh label create "auth" --color "d4c5f9" --description "Authentication" $REPO_FLAG 2>/dev/null
gh label create "database" --color "d4c5f9" --description "Database & schema" $REPO_FLAG 2>/dev/null
gh label create "ai" --color "f9d0c4" --description "AI/LLM integration" $REPO_FLAG 2>/dev/null
gh label create "ui" --color "bfd4f2" --description "UI/Frontend" $REPO_FLAG 2>/dev/null
gh label create "feature" --color "a2eeef" --description "New feature" $REPO_FLAG 2>/dev/null

echo "✅ Labels created"
echo ""

# ===========================================================
# DAY 1 — Project Setup & Auth (Sep 14)
# ===========================================================
echo "📅 Day 1 issues..."

gh issue create $REPO_FLAG \
  --title "[Day 1] Project Setup — Next.js + Tailwind + shadcn/ui + Supabase" \
  --label "P0-must-ship,day-1,setup" \
  --body "## Description
Scaffold the StudyFlow project with the full tech stack.

## Tasks
- [ ] Initialize Next.js 14+ with App Router, TypeScript, \`src/\` directory
- [ ] Install and configure Tailwind CSS
- [ ] Initialize shadcn/ui with default theme (neutral palette, Inter font)
- [ ] Install Supabase client (\`@supabase/supabase-js\`, \`@supabase/ssr\`)
- [ ] Create \`.env.local\` with Supabase keys (URL + anon key)
- [ ] Set up project folder structure:
  \`\`\`
  src/
  ├── app/
  │   ├── (auth)/login/page.tsx
  │   ├── (auth)/signup/page.tsx
  │   ├── (dashboard)/dashboard/page.tsx
  │   ├── layout.tsx
  │   └── page.tsx
  ├── components/ui/
  ├── lib/
  │   └── supabase/
  │       ├── client.ts
  │       └── server.ts
  └── types/
  \`\`\`
- [ ] Configure Supabase client for both client and server components
- [ ] Verify dev server runs without errors

## Acceptance Criteria
- \`npm run dev\` starts successfully
- Tailwind classes render correctly
- shadcn/ui Button component renders
- Supabase client connects without errors

## Tech Stack
Next.js 14+ | Tailwind CSS | shadcn/ui | Supabase | TypeScript"

gh issue create $REPO_FLAG \
  --title "[Day 1] User Authentication — Supabase Auth (Google OAuth + Email/Password)" \
  --label "P0-must-ship,day-1,auth" \
  --body "## Description
Implement user authentication using Supabase Auth. Users can sign up and log in with email/password or Google OAuth.

## User Story
> US-11: As a student, I want to create an account and log in securely so that my data is private and persistent.

## Tasks
- [ ] Set up Supabase Auth in the Supabase dashboard
- [ ] Enable Google OAuth provider in Supabase
- [ ] Create login page (\`/login\`) with email/password form
- [ ] Create signup page (\`/signup\`) with email/password form
- [ ] Add Google OAuth \"Sign in with Google\" button
- [ ] Implement auth middleware for protected routes
- [ ] Create auth callback route (\`/auth/callback\`)
- [ ] Add session persistence across browser tabs
- [ ] Create a user menu component (avatar + logout)
- [ ] Redirect unauthenticated users to \`/login\`
- [ ] Redirect authenticated users from \`/login\` to \`/dashboard\`

## Acceptance Criteria
- [ ] User can sign up with email/password
- [ ] User can sign in with email/password
- [ ] User can sign in with Google OAuth
- [ ] Session persists on page refresh
- [ ] Protected routes redirect to login
- [ ] User can log out

## Design
Minimalist login form. Centered card layout. shadcn/ui form components."

gh issue create $REPO_FLAG \
  --title "[Day 1] Database Schema Design — Supabase Tables + RLS" \
  --label "P0-must-ship,day-1,database" \
  --body "## Description
Design and create the database schema in Supabase for courses, lectures, and notes.

## Tables

### \`courses\`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| user_id | uuid (FK → auth.users) | owner |
| name | text | required |
| subject_area | text | e.g. \"Computer Science\", \"Literature\" |
| description | text | optional |
| syllabus_topics | text[] | array of topic strings |
| textbook_reference | text | optional |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### \`lectures\`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| course_id | uuid (FK → courses) | required |
| user_id | uuid (FK → auth.users) | owner |
| title | text | optional, auto-generated from date if empty |
| lecture_date | date | default today |
| minimal_notes | text | raw input from student |
| expanded_notes | text | AI-generated expanded content (markdown) |
| summary | text | AI-generated summary (markdown) |
| depth_level | text | 'brief' / 'standard' / 'deep_dive', default 'standard' |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

## Tasks
- [ ] Create SQL migration for \`courses\` table
- [ ] Create SQL migration for \`lectures\` table
- [ ] Set up Row Level Security (RLS) policies:
  - Users can only CRUD their own courses
  - Users can only CRUD their own lectures
- [ ] Create TypeScript types matching the schema (\`src/types/database.ts\`)
- [ ] Test CRUD operations via Supabase dashboard

## Acceptance Criteria
- [ ] Tables created in Supabase
- [ ] RLS policies active and tested
- [ ] TypeScript types exported and usable"

# ===========================================================
# DAY 2 — Courses + Note Input (Sep 15)
# ===========================================================
echo "📅 Day 2 issues..."

gh issue create $REPO_FLAG \
  --title "[Day 2] Course CRUD — Create, List, Edit, Delete Courses" \
  --label "P0-must-ship,day-2,feature" \
  --body "## Description
Implement full CRUD for courses. Students can create courses with context metadata that feeds into AI expansion.

## User Story
> US-06: As a student, I want to provide course context (course name, subject area, textbook, syllabus topics) so that the AI produces more accurate and relevant expansions.

## Tasks
- [ ] Create \"New Course\" form page (\`/dashboard/courses/new\`)
  - Fields: name (required), subject area, description, syllabus topics (tag input), textbook reference
- [ ] Create course list on dashboard (\`/dashboard\`) with card layout
- [ ] Create course detail page (\`/dashboard/courses/[id]\`)
- [ ] Implement edit course functionality
- [ ] Implement delete course with confirmation dialog
- [ ] Server actions or API routes for CRUD operations
- [ ] Form validation (name required, etc.)

## Acceptance Criteria
- [ ] User can create a course with all context fields
- [ ] Syllabus topics work as a tag-style input (add/remove)
- [ ] Courses appear as cards on dashboard
- [ ] User can edit and delete courses
- [ ] Only the course owner can see/edit their courses

## Design
Simple form with shadcn/ui Input, Textarea, and a tag-input for syllabus topics. Card grid on dashboard."

gh issue create $REPO_FLAG \
  --title "[Day 2] Lecture Note Session — Create + Minimal Note Input with Auto-Save" \
  --label "P0-must-ship,day-2,feature" \
  --body "## Description
Students can create a lecture note session within a course and type minimal notes (keywords, bullet points) with auto-save.

## User Stories
> US-01: As a student, I want to quickly jot down minimal notes during a lecture so that I capture enough context without losing focus.
> US-07: As a student, I want to organize my notes by course and date so that my materials are easy to navigate.

## Tasks
- [ ] \"New Lecture\" button on course detail page
- [ ] Create lecture page (\`/dashboard/courses/[courseId]/lectures/[lectureId]\`)
- [ ] Minimal note input area:
  - Full-width textarea, distraction-free
  - Placeholder text: \"Type your lecture notes here... keywords, bullet points, anything\"
  - Keyboard-first design
  - Support plain text and bullet points
- [ ] Auto-save to Supabase every 5 seconds (debounced)
- [ ] Visual auto-save indicator (\"Saved\" / \"Saving...\")
- [ ] Lecture title field (optional, defaults to date)
- [ ] Lecture date picker (defaults to today)
- [ ] List lectures on course detail page, sorted by date (newest first)

## Acceptance Criteria
- [ ] User can create a new lecture in a course
- [ ] Note input area is clean, fast, distraction-free
- [ ] Notes auto-save every 5 seconds
- [ ] Save indicator visible
- [ ] Lectures listed on course detail page sorted by date

## Design
Full-screen minimal editor. No toolbar clutter. Large, calm textarea. \"Expand Notes\" button visible but unobtrusive at the bottom."

# ===========================================================
# DAY 3 — AI Core Loop (Sep 16)
# ===========================================================
echo "📅 Day 3 issues..."

gh issue create $REPO_FLAG \
  --title "[Day 3] Gemini API Integration — Server-Side AI Service" \
  --label "P0-must-ship,day-3,ai" \
  --body "## Description
Set up the Google Gemini API integration as a server-side service for note expansion and summarization.

## Tasks
- [ ] Install \`@google/generative-ai\` package
- [ ] Create AI service module (\`src/lib/ai/gemini.ts\`)
- [ ] Add \`GEMINI_API_KEY\` to \`.env.local\`
- [ ] Create prompt templates:
  - **Expansion prompt**: Takes minimal notes + course context → returns comprehensive notes
  - **Summary prompt**: Takes expanded notes → returns concise summary
- [ ] Implement rate limiting (10 expansions/day per user)
- [ ] Error handling (API failures, timeouts, rate limits)
- [ ] Create Next.js API route or Server Action for AI calls

## Prompt Engineering
\`\`\`
EXPANSION PROMPT:
You are a friendly study buddy helping a college student.
Course: {course_name} ({subject_area})
Syllabus topics: {syllabus_topics}
Textbook: {textbook_reference}

The student took these minimal notes during a lecture:
{minimal_notes}

Expand each note into a comprehensive study section with:
- Clear explanation in conversational tone
- Formal definitions where applicable
- Key formulas or rules
- A practical example
- Connection to related course topics

Use markdown formatting. Be thorough but approachable.
Depth level: {depth_level}
\`\`\`

## Acceptance Criteria
- [ ] Gemini API calls work from server-side
- [ ] Expansion returns well-structured markdown
- [ ] Summary returns concise key points
- [ ] Errors handled gracefully with user-facing messages
- [ ] Rate limiting works (10/day per user)"

gh issue create $REPO_FLAG \
  --title "[Day 3] AI Note Expansion — One-Click Expand with Markdown Rendering" \
  --label "P0-must-ship,day-3,ai,feature" \
  --body "## Description
Implement the core \"Expand Notes\" feature — one click transforms minimal notes into comprehensive study material.

## User Story
> US-02: As a student, I want to trigger AI expansion on my minimal notes so that they become complete, well-structured study material.

## Tasks
- [ ] \"Expand Notes\" button on lecture page (prominent, primary style)
- [ ] Loading state during expansion (\"Expanding your notes...\", progress indicator)
- [ ] Send minimal notes + course context to Gemini API
- [ ] Receive and store expanded notes as markdown in Supabase
- [ ] Render expanded notes with markdown formatting (headings, bold, lists, code blocks)
- [ ] Install and configure a markdown renderer (\`react-markdown\` + \`remark-gfm\`)
- [ ] Show expanded notes below or replacing the input area after expansion
- [ ] Handle edge cases:
  - Empty notes → show warning \"Please add some notes first\"
  - Very short notes → proceed with best-effort + low-confidence notice
  - API error → show retry button with error message

## Acceptance Criteria
- [ ] One-click expansion works end-to-end
- [ ] Expanded notes render as formatted markdown
- [ ] Expansion completes within 30 seconds
- [ ] Loading state is clear and informative
- [ ] Expanded notes persist in database
- [ ] \"AI-generated — please verify\" label shown on output"

gh issue create $REPO_FLAG \
  --title "[Day 3] AI Lecture Summarization — Auto-Generate Concise Summary" \
  --label "P0-must-ship,day-3,ai,feature" \
  --body "## Description
Automatically generate a concise summary after note expansion. The summary distills key concepts, definitions, and takeaways.

## User Story
> US-04: As a student, I want the platform to automatically generate a concise summary of the expanded notes so that I have a quick-review cheat sheet.

## Tasks
- [ ] After expansion completes, automatically trigger summarization
- [ ] Summary prompt: takes expanded notes → returns concise summary
- [ ] Summary structure:
  - Key concepts (bold headings + one-line definitions)
  - Critical formulas/rules (highlighted)
  - Must-know takeaways (numbered list)
- [ ] Store summary in \`lectures.summary\` column
- [ ] Summary length target: ≤ 20% of expanded notes
- [ ] Loading state: \"Expanding...\" → \"Summarizing...\" → Done
- [ ] Render summary with markdown formatting

## Acceptance Criteria
- [ ] Summary auto-generates after expansion
- [ ] Summary is concise (≤ 20% of expanded length)
- [ ] Summary renders as formatted markdown
- [ ] Summary persists in database"

gh issue create $REPO_FLAG \
  --title "[Day 3–4] Full Notes / Summary Toggle" \
  --label "P0-must-ship,day-3,feature,ui" \
  --body "## Description
Add a tab/toggle control to switch between the full expanded notes and the concise summary view.

## User Story
> US-05: As a student, I want to switch between the full expanded notes and the summary view so that I can choose the right level of detail.

## Tasks
- [ ] Add tab component (shadcn/ui Tabs) at the top of the lecture output area
- [ ] Two tabs: \"Full Notes\" | \"Summary\"
- [ ] Default to \"Full Notes\" after initial expansion
- [ ] Both views render markdown
- [ ] Smooth transition between tabs (no page reload)
- [ ] Remember last active tab per session (optional)

## Acceptance Criteria
- [ ] Tab toggle switches between full notes and summary
- [ ] Both views display correctly formatted markdown
- [ ] Toggle is fast and seamless"

# ===========================================================
# DAY 4 — Dashboard & Organization (Sep 17)
# ===========================================================
echo "📅 Day 4 issues..."

gh issue create $REPO_FLAG \
  --title "[Day 4] Course Dashboard — Card Grid with Recent Activity" \
  --label "P0-must-ship,day-4,feature,ui" \
  --body "## Description
Build the main dashboard showing all courses as cards with quick access to recent lectures.

## User Story
> US-07: As a student, I want to organize my notes by course and date so that my materials are easy to navigate.

## Tasks
- [ ] Dashboard page (\`/dashboard\`) as the main authenticated landing
- [ ] Course cards in a responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] Each card shows:
  - Course name
  - Subject area badge
  - Number of lectures
  - Last lecture date
  - Click → navigate to course detail
- [ ] \"New Course\" card/button (prominent, always visible)
- [ ] Empty state: \"No courses yet. Create your first course to get started!\"
- [ ] Recent lectures feed (optional: last 5 lectures across all courses)

## Acceptance Criteria
- [ ] Dashboard displays all user's courses as cards
- [ ] Cards are clickable and navigate to course detail
- [ ] Responsive grid layout works on all screen sizes
- [ ] Empty state displayed when no courses exist

## Design
Minimalist card grid. Neutral colors. Single accent for CTAs. Max content width 1024px, centered."

gh issue create $REPO_FLAG \
  --title "[Day 4] Course Detail Page — Lecture List + Navigation" \
  --label "P0-must-ship,day-4,feature,ui" \
  --body "## Description
Course detail page showing course context info and a list of all lectures, sorted by date.

## Tasks
- [ ] Course detail page (\`/dashboard/courses/[id]\`)
- [ ] Header: course name, subject area, description
- [ ] Course context summary (syllabus topics as tags, textbook reference)
- [ ] \"Edit Course\" button
- [ ] Lecture list sorted by date (newest first)
  - Each item: title (or date), date, status (has expanded notes / not yet)
  - Click → navigate to lecture page
- [ ] \"New Lecture\" button (prominent)
- [ ] Breadcrumb navigation: Dashboard > Course Name
- [ ] Empty state: \"No lectures yet. Start your first note session!\"

## Acceptance Criteria
- [ ] Course info displayed clearly
- [ ] Lectures listed and sorted by date
- [ ] Navigation works (breadcrumbs, back to dashboard)
- [ ] New lecture creation works from this page"

# ===========================================================
# DAY 5 — Review UX (Sep 18)
# ===========================================================
echo "📅 Day 5 issues..."

gh issue create $REPO_FLAG \
  --title "[Day 5] Side-by-Side Review View" \
  --label "P1-stretch,day-5,feature,ui" \
  --body "## Description
Two-panel layout showing original minimal notes alongside AI-expanded notes for easy comparison and verification.

## User Story
> US-03: As a student, I want to review the AI-expanded notes side-by-side with my original input so that I can verify accuracy.

## Tasks
- [ ] Split-panel layout on lecture page (after expansion):
  - Left panel: original minimal notes (read-only, styled)
  - Right panel: AI-expanded notes (or summary, based on active tab)
- [ ] Responsive: side-by-side on desktop, stacked on mobile
- [ ] Panel divider (optional: draggable resize)
- [ ] Sync scroll between panels (optional)

## Acceptance Criteria
- [ ] Two-panel view works on desktop
- [ ] Falls back to stacked layout on mobile
- [ ] Original notes clearly distinguished from expanded notes"

gh issue create $REPO_FLAG \
  --title "[Day 5] Editable Expanded Notes" \
  --label "P1-stretch,day-5,feature" \
  --body "## Description
Allow students to edit the AI-expanded output to correct errors or add personal insights.

## User Story
> US-09: As a student, I want to edit and refine the AI-expanded notes so that I can correct errors or add personal insights.

## Tasks
- [ ] Make expanded notes editable (switch from read-only markdown to editable textarea/editor)
- [ ] \"Edit\" toggle button on expanded notes panel
- [ ] When editing: show raw markdown in a textarea
- [ ] When viewing: render formatted markdown
- [ ] Auto-save edits to Supabase (debounced, 5 seconds)
- [ ] Save indicator for edits
- [ ] Also make summary editable with the same pattern

## Acceptance Criteria
- [ ] User can toggle between view/edit mode on expanded notes
- [ ] Edits persist to database
- [ ] Auto-save with visual indicator"

# ===========================================================
# DAY 6 — Polish & Extras (Sep 19)
# ===========================================================
echo "📅 Day 6 issues..."

gh issue create $REPO_FLAG \
  --title "[Day 6] Section-Level Re-Expansion" \
  --label "P1-stretch,day-6,feature,ai" \
  --body "## Description
Allow students to select a specific section of their notes and re-expand just that section with different options.

## User Story
> US-10: As a student, I want to re-expand or expand specific sections so that I can iteratively improve the notes.

## Tasks
- [ ] In the minimal notes input, allow selecting a section (e.g., a bullet point or group of lines)
- [ ] Context menu or button: \"Re-expand this section\"
- [ ] Options: \"More detail\" / \"More concise\" / \"Regenerate\"
- [ ] Send only the selected section + course context to Gemini API
- [ ] Replace only the corresponding section in the expanded notes
- [ ] Loading indicator on the specific section being re-expanded

## Acceptance Criteria
- [ ] User can select and re-expand individual sections
- [ ] Three re-expansion options work correctly
- [ ] Only the targeted section updates (rest of notes preserved)"

gh issue create $REPO_FLAG \
  --title "[Day 6] Depth Level Toggle — Brief / Standard / Deep Dive" \
  --label "P1-stretch,day-6,feature,ai" \
  --body "## Description
Per-section depth level control that changes how detailed the AI expansion is.

## Tasks
- [ ] Segmented button or dropdown per section: Brief | Standard | Deep Dive
- [ ] Brief: one-line definition + key formula
- [ ] Standard (default): 2–3 paragraphs with explanation, intuition, example
- [ ] Deep Dive: comprehensive coverage with multiple examples and edge cases
- [ ] Re-trigger expansion for the section when depth changes
- [ ] Save depth preference per course as default (\`courses.default_depth\`)
- [ ] Global depth selector on the \"Expand Notes\" button

## Acceptance Criteria
- [ ] Three depth levels produce visibly different output lengths
- [ ] Depth can be changed per-section
- [ ] Default depth saved per course"

gh issue create $REPO_FLAG \
  --title "[Day 6] Bug Fixes, Polish & Responsive Testing" \
  --label "P0-must-ship,day-6,ui" \
  --body "## Description
Comprehensive polish pass and bug fixes before launch.

## Tasks
- [ ] Test all flows end-to-end (signup → create course → add notes → expand → summarize → review)
- [ ] Fix any UI inconsistencies
- [ ] Responsive testing: mobile (375px), tablet (768px), desktop (1440px)
- [ ] Loading states on all async operations
- [ ] Error states with user-friendly messages
- [ ] Empty states for all list views
- [ ] \"AI-generated — please verify\" label on all AI output
- [ ] Keyboard navigation testing
- [ ] Fix any Supabase RLS edge cases

## Acceptance Criteria
- [ ] Full flow works without errors
- [ ] UI looks clean on all screen sizes
- [ ] All edge cases handled gracefully"

# ===========================================================
# DAY 7 — Launch Prep (Sep 20)
# ===========================================================
echo "📅 Day 7 issues..."

gh issue create $REPO_FLAG \
  --title "[Day 7] Full-Text Search Across Notes" \
  --label "P1-stretch,day-7,feature" \
  --body "## Description
Search across all original and expanded notes to quickly find specific concepts.

## User Story
> US-08: As a student, I want to search across all my notes so that I can quickly find specific concepts.

## Tasks
- [ ] Search bar on dashboard (global search)
- [ ] Search queries both \`minimal_notes\`, \`expanded_notes\`, and \`summary\` columns
- [ ] Use Supabase full-text search (\`textSearch\`) or \`ilike\` for MVP
- [ ] Search results page showing:
  - Matched excerpt with highlighted search term
  - Course name + lecture title + date
  - Click → navigate to lecture
- [ ] Debounced search input (300ms)

## Acceptance Criteria
- [ ] Search returns relevant results across all notes
- [ ] Results show context (course, lecture, excerpt)
- [ ] Clicking a result navigates to the lecture"

gh issue create $REPO_FLAG \
  --title "[Day 7] Landing Page — Value Proposition + CTA" \
  --label "P1-stretch,day-7,ui" \
  --body "## Description
Simple, minimalist landing page that communicates the value proposition and drives sign-ups.

## Tasks
- [ ] Landing page at \`/\` (public, not behind auth)
- [ ] Hero section:
  - Headline: \"Type less, learn more.\"
  - Subheadline: \"Jot down keywords in class. AI turns them into complete study notes.\"
  - CTA button: \"Get Started — It's Free\"
- [ ] Before/After demo section:
  - Left: minimal bullet points (student input)
  - Right: expanded, formatted notes (AI output)
- [ ] How it works (3 steps): Capture → Expand → Review
- [ ] Footer: minimal, project info
- [ ] Mobile responsive

## Acceptance Criteria
- [ ] Landing page loads fast
- [ ] Value proposition is immediately clear
- [ ] CTA leads to signup
- [ ] Looks clean and minimalist"

gh issue create $REPO_FLAG \
  --title "[Day 7] Deploy to Vercel + Final Testing" \
  --label "P0-must-ship,day-7,setup" \
  --body "## Description
Deploy the application to Vercel and perform final production testing.

## Tasks
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables in Vercel:
  - \`NEXT_PUBLIC_SUPABASE_URL\`
  - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
  - \`GEMINI_API_KEY\`
- [ ] Configure Supabase auth redirect URLs for production domain
- [ ] Deploy and verify:
  - [ ] Auth flow works in production
  - [ ] CRUD operations work
  - [ ] AI expansion/summarization works
  - [ ] All pages load correctly
- [ ] Set up custom domain (optional)
- [ ] Test on mobile devices
- [ ] Performance check (Lighthouse score)

## Acceptance Criteria
- [ ] App is live on Vercel
- [ ] All features work in production
- [ ] Auth redirects work with production URL
- [ ] No console errors in production"

# ===========================================================
# PHASE 1.5 — Week 2 Post-Launch
# ===========================================================
echo "📅 Phase 1.5 issues..."

gh issue create $REPO_FLAG \
  --title "[Phase 1.5] Collaborative Note Sharing — Invite Links + Shared Dashboard" \
  --label "P1-stretch,phase-1.5,feature" \
  --body "## Description
Allow students to share note sessions with classmates via invite link with view-only or edit access.

## User Story
> US-12: As a student, I want to share my notes with classmates so we can collaboratively build better study materials.

## Tasks
- [ ] Generate shareable invite link per lecture (unique token)
- [ ] Access levels: view-only, edit
- [ ] Share dialog with link copy button
- [ ] Create \`shared_lectures\` table:
  | Column | Type |
  |--------|------|
  | id | uuid PK |
  | lecture_id | uuid FK |
  | shared_by | uuid FK (user) |
  | shared_with | uuid FK (user, nullable) |
  | access_level | text ('view' / 'edit') |
  | invite_token | text (unique) |
  | created_at | timestamptz |
- [ ] \"Shared with me\" section on dashboard
- [ ] RLS policies for shared access
- [ ] Real-time sync for collaborative edits (Supabase Realtime)
- [ ] Shared note indicator (icon/badge)

## Acceptance Criteria
- [ ] User can generate and share invite links
- [ ] Recipients can access shared notes (view or edit)
- [ ] \"Shared with me\" section shows shared lectures
- [ ] Real-time sync works for collaborative editing"

gh issue create $REPO_FLAG \
  --title "[Phase 1.5] Version History — Last 10 Edits with Restore" \
  --label "P1-stretch,phase-1.5,feature" \
  --body "## Description
Track edit history on expanded notes and allow restoring previous versions.

## Tasks
- [ ] Create \`note_versions\` table:
  | Column | Type |
  |--------|------|
  | id | uuid PK |
  | lecture_id | uuid FK |
  | expanded_notes | text |
  | summary | text |
  | created_at | timestamptz |
- [ ] Save a version snapshot before each edit
- [ ] Keep only the last 10 versions (delete oldest)
- [ ] Version history panel (slide-out or modal)
- [ ] Show timestamp and diff preview for each version
- [ ] \"Restore\" button per version
- [ ] Confirmation dialog before restore

## Acceptance Criteria
- [ ] Edit history saved automatically
- [ ] User can view last 10 versions
- [ ] User can restore a previous version"

# ===========================================================
# PHASE 2 — Post-Launch Enhancements
# ===========================================================
echo "📅 Phase 2 issues..."

gh issue create $REPO_FLAG \
  --title "[Phase 2] Auto-Generated Flashcards from Expanded Notes" \
  --label "P2-phase2,feature,ai" \
  --body "## Description
AI extracts question-answer pairs from expanded notes for spaced-repetition self-testing.

## User Story
> US-13: As a student, I want to generate flashcards automatically from my expanded notes so I can self-test efficiently.

## Tasks
- [ ] \"Generate Flashcards\" button on lecture view
- [ ] AI prompt to extract Q&A pairs from expanded notes
- [ ] Flashcard viewer component (flip animation)
- [ ] Store flashcards in a \`flashcards\` table
- [ ] Basic spaced-repetition tracking (seen/unseen, confidence rating)
- [ ] Flashcard deck per lecture or per course

## Acceptance Criteria
- [ ] AI generates relevant Q&A flashcards
- [ ] Flashcard viewer works with flip interaction
- [ ] Flashcards persist and can be reviewed multiple times"

gh issue create $REPO_FLAG \
  --title "[Phase 2] Syllabus Upload & Parsing" \
  --label "P2-phase2,feature,ai" \
  --body "## Description
Upload a PDF/DOCX syllabus and let AI extract the topic list to auto-populate course context.

## User Story
> US-14: As a student, I want to upload a syllabus or course outline so the AI has deeper context.

## Tasks
- [ ] File upload component (PDF/DOCX) on course creation/edit page
- [ ] Parse PDF/DOCX to text (server-side)
- [ ] Send text to AI to extract structured topic list
- [ ] Auto-populate syllabus_topics in course profile
- [ ] Store original file in Supabase Storage

## Acceptance Criteria
- [ ] PDF and DOCX upload works
- [ ] AI extracts meaningful topic list
- [ ] Topics auto-fill in course context"

gh issue create $REPO_FLAG \
  --title "[Phase 2] Inline Q&A / Follow-Up Questions" \
  --label "P2-phase2,feature,ai" \
  --body "## Description
Highlight a concept in expanded notes and ask a follow-up question. AI answer appears inline.

## User Story
> US-17: As a student, I want to ask follow-up questions about a topic in my notes and get AI explanations inline.

## Tasks
- [ ] Text selection detection in expanded notes
- [ ] \"Ask about this\" floating button on text selection
- [ ] Input field for follow-up question
- [ ] AI generates contextual answer
- [ ] Answer appears inline (collapsible) below the selected section
- [ ] Store Q&A threads per lecture

## Acceptance Criteria
- [ ] User can select text and ask questions
- [ ] AI answers are contextually relevant
- [ ] Answers appear inline and persist"

gh issue create $REPO_FLAG \
  --title "[Phase 2] Exam Study Guide Generator" \
  --label "P2-phase2,feature,ai" \
  --body "## Description
Aggregate key concepts across multiple lectures into a single comprehensive study guide for exam prep.

## User Story
> US-16: As a student, I want to see a study guide view that aggregates key concepts across multiple lectures for exam prep.

## Tasks
- [ ] \"Generate Study Guide\" button on course detail page
- [ ] Select which lectures to include (checkbox list)
- [ ] AI aggregates summaries and key concepts
- [ ] Deduplicate overlapping concepts
- [ ] Generate structured study guide (organized by topic)
- [ ] Study guide view page with print-friendly layout

## Acceptance Criteria
- [ ] Study guide aggregates multiple lectures
- [ ] No redundant/duplicate content
- [ ] Well-organized by topic"

gh issue create $REPO_FLAG \
  --title "[Phase 2] Export Notes as PDF / Markdown" \
  --label "P2-phase2,feature" \
  --body "## Description
One-click export of notes (original + expanded + summary) as PDF or Markdown files.

## User Story
> US-15: As a student, I want to export my notes as PDF or Markdown files.

## Tasks
- [ ] Export button on lecture view
- [ ] Export format selection: PDF / Markdown
- [ ] Markdown export: download as .md file with original notes, expanded notes, and summary sections
- [ ] PDF export: render markdown to PDF (server-side or client-side)
- [ ] Include course name, lecture title, and date in export header
- [ ] Batch export option (all lectures in a course)

## Acceptance Criteria
- [ ] Single-lecture export works (PDF + MD)
- [ ] Export includes all three note types
- [ ] Formatted cleanly with proper headers"

echo ""
echo "========================================="
echo "✅ All issues created successfully!"
echo "Total: 22 issues"
echo "  - Day 1: 3 issues (Setup, Auth, Database)"
echo "  - Day 2: 2 issues (Courses, Notes)"
echo "  - Day 3: 4 issues (Gemini, Expand, Summarize, Toggle)"
echo "  - Day 4: 2 issues (Dashboard, Course Detail)"
echo "  - Day 5: 2 issues (Side-by-Side, Editable)"
echo "  - Day 6: 3 issues (Re-Expand, Depth, Polish)"
echo "  - Day 7: 3 issues (Search, Landing, Deploy)"
echo "  - Phase 1.5: 2 issues (Sharing, Version History)"
echo "  - Phase 2: 5 issues (Flashcards, Syllabus, Q&A, Study Guide, Export)"
echo "========================================="
