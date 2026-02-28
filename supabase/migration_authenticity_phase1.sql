-- ==============================================================================
-- SkillHero Authenticity Phase 1 Migration (Supabase-First)
-- ==============================================================================
-- Adds:
-- - Career authenticity profile fields (tech mastery + tier tracking)
-- - Scenario-capable question metadata
-- - Promotion exam system
-- - Secure RPC helpers for battle rewards and promotion gating
-- Run this in Supabase SQL Editor.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) PROFILES: authenticity progression fields
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS tech_mastery JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS current_tier TEXT DEFAULT 'JUNIOR';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_current_tier_check'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_current_tier_check
            CHECK (current_tier IN ('JUNIOR', 'MID', 'SENIOR', 'STAFF', 'PRINCIPAL'));
    END IF;
END $$;

-- 2) QUESTIONS: scenario and tradeoff metadata
ALTER TABLE public.questions
    ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'mcq',
    ADD COLUMN IF NOT EXISTS scenario_context TEXT,
    ADD COLUMN IF NOT EXISTS tradeoff_notes TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'questions_question_type_check'
    ) THEN
        ALTER TABLE public.questions
            ADD CONSTRAINT questions_question_type_check
            CHECK (question_type IN ('mcq', 'log_debug', 'code_review', 'architecture_choice'));
    END IF;
END $$;

-- 3) PROMOTION EXAMS
CREATE TABLE IF NOT EXISTS public.promotion_exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tier_from TEXT NOT NULL,
    tier_to TEXT NOT NULL,
    required_level INTEGER NOT NULL CHECK (required_level > 0),
    passing_score INTEGER NOT NULL CHECK (passing_score >= 1 AND passing_score <= 100),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'promotion_exams_tier_from_check'
    ) THEN
        ALTER TABLE public.promotion_exams
            ADD CONSTRAINT promotion_exams_tier_from_check
            CHECK (tier_from IN ('JUNIOR', 'MID', 'SENIOR', 'STAFF'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'promotion_exams_tier_to_check'
    ) THEN
        ALTER TABLE public.promotion_exams
            ADD CONSTRAINT promotion_exams_tier_to_check
            CHECK (tier_to IN ('MID', 'SENIOR', 'STAFF', 'PRINCIPAL'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'promotion_exams_unique_transition'
    ) THEN
        ALTER TABLE public.promotion_exams
            ADD CONSTRAINT promotion_exams_unique_transition
            UNIQUE (tier_from, tier_to);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.promotion_exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id TEXT NOT NULL REFERENCES public.promotion_exams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    passed BOOLEAN NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS promotion_exam_attempts_user_idx
    ON public.promotion_exam_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS promotion_exam_attempts_exam_idx
    ON public.promotion_exam_attempts(exam_id, created_at DESC);

-- 4) RLS
ALTER TABLE public.promotion_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read promotion exams" ON public.promotion_exams;
DROP POLICY IF EXISTS "Admins can edit promotion exams" ON public.promotion_exams;
DROP POLICY IF EXISTS "Users can insert own promotion attempts" ON public.promotion_exam_attempts;
DROP POLICY IF EXISTS "Users can read own promotion attempts" ON public.promotion_exam_attempts;
DROP POLICY IF EXISTS "Admins can read all promotion attempts" ON public.promotion_exam_attempts;

CREATE POLICY "Public read promotion exams" ON public.promotion_exams
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit promotion exams" ON public.promotion_exams
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Users can insert own promotion attempts" ON public.promotion_exam_attempts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own promotion attempts" ON public.promotion_exam_attempts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all promotion attempts" ON public.promotion_exam_attempts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- 5) updated_at helper trigger (kept idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_promotion_exams_updated_at ON public.promotion_exams;
CREATE TRIGGER update_promotion_exams_updated_at
    BEFORE UPDATE ON public.promotion_exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6) RPC: battle outcome write with mastery increments
