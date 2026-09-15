"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { updateLectureNotes } from "@/app/actions/lectures";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles, Calendar, BookOpen } from "lucide-react";
import { Lecture, Course } from "@/types/database";
import Link from "next/link";

interface MinimalNoteEditorProps {
  lecture: Lecture;
  course: Course;
}

export function MinimalNoteEditor({ lecture, course }: MinimalNoteEditorProps) {
  const [title, setTitle] = useState(lecture.title || "");
  const [lectureDate, setLectureDate] = useState(lecture.lecture_date);
  const [minimalNotes, setMinimalNotes] = useState(lecture.minimal_notes || "");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
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

  // Debounced auto-save every 5 seconds or when paused typing
  useEffect(() => {
    // Only schedule save if notes, title, or date changed from initial
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
    }, 5000); // 5-second debounce auto-save per acceptance criteria

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [minimalNotes, title, lectureDate, lecture, saveContent]);

  const handleManualSave = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveContent(title, lectureDate, minimalNotes);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Top Bar with Context and Auto-Save Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/dashboard/courses/${course.id}`}
            className="hover:text-foreground transition-colors font-medium flex items-center gap-1.5"
          >
            <BookOpen className="h-4 w-4" />
            {course.name}
          </Link>
          <span>/</span>
          <Badge variant="outline" className="text-xs">
            Minimal Note Session
          </Badge>
        </div>

        {/* Visual Auto-Save Status Indicator */}
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
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Saved
                </span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-500">Unsaved changes</span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualSave}
            disabled={saveStatus === "saving"}
            className="text-xs h-7 px-2.5"
          >
            Save now
          </Button>
        </div>
      </div>

      {/* Title and Date Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lecture Title (e.g. Week 4: Fourier Analysis)"
            className="text-lg font-semibold border-none shadow-none focus-visible:ring-1 px-2"
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

      {/* Distraction-free Note Input Area */}
      <div className="flex-1 flex flex-col pt-2">
        <Textarea
          value={minimalNotes}
          onChange={(e) => setMinimalNotes(e.target.value)}
          placeholder={`Type your lecture notes here... keywords, bullet points, anything

• Fourier transform — breaking signals into frequencies
• Convolution theorem — mult in freq = conv in time
• Nyquist rate — 2× max frequency`}
          className="flex-1 w-full resize-none font-mono text-sm sm:text-base leading-relaxed p-4 border rounded-lg bg-card/50 shadow-inner focus-visible:ring-1 placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t">
        <div className="text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 border rounded bg-muted">Tab</kbd> or type bullet points. Auto-saves every 5 seconds.
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity"
            disabled={!minimalNotes.trim()}
          >
            <Sparkles className="h-4 w-4" /> Expand Notes with AI
          </Button>
        </div>
      </div>
    </div>
  );
}
