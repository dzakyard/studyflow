import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Search,
} from "lucide-react";

export default async function LandingPage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Navbar */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-xl tracking-tight">DeJot</span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5 shadow-sm">
                  Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm" className="gap-1 shadow-sm">
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/40 text-xs font-medium text-muted-foreground animate-in fade-in duration-500">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>AI-Powered Lecture Note Expansion & Summarization</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Type less, <span className="text-primary underline decoration-primary/40 underline-offset-4">learn more</span>.
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
          Jot down keywords and bullet fragments in class. DeJot turns them into complete, structured study notes and concise cheat sheets.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={user ? "/dashboard" : "/auth/sign-up"}>
            <Button size="lg" className="h-12 px-8 text-base gap-2 shadow-md">
              Get Started — It&apos;s Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button variant="outline" size="lg" className="h-12 px-6 text-base">
              See Before & After
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          Free for all students • No credit card required • Powered by Google Gemini
        </p>
      </section>

      {/* Before & After Interactive Demo Section */}
      <section id="demo" className="py-16 bg-muted/20 border-y px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">The Before & After</h2>
            <p className="text-sm text-muted-foreground">
              From in-class shorthand to high-scoring exam materials in one click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left Panel: Minimal Note Input */}
            <div className="md:col-span-5 p-5 rounded-xl border bg-card/80 shadow-sm space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b">
                <Badge variant="outline" className="text-xs">
                  What You Type in Class
                </Badge>
                <span className="text-[11px] text-muted-foreground">30 seconds</span>
              </div>
              <div className="font-mono text-xs leading-relaxed text-muted-foreground bg-muted/40 p-4 rounded-lg flex-1 space-y-2">
                <p>• Fourier transform — breaking signals into frequencies</p>
                <p>• Convolution theorem — mult in freq = conv in time</p>
                <p>• Nyquist rate — 2× max frequency</p>
                <p>• Aliasing — high freq looks like low freq if undersampled</p>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                <Clock className="h-3.5 w-3.5" /> No distractions, listen to the lecturer.
              </div>
            </div>

            {/* Right Panel: Expanded Study Note */}
            <div className="md:col-span-7 p-6 rounded-xl border bg-card shadow-sm space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  What DeJot Generates
                </Badge>
                <span className="text-[11px] text-muted-foreground">Comprehensive & Structured</span>
              </div>
              <div className="text-xs sm:text-sm leading-relaxed space-y-3 flex-1">
                <div>
                  <h4 className="font-bold text-foreground text-sm">1. Fourier Transform</h4>
                  <p className="text-muted-foreground text-xs pt-0.5">
                    A mathematical transform that decomposes functions depending on space or time into functions depending on spatial or temporal frequency:
                  </p>
                  <code className="block bg-muted/60 p-2 rounded text-[11px] font-mono my-1.5">
                    F(ω) = ∫ f(t) · e^(-iωt) dt
                  </code>
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">2. Convolution Theorem & Nyquist Rate</h4>
                  <p className="text-muted-foreground text-xs pt-0.5">
                    Convolution in the time domain is equivalent to point-wise multiplication in the frequency domain. To prevent aliasing distortion, the sampling rate must exceed <strong>2 × f_max</strong>.
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-primary flex items-center gap-1.5 pt-1 border-t">
                <CheckCircle2 className="h-3.5 w-3.5" /> Includes clear analogies, definitions, and auto-generated summary cheat sheets.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-sm text-muted-foreground">
            A frictionless workflow designed around how students actually study.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6 space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              1
            </div>
            <h3 className="font-semibold text-lg">1. Capture</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jot down minimal keywords and topics in a clean, distraction-free editor with 5-second auto-save.
            </p>
          </Card>

          <Card className="text-center p-6 space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              2
            </div>
            <h3 className="font-semibold text-lg">2. Expand</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              With one click, Gemini AI combines your notes with syllabus context to generate complete, structured explanations.
            </p>
          </Card>

          <Card className="text-center p-6 space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              3
            </div>
            <h3 className="font-semibold text-lg">3. Review & Summarize</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compare side-by-side, toggle to the concise summary cheat sheet, and adjust depth levels as needed.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">DeJot</span>
            <span>— AI Note Companion for Students</span>
          </div>
          <div>
            Built with Next.js, Tailwind CSS, shadcn/ui, Supabase & Google Gemini API.
          </div>
        </div>
      </footer>
    </div>
  );
}
