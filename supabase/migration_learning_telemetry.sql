-- ==============================================================================
-- SkillHero Learning Telemetry Migration
-- ==============================================================================
-- Adds per-question attempt telemetry for near real-time learning adaptation.
-- Run this in Supabase SQL Editor.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    source TEXT NOT NULL,
    topic TEXT,
    difficulty TEXT,
    is_correct BOOLEAN NOT NULL,
    response_ms INTEGER,
    hint_used BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS question_attempts_user_idx
    ON public.question_attempts(user_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS question_attempts_question_idx
    ON public.question_attempts(question_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS question_attempts_source_idx
    ON public.question_attempts(source);

ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own attempts" ON public.question_attempts;
DROP POLICY IF EXISTS "Users can read own attempts" ON public.question_attempts;
DROP POLICY IF EXISTS "Admins can read all attempts" ON public.question_attempts;

CREATE POLICY "Users can insert own attempts" ON public.question_attempts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own attempts" ON public.question_attempts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all attempts" ON public.question_attempts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );
