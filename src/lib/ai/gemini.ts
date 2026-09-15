import { GoogleGenerativeAI } from "@google/generative-ai";
import { DepthLevel } from "@/types/database";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

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

// In-memory rate limiting map: userId -> array of timestamps
// 10 expansions per day per user as stated in PRD and issue tasks
const dailyExpansionsMap = new Map<string, number[]>();

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const timestamps = (dailyExpansionsMap.get(userId) || []).filter((t) => t > oneDayAgo);

  if (timestamps.length >= 10) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  dailyExpansionsMap.set(userId, timestamps);
  return { allowed: true, remaining: 10 - timestamps.length };
}

export async function expandNotes(context: ExpansionContext): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const depthDescriptions: Record<DepthLevel, string> = {
    brief: "Brief — One-line definition + key formula (if any). For quick scanning.",
    standard: "Standard — 2–3 paragraph explanation with definition, intuition, and a practical example in a conversational study buddy tone.",
    deep_dive: "Deep Dive — Comprehensive coverage: formal definition, intuition, multiple examples, edge cases, connections to other topics.",
  };

  const depth = context.depthLevel || "standard";

  const prompt = `You are a friendly study buddy helping a college student.
Course: ${context.courseName} (${context.subjectArea})
Syllabus topics: ${(context.syllabusTopics || []).join(", ") || "General curriculum"}
Textbook: ${context.textbookReference || "N/A"}

The student took these minimal notes during a lecture:
${context.minimalNotes}

Expand each note into a comprehensive study section with:
- Clear explanation in conversational tone
- Formal definitions where applicable
- Key formulas or rules
- A practical example
- Connection to related course topics

Use markdown formatting (headers, bullet points, bold key terms, blockquotes, code blocks/formulas if applicable). Be thorough but approachable.
Depth level: ${depthDescriptions[depth]}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error("Gemini expansion error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate expansion from Gemini API"
    );
  }
}

export async function reExpandSection(context: SectionReExpansionContext): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const modeInstructions = {
    more_detail: "Expand this section with much more depth, comprehensive explanation, additional concrete examples, formulas, and edge cases.",
    more_concise: "Summarize and condense this section to be ultra-concise, high-signal, bulleted, focusing only on essential definitions and rules.",
    regenerate: "Regenerate this section clearly in a friendly conversational study buddy tone with definition, intuition, and an example.",
  };

  const prompt = `You are a friendly study buddy helping a college student refine a specific section of their study notes.
Course: ${context.courseName} (${context.subjectArea})
Syllabus topics: ${(context.syllabusTopics || []).join(", ") || "General curriculum"}
Textbook: ${context.textbookReference || "N/A"}

Original note section to refine:
${context.sectionText}

Target instruction:
${modeInstructions[context.mode]}

Provide the refined section in clean markdown format. Do not include meta commentary or introductory remarks. Return only the refined content.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error("Gemini section re-expansion error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to re-expand section from Gemini API"
    );
  }
}

export async function summarizeNotes(expandedNotes: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an expert study assistant. Generate a concise, high-signal summary of the following lecture notes.

Notes:
${expandedNotes}

Instructions:
- Distill key concepts as bold headings with one-line definitions
- Highlight critical formulas or rules in callout/quote blocks
- Provide a numbered list of must-know takeaways for the lecture
- Keep the summary length ≤ 20% of the original content length
- Format in clean, scannable Markdown
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error("Gemini summarization error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate summary from Gemini API"
    );
  }
}
