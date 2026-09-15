"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface CourseFormData {
  name: string;
  subject_area: string;
  description?: string;
  syllabus_topics?: string[];
  textbook_reference?: string;
}

export async function createCourse(data: CourseFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!data.name?.trim()) {
    throw new Error("Course name is required");
  }

  if (!data.subject_area?.trim()) {
    throw new Error("Subject area is required");
  }

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      user_id: user.id,
      name: data.name.trim(),
      subject_area: data.subject_area.trim(),
      description: data.description?.trim() || null,
      syllabus_topics: data.syllabus_topics || [],
      textbook_reference: data.textbook_reference?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/courses/${course.id}`);
}

export async function updateCourse(id: string, data: CourseFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!data.name?.trim()) {
    throw new Error("Course name is required");
  }

  if (!data.subject_area?.trim()) {
    throw new Error("Subject area is required");
  }

  const { error } = await supabase
    .from("courses")
    .update({
      name: data.name.trim(),
      subject_area: data.subject_area.trim(),
      description: data.description?.trim() || null,
      syllabus_topics: data.syllabus_topics || [],
      textbook_reference: data.textbook_reference?.trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/courses/${id}`);
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
