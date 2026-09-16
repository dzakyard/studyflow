import { GoogleGenerativeAI } from "@google/generative-ai";
import { createHash } from "crypto";
import { DepthLevel } from "@/types/database";

const DEFAULT_MODEL = "gemini-2.5-flash";

// ============================================================
// MODEL CONFIGURATION — Tuned per task type
// ============================================================
type AITask = "expand" | "summarize" | "flashcard" | "qa" | "study_guide" | "parse";

function getModel(task: AITask = "expand") {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not configured in environment variables. Please set it in .env.local",
    );
  }

  const configs: Record<AITask, { temperature: number; topP: number; maxOutputTokens: number }> = {
    expand: {
      temperature: 0.7,    // Creative but accurate — good for examples & analogies
      topP: 0.9,
      maxOutputTokens: 4096,
    },
    summarize: {
      temperature: 0.3,    // Deterministic — same input = consistent summary
      topP: 0.8,
      maxOutputTokens: 2048,
    },
    flashcard: {
      temperature: 0.5,    // Balanced — questions need variety, answers must be precise
      topP: 0.85,
      maxOutputTokens: 2048,
    },
    qa: {
      temperature: 0.6,    // Slightly creative for explanations
      topP: 0.9,
      maxOutputTokens: 1024,
    },
    study_guide: {
      temperature: 0.4,    // Structured and deterministic for aggregation
      topP: 0.85,
      maxOutputTokens: 8192,
    },
    parse: {
      temperature: 0.2,    // Very deterministic for data extraction
      topP: 0.8,
      maxOutputTokens: 1024,
    },
  };

  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    generationConfig: configs[task],
  });
}

// ============================================================
// INTERFACES
// ============================================================
export interface ExpansionContext {
  courseName: string;
  subjectArea: string;
  syllabusTopics?: string[];
  textbookReference?: string | null;
  minimalNotes: string;
  depthLevel?: DepthLevel;
}

export interface SectionReExpansionContext {
  courseName: string;
  subjectArea: string;
  syllabusTopics?: string[];
  textbookReference?: string | null;
  sectionText: string;
  mode: "more_detail" | "more_concise" | "regenerate";
  depthLevel?: DepthLevel;
}

// ============================================================
// RATE LIMITING — 10 expansions per day per user
// ============================================================
const dailyExpansionsMap = new Map<string, number[]>();

export function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const timestamps = (dailyExpansionsMap.get(userId) || []).filter(
    (t) => t > oneDayAgo,
  );

  if (timestamps.length >= 10) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  dailyExpansionsMap.set(userId, timestamps);
  return { allowed: true, remaining: 10 - timestamps.length };
}

// ============================================================
// RESPONSE CACHING — avoid duplicate API calls for identical notes
// ============================================================
const expansionCache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(notes: string, course: string, depth: string): string {
  return createHash("md5").update(`${notes}|${course}|${depth}`).digest("hex");
}

// ============================================================
// SMART CONTEXT BUILDING — trim to relevant topics only
// ============================================================
function buildCourseContext(context: {
  courseName: string;
  subjectArea: string;
  syllabusTopics?: string[];
  textbookReference?: string | null;
  minimalNotes?: string;
}): string {
  let topics = context.syllabusTopics || [];

  // If we have notes, filter syllabus to only relevant topics (saves tokens)
  if (context.minimalNotes && topics.length > 5) {
    const notesLower = context.minimalNotes.toLowerCase();
    const relevant = topics.filter((topic) =>
      topic.toLowerCase().split(/\s+/).some((word) =>
        word.length > 3 && notesLower.includes(word.toLowerCase())
      )
    );
    // Use relevant topics if we found some, otherwise take first 5
    topics = relevant.length >= 2 ? relevant : topics.slice(0, 5);
  }

  return `Course: ${context.courseName} (${context.subjectArea})
Topics: ${topics.join(", ") || "General curriculum"}
${context.textbookReference ? `Reference: ${context.textbookReference}` : ""}`.trim();
}

// ============================================================
// DEPTH LEVEL INSTRUCTIONS — explicit and pedagogically grounded
// ============================================================
const depthInstructions: Record<DepthLevel, string> = {
  brief: `BRIEF MODE:
- One-sentence intuition + formal definition only
- Key formula in code block (if applicable)
- No examples, no connections
- Target: 2-3 lines per concept
- Total output: ~200-400 words`,

  standard: `STANDARD MODE:
- One-sentence intuition (Feynman technique) + formal definition
- Key formula with brief explanation
- ONE worked example (3-5 steps)
- ONE connection to a related topic in this course
- ONE common mistake students make
- Target: 1-2 paragraphs per concept
- Total output: ~800-1500 words`,

  deep_dive: `DEEP DIVE MODE:
- Thorough intuition with a real-world analogy
- Formal definition + brief historical context if interesting
- All relevant formulas with derivation hints
- TWO worked examples (one easy, one challenging)
- Multiple connections to other course topics
- Common mistakes + edge cases to watch for
- 2-3 practice problems with hints (no full solutions)
- Target: 3-5 paragraphs per concept
- Total output: ~2000-4000 words`,
};

