-- ==============================================================================
-- SkillHero Database Update Migration (Add Admin Features)
-- ==============================================================================
-- This migration adds missing columns and tables to existing schema
-- Run this in Supabase SQL Editor
-- ==============================================================================

-- 1. CREATE ENUMS (if they don't exist)
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE rarity_enum AS ENUM ('common', 'rare', 'epic', 'legendary', 'artifact', 'ancient');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE hero_class_enum AS ENUM ('WARRIOR', 'MAGE', 'ROGUE', 'PALADIN', 'BARD', 'NECROMANCER', 'MONK', 'ARCHITECT', 'MANAGER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_enum AS ENUM ('Easy', 'Medium', 'Hard', 'Expert', 'Nightmare');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. UPDATE EXISTING TABLES - Add Missing Columns
-- ------------------------------------------------------------------------------

-- Add columns to PROFILES table
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS role user_role_enum DEFAULT 'USER',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Add columns to QUESTS table
ALTER TABLE public.quests
    ADD COLUMN IF NOT EXISTS next_quest_ids TEXT[],
    ADD COLUMN IF NOT EXISTS is_pvp BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS special_mechanics JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS tags TEXT[],
    ADD COLUMN IF NOT EXISTS reward_reputation INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to LIBRARY_BOOKS table
ALTER TABLE public.library_books
    ADD COLUMN IF NOT EXISTS spell_id TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to QUESTIONS table
ALTER TABLE public.questions
    ADD COLUMN IF NOT EXISTS tags TEXT[],
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. CREATE MISSING TABLES
-- ------------------------------------------------------------------------------

-- COSMETIC ITEMS
CREATE TABLE IF NOT EXISTS public.cosmetic_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    level_required INTEGER NOT NULL DEFAULT 1,
    icon_id TEXT NOT NULL,
    style_class TEXT NOT NULL,
    rarity rarity_enum DEFAULT 'common',
    description TEXT,
    attributes JSONB DEFAULT '{}'::jsonb,
    img_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HERO RACES
CREATE TABLE IF NOT EXISTS public.hero_races (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon_id TEXT NOT NULL,
    description TEXT NOT NULL,
    stats JSONB NOT NULL,
    sprite_pos TEXT,
    passive_name TEXT,
    passive_desc TEXT,
    img_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HERO CLASSES
CREATE TABLE IF NOT EXISTS public.hero_classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon_id TEXT NOT NULL,
    description TEXT NOT NULL,
    stats JSONB NOT NULL,
    body_id TEXT NOT NULL,
    weapon_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WORLD NPCS
CREATE TABLE IF NOT EXISTS public.world_npcs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sprite TEXT,
    position JSONB NOT NULL,
    dialogue_tree JSONB NOT NULL,
    starting_node_id TEXT NOT NULL,
    dynamic_start JSONB,
    reward_xp INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SPELLS
CREATE TABLE IF NOT EXISTS public.spells (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_id TEXT NOT NULL,
    school TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SKILL NODES
CREATE TABLE IF NOT EXISTS public.skill_nodes (
    id TEXT PRIMARY KEY,
    book_id TEXT REFERENCES public.library_books(id) ON DELETE CASCADE,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    parents TEXT[],
    label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_nodes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public read cosmetics" ON public.cosmetic_items;
DROP POLICY IF EXISTS "Admins can edit cosmetics" ON public.cosmetic_items;
DROP POLICY IF EXISTS "Public read races" ON public.hero_races;
DROP POLICY IF EXISTS "Admins can edit races" ON public.hero_races;
DROP POLICY IF EXISTS "Public read classes" ON public.hero_classes;
DROP POLICY IF EXISTS "Admins can edit classes" ON public.hero_classes;
DROP POLICY IF EXISTS "Public read quests" ON public.quests;
DROP POLICY IF EXISTS "Admins can edit quests" ON public.quests;
DROP POLICY IF EXISTS "Public read books" ON public.library_books;
DROP POLICY IF EXISTS "Admins can edit books" ON public.library_books;
DROP POLICY IF EXISTS "Public read questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can edit questions" ON public.questions;
DROP POLICY IF EXISTS "Public read npcs" ON public.world_npcs;
DROP POLICY IF EXISTS "Admins can edit npcs" ON public.world_npcs;
DROP POLICY IF EXISTS "Public read spells" ON public.spells;
DROP POLICY IF EXISTS "Admins can edit spells" ON public.spells;
DROP POLICY IF EXISTS "Public read skill_nodes" ON public.skill_nodes;
DROP POLICY IF EXISTS "Admins can edit skill_nodes" ON public.skill_nodes;

-- PROFILES policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

-- GAME DATA policies (Read by all, write by admins)
CREATE POLICY "Public read cosmetics" ON public.cosmetic_items
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit cosmetics" ON public.cosmetic_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

CREATE POLICY "Public read races" ON public.hero_races
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit races" ON public.hero_races
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

CREATE POLICY "Public read classes" ON public.hero_classes
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit classes" ON public.hero_classes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

CREATE POLICY "Public read quests" ON public.quests
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit quests" ON public.quests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

CREATE POLICY "Public read books" ON public.library_books
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit books" ON public.library_books
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

CREATE POLICY "Public read questions" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit questions" ON public.questions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

CREATE POLICY "Public read npcs" ON public.world_npcs
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit npcs" ON public.world_npcs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

CREATE POLICY "Public read spells" ON public.spells
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit spells" ON public.spells
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

CREATE POLICY "Public read skill_nodes" ON public.skill_nodes
    FOR SELECT USING (true);

CREATE POLICY "Admins can edit skill_nodes" ON public.skill_nodes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
    );

-- 5. TRIGGERS & FUNCTIONS
-- ------------------------------------------------------------------------------

-- Auto level-up trigger
CREATE OR REPLACE FUNCTION handle_level_up()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.xp >= OLD.max_xp THEN
        NEW.level := OLD.level + 1;
        NEW.xp := NEW.xp - OLD.max_xp;
        NEW.max_xp := FLOOR(OLD.max_xp * 1.5);
        NEW.stats := jsonb_build_object(
            'str', COALESCE((OLD.stats->>'str')::int, 1) + 1,
            'int', COALESCE((OLD.stats->>'int')::int, 1) + 1,
            'agi', COALESCE((OLD.stats->>'agi')::int, 1) + 1,
            'cha', COALESCE((OLD.stats->>'cha')::int, 1) + 1
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_level_up ON public.profiles;
CREATE TRIGGER check_level_up
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (NEW.xp >= OLD.max_xp)
    EXECUTE FUNCTION handle_level_up();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quests_updated_at ON public.quests;
CREATE TRIGGER update_quests_updated_at
    BEFORE UPDATE ON public.quests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON public.library_books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON public.library_books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON public.questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. GRANT ADMIN ROLE
-- ------------------------------------------------------------------------------

-- Grant admin role to isatimur.it@gmail.com
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Find user ID by email
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'isatimur.it@gmail.com';

    -- If user exists, grant admin role
    IF admin_user_id IS NOT NULL THEN
        UPDATE public.profiles
        SET role = 'ADMIN'
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin role granted to user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'User with email isatimur.it@gmail.com not found. Please sign up first.';
    END IF;
END $$;

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================
-- Verify:
-- 1. SELECT * FROM public.profiles WHERE role = 'ADMIN';
-- 2. SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';
-- ==============================================================================
