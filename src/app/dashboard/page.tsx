import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Clock, Plus, Sparkles, ArrowRight } from "lucide-react";
import { Course, Lecture } from "@/types/database";
import { Suspense } from "react";

interface CourseWithStats extends Course {
  lectureCount: number;
  lastLectureDate: string | null;
}

async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Run queries concurrently and only select needed columns to reduce payload
  const [coursesResult, lecturesResult] = await Promise.all([
    supabase
      .from("courses")
      .select("id, name, subject_area, description, syllabus_topics, textbook_reference")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    
    supabase
      .from("lectures")
      .select("id, course_id, lecture_date, title, expanded_notes, courses(name, subject_area)")
      .eq("user_id", user.id)
      .order("lecture_date", { ascending: false })
  ]);

  const courses = coursesResult.data || [];
  const allLectures = lecturesResult.data || [];

  const lectures = allLectures as unknown as (Lecture & { courses: { name: string; subject_area: string } })[];

  // Calculate lecture count & last date per course
  const coursesWithStats: CourseWithStats[] = (courses || []).map((c) => {
    const courseLectures = lectures.filter((l) => l.course_id === c.id);
    return {
      ...(c as Course),
      lectureCount: courseLectures.length,
      lastLectureDate: courseLectures.length > 0 ? courseLectures[0].lecture_date : null,
    };
  });

  const recentLectures = lectures.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-xl tracking-tight">StudyFlow</span>
          </div>
          <div className="hidden sm:block flex-1 max-w-md mx-6">
            <SearchBar />
          </div>
          <div className="flex items-center gap-4">
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Course Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Organize your university courses and review AI-expanded study notes.
            </p>
          </div>
          <Link href="/dashboard/courses/new">
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> New Course
            </Button>
          </Link>
        </div>

        {/* Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">My Courses</h2>
            <span className="text-xs text-muted-foreground">
              {coursesWithStats.length} {coursesWithStats.length === 1 ? "course" : "courses"}
            </span>
          </div>

          {coursesWithStats.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-3">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                <h3 className="font-semibold text-lg">No courses yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Create your first course to get started with AI note expansion!
                </p>
                <Link href="/dashboard/courses/new">
                  <Button className="mt-2">Create Your First Course</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {coursesWithStats.map((course) => (
                <Link
                  key={course.id}
                  href={`/dashboard/courses/${course.id}`}
                  className="group block transition hover:-translate-y-1"
                >
                  <Card className="h-full flex flex-col justify-between group-hover:border-primary/50 group-hover:shadow-md transition-all">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-normal uppercase">
                          {course.subject_area}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {course.lectureCount} {course.lectureCount === 1 ? "lecture" : "lectures"}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                        {course.name}
                      </CardTitle>
                      {course.description && (
                        <CardDescription className="line-clamp-2 text-xs">
                          {course.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      {course.syllabus_topics && course.syllabus_topics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {course.syllabus_topics.slice(0, 3).map((topic) => (
                            <Badge
                              key={topic}
                              variant="secondary"
                              className="text-[10px] py-0 px-2 font-normal"
                            >
                              {topic}
                            </Badge>
                          ))}
                          {course.syllabus_topics.length > 3 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{course.syllabus_topics.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-[11px] text-muted-foreground pt-3 border-t flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {course.lastLectureDate ? `Last: ${course.lastLectureDate}` : "No lectures yet"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Lectures Feed (Issue #10 task) */}
        {recentLectures.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Lecture Notes
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentLectures.map((lecture) => (
                <Link
                  key={lecture.id}
                  href={`/dashboard/courses/${lecture.course_id}/lectures/${lecture.id}`}
                  className="block group"
                >
                  <Card className="hover:border-primary/50 transition-colors p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground truncate max-w-[150px]">
                        {lecture.courses?.name}
                      </span>
                      <span>{lecture.lecture_date}</span>
                    </div>
                    <div className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                      {lecture.title || `Lecture on ${lecture.lecture_date}`}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      {lecture.expanded_notes ? (
                        <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-700 dark:text-green-400">
                          Expanded & Summarized
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Minimal notes only
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
