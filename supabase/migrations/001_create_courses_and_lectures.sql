-- Migration: 001_create_courses_and_lectures.sql
-- Description: Create courses and lectures tables with Row Level Security (RLS)

-- 1. Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject_area TEXT NOT NULL,
    description TEXT,
    syllabus_topics TEXT[] DEFAULT '{}',
    textbook_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create lectures table
CREATE TABLE IF NOT EXISTS public.lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    lecture_date DATE NOT NULL DEFAULT CURRENT_DATE,
    minimal_notes TEXT,
    expanded_notes TEXT,
    summary TEXT,
    depth_level TEXT NOT NULL DEFAULT 'standard' CHECK (depth_level IN ('brief', 'standard', 'deep_dive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach triggers for auto updating updated_at
DROP TRIGGER IF EXISTS trigger_set_courses_updated_at ON public.courses;
CREATE TRIGGER trigger_set_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_set_lectures_updated_at ON public.lectures;
CREATE TRIGGER trigger_set_lectures_updated_at
    BEFORE UPDATE ON public.lectures
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for courses
DROP POLICY IF EXISTS "Users can view their own courses" ON public.courses;
CREATE POLICY "Users can view their own courses"
    ON public.courses
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own courses" ON public.courses;
CREATE POLICY "Users can create their own courses"
    ON public.courses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own courses" ON public.courses;
CREATE POLICY "Users can update their own courses"
    ON public.courses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own courses" ON public.courses;
CREATE POLICY "Users can delete their own courses"
    ON public.courses
    FOR DELETE
    USING (auth.uid() = user_id);

-- 7. RLS Policies for lectures
DROP POLICY IF EXISTS "Users can view their own lectures" ON public.lectures;
CREATE POLICY "Users can view their own lectures"
    ON public.lectures
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own lectures" ON public.lectures;
CREATE POLICY "Users can create their own lectures"
    ON public.lectures
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lectures" ON public.lectures;
CREATE POLICY "Users can update their own lectures"
    ON public.lectures
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own lectures" ON public.lectures;
CREATE POLICY "Users can delete their own lectures"
    ON public.lectures
    FOR DELETE
    USING (auth.uid() = user_id);

-- 8. Helpful indexes
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_course_id ON public.lectures(course_id);
CREATE INDEX IF NOT EXISTS idx_lectures_user_id ON public.lectures(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_date ON public.lectures(lecture_date DESC);
