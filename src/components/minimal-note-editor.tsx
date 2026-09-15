"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { updateLectureNotes } from "@/app/actions/lectures";
import { triggerAiExpansion, triggerSectionReExpansion } from "@/app/actions/ai";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Edit2,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { Lecture, Course, DepthLevel } from "@/types/database";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { ShareDialog } from "@/components/share-dialog";
import { VersionHistoryDialog } from "@/components/version-history-dialog";
import { FlashcardDialog } from "@/components/flashcard-dialog";
import { InlineQADialog } from "@/components/inline-qa-dialog";
import { ExportButton } from "@/components/export-button";
import { saveNoteVersionSnapshot } from "@/app/actions/sharing";
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

  // Editable expanded notes & summary modes
  const [isEditingExpanded, setIsEditingExpanded] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // Section re-expansion state (Issue #14)
  const [isReExpandingSection, setIsReExpandingSection] = useState(false);
  const minimalTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveContent = useCallback(
    async (
      newTitle: string,
      newDate: string,
      newMinimal: string,
      newExpanded?: string,
      newSummary?: string,
      newDepth?: DepthLevel
    ) => {
      setSaveStatus("saving");
      try {
        await updateLectureNotes(lecture.id, {
          title: newTitle.trim() || undefined,
          lecture_date: newDate,
          minimal_notes: newMinimal,
          expanded_notes: newExpanded !== undefined ? newExpanded : undefined,
          summary: newSummary !== undefined ? newSummary : undefined,
          depth_level: newDepth || depthLevel,
        });
        if (newExpanded || newSummary) {
          saveNoteVersionSnapshot(lecture.id, newExpanded || "", newSummary || "").catch(console.error);
        }
        setSaveStatus("saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("unsaved");
      }
    },
    [lecture.id, depthLevel]
  );

  // Auto-save debounced every 5 seconds
  useEffect(() => {
    if (
      minimalNotes === (lecture.minimal_notes || "") &&
      title === (lecture.title || "") &&
      lectureDate === lecture.lecture_date &&
      expandedNotes === (lecture.expanded_notes || "") &&
      summary === (lecture.summary || "") &&
      depthLevel === lecture.depth_level
    ) {
      return;
    }

    setSaveStatus("unsaved");

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveContent(title, lectureDate, minimalNotes, expandedNotes, summary, depthLevel);
    }, 5000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [minimalNotes, title, lectureDate, expandedNotes, summary, depthLevel, lecture, saveContent]);

  const handleExpand = async () => {
    if (!minimalNotes.trim()) {
      setErrorMessage("Please add some notes first before triggering AI expansion.");
      return;
    }

    setErrorMessage(null);
    setIsExpanding(true);
    setExpandStep("expanding");

    await saveContent(title, lectureDate, minimalNotes, expandedNotes, summary, depthLevel);

    try {
      const timer = setTimeout(() => setExpandStep("summarizing"), 2500);
      const result = await triggerAiExpansion(lecture.id, depthLevel);
      clearTimeout(timer);

      setExpandedNotes(result.expandedNotes);
      setSummary(result.summary);
      setActiveTab("notes");
      setIsEditingExpanded(false);
      setIsEditingSummary(false);
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

  // Handle Section-level Re-expansion (Issue #14)
  const handleSectionReExpand = async (mode: "more_detail" | "more_concise" | "regenerate") => {
    const textarea = minimalTextareaRef.current;
    let selectedText = "";

    if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
      selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
    }

    // If no text explicitly highlighted, use the last non-empty bullet or paragraph
    if (!selectedText) {
      const lines = minimalNotes.split("\n").filter((l) => l.trim().length > 0);
      selectedText = lines[lines.length - 1] || minimalNotes;
    }

    if (!selectedText.trim()) {
      setErrorMessage("No section selected to re-expand. Highlight a line or paragraph first.");
      return;
    }

    setErrorMessage(null);
    setIsReExpandingSection(true);

    try {
      const { refinedSection } = await triggerSectionReExpansion(lecture.id, selectedText, mode);
      // Append or replace refined section in expanded notes
      const newExpanded = expandedNotes
        ? `${expandedNotes}\n\n---\n### 🔄 Refined Section (${mode.replace("_", " ")}):\n${refinedSection}`
        : refinedSection;

      setExpandedNotes(newExpanded);
      await saveContent(title, lectureDate, minimalNotes, newExpanded, summary, depthLevel);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to re-expand selected section."
      );
    } finally {
      setIsReExpandingSection(false);
    }
  };

  const isExpanded = Boolean(expandedNotes && expandedNotes.trim());

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
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
            {isExpanded ? "Side-by-Side Review" : "Minimal Note Session"}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Depth Selector (Issue #15) */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border text-xs">
            <SlidersHorizontal className="h-3 w-3 text-muted-foreground ml-1.5" />
            <span className="text-muted-foreground text-[11px] pr-1">Depth:</span>
            {(["brief", "standard", "deep_dive"] as DepthLevel[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepthLevel(d)}
                className={`px-2 py-0.5 rounded capitalize text-[11px] font-medium transition-colors ${
                  depthLevel === d
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.replace("_", " ")}
              </button>
            ))}
          </div>

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

      {/* Error Alert */}
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
        <div className="p-10 rounded-xl border bg-card/60 flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <Sparkles className="h-4 w-4 text-primary absolute" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {expandStep === "expanding" ? "Expanding your notes..." : "Summarizing key concepts..."}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              StudyFlow is converting your keywords into comprehensive explanations ({depthLevel.replace("_", " ")}) and distilling critical takeaways.
            </p>
          </div>
        </div>
      )}

      {/* If Expanded: Side-by-Side Review & Editable Outputs */}
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

            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded border hidden md:inline">
                ✨ AI-generated — please verify
              </span>
              <FlashcardDialog lectureId={lecture.id} hasExpandedNotes={isExpanded} />
              <InlineQADialog lectureId={lecture.id} />
              <ShareDialog lectureId={lecture.id} lectureTitle={title || `Lecture on ${lectureDate}`} />
              <VersionHistoryDialog
                lectureId={lecture.id}
                onRestore={(exp, sum) => {
                  setExpandedNotes(exp);
                  setSummary(sum);
                }}
              />
              <ExportButton
                courseName={course.name}
                lectureTitle={title || `Lecture on ${lectureDate}`}
                lectureDate={lectureDate}
                minimalNotes={minimalNotes}
                expandedNotes={expandedNotes}
                summary={summary}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpand}
                disabled={isExpanding}
                className="gap-1.5 text-xs h-8"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Re-expand All
              </Button>
            </div>
          </div>

          {/* Two-Panel Side-by-Side Review Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Panel: Original Minimal Notes with Section Re-Expansion (Issue #14) */}
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
                ref={minimalTextareaRef}
                value={minimalNotes}
                onChange={(e) => setMinimalNotes(e.target.value)}
                rows={14}
                className="text-xs font-mono leading-relaxed resize-none bg-background/80"
                placeholder="Edit original notes..."
              />

              {/* Section-level Re-expansion Action (Issue #14) */}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Highlight text to re-expand:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isReExpandingSection}
                      className="gap-1 text-xs h-7 px-2"
                    >
                      {isReExpandingSection ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <RefreshCw className="h-3 w-3 text-primary" />
                      )}
                      <span>Re-expand section</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs">Section Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleSectionReExpand("more_detail")}
                      className="text-xs cursor-pointer gap-2"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-blue-500" /> More detail
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSectionReExpand("more_concise")}
                      className="text-xs cursor-pointer gap-2"
                    >
                      <MinusCircle className="h-3.5 w-3.5 text-amber-500" /> More concise
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSectionReExpand("regenerate")}
                      className="text-xs cursor-pointer gap-2"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-green-500" /> Regenerate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right Panel: AI-Expanded / Summary Output with Edit/View Toggle */}
            <div className="lg:col-span-8 p-6 rounded-lg border bg-card shadow-sm min-h-[500px] flex flex-col">
              {activeTab === "notes" ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-xs font-medium text-muted-foreground">
                      {isEditingExpanded ? "Editing Markdown" : "Formatted Markdown"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingExpanded(!isEditingExpanded)}
                      className="gap-1.5 text-xs h-7"
                    >
                      {isEditingExpanded ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> View Formatted
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-3.5 w-3.5" /> Edit Notes
                        </>
                      )}
                    </Button>
                  </div>

                  {isEditingExpanded ? (
                    <Textarea
                      value={expandedNotes}
                      onChange={(e) => setExpandedNotes(e.target.value)}
                      className="flex-1 min-h-[400px] font-mono text-sm leading-relaxed p-4"
                      placeholder="Edit your expanded notes in markdown..."
                    />
                  ) : (
                    <MarkdownViewer content={expandedNotes} />
                  )}
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="bg-primary/5 px-2.5 py-1 rounded text-xs text-primary font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Concise Summary</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingSummary(!isEditingSummary)}
                      className="gap-1.5 text-xs h-7"
                    >
                      {isEditingSummary ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> View Formatted
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-3.5 w-3.5" /> Edit Summary
                        </>
                      )}
                    </Button>
                  </div>

                  {isEditingSummary ? (
                    <Textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="flex-1 min-h-[350px] font-mono text-sm leading-relaxed p-4"
                      placeholder="Edit summary markdown..."
                    />
                  ) : (
                    <MarkdownViewer content={summary || "No summary generated."} />
                  )}
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
              className="flex-1 min-h-[380px] w-full resize-none font-mono text-sm sm:text-base leading-relaxed p-4 border rounded-lg bg-card/50 shadow-inner focus-visible:ring-1 placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t">
            <div className="text-xs text-muted-foreground">
              Jot down keywords in class. Auto-saves every 5 seconds. Selected depth: <span className="font-semibold capitalize">{depthLevel.replace("_", " ")}</span>
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
