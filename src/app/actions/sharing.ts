"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createShareInvite(lectureId: string, accessLevel: "view" | "edit" = "view") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const { data: lecture } = await supabase
    .from("lectures")
    .select("id")
    .eq("id", lectureId)
    .eq("user_id", user.id)
    .single();

  if (!lecture) {
    throw new Error("Lecture not found or you do not have permission to share it.");
  }

  const token = crypto.randomBytes(16).toString("hex");

  const { data: share, error } = await supabase
    .from("shared_lectures")
    .insert({
      lecture_id: lectureId,
      shared_by: user.id,
      access_level: accessLevel,
      invite_token: token,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { inviteToken: share.invite_token };
}

export async function saveNoteVersionSnapshot(lectureId: string, expandedNotes: string, summary: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Verify lecture ownership
  const { data: lecture } = await supabase
    .from("lectures")
    .select("id")
    .eq("id", lectureId)
    .eq("user_id", user.id)
    .single();

  if (!lecture) return;

  // Insert snapshot
  await supabase.from("note_versions").insert({
    lecture_id: lectureId,
    expanded_notes: expandedNotes,
    summary,
  });

  // Keep only last 10 versions for this lecture
  const { data: versions } = await supabase
    .from("note_versions")
    .select("id, created_at")
    .eq("lecture_id", lectureId)
    .order("created_at", { ascending: false });

  if (versions && versions.length > 10) {
    const toDelete = versions.slice(10).map((v) => v.id);
    await supabase.from("note_versions").delete().in("id", toDelete);
  }
}

export async function fetchNoteVersions(lectureId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Ensure user owns lecture or has access to it
  const { data: lecture } = await supabase
    .from("lectures")
    .select("id")
    .eq("id", lectureId)
    .eq("user_id", user.id)
    .single();

  if (!lecture) {
    return [];
  }

  const { data } = await supabase
    .from("note_versions")
    .select("*")
    .eq("lecture_id", lectureId)
    .order("created_at", { ascending: false })
    .limit(10);

  return data || [];
}

export async function restoreNoteVersion(lectureId: string, versionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify ownership of the lecture first
  const { data: lecture } = await supabase
    .from("lectures")
    .select("id")
    .eq("id", lectureId)
    .eq("user_id", user.id)
    .single();

  if (!lecture) throw new Error("Lecture not found or unauthorized");

  const { data: version } = await supabase
    .from("note_versions")
    .select("*")
    .eq("id", versionId)
    .eq("lecture_id", lectureId)
    .single();

  if (!version) throw new Error("Version not found");

  await supabase
    .from("lectures")
    .update({
      expanded_notes: version.expanded_notes,
      summary: version.summary,
    })
    .eq("id", lectureId)
    .eq("user_id", user.id);

  revalidatePath(`/dashboard`);
  return { expandedNotes: version.expanded_notes, summary: version.summary };
}
