-- ==============================================================================
-- SkillHero Complete Database Migration (ADMIN EDITION)
-- ==============================================================================
-- This migration creates the complete database schema with admin roles
-- Run this in Supabase SQL Editor
-- ==============================================================================

-- 1. ENABLE EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE ENUMS
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

-- 3. CREATE TABLES
-- ------------------------------------------------------------------------------

-- 3.1 PROFILES (Extended with Role)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    title TEXT DEFAULT 'Novice Engineer',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    max_xp INTEGER DEFAULT 500,
    reputation INTEGER DEFAULT 0,
    hero_race TEXT DEFAULT 'HUMAN',
    hero_class hero_class_enum DEFAULT 'WARRIOR',
    gender TEXT DEFAULT 'MALE',
    stats JSONB DEFAULT '{"str": 1, "int": 1, "agi": 1, "cha": 1}'::jsonb,
    appearance JSONB DEFAULT '{"headId": "head_novice", "bodyId": "body_novice", "weaponId": "weapon_scroll"}'::jsonb,
    completed_quests TEXT[] DEFAULT '{}',
    completed_books TEXT[] DEFAULT '{}',
    unlocked_items TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}'::jsonb,
    role user_role_enum DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role user_role_enum DEFAULT 'USER';
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3.2 COSMETIC ITEMS
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

-- 3.3 HERO RACES
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

-- 3.4 HERO CLASSES
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

-- 3.5 QUESTS
CREATE TABLE IF NOT EXISTS public.quests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    level_required INTEGER NOT NULL,
    narrative_intro TEXT[] NOT NULL,
    narrative_outro TEXT NOT NULL,
    reward_xp INTEGER NOT NULL,
    reward_reputation INTEGER DEFAULT 0,
    enemy_name TEXT NOT NULL,
    enemy_image TEXT,
    enemy_max_hp INTEGER,
    enemy_attack_damage INTEGER,
    next_quest_ids TEXT[],
    is_pvp BOOLEAN DEFAULT FALSE,
    special_mechanics JSONB DEFAULT '{}'::jsonb,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.6 LIBRARY BOOKS
CREATE TABLE IF NOT EXISTS public.library_books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    content JSONB NOT NULL,
    reward_xp INTEGER NOT NULL,
    reward_item_id TEXT REFERENCES public.cosmetic_items(id),
    spell_id TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.7 QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    quest_id TEXT REFERENCES public.quests(id) ON DELETE CASCADE,
    book_id TEXT REFERENCES public.library_books(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    difficulty difficulty_enum NOT NULL,
    xp_reward INTEGER NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.8 WORLD NPCS
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

-- 3.9 SPELLS
CREATE TABLE IF NOT EXISTS public.spells (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_id TEXT NOT NULL,
    school TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.10 SKILL NODES
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

-- Drop existing policies if they exist
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
            'str', (OLD.stats->>'str')::int + 1,
            'int', (OLD.stats->>'int')::int + 1,
            'agi', (OLD.stats->>'agi')::int + 1,
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

-- 6. STORAGE BUCKETS
-- ------------------------------------------------------------------------------
-- Note: Storage buckets must be created via Supabase Dashboard or API
-- This is for reference only

-- Create buckets (run these via Supabase Dashboard -> Storage):
-- 1. quest-images (public)
-- 2. enemy-sprites (public)
-- 3. avatars (public)

-- 7. INITIAL ADMIN SETUP
-- ------------------------------------------------------------------------------

-- Grant admin role to initial admin user
-- IMPORTANT: Run this AFTER the user has signed up via the app
-- Replace 'isatimur.it@gmail.com' with the actual email if different

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
        RAISE NOTICE 'User with email isatimur.it@gmail.com not found. Please sign up first, then re-run this section.';
    END IF;
END $$;

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================
-- Next steps:
-- 1. Verify all tables created: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- 2. Check admin role: SELECT username, role FROM public.profiles WHERE role = 'ADMIN';
-- 3. Create storage buckets in Supabase Dashboard
-- 4. Run seed data scripts if needed
-- ==============================================================================