// ============================================================
// CORE AI FUNCTIONS
// ============================================================

export async function expandNotes(context: ExpansionContext): Promise<string> {
  const depth = context.depthLevel || "standard";

  // Check cache first
  const cacheKey = getCacheKey(context.minimalNotes, context.courseName, depth);
  const cached = expansionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const model = getModel("expand");
  const courseContext = buildCourseContext({ ...context });

  const prompt = `You are an expert tutor who uses evidence-based learning techniques to help college students deeply understand their course material. Your tone is conversational — like a knowledgeable study buddy, not a textbook.

${courseContext}

The student took these minimal notes during a lecture:
${context.minimalNotes}

For EACH note/concept, produce a study section using this structure:

## [Concept Name]

**💡 Intuition:** [Explain the core idea as if to a friend who's smart but unfamiliar with the topic]

**📖 Formal definition:** [Precise academic definition using proper terminology]

**🔑 Key formula/rule:** [If applicable — in a code block or blockquote. If no formula, omit this.]

**🧩 Worked example:**
[Step-by-step concrete example showing the concept in action. Number each step.]

**🔗 Connected to:** [How this relates to other topics the student is studying]

**⚠️ Common mistake:** [What students typically get wrong about this concept and why]

---

${depthInstructions[depth]}

Additional rules:
- Use markdown formatting: headers (##), bold (**term**), code blocks, blockquotes
- Each section must stand alone as a complete study unit
- If a note is ambiguous, interpret it in the context of ${context.subjectArea}
- Be thorough but never padded — every sentence should teach something
- Do NOT include meta-commentary like "Here are your expanded notes" — jump straight into content`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Cache the result
    expansionCache.set(cacheKey, { result: text, timestamp: Date.now() });

    return text;
  } catch (error: unknown) {
    console.error("Gemini expansion error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to generate expansion from Gemini API",
    );
  }
}

