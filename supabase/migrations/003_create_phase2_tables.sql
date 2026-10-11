-- Migration: 003_create_phase2_tables.sql
-- Description: Create flashcards and inline_qa tables

-- 1. Flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id UUID NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    confidence_level INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Inline QA threads table
CREATE TABLE IF NOT EXISTS public.inline_qa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id UUID NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    selected_concept TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inline_qa ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies
DROP POLICY IF EXISTS "Users can CRUD their own flashcards" ON public.flashcards;
CREATE POLICY "Users can CRUD their own flashcards"
    ON public.flashcards
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.lectures l
            WHERE l.id = flashcards.lecture_id AND l.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can CRUD their own inline_qa" ON public.inline_qa;
CREATE POLICY "Users can CRUD their own inline_qa"
    ON public.inline_qa
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.lectures l
            WHERE l.id = inline_qa.lecture_id AND l.user_id = auth.uid()
        )
    );

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_flashcards_lecture ON public.flashcards(lecture_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_inline_qa_lecture ON public.inline_qa(lecture_id);
CREATE INDEX IF NOT EXISTS idx_inline_qa_user ON public.inline_qa(user_id);