CREATE OR REPLACE FUNCTION public.award_battle_outcome(
    p_user_id UUID,
    p_xp_delta INTEGER DEFAULT 0,
    p_rep_delta INTEGER DEFAULT 0,
    p_mastery_delta JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
    level INTEGER,
    xp INTEGER,
    max_xp INTEGER,
    reputation INTEGER,
    tech_mastery JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_current_mastery JSONB;
    v_patch JSONB;
BEGIN
    IF auth.uid() IS DISTINCT FROM p_user_id
       AND NOT EXISTS (
           SELECT 1
           FROM public.profiles
           WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
       ) THEN
        RAISE EXCEPTION 'Not authorized to update this profile';
    END IF;

    SELECT COALESCE(tech_mastery, '{}'::jsonb)
    INTO v_current_mastery
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_current_mastery IS NULL THEN
        RAISE EXCEPTION 'Profile not found for user_id %', p_user_id;
    END IF;

    SELECT COALESCE(
        jsonb_object_agg(
            d.key,
            to_jsonb(COALESCE((v_current_mastery ->> d.key)::INTEGER, 0) + d.value::INTEGER)
        ),
        '{}'::jsonb
    )
    INTO v_patch
    FROM jsonb_each_text(COALESCE(p_mastery_delta, '{}'::jsonb)) AS d(key, value);

    RETURN QUERY
    UPDATE public.profiles
    SET
        xp = GREATEST(xp + COALESCE(p_xp_delta, 0), 0),
        reputation = GREATEST(reputation + COALESCE(p_rep_delta, 0), 0),
        tech_mastery = v_current_mastery || v_patch
    WHERE id = p_user_id
    RETURNING
        profiles.level,
        profiles.xp,
        profiles.max_xp,
        profiles.reputation,
        profiles.tech_mastery;
END;
$$;

-- 7) RPC: promotion gate check
CREATE OR REPLACE FUNCTION public.can_level_up(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_level INTEGER;
    v_tier TEXT;
    v_exam RECORD;
    v_passed BOOLEAN;
BEGIN
    IF auth.uid() IS DISTINCT FROM p_user_id
       AND NOT EXISTS (
           SELECT 1
           FROM public.profiles
           WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
       ) THEN
        RAISE EXCEPTION 'Not authorized to check this profile';
    END IF;

    SELECT level, current_tier
    INTO v_level, v_tier
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_level IS NULL THEN
        RETURN jsonb_build_object(
            'eligible', false,
            'reason', 'profile_not_found'
        );
    END IF;

    SELECT id, tier_to, required_level, passing_score
    INTO v_exam
    FROM public.promotion_exams
    WHERE tier_from = v_tier
      AND is_active = true
    ORDER BY required_level ASC
    LIMIT 1;

    IF v_exam.id IS NULL THEN
        RETURN jsonb_build_object(
            'eligible', true,
            'reason', 'no_exam_for_current_tier'
        );
    END IF;

    IF v_level < v_exam.required_level THEN
        RETURN jsonb_build_object(
            'eligible', true,
            'reason', 'level_below_gate',
            'required_level', v_exam.required_level,
            'exam_id', v_exam.id,
            'tier_to', v_exam.tier_to
        );
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM public.promotion_exam_attempts pea
        WHERE pea.user_id = p_user_id
          AND pea.exam_id = v_exam.id
          AND pea.passed = true
    )
    INTO v_passed;

    RETURN jsonb_build_object(
        'eligible', v_passed,
        'reason', CASE WHEN v_passed THEN 'exam_passed' ELSE 'exam_required' END,
        'required_level', v_exam.required_level,
        'exam_id', v_exam.id,
        'tier_to', v_exam.tier_to
    );
END;
$$;

-- 8) RPC: submit attempt (+ auto-promote on pass)
CREATE OR REPLACE FUNCTION public.submit_exam_attempt(
    p_exam_id TEXT,
    p_score INTEGER,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
    passed BOOLEAN,
    required_score INTEGER,
    promoted BOOLEAN,
    new_tier TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_user_id UUID;
    v_exam RECORD;
    v_passed BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT id, tier_from, tier_to, required_level, passing_score, is_active
    INTO v_exam
    FROM public.promotion_exams
    WHERE id = p_exam_id;

    IF v_exam.id IS NULL OR v_exam.is_active = false THEN
        RAISE EXCEPTION 'Promotion exam not found or inactive';
    END IF;

    IF p_score < 0 OR p_score > 100 THEN
        RAISE EXCEPTION 'Score must be between 0 and 100';
    END IF;

    v_passed := (p_score >= v_exam.passing_score);

    INSERT INTO public.promotion_exam_attempts (exam_id, user_id, score, passed, metadata)
    VALUES (v_exam.id, v_user_id, p_score, v_passed, COALESCE(p_metadata, '{}'::jsonb));

    IF v_passed THEN
        UPDATE public.profiles
        SET
            current_tier = v_exam.tier_to,
            reputation = reputation + 10
        WHERE id = v_user_id
          AND level >= v_exam.required_level
          AND current_tier = v_exam.tier_from;
    END IF;

    RETURN QUERY
    SELECT
        v_passed,
        v_exam.passing_score,
        (
            v_passed
            AND EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE id = v_user_id AND current_tier = v_exam.tier_to
            )
        ),
        (
            SELECT current_tier
            FROM public.profiles
            WHERE id = v_user_id
        );
END;
$$;

-- 9) Seed baseline promotion exams (idempotent)
INSERT INTO public.promotion_exams
    (id, title, tier_from, tier_to, required_level, passing_score, description, is_active)
VALUES
    ('exam_junior_to_mid', 'Promotion Exam: Junior -> Mid', 'JUNIOR', 'MID', 10, 70, 'Incident triage + code quality tradeoffs.', true),
    ('exam_mid_to_senior', 'Promotion Exam: Mid -> Senior', 'MID', 'SENIOR', 20, 75, 'System design and incident ownership scenario.', true),
    ('exam_senior_to_staff', 'Promotion Exam: Senior -> Staff', 'SENIOR', 'STAFF', 30, 80, 'Cross-team architecture and technical strategy scenario.', true),
    ('exam_staff_to_principal', 'Promotion Exam: Staff -> Principal', 'STAFF', 'PRINCIPAL', 40, 85, 'Org-wide crisis and platform strategy simulation.', true)
ON CONFLICT (id) DO UPDATE
SET
    title = EXCLUDED.title,
    tier_from = EXCLUDED.tier_from,
    tier_to = EXCLUDED.tier_to,
    required_level = EXCLUDED.required_level,
    passing_score = EXCLUDED.passing_score,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================
-- Suggested quick checks:
-- 1) SELECT id, current_tier, tech_mastery FROM public.profiles LIMIT 5;
-- 2) SELECT * FROM public.promotion_exams ORDER BY required_level;
-- 3) SELECT public.can_level_up('<user_uuid>'::uuid);
-- ==============================================================================
