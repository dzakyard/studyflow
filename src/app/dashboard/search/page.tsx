import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calendar, FileText, Search, Sparkles } from "lucide-react";
import { Lecture } from "@/types/database";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let results: (Lecture & { courses: { name: string; subject_area: string } })[] = [];

  if (query) {
    // Sanitize query to prevent wildcard injection in PostgREST ilike
    const escapedQuery = query
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_")
      .replace(/,/g, "");

    // Search across minimal_notes, expanded_notes, summary, or title (using ilike)
    const { data } = await supabase
      .from("lectures")
      .select("*, courses(name, subject_area)")
      .eq("user_id", user.id)
      .or(
        `title.ilike.%${escapedQuery}%,minimal_notes.ilike.%${escapedQuery}%,expanded_notes.ilike.%${escapedQuery}%,summary.ilike.%${escapedQuery}%`
      )
      .order("lecture_date", { ascending: false });

    results = (data || []) as (Lecture & { courses: { name: string; subject_area: string } })[];
  }

  const highlightText = (text: string | null, term: string) => {
    if (!text || !term) return text;
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return text.slice(0, 160) + "...";

    const start = Math.max(0, index - 60);
    const end = Math.min(text.length, index + term.length + 80);
    const excerpt = (start > 0 ? "..." : "") + text.substring(start, end) + (end < text.length ? "..." : "");

    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = excerpt.split(new RegExp(`(${escapedTerm})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/60 text-foreground font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex-1 max-w-md hidden sm:block">
            <SearchBar defaultValue={query} />
          </div>
          <UserMenu user={user} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="sm:hidden">
          <SearchBar defaultValue={query} />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
          <p className="text-sm text-muted-foreground">
            {query ? (
              <>
                Found {results.length} results matching &quot;<span className="font-semibold text-foreground">{query}</span>&quot;
              </>
            ) : (
              "Enter a term above to search across all lecture notes and summaries."
            )}
          </p>
        </div>

        {query && results.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-3">
              <Search className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-lg">No matches found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No lectures match &quot;{query}&quot;. Try searching for a different concept or subject keyword.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((lecture) => (
              <Link
                key={lecture.id}
                href={`/dashboard/courses/${lecture.course_id}/lectures/${lecture.id}`}
                className="block group"
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs uppercase">
                          {lecture.courses?.subject_area}
                        </Badge>
                        <span className="font-medium text-foreground">{lecture.courses?.name}</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {lecture.lecture_date}
                      </span>
                    </div>
                    <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors pt-1">
                      {lecture.title || `Lecture on ${lecture.lecture_date}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="p-3 bg-muted/30 rounded-lg border leading-relaxed font-mono text-xs">
                      {highlightText(
                        lecture.expanded_notes || lecture.summary || lecture.minimal_notes,
                        query
                      )}
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