export async function reExpandSection(
  context: SectionReExpansionContext,
): Promise<string> {
  const model = getModel("expand");

  const modeInstructions = {
    more_detail:
      `Expand this section with significantly more depth:
- Add a thorough intuitive explanation with analogy
- Include additional concrete examples (easy + challenging)
- Add edge cases and common pitfalls
- Add practice problems with hints
- Keep the conversational study buddy tone`,
    more_concise:
      `Condense this section to be ultra-concise and scannable:
- One-line definition
- Key formula only (if applicable)
- No examples, no connections
- Use bullet points, not paragraphs
- Target: 3-5 lines maximum`,
    regenerate:
      `Regenerate this section with a fresh perspective:
- Use a different analogy or intuition angle
- Include a different worked example
- Same depth level but alternative explanation approach
- Keep the conversational study buddy tone`,
  };

  const courseContext = buildCourseContext({ ...context });

  const prompt = `You are an expert tutor helping a student refine a specific section of their study notes.

${courseContext}

Section to refine:
${context.sectionText}

Instructions:
${modeInstructions[context.mode]}

Return only the refined content in clean markdown format. No introductory remarks.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error("Gemini section re-expansion error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to re-expand section from Gemini API",
    );
  }
}

export async function summarizeNotes(expandedNotes: string): Promise<string> {
  const model = getModel("summarize");

  const prompt = `Create an exam-ready study summary from these expanded lecture notes.

${expandedNotes}

Structure the summary EXACTLY as follows:

## 📋 Quick Reference Card

### Key Definitions
| Term | Definition |
|------|-----------|
[Table of ALL key terms from the notes with precise one-line definitions]

### Critical Formulas & Rules
> [Each formula/rule in a blockquote with a one-line explanation of when to use it]

(If there are no formulas, replace this section with "### Key Principles" and list the core rules/principles.)

### 🎯 Must-Know for Exam (Top 5)
1. [Most critical takeaway — the thing you'd whisper to a friend walking into the exam]
2. [Second most important]
3. [Third]
4. [Fourth]
5. [Fifth]

### ⚡ Quick Self-Test
- **Q:** [Question testing the most important concept]
- **Q:** [Question testing the second concept]
- **Q:** [Question requiring application/calculation]

<details>
<summary>Show Answers</summary>

1. [Answer 1]
2. [Answer 2]
3. [Answer 3]

</details>

Rules:
- Summary MUST be ≤ 20% of the original content length
- Prioritize concepts most likely to appear on an exam
- Use scannable formatting (tables, bullet points, bold terms)
- Self-test questions should require RECALL, not recognition
- Jump straight into the content — no introductory text`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error("Gemini summarization error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to generate summary from Gemini API",
    );
  }
}

export async function generateFlashcardsFromNotes(
  expandedNotes: string,
): Promise<{ question: string; answer: string; type?: string; difficulty?: number }[]> {
  const model = getModel("flashcard");

  const prompt = `Generate 8-12 high-value study flashcards from these lecture notes. Use a mix of card types for effective spaced repetition.

${expandedNotes}

Flashcard types to use (mix them for variety):
1. **definition** — "What is [term]?" → precise one-sentence definition
2. **application** — "Given [scenario], what would happen / what should you do?" → applied reasoning
3. **comparison** — "How does [X] differ from [Y]?" → contrasting related concepts
4. **formula** — "What formula calculates [thing]? When do you use it?" → formula + usage context
5. **mistake** — "A student says [wrong statement]. Why is this incorrect?" → corrects common misconception

Rules:
- Questions must require RECALL (free response), not recognition (multiple choice)
- Answers: 1-3 sentences maximum, precise and complete
- Order by difficulty: easiest first, hardest last
- Every card must be self-contained (no "as mentioned above")
- Include at least one "mistake" type card

Return strictly valid JSON with no markdown backticks:
[
  { "question": "...", "answer": "...", "type": "definition|application|comparison|formula|mistake", "difficulty": 1 }
]

Difficulty scale: 1 = recall a definition, 2 = explain a concept, 3 = apply to scenario, 4 = analyze/compare, 5 = evaluate/create`;

  try {
    const result = await model.generateContent(prompt);
    const text = (await result.response)
      .text()
      .trim()
      .replace(/```json/g, "")
      .replace(/```/g, "");
    return JSON.parse(text);
  } catch (error: unknown) {
    console.error("Flashcards generation error:", error);
    return [];
  }
}

export async function answerInlineQuestion(
  concept: string,
  question: string,
  contextNotes: string,
): Promise<string> {
  const model = getModel("qa");

  const prompt = `You are a knowledgeable study buddy. A student highlighted this concept from their lecture notes:
"${concept}"

They asked:
"${question}"

Relevant context from their notes:
${contextNotes.slice(0, 2000)}

Instructions:
- Give a clear, direct answer in 1-2 paragraphs
- Use a conversational but accurate tone
- If the question involves a calculation, show the steps
- If relevant, mention a common misconception about this topic
- Use markdown formatting (bold key terms, code blocks for formulas)
- Do NOT start with "Great question!" or similar filler`;

  try {
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate answer",
    );
  }
}

export async function generateStudyGuideFromLectures(
  courseName: string,
  subjectArea: string,
  lecturesContent: string,
): Promise<string> {
  const model = getModel("study_guide");

  const prompt = `Create a comprehensive EXAM STUDY GUIDE for the course "${courseName}" (${subjectArea}) by synthesizing these lecture notes into a single, unified review document.

${lecturesContent}

Structure the study guide EXACTLY as follows:

## 📚 Study Guide: ${courseName}

### 1. 🗺️ Topic Map
[List ALL major topics covered across all lectures, grouped by theme. Show how they connect.]

### 2. 📖 Core Concepts (by topic)
[For EACH major topic:
- **Definition:** One-line formal definition
- **Key Formula/Rule:** If applicable
- **Quick Example:** One concrete example
- **Exam Question Type:** What type of question this topic typically generates (define, calculate, compare, apply, etc.)
]

### 3. 🔗 Connections & Patterns
[How do the topics relate to each other? This section is what separates A students from B students. Show the big picture — cause-and-effect chains, prerequisite relationships, parallel structures.]

### 4. 📝 Formula Sheet
[ALL formulas and key rules in ONE place, organized by topic. Use code blocks or blockquotes.]

### 5. 🎯 Exam Predictions: Most Likely Questions
[Based on the material covered, predict 5-8 likely exam questions with brief answer outlines. Format:]
1. **[Question]** → Key points to include: ...

### 6. ⏱️ 30-Minute Speed Review
[The absolute essentials a student needs if they only have 30 minutes before the exam. Ultra-condensed bullet points — the "cheat sheet" version.]

Rules:
- DEDUPLICATE overlapping content from different lectures
- Prioritize by exam likelihood (most testable concepts first)
- Keep the total length to a 10-15 minute read
- Use scannable formatting throughout (tables, bullet points, bold, headers)
- Do NOT include meta-commentary — jump straight into the guide`;

  try {
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate study guide",
    );
  }
}

export async function parseSyllabusTopicsFromText(
  syllabusText: string,
): Promise<string[]> {
  const model = getModel("parse");

  const prompt = `Extract a list of key topics and syllabus modules from this course syllabus text.
Return strictly a valid JSON array of strings (e.g. ["Topic 1", "Topic 2"]), with no markdown backticks:

Text:
${syllabusText.slice(0, 5000)}`;

  try {
    const result = await model.generateContent(prompt);
    const text = (await result.response)
      .text()
      .trim()
      .replace(/```json/g, "")
      .replace(/```/g, "");
    return JSON.parse(text);
  } catch {
    return [];
  }
}
