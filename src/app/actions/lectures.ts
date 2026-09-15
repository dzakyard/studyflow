"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface CreateLectureData {
  courseId: string;
  title?: string;
  lecture_date?: string;
  minimal_notes?: string;
}

export async function createLecture(data: CreateLectureData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const today = new Date().toISOString().split("T")[0];
  const lectureDate = data.lecture_date || today;
  const title = data.title?.trim() || `Lecture on ${lectureDate}`;

  const { data: lecture, error } = await supabase
    .from("lectures")
    .insert({
      course_id: data.courseId,
      user_id: user.id,
      title,
      lecture_date: lectureDate,
      minimal_notes: data.minimal_notes || "",
      depth_level: "standard",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/courses/${data.courseId}`);
  return lecture;
}

export async function updateLectureNotes(
  lectureId: string,
  updates: {
    title?: string;
    lecture_date?: string;
    minimal_notes?: string;
    expanded_notes?: string;
    summary?: string;
    depth_level?: "brief" | "standard" | "deep_dive";
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("lectures")
    .update(updates)
    .eq("id", lectureId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteLecture(lectureId: string, courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("lectures")
    .delete()
    .eq("id", lectureId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/courses/${courseId}`);
  redirect(`/dashboard/courses/${courseId}`);
}
