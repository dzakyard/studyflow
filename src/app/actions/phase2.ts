"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateFlashcardsFromNotes,
  answerInlineQuestion,
  generateStudyGuideFromLectures,
  parseSyllabusTopicsFromText,
} from "@/lib/ai/gemini";
import { revalidatePath } from "next/cache";

export async function createFlashcardsAction(lectureId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: lecture } = await supabase
    .from("lectures")
    .select("expanded_notes, summary")
    .eq("id", lectureId)
    .eq("user_id", user.id)
    .single();

  if (!lecture || !lecture.expanded_notes) {
    throw new Error("No expanded notes found to generate flashcards.");
  }

  const pairs = await generateFlashcardsFromNotes(lecture.expanded_notes);

  if (pairs.length > 0) {
    // Delete existing cards for lecture
    await supabase.from("flashcards").delete().eq("lecture_id", lectureId).eq("user_id", user.id);

    const records = pairs.map((p) => ({
      lecture_id: lectureId,
      user_id: user.id,
      question: p.question,
      answer: p.answer,
      confidence_level: 0,
    }));

    await supabase.from("flashcards").insert(records);
  }

  return { flashcards: pairs };
}

export async function fetchFlashcardsAction(lectureId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("flashcards")
    .select("*")
    .eq("lecture_id", lectureId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return data || [];
}

export async function askInlineQuestionAction(lectureId: string, concept: string, question: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: lecture } = await supabase
    .from("lectures")
    .select("expanded_notes")
    .eq("id", lectureId)
    .eq("user_id", user.id)
    .single();

  const answer = await answerInlineQuestion(concept, question, lecture?.expanded_notes || "");

  await supabase.from("inline_qa").insert({
    lecture_id: lectureId,
    user_id: user.id,
    selected_concept: concept,
    question,
    answer,
  });

  return { answer };
}

export async function fetchInlineQAAction(lectureId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("inline_qa")
    .select("*")
    .eq("lecture_id", lectureId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function generateStudyGuideAction(courseId: string, lectureIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: course } = await supabase
    .from("courses")
    .select("name, subject_area")
    .eq("id", courseId)
    .eq("user_id", user.id)
    .single();

  const { data: lectures } = await supabase
    .from("lectures")
    .select("title, lecture_date, expanded_notes, summary")
    .in("id", lectureIds)
    .eq("user_id", user.id);

  if (!lectures || lectures.length === 0) {
    throw new Error("No lecture notes selected.");
  }

  const combined = lectures
    .map(
      (l) =>
        `### Lecture: ${l.title || l.lecture_date}\n\n${l.summary || l.expanded_notes || ""}`
    )
    .join("\n\n---\n\n");

  const studyGuide = await generateStudyGuideFromLectures(
    course?.name || "Course",
    course?.subject_area || "General",
    combined
  );

  return { studyGuide };
}

export async function parseSyllabusFileAction(text: string) {
  const topics = await parseSyllabusTopicsFromText(text);
  return { topics };
}
