-- Migration: 002_create_shared_lectures_and_versions.sql
-- Description: Create shared_lectures and note_versions tables with RLS policies

-- 1. Create shared_lectures table
CREATE TABLE IF NOT EXISTS public.shared_lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id UUID NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit')),
    invite_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create note_versions table
CREATE TABLE IF NOT EXISTS public.note_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id UUID NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
    expanded_notes TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS
-- 3. Enable RLS
ALTER TABLE public.shared_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;

-- 4. RLS for shared_lectures
DROP POLICY IF EXISTS "Users can manage shared lectures they created" ON public.shared_lectures;
CREATE POLICY "Users can manage shared lectures they created"
    ON public.shared_lectures
    FOR ALL
    USING (auth.uid() = shared_by)
    WITH CHECK (
        auth.uid() = shared_by AND
        EXISTS (
            SELECT 1 FROM public.lectures l
            WHERE l.id = shared_lectures.lecture_id AND l.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view shares granted to them" ON public.shared_lectures;
CREATE POLICY "Users can view shares granted to them"
    ON public.shared_lectures
    FOR SELECT
    USING (auth.uid() = shared_with OR shared_with IS NULL);

-- 5. RLS for note_versions (through lecture ownership)
DROP POLICY IF EXISTS "Users can view versions of their lectures" ON public.note_versions;
CREATE POLICY "Users can view versions of their lectures"
    ON public.note_versions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lectures l
            WHERE l.id = note_versions.lecture_id AND l.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert versions for their lectures" ON public.note_versions;
CREATE POLICY "Users can insert versions for their lectures"
    ON public.note_versions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lectures l
            WHERE l.id = note_versions.lecture_id AND l.user_id = auth.uid()
        )
    );

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_shared_lectures_lecture_id ON public.shared_lectures(lecture_id);
CREATE INDEX IF NOT EXISTS idx_shared_lectures_shared_by ON public.shared_lectures(shared_by);
CREATE INDEX IF NOT EXISTS idx_shared_lectures_shared_with ON public.shared_lectures(shared_with);
CREATE INDEX IF NOT EXISTS idx_shared_lectures_token ON public.shared_lectures(invite_token);
CREATE INDEX IF NOT EXISTS idx_note_versions_lecture_id ON public.note_versions(lecture_id);
