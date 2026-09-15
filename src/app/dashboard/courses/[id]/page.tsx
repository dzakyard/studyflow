import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Edit3, Plus, Tag, CheckCircle2, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteCourseDialog } from "@/components/delete-course-dialog";
import { StudyGuideDialog } from "@/components/study-guide-dialog";
import { UserMenu } from "@/components/user-menu";
import { Course, Lecture } from "@/types/database";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !course) {
    notFound();
  }

  const typedCourse = course as Course;

  // Fetch lectures for this course, sorted by date (newest first)
  const { data: lectures } = await supabase
    .from("lectures")
    .select("*")
    .eq("course_id", id)
    .eq("user_id", user.id)
    .order("lecture_date", { ascending: false });

  const typedLectures = (lectures || []) as Lecture[];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header with Breadcrumbs */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
              {typedCourse.name}
            </span>
          </nav>
          <UserMenu user={user} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Course Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card rounded-lg border shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs uppercase font-medium">
                {typedCourse.subject_area}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {typedLectures.length} {typedLectures.length === 1 ? "lecture session" : "lecture sessions"}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{typedCourse.name}</h1>
            {typedCourse.description && (
              <p className="text-muted-foreground text-sm max-w-2xl">
                {typedCourse.description}
              </p>
            )}
            {typedCourse.textbook_reference && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1 font-medium">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Reference: {typedCourse.textbook_reference}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <Link href={`/dashboard/courses/${typedCourse.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" /> Edit Course
              </Button>
            </Link>
            <DeleteCourseDialog courseId={typedCourse.id} courseName={typedCourse.name} />
          </div>
        </div>

        {/* Syllabus Topics */}
        {typedCourse.syllabus_topics && typedCourse.syllabus_topics.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Syllabus Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {typedCourse.syllabus_topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="px-2.5 py-1 text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lecture Notes Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Lecture Notes</h2>
              <p className="text-sm text-muted-foreground">
                All note sessions sorted by lecture date (newest first)
              </p>
            </div>
            <div className="flex items-center gap-2">
              {typedLectures.length > 0 && (
                <StudyGuideDialog
                  courseId={typedCourse.id}
                  courseName={typedCourse.name}
                  lectures={typedLectures}
                />
              )}
              <Link href={`/dashboard/courses/${typedCourse.id}/lectures/new`}>
                <Button size="sm" className="gap-2 shadow-sm">
                  <Plus className="h-4 w-4" /> New Lecture
                </Button>
              </Link>
            </div>
          </div>

          {typedLectures.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-3">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                <h3 className="font-semibold text-lg">No lectures yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Start your first note session during class and expand it with AI afterwards!
                </p>
                <Link href={`/dashboard/courses/${typedCourse.id}/lectures/new`}>
                  <Button size="sm" className="mt-2">
                    Create First Lecture
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {typedLectures.map((lecture) => (
                <Link
                  key={lecture.id}
                  href={`/dashboard/courses/${typedCourse.id}/lectures/${lecture.id}`}
                  className="transition hover:-translate-y-0.5 block"
                >
                  <Card className="h-full hover:border-primary/50 transition-colors flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {lecture.lecture_date}
                        </span>
                        {lecture.expanded_notes ? (
                          <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700 dark:text-green-400 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Expanded
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <FileText className="h-3 w-3" /> Minimal
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-semibold line-clamp-1 pt-1">
                        {lecture.title || `Lecture on ${lecture.lecture_date}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2 text-xs">
                        {lecture.summary ||
                          lecture.expanded_notes ||
                          lecture.minimal_notes ||
                          "No notes added yet."}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
