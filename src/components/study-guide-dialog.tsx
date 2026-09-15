"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { generateStudyGuideAction } from "@/app/actions/phase2";
import { Lecture } from "@/types/database";
import { BookOpen, Sparkles, Loader2, Printer } from "lucide-react";
import { MarkdownViewer } from "@/components/markdown-viewer";

interface StudyGuideDialogProps {
  courseId: string;
  courseName: string;
  lectures: Lecture[];
}

export function StudyGuideDialog({ courseId, courseName, lectures }: StudyGuideDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(lectures.map((l) => l.id));
  const [studyGuide, setStudyGuide] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      const { studyGuide: result } = await generateStudyGuideAction(courseId, selectedIds);
      setStudyGuide(result);
    } catch (err) {
      console.error("Failed to generate study guide:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <BookOpen className="h-4 w-4 text-primary" /> Study Guide Generator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Exam Study Guide Generator
          </DialogTitle>
          <DialogDescription>
            Synthesize key concepts across multiple lectures for {courseName} into a unified study guide.
          </DialogDescription>
        </DialogHeader>

        {!studyGuide ? (
          <div className="space-y-4 py-2 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Select lectures to include ({selectedIds.length} of {lectures.length} selected):
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {lectures.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => toggleSelect(l.id)}
                    className="flex items-center space-x-3 p-2.5 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 text-xs"
                  >
                    <Checkbox checked={selectedIds.includes(l.id)} />
                    <div className="flex-1 truncate">
                      <span className="font-medium text-foreground">
                        {l.title || `Lecture on ${l.lecture_date}`}
                      </span>
                      <span className="text-muted-foreground ml-2">({l.lecture_date})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || selectedIds.length === 0}
              className="w-full gap-2 text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Synthesizing study guide...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Comprehensive Study Guide
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 py-2">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-xs font-semibold text-primary">Generated Study Guide</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStudyGuide(null)}
                  className="text-xs h-7"
                >
                  Back to selection
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.print()}
                  className="text-xs h-7 gap-1"
                >
                  <Printer className="h-3.5 w-3.5" /> Print / PDF
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card text-xs sm:text-sm">
              <MarkdownViewer content={studyGuide} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
