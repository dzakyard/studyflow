import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { MinimalNoteEditor } from "@/components/minimal-note-editor";
import { UserMenu } from "@/components/user-menu";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Course, Lecture } from "@/types/database";

interface LecturePageProps {
  params: Promise<{ courseId: string; lectureId: string }>;
}

export default async function LecturePage({ params }: LecturePageProps) {
  const { courseId, lectureId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("user_id", user.id)
    .single();

  if (!course) {
    notFound();
  }

  const { data: lecture } = await supabase
    .from("lectures")
    .select("*")
    .eq("id", lectureId)
    .eq("course_id", courseId)
    .eq("user_id", user.id)
    .single();

  if (!lecture) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Top Header */}
      <header className="border-b h-14 flex items-center px-4 sm:px-6 justify-between shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-bold text-lg tracking-tight">StudyFlow</span>
        </Link>
        <UserMenu user={user} />
      </header>

      {/* Editor Main */}
      <main className="flex-1 overflow-hidden">
        <MinimalNoteEditor
          lecture={lecture as Lecture}
          course={course as Course}
        />
      </main>
    </div>
  );
}
