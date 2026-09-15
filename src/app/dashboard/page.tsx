import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Sparkles } from "lucide-react";
import { Course } from "@/types/database";
import { Suspense } from "react";

async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch courses owned by current user
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedCourses = (courses || []) as Course[];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-xl tracking-tight">StudyFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground text-sm">
              Manage your courses and lecture notes for AI-powered expansion.
            </p>
          </div>
          <Link href="/dashboard/courses/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Course
            </Button>
          </Link>
        </div>

        {/* Courses Cards Grid */}
        {typedCourses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-lg">No courses created yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Add your current university courses to provide context for AI study notes.
              </p>
              <Link href="/dashboard/courses/new">
                <Button className="mt-2">Create Your First Course</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {typedCourses.map((course) => (
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
                    </div>
                    <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
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
                            +{course.syllabus_topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground pt-2 border-t flex justify-between items-center">
                      <span>View lectures & context</span>
                      <span className="font-semibold group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading courses...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
