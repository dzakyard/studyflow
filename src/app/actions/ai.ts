"use server";

import { createClient } from "@/lib/supabase/server";
import { expandNotes, summarizeNotes, checkRateLimit } from "@/lib/ai/gemini";
import { DepthLevel } from "@/types/database";

export async function triggerAiExpansion(lectureId: string, depthLevel: DepthLevel = "standard") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1. Check rate limit
  const rateLimit = checkRateLimit(user.id);
  if (!rateLimit.allowed) {
    throw new Error("Daily expansion limit reached (10 expansions/day). Please try again tomorrow.");
  }

  // 2. Fetch lecture and course context
  const { data: lecture, error: lectureError } = await supabase
    .from("lectures")
    .select("*, courses(*)")
    .eq("id", lectureId)
    .eq("user_id", user.id)
    .single();

  if (lectureError || !lecture) {
    throw new Error("Lecture not found");
  }

  if (!lecture.minimal_notes || !lecture.minimal_notes.trim()) {
    throw new Error("Cannot expand empty notes. Please write some minimal notes first.");
  }

  const course = lecture.courses as unknown as {
    name: string;
    subject_area: string;
    syllabus_topics: string[];
    textbook_reference: string | null;
  };

  // 3. Call Gemini to expand notes
  const expandedText = await expandNotes({
    courseName: course.name,
    subjectArea: course.subject_area,
    syllabusTopics: course.syllabus_topics,
    textbookReference: course.textbook_reference,
    minimalNotes: lecture.minimal_notes,
    depthLevel,
  });

  // 4. Call Gemini to generate concise summary
  const summaryText = await summarizeNotes(expandedText);

  // 5. Update database
  const { error: updateError } = await supabase
    .from("lectures")
    .update({
      expanded_notes: expandedText,
      summary: summaryText,
      depth_level: depthLevel,
    })
    .eq("id", lectureId)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    expandedNotes: expandedText,
    summary: summaryText,
    remainingExpansions: rateLimit.remaining,
  };
}
