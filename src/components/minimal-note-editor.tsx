"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { updateLectureNotes } from "@/app/actions/lectures";
import { triggerAiExpansion } from "@/app/actions/ai";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Loader2,
  Sparkles,
  Calendar,
  BookOpen,
  AlertCircle,
  FileText,
  ListFilter,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Lecture, Course, DepthLevel } from "@/types/database";
import { MarkdownViewer } from "@/components/markdown-viewer";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MinimalNoteEditorProps {
  lecture: Lecture;
  course: Course;
}

export function MinimalNoteEditor({ lecture, course }: MinimalNoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(lecture.title || "");
  const [lectureDate, setLectureDate] = useState(lecture.lecture_date);
  const [minimalNotes, setMinimalNotes] = useState(lecture.minimal_notes || "");
  const [expandedNotes, setExpandedNotes] = useState(lecture.expanded_notes || "");
  const [summary, setSummary] = useState(lecture.summary || "");
  const [depthLevel, setDepthLevel] = useState<DepthLevel>(lecture.depth_level || "standard");

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandStep, setExpandStep] = useState<"idle" | "expanding" | "summarizing">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("notes");

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveContent = useCallback(
    async (newTitle: string, newDate: string, newNotes: string) => {
      setSaveStatus("saving");
      try {
        await updateLectureNotes(lecture.id, {
          title: newTitle.trim() || undefined,
          lecture_date: newDate,
          minimal_notes: newNotes,
        });
        setSaveStatus("saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("unsaved");
      }
    },
    [lecture.id]
  );

  // Auto-save debounced every 5s
  useEffect(() => {
    if (
      minimalNotes === (lecture.minimal_notes || "") &&
      title === (lecture.title || "") &&
      lectureDate === lecture.lecture_date
    ) {
      return;
    }

    setSaveStatus("unsaved");

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveContent(title, lectureDate, minimalNotes);
    }, 5000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [minimalNotes, title, lectureDate, lecture, saveContent]);

  const handleExpand = async () => {
    if (!minimalNotes.trim()) {
      setErrorMessage("Please add some notes first before triggering AI expansion.");
      return;
    }

    setErrorMessage(null);
    setIsExpanding(true);
    setExpandStep("expanding");

    // Immediate save before calling AI
    await saveContent(title, lectureDate, minimalNotes);

    try {
      setExpandStep("expanding");
      // Short delay simulation for progress clarity if response is fast
      const timer = setTimeout(() => setExpandStep("summarizing"), 2000);

      const result = await triggerAiExpansion(lecture.id, depthLevel);
      clearTimeout(timer);

      setExpandedNotes(result.expandedNotes);
      setSummary(result.summary);
      setActiveTab("notes"); // Default to Full Notes after expansion
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to generate expansion. Please check your Gemini API key and try again."
      );
    } finally {
      setIsExpanding(false);
      setExpandStep("idle");
    }
  };

  const isExpanded = Boolean(expandedNotes && expandedNotes.trim());

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Context & Save Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/dashboard/courses/${course.id}`}
            className="hover:text-foreground transition-colors font-medium flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <BookOpen className="h-4 w-4" />
            {course.name}
          </Link>
          <span>/</span>
          <Badge variant="outline" className="text-xs">
            {isExpanded ? "Study Notes" : "Minimal Note Session"}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">Saved</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-500">Unsaved changes</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title and Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lecture Title (e.g. Week 4: Fourier Analysis)"
            className="text-xl font-bold border-none shadow-none focus-visible:ring-1 px-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={lectureDate}
            onChange={(e) => setLectureDate(e.target.value)}
            className="border-none shadow-none text-xs focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Error Alert with Retry */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExpand}
            className="border-destructive/30 hover:bg-destructive/10 text-xs h-7"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State during AI Expansion */}
      {isExpanding && (
        <div className="p-8 rounded-xl border bg-card/60 flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <Sparkles className="h-4 w-4 text-primary absolute" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {expandStep === "expanding" ? "Expanding your notes..." : "Summarizing key concepts..."}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              StudyFlow is converting your keywords into comprehensive explanations and distilling critical takeaways.
            </p>
          </div>
        </div>
      )}

      {/* If Expanded: Render Tabs (Full Notes vs Summary) with Side Toggle */}
      {isExpanded && !isExpanding && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="notes" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <FileText className="h-3.5 w-3.5" /> Full Notes
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <ListFilter className="h-3.5 w-3.5" /> Summary
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded border">
                ✨ AI-generated — please verify
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpand}
                disabled={isExpanding}
                className="gap-1.5 text-xs h-8"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Re-expand
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Original Minimal Notes (collapsible/review) */}
            <div className="lg:col-span-4 p-4 rounded-lg border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Original Minimal Notes
                </h4>
                <Badge variant="secondary" className="text-[10px]">
                  Raw Input
                </Badge>
              </div>
              <Textarea
                value={minimalNotes}
                onChange={(e) => setMinimalNotes(e.target.value)}
                rows={10}
                className="text-xs font-mono leading-relaxed resize-none bg-background/80"
                placeholder="Edit your original notes..."
              />
            </div>

            {/* Right Column: AI Output (Full Notes / Summary Tabs) */}
            <div className="lg:col-span-8 p-6 rounded-lg border bg-card shadow-sm min-h-[400px]">
              {activeTab === "notes" ? (
                <div className="space-y-4">
                  <MarkdownViewer content={expandedNotes} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/5 p-3 rounded-md border border-primary/10 text-xs text-primary font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Concise Cheat Sheet (≤ 20% of expanded length)</span>
                  </div>
                  <MarkdownViewer content={summary || "No summary available."} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* If Not Expanded: Clean minimal input view */}
      {!isExpanded && !isExpanding && (
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 flex flex-col">
            <Textarea
              value={minimalNotes}
              onChange={(e) => setMinimalNotes(e.target.value)}
              placeholder={`Type your lecture notes here... keywords, bullet points, anything

• Fourier transform — breaking signals into frequencies
• Convolution theorem — mult in freq = conv in time
• Nyquist rate — 2× max frequency`}
              className="flex-1 min-h-[350px] w-full resize-none font-mono text-sm sm:text-base leading-relaxed p-4 border rounded-lg bg-card/50 shadow-inner focus-visible:ring-1 placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t">
            <div className="text-xs text-muted-foreground">
              Tip: Jot down keywords during class. Auto-saves every 5 seconds.
            </div>
            <Button
              onClick={handleExpand}
              disabled={isExpanding || !minimalNotes.trim()}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-primary/85 shadow-sm hover:opacity-90 font-medium"
            >
              <Sparkles className="h-4 w-4" /> Expand Notes with AI
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
