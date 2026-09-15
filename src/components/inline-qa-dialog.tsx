"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { askInlineQuestionAction, fetchInlineQAAction } from "@/app/actions/phase2";
import { InlineQA } from "@/types/database";
import { MessageSquareQuote, Send, Loader2, Bot, HelpCircle } from "lucide-react";
import { MarkdownViewer } from "@/components/markdown-viewer";

interface InlineQADialogProps {
  lectureId: string;
}

export function InlineQADialog({ lectureId }: InlineQADialogProps) {
  const [open, setOpen] = useState(false);
  const [concept, setConcept] = useState("");
  const [question, setQuestion] = useState("");
  const [threads, setThreads] = useState<InlineQA[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadThreads = async () => {
    try {
      const data = await fetchInlineQAAction(lectureId);
      setThreads(data as InlineQA[]);
    } catch (err) {
      console.error("Failed to load QA threads:", err);
    }
  };

  const handleOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      loadThreads();
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      await askInlineQuestionAction(lectureId, concept.trim() || "General Concept", question.trim());
      setQuestion("");
      setConcept("");
      await loadThreads();
    } catch (err) {
      console.error("Failed to ask question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <HelpCircle className="h-3.5 w-3.5 text-primary" /> Ask AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-primary" /> Inline Q&A with Study Buddy
          </DialogTitle>
          <DialogDescription>
            Ask clarifying questions about any topic or formula in this lecture note.
          </DialogDescription>
        </DialogHeader>

        {/* Previous Q&A Thread List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2 max-h-[350px]">
          {threads.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No questions asked yet. Got a doubt? Ask below!
            </div>
          ) : (
            threads.map((thread) => (
              <div key={thread.id} className="p-3.5 rounded-lg border bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>Q: {thread.question}</span>
                  {thread.selected_concept && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {thread.selected_concept}
                    </span>
                  )}
                </div>
                <div className="pt-1 text-muted-foreground border-t">
                  <div className="flex items-center gap-1.5 font-medium text-primary mb-1">
                    <Bot className="h-3.5 w-3.5" /> Study Buddy Answer:
                  </div>
                  <MarkdownViewer content={thread.answer} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleAsk} className="space-y-2 pt-2 border-t">
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Concept (optional)"
              className="text-xs h-8 col-span-1"
            />
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question (e.g., Why do we multiply by 2?)"
              required
              className="text-xs h-8 col-span-2"
            />
          </div>
          <Button type="submit" disabled={isLoading || !question.trim()} className="w-full text-xs h-8 gap-1.5">
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Submit Question
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
