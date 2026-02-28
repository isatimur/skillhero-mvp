-- ==============================================================================
-- FIX: Infinite Recursion in RLS Policies
-- ==============================================================================
-- The issue: Admin policies were querying profiles table to check role,
-- creating circular dependency. Solution: Use security definer function.
-- ==============================================================================

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 2. Create helper function that bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate policies using the function
CREATE POLICY "Admins can read all profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR public.is_admin()
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR public.is_admin()
    );

-- 4. Apply same fix to other admin policies
DROP POLICY IF EXISTS "Admins can edit cosmetics" ON public.cosmetic_items;
DROP POLICY IF EXISTS "Admins can edit races" ON public.hero_races;
DROP POLICY IF EXISTS "Admins can edit classes" ON public.hero_classes;
DROP POLICY IF EXISTS "Admins can edit quests" ON public.quests;
DROP POLICY IF EXISTS "Admins can edit books" ON public.library_books;
DROP POLICY IF EXISTS "Admins can edit questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can edit npcs" ON public.world_npcs;
DROP POLICY IF EXISTS "Admins can edit spells" ON public.spells;
DROP POLICY IF EXISTS "Admins can edit skill_nodes" ON public.skill_nodes;

-- Recreate all admin policies with the helper function
CREATE POLICY "Admins can edit cosmetics" ON public.cosmetic_items
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can edit races" ON public.hero_races
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can edit classes" ON public.hero_classes
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can edit quests" ON public.quests
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can edit books" ON public.library_books
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can edit questions" ON public.questions
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can edit npcs" ON public.world_npcs
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can edit spells" ON public.spells
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can edit skill_nodes" ON public.skill_nodes
    FOR ALL USING (public.is_admin());

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================
-- Test the function:
-- SELECT public.is_admin(); -- Should return true/false based on your role
--
-- Test profile access:
-- SELECT * FROM public.profiles; -- Should work now without recursion
-- ==============================================================================
