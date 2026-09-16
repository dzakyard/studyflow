"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { createLecture } from "@/app/actions/lectures";
import { useRouter } from "next/navigation";

interface NewLectureButtonProps {
  courseId: string;
}

export function NewLectureButton({ courseId }: NewLectureButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const lecture = await createLecture({ courseId });
      router.push(`/dashboard/courses/${courseId}/lectures/${lecture.id}`);
    } catch (error) {
      console.error("Failed to create lecture:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCreate} disabled={isLoading} size="sm" className="gap-2 shadow-sm">
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      New Lecture
    </Button>
  );
}
