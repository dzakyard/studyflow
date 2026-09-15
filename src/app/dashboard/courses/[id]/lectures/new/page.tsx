import { createLecture } from "@/app/actions/lectures";
import { redirect } from "next/navigation";

interface NewLecturePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewLecturePage({ params }: NewLecturePageProps) {
  const { id: courseId } = await params;

  // Create note session and redirect
  const lecture = await createLecture({ courseId });
  redirect(`/dashboard/courses/${courseId}/lectures/${lecture.id}`);
}
