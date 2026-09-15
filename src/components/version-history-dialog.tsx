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
import { fetchNoteVersions, restoreNoteVersion } from "@/app/actions/sharing";
import { NoteVersion } from "@/types/database";
import { History, RotateCcw, Clock, Loader2 } from "lucide-react";

interface VersionHistoryDialogProps {
  lectureId: string;
  onRestore: (expanded: string, summary: string) => void;
}

export function VersionHistoryDialog({ lectureId, onRestore }: VersionHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNoteVersions(lectureId);
      setVersions(data as NoteVersion[]);
    } catch (err) {
      console.error("Failed to load versions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      loadVersions();
    }
  };

  const handleRestore = async (version: NoteVersion) => {
    setRestoringId(version.id);
    try {
      const result = await restoreNoteVersion(lectureId, version.id);
      onRestore(result.expandedNotes || "", result.summary || "");
      setOpen(false);
    } catch (err) {
      console.error("Failed to restore version:", err);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <History className="h-3.5 w-3.5 text-primary" /> History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Version History
          </DialogTitle>
          <DialogDescription>
            Last 10 edit snapshots. Select a version to restore previous notes and summaries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-8 flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No version history saved yet. Edits will automatically create snapshots.
            </p>
          ) : (
            versions.map((ver, idx) => (
              <div
                key={ver.id}
                className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Version #{versions.length - idx}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      ({new Date(ver.created_at).toLocaleString()})
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-1 text-[11px] font-mono">
                    {ver.expanded_notes?.slice(0, 100) || "No expanded notes"}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRestore(ver)}
                  disabled={restoringId === ver.id}
                  className="gap-1 text-xs h-7 shrink-0"
                >
                  {restoringId === ver.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3 text-primary" />
                  )}
                  Restore
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
