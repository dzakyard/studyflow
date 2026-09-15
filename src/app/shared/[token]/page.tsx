import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Calendar, BookOpen, Lock, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SharedLecturePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedLecturePage({ params }: SharedLecturePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // Look up share invite
  const { data: share } = await supabase
    .from("shared_lectures")
    .select("*, lectures(*, courses(*))")
    .eq("invite_token", token)
    .single();

  if (!share || !share.lectures) {
    notFound();
  }

  const lecture = share.lectures as unknown as {
    title: string | null;
    lecture_date: string;
    minimal_notes: string | null;
    expanded_notes: string | null;
    summary: string | null;
    depth_level: string;
    courses: { name: string; subject_area: string };
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-xl tracking-tight">StudyFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Users className="h-3.5 w-3.5 text-primary" /> Shared ({share.access_level} access)
            </Badge>
            <Link href="/auth/sign-up">
              <Button size="sm" variant="outline">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        <div className="space-y-2 pb-4 border-b">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              {lecture.courses?.name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {lecture.lecture_date}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lecture.title || `Lecture on ${lecture.lecture_date}`}
          </h1>
        </div>

        {lecture.summary && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Quick Review Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownViewer content={lecture.summary} />
            </CardContent>
          </Card>
        )}

        <div className="p-6 rounded-lg border bg-card shadow-sm space-y-4">
          <h2 className="text-xl font-bold tracking-tight border-b pb-2">Full Study Notes</h2>
          {lecture.expanded_notes ? (
            <MarkdownViewer content={lecture.expanded_notes} />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {lecture.minimal_notes || "No notes available."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
