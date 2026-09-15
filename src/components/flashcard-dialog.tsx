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
import { createFlashcardsAction, fetchFlashcardsAction } from "@/app/actions/phase2";
import { Flashcard } from "@/types/database";
import { Layers, RotateCw, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FlashcardDialogProps {
  lectureId: string;
  hasExpandedNotes: boolean;
}

export function FlashcardDialog({ lectureId, hasExpandedNotes }: FlashcardDialogProps) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrGenerate = async () => {
    setIsLoading(true);
    try {
      let existing = await fetchFlashcardsAction(lectureId);
      if (!existing || existing.length === 0) {
        await createFlashcardsAction(lectureId);
        existing = await fetchFlashcardsAction(lectureId);
      }
      setCards(existing as Flashcard[]);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error("Failed to load flashcards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      loadOrGenerate();
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasExpandedNotes}
          className="gap-1.5 text-xs h-8"
        >
          <Layers className="h-3.5 w-3.5 text-primary" /> Flashcards
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> AI-Generated Flashcards
          </DialogTitle>
          <DialogDescription>
            Spaced-repetition review extracted directly from your expanded study notes.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Extracting Q&A flashcards...</span>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No flashcards available. Expand your notes first to generate cards.
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <span className="italic">Click card to flip</span>
            </div>

            {/* Flip Card Interaction */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer min-h-[220px] rounded-xl border bg-card p-6 flex flex-col items-center justify-center text-center transition-all hover:border-primary/50 shadow-sm relative select-none"
            >
              <span className="absolute top-3 left-3 text-[10px] uppercase font-semibold text-muted-foreground">
                {isFlipped ? "Answer" : "Question"}
              </span>

              <p className="text-base sm:text-lg font-medium leading-relaxed">
                {isFlipped ? currentCard.answer : currentCard.question}
              </p>

              <span className="absolute bottom-3 text-[11px] text-muted-foreground flex items-center gap-1">
                <RotateCw className="h-3 w-3" /> Tap to reveal {isFlipped ? "question" : "answer"}
              </span>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((i) => Math.max(0, i - 1));
                }}
                disabled={currentIndex === 0}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={loadOrGenerate}
                className="text-xs gap-1"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Regenerate
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
                }}
                disabled={currentIndex === cards.length - 1}
                className="gap-1 text-xs"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
