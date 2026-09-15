"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShareInvite } from "@/app/actions/sharing";
import { Share2, Copy, Check, Users } from "lucide-react";

interface ShareDialogProps {
  lectureId: string;
  lectureTitle: string;
}

export function ShareDialog({ lectureId, lectureTitle }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [accessLevel, setAccessLevel] = useState<"view" | "edit">("view");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const { inviteToken } = await createShareInvite(lectureId, accessLevel);
      const url = `${window.location.origin}/shared/${inviteToken}`;
      setShareUrl(url);
    } catch (err) {
      console.error("Failed to create share invite:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <Share2 className="h-3.5 w-3.5 text-primary" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Share Lecture Notes
          </DialogTitle>
          <DialogDescription>
            Share &quot;{lectureTitle}&quot; with classmates via an invite link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs">Access Level</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={accessLevel === "view" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setAccessLevel("view");
                  setShareUrl(null);
                }}
                className="flex-1 text-xs"
              >
                View Only
              </Button>
              <Button
                type="button"
                variant={accessLevel === "edit" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setAccessLevel("edit");
                  setShareUrl(null);
                }}
                className="flex-1 text-xs"
              >
                Can Edit (Collaborative)
              </Button>
            </div>
          </div>

          {!shareUrl ? (
            <Button
              onClick={handleGenerateLink}
              disabled={isLoading}
              className="w-full text-xs"
            >
              {isLoading ? "Generating link..." : "Create Invite Link"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs">Shareable Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="font-mono text-xs bg-muted/50"
                />
                <Button size="sm" onClick={handleCopy} className="shrink-0 gap-1.5 text-xs">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
