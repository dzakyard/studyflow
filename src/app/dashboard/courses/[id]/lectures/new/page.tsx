import { createLecture } from "@/app/actions/lectures";

interface NewLecturePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewLecturePage({ params }: NewLecturePageProps) {
  const { id: courseId } = await params;

  // Immediately create a new note session with default date and redirect to it
  await createLecture({ courseId });

  return null;
}
