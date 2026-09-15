"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
  courseName: string;
  lectureTitle: string;
  lectureDate: string;
  minimalNotes: string;
  expandedNotes: string;
  summary: string;
}

export function ExportButton({
  courseName,
  lectureTitle,
  lectureDate,
  minimalNotes,
  expandedNotes,
  summary,
}: ExportButtonProps) {
  const exportMarkdown = () => {
    const content = `# ${lectureTitle || `Lecture on ${lectureDate}`}
**Course:** ${courseName}  
**Date:** ${lectureDate}  

---

## 📋 Summary Cheat Sheet
${summary || "No summary available."}

---

## 📖 Full Study Notes
${expandedNotes || "No expanded notes available."}

---

## ✍️ Original Minimal Notes
${minimalNotes || "No minimal notes."}
`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(lectureTitle || "lecture").toLowerCase().replace(/[^a-z0-9]/gi, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPrintPDF = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <Download className="h-3.5 w-3.5 text-primary" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportMarkdown} className="cursor-pointer gap-2 text-xs">
          <FileText className="h-3.5 w-3.5 text-blue-500" /> Export as Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPrintPDF} className="cursor-pointer gap-2 text-xs">
          <Printer className="h-3.5 w-3.5 text-green-500" /> Print / Save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
