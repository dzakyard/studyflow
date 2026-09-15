"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagInput } from "@/components/tag-input";
import { createCourse, updateCourse, CourseFormData } from "@/app/actions/courses";
import { Course } from "@/types/database";

interface CourseFormProps {
  initialData?: Course;
  isEdit?: boolean;
}

export function CourseForm({ initialData, isEdit = false }: CourseFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [subjectArea, setSubjectArea] = useState(initialData?.subject_area || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [syllabusTopics, setSyllabusTopics] = useState<string[]>(
    initialData?.syllabus_topics || []
  );
  const [textbookReference, setTextbookReference] = useState(
    initialData?.textbook_reference || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData: CourseFormData = {
      name,
      subject_area: subjectArea,
      description,
      syllabus_topics: syllabusTopics,
      textbook_reference: textbookReference,
    };

    try {
      if (isEdit && initialData) {
        await updateCourse(initialData.id, formData);
        router.refresh();
      } else {
        await createCourse(formData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save course");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isEdit ? "Edit Course Context" : "Create New Course"}
        </CardTitle>
        <CardDescription>
          Provide course metadata (topics, subject, textbook) to help AI generate tailored study notes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Course Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. CS 101: Introduction to Algorithms"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Subject Area */}
          <div className="space-y-2">
            <Label htmlFor="subject_area">
              Subject Area <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject_area"
              placeholder="e.g. Computer Science, Linear Algebra, Organic Chemistry"
              required
              value={subjectArea}
              onChange={(e) => setSubjectArea(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Course Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief course overview, goals, or prerequisites..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Syllabus Topics */}
          <div className="space-y-2">
            <Label>Syllabus Topics</Label>
            <p className="text-xs text-muted-foreground">
              Add topics covered in this course to ground AI note expansions.
            </p>
            <TagInput
              value={syllabusTopics}
              onChange={setSyllabusTopics}
              placeholder="Type topic (e.g., Dynamic Programming) and press Enter"
            />
          </div>

          {/* Textbook Reference */}
          <div className="space-y-2">
            <Label htmlFor="textbook">Textbook / References (Optional)</Label>
            <Input
              id="textbook"
              placeholder="e.g. Introduction to Algorithms (CLRS 3rd Edition)"
              value={textbookReference}
              onChange={(e) => setTextbookReference(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? "Saving changes..."
                  : "Creating course..."
                : isEdit
                ? "Save Changes"
                : "Create Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
